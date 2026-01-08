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
import {
  IconAlertTriangle,
  IconCircleCheckFilled,
  IconLoader,
  IconPlus,
  IconQuestionMark,
  IconRefresh,
} from "@tabler/icons-react";
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
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
} from "@/components/ui/alert-dialog";

import { Label } from "@/components/ui/label";
import { useSuperAdmin } from "../context/SuperAdminContext";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Eye } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useState as useLocalState } from "react";
import { DeleteTruckDialog } from "@/components/DeleteTruckDialog";

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
                      const [showDelete, setShowDelete] = React.useState(false);
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

      <div>
        {loading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="loader mx-auto"></div>
            <span className="text-muted-foreground !mt-20 text-sm">
              Loading trucks
            </span>
          </div>
        ) : (
          <>
            {/* Mobile: Card list */}
            <div className="flex flex-col gap-4 md:hidden">
              {filteredTrucks.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No trucks found.
                </div>
              ) : (
                filteredTrucks.map((truck) => {
                  // Local state for delete dialog per truck
                  const [showDelete, setShowDelete] = useLocalState(false);
                  let icon = null;
                  let colorClass = "";
                  if (truck.status === "available") {
                    icon = (
                      <IconCircleCheckFilled className="size-4 fill-green-500 dark:fill-green-400" />
                    );
                    colorClass = "text-green-600 dark:text-green-400";
                  } else if (truck.status === "in-use") {
                    icon = (
                      <IconLoader className="size-4 animate-spin text-blue-500 dark:text-blue-400" />
                    );
                    colorClass = "text-blue-600 dark:text-blue-400";
                  } else if (truck.status === "maintenance") {
                    icon = (
                      <IconAlertTriangle className="size-4 text-yellow-500 dark:text-yellow-400" />
                    );
                    colorClass = "text-yellow-600 dark:text-yellow-400";
                  } else {
                    icon = (
                      <IconQuestionMark className="size-4 text-gray-400" />
                    );
                    colorClass = "text-gray-500 dark:text-gray-400";
                  }
                  return (
                    <div
                      key={truck._id || truck.id}
                      className="w-[400px] max-w-full h-[20vh] border rounded-md flex flex-col justify-between !p-3 bg-background shadow-sm"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 text-sm">
                          <img
                            src="https://png.pngtree.com/png-vector/20231023/ourmid/pngtree-3d-illustration-of-tanker-truck-png-image_10312658.png"
                            alt="truck"
                            className="w-15 h-12 object-contain"
                          />
                          <div className="flex flex-col">
                            <span>{truck.plateNumber}</span>
                            <span className="text-xs">
                              {truck.model}
                              {truck.year ? ` - ${truck.year}` : ""}
                            </span>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={`!px-1.5 flex items-center gap-1 ${colorClass}`}
                        >
                          {icon}
                          {truck.status === "in-use"
                            ? "In Use"
                            : truck.status === "available"
                            ? "Available"
                            : truck.status === "maintenance"
                            ? "Maintenance"
                            : truck.status}
                        </Badge>
                      </div>
                      <div className="flex items-end justify-between">
                        <div className="flex items-center justify-between !mt-2">
                          <p className="text-sm">
                            Driver:{" "}
                            <span className="text-xs">
                              {truck.driverName || "-"}
                            </span>
                          </p>
                        </div>
                        <div className="flex items-center !gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Link
                                href={`/client/super-admin/trucks/${encodeURIComponent(
                                  truck.plateNumber
                                )}?id=${encodeURIComponent(
                                  truck.id ?? truck._id ?? ""
                                )}`}
                                target="_self"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center rounded-md border bg-secondary text-secondary-foreground hover:bg-secondary/80 size-9"
                                style={{ textDecoration: "none" }}
                              >
                                <Eye className="size-4 text-muted-foreground" />
                                <span className="sr-only">View Truck</span>
                              </Link>
                            </TooltipTrigger>
                            <TooltipContent>View</TooltipContent>
                          </Tooltip>
                          <AlertDialog
                            open={showDelete}
                            onOpenChange={setShowDelete}
                          >
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="destructive"
                                    size="icon"
                                    onClick={() => setShowDelete(true)}
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-5 w-5"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2"
                                      />
                                    </svg>
                                  </Button>
                                </AlertDialogTrigger>
                              </TooltipTrigger>
                              <TooltipContent>Delete</TooltipContent>
                            </Tooltip>
                            <AlertDialogContent>
                              <DeleteTruckDialog
                                plateNumber={truck.plateNumber}
                                truckId={truck.id ?? truck._id}
                                fetchTrucks={fetchTrucks}
                                onSuccess={() => setShowDelete(false)}
                              />
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            {/* Desktop: DataTable */}
            <div className="hidden md:block">
              <TrucksDataTable
                data={filteredTrucks}
                fetchTrucks={fetchTrucks}
                searchable
                paginated
                sortable
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Trucks;
