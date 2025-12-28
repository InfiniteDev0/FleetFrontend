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
import { IconFilter, IconPlus, IconRefresh } from "@tabler/icons-react";
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
import { useSuperAdmin } from "../context/SuperAdminContext";
import { TrucksDataTable } from "@/components/truck-datatable";
import { toast } from "sonner";

const Trucks = () => {
  const {
    error,
    form,
    setForm,
    canCreate,
    trucks,
    loading,
    currentUser,
    handleCreateTruck,
    fetchTrucks,
  } = useSuperAdmin();

  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  const handleCreateTruckWithFeedback = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      await handleCreateTruck(e);
      toast.success("Truck created successfully");
      setSheetOpen(false);
    } catch (err) {
      toast.error(err?.message || "Failed to create truck");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleRefresh = async () => {
    setCreateLoading(true);
    try {
      await fetchTrucks();
      toast.success("Trucks refreshed");
    } catch {
      toast.error("Failed to refresh trucks");
    } finally {
      setCreateLoading(false);
    }
  };

  // Filtering logic
  const filteredTrucks = React.useMemo(() => {
    let filtered = trucks;
    if (status !== "all") {
      filtered = filtered.filter((t) => t.status === status);
    }
    if (search.trim() !== "") {
      const s = search.trim().toLowerCase();
      filtered = filtered.filter(
        (t) =>
          (t.plateNumber && t.plateNumber.toLowerCase().includes(s)) ||
          (t.model && t.model.toLowerCase().includes(s))
      );
    }
    return filtered;
  }, [trucks, status, search]);

  return (
    <div className="!py-6 flex flex-col !gap-6 !px-4 lg:!px-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between !gap-4 !mb-6">
        <div>
          <h2 className="text-xl font-semibold">Trucks Management</h2>
          <p className="text-sm text-muted-foreground">
            Manage and monitor all trucks in the fleet.
          </p>
          {currentUser ? (
            <p className="text-xs text-muted-foreground !mt-1">
              Signed in as {currentUser.name} ({currentUser.role})
            </p>
          ) : (
            <p className="text-xs text-muted-foreground !mt-1">Not signed in</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center !gap-3">
          <Input
            placeholder="Search by plate or model..."
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
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="in-use">In Use</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>

          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="default"
                className="flex items-center !gap-2"
                disabled={!canCreate}
              >
                <IconPlus className="size-4" />
                Add Truck
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Add Truck</SheetTitle>
                <SheetDescription>
                  Fill in the details to create a new truck.
                </SheetDescription>
              </SheetHeader>

              <form
                onSubmit={handleCreateTruckWithFeedback}
                className="grid !gap-6 !mt-6"
              >
                <div className="grid !gap-2">
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

                <div className="grid !gap-2">
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

                <div className="grid !gap-2">
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

                <div className="grid !gap-2">
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

                {error && <div className="text-red-600 text-sm">{error}</div>}

                <SheetFooter className="!mt-2">
                  <Button type="submit" disabled={!canCreate || createLoading}>
                    {createLoading ? "Creating..." : "Create Truck"}
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
      <div className="">
        {loading ? (
          <div className="!p-6 text-center text-muted-foreground">
            Loading trucks...
          </div>
        ) : (
          <TrucksDataTable data={filteredTrucks} fetchTrucks={fetchTrucks} />
        )}
      </div>
    </div>
  );
};

export default Trucks;
