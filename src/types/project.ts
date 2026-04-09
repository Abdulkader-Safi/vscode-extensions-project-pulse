export interface Project {
  id: string;
  name: string;
  url: string;
  client: string;
  techStack: string[];
  description: string;
  createdAt: string;
  monitoring: MonitoringConfig;
  lastCheck: LastCheckResults;
  status: ProjectStatus;
}

export type ProjectStatus = "healthy" | "warning" | "critical" | "unknown";

export interface MonitoringConfig {
  ssl: boolean;
  dns: boolean;
  uptime: boolean;
  security: boolean;
  lighthouse: boolean;
  headers: boolean;
  uptimeInterval: number; // minutes
}

export interface LastCheckResults {
  ssl: SSLResult | null;
  dns: DNSResult | null;
  uptime: UptimeResult | null;
  security: AuditResult[] | null;
  lighthouse: LighthouseResult | null;
  headers: SecurityHeadersResult | null;
  timestamp: string | null;
}

export interface SSLResult {
  issuer: string;
  validFrom: string;
  validTo: string;
  daysRemaining: number;
  subject: string;
  altNames: string[];
  serialNumber: string;
  fingerprint256: string;
  protocol: string;
  chain: { issuer: string; validTo: string } | null;
}

export interface DNSResult {
  a: string[];
  aaaa: string[];
  cname: string[];
  mx: Array<{ exchange: string; priority: number }>;
  ns: string[];
  txt: string[][];
}

export interface DNSPropagationResult {
  results: Array<{
    server: string;
    records: string[];
    status: "ok" | "error";
  }>;
  consistent: boolean;
}

export interface UptimeResult {
  status: number;
  responseTime: number;
  headers: {
    server?: string;
    poweredBy?: string;
    cacheControl?: string;
    contentType?: string;
  };
  redirectTo: string | null;
  timestamp: string;
  up: boolean;
  error?: string;
}

export interface AuditResult {
  package: string;
  severity: "critical" | "high" | "medium" | "low" | "unknown";
  version: string;
  fixAvailable: boolean;
  patchedVersion: string | null;
  title?: string;
  url?: string;
  cve?: string;
}

export interface LighthouseResult {
  scores: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
  };
  metrics: {
    fcp: number | null;
    lcp: number | null;
    tbt: number | null;
    cls: number | null;
    si: number | null;
  };
  failingAudits: Array<{
    id: string;
    title: string;
    description: string;
    score: number;
  }>;
  fetchTime: string;
}

export interface SecurityHeaderCheck {
  name: string;
  present: boolean;
  value: string | undefined;
  severity: "high" | "medium" | "low";
}

export interface SecurityHeadersResult {
  checks: SecurityHeaderCheck[];
  score: number;
}

export interface Alert {
  id: string;
  projectId: string;
  projectName: string;
  type: "ssl" | "dns" | "uptime" | "security" | "lighthouse" | "headers";
  severity: "warning" | "critical";
  message: string;
  timestamp: string;
  dismissed: boolean;
}

export interface Settings {
  lighthouseApiKey: string;
  checkInterval: number;
  sslWarningDays: number;
  sslCriticalDays: number;
  uptimeWarningThreshold: number;
  lighthouseAlertThreshold: number;
  checks: {
    ssl: boolean;
    dns: boolean;
    uptime: boolean;
    security: boolean;
    lighthouse: boolean;
    headers: boolean;
  };
  dataDirectory: string;
}

export const DEFAULT_SETTINGS: Settings = {
  lighthouseApiKey: "",
  checkInterval: 15,
  sslWarningDays: 30,
  sslCriticalDays: 7,
  uptimeWarningThreshold: 99.5,
  lighthouseAlertThreshold: 80,
  checks: {
    ssl: true,
    dns: true,
    uptime: true,
    security: true,
    lighthouse: false,
    headers: true,
  },
  dataDirectory: "~/.project-pulse",
};

export const DEFAULT_MONITORING: MonitoringConfig = {
  ssl: true,
  dns: true,
  uptime: true,
  security: true,
  lighthouse: false,
  headers: true,
  uptimeInterval: 15,
};
