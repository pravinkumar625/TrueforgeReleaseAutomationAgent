import { ClassifiedCommit } from "./classifier";
import { TestSuiteSummary } from "../tests/run-all-tests";
import { config } from "../config";

export interface RiskAnalysis {
  score: number; // 0 to 100
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  breakingChangesCount: number;
  criticalFilesTouched: string[];
  testFailuresCount: number;
  flags: string[];
}

export class RiskAnalyzer {
  public computeRiskScore(classifiedCommits: ClassifiedCommit[], testSummary: TestSuiteSummary): RiskAnalysis {
    let score = 10; // Base baseline risk score
    const flags: string[] = [];
    const criticalFilesSet = new Set<string>();

    // 1. Evaluate breaking changes
    const breakingCommits = classifiedCommits.filter((c) => c.isBreaking);
    if (breakingCommits.length > 0) {
      score += 40 * breakingCommits.length;
      flags.push(`BREAKING_CHANGES_DETECTED: Found ${breakingCommits.length} breaking API change commit(s).`);
    }

    // 2. Evaluate critical file touches
    for (const commit of classifiedCommits) {
      for (const file of commit.filesChanged) {
        if (config.criticalModules.some((crit) => file.startsWith(crit) || file.includes(crit))) {
          criticalFilesSet.add(file);
        }
      }
    }

    const criticalTouched = Array.from(criticalFilesSet);
    if (criticalTouched.length > 0) {
      score += 25 * criticalTouched.length;
      flags.push(`CRITICAL_PATHS_MODIFIED: Touched ${criticalTouched.length} sensitive subsystem file(s): [${criticalTouched.join(", ")}].`);
    }

    // 3. Evaluate test suite output
    if (!testSummary.passed) {
      score += 50;
      flags.push(`TEST_SUITE_FAILURES: ${testSummary.failCount} automated test(s) failed in sandbox container.`);
    } else {
      flags.push(`TEST_SUITE_PASSED: All ${testSummary.totalTests} automated tests passed cleanly.`);
    }

    // Cap score between 0 and 100
    score = Math.min(100, Math.max(0, score));

    let riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    if (score >= 75) {
      riskLevel = "CRITICAL";
    } else if (score >= 50) {
      riskLevel = "HIGH";
    } else if (score >= 25) {
      riskLevel = "MEDIUM";
    } else {
      riskLevel = "LOW";
    }

    return {
      score,
      riskLevel,
      breakingChangesCount: breakingCommits.length,
      criticalFilesTouched: criticalTouched,
      testFailuresCount: testSummary.failCount,
      flags
    };
  }
}
