import { GitExtractor } from "./gitExtractor";
import { CommitClassifier } from "./classifier";
import { executeAllTests } from "../tests/run-all-tests";
import { RiskAnalyzer } from "./riskEngine";
import { ChangelogBuilder } from "./changelogBuilder";
import { SafetyApprovalGate } from "./approvalGate";

async function runReleaseAnalysis() {
  console.log(`================================================================`);
  console.log(`🔍 ENTERPRISE GIT RELEASE ANALYZER & AUTOMATION ENGINE`);
  console.log(`================================================================\n`);

  const git = new GitExtractor();
  const classifier = new CommitClassifier();
  const riskAnalyzer = new RiskAnalyzer();
  const changelogBuilder = new ChangelogBuilder();
  const gate = new SafetyApprovalGate();

  // 1. Discover scope
  const lastTag = git.getLastTag() || "v1.4.2";
  console.log(`📌 Step 1: Discovering Scope...`);
  console.log(`  Last Tag: ${lastTag}`);

  const rawCommits = git.getCommitsSinceTag(lastTag);
  console.log(`  Found ${rawCommits.length} commit(s) since tag ${lastTag}.\n`);

  // 2. Classify commits
  console.log(`📌 Step 2: Classifying Commit Intent & SemVer Calculation...`);
  const classifiedCommits = rawCommits.map((c) => classifier.classifyCommit(c));

  for (const c of classifiedCommits) {
    console.log(`  [${c.category.toUpperCase()}] ${c.shortSha}: ${c.message} (${c.classificationReason})`);
  }

  const semver = classifier.calculateSemVer(lastTag, classifiedCommits);
  console.log(`\n  ➡️ Proposed Next Version: ${semver.targetVersion}`);
  console.log(`  ➡️ SemVer Rationale: ${semver.reasoning}\n`);

  // 3. Sandbox execution
  console.log(`📌 Step 3: Running Sandbox Automated Test Suite...`);
  const testSummary = await executeAllTests();

  // 4. Compute Risk Score
  console.log(`\n📌 Step 4: Computing Multi-Factor Risk Score...`);
  const risk = riskAnalyzer.computeRiskScore(classifiedCommits, testSummary);
  console.log(`  Risk Score: ${risk.score}/100 [Level: ${risk.riskLevel}]`);
  console.log(`  Breaking Changes: ${risk.breakingChangesCount}`);
  console.log(`  Critical Files Modified: ${risk.criticalFilesTouched.length}`);
  for (const flag of risk.flags) {
    console.log(`  🚩 ${flag}`);
  }

  // 5. Build Release Notes
  console.log(`\n📌 Step 5: Drafting Structured Release Notes...`);
  const notes = changelogBuilder.buildReleaseNotes(semver, lastTag, classifiedCommits, risk);

  console.log(`\n------------------ DRAFTED RELEASE NOTES ------------------`);
  console.log(notes.markdown);
  console.log(`-----------------------------------------------------------\n`);

  // 6. Request Approval Gate
  const currentCommit = git.getCurrentCommitSha();
  gate.requestHumanApproval(semver.targetVersion, currentCommit);

  const shouldApprove = process.argv.includes("--approve");
  if (shouldApprove) {
    console.log(`🤖 Granting simulated explicit human approval...`);
    gate.grantApproval(semver.targetVersion, currentCommit, "HumanReleaseEngineer");
    gate.executeRelease(semver.targetVersion, currentCommit, notes.markdown);
  } else {
    console.log(`💡 Note: Pass --approve flag to simulate human approval and tag the git repo.`);
  }

  return {
    semver,
    risk,
    notes,
    testSummary
  };
}

if (require.main === module) {
  runReleaseAnalysis().catch(err => {
    console.error("Release analysis failed:", err);
    process.exit(1);
  });
}
