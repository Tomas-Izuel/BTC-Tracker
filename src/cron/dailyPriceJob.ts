import * as cron from "node-cron";
import ConsultService from "../services/consult.service";

class DailyPriceJob {
  private consultService: ConsultService;
  private cronJob: cron.ScheduledTask | null = null;

  constructor() {
    this.consultService = new ConsultService();
  }

  async start(cronSchedule: string, cronTimezone: string) {
    this.cronJob = cron.schedule(
      cronSchedule,
      async () => {
        await this.executeDailySnapshot();
      },
      {
        timezone: cronTimezone,
      }
    );

    await this.executeDailySnapshot();

    this.cronJob.start();

    console.log(
      `✅ Cronjob started with schedule: ${cronSchedule} (${cronTimezone})`
    );
  }

  async stop() {
    if (this.cronJob) {
      this.cronJob.stop();
      console.log("Cronjob stopped");
    }
  }

  private async executeDailySnapshot() {
    try {
      console.log("Executing daily snapshot...");

      const snapshotData = await this.consultService.getDailyPrice();

      console.log("Snapshot saved successfully:", {
        precio: `$${snapshotData.price}`,
        cambio24h: `${snapshotData.delta}%`,
        timestamp: new Date(snapshotData.created_at).toISOString(),
      });
    } catch (error) {
      console.error("Error executing daily snapshot:", error);
    }
  }

  async executeNow() {
    await this.executeDailySnapshot();
  }
}

export default DailyPriceJob;
