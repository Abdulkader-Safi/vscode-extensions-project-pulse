# Change Log

All notable changes to the "Project Pulse" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [0.0.1] - 2026-04-09

### Added

- Dark-themed dashboard with sidebar navigation and project health cards
- Add Project wizard (3-step: details, monitoring config, review)
- SSL certificate monitoring via Node.js `tls` module (issuer, expiry, chain, protocol)
- DNS resolution checks via `dns.Resolver` with multi-server propagation (Google, Cloudflare, OpenDNS, Quad9)
- Uptime monitoring via `https`/`http` modules with response timing and status codes
- HTTP security headers analysis (HSTS, CSP, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy)
- Dependency security audit via `npm audit` and OSV.dev API
- Lighthouse performance scans via Google PageSpeed Insights API
- Project detail view with per-check panels and manual run controls
- Cross-project overview pages: SSL & DNS Monitor, Uptime & Performance, Security Advisories
- Settings page displaying thresholds, notification preferences, and monitored projects list
- Background monitoring scheduler with configurable intervals (5, 10, 15, 30, 60 min)
- Alert system with VS Code notifications for critical issues (SSL expiry, downtime, vulnerabilities, missing headers)
- Alert history with dismiss functionality
- Project data persistence via `globalState` and local JSON files (`~/.project-pulse/`)
- Configurable extension settings (`projectPulse.*`) for thresholds, check toggles, and data directory
