import { CommitInfo } from "./gitExtractor";

export type CommitCategory = "breaking" | "feature" | "fix" | "chore" | "refactor" | "docs" | "perf";

export interface ClassifiedCommit extends CommitInfo {
  category: CommitCategory;
  isBreaking: boolean;
  classificationReason: string;
}

export interface SemVerBump {
  targetVersion: string;
  bumpType: "MAJOR" | "MINOR" | "PATCH";
  reasoning: string;
}

export class CommitClassifier {
  public classifyCommit(commit: CommitInfo): ClassifiedCommit {
    const msg = commit.message.toLowerCase();

    const isExplicitBreaking = msg.includes("!") || msg.includes("breaking change") || msg.includes("breaking:");
    if (isExplicitBreaking) {
      return {
        ...commit,
        category: "breaking",
        isBreaking: true,
        classificationReason: "Message contains breaking change indicator ('!' or 'BREAKING CHANGE')"
      };
    }

    if (msg.startsWith("feat")) {
      return {
        ...commit,
        category: "feature",
        isBreaking: false,
        classificationReason: "New feature addition (feat)"
      };
    }

    if (msg.startsWith("fix")) {
      return {
        ...commit,
        category: "fix",
        isBreaking: false,
        classificationReason: "Bug fix correction (fix)"
      };
    }

    if (msg.startsWith("perf")) {
      return {
        ...commit,
        category: "perf",
        isBreaking: false,
        classificationReason: "Performance optimization (perf)"
      };
    }

    if (msg.startsWith("refactor")) {
      return {
        ...commit,
        category: "refactor",
        isBreaking: false,
        classificationReason: "Code restructuring without behavior change (refactor)"
      };
    }

    if (msg.startsWith("docs")) {
      return {
        ...commit,
        category: "docs",
        isBreaking: false,
        classificationReason: "Documentation updates (docs)"
      };
    }

    return {
      ...commit,
      category: "chore",
      isBreaking: false,
      classificationReason: "Maintenance or build configuration (chore)"
    };
  }

  public calculateSemVer(currentVersion: string, classified: ClassifiedCommit[]): SemVerBump {
    const cleanVer = currentVersion.replace(/^v/, "");
    const parts = cleanVer.split(".").map(Number);
    const major = parts[0] || 1;
    const minor = parts[1] || 0;
    const patch = parts[2] || 0;

    const hasBreaking = classified.some((c) => c.isBreaking);
    const hasFeature = classified.some((c) => c.category === "feature");

    if (hasBreaking) {
      const targetVersion = `v${major + 1}.0.0`;
      const breakingCount = classified.filter((c) => c.isBreaking).length;
      return {
        targetVersion,
        bumpType: "MAJOR",
        reasoning: `MAJOR version bump (${currentVersion} -> ${targetVersion}): Detected ${breakingCount} breaking change(s).`
      };
    }

    if (hasFeature) {
      const targetVersion = `v${major}.${minor + 1}.0`;
      const featureCount = classified.filter((c) => c.category === "feature").length;
      return {
        targetVersion,
        bumpType: "MINOR",
        reasoning: `MINOR version bump (${currentVersion} -> ${targetVersion}): Detected ${featureCount} new feature(s) and zero breaking changes.`
      };
    }

    const targetVersion = `v${major}.${minor}.${patch + 1}`;
    return {
      targetVersion,
      bumpType: "PATCH",
      reasoning: `PATCH version bump (${currentVersion} -> ${targetVersion}): Contains exclusively bug fixes, chores, or documentation changes.`
    };
  }
}
