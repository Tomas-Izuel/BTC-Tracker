import { Sequelize } from "sequelize-typescript";
import Snapshot from "../models/snapshot.model";
import Order from "../models/order.model";
import Config from "../models/config.model";
import {
  DATABASE_URL,
  DB_MAX_CONNECTIONS,
  DB_IDLE_TIMEOUT,
} from "../utils/constants";

export const sequelize = new Sequelize(DATABASE_URL, {
  dialect: "postgres",
  pool: {
    max: DB_MAX_CONNECTIONS,
    min: 0,
    acquire: 30000,
    idle: DB_IDLE_TIMEOUT,
  },
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
