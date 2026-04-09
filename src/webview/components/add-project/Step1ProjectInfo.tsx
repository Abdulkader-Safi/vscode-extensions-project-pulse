import React from "react";

export interface ProjectInfoData {
  name: string;
  url: string;
  client: string;
  techStack: string;
  description: string;
}

interface Step1Props {
  data: ProjectInfoData;
  onChange: (data: ProjectInfoData) => void;
}

const Step1ProjectInfo: React.FC<Step1Props> = ({ data, onChange }) => {
  const update = (field: keyof ProjectInfoData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1.5">
          Project Name
        </label>
        <input
          type="text"
          value={data.name}
          onChange={(e) => update("name", e.target.value)}
          placeholder="Enter project name"
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1.5">
          Domain URL
        </label>
        <div className="flex">
          <span className="inline-flex items-center px-3 bg-slate-700 border border-r-0 border-slate-700 rounded-l-lg text-xs text-slate-400">
            https://
          </span>
          <input
            type="text"
            value={data.url}
            onChange={(e) => update("url", e.target.value)}
            placeholder="example.com"
            className="flex-1 bg-slate-800 border border-slate-700 rounded-r-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1.5">
          Client Name
        </label>
        <input
          type="text"
          value={data.client}
          onChange={(e) => update("client", e.target.value)}
          placeholder="Enter client name"
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1.5">
          Tech Stack
        </label>
        <input
          type="text"
          value={data.techStack}
          onChange={(e) => update("techStack", e.target.value)}
          placeholder="next, dotnet, react..."
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1.5">
          Description
        </label>
        <textarea
          value={data.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="Describe the project and what to monitor..."
          rows={3}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
        />
      </div>
    </div>
  );
};

export default Step1ProjectInfo;
