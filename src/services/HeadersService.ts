import * as https from "https";
import type { SecurityHeadersResult, SecurityHeaderCheck } from "../types/project";

export class HeadersService {
  checkHeaders(url: string): Promise<SecurityHeadersResult> {
    return new Promise((resolve) => {
      https.get(url, { timeout: 10000 }, (res) => {
        const headers = res.headers;

        const checks: SecurityHeaderCheck[] = [
          {
            name: "Strict-Transport-Security",
            present: !!headers["strict-transport-security"],
            value: headers["strict-transport-security"] as string | undefined,
            severity: "high",
          },
          {
            name: "Content-Security-Policy",
            present: !!headers["content-security-policy"],
            value: headers["content-security-policy"] as string | undefined,
            severity: "high",
          },
          {
            name: "X-Content-Type-Options",
            present: headers["x-content-type-options"] === "nosniff",
            value: headers["x-content-type-options"] as string | undefined,
            severity: "medium",
          },
          {
            name: "X-Frame-Options",
            present: !!headers["x-frame-options"],
            value: headers["x-frame-options"] as string | undefined,
            severity: "medium",
          },
          {
            name: "Referrer-Policy",
            present: !!headers["referrer-policy"],
            value: headers["referrer-policy"] as string | undefined,
            severity: "low",
          },
          {
            name: "Permissions-Policy",
            present: !!headers["permissions-policy"],
            value: headers["permissions-policy"] as string | undefined,
            severity: "low",
          },
        ];

        const score = Math.round(
          (checks.filter((c) => c.present).length / checks.length) * 100,
        );

        resolve({ checks, score });
        res.resume();
      }).on("error", () => {
        resolve({ checks: [], score: 0 });
      });
    });
  }
}
