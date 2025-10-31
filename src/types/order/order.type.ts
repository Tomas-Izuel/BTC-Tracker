export interface CreateOrderDto {
  price: number;
  type: "buy" | "sell";
  snapshotId: number;
}

export interface BinanceOrderResponse {
  symbol: string;
  orderId: number;
  orderListId: number;
  clientOrderId: string;
  transactTime: number;
  price: string;
  origQty: string;
  executedQty: string;
  cummulativeQuoteQty: string;
  status: string;
  timeInForce: string;
  type: string;
  side: string;
  workingTime?: number;
  fills?: Array<{
    price: string;
    qty: string;
    commission: string;
    commissionAsset: string;
    tradeId: number;
  }>;
}

export interface CreateOrderWithBinanceDto extends CreateOrderDto {
  binance_order_id?: number;
  binance_client_order_id?: string;
  binance_status?: string;
  executed_qty?: number;
  cummulative_quote_qty?: number;
  binance_response?: string;
}

export interface BinanceOrderParams {
  symbol: string;
  side: "BUY" | "SELL";
  type: "MARKET" | "LIMIT";
  quantity?: string;
  quoteOrderQty?: string;
  price?: string;
  timeInForce?: "GTC" | "IOC" | "FOK";
  newOrderRespType?: "ACK" | "RESULT" | "FULL";
}

export interface BinanceOrderResponse {
  symbol: string;
  orderId: number;
  orderListId: number;
  clientOrderId: string;
  transactTime: number;
  price: string;
  origQty: string;
  executedQty: string;
  cummulativeQuoteQty: string;
  status: string;
  timeInForce: string;
  type: string;
  side: string;
  workingTime?: number;
  fills?: Array<{
    price: string;
    qty: string;
    commission: string;
    commissionAsset: string;
    tradeId: number;
  }>;
}

export interface BinanceErrorResponse {
  code: number;
  msg: string;
}
