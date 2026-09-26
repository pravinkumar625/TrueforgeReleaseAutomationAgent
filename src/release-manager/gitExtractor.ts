import { execSync } from "child_process";

export interface CommitInfo {
  sha: string;
  shortSha: string;
  author: string;
  date: string;
  message: string;
  filesChanged: string[];
}

export class GitExtractor {
  private cwd: string;

  constructor(cwd: string = process.cwd()) {
    this.cwd = cwd;
  }

  public getLastTag(): string | null {
    try {
      const output = execSync("git describe --tags --abbrev=0", { cwd: this.cwd, encoding: "utf8" }).trim();
      return output || null;
    } catch {
      return null;
    }
  }

  public getCommitsSinceTag(tag: string | null): CommitInfo[] {
    try {
      const range = tag ? `${tag}..HEAD` : "HEAD";
      // Format: %H|%h|%an|%ad|%s
      const gitLogCmd = `git log ${range} --pretty=format:"%H|%h|%an|%ad|%s"`;
      const rawLog = execSync(gitLogCmd, { cwd: this.cwd, encoding: "utf8" }).trim();

      if (!rawLog) return [];

      const lines = rawLog.split("\n");
      const commits: CommitInfo[] = [];

      for (const line of lines) {
        if (!line.trim()) continue;
        const [sha, shortSha, author, date, message] = line.split("|");

        // Get files changed for this commit
        let filesChanged: string[] = [];
        try {
          const filesOutput = execSync(`git show --pretty="" --name-only ${sha}`, { cwd: this.cwd, encoding: "utf8" }).trim();
          filesChanged = filesOutput ? filesOutput.split("\n").map(f => f.trim()).filter(Boolean) : [];
        } catch {
          filesChanged = [];
        }

        commits.push({
          sha,
          shortSha,
          author,
          date,
          message,
          filesChanged
        });
      }

      return commits;
    } catch (err: any) {
      console.error(`Error reading git commits: ${err.message}`);
      return [];
    }
  }

  public getCurrentCommitSha(): string {
    try {
      return execSync("git rev-parse HEAD", { cwd: this.cwd, encoding: "utf8" }).trim();
    } catch {
      return "0000000";
    }
  }
}
