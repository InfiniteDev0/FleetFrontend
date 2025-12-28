"use client";

import * as React from "react";
import {
  IconTrendingUp,
  IconTruck,
  IconTools,
  IconRoute,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSuperAdmin } from "@/app/client/super-admin/context/SuperAdminContext";

// Helper: trend color
function getTrendColor(value: number) {
  if (value > 0) return "text-green-600";
  if (value < 0) return "text-red-600";
  return "text-muted-foreground";
}

export function SectionCards() {
  const { trucks, loading } = useSuperAdmin();

  // Stats calculation
  const stats = React.useMemo(() => {
    type Truck = {
      capacity?: number;
      status?: string;
      tripValue?: number;
    };
    const totalTrucks = trucks.length;
    const totalCapacity = trucks.reduce(
      (sum: number, t: Truck) => sum + (t.capacity || 0),
      0
    );

    const activeTrucks = trucks.filter(
      (t: Truck) => t.status === "in-use"
    ).length;
    const maintenanceTrucks = trucks.filter(
      (t: Truck) => t.status === "maintenance"
    ).length;
    const availableTrucks = trucks.filter(
      (t: Truck) => t.status === "available"
    ).length;
    const endedTrips = trucks.filter((t: Truck) => t.status === "ended");

    const todayRevenue = endedTrips.reduce(
      (sum: number, trip: Truck) => sum + (trip.tripValue || 0),
      0
    );

    return {
      totalTrucks,
      totalCapacity,
      activeTrucks,
      maintenanceTrucks,
      availableTrucks,
      todayRevenue,
    };
  }, [trucks]);

  if (loading) {
    return (
      <div className="!p-6 text-muted-foreground">Loading fleet stats...</div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 !px-4 lg:!px-6 @xl/main:grid-cols-3 @5xl/main:grid-cols-4">
      {/* Total Trucks */}
      <Card className="shadow-none">
        <CardHeader>
          <CardDescription className="text-cyan-500">
            Total Trucks
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums">
            {stats.totalTrucks}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTruck className="size-4 ml-2 text-muted-foreground" />
              Fleet Size
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start !gap-1.5 text-sm">
          <div className="flex !gap-2 font-medium">
            Total fleet capacity {stats.totalCapacity} tons
            <IconTruck className="size-4 text-muted-foreground" />
          </div>
          <div className="text-muted-foreground">All trucks in fleet</div>
        </CardFooter>
      </Card>

      {/* Active Trucks */}
      <Card>
        <CardHeader>
          <CardDescription className="text-green-500">
            Active Trucks
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums">
            {stats.activeTrucks}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp
                className={`size-4 ml-2 ${getTrendColor(stats.activeTrucks)}`}
              />
              In Use
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start !gap-1.5 text-sm">
          <div className="flex !gap-2 font-medium">
            Currently on the road
            <IconTruck className="size-4 text-muted-foreground" />
          </div>
          <div className="text-muted-foreground">Trucks marked as in-use</div>
        </CardFooter>
      </Card>

      {/* Available Trucks */}
      <Card>
        <CardHeader>
          <CardDescription className="text-blue-500">
            Available Trucks
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums">
            {stats.availableTrucks}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTruck className="size-4 ml-2 text-muted-foreground" />
              Ready
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start !gap-1.5 text-sm">
          <div className="flex !gap-2 font-medium">
            Idle trucks
            <IconTruck className="size-4 text-muted-foreground" />
          </div>
          <div className="text-muted-foreground">Available for assignment</div>
        </CardFooter>
      </Card>

      {/* Maintenance Trucks */}
      <Card>
        <CardHeader>
          <CardDescription className="text-red-500">
            Maintenance
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums">
            {stats.maintenanceTrucks}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTools className="size-4 ml-2 text-muted-foreground" />
              In Service
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start !gap-1.5 text-sm">
          <div className="flex !gap-2 font-medium">
            Under maintenance
            <IconTools className="size-4 text-muted-foreground" />
          </div>
          <div className="text-muted-foreground">Currently in repair</div>
        </CardFooter>
      </Card>

      {/* Revenue */}
      <Card>
        <CardHeader>
          <CardDescription className="text-yellow-500">Revenue</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(stats.todayRevenue)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp
                className={`size-4 ml-2 ${getTrendColor(stats.todayRevenue)}`}
              />
              Trips Value
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start !gap-1.5 text-sm">
          <div className="flex !gap-2 font-medium">
            Completed trips revenue
            <IconRoute className="size-4 text-muted-foreground" />
          </div>
          <div className="text-muted-foreground">
            Sum of trip values for ended trucks
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
