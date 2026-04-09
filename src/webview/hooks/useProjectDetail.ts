import { useState, useEffect, useCallback } from "react";
import type { Project } from "../../types/project";
import type { ExtensionMessage, CheckType } from "../../types/messages";
import { postMessage } from "./useExtensionMessage";

export function useProjectDetail(projectId: string) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [runningChecks, setRunningChecks] = useState<Set<CheckType>>(new Set());

  useEffect(() => {
    const handler = (event: MessageEvent<ExtensionMessage>) => {
      const msg = event.data;
      switch (msg.type) {
        case "project":
          if (msg.data.id === projectId) {
            setProject(msg.data);
            setLoading(false);
          }
          break;
        case "projectUpdated":
          if (msg.data.id === projectId) {
            setProject(msg.data);
          }
          break;
        case "checkStarted":
          if (msg.projectId === projectId) {
            setRunningChecks((prev) => new Set(prev).add(msg.check));
          }
          break;
        case "checkResult":
          if (msg.projectId === projectId) {
            setRunningChecks((prev) => {
              const next = new Set(prev);
              next.delete(msg.check);
              return next;
            });
          }
          break;
        case "checkError":
          if (msg.projectId === projectId) {
            setRunningChecks((prev) => {
              const next = new Set(prev);
              next.delete(msg.check);
              return next;
            });
          }
          break;
      }
    };

    window.addEventListener("message", handler);
    postMessage({ type: "getProject", projectId });

    return () => window.removeEventListener("message", handler);
  }, [projectId]);

  const runCheck = useCallback(
    (check: CheckType) => {
      postMessage({ type: "runCheck", projectId, check });
    },
    [projectId],
  );

  const runAllChecks = useCallback(() => {
    postMessage({ type: "runAllChecks", projectId });
  }, [projectId]);

  return { project, loading, runningChecks, runCheck, runAllChecks };
}
