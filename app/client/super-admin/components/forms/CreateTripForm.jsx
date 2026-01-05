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
  const { trucks, form, setForm, handleCreateTrip, tripsError, loading } =
    useSuperAdmin();

  const availableTrucks = (trucks || []).filter(
    (t) => t.status === "available"
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    // use provider handler that builds payload from form state
    const result = await handleCreateTrip(e);

    if (result) {
      toast.success("Trip created");
      if (onSuccess) onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="border-none w-full max-w-xl mx-auto">
        <CardHeader>
          <CardTitle>Create Trip</CardTitle>
        </CardHeader>

        <CardContent className="grid grid-cols-1 gap-4">
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
                {availableTrucks.length ? (
                  availableTrucks.map((t) => (
                    <SelectItem key={t._id} value={t._id}>
                      {t.plateNumber} ({t.model})
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="" disabled>
                    No available trucks
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
            <Select
              value={form.tripStatus}
              onValueChange={(val) =>
                setForm((f) => ({ ...f, tripStatus: val }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
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
        </CardContent>

        {tripsError && (
          <div className="text-red-500 text-sm px-6 pb-2">{tripsError}</div>
        )}

        <CardFooter className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Trip"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
