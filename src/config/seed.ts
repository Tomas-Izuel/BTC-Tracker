import { sequelize } from "./database.setup";
import Snapshot from "../models/snapshot.model";
import Order from "../models/order.model";
import Config from "../models/config.model";

async function seed() {
  try {
    console.log("🌱 Iniciando seed de la base de datos...");

    // Sincronizar modelos con la base de datos
    await sequelize.sync({ alter: true });
    console.log("✅ Base de datos sincronizada");

    // Limpiar datos existentes (opcional - comentar si no se desea)
    await Order.destroy({ where: {}, truncate: true, cascade: true });
    await Snapshot.destroy({ where: {}, truncate: true, cascade: true });
    await Config.destroy({ where: {}, truncate: true, cascade: true });
    console.log("🗑️  Datos existentes eliminados");

    // 1. Crear configuración
    console.log("\n📝 Creando configuración...");
    const config = await Config.create({
      delta_buy: -2.5, // Comprar cuando baje 2.5%
      delta_sell: 3.0, // Vender cuando suba 3%
      amount_buy: 100, // Monto a comprar
      amount_sell: 100, // Monto a vender
    });
    console.log(`✅ Configuración creada: ID ${config.id}`);

    // 2. Crear snapshots con precios realistas de BTC
    console.log("\n📸 Creando snapshots...");
    const snapshots = await Snapshot.bulkCreate([
      {
        price: 67500.0,
        delta: 0.0,
        created_at: new Date("2025-10-25T10:00:00"),
      },
      {
        price: 66200.0,
        delta: -1.93,
        created_at: new Date("2025-10-26T10:00:00"),
      },
      {
        price: 65800.0,
        delta: -2.52,
        created_at: new Date("2025-10-26T15:30:00"),
      },
      {
        price: 68400.0,
        delta: 1.33,
        created_at: new Date("2025-10-27T09:00:00"),
      },
      {
        price: 70100.0,
        delta: 3.85,
        created_at: new Date("2025-10-27T18:00:00"),
      },
      {
        price: 69500.0,
        delta: 2.96,
        created_at: new Date("2025-10-28T08:00:00"),
      },
    ]);
    console.log(`✅ ${snapshots.length} snapshots creados`);

    // 3. Crear órdenes basadas en los snapshots
    console.log("\n💰 Creando órdenes...");
    const orders = await Order.bulkCreate([
      {
        price: 65800.0,
        type: "buy",
        snapshot_id: snapshots[2].id, // Snapshot con delta -2.52%
        created_at: new Date("2025-10-26T15:35:00"),
      },
      {
        price: 70100.0,
        type: "sell",
        snapshot_id: snapshots[4].id, // Snapshot con delta 3.85%
        created_at: new Date("2025-10-27T18:05:00"),
      },
      {
        price: 66200.0,
        type: "buy",
        snapshot_id: snapshots[1].id, // Snapshot con delta -1.93%
        created_at: new Date("2025-10-26T10:10:00"),
      },
      {
        price: 69500.0,
        type: "sell",
        snapshot_id: snapshots[5].id, // Snapshot con delta 2.96%
        created_at: new Date("2025-10-28T08:05:00"),
      },
    ]);
    console.log(`✅ ${orders.length} órdenes creadas`);

    // Mostrar resumen
    console.log("\n" + "=".repeat(50));
    console.log("📊 RESUMEN DEL SEED");
    console.log("=".repeat(50));
    console.log(`✅ Configuraciones: ${await Config.count()}`);
    console.log(`✅ Snapshots: ${await Snapshot.count()}`);
    console.log(`✅ Órdenes: ${await Order.count()}`);
    console.log("=".repeat(50));
    console.log("\n🎉 Seed completado exitosamente!");
  } catch (error) {
    console.error("❌ Error al ejecutar seed:", error);
    throw error;
  } finally {
    await sequelize.close();
    console.log("\n👋 Conexión cerrada");
    process.exit(0);
  }
}

// Ejecutar seed
seed();
