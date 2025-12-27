"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import React, { useEffect, useState } from "react";

// Import your section components
import Dashboard from "./pages/Dashboard";
import Admins from "./pages/Admins";
import Trucks from "./pages/Trucks";
import Operators from "./pages/Operators";
import Financials from "./pages/Financials";
import Trips from "./pages/Trips";
import Repairs from "./pages/Repairs";

import {
  LayoutDashboard,
  Truck,
  User2Icon,
  UserIcon,
  Banknote,
  ToolCase,
} from "lucide-react";
import { Calendar28 } from "@/components/Calender28";

export const iframeHeight = "800px";
export const description = "A sidebar with a header and a search form.";

export default function Page() {
  const [activeSection, setActiveSection] = useState("Dashboard");

  // Listen for navigation events
  React.useEffect(() => {
    const handleNavigate = (event) => {
      setActiveSection(event.detail);
    };
    window.addEventListener("navigateToSection", handleNavigate);
    return () =>
      window.removeEventListener("navigateToSection", handleNavigate);
  }, []);

  const renderSection = () => {
    switch (activeSection) {
      case "Dashboard":
        return <Dashboard />;
      case "Admins":
        return <Admins />;
      case "Trucks":
        return <Trucks />;
      case "Trips":
        return <Trips />;
      case "Repairs":
        return <Repairs />;
      case "Operators":
        return <Operators />;
      case "Financials":
        return <Financials />;
      default:
        return <Dashboard />;
    }
  };

  const renderSectionIcon = () => {
    switch (activeSection) {
      case "Dashboard":
        return LayoutDashboard;
      case "Admins":
        return UserIcon;
      case "Trucks":
        return Truck;
      case "Repairs":
        return ToolCase;
      case "Operators":
        return User2Icon;
      case "Financials":
        return Banknote;
      default:
        return LayoutDashboard;
    }
  };

  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader activeSection={activeSection} />
        <div className="flex flex-1">
          <AppSidebar
            activeSection={activeSection}
            SetActiveSection={setActiveSection}
          />
          <SidebarInset className="flex flex-col flex-1 bg-background">
            {/* Header Row */}
            <div className="!px-4 !py-2 flex items-center justify-between border-b border-accent w-full">
              <div className="flex items-center gap-2">
                {React.createElement(renderSectionIcon(), {
                  className: "size-5",
                })}
                <span className="font-semibold">{activeSection}</span>
              </div>
              <Calendar28 />
            </div>
            {/* Main Section */}
            <div className="flex-1 overflow-y-auto px-4 py-6">
              {renderSection()}
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}
