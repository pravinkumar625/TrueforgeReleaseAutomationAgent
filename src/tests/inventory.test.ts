import { InventoryService } from "../inventory/inventoryService";

export function runInventoryTests(): { name: string; passed: boolean; error?: string }[] {
  const results: { name: string; passed: boolean; error?: string }[] = [];

  const inv = new InventoryService();

  // Test 1: Add Item
  try {
    const item = inv.addItem("TEST-SKU-1", "Quantum Workstation", 150000, 10, "Computers");
    if (item.id && item.stockQuantity === 10) {
      results.push({ name: "Add Item to Inventory", passed: true });
    } else {
      results.push({ name: "Add Item to Inventory", passed: false, error: "Incorrect item fields" });
    }
  } catch (err: any) {
    results.push({ name: "Add Item to Inventory", passed: false, error: err.message });
  }

  // Test 2: Deduct Stock
  try {
    const item = inv.addItem("TEST-SKU-2", "Laser Printer", 30000, 5, "Peripherals");
    inv.deductStock(item.id, 2);
    const updated = inv.getItemById(item.id);
    if (updated?.stockQuantity === 3) {
      results.push({ name: "Deduct Stock Level Correctly", passed: true });
    } else {
      results.push({ name: "Deduct Stock Level Correctly", passed: false, error: `Expected stock 3, got ${updated?.stockQuantity}` });
    }
  } catch (err: any) {
    results.push({ name: "Deduct Stock Level", passed: false, error: err.message });
  }

  // Test 3: Insufficient Stock Rejection
  try {
    const item = inv.addItem("TEST-SKU-3", "4K Monitor", 40000, 1, "Displays");
    inv.deductStock(item.id, 5);
    results.push({ name: "Prevent Insufficient Stock Deduction", passed: false, error: "Deducted more stock than available" });
  } catch {
    results.push({ name: "Prevent Insufficient Stock Deduction", passed: true });
  }

  return results;
}
