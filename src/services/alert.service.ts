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
    const deltaColor = Number(snapshot.delta) >= 0 ? "#10b981" : "#ef4444";
    const deltaSign = Number(snapshot.delta) >= 0 ? "+" : "";
    const formattedPrice = Number(snapshot.price).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    const formattedDate = new Date(snapshot.created_at).toLocaleString(
      "es-ES",
      {
        dateStyle: "full",
        timeStyle: "short",
      }
    );

    return {
      subject: `📊 Reporte Diario de Bitcoin - $${formattedPrice}`,
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reporte Diario de Bitcoin</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f3f4f6; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">
                        📊 Reporte Diario
                      </h1>
                      <p style="margin: 10px 0 0 0; color: #e0e7ff; font-size: 16px;">
                        Bitcoin Market Update
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Main Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <!-- Price Section -->
                      <table cellpadding="0" cellspacing="0" border="0" width="100%">
                        <tr>
                          <td style="text-align: center; padding-bottom: 30px;">
                            <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                              Precio Actual
                            </p>
                            <p style="margin: 0; color: #1f2937; font-size: 48px; font-weight: 700; line-height: 1;">
                              $${formattedPrice}
                            </p>
                            <p style="margin: 15px 0 0 0; color: ${deltaColor}; font-size: 24px; font-weight: 600;">
                              ${deltaSign}${snapshot.delta}%
                            </p>
                            <p style="margin: 5px 0 0 0; color: #9ca3af; font-size: 12px;">
                              Cambio en 24 horas
                            </p>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Divider -->
                      <div style="height: 1px; background-color: #e5e7eb; margin: 30px 0;"></div>
                      
                      <!-- Details Section -->
                      <table cellpadding="0" cellspacing="0" border="0" width="100%">
                        <tr>
                          <td style="padding: 15px 20px; background-color: #f9fafb; border-radius: 8px;">
                            <table cellpadding="0" cellspacing="0" border="0" width="100%">
                              <tr>
                                <td style="padding: 8px 0;">
                                  <span style="color: #6b7280; font-size: 14px; font-weight: 500;">ID del Snapshot:</span>
                                  <span style="color: #1f2937; font-size: 14px; font-weight: 600; float: right;">#${
                                    snapshot.id
                                  }</span>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0;">
                                  <span style="color: #6b7280; font-size: 14px; font-weight: 500;">Fecha y Hora:</span>
                                  <span style="color: #1f2937; font-size: 14px; font-weight: 600; float: right;">${formattedDate}</span>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Info Box -->
                      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top: 30px;">
                        <tr>
                          <td style="padding: 20px; background-color: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 6px;">
                            <p style="margin: 0; color: #1e40af; font-size: 13px; line-height: 1.6;">
                              <strong>💡 Nota:</strong> Este es tu reporte diario automático del precio de Bitcoin. Los datos se actualizan cada 24 horas.
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 13px;">
                        Sistema de Monitoreo de Bitcoin
                      </p>
                      <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                        © ${new Date().getFullYear()} - Todos los derechos reservados
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      text: `
        REPORTE DIARIO DE BITCOIN
        
        Precio Actual: $${formattedPrice}
        Cambio 24h: ${deltaSign}${snapshot.delta}%
        
        Detalles:
        - ID del Snapshot: #${snapshot.id}
        - Fecha y Hora: ${formattedDate}
        
        ---
        Sistema de Monitoreo de Bitcoin
      `,
    };
  }

  private generateOrderExecutedTemplate(
    order: Order
  ): EmailTemplateResponseDto {
    const isBuy = order.type === "buy";
    const orderTypeColor = isBuy ? "#10b981" : "#ef4444";
    const orderTypeText = isBuy ? "COMPRA" : "VENTA";
    const orderTypeEmoji = isBuy ? "📈" : "📉";
    const formattedPrice = Number(order.price).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    const formattedDate = new Date(order.created_at).toLocaleString("es-ES", {
      dateStyle: "full",
      timeStyle: "short",
    });
    const formattedExecutedQty = order.executed_qty
      ? Number(order.executed_qty).toFixed(8)
      : "N/A";
    const formattedQuoteQty = order.cummulative_quote_qty
      ? Number(order.cummulative_quote_qty).toFixed(2)
      : "N/A";

    return {
      subject: `${orderTypeEmoji} Orden de ${orderTypeText} Ejecutada - $${formattedPrice}`,
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Orden Ejecutada</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f3f4f6; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, ${
                      isBuy ? "#10b981" : "#ef4444"
                    } 0%, ${
        isBuy ? "#059669" : "#dc2626"
      } 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">
                        ${orderTypeEmoji} Orden Ejecutada
                      </h1>
                      <p style="margin: 10px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">
                        Operación de ${orderTypeText} completada
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Main Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <!-- Order Type Badge -->
                      <table cellpadding="0" cellspacing="0" border="0" width="100%">
                        <tr>
                          <td style="text-align: center; padding-bottom: 30px;">
                            <div style="display: inline-block; background-color: ${orderTypeColor}; color: #ffffff; padding: 12px 30px; border-radius: 30px; font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                              ${orderTypeText}
                            </div>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Price Section -->
                      <table cellpadding="0" cellspacing="0" border="0" width="100%">
                        <tr>
                          <td style="text-align: center; padding-bottom: 30px;">
                            <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                              Precio de Ejecución
                            </p>
                            <p style="margin: 0; color: #1f2937; font-size: 48px; font-weight: 700; line-height: 1;">
                              $${formattedPrice}
                            </p>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Divider -->
                      <div style="height: 1px; background-color: #e5e7eb; margin: 30px 0;"></div>
                      
                      <!-- Order Details Section -->
                      <table cellpadding="0" cellspacing="0" border="0" width="100%">
                        <tr>
                          <td style="padding: 20px; background-color: #f9fafb; border-radius: 8px;">
                            <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px; font-weight: 600;">
                              Detalles de la Orden
                            </p>
                            <table cellpadding="0" cellspacing="0" border="0" width="100%">
                              <tr>
                                <td style="padding: 8px 0;">
                                  <span style="color: #6b7280; font-size: 14px; font-weight: 500;">ID de Orden:</span>
                                  <span style="color: #1f2937; font-size: 14px; font-weight: 600; float: right;">#${
                                    order.id
                                  }</span>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0; border-top: 1px solid #e5e7eb;">
                                  <span style="color: #6b7280; font-size: 14px; font-weight: 500;">Tipo:</span>
                                  <span style="color: ${orderTypeColor}; font-size: 14px; font-weight: 700; float: right; text-transform: uppercase;">${orderTypeText}</span>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0; border-top: 1px solid #e5e7eb;">
                                  <span style="color: #6b7280; font-size: 14px; font-weight: 500;">Fecha y Hora:</span>
                                  <span style="color: #1f2937; font-size: 14px; font-weight: 600; float: right;">${formattedDate}</span>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Binance Details Section -->
                      ${
                        order.binance_order_id
                          ? `
                      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top: 20px;">
                        <tr>
                          <td style="padding: 20px; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
                            <p style="margin: 0 0 15px 0; color: #92400e; font-size: 16px; font-weight: 600;">
                              📊 Información de Binance
                            </p>
                            <table cellpadding="0" cellspacing="0" border="0" width="100%">
                              <tr>
                                <td style="padding: 6px 0;">
                                  <span style="color: #78350f; font-size: 13px; font-weight: 500;">Order ID:</span>
                                  <span style="color: #92400e; font-size: 13px; font-weight: 600; float: right;">${
                                    order.binance_order_id
                                  }</span>
                                </td>
                              </tr>
                              ${
                                order.binance_status
                                  ? `
                              <tr>
                                <td style="padding: 6px 0; border-top: 1px solid #fde68a;">
                                  <span style="color: #78350f; font-size: 13px; font-weight: 500;">Estado:</span>
                                  <span style="color: #92400e; font-size: 13px; font-weight: 600; float: right;">${order.binance_status}</span>
                                </td>
                              </tr>
                              `
                                  : ""
                              }
                              ${
                                order.executed_qty
                                  ? `
                              <tr>
                                <td style="padding: 6px 0; border-top: 1px solid #fde68a;">
                                  <span style="color: #78350f; font-size: 13px; font-weight: 500;">Cantidad Ejecutada:</span>
                                  <span style="color: #92400e; font-size: 13px; font-weight: 600; float: right;">${formattedExecutedQty} BTC</span>
                                </td>
                              </tr>
                              `
                                  : ""
                              }
                              ${
                                order.cummulative_quote_qty
                                  ? `
                              <tr>
                                <td style="padding: 6px 0; border-top: 1px solid #fde68a;">
                                  <span style="color: #78350f; font-size: 13px; font-weight: 500;">Total (Quote):</span>
                                  <span style="color: #92400e; font-size: 13px; font-weight: 600; float: right;">$${formattedQuoteQty}</span>
                                </td>
                              </tr>
                              `
                                  : ""
                              }
                            </table>
                          </td>
                        </tr>
                      </table>
                      `
                          : ""
                      }
                      
                      <!-- Success Box -->
                      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top: 30px;">
                        <tr>
                          <td style="padding: 20px; background-color: ${
                            isBuy ? "#d1fae5" : "#fee2e2"
                          }; border-left: 4px solid ${orderTypeColor}; border-radius: 6px;">
                            <p style="margin: 0; color: ${
                              isBuy ? "#065f46" : "#7f1d1d"
                            }; font-size: 13px; line-height: 1.6;">
                              <strong>✅ Confirmación:</strong> Tu orden de ${orderTypeText} ha sido ejecutada exitosamente en el mercado de Bitcoin.
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 13px;">
                        Sistema de Trading de Bitcoin
                      </p>
                      <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                        © ${new Date().getFullYear()} - Todos los derechos reservados
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      text: `
        ORDEN EJECUTADA
        
        Tipo de Orden: ${orderTypeText}
        Precio: $${formattedPrice}
        
        Detalles de la Orden:
        - ID de Orden: #${order.id}
        - Fecha y Hora: ${formattedDate}
        
        ${
          order.binance_order_id
            ? `
        Información de Binance:
        - Order ID: ${order.binance_order_id}
        ${order.binance_status ? `- Estado: ${order.binance_status}` : ""}
        ${
          order.executed_qty
            ? `- Cantidad Ejecutada: ${formattedExecutedQty} BTC`
            : ""
        }
        ${
          order.cummulative_quote_qty
            ? `- Total (Quote): $${formattedQuoteQty}`
            : ""
        }
        `
            : ""
        }
        
        ---
        Sistema de Trading de Bitcoin
      `,
    };
  }

  private generateOpportunityTemplate(
    snapshot: Snapshot
  ): EmailTemplateResponseDto {
    const formattedPrice = Number(snapshot.price).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    const deltaSign = Number(snapshot.delta) >= 0 ? "+" : "";
    const formattedDate = new Date(snapshot.created_at).toLocaleString(
      "es-ES",
      {
        dateStyle: "full",
        timeStyle: "short",
      }
    );

    return {
      subject: `💰 Oportunidad de Compra de Bitcoin - $${formattedPrice}`,
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Oportunidad de Compra</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f3f4f6; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">
                        💰 Oportunidad de Compra
                      </h1>
                      <p style="margin: 10px 0 0 0; color: rgba(255, 255, 255, 0.95); font-size: 16px;">
                        Se ha detectado una oportunidad favorable
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Alert Banner -->
                  <tr>
                    <td style="background-color: #fffbeb; padding: 20px 30px; border-bottom: 3px solid #fbbf24;">
                      <p style="margin: 0; color: #92400e; font-size: 15px; text-align: center; font-weight: 600;">
                        ⚡ El precio actual representa una oportunidad de inversión
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Main Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <!-- Price Section -->
                      <table cellpadding="0" cellspacing="0" border="0" width="100%">
                        <tr>
                          <td style="text-align: center; padding-bottom: 30px;">
                            <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                              Precio Actual de Bitcoin
                            </p>
                            <p style="margin: 0; color: #1f2937; font-size: 48px; font-weight: 700; line-height: 1;">
                              $${formattedPrice}
                            </p>
                            <p style="margin: 15px 0 0 0; color: #ef4444; font-size: 24px; font-weight: 600;">
                              ${deltaSign}${snapshot.delta}%
                            </p>
                            <p style="margin: 5px 0 0 0; color: #9ca3af; font-size: 12px;">
                              Variación en las últimas 24 horas
                            </p>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Divider -->
                      <div style="height: 1px; background-color: #e5e7eb; margin: 30px 0;"></div>
                      
                      <!-- Opportunity Info -->
                      <table cellpadding="0" cellspacing="0" border="0" width="100%">
                        <tr>
                          <td style="padding: 25px; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; border: 2px solid #fbbf24;">
                            <table cellpadding="0" cellspacing="0" border="0" width="100%">
                              <tr>
                                <td style="text-align: center; padding-bottom: 20px;">
                                  <div style="display: inline-block; background-color: #f59e0b; color: #ffffff; padding: 10px 25px; border-radius: 30px; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                                    🎯 Momento Óptimo
                                  </div>
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  <p style="margin: 0; color: #78350f; font-size: 15px; line-height: 1.7; text-align: center;">
                                    Las condiciones actuales del mercado sugieren que este podría ser un buen momento para considerar una inversión en Bitcoin.
                                  </p>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Details Section -->
                      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top: 30px;">
                        <tr>
                          <td style="padding: 20px; background-color: #f9fafb; border-radius: 8px;">
                            <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px; font-weight: 600;">
                              📋 Información del Análisis
                            </p>
                            <table cellpadding="0" cellspacing="0" border="0" width="100%">
                              <tr>
                                <td style="padding: 8px 0;">
                                  <span style="color: #6b7280; font-size: 14px; font-weight: 500;">ID del Snapshot:</span>
                                  <span style="color: #1f2937; font-size: 14px; font-weight: 600; float: right;">#${
                                    snapshot.id
                                  }</span>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0; border-top: 1px solid #e5e7eb;">
                                  <span style="color: #6b7280; font-size: 14px; font-weight: 500;">Precio:</span>
                                  <span style="color: #1f2937; font-size: 14px; font-weight: 600; float: right;">$${formattedPrice}</span>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0; border-top: 1px solid #e5e7eb;">
                                  <span style="color: #6b7280; font-size: 14px; font-weight: 500;">Variación 24h:</span>
                                  <span style="color: #ef4444; font-size: 14px; font-weight: 600; float: right;">${deltaSign}${
        snapshot.delta
      }%</span>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0; border-top: 1px solid #e5e7eb;">
                                  <span style="color: #6b7280; font-size: 14px; font-weight: 500;">Fecha y Hora:</span>
                                  <span style="color: #1f2937; font-size: 14px; font-weight: 600; float: right;">${formattedDate}</span>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Recommendation Box -->
                      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top: 30px;">
                        <tr>
                          <td style="padding: 20px; background-color: #dbeafe; border-left: 4px solid #3b82f6; border-radius: 6px;">
                            <p style="margin: 0 0 10px 0; color: #1e40af; font-size: 14px; font-weight: 700;">
                              💡 Recomendación
                            </p>
                            <p style="margin: 0; color: #1e40af; font-size: 13px; line-height: 1.6;">
                              Esta alerta se genera automáticamente basándose en el análisis de mercado. Considera revisar la situación actual antes de tomar decisiones de inversión. Recuerda que toda inversión conlleva riesgos.
                            </p>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Warning Box -->
                      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top: 20px;">
                        <tr>
                          <td style="padding: 15px; background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 6px;">
                            <p style="margin: 0; color: #7f1d1d; font-size: 12px; line-height: 1.5;">
                              <strong>⚠️ Disclaimer:</strong> Esta información es solo para fines informativos y no constituye asesoramiento financiero. Realiza tu propia investigación antes de invertir.
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 13px;">
                        Sistema de Análisis de Bitcoin
                      </p>
                      <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                        © ${new Date().getFullYear()} - Todos los derechos reservados
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      text: `
        OPORTUNIDAD DE COMPRA DE BITCOIN
        
        ⚡ Se ha detectado una oportunidad favorable
        
        Precio Actual: $${formattedPrice}
        Variación 24h: ${deltaSign}${snapshot.delta}%
        
        Información del Análisis:
        - ID del Snapshot: #${snapshot.id}
        - Precio: $${formattedPrice}
        - Variación 24h: ${deltaSign}${snapshot.delta}%
        - Fecha y Hora: ${formattedDate}
        
        💡 Recomendación:
        Esta alerta se genera automáticamente basándose en el análisis de mercado.
        Considera revisar la situación actual antes de tomar decisiones de inversión.
        
        ⚠️ Disclaimer: Esta información es solo para fines informativos y no constituye
        asesoramiento financiero. Realiza tu propia investigación antes de invertir.
        
        ---
        Sistema de Análisis de Bitcoin
      `,
    };
  }
}

export default AlertService;
