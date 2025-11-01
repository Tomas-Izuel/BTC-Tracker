import type Order from "../models/order.model";
import type Snapshot from "../models/snapshot.model";
import { ResendRepository } from "../repository/resend.repository";
import type {
  CreateEmailDto,
  EmailTemplateDto,
  EmailTemplateResponseDto,
} from "../types/email/email.type";
import { EMAIL_TO } from "../utils/constants";

class AlertService {
  private resendRepository: ResendRepository;

  constructor() {
    this.resendRepository = new ResendRepository();
  }

  async sendDailyReport(data: CreateEmailDto): Promise<void> {
    const template = this.generateDailyReportTemplate(data.snapshot);
    const response = await this.resendRepository.sendEmail({
      to: EMAIL_TO || "",
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    if (response.error) {
      throw new Error(
        `Error sending daily report email: ${response.error.message}`
      );
    } else {
      console.log(`Daily report email sent to ${EMAIL_TO}`);
    }
  }

  async sendOrderExecuted(data: CreateEmailDto): Promise<void> {
    if (!data.order) {
      throw new Error("Order is required");
    }
    const template = this.generateOrderExecutedTemplate(data.order);
    const response = await this.resendRepository.sendEmail({
      to: EMAIL_TO || "",
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    if (response.error) {
      throw new Error(
        `Error sending order executed email: ${response.error.message}`
      );
    } else {
      console.log(`Order executed email sent to ${EMAIL_TO}`);
    }
  }

  async sendOpportunity(data: CreateEmailDto): Promise<void> {
    const template = this.generateOpportunityTemplate(data.snapshot);
    const response = await this.resendRepository.sendEmail({
      to: EMAIL_TO || "",
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    if (response.error) {
      throw new Error(
        `Error sending opportunity email: ${response.error.message}`
      );
    } else {
      console.log(`Opportunity email sent to ${EMAIL_TO}`);
    }
  }

  private generateDailyReportTemplate(
    snapshot: Snapshot
  ): EmailTemplateResponseDto {
    return {
      subject: `🚨 Bitcoin Daily Report`,
      html: `
        <div>
          <h1>Bitcoin Daily Report</h1>
        </div>
      `,
      text: `
        Bitcoin Daily Report
        Current Price: $${snapshot.price}
        Change24h: ${snapshot.delta}%
        Timestamp: ${snapshot.created_at.toISOString()}
      `,
    };
  }

  private generatePriceAlertTemplate(
    snapshot: Snapshot
  ): EmailTemplateResponseDto {
    return {
      subject: `🚨 Bitcoin Price Alert`,
      html: `
        <div>
          <h1>Bitcoin Price Alert</h1>
        </div>
      `,
      text: `
        Bitcoin Price Alert
        Current Price: $${snapshot.price}
        Change24h: ${snapshot.delta}%
        Timestamp: ${snapshot.created_at.toISOString()}
      `,
    };
  }

  private generateOrderExecutedTemplate(
    order: Order
  ): EmailTemplateResponseDto {
    return {
      subject: `🚨 Bitcoin Order Executed`,
      html: `
        <div>
          <h1>Bitcoin Order Executed</h1>
        </div>
      `,
      text: `
        Bitcoin Order Executed
        Order Type: ${order.type}
        Price: $${order.price}
        Timestamp: ${order.created_at.toISOString()}
      `,
    };
  }

  private generateOpportunityTemplate(
    snapshot: Snapshot
  ): EmailTemplateResponseDto {
    return {
      subject: `🚨 Bitcoin Buy Opportunity`,
      html: `
        <div>
          <h1>Bitcoin Buy Opportunity</h1>
        </div>
      `,
      text: `
        Bitcoin Order Executed
        Current Price: $${snapshot.price}
        Change24h: ${snapshot.delta}%
        Timestamp: ${snapshot.created_at.toISOString()}
      `,
    };
  }
}

export default AlertService;
