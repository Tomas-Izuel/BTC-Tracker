import type Order from "../models/order.model";
import OrderModel from "../models/order.model";
import type Snapshot from "../models/snapshot.model";
import type Config from "../models/config.model";
import type {
  CreateOrderDto,
  BinanceOrderResponse,
} from "../types/order/order.type";
import ConfigModel from "../models/config.model";
import AlertService from "./alert.service";
import { BinanceRepository } from "../repository/binance.repository";
import { AlertType, type CreateEmailDto } from "../types/email/email.type";

export class OrderService {
  private alertService: AlertService;
  private binanceRepository: BinanceRepository;

  constructor() {
    this.alertService = new AlertService();
    this.binanceRepository = new BinanceRepository();
  }

  async executeOrderIfNeeded(snapshot: Snapshot): Promise<boolean> {
    try {
      const config = await ConfigModel.findOne({
        where: {
          id: 1,
        },
      });

      if (!config || !config.delta_buy || !config.delta_sell) {
        throw new Error("Config not found");
      }

      console.log(snapshot);

      // Comprar cuando el delta de 24h O 48h sea menor o igual al delta_buy (precio bajó lo suficiente)
      // Ejemplo: delta_24h = -5% o menos (como -6%, -7%) O delta_48h = -5% o menos
      const shouldBuy =
        snapshot.delta <= config.delta_buy ||
        (snapshot.delta_48h !== null &&
          snapshot.delta_48h !== undefined &&
          snapshot.delta_48h <= config.delta_buy);

      if (shouldBuy) {
        const reason =
          snapshot.delta <= config.delta_buy
            ? `delta 24h: ${snapshot.delta}%`
            : `delta 48h: ${snapshot.delta_48h}%`;
        console.log(`Order buy verified (${reason})`);
        await this.createOrder(
          {
            price: snapshot.price,
            type: "buy",
            snapshotId: snapshot.id,
            snapshot: snapshot,
          },
          config
        );
        return true;
      }

      // Vender cuando el delta de 24h O 48h sea mayor o igual al delta_sell (precio subió lo suficiente)
      // Ejemplo: delta_24h = 20% o más (como 21%, 22%) O delta_48h = 20% o más
      const shouldSell =
        snapshot.delta >= config.delta_sell ||
        (snapshot.delta_48h !== null &&
          snapshot.delta_48h !== undefined &&
          snapshot.delta_48h >= config.delta_sell);

      if (shouldSell) {
        const reason =
          snapshot.delta >= config.delta_sell
            ? `delta 24h: ${snapshot.delta}%`
            : `delta 48h: ${snapshot.delta_48h}%`;
        console.log(`Order sell verified (${reason})`);
        await this.createOrder(
          {
            price: snapshot.price,
            type: "sell",
            snapshotId: snapshot.id,
            snapshot: snapshot,
          },
          config
        );
        return true;
      }

      // Oportunidad de venta: cuando el delta es positivo y está entre el 60-99% del umbral de venta
      // Ejemplo: si delta_buy = -5, alertar cuando delta esté entre -3 y -4.99
      const opportunityThreshold = config.delta_sell * 0.6; // 60% del umbral
      if (
        snapshot.delta > 0 &&
        snapshot.delta >= opportunityThreshold &&
        snapshot.delta <= config.delta_sell
      ) {
        console.log("Buy opportunity detected");
        await this.alertService.sendOpportunity({
          snapshot: snapshot,
          alertType: AlertType.BUY_OPPORTUNITY,
        });
        return false;
      }

      return false;
    } catch (error) {
      console.error("Error executing order if needed:", error);
      throw error;
    }
  }
  private async createOrder(
    order: CreateOrderDto,
    config: Config
  ): Promise<Order> {
    let binanceError: any = null;

    try {
      let binanceResponse: BinanceOrderResponse | null = null;
      const orderData: any = {
        price: order.price,
        type: order.type,
        snapshotId: order.snapshotId,
      };

      // Intentar ejecutar la orden en Binance si está configurado
      if (this.binanceRepository.isConfigured()) {
        try {
          console.log(
            `🔄 Ejecutando orden de ${order.type.toUpperCase()} en Binance...`
          );

          const side = order.type === "buy" ? "BUY" : "SELL";

          // Obtener cantidad de la configuración (amount_buy o amount_sell en USDT)
          const quoteOrderQty =
            order.type === "buy" ? config.amount_buy : config.amount_sell;

          console.log(
            `💰 Monto a operar: ${quoteOrderQty} USDT (desde config)`
          );

          // Ejecutar orden en Binance usando el monto en USDT
          binanceResponse = await this.binanceRepository.executeOrder(
            side,
            undefined, // No especificamos cantidad de BTC
            quoteOrderQty // Usamos el monto en USDT del config
          );

          // Agregar información de Binance a la orden
          orderData.binance_order_id = binanceResponse.orderId;
          orderData.binance_client_order_id = binanceResponse.clientOrderId;
          orderData.binance_status = binanceResponse.status;
          orderData.executed_qty = parseFloat(binanceResponse.executedQty);
          orderData.cummulative_quote_qty = parseFloat(
            binanceResponse.cummulativeQuoteQty
          );
          orderData.binance_response = JSON.stringify(binanceResponse);

          console.log(`✅ Orden ejecutada exitosamente en Binance:`);
          console.log(`   Order ID: ${binanceResponse.orderId}`);
          console.log(`   Status: ${binanceResponse.status}`);
          console.log(`   Executed Qty: ${binanceResponse.executedQty}`);
          console.log(`   Total: ${binanceResponse.cummulativeQuoteQty} USDT`);
        } catch (error) {
          binanceError = error;
          console.error("❌ Error ejecutando orden en Binance:", error);

          // Enviar email de error
          try {
            await this.alertService.sendOrderError({
              snapshot: order.snapshot,
              alertType: AlertType.ORDER_EXECUTION_ERROR,
              error: {
                message: `Error al ejecutar orden de ${
                  order.type === "buy" ? "COMPRA" : "VENTA"
                } en Binance`,
                details: error instanceof Error ? error.message : String(error),
                orderType: order.type,
              },
            });
          } catch (emailError) {
            console.error(
              "Error enviando email de notificación de error:",
              emailError
            );
          }

          // Re-lanzar el error para que no se guarde en DB
          throw error;
        }
      } else {
        console.warn(
          "⚠️  Binance no está configurado. Orden guardada solo en DB."
        );
      }

      // Crear orden en la base de datos
      const createdOrder = await OrderModel.create(orderData);

      // Enviar email según el tipo de orden
      const createEmailDto: CreateEmailDto = {
        snapshot: order.snapshot,
        order: createdOrder.toJSON() as Order,
        alertType:
          order.type === "buy"
            ? AlertType.BUY_ORDER_EXECUTED
            : AlertType.SELL_ORDER_EXECUTED,
      };
      await this.alertService.sendOrderExecuted(createEmailDto);
      return createdOrder.toJSON() as Order;
    } catch (error) {
      console.error("❌ Error creating order:", error);

      // Si no se envió email de error antes (por ejemplo, error en DB), enviarlo ahora
      if (!binanceError) {
        try {
          await this.alertService.sendOrderError({
            snapshot: order.snapshot,
            alertType: AlertType.ORDER_EXECUTION_ERROR,
            error: {
              message: `Error al crear orden de ${
                order.type === "buy" ? "COMPRA" : "VENTA"
              }`,
              details: error instanceof Error ? error.message : String(error),
              orderType: order.type,
            },
          });
        } catch (emailError) {
          console.error(
            "Error enviando email de notificación de error:",
            emailError
          );
        }
      }

      throw error;
    }
  }
}
