import { execFile } from "child_process";
import type { AuditResult } from "../types/project";

export class SecurityAuditService {
  runNpmAudit(projectPath: string): Promise<AuditResult[]> {
    return new Promise((resolve, reject) => {
      execFile(
        "npm",
        ["audit", "--json"],
        { cwd: projectPath, timeout: 30000 },
        (error, stdout) => {
          try {
            const audit = JSON.parse(stdout);
            const vulnerabilities: AuditResult[] = [];

            for (const [name, vuln] of Object.entries(
              (audit.vulnerabilities || {}) as Record<string, any>,
            )) {
              vulnerabilities.push({
                package: name,
                severity: vuln.severity || "unknown",
                version: vuln.range || "",
                fixAvailable: vuln.fixAvailable !== false,
                patchedVersion: vuln.fixAvailable?.version || null,
                title: vuln.via
                  ?.filter((v: any) => typeof v === "object")
                  ?.map((v: any) => v.title)?.[0],
                url: vuln.via
                  ?.filter((v: any) => typeof v === "object")
                  ?.map((v: any) => v.url)?.[0],
              });
            }
            resolve(vulnerabilities);
          } catch {
            reject(new Error("Failed to parse npm audit output"));
          }
        },
      );
    });
  }

  async queryOSV(
    packageName: string,
    version: string,
    ecosystem: string = "npm",
  ): Promise<AuditResult[]> {
    const response = await fetch("https://api.osv.dev/v1/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        package: { name: packageName, ecosystem },
        version,
      }),
    });

    const data = await response.json();
    return (data.vulns || []).map((v: any) => ({
      package: packageName,
      severity: v.database_specific?.severity || "unknown",
      version,
      fixAvailable:
        !!v.affected?.[0]?.ranges?.[0]?.events?.find((e: any) => e.fixed),
      patchedVersion:
        v.affected?.[0]?.ranges?.[0]?.events?.find((e: any) => e.fixed)
          ?.fixed || null,
      title: v.summary || v.id,
      url: `https://osv.dev/vulnerability/${v.id}`,
      cve: v.aliases?.find((a: string) => a.startsWith("CVE-")) || v.id,
    }));
  }
}
