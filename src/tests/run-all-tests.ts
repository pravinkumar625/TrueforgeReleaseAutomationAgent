import { runAuthTests } from "./auth.test";
import { runInventoryTests } from "./inventory.test";
import { runPaymentTests } from "./payments.test";
import { runOrderTests } from "./orders.test";

export interface TestSuiteSummary {
  passed: boolean;
  totalTests: number;
  passCount: number;
  failCount: number;
  logs: string[];
  failedCases: string[];
}

export async function executeAllTests(): Promise<TestSuiteSummary> {
  const logs: string[] = [];
  const failedCases: string[] = [];

  logs.push("================================================================");
  logs.push("🧪 RUNNING REPOSITORY SUITE IN ISOLATED SANDBOX ENVIRONMENT");
  logs.push("================================================================");

  const authResults = runAuthTests();
  const invResults = runInventoryTests();
  const payResults = await runPaymentTests();
  const orderResults = await runOrderTests();

  const all = [...authResults, ...invResults, ...payResults, ...orderResults];
  let passCount = 0;
  let failCount = 0;

  for (const t of all) {
    if (t.passed) {
      passCount++;
      logs.push(`  [PASS] ${t.name}`);
    } else {
      failCount++;
      failedCases.push(`${t.name}: ${t.error || "Unknown failure"}`);
      logs.push(`  [FAIL] ${t.name} -> ${t.error}`);
    }
  }

  const passed = failCount === 0;
  logs.push("----------------------------------------------------------------");
  logs.push(`SUMMARY: ${passCount}/${all.length} Passed | ${failCount} Failed.`);
  logs.push("================================================================");

  return {
    passed,
    totalTests: all.length,
    passCount,
    failCount,
    logs,
    failedCases
  };
}

if (require.main === module) {
  executeAllTests().then((res) => {
    console.log(res.logs.join("\n"));
    process.exit(res.passed ? 0 : 1);
  });
}
