"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import React, { useState, useEffect, Suspense } from "react";

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

// Lazy imports (sections only load when needed)
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const Trucks = React.lazy(() => import("./pages/Trucks"));
const Financials = React.lazy(() => import("./pages/Financials"));
const Trips = React.lazy(() => import("./pages/Trips"));
const Repairs = React.lazy(() => import("./pages/Repairs"));
const Users = React.lazy(() => import("./pages/Users"));

export default function Page() {
  const [activeSection, setActiveSection] = useState("Dashboard");
  const [loading, setLoading] = useState(false);
  const [sectionToRender, setSectionToRender] = useState("Dashboard");

  // Listen for navigation events
  useEffect(() => {
    const handleNavigate = (event) => {
      setActiveSection(event.detail);
    };
    window.addEventListener("navigateToSection", handleNavigate);
    return () =>
      window.removeEventListener("navigateToSection", handleNavigate);
  }, []);

  // Handle loading delay when switching sections
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setSectionToRender(activeSection);
      setLoading(false);
    }, 6000); // 6 seconds delay
    return () => clearTimeout(timer);
  }, [activeSection]);

  const renderSection = () => {
    switch (sectionToRender) {
      case "Dashboard":
        return <Dashboard />;
      case "Users":
        return <Users />;
      case "Trucks":
        return <Trucks />;
      case "Trips":
        return <Trips />;
      case "Repairs":
        return <Repairs />;
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
      case "Users":
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
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex flex-col items-center gap-2">
                    <div className="loader"></div>
                    <span className="text-muted-foreground !mt-10 text-sm">
                      Loading {activeSection}...
                    </span>
                  </div>
                </div>
              ) : (
                <Suspense
                  fallback={
                    <div className="flex items-center justify-center h-full">
                      <span className="text-muted-foreground text-sm">
                        Preparing {activeSection}...
                      </span>
                    </div>
                  }
                >
                  {renderSection()}
                </Suspense>
              )}
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}
