export interface ChargeRequest {
  amountCents: number;
  currency: string;
  sourceToken: string;
  description: string;
  idempotencyKey?: string;
}

export interface ChargeResponse {
  transactionId: string;
  status: "succeeded" | "failed" | "pending";
  amountCharged: number;
  feeCents: number;
  createdAt: Date;
  receiptUrl: string;
}

export class PaymentGatewayProvider {
  private apiVersion: string = "2026-03-01"; // Upgraded API version (Breaking change in payload)

  public async processCharge(req: ChargeRequest): Promise<ChargeResponse> {
    if (req.amountCents <= 0) {
      throw new Error("Invalid charge amount. Amount must be strictly positive.");
    }

    if (!req.sourceToken || req.sourceToken.startsWith("invalid")) {
      throw new Error("Payment transaction declined: Invalid payment token.");
    }

    // Calculate processing fee (2.9% + 30 cents)
    const feeCents = Math.round(req.amountCents * 0.029) + 30;
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    return {
      transactionId,
      status: "succeeded",
      amountCharged: req.amountCents,
      feeCents,
      createdAt: new Date(),
      receiptUrl: `https://payments.nexus.com/receipts/${transactionId}`
    };
  }

  public async refundCharge(transactionId: string, amountCents: number): Promise<{ refundId: string; status: string }> {
    if (!transactionId) throw new Error("Transaction ID is required for refunds.");
    return {
      refundId: `ref_${Date.now()}_${transactionId.slice(-6)}`,
      status: "refunded"
    };
  }
}
