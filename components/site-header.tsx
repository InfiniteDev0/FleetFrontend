"use client";

import { Menu, MenuIcon, PanelRight } from "lucide-react";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSidebar } from "@/components/ui/sidebar";
import { ThemeToggle } from "./ThemeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useSuperAdmin } from "@/app/client/super-admin/context/SuperAdminContext";

function getBreadcrumbs(pathname: string) {
  const parts = pathname.split("/").filter(Boolean).slice(1);

  return parts.map((part) =>
    part.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  );
}

export function SiteHeader({ activeSection }: { activeSection?: string }) {
  const { toggleSidebar } = useSidebar();
  const pathname = usePathname();
  const breadcrumbs = getBreadcrumbs(pathname);
  const { currentUser } = useSuperAdmin();

  const user = currentUser
    ? {
        name: currentUser.name || "User",
        email: currentUser.email || "",
        avatar:
          currentUser.avatar ||
          "https://galaxypfp.com/wp-content/uploads/2025/10/discord-zenitsu-pfp.webp",
      }
    : {
        name: "Guest",
        email: "",
        avatar:
          "https://galaxypfp.com/wp-content/uploads/2025/10/discord-zenitsu-pfp.webp",
      };

  // ✅ Initialize with new Date to avoid null errors
  const [now, setNow] = useState<Date>(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white dark:bg-black border-gray-300 dark:border-gray-800 bg-background">
      <div className="flex h-14 items-center justify-between !px-4">
        {/* LEFT */}
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8 hidden md:flex"
            onClick={toggleSidebar}
          >
            <PanelRight className="size-4" />
          </Button>

          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8  md:hidden"
            onClick={toggleSidebar}
          >
            <MenuIcon className="size-4" />
          </Button>

          <Separator orientation="vertical" className="h-4" />

          <div>
            <div className="flex items-center gap-4">
              <Avatar className="h-8 w-8 rounded-md">
                <AvatarImage
                  src={
                    "https://galaxypfp.com/wp-content/uploads/2025/10/discord-zenitsu-pfp.webp"
                  }
                />
                <AvatarFallback className="rounded-lg">
                  {user.name?.[0] ?? "?"}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {user.email}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — TIME & DATE */}
        <div className=" hidden md:flex items-center gap-3">
          <div className="flex flex-col items-end leading-none select-none">
            {mounted && (
              <span
                className="
                    text-3xl font-semibold tracking-tight bg-clip-text text-transparent
                    bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600
                    dark:from-pink-400 dark:via-rose-500 dark:to-red-600"
              >
                {formatTime(now)}
              </span>
            )}
          </div>
          <ThemeToggle />
        </div>
        <div className="md:hidden">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
