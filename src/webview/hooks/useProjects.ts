import { useState, useEffect, useCallback } from "react";
import type { Project } from "../../types/project";
import type { ExtensionMessage } from "../../types/messages";
import { postMessage } from "./useExtensionMessage";

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handler = (event: MessageEvent<ExtensionMessage>) => {
      const msg = event.data;
      switch (msg.type) {
        case "projects":
          setProjects(msg.data);
          setLoading(false);
          break;
        case "projectAdded":
          setProjects((prev) => [...prev, msg.data]);
          break;
        case "projectUpdated":
          setProjects((prev) =>
            prev.map((p) => (p.id === msg.data.id ? msg.data : p)),
          );
          break;
        case "projectDeleted":
          setProjects((prev) => prev.filter((p) => p.id !== msg.projectId));
          break;
      }
    };

    window.addEventListener("message", handler);
    postMessage({ type: "getProjects" });

    return () => window.removeEventListener("message", handler);
  }, []);

  const deleteProject = useCallback((id: string) => {
    postMessage({ type: "deleteProject", projectId: id });
  }, []);

  const refreshAll = useCallback(() => {
    postMessage({ type: "refreshAll" });
  }, []);

  return { projects, loading, deleteProject, refreshAll };
}
