const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const cwd = path.resolve(__dirname, "..");

function run(cmd) {
  console.log(`> ${cmd}`);
  execSync(cmd, { cwd, stdio: "inherit", encoding: "utf8" });
}

console.log("Initializing Git repository with realistic release history...");

// Initialize git repo if not initialized
try {
  run("git init");
  run('git config user.name "Release Engineer"');
  run('git config user.email "engineer@enterprise.com"');
} catch (e) {
  console.error("Git init error:", e);
}

// Stage initial codebase files for base release v1.0.0
run("git add package.json tsconfig.json src/config/index.ts src/db/database.ts");
try {
  run('git commit -m "chore: initial repository scaffolding and database core"');
} catch (e) {
  console.log("Commit already exists or empty.");
}

// Add User and Inventory modules for v1.4.0
run("git add src/users/userService.ts src/inventory/inventoryService.ts");
try {
  run('git commit -m "feat(user,inventory): add user profile service and inventory management catalog"');
} catch (e) {}

// Add Auth module and test suite for v1.4.2
run("git add src/auth/jwt.ts src/auth/oauth.ts src/tests/auth.test.ts src/tests/inventory.test.ts");
try {
  run('git commit -m "feat(auth): implement JWT signature verification and OAuth2 provider integration"');
} catch (e) {}

// Create Tag v1.4.2
try {
  run('git tag -a v1.4.2 -m "Release v1.4.2 - Production Stable Base"');
  console.log("Created Git tag v1.4.2");
} catch (e) {
  console.log("Tag v1.4.2 already exists.");
}

// Now add recent unreleased commits containing Breaking Changes, New Features, and Bug Fixes for v2.0.0 analysis!

// Commit 1: Breaking JWT payload schema update
run("git add src/payments/stripeProvider.ts src/tests/payments.test.ts");
try {
  run('git commit -m "feat!: upgrade payment gateway provider to Stripe V2 API with breaking signature schema"');
} catch (e) {}

// Commit 2: Order Service & Notifications
run("git add src/orders/orderService.ts src/notifications/emailService.ts src/tests/orders.test.ts");
try {
  run('git commit -m "feat(orders): implement end-to-end checkout and email notification dispatcher"');
} catch (e) {}

// Commit 3: Metrics & Telemetry
run("git add src/analytics/metricsCollector.ts");
try {
  run('git commit -m "feat(telemetry): add Prometheus metrics collector and audit log stream"');
} catch (e) {}

// Commit 4: Bugfix in API routing
run("git add src/api/routes.ts src/server.ts");
try {
  run('git commit -m "fix(api): resolve route parameter decoding and authorization header parsing"');
} catch (e) {}

// Commit 5: Test runner & release manager framework
run("git add src/tests/run-all-tests.ts src/release-manager/");
try {
  run('git commit -m "chore(release): integrate release manager analyzer and sandbox test suite"');
} catch (e) {}

console.log("\n================================================================");
console.log("✅ Git Repository successfully initialized with 8 rich commits and tag v1.4.2!");
console.log("================================================================");
