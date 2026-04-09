import React from "react";
import Sidebar, { type SidebarPage } from "./Sidebar";

interface LayoutProps {
  activePage: SidebarPage;
  onNavigate: (page: SidebarPage) => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({
  activePage,
  onNavigate,
  children,
}) => {
  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      <Sidebar activePage={activePage} onNavigate={onNavigate} />
      <div className="flex-1 flex flex-col overflow-hidden">{children}</div>
    </div>
  );
};

export default Layout;
