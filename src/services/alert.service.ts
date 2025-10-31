import nodemailer from "nodemailer";
import type {
  EmailMessage,
  AlertEmailData,
  OrderEmailData,
  OpportunityEmailData,
} from "../types/email/email.type";
import {
  SMTP_USER,
  SMTP_PASS,
  EMAIL_FROM,
  EMAIL_TO,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_SECURE,
} from "../utils/constants";

class AlertService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = this.createTransporter();
  }

  private createTransporter(): nodemailer.Transporter {
    return nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
  }

  async sendEmail(message: EmailMessage): Promise<void> {
    // Verificar si las credenciales están configuradas
    if (!SMTP_USER || !SMTP_PASS || !EMAIL_FROM || !EMAIL_TO) {
      throw new Error(
        "SMTP credentials not configured. Please set SMTP_USER, SMTP_PASS, EMAIL_FROM, and EMAIL_TO environment variables."
      );
    }

    try {
      const mailOptions = {
        from: message.from || EMAIL_FROM,
        to: Array.isArray(message.to) ? message.to.join(", ") : message.to,
        subject: message.subject,
        text: message.text,
        html: message.html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log("Email sent successfully:", info.messageId);
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  }

  async sendPriceAlert(data: AlertEmailData): Promise<void> {
    const template = this.generatePriceAlertTemplate(data);

    const message: EmailMessage = {
      to: EMAIL_TO || "",
      subject: template.subject,
      text: template.text,
      html: template.html,
    };

    await this.sendEmail(message);
  }

  async sendDailyReport(data: AlertEmailData): Promise<void> {
    const template = this.generateDailyReportTemplate(data);

    const message: EmailMessage = {
      to: EMAIL_TO || "",
      subject: template.subject,
      text: template.text,
      html: template.html,
    };

    await this.sendEmail(message);
  }

  async sendBuyOrderExecuted(data: OrderEmailData): Promise<void> {
    const template = this.generateBuyOrderTemplate(data);

    const message: EmailMessage = {
      to: EMAIL_TO || "",
      subject: template.subject,
      text: template.text,
      html: template.html,
    };

    await this.sendEmail(message);
  }

  async sendSellOrderExecuted(data: OrderEmailData): Promise<void> {
    const template = this.generateSellOrderTemplate(data);

    const message: EmailMessage = {
      to: EMAIL_TO || "",
      subject: template.subject,
      text: template.text,
      html: template.html,
    };

    await this.sendEmail(message);
  }

  async sendBuyOpportunity(data: OpportunityEmailData): Promise<void> {
    const template = this.generateBuyOpportunityTemplate(data);

    const message: EmailMessage = {
      to: EMAIL_TO || "",
      subject: template.subject,
      text: template.text,
      html: template.html,
    };

    await this.sendEmail(message);
  }

  private generatePriceAlertTemplate(data: AlertEmailData) {
    const changeIcon = data.change24h >= 0 ? "📈" : "📉";
    const changeColor = data.change24h >= 0 ? "#00ff00" : "#ff0000";

    return {
      subject: `🚨 Bitcoin Alert - $${data.price}`,
      text: `
Bitcoin Price Alert

Current Price: $${data.price}
24h Change: ${data.change24h}%
Timestamp: ${data.timestamp}

Alert Type: ${data.alertType}
      `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f7931a;">🚨 Bitcoin Price Alert</h2>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">Current Price: $${
              data.price
            }</h3>
            <p style="font-size: 18px; margin: 10px 0;">
              <span style="color: ${changeColor}; font-weight: bold;">
                ${changeIcon} ${data.change24h}%
              </span>
              <span style="color: #666; margin-left: 10px;">24h change</span>
            </p>
          </div>
          <div style="background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107;">
            <strong>Alert Type:</strong> ${data.alertType
              .replace("_", " ")
              .toUpperCase()}<br>
            <strong>Timestamp:</strong> ${data.timestamp}
          </div>
        </div>
      `,
    };
  }

  private generateDailyReportTemplate(data: AlertEmailData) {
    const changeIcon = data.change24h >= 0 ? "📈" : "📉";
    const changeColor = data.change24h >= 0 ? "#00ff00" : "#ff0000";

    return {
      subject: `📊 Bitcoin Daily Report - ${new Date().toLocaleDateString()}`,
      text: `
Bitcoin Daily Report - ${new Date().toLocaleDateString()}

Current Price: $${data.price}
24h Change: ${data.change24h}%
Report Time: ${data.timestamp}

This is your daily Bitcoin market summary.
      `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f7931a;">📊 Bitcoin Daily Report</h2>
          <p style="color: #666; font-size: 14px;">${new Date().toLocaleDateString()}</p>
          
          <div style="background: linear-gradient(135deg, #f7931a, #ff6b35); color: white; padding: 25px; border-radius: 10px; margin: 20px 0; text-align: center;">
            <h1 style="margin: 0; font-size: 36px;">$${data.price}</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px;">
              <span style="background: rgba(255,255,255,0.2); padding: 5px 10px; border-radius: 15px;">
                ${changeIcon} ${data.change24h}%
              </span>
            </p>
          </div>
          <div style="background: #e7f3ff; padding: 15px; border-radius: 8px; border-left: 4px solid #007bff;">
            <p style="margin: 0; color: #333;">
              <strong>Report generated:</strong> ${data.timestamp}<br>
              This is your daily Bitcoin market summary.
            </p>
          </div>
        </div>
      `,
    };
  }

  private generateBuyOrderTemplate(data: OrderEmailData) {
    return {
      subject: `✅ Orden de Compra Ejecutada - $${data.price.toLocaleString()}`,
      text: `
¡Orden de Compra Ejecutada!

Precio de compra: $${data.price.toLocaleString()}
Timestamp: ${data.timestamp}
Snapshot ID: ${data.snapshotId}

Tu orden de compra ha sido ejecutada exitosamente.
      `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #28a745;">✅ Orden de Compra Ejecutada</h2>
          
          <div style="background: linear-gradient(135deg, #28a745, #20c997); color: white; padding: 25px; border-radius: 10px; margin: 20px 0; text-align: center;">
            <h1 style="margin: 0; font-size: 36px;">$${data.price.toLocaleString()}</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px;">
              <span style="background: rgba(255,255,255,0.2); padding: 5px 15px; border-radius: 15px;">
                🛒 COMPRA
              </span>
            </p>
          </div>
          
          <div style="background: #d4edda; padding: 15px; border-radius: 8px; border-left: 4px solid #28a745; margin: 20px 0;">
            <p style="margin: 0; color: #155724;">
              <strong>Estado:</strong> Ejecutada exitosamente<br>
              <strong>Timestamp:</strong> ${data.timestamp}<br>
              <strong>Snapshot ID:</strong> ${data.snapshotId}
            </p>
          </div>
          
          <p style="color: #666; font-size: 14px; text-align: center;">
            Tu orden de compra ha sido procesada y ejecutada.
          </p>
        </div>
      `,
    };
  }

  private generateSellOrderTemplate(data: OrderEmailData) {
    return {
      subject: `💰 Orden de Venta Ejecutada - $${data.price.toLocaleString()}`,
      text: `
¡Orden de Venta Ejecutada!

Precio de venta: $${data.price.toLocaleString()}
Timestamp: ${data.timestamp}
Snapshot ID: ${data.snapshotId}

Tu orden de venta ha sido ejecutada exitosamente.
      `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc3545;">💰 Orden de Venta Ejecutada</h2>
          
          <div style="background: linear-gradient(135deg, #dc3545, #fd7e14); color: white; padding: 25px; border-radius: 10px; margin: 20px 0; text-align: center;">
            <h1 style="margin: 0; font-size: 36px;">$${data.price.toLocaleString()}</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px;">
              <span style="background: rgba(255,255,255,0.2); padding: 5px 15px; border-radius: 15px;">
                💸 VENTA
              </span>
            </p>
          </div>
          
          <div style="background: #f8d7da; padding: 15px; border-radius: 8px; border-left: 4px solid #dc3545; margin: 20px 0;">
            <p style="margin: 0; color: #721c24;">
              <strong>Estado:</strong> Ejecutada exitosamente<br>
              <strong>Timestamp:</strong> ${data.timestamp}<br>
              <strong>Snapshot ID:</strong> ${data.snapshotId}
            </p>
          </div>
          
          <p style="color: #666; font-size: 14px; text-align: center;">
            Tu orden de venta ha sido procesada y ejecutada.
          </p>
        </div>
      `,
    };
  }

  private generateBuyOpportunityTemplate(data: OpportunityEmailData) {
    return {
      subject: `🔔 Posible Oportunidad de Compra - $${data.price.toLocaleString()}`,
      text: `
¡Posible Oportunidad de Compra!

Precio actual: $${data.price.toLocaleString()}
Delta: ${data.delta.toFixed(2)}%
Timestamp: ${data.timestamp}

El precio ha alcanzado un nivel que podría representar una oportunidad de compra.
      `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ffc107;">🔔 Posible Oportunidad de Compra</h2>
          
          <div style="background: linear-gradient(135deg, #ffc107, #ff9800); color: white; padding: 25px; border-radius: 10px; margin: 20px 0; text-align: center;">
            <h1 style="margin: 0; font-size: 36px;">$${data.price.toLocaleString()}</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px;">
              <span style="background: rgba(255,255,255,0.2); padding: 5px 15px; border-radius: 15px;">
                📊 Delta: ${data.delta.toFixed(2)}%
              </span>
            </p>
          </div>
          
          <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
            <p style="margin: 0; color: #856404;">
              <strong>Alerta:</strong> Oportunidad detectada<br>
              <strong>Timestamp:</strong> ${data.timestamp}<br>
              <strong>Precio actual:</strong> $${data.price.toLocaleString()}<br>
              <strong>Cambio (delta):</strong> ${data.delta.toFixed(2)}%
            </p>
          </div>
          
          <p style="color: #666; font-size: 14px; text-align: center;">
            El precio ha alcanzado un nivel que podría representar una buena oportunidad de compra.<br>
            Revisa las condiciones del mercado antes de tomar una decisión.
          </p>
        </div>
      `,
    };
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log("✅ SMTP connection verified successfully");
      return true;
    } catch (error) {
      console.error("❌ SMTP connection failed:", error);
      return false;
    }
  }
}

export default AlertService;
