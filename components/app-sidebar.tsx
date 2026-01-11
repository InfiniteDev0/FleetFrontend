"use client";
import * as React from "react";
import { usePathname } from "next/navigation";
import {
  Car,
  FileChartLine,
  LayoutDashboard,
  Route,
  Toolbox,
  Truck,
  UserRound,
  X,
} from "lucide-react";

import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSuperAdmin } from "@/app/context/SuperAdminContext";

const navMain = [
  { title: "Dashboard", icon: LayoutDashboard },
  { title: "Users", icon: UserRound },
  { title: "Trucks", icon: Truck },
  { title: "Trips", icon: Route },
  { title: "Reports", icon: FileChartLine },
];

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { currentUser } = useSuperAdmin();
  const { setOpenMobile, isMobile } = useSidebar();

  const userData = currentUser
    ? {
        name: currentUser.name || "User",
        email: currentUser.email || "",
        avatar: currentUser.avatar || "/avatars/default.jpg",
      }
    : {
        name: "Guest",
        email: "",
        avatar: "/avatars/default.jpg",
      };
  let activePage = "Dashboard";
  const match = pathname.match(/\/client\/super-admin\/?([^\/]*)/);
  if (match && match[1]) {
    activePage = match[1].charAt(0).toUpperCase() + match[1].slice(1);
  }

  const handleClose = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar
      className="top-(--header-height) border-r border-gray-300 dark:border-gray-800 h-[calc(100svh-var(--header-height))] lg:h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      {/* Header - Only visible on mobile */}
      <SidebarHeader className="lg:hidden !px-6 !py-5 bg-background border-b border-border/50">
        <div className="flex items-center justify-between w-full">
          <h2 className="text-xl font-bold tracking-wide text-foreground uppercase">
            Menu
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-8 w-8 rounded-full hover:bg-accent"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent className="!p-4 lg:!p-2 bg-background">
        <SidebarMenu className="!p-0 space-y-2 lg:space-y-1">
          {navMain.map((item) => {
            const href =
              item.title === "Dashboard"
                ? "/client/super-admin"
                : `/client/super-admin/${item.title.toLowerCase()}`;
            const isActive =
              activePage.toLowerCase() === item.title.toLowerCase();

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  className={`flex items-center gap-4 !px-4 !py-3 lg:!py-2 rounded-lg transition-all duration-200
                    hover:bg-accent/80 hover:shadow-sm
                    ${
                      isActive
                        ? "bg-gradient-to-r from-cyan-100 to-cyan-50 dark:from-cyan-900/40 dark:to-cyan-800/20 text-cyan-900 dark:text-cyan-100 border-l-4 border-cyan-500 shadow-sm font-medium"
                        : "text-foreground/80 hover:text-foreground dark:text-gray-300"
                    }`}
                >
                  <Link
                    href={href}
                    className="flex items-center gap-4 w-full h-full"
                    onClick={handleClose}
                  >
                    <item.icon className="size-5 lg:size-5 shrink-0" />
                    <span className="text-base lg:text-sm font-medium">
                      {item.title}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="bg-background border-t border-border/50 !px-4 !py-4 lg:!py-3 backdrop-blur-sm">
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
