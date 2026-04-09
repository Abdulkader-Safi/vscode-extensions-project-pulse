import React from "react";
import TopBar from "../components/layout/TopBar";
import ProjectHeader from "../components/project-detail/ProjectHeader";
import SSLPanel from "../components/project-detail/SSLPanel";
import DNSPanel from "../components/project-detail/DNSPanel";
import UptimePanel from "../components/project-detail/UptimePanel";
import HeadersPanel from "../components/project-detail/HeadersPanel";
import SecurityPanel from "../components/project-detail/SecurityPanel";
import LighthousePanel from "../components/project-detail/LighthousePanel";
import { useProjectDetail } from "../hooks/useProjectDetail";

interface ProjectDetailPageProps {
  projectId: string;
  onBack: () => void;
}

const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({
  projectId,
  onBack,
}) => {
  const { project, loading, runningChecks, runCheck, runAllChecks } =
    useProjectDetail(projectId);

  if (loading || !project) {
    return (
      <>
        <TopBar
          title="Loading..."
          breadcrumbs={[
            { label: "Dashboard", onClick: onBack },
            { label: "Project" },
          ]}
        />
        <div className="flex-1 flex items-center justify-center text-slate-500">
          Loading project...
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar
        title={project.name}
        subtitle={project.url}
        breadcrumbs={[
          { label: "Dashboard", onClick: onBack },
          { label: project.client || project.name },
        ]}
        actions={
          <button
            onClick={runAllChecks}
            className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs font-medium rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-1.5"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            Run All Checks
          </button>
        }
      />
      <div className="flex-1 overflow-y-auto p-6">
        <ProjectHeader project={project} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SSLPanel
            ssl={project.lastCheck.ssl}
            onRunCheck={() => runCheck("ssl")}
            isRunning={runningChecks.has("ssl")}
          />
          <DNSPanel
            dns={project.lastCheck.dns}
            onRunCheck={() => runCheck("dns")}
            isRunning={runningChecks.has("dns")}
          />
          <UptimePanel
            uptime={project.lastCheck.uptime}
            onRunCheck={() => runCheck("uptime")}
            isRunning={runningChecks.has("uptime")}
          />
          <HeadersPanel
            headers={project.lastCheck.headers}
            onRunCheck={() => runCheck("headers")}
            isRunning={runningChecks.has("headers")}
          />
          <SecurityPanel
            security={project.lastCheck.security}
            onRunCheck={() => runCheck("security")}
            isRunning={runningChecks.has("security")}
          />
          <LighthousePanel
            lighthouse={project.lastCheck.lighthouse}
            onRunCheck={() => runCheck("lighthouse")}
            isRunning={runningChecks.has("lighthouse")}
          />
        </div>
      </div>
    </>
  );
};

export default ProjectDetailPage;
