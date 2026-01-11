"use client";
import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/site-header";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// Page icons mapping
import {
  LayoutDashboard,
  UserRound,
  Truck,
  Route,
  Toolbox,
  FileChartLine,
} from "lucide-react";
import { SuperAdminProvider } from "../../context/SuperAdminContext";

const pageIcons = {
  dashboard: LayoutDashboard,
  users: UserRound,
  trucks: Truck,
  trips: Route,
  repairs: Toolbox,
  reports: FileChartLine,
};

export default function Layout({ children }) {
  const pathname = usePathname();
  const pathParts = pathname.split("/").filter(Boolean);
  // pathParts: ["client", "super-admin", "trucks", "KDD-788k"]
  const mainPage = pathParts[2]?.toLowerCase() || "dashboard";
  const subPage = pathParts[3] || null;
  const Icon = pageIcons[mainPage] || LayoutDashboard;
  const isDashboard = mainPage === "dashboard";

  // Header row: shadcn/ui Breadcrumbs
  let headerRow = (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          {mainPage === "dashboard" && !subPage ? (
            <BreadcrumbPage className="text-black text-lg dark:text-white  flex items-center gap-2">
              {React.createElement(Icon, { className: "size-5" })}
              <span>Dashboard</span>
            </BreadcrumbPage>
          ) : (
            <BreadcrumbLink asChild>
              <Link href="/client/super-admin">
                <span className="text-black text-sm dark:text-white  flex items-center gap-2">
                  {React.createElement(Icon, { className: "size-5" })}
                  <span>Dashboard</span>
                </span>
              </Link>
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>
        {mainPage !== "dashboard" && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {!subPage ? (
                <BreadcrumbPage className="text-black dark:text-white font-semibold">
                  {mainPage.charAt(0).toUpperCase() + mainPage.slice(1)}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link
                    href={`/client/super-admin/${mainPage}`}
                    className="text-muted-foreground"
                  >
                    {mainPage.charAt(0).toUpperCase() + mainPage.slice(1)}
                  </Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </>
        )}
        {subPage && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-cyan-500 dark:text-red-500">
                {decodeURIComponent(subPage).replace(/-/g, " ").toUpperCase()}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );

  // Context-aware loading message
  let loadingMessage = `Preparing ${
    mainPage.charAt(0).toUpperCase() + mainPage.slice(1)
  }`;
  if (mainPage === "trucks" && subPage) {
    loadingMessage = `Preparing Truck ${decodeURIComponent(subPage)
      .replace(/-/g, " ")
      .toUpperCase()} details`;
  } else {
    loadingMessage += "...";
  }

  // Only show timer-based loader for main pages (no subPage)
  const [showLoader, setShowLoader] = useState(!subPage);
  useEffect(() => {
    if (!subPage) {
      setShowLoader(true);
      const timer = setTimeout(() => setShowLoader(false), 2000);
      return () => clearTimeout(timer);
    } else {
      setShowLoader(false);
    }
  }, [pathname, subPage]);

  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SuperAdminProvider>
        <SidebarProvider className="flex flex-col">
          <SiteHeader
            activeSection={mainPage.charAt(0).toUpperCase() + mainPage.slice(1)}
          />
          <div className="flex flex-1">
            <AppSidebar />
            <SidebarInset className="flex flex-col flex-1 ">
              {/* Header Row */}
              <div className="!px-4 !py-3 border-b bg-white dark:bg-black flex items-center w-full min-h-[56px]">
                {headerRow}
              </div>
              {/* Main Section */}
              <div className="flex-1 overflow-y-auto px-4 py-6">
                <React.Suspense
                  fallback={
                    <div className="flex items-center justify-center h-full min-h-[300px]">
                      <div className="loader mx-auto"></div>
                      <span className="block w-full text-center text-muted-foreground mt-4 text-sm">
                        {loadingMessage}
                      </span>
                    </div>
                  }
                >
                  {showLoader ? (
                    <div className="flex items-center justify-center h-full min-h-[300px]">
                      <div className="loader mx-auto"></div>
                      <span className="block w-full text-center text-muted-foreground mt-4 text-sm">
                        {loadingMessage}
                      </span>
                    </div>
                  ) : (
                    children
                  )}
                </React.Suspense>
              </div>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </SuperAdminProvider>
    </div>
  );
}
