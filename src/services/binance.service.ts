import crypto from "crypto";
import type {
  BinanceOrderResponse,
  BinanceOrderParams,
  BinanceErrorResponse,
} from "../types/order/order.type";
import {
  BINANCE_API_KEY,
  BINANCE_API_SECRET,
  BINANCE_BASE_URL,
} from "../utils/constants";
import { BINANCE_TEST_MODE } from "../utils/constants";

export class BinanceService {
  private apiKey: string;
  private apiSecret: string;
  private baseUrl: string;
  private testMode: boolean;

  constructor() {
    this.apiKey = BINANCE_API_KEY;
    this.apiSecret = BINANCE_API_SECRET;
    this.baseUrl = BINANCE_BASE_URL;
    this.testMode = BINANCE_TEST_MODE;

    if (!this.apiKey || !this.apiSecret) {
      console.warn(
        "⚠️  Binance API credentials not configured. Trading will be disabled."
      );
    }
  }

  /**
   * Genera la firma HMAC SHA256 requerida por Binance
   */
  private generateSignature(queryString: string): string {
    return crypto
      .createHmac("sha256", this.apiSecret)
      .update(queryString)
      .digest("hex");
  }

  /**
   * Construye query string desde un objeto
   */
  private buildQueryString(params: Record<string, any>): string {
    return Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
      )
      .join("&");
  }

  /**
   * Ejecuta una orden en Binance
   */
  async executeOrder(
    side: "BUY" | "SELL",
    quantity?: number,
    quoteOrderQty?: number
  ): Promise<BinanceOrderResponse> {
    if (!this.apiKey || !this.apiSecret) {
      throw new Error("Binance API credentials not configured");
    }

    // Si está en modo test, simular la respuesta
    if (this.testMode) {
      console.log("🧪 TEST MODE: Simulando orden de Binance");
      return this.simulateOrder(side, quantity, quoteOrderQty);
    }

    const timestamp = Date.now();
    const symbol = process.env.BINANCE_SYMBOL || "BTCUSDT";

    const params: BinanceOrderParams & {
      timestamp: number;
      recvWindow?: number;
    } = {
      symbol,
      side,
      type: "MARKET",
      timestamp,
      newOrderRespType: "FULL",
    };

    // Usar quantity (cantidad de BTC) o quoteOrderQty (cantidad de USDT)
    if (quantity) {
      params.quantity = quantity.toFixed(8); // Binance usa hasta 8 decimales
    } else if (quoteOrderQty) {
      params.quoteOrderQty = quoteOrderQty.toFixed(2);
    } else {
      throw new Error(
        "Se debe proporcionar quantity o quoteOrderQty para la orden"
      );
    }

    // Agregar recvWindow si está configurado
    const recvWindow = process.env.BINANCE_RECV_WINDOW;
    if (recvWindow) {
      params.recvWindow = parseInt(recvWindow);
    }

    // Construir query string y firma
    const queryString = this.buildQueryString(params);
    const signature = this.generateSignature(queryString);
    const signedQueryString = `${queryString}&signature=${signature}`;

    // Realizar la petición
    const url = `${this.baseUrl}/api/v3/order?${signedQueryString}`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "X-MBX-APIKEY": this.apiKey,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      if (!response.ok) {
        const error: BinanceErrorResponse = await response.json();
        throw new Error(`Binance API Error [${error.code}]: ${error.msg}`);
      }

      const data: BinanceOrderResponse = await response.json();
      console.log("✅ Orden ejecutada en Binance:", {
        orderId: data.orderId,
        symbol: data.symbol,
        side: data.side,
        executedQty: data.executedQty,
        status: data.status,
      });

      return data;
    } catch (error) {
      console.error("❌ Error ejecutando orden en Binance:", error);
      throw error;
    }
  }

  /**
   * Simula una orden para modo test
   */
  private simulateOrder(
    side: "BUY" | "SELL",
    quantity?: number,
    quoteOrderQty?: number
  ): BinanceOrderResponse {
    const mockPrice = "50000.00";
    const mockQty = quantity
      ? quantity.toFixed(8)
      : ((quoteOrderQty || 100) / parseFloat(mockPrice)).toFixed(8);

    return {
      symbol: process.env.BINANCE_SYMBOL || "BTCUSDT",
      orderId: Math.floor(Math.random() * 1000000),
      orderListId: -1,
      clientOrderId: `test_${Date.now()}`,
      transactTime: Date.now(),
      price: "0.00000000",
      origQty: mockQty,
      executedQty: mockQty,
      cummulativeQuoteQty: quoteOrderQty
        ? quoteOrderQty.toFixed(2)
        : (parseFloat(mockQty) * parseFloat(mockPrice)).toFixed(2),
      status: "FILLED",
      timeInForce: "GTC",
      type: "MARKET",
      side,
      fills: [
        {
          price: mockPrice,
          qty: mockQty,
          commission: "0.00000000",
          commissionAsset: "BTC",
          tradeId: Math.floor(Math.random() * 1000000),
        },
      ],
    };
  }

  /**
   * Obtiene el balance de cuenta (útil para validaciones)
   */
  async getAccountBalance(): Promise<any> {
    if (!this.apiKey || !this.apiSecret) {
      throw new Error("Binance API credentials not configured");
    }

    if (this.testMode) {
      console.log("🧪 TEST MODE: Simulando balance de cuenta");
      return {
        balances: [
          { asset: "BTC", free: "0.01000000", locked: "0.00000000" },
          { asset: "USDT", free: "10000.00000000", locked: "0.00000000" },
        ],
      };
    }

    const timestamp = Date.now();
    const queryString = this.buildQueryString({ timestamp });
    const signature = this.generateSignature(queryString);
    const url = `${this.baseUrl}/api/v3/account?${queryString}&signature=${signature}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "X-MBX-APIKEY": this.apiKey,
        },
      });

      if (!response.ok) {
        const error: BinanceErrorResponse = await response.json();
        throw new Error(`Binance API Error [${error.code}]: ${error.msg}`);
      }

      return await response.json();
    } catch (error) {
      console.error("❌ Error obteniendo balance de Binance:", error);
      throw error;
    }
  }

  /**
   * Verifica si el servicio está configurado correctamente
   */
  isConfigured(): boolean {
    return !!(this.apiKey && this.apiSecret);
  }

  /**
   * Verifica si está en modo test
   */
  isTestMode(): boolean {
    return this.testMode;
  }
}

export default BinanceService;
