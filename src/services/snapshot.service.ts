import type Snapshot from "../models/snapshot.model";
import SnapshotModel from "../models/snapshot.model";
import type { SnapshotDataResponse } from "../types/snapshot/snapshot.type";

class SnapshotService {
  async createSnapshot(snapshot: SnapshotDataResponse): Promise<Snapshot> {
    try {
      const createdSnapshot = await SnapshotModel.create({
        price: snapshot.usd,
        delta: snapshot.usd_24h_change,
      });

      return createdSnapshot.toJSON() as Snapshot;
    } catch (error) {
      console.error("Error creating snapshot:", error);
      throw error;
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
