"use client";
import React, { useState } from "react";
import { useSearchParams, usePathname } from "next/navigation";
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
} from "@tabler/icons-react";
import { CirclePause, CirclePlay, MoveDown } from "lucide-react";
import { PopoverDemo } from "../../components/DriverListPopup";
import { toast } from "sonner";

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

  // Use context to fetch truck details
  const {
    handleGetTruckById,
    handleUpdateTruck,
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
        assignedDriverId,
      });
    }
  }, [truck]);

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
    const updatePayload = {
      plateNumber: formData.plateNumber,
      model: formData.model,
      capacity: Number(formData.capacity),
      status: formData.status,
    };
    try {
      toast.success("Truck updated successfully");
      setIsEditing(false);
    } catch (err) {
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
                Change Status
              </Button>
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
          <Badge className="!ml-2 flex bg-black text-white items-center gap-1 ">
            <IconCircleCheckFilled className="size-4 fill-green-500 dark:fill-green-400" />
            <span>{status.label}</span>
          </Badge>
        </div>
      </Card>

      {/* 2️⃣ Status Snapshot */}
      <div
        className="
    grid grid-cols-1 gap-6 !px-4 lg:!px-6
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
              {typeof truck?.monthlyRevenue === "number"
                ? `$${truck.monthlyRevenue.toLocaleString()}`
                : "-"}
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
        <Card className="!p-4 flex flex-col gap-4">
          <div className="text-xs text-muted-foreground">Current Trip</div>
          <div className="flex items-start gap-2">
            <CirclePlay className="size-4 text-green-500" />
            <div className="flex flex-col">
              <div className="font-bold text-base">
                {truck.currentTrip && truck.currentTrip.from
                  ? truck.currentTrip.from
                  : "-"}
              </div>
              <div className="text-xs text-muted-foreground">
                {truck.currentTrip && truck.currentTrip.startDate
                  ? truck.currentTrip.startDate
                  : "-"}
              </div>
              <div className="text-xs text-muted-foreground">
                {truck.currentTrip && truck.currentTrip.timeRange
                  ? truck.currentTrip.timeRange
                  : "-"}
              </div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CirclePause className="size-4 text-red-500" />
            <div className="flex flex-col">
              <div className="font-bold text-base">
                {truck.currentTrip && truck.currentTrip.to
                  ? truck.currentTrip.to
                  : "-"}
              </div>
              <div className="text-xs text-muted-foreground">
                {truck.currentTrip && truck.currentTrip.endDate
                  ? truck.currentTrip.endDate
                  : "-"}
              </div>
              <div className="text-xs text-muted-foreground">
                {truck.currentTrip && truck.currentTrip.timeRange
                  ? truck.currentTrip.timeRange
                  : "-"}
              </div>
            </div>
          </div>
        </Card>

        {/* Monthly Revenue */}
        <Card>
          <CardHeader>
            <CardDescription>Generate Monthly Revenue</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {typeof truck?.monthlyRevenue === "number"
                ? `$${truck.monthlyRevenue.toLocaleString()}`
                : "-"}
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
              Compared to last month’s performance
            </div>
          </CardFooter>
        </Card>

        {/* Monthly Trips */}
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Total Monthly Trips</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {truck.monthlyTrips || "200"}
            </CardTitle>
          </CardHeader>

          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Trips scheduled this month{" "}
              <IconTrendingUp className="size-4 text-green-500" />
            </div>
            <div className="text-muted-foreground">
              Compared to last month’s performance
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
          <Card className="!p-4 !mb-4">Trips list goes here</Card>
        </TabsContent>
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

export default Truckpage;
