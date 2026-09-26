export interface DatabaseRecord {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: any;
}

export class InMemoryDatabase {
  private static instance: InMemoryDatabase;
  private tables: Map<string, Map<string, DatabaseRecord>> = new Map();

  private constructor() {
    this.initTables(["users", "inventory", "orders", "payments", "audit_logs"]);
  }

  public static getInstance(): InMemoryDatabase {
    if (!InMemoryDatabase.instance) {
      InMemoryDatabase.instance = new InMemoryDatabase();
    }
    return InMemoryDatabase.instance;
  }

  private initTables(tableNames: string[]) {
    for (const name of tableNames) {
      this.tables.set(name, new Map());
    }
  }

  public insert(table: string, record: Omit<DatabaseRecord, "createdAt" | "updatedAt">): DatabaseRecord {
    const tableMap = this.tables.get(table);
    if (!tableMap) throw new Error(`Table '${table}' does not exist.`);

    const now = new Date();
    const fullRecord: DatabaseRecord = {
      id: record.id,
      createdAt: now,
      updatedAt: now,
      ...record
    };
    tableMap.set(record.id, fullRecord);
    return fullRecord;
  }

  public findById(table: string, id: string): DatabaseRecord | null {
    const tableMap = this.tables.get(table);
    if (!tableMap) return null;
    return tableMap.get(id) || null;
  }

  public findAll(table: string, filterFn?: (item: DatabaseRecord) => boolean): DatabaseRecord[] {
    const tableMap = this.tables.get(table);
    if (!tableMap) return [];
    const items = Array.from(tableMap.values());
    return filterFn ? items.filter(filterFn) : items;
  }

  public update(table: string, id: string, patch: Partial<DatabaseRecord>): DatabaseRecord | null {
    const existing = this.findById(table, id);
    if (!existing) return null;

    const updated: DatabaseRecord = {
      ...existing,
      ...patch,
      updatedAt: new Date()
    };
    this.tables.get(table)!.set(id, updated);
    return updated;
  }

  public count(table: string): number {
    return this.tables.get(table)?.size || 0;
  }

  public clearAll(): void {
    for (const map of this.tables.values()) {
      map.clear();
    }
  }
}
