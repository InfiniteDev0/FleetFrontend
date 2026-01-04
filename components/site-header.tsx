"use client";

import { Menu, PanelRight } from "lucide-react";
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
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="flex h-14 items-center justify-between !px-4">
        {/* LEFT */}
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8"
            onClick={toggleSidebar}
          >
            <PanelRight className="size-4" />
          </Button>

          <Separator orientation="vertical" className="h-4" />

          <Breadcrumb className="hidden sm:block">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Super Admin Control Panel</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* RIGHT — TIME & DATE */}
        <div className="flex items-center gap-3">
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
      </div>
    </header>
  );
}
