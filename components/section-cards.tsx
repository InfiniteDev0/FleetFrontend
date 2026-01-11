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

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useSuperAdmin } from "@/app/context/SuperAdminContext";

// Helper: trend color
function getTrendColor(value: number) {
  if (value > 0) return "text-green-600";
  if (value < 0) return "text-red-600";
  return "text-muted-foreground";
}

export function SectionCards() {
  const { trucks, trips, loading } = useSuperAdmin();
  const [period, setPeriod] = React.useState("month");

  // Helper: get start of week/month/year
  function startOf(period: string, date: Date) {
    const d = new Date(date);
    if (period === "week") {
      const day = d.getDay();
      d.setDate(d.getDate() - day);
      d.setHours(0, 0, 0, 0);
      return d;
    }
    if (period === "month") {
      d.setDate(1);
      d.setHours(0, 0, 0, 0);
      return d;
    }
    if (period === "year") {
      d.setMonth(0, 1);
      d.setHours(0, 0, 0, 0);
      return d;
    }
    d.setHours(0, 0, 0, 0);
    return d;
  }

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

    // --- Revenue Calculation ---
    // Only completed trips (status === 'completed')
    const now = new Date();
    let filteredTrips = (trips || []).filter(
      (trip: any) => trip.status === "completed" && trip.endTime
    );
    if (period === "today") {
      filteredTrips = filteredTrips.filter((trip: any) => {
        const end = new Date(trip.endTime);
        return end.toDateString() === now.toDateString();
      });
    } else if (period === "week") {
      const weekStart = startOf("week", now);
      filteredTrips = filteredTrips.filter((trip: any) => {
        const end = new Date(trip.endTime);
        return end >= weekStart && end <= now;
      });
    } else if (period === "month") {
      const monthStart = startOf("month", now);
      filteredTrips = filteredTrips.filter((trip: any) => {
        const end = new Date(trip.endTime);
        return end >= monthStart && end <= now;
      });
    } else if (period === "year") {
      const yearStart = startOf("year", now);
      filteredTrips = filteredTrips.filter((trip: any) => {
        const end = new Date(trip.endTime);
        return end >= yearStart && end <= now;
      });
    }
    // Net profit = transport (already net profit for completed trips)
    const netProfit = filteredTrips.reduce((sum: number, trip: any) => {
      return sum + Number(trip.transport);
    }, 0);

    return {
      totalTrucks,
      totalCapacity,
      activeTrucks,
      maintenanceTrucks,
      availableTrucks,
      netProfit,
      filteredTrips,
    };
  }, [trucks, trips, period]);

  if (loading) {
    return (
      <div className="!p-6 text-muted-foreground">Loading fleet stats...</div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 !px-4 lg:px-6 xl:grid-cols-2 5xl:grid-cols-4  
    *:data-[slot=card]:bg-gradient-to-t
    *:data-[slot=card]:from-primary/5
    *:data-[slot=card]:to-card
    dark:*:data-[slot=card]:bg-card
   items-stretch">
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
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardDescription className="text-yellow-500">
              Revenue
            </CardDescription>
            {stats.filteredTrips.length === 0 ? (
              <CardTitle className="text-2xl font-semibold tabular-nums text-muted-foreground">
                No completed trips
              </CardTitle>
            ) : (
              <CardTitle className="text-2xl font-semibold tabular-nums">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(stats.netProfit)}
              </CardTitle>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger size="sm" className="min-w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start !gap-1.5 text-sm">
          <div className="flex !gap-2 font-medium">
            Revenue from completed trips
            <IconRoute className="size-4 text-muted-foreground" />
          </div>
          <div className="text-muted-foreground">
            Sum of transport for completed trips (filtered by end date)
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
