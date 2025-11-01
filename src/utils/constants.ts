// Database
export const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://btc_user:btc_password@localhost:5432/btc_db";
export const DB_MAX_CONNECTIONS = parseInt(
  process.env.DB_MAX_CONNECTIONS || "10"
);
export const DB_IDLE_TIMEOUT = parseInt(process.env.DB_IDLE_TIMEOUT || "30000");

// API Configuration
export const CONSULT_API_URL =
  process.env.CONSULT_API_URL || "https://api.coingecko.com/api/v3";
export const CONSULT_API_KEY = process.env.CONSULT_API_KEY || "";

// Email Configuration (Resend)
export const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
export const EMAIL_FROM = process.env.EMAIL_FROM || "onboarding@resend.dev";
export const EMAIL_TO = process.env.EMAIL_TO;
export const EMAIL_ENABLED = process.env.EMAIL_ENABLED !== "false"; // Por defecto habilitado

// Server Configuration
export const SERVER_PORT = parseInt(process.env.SERVER_PORT || "8080");

// Cron Configuration
export const CRON_SCHEDULE = process.env.CRON_SCHEDULE || "0 0 * * *";
export const CRON_TIMEZONE = process.env.CRON_TIMEZONE || "UTC";

// Binance Configuration
export const BINANCE_API_KEY = process.env.BINANCE_API_KEY || "";
export const BINANCE_API_SECRET = process.env.BINANCE_API_SECRET || "";
export const BINANCE_BASE_URL =
  process.env.BINANCE_BASE_URL || "https://api.binance.com";
export const BINANCE_SYMBOL = process.env.BINANCE_SYMBOL || "BTCUSDT";
export const BINANCE_TEST_MODE = process.env.BINANCE_TEST_MODE === "true";
export const BINANCE_RECV_WINDOW = process.env.BINANCE_RECV_WINDOW || "5000";
export const BINANCE_ORDER_QUANTITY = process.env.BINANCE_ORDER_QUANTITY; // Cantidad de BTC por orden (opcional)
export const BINANCE_ORDER_QUOTE_QTY = process.env.BINANCE_ORDER_QUOTE_QTY; // Cantidad de USDT por orden (opcional)
