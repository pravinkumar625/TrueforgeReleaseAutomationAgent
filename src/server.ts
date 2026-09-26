import { config } from "./config";
import { APIRouter } from "./api/routes";
import { UserService } from "./users/userService";
import { InventoryService } from "./inventory/inventoryService";

console.log(`================================================================`);
console.log(`🚀 Starting ${config.appName} [Env: ${config.environment}]`);
console.log(`================================================================`);

const userService = new UserService();
const inventoryService = new InventoryService();
const router = new APIRouter();

// Seed initial system data
const admin = userService.createUser("admin@nexus.com", "System Admin", "admin");
console.log(`✅ Seeded System Admin: ${admin.email} (ID: ${admin.id})`);

const item1 = inventoryService.addItem("SKU-NEO-001", "Enterprise Server Blade X1", 499900, 50, "Hardware");
const item2 = inventoryService.addItem("SKU-NEO-002", "Fiber Optic Switch 100G", 129900, 100, "Networking");
console.log(`✅ Seeded Inventory: ${item1.title} (${item1.stockQuantity} units), ${item2.title} (${item2.stockQuantity} units)`);

const health = router.handleRequest("GET", "/health");
console.log(`🟢 System Healthcheck Output:`, health.body);
console.log(`\nReady to process commands and run release pipeline verification.`);
