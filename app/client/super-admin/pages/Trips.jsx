"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconFilter, IconPlus } from "@tabler/icons-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { useSuperAdmin } from "../context/SuperAdminContext"; // ✅ import hook

const Trips = () => {
  const {
    error,
    form,
    setForm,
    canCreate,
    filteredTrucks, // ✅ from context
    trucks, // ✅ from context
    loading,
    currentUser,
    handleCreateTruck, // ✅ from context
  } = useSuperAdmin();

  // Local UI state
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div className="!py-6 flex flex-col gap-5 !px-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 !mb-6">
        {/* Left: Title */}
        <div>
          <h2 className="text-xl font-semibold">Trips Management Page</h2>
          <p className="text-sm text-muted-foreground">
            Manage and monitor all trips.
          </p>
          {currentUser ? (
            <p className="text-xs text-muted-foreground !mt-1">
              Signed in as {currentUser.name} ({currentUser.role})
            </p>
          ) : (
            <p className="text-xs text-muted-foreground !mt-1">Not signed in</p>
          )}
        </div>

        {/* Right: Filters and Actions */}
        <div className="flex flex-col md:flex-row items-center gap-4">
          {/* Search Field */}
          <Input
            placeholder="Search by city or truck..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-[250px]"
          />

          {/* Status Filter */}
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[160px]">
              <IconFilter className="!mr-2 size-4 text-muted-foreground" />
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="in-use">In Use</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>

          {/* Add Truck Button + Sheet */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="default"
                className="flex items-center gap-2"
                disabled={!canCreate}
                title={
                  !canCreate
                    ? "You do not have permission to add trucks"
                    : "Add Truck"
                }
              >
                <IconPlus className="size-4" />
                Add Trip
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Add Truck</SheetTitle>
                <SheetDescription>
                  Fill in the details to create a new truck.
                </SheetDescription>
              </SheetHeader>

              <form onSubmit={handleCreateTruck} className="grid gap-6 !mt-6">
                {/* Plate Number */}
                <div className="grid gap-2">
                  <Label htmlFor="truck-plate">Plate Number</Label>
                  <Input
                    id="truck-plate"
                    value={form.plateNumber}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, plateNumber: e.target.value }))
                    }
                    placeholder="KBN 123X"
                    required
                  />
                </div>

                {/* Model */}
                <div className="grid gap-2">
                  <Label htmlFor="truck-model">Model</Label>
                  <Input
                    id="truck-model"
                    value={form.model}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, model: e.target.value }))
                    }
                    placeholder="Isuzu FSR"
                    required
                  />
                </div>

                {/* Capacity */}
                <div className="grid gap-2">
                  <Label htmlFor="truck-capacity">Capacity (tons)</Label>
                  <Input
                    id="truck-capacity"
                    type="number"
                    value={form.capacity}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, capacity: e.target.value }))
                    }
                    placeholder="10"
                    required
                  />
                </div>

                {/* Status */}
                <div className="grid gap-2">
                  <Label htmlFor="truck-status">Status</Label>
                  <Select
                    value={form.status}
                    onValueChange={(val) =>
                      setForm((f) => ({ ...f, status: val }))
                    }
                  >
                    <SelectTrigger id="truck-status" className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="in-use">In Use</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Error display */}
                {error && <div className="text-red-600 text-sm">{error}</div>}

                <SheetFooter className="mt-2">
                  <Button type="submit" disabled={!canCreate}>
                    Create Truck
                  </Button>
                  <SheetClose asChild>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </SheetClose>
                </SheetFooter>
              </form>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Trucks list */}
      <div className="flex flex-col gap-4">
        {loading ? (
          <div className="text-muted-foreground">Loading trucks...</div>
        ) : filteredTrucks.length === 0 ? (
          <div className="min-h-[30vh] flex items-center justify-center text-muted-foreground">
            No trips found. Create a trip to get started.
          </div>
        ) : (
          <div className="rounded-xl border bg-card">
            <div className="p-4 border-b text-sm text-muted-foreground">
              Showing {filteredTrucks.length} of {trucks.length}
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTrucks.map((t) => (
                  <div
                    key={t.id || t._id}
                    className="rounded-lg border p-4 flex flex-col gap-1"
                  >
                    <div className="font-medium">{t.plateNumber}</div>
                    <div className="text-sm text-muted-foreground">
                      {t.model}
                    </div>
                    <div className="text-xs">
                      <span className="font-medium">Capacity:</span>{" "}
                      {t.capacity} tons
                    </div>
                    <div className="text-xs">
                      <span className="font-medium">Status:</span>{" "}
                      {t.status === "in-use"
                        ? "Active"
                        : t.status === "maintenance"
                        ? "Maintenance"
                        : "Available"}
                    </div>
                    <div className="text-xs">
                      <span className="font-medium">Drivers:</span>{" "}
                      {t.assignedDrivers?.length
                        ? t.assignedDrivers.map((d) => d.name).join(", ")
                        : "Unassigned"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Trips;
