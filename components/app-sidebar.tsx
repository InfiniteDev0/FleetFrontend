"use client";
import * as React from "react";
import {
  FileChartLine,
  LayoutDashboard,
  Route,
  Toolbox,
  Truck,
  UserRound,
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
} from "@/components/ui/sidebar";
import { IconInnerShadowTop } from "@tabler/icons-react";

const data = {
  user: {
    name: "Super Admin",
    email: "superadmin@fleet.com",
    avatar: "/avatars/super-admin.jpg",
  },

  navMain: [
    { title: "Dashboard", icon: LayoutDashboard },
    { title: "Users", icon: UserRound },
    { title: "Trucks", icon: Truck },
    { title: "Trips", icon: Route },
    { title: "Repairs", icon: Toolbox },
    { title: "Reports", icon: FileChartLine },
  ],
};

export function AppSidebar({
  activeSection,
  SetActiveSection,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  activeSection: string;
  SetActiveSection: (section: string) => void;
}) {
  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu className="!p-2">
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Gam Oil</span>
                  <span className="truncate text-xs">Enterprise</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="!p-2">
        {/* Main Navigation */}
        <SidebarMenu className="!p-2">
          {data.navMain.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                onClick={() => SetActiveSection(item.title)}
                className={`flex items-center gap-2 !p-2 cursor-pointer 
                  hover:bg-accent hover:text-accent-foreground
                  ${
                    activeSection === item.title
                      ? "bg-accent-foreground text-accent"
                      : ""
                  }`}
              >
                <item.icon className="size-4" />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
