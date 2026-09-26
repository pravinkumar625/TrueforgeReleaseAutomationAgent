import { InMemoryDatabase } from "../db/database";

export interface ItemCatalog {
  id: string;
  sku: string;
  title: string;
  price: number;
  stockQuantity: number;
  category: string;
}

export class InventoryService {
  private db = InMemoryDatabase.getInstance();

  public addItem(sku: string, title: string, price: number, stockQuantity: number, category: string): ItemCatalog {
    const itemId = `item_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const record = this.db.insert("inventory", {
      id: itemId,
      sku,
      title,
      price,
      stockQuantity,
      category
    });
    return record as unknown as ItemCatalog;
  }

  public getItemBySku(sku: string): ItemCatalog | null {
    const items = this.db.findAll("inventory", (i) => i.sku === sku);
    return (items[0] as unknown as ItemCatalog) || null;
  }

  public getItemById(id: string): ItemCatalog | null {
    return this.db.findById("inventory", id) as unknown as ItemCatalog | null;
  }

  public deductStock(itemId: string, quantity: number): void {
    const item = this.getItemById(itemId);
    if (!item) throw new Error(`Item ${itemId} not found`);
    if (item.stockQuantity < quantity) {
      throw new Error(`Insufficient stock for item ${item.title}. Available: ${item.stockQuantity}, Requested: ${quantity}`);
    }

    this.db.update("inventory", itemId, {
      stockQuantity: item.stockQuantity - quantity
    });
  }

  public listItems(): ItemCatalog[] {
    return this.db.findAll("inventory") as unknown as ItemCatalog[];
  }
}
