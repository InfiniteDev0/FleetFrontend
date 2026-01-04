"use client";
import React, { useState, useMemo } from "react";
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
import { DataTable } from "@/components/trips-data-table";
import TripCreateForm from "./forms/CreateTripForm";
import { toast } from "sonner";

// Mock fallback for local/demo view
const mockTrips = [
  {
    id: "TRIP-001",
    truck: "TRK-001",
    driver: "Carlos Rivera",
    route: "Nairobi → Mombasa",
    start: "2025-12-30 06:30",
    end: "2025-12-30 14:00",
    status: "on_trip",
    revenue: 1200,
  },
  {
    id: "TRIP-002",
    truck: "TRK-002",
    driver: "Jane Kim",
    route: "Nairobi → Kisumu",
    start: "2025-12-30 07:00",
    end: "2025-12-30 15:00",
    status: "completed",
    revenue: 950,
  },
];

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

  const sourceTrips =
    trips && trips.length
      ? trips
      : mockTrips.map((trip) => ({
          _id: trip.id,
          truckId: trip.truck,
          driverId: trip.driver,
          route: {
            origin: trip.route.split("→")[0]?.trim() || "",
            destination: trip.route.split("→")[1]?.trim() || "",
          },
          startTime: new Date(
            `2025-12-30T${trip.start.split(" ")[1] || "06:00"}`
          ).toISOString(),
          endTime: trip.end
            ? new Date(
                `2025-12-30T${trip.end.split(" ")[1] || "14:00"}`
              ).toISOString()
            : undefined,
          status:
            trip.status === "on_trip"
              ? "in-progress"
              : trip.status === "completed"
              ? "completed"
              : "scheduled",
          transport: trip.revenue,
          createdBy: "",
        }));

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

          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[160px]">
              <IconFilter className="!mr-2 size-4 text-muted-foreground" />
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

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
              <TripCreateForm />
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
