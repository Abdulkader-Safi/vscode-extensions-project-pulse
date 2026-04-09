import React from "react";

interface AddProjectSuccessProps {
  projectName: string;
  onDone: () => void;
}

const AddProjectSuccess: React.FC<AddProjectSuccessProps> = ({
  projectName,
  onDone,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mb-4">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-emerald-400"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-white mb-1">Project Added!</h3>
      <p className="text-sm text-slate-400 mb-6">
        <span className="text-white font-medium">{projectName}</span> has been
        added and monitoring will begin shortly.
      </p>
      <button
        onClick={onDone}
        className="px-6 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-500 transition-colors"
      >
        Done
      </button>
    </div>
  );
};

export default AddProjectSuccess;
