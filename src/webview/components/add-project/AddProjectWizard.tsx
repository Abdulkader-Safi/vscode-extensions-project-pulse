import React, { useState } from "react";
import Modal from "../shared/Modal";
import Step1ProjectInfo, { type ProjectInfoData } from "./Step1ProjectInfo";
import Step2Monitoring from "./Step2Monitoring";
import Step3Review from "./Step3Review";
import AddProjectSuccess from "./AddProjectSuccess";
import { DEFAULT_MONITORING } from "../../../types/project";
import type { MonitoringConfig } from "../../../types/project";
import { postMessage } from "../../hooks/useExtensionMessage";

interface AddProjectWizardProps {
  open: boolean;
  onClose: () => void;
}

const STEPS = ["Details", "Monitoring", "Review"];

const AddProjectWizard: React.FC<AddProjectWizardProps> = ({
  open,
  onClose,
}) => {
  const [step, setStep] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [info, setInfo] = useState<ProjectInfoData>({
    name: "",
    url: "",
    client: "",
    techStack: "",
    description: "",
  });
  const [monitoring, setMonitoring] =
    useState<MonitoringConfig>(DEFAULT_MONITORING);

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      // Submit
      postMessage({
        type: "addProject",
        project: {
          name: info.name,
          url: `https://${info.url}`,
          client: info.client,
          techStack: info.techStack
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          description: info.description,
          monitoring,
        },
      });
      setShowSuccess(true);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleDone = () => {
    setShowSuccess(false);
    setStep(0);
    setInfo({ name: "", url: "", client: "", techStack: "", description: "" });
    setMonitoring(DEFAULT_MONITORING);
    onClose();
  };

  const canProceed =
    step === 0 ? info.name.trim() !== "" && info.url.trim() !== "" : true;

  return (
    <Modal open={open} onClose={handleDone}>
      {showSuccess ? (
        <div className="p-6">
          <AddProjectSuccess projectName={info.name} onDone={handleDone} />
        </div>
      ) : (
        <div className="p-6">
          {/* Step indicators */}
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>
              Step {step + 1} of {STEPS.length}
            </span>
            <div className="flex gap-1 ml-auto">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i <= step ? "bg-indigo-500" : "bg-slate-700"
                  }`}
                />
              ))}
            </div>
          </div>

          <h2 className="text-lg font-semibold text-white mt-2">
            Add New Project
          </h2>
          <p className="text-sm text-slate-400 mb-5">
            {step === 0 && "Enter project details to start monitoring"}
            {step === 1 && "Configure which checks to run"}
            {step === 2 && "Review and confirm your settings"}
          </p>

          {/* Step content */}
          {step === 0 && <Step1ProjectInfo data={info} onChange={setInfo} />}
          {step === 1 && (
            <Step2Monitoring data={monitoring} onChange={setMonitoring} />
          )}
          {step === 2 && <Step3Review info={info} monitoring={monitoring} />}

          {/* Actions */}
          <div className="flex justify-between mt-6">
            <button
              onClick={step === 0 ? handleDone : handleBack}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
            >
              {step === 0 ? "Cancel" : "Back"}
            </button>
            <button
              onClick={handleNext}
              disabled={!canProceed}
              className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {step === 2 ? "Add Project" : "Next: Monitoring Setup"}
              {step < 2 && (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              )}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default AddProjectWizard;
