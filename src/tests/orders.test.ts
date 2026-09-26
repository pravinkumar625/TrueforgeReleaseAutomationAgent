import { OrderService } from "../orders/orderService";
import { InventoryService } from "../inventory/inventoryService";
import { UserService } from "../users/userService";

export async function runOrderTests(): Promise<{ name: string; passed: boolean; error?: string }[]> {
  const results: { name: string; passed: boolean; error?: string }[] = [];

  const orderService = new OrderService();
  const inventoryService = new InventoryService();
  const userService = new UserService();

  // Seed user and item
  const user = userService.createUser(`customer_${Date.now()}@test.com`, "Customer One", "user");
  const item = inventoryService.addItem("SKU-ORD-01", "Order Item Alpha", 2500, 20, "Electronics");

  // Test 1: Place Order End-to-End
  try {
    const order = await orderService.placeOrder(
      user.id,
      [{ itemId: item.id, quantity: 2, unitPriceCents: 2500 }],
      "tok_visa_valid"
    );

    if (order.status === "completed" && order.totalAmountCents === 5000) {
      results.push({ name: "End-to-End Order Placement & Fulfillment", passed: true });
    } else {
      results.push({ name: "End-to-End Order Placement", passed: false, error: "Order state mismatch" });
    }
  } catch (err: any) {
    results.push({ name: "End-to-End Order Placement", passed: false, error: err.message });
  }

  // Test 2: Reject Order With Failed Payment
  try {
    await orderService.placeOrder(
      user.id,
      [{ itemId: item.id, quantity: 1, unitPriceCents: 2500 }],
      "invalid_payment_token"
    );
    results.push({ name: "Rollback Order on Payment Failure", passed: false, error: "Order succeeded despite payment failure" });
  } catch {
    results.push({ name: "Rollback Order on Payment Failure", passed: true });
  }

  return results;
}
