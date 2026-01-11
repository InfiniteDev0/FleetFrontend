"use client";
import React, { useState, useMemo } from "react";
// import { Card } from "@/components/ui/card";
// Responsive hook
function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 768);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return isMobile;
}
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
// import Link from "next/link";
// import { ... } from "@/components/ui/alert-dialog";
import { DeleteTripDialog } from "@/components/trips-listCards";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { IconPlus, IconRefresh } from "@tabler/icons-react";
import { toast } from "sonner";
import { useSuperAdmin } from "../../../context/SuperAdminContext";
// import { Badge } from "@/components/ui/badge";

const DataTable = dynamic(
  () =>
    import("@/components/trips-data-table").then((mod) => ({
      default: mod.DataTable,
    })),
  {
    loading: () => (
      <div className="flex flex-col items-center gap-2">
        <div className="loader" />
        <span className="text-muted-foreground mt-4 text-sm">
          Loading trips table...
        </span>
      </div>
    ),
    ssr: false,
  }
);

const TripsListCards = dynamic(() => import("@/components/trips-listCards"), {
  loading: () => (
    <div className="flex flex-col items-center gap-2">
      <div className="loader" />
      <span className="text-muted-foreground mt-4 text-sm">
        Loading trips cards...
      </span>
    </div>
  ),
  ssr: false,
});

const TripCreateForm = dynamic(() => import("./forms/CreateTripForm"), {
  loading: () => (
    <div className="flex items-center justify-center p-8">
      <div className="loader"></div>
    </div>
  ),
  ssr: false,
});

export default function Trips() {
  const isMobile = useIsMobile();
  const {
    trips = [],
    trucks = [],
    users = [],
    fetchTrips,
    loading,
  } = useSuperAdmin();
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  // Date filter: 'all', 'today', 'week', 'month', 'year'
  const [dateFilter, setDateFilter] = useState("week");
  // Single dialog state for delete, stores trip id or null
  // For mobile: close dialog when trip is created
  const [shouldCloseMobileDialog, setShouldCloseMobileDialog] = useState(false);

  // Automatically fetch trips on initial mount
  React.useEffect(() => {
    if (fetchTrips) fetchTrips();
    // Only runs once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (fetchTrips) await fetchTrips();
      toast.success("Trips refreshed");
    } catch (err) {
      toast.error(err?.message || "Failed to refresh trips");
    } finally {
      setRefreshing(false);
    }
  };

  // Use provider trips directly (no demo/mock fallback)

  const filteredTrips = useMemo(() => {
    const sourceTrips = trips || [];
    const s = String(search || "")
      .trim()
      .toLowerCase();
    // Helper to check if a date is in the current week
    function isThisWeek(date) {
      const today = new Date();
      const first = today.getDate() - today.getDay();
      const last = first + 6;
      const firstDay = new Date(today.setDate(first));
      firstDay.setHours(0, 0, 0, 0);
      const lastDay = new Date(today.setDate(last));
      lastDay.setHours(23, 59, 59, 999);
      return date >= firstDay && date <= lastDay;
    }
    function isThisMonth(date) {
      const today = new Date();
      return (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth()
      );
    }
    function isThisYear(date) {
      const today = new Date();
      return date.getFullYear() === today.getFullYear();
    }
    function isToday(date) {
      const today = new Date();
      return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      );
    }
    return sourceTrips.filter((t) => {
      if (status !== "all" && status) {
        if (t.status !== status) return false;
      }
      if (dateFilter !== "all") {
        const start = t.startTime ? new Date(t.startTime) : null;
        if (!start) return false;
        if (dateFilter === "today" && !isToday(start)) return false;
        if (dateFilter === "week" && !isThisWeek(start)) return false;
        if (dateFilter === "month" && !isThisMonth(start)) return false;
        if (dateFilter === "year" && !isThisYear(start)) return false;
      }
      if (s) {
        const inTruck = String(t.truckId || t.truck || "")
          .toLowerCase()
          .includes(s);
        const inDriver = String(t.driverId || "")
          .toLowerCase()
          .includes(s);
        const inRoute = `${t.route?.origin || ""} ${t.route?.destination || ""}`
          .toLowerCase()
          .includes(s);
        if (!(inTruck || inDriver || inRoute)) return false;
      }
      return true;
    });
  }, [trips, status, search, dateFilter]);

  return (
    <div className="py-6! flex flex-col gap-6! px-4! lg:px-6!">
      {/* Responsive header: mobile and desktop layouts */}
      <div className="flex flex-col gap-2 mb-6!">
        {/* First line: title and add trip (mobile: both, desktop: title left, add trip right) */}
        <div className="flex flex-row items-center w-full pr-1!">
          <h2 className="text-xl font-semibold flex-1">Trips Management</h2>
          {isMobile ? (
            <Button
              variant="default"
              className="flex items-center gap-2"
              title="Create Trip"
              onClick={() => setDialogOpen(true)}
            >
              <IconPlus className="size-4" />
              Add Trip
            </Button>
          ) : (
            <Sheet open={dialogOpen} onOpenChange={setDialogOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="default"
                  className="items-center gap-2"
                  title="Create Trip"
                >
                  <IconPlus className="size-4" />
                  Add Trip
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="overflow-y-auto max-h-screen w-[600px]"
              >
                <SheetHeader>
                  <SheetTitle>Create Trip</SheetTitle>
                  <SheetDescription>
                    Fill in the details to create a new trip.
                  </SheetDescription>
                </SheetHeader>
                <TripCreateForm onSuccess={() => setDialogOpen(false)} />
              </SheetContent>
            </Sheet>
          )}
        </div>

        <p className="text-sm text-muted-foreground">
          Manage and monitor all trips.
        </p>

        {/* Second line: search and refresh (mobile only) */}
        {isMobile ? (
          <div className="flex flex-row items-center gap-2 w-full">
            <Input
              placeholder="Search by truck, driver or route..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-45 flex-1"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <IconRefresh className="mr-1! size-4" />
              {refreshing ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        ) : (
          <div className="flex flex-row items-center gap-2 w-full justify-end">
            <Input
              placeholder="Search by truck, driver or route..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-45 md:w-62.5 lg:w-75"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <IconRefresh className="mr-1! size-4" />
              {refreshing ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        )}

        {/* Third line: date filter */}
        <div className="flex flex-row gap-2 justify-end mt-2">
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger size="sm" className="min-w-35">
              <SelectValue placeholder="Date Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="all">All Dates</SelectItem>
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger size="sm" className="min-w-35">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Status</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Mobile full-screen overlay with framer-motion animation */}
        <AnimatePresence>
          {isMobile && dialogOpen && !shouldCloseMobileDialog && (
            <motion.div
              className="fixed inset-0 z-50 flex flex-col bg-background"
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="flex items-center justify-between !p-4 border-b">
                <h2 className="text-lg font-semibold">Create Trip</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDialogOpen(false)}
                >
                  ✕
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto !p-4">
                <TripCreateForm
                  onSuccess={() => {
                    setShouldCloseMobileDialog(true);
                    setTimeout(() => {
                      setDialogOpen(false);
                      setShouldCloseMobileDialog(false);
                    }, 400); // allow exit animation
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div>
        {loading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="loader" />
            <span className="text-muted-foreground mt-20! text-sm">
              Loading trips
            </span>
          </div>
        ) : (
          <DataTable data={filteredTrips} meta={{ trucks, users }} />
        )}
      </div>
    </div>
  );
}
