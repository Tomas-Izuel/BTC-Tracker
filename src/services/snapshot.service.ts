import type Snapshot from "../models/snapshot.model";
import SnapshotModel from "../models/snapshot.model";
import type { SnapshotDataResponse } from "../types/snapshot/snapshot.type";

class SnapshotService {
  async createSnapshot(snapshot: SnapshotDataResponse): Promise<Snapshot> {
    try {
      // Calcular delta_48h
      const delta_48h = await this.calculateDelta48h(snapshot.usd);

      const createdSnapshot = await SnapshotModel.create({
        price: snapshot.usd,
        delta: snapshot.usd_24h_change,
        delta_48h: delta_48h,
      });

      return createdSnapshot.toJSON() as Snapshot;
    } catch (error) {
      console.error("Error creating snapshot:", error);
      throw error;
    }
  }

  private async calculateDelta48h(
    currentPrice: number
  ): Promise<number | null> {
    try {
      // Obtener el snapshot de hace aproximadamente 48 horas
      // Buscamos el snapshot más cercano a 48 horas atrás
      const twoDaysAgo = new Date();
      twoDaysAgo.setHours(twoDaysAgo.getHours() - 48);

      const oldSnapshot = await SnapshotModel.findOne({
        where: {
          created_at: {
            // @ts-ignore
            [SnapshotModel.sequelize.Sequelize.Op.lte]: twoDaysAgo,
          },
        },
        order: [["created_at", "DESC"]],
      });

      if (!oldSnapshot) {
        console.log(
          "No hay snapshots anteriores para calcular delta_48h, devolviendo null"
        );
        return null;
      }

      // Calcular el porcentaje de cambio
      const oldPrice = Number(oldSnapshot.price);
      const delta = ((currentPrice - oldPrice) / oldPrice) * 100;

      console.log(
        `Delta 48h calculado: ${delta.toFixed(
          2
        )}% (Precio actual: $${currentPrice}, Precio hace 48h: $${oldPrice})`
      );

      return parseFloat(delta.toFixed(2));
    } catch (error) {
      console.error("Error calculating delta_48h:", error);
      return null;
    }
  }

  async getSnapshots(limit: number = 10): Promise<Snapshot[]> {
    try {
      const snapshots = await SnapshotModel.findAll({
        limit,
        order: [["created_at", "DESC"]],
      });

      return snapshots.map((snapshot) => snapshot.toJSON() as Snapshot);
    } catch (error) {
      console.error("Error getting snapshots:", error);
      throw error;
    }
  }

  async getLatestSnapshot(count: number = 1): Promise<Snapshot[] | null> {
    try {
      const snapshots = await SnapshotModel.findAll({
        order: [["created_at", "DESC"]],
        limit: count,
      });

      return snapshots;
    } catch (error) {
      console.error("Error getting latest snapshots:", error);
      throw error;
    }
  }
}

export default SnapshotService;
