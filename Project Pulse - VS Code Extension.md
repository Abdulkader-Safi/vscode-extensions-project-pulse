# Project Pulse - VS Code Extension

> Monitor health signals across all your client projects without leaving your editor.

---

## Overview

Project Pulse is a VS Code extension that provides a unified dashboard for monitoring the health of multiple web projects. After inputting a website URL, the extension continuously monitors SSL certificates, DNS resolution, uptime, dependency security, and Lighthouse performance scores, surfacing issues before they become client-facing problems.

---

## Core Features

### 1. SSL Certificate Monitoring

Track certificate expiry, issuer, validity chain, and alert before certificates lapse.

#### Data to Collect

- Issuer (e.g., Let's Encrypt Authority X3, DigiCert, Cloudflare)
- Valid From / Valid To dates
- Days remaining until expiry
- Certificate chain validity
- Subject Alternative Names (SANs)
- Protocol version (TLS 1.2, 1.3)

#### How to Get the Data

**Primary: Node.js `tls` module (built-in, no dependencies)**

```typescript
import * as tls from "tls";

function checkSSL(hostname: string): Promise<SSLResult> {
  return new Promise((resolve, reject) => {
    const socket = tls.connect(443, hostname, { servername: hostname }, () => {
      const cert = socket.getPeerCertificate(true); // true = include full chain
      resolve({
        issuer: cert.issuer?.O,
        validFrom: new Date(cert.valid_from),
        validTo: new Date(cert.valid_to),
        daysRemaining: Math.floor(
          (new Date(cert.valid_to).getTime() - Date.now()) / 86400000
        ),
        subject: cert.subject?.CN,
        altNames: cert.subjectaltname
          ?.split(", ")
          .map((s) => s.replace("DNS:", "")),
        serialNumber: cert.serialNumber,
        fingerprint256: cert.fingerprint256,
        protocol: socket.getProtocol(), // TLSv1.2, TLSv1.3
        chain: cert.issuerCertificate
          ? {
              issuer: cert.issuerCertificate.issuer?.O,
              validTo: cert.issuerCertificate.valid_to,
            }
          : null,
      });
      socket.end();
    });
    socket.on("error", reject);
    socket.setTimeout(10000, () => {
      socket.destroy();
      reject(new Error("SSL check timed out"));
    });
  });
}
```

**Why this approach:**

- Zero external dependencies (tls is a Node.js core module, available in VS Code's extension host)
- Returns the full certificate object including chain, SANs, fingerprint, protocol
- No need for OpenSSL binaries or shell commands
- Works cross-platform (Windows, macOS, Linux)

**Alternative: `node-forge` (for deeper certificate parsing)**

- npm package: `node-forge`
- Useful if you need to parse PEM-encoded certs, validate chains manually, or decode extensions
- Heavier than needed for basic monitoring

**What NOT to use:**

- `openssl s_client` via child_process: requires OpenSSL installed, breaks on Windows, harder to parse
- External APIs (SSL Labs, etc.): adds network dependency, rate limits, slower

---

### 2. DNS Resolution Checks

Monitor DNS propagation, detect record changes, and flag mismatches against expected values.

#### Data to Collect

- A / AAAA records (IPv4, IPv6)
- CNAME records
- MX records (mail)
- NS records (nameservers)
- TXT records (SPF, DKIM, verification)
- TTL values
- Resolution consistency across multiple DNS servers

#### How to Get the Data

**Primary: Node.js `dns` module (built-in, no dependencies)**

```typescript
import * as dns from "dns";
import { Resolver } from "dns";

async function checkDNS(domain: string): Promise<DNSResult> {
  const resolver = new Resolver();
  // Optionally set specific DNS servers for consistency
  // resolver.setServers(['8.8.8.8', '1.1.1.1']);

  const results: DNSResult = {
    a: [],
    aaaa: [],
    cname: [],
    mx: [],
    ns: [],
    txt: [],
  };

  // A records
  try {
    results.a = await resolver.resolve4(domain);
  } catch {}

  // AAAA records (IPv6)
  try {
    results.aaaa = await resolver.resolve6(domain);
  } catch {}

  // CNAME
  try {
    results.cname = await resolver.resolveCname(domain);
  } catch {}

  // MX records
  try {
    results.mx = await resolver.resolveMx(domain);
  } catch {}

  // NS records
  try {
    results.ns = await resolver.resolveNs(domain);
  } catch {}

  // TXT records
  try {
    results.txt = await resolver.resolveTxt(domain);
  } catch {}

  return results;
}
```

**For multi-resolver consistency checks:**

```typescript
async function checkDNSPropagation(domain: string): Promise<PropagationResult> {
  const dnsServers = [
    { name: "Google", ip: "8.8.8.8" },
    { name: "Cloudflare", ip: "1.1.1.1" },
    { name: "OpenDNS", ip: "208.67.222.222" },
    { name: "Quad9", ip: "9.9.9.9" },
  ];

  const results = await Promise.all(
    dnsServers.map(async (server) => {
      const resolver = new Resolver();
      resolver.setServers([server.ip]);
      try {
        const records = await resolver.resolve4(domain);
        return { server: server.name, records, status: "ok" };
      } catch (err) {
        return { server: server.name, records: [], status: "error" };
      }
    })
  );

  // Compare all results to detect propagation issues
  const allIPs = results.map((r) => r.records.sort().join(","));
  const consistent = new Set(allIPs).size <= 1;

  return { results, consistent };
}
```

**Why this approach:**

- `dns.Resolver` is built-in to Node.js
- Can target specific DNS servers (Google, Cloudflare, etc.) to check propagation
- Async/Promise-based, non-blocking
- Returns structured data (no string parsing needed)

**Detecting changes over time:**

- Store the initial DNS snapshot in extension storage (`vscode.ExtensionContext.globalState`)
- On each check, compare current records against stored baseline
- Flag any record that changed (e.g., A record IP changed, CNAME target changed)
- Use `dns.resolve()` with `{ttl: true}` to also capture TTL values

---

### 3. Uptime Monitoring

Ping endpoints at configurable intervals and track response times, status codes, and downtime incidents.

#### Data to Collect

- HTTP status code (200, 301, 403, 500, 502, etc.)
- Response time (ms)
- Uptime percentage (rolling 24h, 7d, 30d)
- Downtime incidents (start time, duration, error type)
- Redirect chain (if any)
- Response headers (server, x-powered-by, cache status)

#### How to Get the Data

**Primary: Node.js `https` module (built-in) with timing**

```typescript
import * as https from "https";
import * as http from "http";

async function checkUptime(url: string): Promise<UptimeResult> {
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
        // Do NOT follow redirects automatically so we can track them
        maxRedirects: 0,
      },
      (res) => {
        const responseTime = Math.round(performance.now() - startTime);
        resolve({
          status: res.statusCode || 0,
          responseTime,
          headers: {
            server: res.headers["server"],
            poweredBy: res.headers["x-powered-by"],
            cacheControl: res.headers["cache-control"],
            contentType: res.headers["content-type"],
          },
          redirectTo: res.headers["location"] || null,
          timestamp: new Date().toISOString(),
          up: (res.statusCode || 0) >= 200 && (res.statusCode || 0) < 400,
        });
        res.resume(); // consume response to free memory
      }
    );

    req.on("error", (err) => {
      resolve({
        status: 0,
        responseTime: Math.round(performance.now() - startTime),
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
        error: "Request timed out",
        timestamp: new Date().toISOString(),
        up: false,
      });
    });
  });
}
```

**For redirect chain tracking:**

```typescript
async function followRedirects(
  url: string,
  maxHops: number = 10
): Promise<RedirectChain> {
  const chain: { url: string; status: number }[] = [];
  let currentUrl = url;

  for (let i = 0; i < maxHops; i++) {
    const result = await checkUptime(currentUrl);
    chain.push({ url: currentUrl, status: result.status });

    if (result.redirectTo && result.status >= 300 && result.status < 400) {
      currentUrl = new URL(result.redirectTo, currentUrl).href;
    } else {
      break;
    }
  }

  return { chain, finalUrl: currentUrl };
}
```

**Scheduling checks inside VS Code:**

```typescript
// Use setInterval in the extension host process
// VS Code extensions run in a long-lived Node.js process
let uptimeInterval: NodeJS.Timeout;

function startUptimeMonitoring(projects: Project[], intervalMs: number) {
  uptimeInterval = setInterval(async () => {
    for (const project of projects) {
      const result = await checkUptime(project.url);
      // Store in globalState, update webview
    }
  }, intervalMs);
}

// Clean up in deactivate()
export function deactivate() {
  if (uptimeInterval) clearInterval(uptimeInterval);
}
```

**Important limitations:**

- Monitoring only runs while VS Code is open
- For persistent 24/7 monitoring, you'd need a companion service (out of scope for v1)
- `setInterval` is fine for 5-15 minute intervals
- Store historical results in `globalState` or a local JSON/SQLite file

---

### 4. Dependency Security Audit

Scan project dependencies for known vulnerabilities using CVE databases.

#### Data to Collect

- Package name and installed version
- Vulnerability severity (Critical, High, Medium, Low)
- CVE identifier
- Description of the vulnerability
- Whether a patched version exists
- Patched version number

#### How to Get the Data

**Primary: npm audit / composer audit via CLI**

For Node.js projects, the most reliable approach is running `npm audit` against the project's `package-lock.json`:

```typescript
import { exec } from "child_process";
import * as path from "path";

async function runNpmAudit(projectPath: string): Promise<AuditResult[]> {
  return new Promise((resolve, reject) => {
    exec(
      "npm audit --json",
      { cwd: projectPath, timeout: 30000 },
      (error, stdout) => {
        // npm audit exits with code 1 if vulnerabilities found, that's expected
        try {
          const audit = JSON.parse(stdout);
          const vulnerabilities: AuditResult[] = [];

          for (const [name, vuln] of Object.entries(
            audit.vulnerabilities || {}
          )) {
            vulnerabilities.push({
              package: name,
              severity: vuln.severity,
              version: vuln.range,
              fixAvailable: vuln.fixAvailable !== false,
              patchedVersion: vuln.fixAvailable?.version || null,
              via: vuln.via
                ?.filter((v) => typeof v === "object")
                .map((v) => ({
                  title: v.title,
                  url: v.url,
                  cve: v.cwe,
                  severity: v.severity,
                })),
            });
          }
          resolve(vulnerabilities);
        } catch {
          reject(new Error("Failed to parse npm audit output"));
        }
      }
    );
  });
}
```

**For PHP/Composer projects (WordPress, Laravel):**

```typescript
async function runComposerAudit(
  projectPath: string
): Promise<AuditResult[]> {
  return new Promise((resolve, reject) => {
    exec(
      "composer audit --format=json",
      { cwd: projectPath, timeout: 30000 },
      (error, stdout) => {
        try {
          const audit = JSON.parse(stdout);
          const vulnerabilities: AuditResult[] = [];

          for (const [name, advisories] of Object.entries(
            audit.advisories || {}
          )) {
            for (const advisory of advisories) {
              vulnerabilities.push({
                package: name,
                severity: advisory.severity || "unknown",
                version: advisory.affectedVersions,
                cve: advisory.cve,
                title: advisory.title,
                link: advisory.link,
              });
            }
          }
          resolve(vulnerabilities);
        } catch {
          reject(new Error("Failed to parse composer audit output"));
        }
      }
    );
  });
}
```

**Alternative: OSV.dev API (free, no auth required)**

For scanning without requiring npm/composer installed locally, or for scanning remote projects:

```
API: https://api.osv.dev/v1/query
Method: POST
No authentication required
Rate limit: generous (suitable for extension use)
```

```typescript
async function queryOSV(
  packageName: string,
  version: string,
  ecosystem: string
): Promise<OSVResult> {
  const response = await fetch("https://api.osv.dev/v1/query", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      package: {
        name: packageName,
        ecosystem: ecosystem, // "npm", "Packagist", "PyPI", etc.
      },
      version: version,
    }),
  });

  const data = await response.json();
  return {
    vulnerabilities: (data.vulns || []).map((v) => ({
      id: v.id,
      summary: v.summary,
      severity: v.database_specific?.severity || "unknown",
      aliases: v.aliases, // CVE numbers
      fixed: v.affected?.[0]?.ranges?.[0]?.events?.find((e) => e.fixed)?.fixed,
      link: `https://osv.dev/vulnerability/${v.id}`,
    })),
  };
}
```

**Batch scanning with OSV (scan entire package-lock.json):**

```
API: https://api.osv.dev/v1/querybatch
Method: POST
```

```typescript
async function batchScanLockfile(
  lockfilePath: string
): Promise<AuditResult[]> {
  const lockfile = JSON.parse(fs.readFileSync(lockfilePath, "utf-8"));
  const queries = [];

  // Parse package-lock.json v3 format
  for (const [name, info] of Object.entries(lockfile.packages || {})) {
    if (name === "") continue; // skip root
    const pkgName = name.replace("node_modules/", "");
    queries.push({
      package: { name: pkgName, ecosystem: "npm" },
      version: info.version,
    });
  }

  const response = await fetch("https://api.osv.dev/v1/querybatch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ queries }),
  });

  const data = await response.json();
  // data.results is an array matching the queries order
  return data.results
    .map((result, i) => ({
      package: queries[i].package.name,
      version: queries[i].version,
      vulnerabilities: result.vulns || [],
    }))
    .filter((r) => r.vulnerabilities.length > 0);
}
```

**Strategy for the extension:**

1. If the project is open locally in VS Code workspace, prefer `npm audit --json` or `composer audit --format=json` (most accurate, uses the actual lockfile)
2. If monitoring a remote project (URL only, no local files), use OSV.dev API with parsed dependency info
3. Store results in extension storage with timestamps to avoid re-scanning on every check

---

### 5. Lighthouse Performance Scans

Run automated Lighthouse audits and track performance, accessibility, best practices, and SEO scores over time.

#### Data to Collect

- Performance score (0-100)
- Accessibility score (0-100)
- Best Practices score (0-100)
- SEO score (0-100)
- Key metrics: FCP, LCP, TBT, CLS, Speed Index
- Failing audits list

#### How to Get the Data

**Primary: Google PageSpeed Insights API (free, 25,000 requests/day)**

```
API: https://www.googleapis.com/pagespeedonline/v5/runPagespeed
Method: GET
Authentication: API key (free from Google Cloud Console)
Rate limit: 25,000 requests/day with API key, 60/min without
```

```typescript
async function runLighthouse(url: string, apiKey: string): Promise<LighthouseResult> {
  const params = new URLSearchParams({
    url: url,
    key: apiKey,
    category: "performance",
    category: "accessibility",
    category: "best-practices",
    category: "seo",
    strategy: "desktop", // or "mobile"
  });

  // Note: URLSearchParams doesn't support duplicate keys well
  // Build the URL manually for multiple categories
  const apiUrl =
    `https://www.googleapis.com/pagespeedonline/v5/runPagespeed` +
    `?url=${encodeURIComponent(url)}` +
    `&key=${apiKey}` +
    `&category=performance` +
    `&category=accessibility` +
    `&category=best-practices` +
    `&category=seo` +
    `&strategy=desktop`;

  const response = await fetch(apiUrl);
  const data = await response.json();

  const categories = data.lighthouseResult?.categories;
  const audits = data.lighthouseResult?.audits;

  return {
    scores: {
      performance: Math.round((categories?.performance?.score || 0) * 100),
      accessibility: Math.round(
        (categories?.accessibility?.score || 0) * 100
      ),
      bestPractices: Math.round(
        (categories?.["best-practices"]?.score || 0) * 100
      ),
      seo: Math.round((categories?.seo?.score || 0) * 100),
    },
    metrics: {
      fcp: audits?.["first-contentful-paint"]?.numericValue,
      lcp: audits?.["largest-contentful-paint"]?.numericValue,
      tbt: audits?.["total-blocking-time"]?.numericValue,
      cls: audits?.["cumulative-layout-shift"]?.numericValue,
      si: audits?.["speed-index"]?.numericValue,
    },
    failingAudits: Object.values(audits || {})
      .filter((a) => a.score !== null && a.score < 0.5)
      .map((a) => ({
        id: a.id,
        title: a.title,
        description: a.description,
        score: a.score,
      })),
    fetchTime: data.lighthouseResult?.fetchTime,
  };
}
```

**Getting an API key:**

1. Go to Google Cloud Console (console.cloud.google.com)
2. Create a project or select existing
3. Enable "PageSpeed Insights API"
4. Create an API key under Credentials
5. Store in VS Code settings (`vscode.workspace.getConfiguration`)

**Alternative: Run Lighthouse locally via `lighthouse` npm package**

```typescript
// This requires Chrome/Chromium installed on the user's machine
// Heavier but gives full control and no API key needed
import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";

