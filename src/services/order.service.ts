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
import BinanceService from "./binance.service";
import type { OrderEmailData } from "../types/email/email.type";

export class OrderService {
  private alertService: AlertService;
  private binanceService: BinanceService;

  constructor() {
    this.alertService = new AlertService();
    this.binanceService = new BinanceService();
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

      // Comprar cuando el delta sea menor o igual al delta_buy (precio bajó lo suficiente)
      // Ejemplo: delta = -5% o menos (como -6%, -7%)
      if (snapshot.delta <= config.delta_buy) {
        console.log("Order buy verified");
        await this.createOrder(
          {
            price: snapshot.price,
            type: "buy",
            snapshotId: snapshot.id,
          },
          config
        );
        return true;
      }

      // Vender cuando el delta sea mayor o igual al delta_sell (precio subió lo suficiente)
      // Ejemplo: delta = 20% o más (como 21%, 22%)
      if (snapshot.delta >= config.delta_sell) {
        console.log("Order sell verified");
        await this.createOrder(
          {
            price: snapshot.price,
            type: "sell",
            snapshotId: snapshot.id,
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
        await this.alertService.sendBuyOpportunity({
          price: snapshot.price,
          delta: snapshot.delta,
          timestamp: snapshot.created_at.toISOString(),
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
    try {
      let binanceResponse: BinanceOrderResponse | null = null;
      const orderData: any = {
        price: order.price,
        type: order.type,
        snapshotId: order.snapshotId,
      };

      // Intentar ejecutar la orden en Binance si está configurado
      if (this.binanceService.isConfigured()) {
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
          binanceResponse = await this.binanceService.executeOrder(
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
        } catch (binanceError) {
          console.error("❌ Error ejecutando orden en Binance:", binanceError);
          // Continuar y guardar la orden en DB aunque Binance falle
          // El error se incluirá en los logs
        }
      } else {
        console.warn(
          "⚠️  Binance no está configurado. Orden guardada solo en DB."
        );
      }

      // Crear orden en la base de datos
      const createdOrder = await OrderModel.create(orderData);

      // Enviar email según el tipo de orden
      const orderEmailData: OrderEmailData = {
        price: order.price,
        timestamp: new Date().toISOString(),
        orderType: order.type,
        snapshotId: order.snapshotId,
      };

      if (order.type === "buy") {
        await this.alertService.sendBuyOrderExecuted(orderEmailData);
        console.log("✉️  Email de orden de compra enviado");
      } else if (order.type === "sell") {
        await this.alertService.sendSellOrderExecuted(orderEmailData);
        console.log("✉️  Email de orden de venta enviado");
      }

      return createdOrder.toJSON() as Order;
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  }
}
