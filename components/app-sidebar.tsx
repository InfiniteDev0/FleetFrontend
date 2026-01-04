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
import Link from "next/link";

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

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  // Determine active page from pathname
  let activePage = "Dashboard";
  const match = pathname.match(/\/client\/super-admin\/?([^\/]*)/);
  if (match && match[1]) {
    activePage = match[1].charAt(0).toUpperCase() + match[1].slice(1);
  }
  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu className="!p-2">
          <SidebarMenuItem>
            <SidebarMenuButton className="hover:bg-transparent" size="lg">
              <div>
                <IconInnerShadowTop className="!size-5" />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Gam Oil</span>
                  <span className="truncate text-xs">Enterprise</span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="!p-2">
        {/* Main Navigation */}
        <SidebarMenu className="!p-2">
          {data.navMain.map((item) => {
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
                  className={`flex items-center gap-2 !p-2 cursor-pointer 
                    hover:bg-accent hover:text-accent-foreground
                    ${
                      isActive
                        ? "bg-foreground text-accent font-bold border-l-8 border-cyan-500"
                        : ""
                    }`}
                >
                  <Link
                    href={href}
                    className="flex items-center gap-2 w-full h-full"
                  >
                    <item.icon className="size-4" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