async function runLocalLighthouse(url: string): Promise<LighthouseResult> {
  const chrome = await chromeLauncher.launch({ chromeFlags: ["--headless"] });
  const options = {
    logLevel: "error",
    output: "json",
    port: chrome.port,
    onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
  };

  const result = await lighthouse(url, options);
  await chrome.kill();

  return parseResult(result.lhr);
}
```

**Recommended strategy:**

- Default to PageSpeed Insights API (simpler, works everywhere)
- Offer local Lighthouse as an optional "power user" setting
- Cache results aggressively (Lighthouse scans are slow, run max once per hour per project)
- Store historical scores for trend tracking

---

### 6. HTTP Headers Security Check (Bonus Feature)

Analyze response headers for security best practices.

#### Data to Collect

- Strict-Transport-Security (HSTS)
- Content-Security-Policy (CSP)
- X-Content-Type-Options
- X-Frame-Options
- Referrer-Policy
- Permissions-Policy
- X-XSS-Protection (deprecated but still checked)

#### How to Get the Data

**Piggyback on the uptime check (no extra request needed):**

```typescript
async function checkSecurityHeaders(url: string): Promise<SecurityHeadersResult> {
  return new Promise((resolve) => {
    https.get(url, { timeout: 10000 }, (res) => {
      const headers = res.headers;

      const checks = [
        {
          name: "Strict-Transport-Security",
          present: !!headers["strict-transport-security"],
          value: headers["strict-transport-security"],
          severity: "high",
        },
        {
          name: "Content-Security-Policy",
          present: !!headers["content-security-policy"],
          value: headers["content-security-policy"],
          severity: "high",
        },
        {
          name: "X-Content-Type-Options",
          present: headers["x-content-type-options"] === "nosniff",
          value: headers["x-content-type-options"],
          severity: "medium",
        },
        {
          name: "X-Frame-Options",
          present: !!headers["x-frame-options"],
          value: headers["x-frame-options"],
          severity: "medium",
        },
        {
          name: "Referrer-Policy",
          present: !!headers["referrer-policy"],
          value: headers["referrer-policy"],
          severity: "low",
        },
        {
          name: "Permissions-Policy",
          present: !!headers["permissions-policy"],
          value: headers["permissions-policy"],
          severity: "low",
        },
      ];

      const score = Math.round(
        (checks.filter((c) => c.present).length / checks.length) * 100
      );

      resolve({ checks, score });
      res.resume();
    });
  });
}
```

**Why include this:**

- Zero additional network requests (reuse uptime check response headers)
- High value for agency work (client sites often miss security headers)
- Easy to display as a simple checklist with pass/fail indicators

---

## Data Storage Strategy

### Where to Store Data

**VS Code Extension APIs:**

| Storage | Use For | Persistence |
| --- | --- | --- |
| `context.globalState` | Project configs, settings, alert thresholds | Survives restarts, syncs across machines if Settings Sync is on |
| `context.workspaceState` | Workspace-specific overrides | Per-workspace only |
| Local JSON file | Historical monitoring data (uptime logs, score history) | `~/.project-pulse/data/` or configurable |

**Recommended approach:**

```typescript
// Project configs in globalState
const projects = context.globalState.get<Project[]>("projects", []);

