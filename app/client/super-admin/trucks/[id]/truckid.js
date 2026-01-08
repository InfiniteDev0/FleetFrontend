"use client";
import React, { useState } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { useSuperAdmin } from "@/app/client/super-admin/context/SuperAdminContext";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const DataTable = dynamic(
  () =>
    import("../../../../../components/trips-data-table").then((mod) => ({
      default: mod.DataTable,
    })),
  {
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div className="loader"></div>
      </div>
    ),
    ssr: false,
  }
);
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Eye } from "lucide-react";
import {
  IconCalendar,
  IconCircleCheckFilled,
  IconDeviceFloppy,
  IconLoader,
  IconPencil,
  IconTrendingUp,
  IconAlertTriangle,
  IconQuestionMark,
} from "@tabler/icons-react";
import { CirclePause, CirclePlay, MoveDown } from "lucide-react";
import { toast } from "sonner";

const PopoverDemo = dynamic(
  () =>
    import("../../components/DriverListPopup").then((mod) => ({
      default: mod.PopoverDemo,
    })),
  {
    loading: () => <div className="loader"></div>,
    ssr: false,
  }
);

const Truckpage = () => {
  const [isEditing, setIsEditing] = useState(false);

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const id = searchParams.get("id");

  // Extract plate number from the URL path
  let plateNumber = null;
  const match = pathname.match(/trucks\/(.+)$/i);
  if (match && match[1]) {
    plateNumber = decodeURIComponent(match[1].split("?")[0]);
  }

  // Use context to fetch truck details and trips
  const {
    handleGetTruckById,
    handleUpdateTruck,
    trips = [],
    fetchTrips,
    trucks = [],
    users = [],
  } = useSuperAdmin();
  const [truck, setTruck] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const role = "super_admin"; // Change for demo: operator | admin | super_admin

  const statusMap = {
    available: { label: "Available", color: "bg-green-500" },
    "in-use": { label: "Active", color: "bg-green-500" },
    maintenance: { label: "Maintenance", color: "bg-orange-500" },
    ended: { label: "Ended", color: "bg-gray-400" },
    active: { label: "Active", color: "bg-green-500" },
    on_trip: { label: "On Trip", color: "bg-blue-500" },
    inactive: { label: "Inactive", color: "bg-gray-400" },
  };

  React.useEffect(() => {
    if (id) {
      setLoading(true);
      handleGetTruckById(id).then((data) => {
        setTruck(data);
        setLoading(false);
      });
    }
  }, [id]);

  // Fetch trips data on mount
  React.useEffect(() => {
    if (!trips || trips.length === 0) {
      fetchTrips?.();
    }
  }, []);

  // Fallback for status
  const status =
    truck && truck.status
      ? statusMap[truck.status] || statusMap["inactive"]
      : statusMap["inactive"];

  // Prepare formData from truck details
  const [formData, setFormData] = useState({
    plateNumber: "",
    model: "",
    capacity: "",
    status: "",
    driverName: "",
    phoneNumber: "",
  });

  React.useEffect(() => {
    if (truck) {
      // If assignedDrivers is an array of objects, pick the first one's id for edit
      let assignedDriverId = "";
      if (
        Array.isArray(truck.assignedDrivers) &&
        truck.assignedDrivers.length > 0
      ) {
        const firstDriver = truck.assignedDrivers[0];
        assignedDriverId = firstDriver?._id || firstDriver?.id || firstDriver;
      }
      setFormData({
        plateNumber: truck.plateNumber || "",
        model: truck.model || "",
        capacity:
          typeof truck.capacity === "number"
            ? truck.capacity.toString()
            : truck.capacity || "",
        status: truck.status || "",
        driverName: truck.driverName || "",
        phoneNumber: truck.PhoneNumber || truck.phoneNumber || "",
        assignedDriverId,
      });
    }
  }, [truck]);

  // Calculate total trips for this truck (must be before early returns)
  const truckTripsCount = React.useMemo(() => {
    if (!truck) return 0;
    return (trips || []).filter((t) => {
      const truckRaw = (t && t.truckId) || null;
      const truckObj =
        truckRaw && typeof truckRaw === "object" ? truckRaw : null;
      const truckIdStr = truckObj?._id || truckRaw;
      return String(truckIdStr) === String(truck._id || truck.id);
    }).length;
  }, [trips, truck]);

  // Calculate monthly revenue from completed trips in current month
  const monthlyRevenue = React.useMemo(() => {
    if (!truck) return 0;
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return (trips || [])
      .filter((t) => {
        const truckRaw = (t && t.truckId) || null;
        const truckObj =
          truckRaw && typeof truckRaw === "object" ? truckRaw : null;
        const truckIdStr = truckObj?._id || truckRaw;
        const isTruckMatch =
          String(truckIdStr) === String(truck._id || truck.id);

        if (!isTruckMatch || t.status !== "completed") return false;

        if (!t.startTime) return false;
        const tripDate = new Date(t.startTime);
        return (
          tripDate.getMonth() === currentMonth &&
          tripDate.getFullYear() === currentYear
        );
      })
      .reduce((sum, t) => sum + (Number(t.transport) || 0), 0);
  }, [trips, truck]);

  if (loading) {
    // Try to get the plate number from the URL or truck object
    let loadingPlate = plateNumber;
    if (!loadingPlate && truck && truck.plateNumber)
      loadingPlate = truck.plateNumber;
    const loadingMessage = loadingPlate
      ? `Preparing ${loadingPlate.toUpperCase()} details`
      : "Loading truck details...";
    return (
      <div className="flex items-center justify-center h-full min-h-[300px]">
        <div className="loader mx-auto"></div>
        <span className="block w-full text-center text-muted-foreground mt-4 text-sm">
          {loadingMessage}
        </span>
      </div>
    );
  }

  if (!truck) {
    return <div className="p-8 text-center text-red-500">Truck not found.</div>;
  }

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setUpdating(true);
    // Prepare update payload
    const rawPhone = String(formData.phoneNumber || "")
      .replace(/\D/g, "")
      .trim();
    const phoneNumberValue = rawPhone !== "" ? Number(rawPhone) : null;
    const updatePayload = {
      plateNumber: formData.plateNumber,
      model: formData.model,
      capacity: Number(formData.capacity),
      status: formData.status,
      driverName: formData.driverName || null,
      PhoneNumber: phoneNumberValue,
    };
    try {
      const truckId = truck?.id || truck?._id;
      if (!truckId) {
        toast.error("Truck ID not found");
        return;
      }

      const result = await handleUpdateTruck(truckId, updatePayload);
      if (result) {
        setTruck(result);
        toast.success("Truck updated successfully");
        setIsEditing(false);
      } else {
        toast.error("Failed to update truck");
      }
    } catch (err) {
      console.error("Update truck error:", err);
      toast.error(err?.message || "Failed to update truck");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="!p-6 !space-y-6 min-h-[calc(100vh-64px)]">
      {/* 1️⃣ Header: Truck Identity & Actions */}
      <Card className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 !p-6 sticky top-0 z-10">
        <div>
          <div className="flex items-center gap-3 text-xl font-bold">
            <img
              src="https://png.pngtree.com/png-vector/20231023/ourmid/pngtree-3d-illustration-of-tanker-truck-png-image_10312658.png"
              alt=""
              className="w-15"
            />
            <span>{truck.plateNumber}</span>
            <span>
              — {truck.model} ({truck.year || "-"})
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {(role === "admin" || role === "super_admin") && (
            <>
              <Button size="sm" variant="outline">
                Send to Maintenance
              </Button>
            </>
          )}
          {role === "operator" && (
            <>
              <Button size="sm" variant="outline">
                Start Trip
              </Button>
              <Button size="sm" variant="outline">
                End Trip
              </Button>
            </>
          )}
          <Badge
            variant="outline"
            className={`!ml-2 px-1.5 flex items-center gap-1 ${
              truck.status === "available"
                ? "text-green-600 dark:text-green-400"
                : truck.status === "in-use"
                ? "text-blue-600 dark:text-blue-400"
                : truck.status === "maintenance"
                ? "text-yellow-600 dark:text-yellow-400"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {truck.status === "available" ? (
              <IconCircleCheckFilled className="size-4 fill-green-500 dark:fill-green-400" />
            ) : truck.status === "in-use" ? (
              <IconLoader className="size-4 animate-spin text-blue-500 dark:text-blue-400" />
            ) : truck.status === "maintenance" ? (
              <IconAlertTriangle className="size-4 text-yellow-500 dark:text-yellow-400" />
            ) : (
              <IconQuestionMark className="size-4 text-gray-400" />
            )}
            {truck.status === "in-use"
              ? "In Use"
              : truck.status === "available"
              ? "Available"
              : truck.status === "maintenance"
              ? "Maintenance"
              : truck.status}
          </Badge>
        </div>
      </Card>

      {/* 2️⃣ Status Snapshot */}
      <div
        className="
    grid grid-cols-1 gap-6 
    md:grid-cols-2
    xl:grid-cols-2
    2xl:grid-cols-3
    @5xl/main:grid-cols-4
    *:data-[slot=card]:bg-gradient-to-t
    *:data-[slot=card]:from-primary/5
    *:data-[slot=card]:to-card
    dark:*:data-[slot=card]:bg-card
  "
      >
        {/* Daily Revenue */}
        <Card>
          <CardHeader>
            <CardDescription>Today's Revenue</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              ${monthlyRevenue.toLocaleString()}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <IconTrendingUp />
                +12.5%
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Revenue trend today{" "}
              <IconTrendingUp className="size-4 text-green-500" />
            </div>
            <div className="text-muted-foreground">
              Compared to yesterday's performance
            </div>
          </CardFooter>
        </Card>

        {/* Current Trip */}
        <Card className="w-full">
          <CardHeader className="!pb-2 flex flex-col gap-2">
            {truckTripsCount > 0 ? (
              (() => {
                const firstTrip = (trips || []).filter((t) => {
                  const truckRaw = (t && t.truckId) || null;
                  const truckObj =
                    truckRaw && typeof truckRaw === "object" ? truckRaw : null;
                  const truckIdStr = truckObj?._id || truckRaw;
                  return String(truckIdStr) === String(truck._id || truck.id);
                })[0];

                return (
                  <h4 className="text-sm underline tracking-wider !mb-1">
                    {firstTrip?.status === "completed"
                      ? "Last Trip"
                      : "Current Trip"}
                  </h4>
                );
              })()
            ) : (
              <h4 className="text-sm underline tracking-wider !mb-1">
                Current Trip
              </h4>
            )}
            {truckTripsCount > 0 &&
              (() => {
                const firstTrip = (trips || []).filter((t) => {
                  const truckRaw = (t && t.truckId) || null;
                  const truckObj =
                    truckRaw && typeof truckRaw === "object" ? truckRaw : null;
                  const truckIdStr = truckObj?._id || truckRaw;
                  return String(truckIdStr) === String(truck._id || truck.id);
                })[0];

                if (!firstTrip)
                  return (
                    <p className="text-xs text-muted-foreground">
                      No trips found
                    </p>
                  );

                const start = firstTrip.startTime
                  ? new Date(firstTrip.startTime)
                  : null;
                const driverPhone =
                  truck?.PhoneNumber ??
                  truck?.phoneNumber ??
                  truck?.driverPhone ??
                  truck?.driverContact ??
                  null;

                return (
                  <div className="flex justify-between w-full items-start">
                    <div className="flex items-center gap-4">
                      {/* SVG route icon */}
                      <div className="w-4 h-24 flex-shrink-0 flex items-center justify-center">
                        <svg
                          width="14"
                          height="100%"
                          viewBox="0 0 16 100"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fill="#0046E0"
                            stroke="#9FBBF7"
                            strokeWidth=".5"
                            d="M14 2v12H2V2h12z"
                          />
                          <rect
                            width="4"
                            height="4"
                            x="6"
                            y="6"
                            stroke="#fff"
                            rx="2"
                          />
                          <path
                            fill="#0046E0"
                            stroke="#9FBBF7"
                            strokeWidth=".5"
                            d="M14 86v12H2V86h12z"
                          />
                          <rect
                            width="4"
                            height="4"
                            x="6"
                            y="90"
                            fill="#fff"
                            stroke="#fff"
                            rx="2"
                          />
                          <path
                            fill="#636D78"
                            fillRule="evenodd"
                            d="M7.872 20v1.454h1V20h-1zm0 4.361v2.907h1v-2.907h-1zm0 5.815v2.907h1v-2.907h-1zm0 5.814v2.907h1V35.99h-1zm0 5.815v2.907h1v-2.907h-1zm0 5.815v2.907h1V47.62h-1zm0 5.814v2.907h1v-2.907h-1zm0 5.815v2.907h1V59.25h-1zm0 5.814v2.908h1v-2.908h-1zm0 5.815v2.907h1v-2.907h-1zm1 7.819V75h-1v3.697l-2.129-2.365-.743.67 3 3.333.372.412.371-.412 3-3.334-.743-.669-2.128 2.365z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>

                      {/* Origin/Destination */}
                      <div className="flex flex-col gap-4">
                        <div className="!mb-5">
                          <p className="tracking-wider text-xs">
                            {firstTrip.route?.origin || "Origin"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {start
                              ? `${start.toLocaleDateString()} ${start.toLocaleTimeString(
                                  [],
                                  { hour: "2-digit", minute: "2-digit" }
                                )}`
                              : "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs tracking-wider">
                            {firstTrip.route?.destination || "Destination"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {firstTrip.arrivalTime || ""}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`px-1.5 flex items-center gap-1 ${
                        firstTrip.status === "scheduled"
                          ? "text-yellow-600 dark:text-yellow-400"
                          : firstTrip.status === "in-progress"
                          ? "text-green-600 dark:text-green-400"
                          : firstTrip.status === "completed"
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {firstTrip.status === "scheduled" ? (
                        <IconAlertTriangle className="size-4 text-yellow-500 dark:text-yellow-400" />
                      ) : firstTrip.status === "in-progress" ? (
                        <IconLoader className="size-4 animate-spin text-green-500 dark:text-green-400" />
                      ) : firstTrip.status === "completed" ? (
                        <IconCircleCheckFilled className="size-4 fill-blue-500 dark:fill-blue-400" />
                      ) : (
                        <IconQuestionMark className="size-4 text-gray-400" />
                      )}
                      {firstTrip.status === "in-progress"
                        ? "In Progress"
                        : firstTrip.status === "scheduled"
                        ? "Scheduled"
                        : firstTrip.status === "completed"
                        ? "Completed"
                        : firstTrip.status || "Unknown"}
                    </Badge>
                  </div>
                );
              })()}
          </CardHeader>

          <CardContent className="space-y-4 text-sm">
            {truckTripsCount > 0 &&
              (() => {
                const firstTrip = (trips || []).filter((t) => {
                  const truckRaw = (t && t.truckId) || null;
                  const truckObj =
                    truckRaw && typeof truckRaw === "object" ? truckRaw : null;
                  const truckIdStr = truckObj?._id || truckRaw;
                  return String(truckIdStr) === String(truck._id || truck.id);
                })[0];

                if (!firstTrip) return null;

                const driverPhone =
                  truck?.PhoneNumber ??
                  truck?.phoneNumber ??
                  truck?.driverPhone ??
                  truck?.driverContact ??
                  null;

                return (
                  <>
                    <div>
                      <h4 className="text-sm underline tracking-wider !mb-3">
                        Equipment
                      </h4>
                      <div className="text-xs">
                        Product:{" "}
                        <span className="text-blue-300">
                          {firstTrip.product || "-"}
                        </span>
                      </div>
                      <div className="text-xs !mt-1">
                        Truck:{" "}
                        <span className="text-blue-300">
                          {truck?.plateNumber
                            ? `${truck.plateNumber}${
                                truck?.model ? ` — ${truck.model}` : ""
                              }`
                            : "Unassigned"}
                        </span>
                      </div>
                      <div className="text-xs !mt-1">
                        Driver:{" "}
                        <span className="text-blue-300">
                          {truck?.driverName || truck?.driver || "—"}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm underline tracking-wider !mt-3">
                        Contact Information
                      </h4>
                      <div>
                        {driverPhone ? (
                          <a
                            className="text-xs !mt-1 text-red-500"
                            href={`tel:${String(driverPhone)}`}
                          >
                            {String(driverPhone)}
                          </a>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </div>
                    </div>
                  </>
                );
              })()}
            {truckTripsCount === 0 && (
              <p className="text-xs text-muted-foreground">
                No trips assigned to this truck
              </p>
            )}
          </CardContent>
        </Card>

        {/* Monthly Revenue */}
        <Card>
          <CardHeader>
            <CardDescription>Generate Monthly Revenue</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              ${monthlyRevenue.toLocaleString()}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <IconTrendingUp />
                +12.5%
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Revenue trend this month{" "}
              <IconTrendingUp className="size-4 text-green-500" />
            </div>
            <div className="text-muted-foreground">
              From completed trips this month
            </div>
          </CardFooter>
        </Card>

        {/* Monthly Trips */}
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Total Trips</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {truckTripsCount}
            </CardTitle>
          </CardHeader>

          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Total trips assigned to this truck
            </div>
            <div className="text-muted-foreground">
              Click the Trips tab to view details
            </div>
          </CardFooter>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="!mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trips">Trips</TabsTrigger>
          <TabsTrigger value="expenses">Expenses & Maintenance</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          {(role === "admin" || role === "super_admin") && (
            <TabsTrigger value="activity">Activity Log</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview">
          <Card className="!p-6 mb-4">
            <CardTitle className="!mb-4">Truck Details</CardTitle>
            <CardContent>
              <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Number Plate */}
                <div>
                  <Label>Number Plate</Label>
                  <Input
                    value={formData.plateNumber}
                    disabled={!isEditing}
                    onChange={(e) =>
                      handleChange("plateNumber", e.target.value)
                    }
                  />
                </div>

                {/* Model */}
                <div>
                  <Label>Model</Label>
                  <Input
                    value={formData.model}
                    disabled={!isEditing}
                    onChange={(e) => handleChange("model", e.target.value)}
                  />
                </div>

                {/* Capacity */}
                <div>
                  <Label>Capacity</Label>
                  <Input
                    value={formData.capacity}
                    disabled={!isEditing}
                    onChange={(e) => handleChange("capacity", e.target.value)}
                  />
                </div>

                {/* Status */}
                <div>
                  <Label htmlFor="truck-status">Status</Label>
                  <Select
                    value={formData.status || ""}
                    onValueChange={(val) => handleChange("status", val)}
                    disabled={!isEditing}
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

                {/* Driver Name */}
                <div>
                  <Label>Driver Name</Label>
                  <Input
                    value={formData.driverName}
                    disabled={!isEditing}
                    onChange={(e) => handleChange("driverName", e.target.value)}
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <Label>Phone Number</Label>
                  <Input
                    value={formData.phoneNumber}
                    disabled={!isEditing}
                    onChange={(e) =>
                      handleChange("phoneNumber", e.target.value)
                    }
                    placeholder="e.g. +254712345678"
                  />
                </div>
              </form>

              {/* Action Buttons */}
              <div className="flex justify-end !mt-6 gap-2">
                {!isEditing ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                  >
                    <IconPencil className="mr-1" /> Edit
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="default"
                    onClick={handleSave}
                    disabled={updating}
                  >
                    <IconDeviceFloppy className="mr-1" />
                    {updating ? "Updating..." : "Save"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {/* Other Tabs */}
        <TabsContent value="trips">
          <TripTableWrapper truckId={truck?._id || truck?.id} />
        </TabsContent>

        {/* Trip table wrapper computed below */}

        <TabsContent value="expenses">
          <Card className="!p-4 !mb-4">
            Expenses & Maintenance logs go here
          </Card>
        </TabsContent>
        <TabsContent value="documents">
          <Card className="!p-4 !mb-4">Documents info goes here</Card>
        </TabsContent>
        {(role === "admin" || role === "super_admin") && (
          <TabsContent value="activity">
            <Card className="!p-4 !mb-4">Activity log goes here</Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

// Helper component to render trips filtered by truck id
function TripTableWrapper({ truckId }) {
  const { trips = [], fetchTrips, trucks = [], users = [] } = useSuperAdmin();

  React.useEffect(() => {
    if (!trips || trips.length === 0) {
      fetchTrips?.();
    }
  }, [trips, fetchTrips]);

  const tripsForTruck = (trips || []).filter((t) => {
    const truckRaw = (t && t.truckId) || null;
    const truckObj = truckRaw && typeof truckRaw === "object" ? truckRaw : null;
    const truckIdStr = truckObj?._id || truckRaw;
    return String(truckIdStr) === String(truckId);
  });

  return <DataTable data={tripsForTruck} meta={{ trucks, users }} />;
}

export default Truckpage;
