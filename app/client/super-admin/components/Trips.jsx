"use client";
import React, { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { IconFilter, IconPlus, IconRefresh } from "@tabler/icons-react";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { useSuperAdmin } from "../context/SuperAdminContext";
import { toast } from "sonner";

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

const TripCreateForm = dynamic(() => import("./forms/CreateTripForm"), {
  loading: () => (
    <div className="flex items-center justify-center p-8">
      <div className="loader"></div>
    </div>
  ),
  ssr: false,
});

export default function Trips() {
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
  const sourceTrips = trips || [];

  const filteredTrips = useMemo(() => {
    const s = String(search || "")
      .trim()
      .toLowerCase();
    return sourceTrips.filter((t) => {
      if (status !== "all" && status) {
        if (t.status !== status) return false;
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
  }, [sourceTrips, status, search]);

  return (
    <div className="!py-6 flex flex-col !gap-6 !px-4 lg:!px-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between !gap-4 !mb-6">
        <div>
          <h2 className="text-xl font-semibold">Trips Management</h2>
          <p className="text-sm text-muted-foreground">
            Manage and monitor all trips.
          </p>
        </div>

        <div className="flex flex-wrap items-center !gap-3">
          <Input
            placeholder="Search by truck, driver or route..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-[220px]"
          />

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <IconRefresh className="mr-1 size-4" />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="default"
                className="flex items-center gap-2"
                title="Create Trip"
              >
                <IconPlus className="size-4" />
                Add Trip
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto">
              <TripCreateForm onSuccess={() => setDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div>
        {loading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="loader" />
            <span className="text-muted-foreground !mt-20 text-sm">
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
