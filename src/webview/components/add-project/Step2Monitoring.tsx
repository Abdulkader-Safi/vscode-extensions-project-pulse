import React from "react";
import type { MonitoringConfig } from "../../../types/project";

interface Step2Props {
  data: MonitoringConfig;
  onChange: (data: MonitoringConfig) => void;
}

const toggles: Array<{
  key: keyof Omit<MonitoringConfig, "uptimeInterval">;
  label: string;
  description: string;
}> = [
  {
    key: "ssl",
    label: "SSL Certificate",
    description: "Monitor certificate expiry and chain validity",
  },
  {
    key: "dns",
    label: "DNS Resolution",
    description: "Check DNS propagation and record changes",
  },
  {
    key: "uptime",
    label: "Uptime Monitoring",
    description: "Ping endpoints and track response times",
  },
  {
    key: "security",
    label: "Security Audit",
    description: "Scan dependencies for vulnerabilities",
  },
  {
    key: "lighthouse",
    label: "Lighthouse Scores",
    description: "Track performance and SEO scores (requires API key)",
  },
  {
    key: "headers",
    label: "Security Headers",
    description: "Analyze HTTP security headers",
  },
];

const intervals = [5, 10, 15, 30, 60];

const Step2Monitoring: React.FC<Step2Props> = ({ data, onChange }) => {
  const toggleCheck = (key: keyof Omit<MonitoringConfig, "uptimeInterval">) => {
    onChange({ ...data, [key]: !data[key] });
  };

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        {toggles.map((toggle) => (
          <div
            key={toggle.key}
            className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg"
          >
            <div>
              <div className="text-sm font-medium text-white">
                {toggle.label}
              </div>
              <div className="text-xs text-slate-500">{toggle.description}</div>
            </div>
            <button
              onClick={() => toggleCheck(toggle.key)}
              className={`relative w-10 h-5 rounded-full transition-colors ${
                data[toggle.key] ? "bg-indigo-600" : "bg-slate-700"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                  data[toggle.key] ? "translate-x-5" : ""
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1.5">
          Check Interval
        </label>
        <select
          value={data.uptimeInterval}
          onChange={(e) =>
            onChange({ ...data, uptimeInterval: Number(e.target.value) })
          }
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
        >
          {intervals.map((min) => (
            <option key={min} value={min}>
              Every {min} minutes
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default Step2Monitoring;
