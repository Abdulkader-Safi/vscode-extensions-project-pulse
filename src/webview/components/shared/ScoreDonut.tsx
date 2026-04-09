import React from "react";

interface ScoreDonutProps {
  score: number;
  label: string;
  size?: number;
}

const ScoreDonut: React.FC<ScoreDonutProps> = ({
  score,
  label,
  size = 80,
}) => {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color =
    score >= 90
      ? "#34d399"
      : score >= 50
        ? "#fbbf24"
        : "#f87171";

  return (
    <div className="flex flex-col items-center gap-1.5">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1e293b"
          strokeWidth="4"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div
        className="absolute flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <span className="text-lg font-bold text-white">{score}</span>
      </div>
      <span className="text-xs text-slate-400 text-center">{label}</span>
    </div>
  );
};

export default ScoreDonut;
