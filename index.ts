import winston from "winston";
import { sequelize } from "./src/config/database.setup";
import DailyPriceJob from "./src/cron/dailyPriceJob";

// Configuración del logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: "btc-tracker" },
  transports: [
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

// Inicialización de la base de datos
logger.info("🔄 Iniciando sincronización de base de datos...");
await sequelize.sync({ force: false, logging: false });
logger.info("✅ Base de datos sincronizada correctamente");

// Inicialización del cron job
const dailyPriceJob = new DailyPriceJob();
const cronSchedule = "0 9 * * *"; // Todos los días a las 9:00 AM
const cronTimezone = "America/Argentina/Buenos_Aires";

logger.info("🔄 Iniciando cron job para precios diarios...");
await dailyPriceJob.start(cronSchedule, cronTimezone);
logger.info("✅ Cron job iniciado correctamente");

// Configuración del servidor
const server = Bun.serve({
  port: 3000,
  fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === "/health") {
      logger.info("Health check solicitado");
      return new Response("OK");
    }

    logger.warn(`Ruta no encontrada: ${url.pathname}`);
    return new Response("Not Found", { status: 404 });
  },
});

logger.info(`🚀 Servidor iniciado en ${server.url}`);

// Manejo de shutdown graceful
process.on("SIGINT", async () => {
  logger.info("🛑 Recibida señal SIGINT, cerrando aplicación...");
  await dailyPriceJob.stop();
  await sequelize.close();
  logger.info("✅ Aplicación cerrada correctamente");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  logger.info("🛑 Recibida señal SIGTERM, cerrando aplicación...");
  await dailyPriceJob.stop();
  await sequelize.close();
  logger.info("✅ Aplicación cerrada correctamente");
  process.exit(0);
});
