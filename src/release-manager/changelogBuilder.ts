import { ClassifiedCommit, SemVerBump } from "./classifier";
import { RiskAnalysis } from "./riskEngine";

export interface ReleaseNotesBundle {
  version: string;
  previousVersion: string;
  title: string;
  markdown: string;
  jsonSummary: Record<string, any>;
}

export class ChangelogBuilder {
  public buildReleaseNotes(
    semver: SemVerBump,
    previousVersion: string,
    commits: ClassifiedCommit[],
    risk: RiskAnalysis
  ): ReleaseNotesBundle {
    const breaking = commits.filter((c) => c.isBreaking);
    const features = commits.filter((c) => c.category === "feature");
    const fixes = commits.filter((c) => c.category === "fix");
    const chores = commits.filter((c) => c.category === "chore" || c.category === "refactor" || c.category === "docs" || c.category === "perf");

    let md = `# Release ${semver.targetVersion}\n\n`;
    md += `**Previous Version:** \`${previousVersion}\` | **Bump Type:** \`${semver.bumpType}\`\n\n`;
    md += `> **SemVer Rationale:** ${semver.reasoning}\n\n`;

    md += `## ⚠️ Risk & Quality Assessment\n`;
    md += `- **Risk Score:** \`${risk.score}/100\` (${risk.riskLevel})\n`;
    md += `- **Critical Files Touched:** ${risk.criticalFilesTouched.length}\n`;
    md += `- **Test Suite Status:** ${risk.testFailuresCount === 0 ? "✅ PASSED" : "❌ FAILED (" + risk.testFailuresCount + " failures)"}\n\n`;

    if (risk.flags.length > 0) {
      md += `### Risk Audit Flags:\n`;
      for (const flag of risk.flags) {
        md += `- ${flag}\n`;
      }
      md += `\n`;
    }

    if (breaking.length > 0) {
      md += `## 🚨 BREAKING CHANGES\n`;
      for (const c of breaking) {
        md += `- **${c.shortSha}**: ${c.message} (by @${c.author})\n`;
      }
      md += `\n`;
    }

    if (features.length > 0) {
      md += `## ✨ New Features\n`;
      for (const c of features) {
        md += `- **${c.shortSha}**: ${c.message} (by @${c.author})\n`;
      }
      md += `\n`;
    }

    if (fixes.length > 0) {
      md += `## 🐛 Bug Fixes\n`;
      for (const c of fixes) {
        md += `- **${c.shortSha}**: ${c.message} (by @${c.author})\n`;
      }
      md += `\n`;
    }

    if (chores.length > 0) {
      md += `## 🛠 Maintenance & Improvements\n`;
      for (const c of chores) {
        md += `- **${c.shortSha}**: ${c.message} (by @${c.author})\n`;
      }
      md += `\n`;
    }

    return {
      version: semver.targetVersion,
      previousVersion,
      title: `Release ${semver.targetVersion}`,
      markdown: md,
      jsonSummary: {
        targetVersion: semver.targetVersion,
        bumpType: semver.bumpType,
        riskScore: risk.score,
        riskLevel: risk.riskLevel,
        commitCount: commits.length,
        breakingCount: breaking.length,
        featureCount: features.length,
        fixCount: fixes.length
      }
    };
  }
}
