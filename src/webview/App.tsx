import React, { useState } from "react";
import Layout from "./components/layout/Layout";
import type { SidebarPage } from "./components/layout/Sidebar";
import DashboardPage from "./pages/DashboardPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import SSLDNSPage from "./pages/SSLDNSPage";
import SecurityPage from "./pages/SecurityPage";
import UptimePerformancePage from "./pages/UptimePerformancePage";
import SettingsPage from "./pages/SettingsPage";

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<SidebarPage>("dashboard");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );

  const handleNavigate = (page: SidebarPage) => {
    setActivePage(page);
    setSelectedProjectId(null);
  };

  const handleBackToDashboard = () => {
    setSelectedProjectId(null);
    setActivePage("dashboard");
  };

  const renderPage = () => {
    if (selectedProjectId) {
      return (
        <ProjectDetailPage
          projectId={selectedProjectId}
          onBack={handleBackToDashboard}
        />
      );
    }

    switch (activePage) {
      case "dashboard":
        return (
          <DashboardPage onProjectClick={(id) => setSelectedProjectId(id)} />
        );
      case "ssl-dns":
        return <SSLDNSPage />;
      case "uptime":
        return <UptimePerformancePage />;
      case "security":
        return <SecurityPage />;
      case "settings":
        return <SettingsPage />;
      default:
        return (
          <DashboardPage onProjectClick={(id) => setSelectedProjectId(id)} />
        );
    }
  };

  return (
    <Layout activePage={activePage} onNavigate={handleNavigate}>
      {renderPage()}
    </Layout>
  );
};

export default App;
