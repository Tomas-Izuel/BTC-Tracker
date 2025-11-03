import type Order from "../../models/order.model";
import type Snapshot from "../../models/snapshot.model";

export enum AlertType {
  DAILY_REPORT = "daily_report",
  BUY_ORDER_EXECUTED = "buy_order_executed",
  SELL_ORDER_EXECUTED = "sell_order_executed",
  BUY_OPPORTUNITY = "buy_opportunity",
  ORDER_EXECUTION_ERROR = "order_execution_error",
}

export interface EmailDto {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export interface EmailTemplateDto {
  snapshot: Snapshot;
}

export interface EmailOrderTemplateDto extends EmailTemplateDto {
  order: Order;
}
export interface EmailTemplateResponseDto {
  subject: string;
  html: string;
  text: string;
}

export interface CreateEmailDto {
  snapshot: Snapshot;
  order?: Order;
  alertType: AlertType;
  error?: {
    message: string;
    details?: string;
    orderType?: "buy" | "sell";
  };
}
