"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useSuperAdmin } from "../../context/SuperAdminContext";
import { Calendar24 } from "../DatePicker";
import { toast } from "sonner";

export default function TripCreateForm({ onSuccess }) {
  const {
    trucks,
    trips,
    form,
    setForm,
    handleCreateTrip,
    tripsError,
    loading,
  } = useSuperAdmin();

  // Show all trucks in selector
  const allTrucks = trucks || [];

  // Helper: check if selected truck is in-use or has in-progress trip
  const selectedTruck = allTrucks.find(
    (t) => String(t._id || t.id) === String(form.truckId)
  );
  const truckHasActiveTrip = (trips || []).some((trip) => {
    const truckRaw = trip.truckId;
    const truckObj = truckRaw && typeof truckRaw === "object" ? truckRaw : null;
    const tripTruckId = truckObj?._id || truckRaw;
    return (
      String(tripTruckId) === String(form.truckId) &&
      trip.status === "in-progress"
    );
  });
  const truckIsInUse = selectedTruck && selectedTruck.status === "in-use";
  const forceScheduled = truckHasActiveTrip || truckIsInUse;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Always send 'scheduled' status for new trips, especially if truck is in use or has active trip
    setForm((f) => ({ ...f, tripStatus: "scheduled" }));
    // Wait for state update before calling handleCreateTrip
    setTimeout(async () => {
      const result = await handleCreateTrip(e);
      if (result) {
        toast.success("Trip created");
        if (onSuccess) onSuccess();
        // Clear form after creation
        setForm({
          truckId: "",
          product: "",
          routeOrigin: "",
          routeDestination: "",
          transport: "",
          tripStatus: "scheduled",
          startTime: null,
          endTime: null,
        });
      }
    }, 0);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full  rounded-md bg-background"
    >
      {/* Header */}
      <div className="!p-4 ">
        <h2 className="text-lg font-semibold">Create Trip</h2>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 gap-4 md:!p-4">
        {/* Truck */}
        <div>
          <Label>Truck</Label>
          <Select
            value={form.truckId}
            onValueChange={(val) => setForm((f) => ({ ...f, truckId: val }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select truck" />
            </SelectTrigger>
            <SelectContent>
              {allTrucks.length ? (
                allTrucks.map((t) => (
                  <SelectItem key={t._id || t.id} value={t._id || t.id}>
                    {t.plateNumber} ({t.model})
                    {t.status === "in-use"
                      ? " [In Use]"
                      : t.status === "maintenance"
                      ? " [Maintenance]"
                      : t.status === "available"
                      ? " [Available]"
                      : ""}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="" disabled>
                  No trucks
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Product */}
        <div>
          <Label>Product</Label>
          <Select
            value={form.product}
            onValueChange={(val) => setForm((f) => ({ ...f, product: val }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select product" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AGO">AGO</SelectItem>
              <SelectItem value="PMS">PMS</SelectItem>
              <SelectItem value="JET A-1">JET A-1</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Transport */}
        <div>
          <Label>Transport Amount (USD)</Label>
          <Input
            type="number"
            placeholder="e.g. 5000"
            value={form.transport}
            onChange={(e) =>
              setForm((f) => ({ ...f, transport: e.target.value }))
            }
            min={0}
            step="0.01"
          />
        </div>

        {/* Origin City */}
        <div>
          <Label>Origin City</Label>
          <Input
            placeholder="e.g. Nairobi"
            value={form.routeOrigin}
            onChange={(e) =>
              setForm((f) => ({ ...f, routeOrigin: e.target.value }))
            }
          />
        </div>

        {/* Destination City */}
        <div>
          <Label>Destination City</Label>
          <Input
            placeholder="e.g. Mombasa"
            value={form.routeDestination}
            onChange={(e) =>
              setForm((f) => ({ ...f, routeDestination: e.target.value }))
            }
          />
        </div>

        {/* Status */}
        <div>
          <Label>Status</Label>
          <Input
            value={
              forceScheduled ? "scheduled" : form.tripStatus || "scheduled"
            }
            disabled
            readOnly
            className="bg-muted text-muted-foreground"
          />
        </div>

        <Calendar24
          value={form.startTime}
          onChange={(d) =>
            setForm((f) => ({
              ...f,
              startTime: d instanceof Date ? d.toISOString() : d,
            }))
          }
        />
      </div>

      {/* Footer */}
      <div className="flex justify-end !p-4 border-t">
        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Trip"}
        </Button>
      </div>
    </form>
  );
}
