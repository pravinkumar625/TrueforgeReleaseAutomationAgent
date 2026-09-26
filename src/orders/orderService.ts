import { InMemoryDatabase } from "../db/database";
import { InventoryService } from "../inventory/inventoryService";
import { PaymentGatewayProvider } from "../payments/stripeProvider";

export interface OrderItem {
  itemId: string;
  quantity: number;
  unitPriceCents: number;
}

export interface OrderRecord {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmountCents: number;
  paymentTransactionId: string;
  status: "pending" | "completed" | "cancelled";
}

export class OrderService {
  private db = InMemoryDatabase.getInstance();
  private inventoryService = new InventoryService();
  private paymentProvider = new PaymentGatewayProvider();

  public async placeOrder(userId: string, items: OrderItem[], paymentToken: string): Promise<OrderRecord> {
    if (items.length === 0) {
      throw new Error("Cannot place an empty order.");
    }

    let totalCents = 0;
    // Verify inventory and calculate total
    for (const item of items) {
      const inventoryItem = this.inventoryService.getItemById(item.itemId);
      if (!inventoryItem) {
        throw new Error(`Item ID ${item.itemId} not found in inventory.`);
      }
      if (inventoryItem.stockQuantity < item.quantity) {
        throw new Error(`Insufficient stock for ${inventoryItem.title}`);
      }
      totalCents += item.unitPriceCents * item.quantity;
    }

    // Process payment
    const charge = await this.paymentProvider.processCharge({
      amountCents: totalCents,
      currency: "USD",
      sourceToken: paymentToken,
      description: `Order placement for User ${userId}`
    });

    // Deduct stock after successful payment
    for (const item of items) {
      this.inventoryService.deductStock(item.itemId, item.quantity);
    }

    const orderId = `ord_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const record = this.db.insert("orders", {
      id: orderId,
      userId,
      items,
      totalAmountCents: totalCents,
      paymentTransactionId: charge.transactionId,
      status: "completed"
    });

    return record as unknown as OrderRecord;
  }

  public getOrder(orderId: string): OrderRecord | null {
    return this.db.findById("orders", orderId) as unknown as OrderRecord | null;
  }

  public listUserOrders(userId: string): OrderRecord[] {
    return this.db.findAll("orders", (o) => o.userId === userId) as unknown as OrderRecord[];
  }
}
