export interface EmailMessage {
  to: string;
  subject: string;
  body: string;
  templateId?: string;
}

export class NotificationService {
  private sentMessages: EmailMessage[] = [];

  public async sendEmail(message: EmailMessage): Promise<{ success: boolean; messageId: string }> {
    if (!message.to || !message.to.includes("@")) {
      throw new Error("Invalid recipient email address");
    }
    this.sentMessages.push(message);
    const messageId = `msg_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    return { success: true, messageId };
  }

  public getSentLog(): EmailMessage[] {
    return [...this.sentMessages];
  }
}
