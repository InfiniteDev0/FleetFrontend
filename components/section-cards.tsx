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
import { useDate } from "@/app/context/DateContext";
import { useFleetData } from "@/app/hooks/useFleetData";

// Helper function to color the trend icons
function getTrendColor(value: number) {
  if (value > 0) return "text-green-600";
  if (value < 0) return "text-red-600";
  return "text-muted-foreground";
}

// Format date for comparison (YYYY-MM-DD)
function formatDateForComparison(date: Date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")}`;
}

export function SectionCards() {
  const { selectedDate } = useDate();
  const { trucks, drivers, loading } = useFleetData();
  const todayStr = formatDateForComparison(new Date());
  const selectedDateStr = formatDateForComparison(selectedDate);
  const isToday = selectedDateStr === todayStr;

  // Calculate today's statistics
  const stats = React.useMemo(() => {
    const currentTodayStr = formatDateForComparison(new Date());
    const currentSelectedDateStr = formatDateForComparison(selectedDate);

    // Filter trucks with trips for selected date
    const todayTrips = trucks.filter((truck) => {
      const tripDate = truck.tripDate || currentTodayStr;
      return tripDate === currentSelectedDateStr;
    });

    // Active trucks today (in-use status)
    const activeTrucks = todayTrips.filter((t) => t.status === "in-use");

    // Ended trips today
    const endedTrips = todayTrips.filter((t) => t.status === "ended");

    // Total trucks (all trucks in fleet)
    const totalTrucks = trucks.length;

    // Today's revenue (from ended trips today)
    const todayRevenue = endedTrips.reduce((sum, trip) => {
      return sum + (trip.tripValue || 0);
    }, 0);

    // Today's trips count
    const todayTripsCount = todayTrips.length;

    // Calculate changes (comparing to yesterday - simplified)
    const yesterdayStr = formatDateForComparison(
      new Date(selectedDate.getTime() - 24 * 60 * 60 * 1000)
    );
    const yesterdayTrips = trucks.filter((truck) => {
      const tripDate = truck.tripDate || currentTodayStr;
      return tripDate === yesterdayStr;
    });
    const yesterdayActive = yesterdayTrips.filter(
      (t) => t.status === "in-use"
    ).length;
    const yesterdayRevenue = yesterdayTrips
      .filter((t) => t.status === "ended")
      .reduce((sum, trip) => sum + (trip.tripValue || 0), 0);
    const yesterdayTripsCount = yesterdayTrips.length;

    const activeTrucksChange =
      yesterdayActive > 0
        ? Math.round(
            ((activeTrucks.length - yesterdayActive) / yesterdayActive) * 100
          )
        : activeTrucks.length > 0
        ? 100
        : 0;

    const revenueChange =
      yesterdayRevenue > 0
        ? Math.round(
            ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100
          )
        : todayRevenue > 0
        ? 100
        : 0;

    const tripsChange =
      yesterdayTripsCount > 0
        ? Math.round(
            ((todayTripsCount - yesterdayTripsCount) / yesterdayTripsCount) *
              100
          )
        : todayTripsCount > 0
        ? 100
        : 0;

    return {
      totalTrucks,
      activeTrucks: activeTrucks.length,
      todayRevenue,
      todayTripsCount,
      activeTrucksChange,
      revenueChange,
      tripsChange,
    };
  }, [selectedDate, trucks]);

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-2 gap-4 !px-4 *:data-[slot=card]:bg-gradient-to-t  from-cyan-200 to-red-400 *:data-[slot=card]:shadow-xs lg:!px-6 @xl/main:grid-cols-3 @5xl/main:grid-cols-4">
      {/* Total Trucks */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="text-cyan-500">
            Total Trucks
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.totalTrucks}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTruck className="size-4 ml-2 text-muted-foreground" />
              Fleet Size
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex gap-2 font-medium">
            Total fleet capacity{" "}
            <IconTruck className="size-4 text-muted-foreground" />
          </div>
          <div className="text-muted-foreground">All trucks in fleet</div>
        </CardFooter>
      </Card>

      {/* Active Trucks Today */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="text-green-500">
            {isToday
              ? "Active Trucks Today"
              : `Active Trucks (${selectedDate.toLocaleDateString()})`}
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.activeTrucks}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {stats.activeTrucksChange !== 0 && (
                <IconTrendingUp
                  className={`size-4 ml-2 ${getTrendColor(
                    stats.activeTrucksChange
                  )}`}
                />
              )}
              {stats.activeTrucksChange > 0 ? "+" : ""}
              {stats.activeTrucksChange}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex gap-2 font-medium">
            {isToday ? "On the road today" : "On the road"}{" "}
            <IconTruck className="size-4 text-muted-foreground" />
          </div>
          <div className="text-muted-foreground">
            {isToday ? "Currently in transit" : "Trips in progress"}
          </div>
        </CardFooter>
      </Card>

      {/* Today's Revenue */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="text-yellow-500">
            {isToday
              ? "Today's Revenue"
              : `Revenue (${selectedDate.toLocaleDateString()})`}
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            ${stats.todayRevenue.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {stats.revenueChange !== 0 && (
                <IconTrendingUp
                  className={`size-4 ml-2 ${getTrendColor(
                    stats.revenueChange
                  )}`}
                />
              )}
              {stats.revenueChange > 0 ? "+" : ""}
              {stats.revenueChange}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex gap-2 font-medium">
            {isToday ? "Completed trips today" : "Completed trips"}{" "}
            <IconTrendingUp
              className={`size-4 ${getTrendColor(stats.revenueChange)}`}
            />
          </div>
          <div className="text-muted-foreground">
            {isToday ? "From finished trips" : "Total trip value"}
          </div>
        </CardFooter>
      </Card>

      {/* Maintenance Trucks */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="text-red-500">
            Maintenance
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {trucks.filter((t) => t.status === "maintenance").length}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTools className="size-4 ml-2 text-muted-foreground" />
              In Service
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex gap-2 font-medium">
            Under maintenance{" "}
            <IconTools className="size-4 text-muted-foreground" />
          </div>
          <div className="text-muted-foreground">Currently in repair</div>
        </CardFooter>
      </Card>

      {/* Trips Today */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="text-pink-500">
            {isToday
              ? "Trips Today"
              : `Trips (${selectedDate.toLocaleDateString()})`}
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.todayTripsCount}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {stats.tripsChange !== 0 && (
                <IconTrendingUp
                  className={`size-4 ml-2 ${getTrendColor(stats.tripsChange)}`}
                />
              )}
              {stats.tripsChange > 0 ? "+" : ""}
              {stats.tripsChange}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex gap-2 font-medium">
            {isToday ? "Total trips today" : "Total trips"}{" "}
            <IconRoute className="size-4 text-muted-foreground" />
          </div>
          <div className="text-muted-foreground">
            {isToday ? "Active and completed" : "All trips for this date"}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