// Historical data in a local JSON file (globalState has size limits)
const dataDir = path.join(os.homedir(), ".project-pulse");
fs.mkdirSync(dataDir, { recursive: true });

// Per-project history file
function getHistoryPath(projectId: string): string {
  return path.join(dataDir, `${projectId}.json`);
}
```

### Data Retention

- Keep detailed check results for 30 days
- Keep daily summary snapshots for 1 year
- Auto-prune old data on extension activation

---

## Alert Thresholds (Defaults)

| Check | Warning | Critical |
| --- | --- | --- |
| SSL Expiry | 30 days remaining | 7 days remaining |
| Uptime | Below 99.5% (rolling 7d) | Below 99% or 3+ consecutive failures |
| DNS | Any record change detected | Expected record missing or mismatch |
| Security Vulns | Any High severity | Any Critical severity |
| Lighthouse | Score drops below 80 | Score drops below 50 |
| Security Headers | Score below 70% | Missing HSTS or CSP |

---

## API Summary Table

| Feature | Primary Tool | Auth Required | Rate Limit | Cost |
| --- | --- | --- | --- | --- |
| SSL Check | Node.js `tls` module | No | None (direct connection) | Free |
| DNS Check | Node.js `dns` module | No | None (DNS queries) | Free |
| Uptime Ping | Node.js `https` module | No | None (your own requests) | Free |
| Security Audit (local) | `npm audit` / `composer audit` CLI | No | None | Free |
| Security Audit (remote) | OSV.dev API | No | Generous, undocumented | Free |
| Lighthouse | PageSpeed Insights API | API Key (free) | 25,000/day | Free |
| Lighthouse (local) | `lighthouse` npm package | No | None (local Chrome) | Free |
| Security Headers | Node.js `https` module | No | None (piggybacks uptime) | Free |

---

## MVP Scope (v1)

### Included

- Add/edit/remove projects (URL, name, client, tech stack)
- SSL certificate monitoring with expiry alerts
- DNS resolution checks with change detection
- Uptime monitoring (configurable interval: 5, 10, 15, 30 min)
- Dependency security audit (npm audit for local projects, OSV.dev for remote)
- Lighthouse scores via PageSpeed Insights API
- Security headers analysis
- Dashboard with project health cards
- Project detail view with all checks
- VS Code notification alerts (warning + critical)
- Settings panel for thresholds and notification preferences
- Data stored locally (globalState + JSON files)

### Deferred to v2

- Slack / Discord / Email notification channels
- Team sharing (sync project configs across team members)
- Scheduled reports (weekly digest)
- Custom check endpoints (e.g., `/health` API routes)
- WordPress-specific checks (plugin vulnerabilities, core version)
- Historical trend charts with export
- CLI companion for CI/CD integration
- Badge/status page generation

---

## Extension Settings

```jsonc
{
  // PageSpeed Insights API key
  "projectPulse.lighthouseApiKey": "",

  // Default check interval in minutes
  "projectPulse.checkInterval": 15,

  // SSL expiry warning threshold (days)
  "projectPulse.sslWarningDays": 30,

  // SSL expiry critical threshold (days)
  "projectPulse.sslCriticalDays": 7,

  // Uptime warning threshold (percentage)
  "projectPulse.uptimeWarningThreshold": 99.5,

  // Lighthouse score alert threshold
  "projectPulse.lighthouseAlertThreshold": 80,

  // Enable/disable specific checks globally
  "projectPulse.checks.ssl": true,
  "projectPulse.checks.dns": true,
  "projectPulse.checks.uptime": true,
  "projectPulse.checks.security": true,
  "projectPulse.checks.lighthouse": false, // requires API key
  "projectPulse.checks.headers": true,

  // Data directory path
  "projectPulse.dataDirectory": "~/.project-pulse"
}
```

---

## Project Data Model

```typescript
interface Project {
  id: string; // UUID
  name: string;
  url: string; // https://example.com
  client: string;
  techStack: string[]; // ["next", "react", "node"]
  description: string;
  createdAt: string; // ISO date
  monitoring: {
    ssl: boolean;
    dns: boolean;
    uptime: boolean;
    security: boolean;
    lighthouse: boolean;
    headers: boolean;
    uptimeInterval: number; // minutes
  };
  // Latest check results (cached)
  lastCheck: {
    ssl: SSLResult | null;
    dns: DNSResult | null;
    uptime: UptimeResult | null;
    security: AuditResult[] | null;
    lighthouse: LighthouseResult | null;
    headers: SecurityHeadersResult | null;
    timestamp: string;
  };
  // Overall health status (computed)
  status: "healthy" | "warning" | "critical";
}
```
