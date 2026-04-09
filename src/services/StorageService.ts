import * as fs from "fs";
import * as path from "path";
import * as os from "os";

export class StorageService {
  private dataDir: string;

  constructor(dataDirectory?: string) {
    const dir = dataDirectory || "~/.project-pulse";
    this.dataDir = dir.startsWith("~")
      ? path.join(os.homedir(), dir.slice(1))
      : dir;
    this.ensureDataDir();
  }

  private ensureDataDir() {
    fs.mkdirSync(this.dataDir, { recursive: true });
  }

  getHistoryPath(projectId: string): string {
    return path.join(this.dataDir, `${projectId}.json`);
  }

  readHistory(projectId: string): any[] {
    const filePath = this.getHistoryPath(projectId);
    if (!fs.existsSync(filePath)) {
      return [];
    }
    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  appendHistory(projectId: string, entry: any) {
    const history = this.readHistory(projectId);
    history.push(entry);
    fs.writeFileSync(
      this.getHistoryPath(projectId),
      JSON.stringify(history, null, 2),
    );
  }

  deleteHistory(projectId: string) {
    const filePath = this.getHistoryPath(projectId);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  pruneOldEntries(projectId: string, maxAgeDays: number = 30) {
    const history = this.readHistory(projectId);
    const cutoff = Date.now() - maxAgeDays * 24 * 60 * 60 * 1000;
    const filtered = history.filter(
      (entry: any) => new Date(entry.timestamp).getTime() > cutoff,
    );
    fs.writeFileSync(
      this.getHistoryPath(projectId),
      JSON.stringify(filtered, null, 2),
    );
  }
}
