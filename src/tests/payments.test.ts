import { PaymentGatewayProvider } from "../payments/stripeProvider";

export async function runPaymentTests(): Promise<{ name: string; passed: boolean; error?: string }[]> {
  const results: { name: string; passed: boolean; error?: string }[] = [];
  const gateway = new PaymentGatewayProvider();

  // Test 1: Successful Charge
  try {
    const res = await gateway.processCharge({
      amountCents: 10000,
      currency: "USD",
      sourceToken: "tok_visa_valid",
      description: "Test charge"
    });
    if (res.status === "succeeded" && res.transactionId.startsWith("txn_")) {
      results.push({ name: "Payment Processing - Valid Card Token", passed: true });
    } else {
      results.push({ name: "Payment Processing - Valid Card Token", passed: false, error: "Transaction not succeeded" });
    }
  } catch (err: any) {
    results.push({ name: "Payment Processing - Valid Card Token", passed: false, error: err.message });
  }

  // Test 2: Invalid Payment Token Rejection
  try {
    await gateway.processCharge({
      amountCents: 5000,
      currency: "USD",
      sourceToken: "invalid_card_token",
      description: "Invalid token test"
    });
    results.push({ name: "Payment Processing - Decline Invalid Token", passed: false, error: "Processed invalid token" });
  } catch {
    results.push({ name: "Payment Processing - Decline Invalid Token", passed: true });
  }

  // Test 3: Zero or Negative Charge Rejection
  try {
    await gateway.processCharge({
      amountCents: 0,
      currency: "USD",
      sourceToken: "tok_visa_valid",
      description: "Zero charge test"
    });
    results.push({ name: "Payment Processing - Decline Zero Amount", passed: false, error: "Processed zero amount charge" });
  } catch {
    results.push({ name: "Payment Processing - Decline Zero Amount", passed: true });
  }

  return results;
}
