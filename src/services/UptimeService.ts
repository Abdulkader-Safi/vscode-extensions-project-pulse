import * as https from "https";
import * as http from "http";
import type { UptimeResult } from "../types/project";

export class UptimeService {
  checkUptime(url: string): Promise<UptimeResult> {
    const startTime = performance.now();
    const parsedUrl = new URL(url);
    const client = parsedUrl.protocol === "https:" ? https : http;

    return new Promise((resolve) => {
      const req = client.get(
        url,
        {
          timeout: 15000,
          headers: {
            "User-Agent": "ProjectPulse/1.0 (VS Code Health Monitor)",
          },
        },
        (res) => {
          const responseTime = Math.round(performance.now() - startTime);
          resolve({
            status: res.statusCode || 0,
            responseTime,
            headers: {
              server: res.headers["server"] as string | undefined,
              poweredBy: res.headers["x-powered-by"] as string | undefined,
              cacheControl: res.headers["cache-control"] as string | undefined,
              contentType: res.headers["content-type"] as string | undefined,
            },
            redirectTo: (res.headers["location"] as string) || null,
            timestamp: new Date().toISOString(),
            up: (res.statusCode || 0) >= 200 && (res.statusCode || 0) < 400,
          });
          res.resume();
        },
      );

      req.on("error", (err) => {
        resolve({
          status: 0,
          responseTime: Math.round(performance.now() - startTime),
          headers: {},
          redirectTo: null,
          error: err.message,
          timestamp: new Date().toISOString(),
          up: false,
        });
      });

      req.on("timeout", () => {
        req.destroy();
        resolve({
          status: 0,
          responseTime: 15000,
          headers: {},
          redirectTo: null,
          error: "Request timed out",
          timestamp: new Date().toISOString(),
          up: false,
        });
      });
    });
  }
}
