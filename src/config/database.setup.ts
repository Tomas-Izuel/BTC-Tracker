import { Sequelize } from "sequelize-typescript";
import Snapshot from "../models/snapshot.model";
import Order from "../models/order.model";
import Config from "../models/config.model";
import {
  DB_HOST,
  DB_NAME,
  DB_PASSWORD,
  DB_PORT,
  DB_USER,
} from "../utils/constants";

export const sequelize = new Sequelize({
  dialect: "postgres",
  username: DB_USER || "btc_user",
  password: DB_PASSWORD || "btc_password",
  database: DB_NAME || "btc_db",
  host: DB_HOST || "localhost",
  port: Number(DB_PORT || 5432),
  ssl: false,
  sync: {
    alter: true,
    force: false, // Evita recrear tablas existentes
  },
  logging: false,
  models: [Snapshot, Order, Config],
  define: {
    timestamps: true,
    underscored: true,
    paranoid: false, // Desactiva soft deletes por ahora
  },
});

console.log("Initialized db models");

export type db = typeof sequelize;
