export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export interface EmailMessage {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
}

export interface EmailTemplate {
  subject: string;
  text: string;
  html: string;
}

export interface AlertEmailData {
  price: number;
  change24h: number;
  timestamp: string;
  alertType: "price_high" | "price_low" | "volume_spike" | "daily_report";
}

export interface OrderEmailData {
  price: number;
  timestamp: string;
  orderType: "buy" | "sell";
  snapshotId: number;
}

export interface OpportunityEmailData {
  price: number;
  delta: number;
  timestamp: string;
}
