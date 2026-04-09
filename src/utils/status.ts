import type { Project, ProjectStatus } from "../types/project";

export function computeProjectStatus(
  project: Project,
  sslWarningDays = 30,
  sslCriticalDays = 7,
): ProjectStatus {
  const { lastCheck } = project;

  if (!lastCheck.timestamp) {
    return "unknown";
  }

  // Check for critical conditions
  if (lastCheck.ssl && lastCheck.ssl.daysRemaining <= sslCriticalDays) {
    return "critical";
  }
  if (lastCheck.uptime && !lastCheck.uptime.up) {
    return "critical";
  }
  if (
    lastCheck.security &&
    lastCheck.security.some((v) => v.severity === "critical")
  ) {
    return "critical";
  }

  // Check for warning conditions
  if (lastCheck.ssl && lastCheck.ssl.daysRemaining <= sslWarningDays) {
    return "warning";
  }
  if (
    lastCheck.security &&
    lastCheck.security.some((v) => v.severity === "high")
  ) {
    return "warning";
  }
  if (lastCheck.headers && lastCheck.headers.score < 70) {
    return "warning";
  }
  if (lastCheck.lighthouse && lastCheck.lighthouse.scores.performance < 80) {
    return "warning";
  }

  return "healthy";
}
