"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";
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
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

// Ensure dialog content is scrollable and has high z-index
const dialogContentProps = {
  style: {
    maxHeight: "90vh",
    overflowY: "auto",
    zIndex: 9999,
  },
};
import { Label } from "@/components/ui/label";
import { useSuperAdmin } from "../context/SuperAdminContext";
import { toast } from "sonner";

const TrucksDataTable = dynamic(
  () =>
    import("@/components/truck-datatable").then((mod) => ({
      default: mod.TrucksDataTable,
    })),
  {
    loading: () => (
      <div className="flex flex-col items-center gap-2">
        <div className="loader mx-auto"></div>
        <span className="text-muted-foreground mt-4 text-sm">
          Loading trucks table...
        </span>
      </div>
    ),
    ssr: false,
  }
);

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
    handleAssignDriverToTruck,
    fetchTrucks,
    getAllTrucks,
    trucksError,
  } = useSuperAdmin();

  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  const handleCreateTruckWithFeedback = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      // Create the truck and get the created truck object
      const createdTruck = await handleCreateTruck(e);
      if (!createdTruck) throw new Error("Truck creation failed");
      toast.success("Truck created successfully");

      // Assign driver if selected
      if (form.assignedDriverId && createdTruck._id) {
        try {
          await handleAssignDriverToTruck(
            createdTruck._id,
            form.assignedDriverId
          );
          toast.success("Driver assigned to truck");
        } catch (err) {
          toast.error(err?.message || "Failed to assign driver");
        }
      }

      // Reset form fields after creation
      setForm((f) => ({
        ...f,
        plateNumber: "",
        model: "",
        capacity: "",
        status: "",
        assignedDriverId: "",
      }));

      setDialogOpen(false);
    } catch (err) {
      toast.error(err?.message || "Failed to create truck");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleRefresh = async () => {
    setCreateLoading(true);
    try {
      await getAllTrucks();
      toast.success("Trucks refreshed");
    } catch (err) {
      toast.error(trucksError || err?.message || "Failed to refresh trucks");
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
    <div className="py-6! flex flex-col gap-6! px-4! lg:px-6!">
      {/* Responsive header: mobile and desktop layouts */}
      <div className="flex flex-col gap-2 mb-6!">
        {/* First line: title and add truck (mobile: both, desktop: title left, add truck right) */}
        <div className="flex flex-row items-center w-full pr-1!">
          <h2 className="text-xl font-semibold flex-1">Trucks Management</h2>
          {/* Mobile: add truck button right of title */}
          <div className="md:hidden flex items-center justify-end">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="default"
                  className="flex items-center gap-2"
                  disabled={!canCreate}
                  title="Add Truck"
                >
                  <IconPlus className="size-4" />
                  Add Truck
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto">
                {/* ...existing code for DialogContent... */}
                <DialogHeader>
                  <DialogTitle>Add Truck</DialogTitle>
                  <DialogDescription>
                    Fill in the details to create a new truck.
                  </DialogDescription>
                </DialogHeader>
                <form
                  onSubmit={handleCreateTruckWithFeedback}
                  className="grid gap-6 mt-6"
                >
                  {/* ...existing code for form fields... */}
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
                  <div className="grid gap-2">
                    <Label htmlFor="driver-name">Driver Name</Label>
                    <Input
                      id="driver-name"
                      value={form.driverName}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, driverName: e.target.value }))
                      }
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="driver-phone">Phone Number</Label>
                    <Input
                      id="driver-phone"
                      type="tel"
                      value={form.phoneNumber}
                      onChange={(e) => {
                        let cleaned = e.target.value
                          .replace(/\s+/g, "")
                          .replace(/[^0-9+]/g, "");
                        if (cleaned.startsWith("0")) {
                          cleaned = "+254" + cleaned.slice(1);
                        }
                        if (
                          cleaned &&
                          !cleaned.startsWith("+254") &&
                          !cleaned.startsWith("+")
                        ) {
                          cleaned = "+254" + cleaned;
                        }
                        setForm((f) => ({ ...f, phoneNumber: cleaned }));
                      }}
                      placeholder="+254712345678 or 0712345678"
                    />
                    <p className="text-xs text-muted-foreground">
                      Example: 0796058971 → +254796058971
                    </p>
                  </div>
                  {error && <div className="text-red-600 text-sm">{error}</div>}
                  <DialogFooter className="mt-2">
                    <Button
                      type="submit"
                      disabled={!canCreate || createLoading}
                    >
                      {createLoading ? "Creating..." : "Create Truck"}
                    </Button>
                    <DialogClose asChild>
                      <Button type="button" variant="outline">
                        Cancel
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          {/* Desktop: add truck button right-aligned */}
          <div className="hidden md:flex items-center">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="default"
                  className="items-center gap-2"
                  disabled={!canCreate}
                  title="Add Truck"
                >
                  <IconPlus className="size-4" />
                  Add Truck
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto">
                {/* ...existing code for DialogContent... */}
                <DialogHeader>
                  <DialogTitle>Add Truck</DialogTitle>
                  <DialogDescription>
                    Fill in the details to create a new truck.
                  </DialogDescription>
                </DialogHeader>
                <form
                  onSubmit={handleCreateTruckWithFeedback}
                  className="grid gap-6 mt-6"
                >
                  {/* ...existing code for form fields... */}
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
                  <div className="grid gap-2">
                    <Label htmlFor="driver-name">Driver Name</Label>
                    <Input
                      id="driver-name"
                      value={form.driverName}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, driverName: e.target.value }))
                      }
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="driver-phone">Phone Number</Label>
                    <Input
                      id="driver-phone"
                      type="tel"
                      value={form.phoneNumber}
                      onChange={(e) => {
                        let cleaned = e.target.value
                          .replace(/\s+/g, "")
                          .replace(/[^0-9+]/g, "");
                        if (cleaned.startsWith("0")) {
                          cleaned = "+254" + cleaned.slice(1);
                        }
                        if (
                          cleaned &&
                          !cleaned.startsWith("+254") &&
                          !cleaned.startsWith("+")
                        ) {
                          cleaned = "+254" + cleaned;
                        }
                        setForm((f) => ({ ...f, phoneNumber: cleaned }));
                      }}
                      placeholder="+254712345678 or 0712345678"
                    />
                    <p className="text-xs text-muted-foreground">
                      Example: 0796058971 → +254796058971
                    </p>
                  </div>
                  {error && <div className="text-red-600 text-sm">{error}</div>}
                  <DialogFooter className="mt-2">
                    <Button
                      type="submit"
                      disabled={!canCreate || createLoading}
                    >
                      {createLoading ? "Creating..." : "Create Truck"}
                    </Button>
                    <DialogClose asChild>
                      <Button type="button" variant="outline">
                        Cancel
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        {/* Subtitle and current user info */}
        <p className="text-sm text-muted-foreground">
          Manage and monitor all trucks in the fleet.
        </p>
        {/* Second line: search and refresh (mobile only) */}
        <div className="flex flex-row items-center gap-2 w-full md:hidden">
          <Input
            placeholder="Search by plate or model..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-45 flex-1"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={createLoading}
          >
            <IconRefresh className="mr-1! size-4" />
            {createLoading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
        {/* Second line: search and refresh (desktop only) */}
        <div className="hidden md:flex flex-row items-center gap-2 w-full justify-end">
          <Input
            placeholder="Search by plate or model..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-45 md:w-62.5 lg:w-75"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={createLoading}
          >
            <IconRefresh className="mr-1! size-4" />
            {createLoading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
        {/* Third line: status filter, always right-aligned */}
        <div className="flex justify-end mt-2">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="min-w-35">
              <SelectValue placeholder="Status Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="in-use">In Use</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Trucks list */}
      <div>
        {loading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="loader mx-auto"></div>
            <span className="text-muted-foreground !mt-20 text-sm">
              Loading trucks
            </span>
          </div>
        ) : (
          <TrucksDataTable
            data={filteredTrucks}
            fetchTrucks={fetchTrucks}
            searchable
            paginated
            sortable
          />
        )}
      </div>
    </div>
  );
};

export default Trucks;
