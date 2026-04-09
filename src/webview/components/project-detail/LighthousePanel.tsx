import React from "react";
import type { LighthouseResult } from "../../../types/project";
import Card from "../shared/Card";
import ScoreDonut from "../shared/ScoreDonut";

interface LighthousePanelProps {
  lighthouse: LighthouseResult | null;
  onRunCheck: () => void;
  isRunning: boolean;
}

const LighthousePanel: React.FC<LighthousePanelProps> = ({
  lighthouse,
  onRunCheck,
  isRunning,
}) => {
  return (
    <Card className="lg:col-span-2">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-purple-400"
          >
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          <h3 className="text-sm font-semibold text-white">
            Lighthouse Scores
          </h3>
        </div>
        <button
          onClick={onRunCheck}
          disabled={isRunning}
          className="text-xs text-slate-400 hover:text-white transition-colors disabled:opacity-50"
        >
          {isRunning ? "Scanning..." : "Run Scan"}
        </button>
      </div>

      {lighthouse ? (
        <div className="space-y-4">
          <div className="flex justify-around">
            <div className="relative">
              <ScoreDonut
                score={lighthouse.scores.performance}
                label="Performance"
              />
            </div>
            <div className="relative">
              <ScoreDonut
                score={lighthouse.scores.accessibility}
                label="Accessibility"
              />
            </div>
            <div className="relative">
              <ScoreDonut
                score={lighthouse.scores.bestPractices}
                label="Best Practices"
              />
            </div>
            <div className="relative">
              <ScoreDonut score={lighthouse.scores.seo} label="SEO" />
            </div>
          </div>

          <div className="grid grid-cols-5 gap-3 pt-3 border-t border-slate-800">
            <MetricItem
              label="FCP"
              value={
                lighthouse.metrics.fcp
                  ? `${(lighthouse.metrics.fcp / 1000).toFixed(1)}s`
                  : "-"
              }
            />
            <MetricItem
              label="LCP"
              value={
                lighthouse.metrics.lcp
                  ? `${(lighthouse.metrics.lcp / 1000).toFixed(1)}s`
                  : "-"
              }
            />
            <MetricItem
              label="TBT"
              value={
                lighthouse.metrics.tbt
                  ? `${Math.round(lighthouse.metrics.tbt)}ms`
                  : "-"
              }
            />
            <MetricItem
              label="CLS"
              value={
                lighthouse.metrics.cls
                  ? lighthouse.metrics.cls.toFixed(3)
                  : "-"
              }
            />
            <MetricItem
              label="SI"
              value={
                lighthouse.metrics.si
                  ? `${(lighthouse.metrics.si / 1000).toFixed(1)}s`
                  : "-"
              }
            />
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-500">
          No Lighthouse data yet. Configure your API key in settings and run a
          scan.
        </p>
      )}
    </Card>
  );
};

const MetricItem: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div className="text-center">
    <div className="text-xs text-slate-500">{label}</div>
    <div className="text-sm font-medium text-slate-300">{value}</div>
  </div>
);

export default LighthousePanel;
