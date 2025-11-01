import type Snapshot from "../models/snapshot.model";
import type { SnapshotResponse } from "../types/snapshot/snapshot.type";
import { CONSULT_API_URL, CONSULT_API_KEY } from "../utils/constants";
import AlertService from "./alert.service";
import SnapshotService from "./snapshot.service";
import ConfigModel from "../models/config.model";
import { OrderService } from "./order.service";
import { AlertType } from "../types/email/email.type";

class ConsultService {
  private snapshotService: SnapshotService;
  private alertService: AlertService;
  private orderService: OrderService;
  constructor() {
    this.snapshotService = new SnapshotService();
    this.alertService = new AlertService();
    this.orderService = new OrderService();
  }
  async getDailyPrice(): Promise<Snapshot> {
    try {
      const response = await fetch(
        `${CONSULT_API_URL}/simple/price?ids=bitcoin&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true`,
        {
          method: "GET",
          headers: {
            "x-cg-demo-api-key": CONSULT_API_KEY,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Error en la API: ${response.status} ${response.statusText}`
        );
      }

      const bitcoinData = (await response.json()) as SnapshotResponse;

      const snapshot = await this.snapshotService.createSnapshot(
        bitcoinData.bitcoin
      );

      try {
        await this.alertService.sendDailyReport({
          snapshot: snapshot,
          alertType: AlertType.DAILY_REPORT,
        });
      } catch (emailError) {
        console.error("Error sending daily report email:", emailError);
        // No lanzar el error para permitir que continúe el proceso
      }

      const orderNeeded = await this.orderService.executeOrderIfNeeded(
        snapshot
      );

      if (orderNeeded) {
        try {
          await this.alertService.sendOpportunity({
            snapshot: snapshot,
            alertType: AlertType.BUY_OPPORTUNITY,
          });
        } catch (emailError) {
          console.error("Error sending price alert email:", emailError);
          // No lanzar el error para permitir que continúe el proceso
        }
      }

      return snapshot;
    } catch (error) {
      console.error("Error al obtener snapshot:", error);
      throw error;
    }
  }
}

export default ConsultService;
