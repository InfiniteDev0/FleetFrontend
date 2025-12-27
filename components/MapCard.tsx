"use client";

import * as React from "react";
import {
  IconCircleCheckFilled,
  IconLoader,
  IconMapPin,
  IconRefresh,
  IconTruck,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFleetData } from "@/app/hooks/useFleetData";

export function MapCard() {
  const [filterStatus, setFilterStatus] = React.useState<string>("all");
  const { trucks, drivers, loading, refetch } = useFleetData();
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  // Calculate statistics
  const stats = React.useMemo(() => {
    return {
      total: trucks.length,
      active: 0,
      available: 0,
      maintenance: 1,
      ongoingTrips: 0,
    };
  }, [trucks]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <IconMapPin className="size-5 text-primary" />
              Fleet Locations
            </CardTitle>
            <CardDescription>
              Real-time tracking of {stats.total} trucks across Kenya
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <IconRefresh
              className={`size-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline !ml-2">Refresh</span>
          </Button>
        </div>

        {/* Statistics Bar */}
        <div className="flex flex-wrap items-center gap-3 !pt-4 border-t">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1.5">
              <IconTruck className="size-3" />
              <span className="font-semibold">{stats.total}</span>
              <span className="text-muted-foreground">Total</span>
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="gap-1.5 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800"
            >
              <IconCircleCheckFilled className="size-3 fill-green-500" />
              <span className="font-semibold">{stats.active}</span>
              <span className="text-muted-foreground">Active</span>
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="gap-1.5 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"
            >
              <IconCircleCheckFilled className="size-3 fill-blue-500" />
              <span className="font-semibold">{stats.available}</span>
              <span className="text-muted-foreground">Available</span>
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="gap-1.5 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800"
            >
              <IconLoader className="size-3" />
              <span className="font-semibold">{stats.maintenance}</span>
              <span className="text-muted-foreground">Maintenance</span>
            </Badge>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Trucks</SelectItem>
                <SelectItem value="in-use">Active Trips</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Map Container */}
        <div className="relative h-[450px] md:h-[500px] overflow-hidden rounded-lg border bg-muted/50">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d510564.6498664426!2d36.68198281249999!3d-1.3032092999999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f1172d84d49a7%3A0xf7cf0254b297924c!2sNairobi%2C%20Kenya!5e0!3m2!1sen!2ske!4v1734567890123!5m2!1sen!2ske"
            className="h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
          {/* Overlay Legend */}
          <div className="absolute bottom-4 left-4 right-4 md:right-auto md:w-auto bg-background/95 backdrop-blur-sm border rounded-lg !p-3 shadow-lg">
            <div className="text-sm font-semibold !mb-2">Legend</div>
            <div className="flex flex-wrap gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="size-3 rounded-full bg-green-500" />
                <span>Active Trips ({stats.active})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="size-3 rounded-full bg-blue-500" />
                <span>Available ({stats.available})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="size-3 rounded-full bg-yellow-500" />
                <span>Maintenance ({stats.maintenance})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ongoing Trips Summary */}
        {stats.ongoingTrips > 0 && (
          <div className="rounded-lg border bg-muted/30  !mt-2 !p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Ongoing Trips Today</p>
                <p className="text-xs text-muted-foreground !mt-1">
                  {stats.ongoingTrips} active trip
                  {stats.ongoingTrips !== 1 ? "s" : ""} in progress
                </p>
              </div>
              <Badge
                variant="outline"
                className="text-green-600 dark:text-green-400 border-green-200 dark:border-green-800"
              >
                <IconCircleCheckFilled className="size-3 fill-green-500 mr-1" />
                {stats.ongoingTrips} Active
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
