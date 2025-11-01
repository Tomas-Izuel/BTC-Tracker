import { Resend, type CreateEmailResponse } from "resend";
import { EMAIL_FROM, RESEND_API_KEY } from "../utils/constants";
import type { EmailDto } from "../types/email/email.type";

export class ResendRepository {
  private resend: Resend | null = null;

  constructor() {
    if (RESEND_API_KEY) {
      this.resend = new Resend(RESEND_API_KEY);
    } else {
      console.warn("RESEND_API_KEY not found");
    }
  }

  async sendEmail(email: EmailDto): Promise<CreateEmailResponse> {
    if (!this.resend) {
      throw new Error("Resend not initialized");
    }
    return this.resend.emails.send({
      from: EMAIL_FROM,
      to: email.to,
      subject: email.subject,
      html: email.html,
      text: email.text,
    });
  }
}

export default ResendRepository;
