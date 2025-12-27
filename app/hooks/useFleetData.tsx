"use client";

import * as React from "react";
import { useDate } from "@/app/context/DateContext";

// Format date for comparison (YYYY-MM-DD)
function formatDateForComparison(date: Date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")}`;
}

interface Truck {
  _id?: string;
  id?: number;
  plateNumber: string;
  model: string;
  capacity: number;
  status: "available" | "in-use" | "maintenance" | "ended";
  assignedDrivers: string[] | any[];
  cityFrom?: string;
  cityTo?: string;
  miles?: number;
  mileageRemaining?: number;
  mileageCovered?: number;
  tripValue?: number;
  tripDate?: string;
  destinationMonth?: string;
  destinationYear?: string;
  trips?: number;
  todayTrips?: number;
  createdBy?: string;
  updatedBy?: string;
}

interface Driver {
  _id?: string;
  id?: number;
  name: string;
  phone: string;
  licenseNumber: string;
  salaryType: string;
  status: string;
  assignedTrucks?: string[];
}

interface FleetData {
  trucks: Truck[];
  drivers: Driver[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useFleetData(): FleetData {
  const { selectedDate } = useDate();
  const [trucks, setTrucks] = React.useState<Truck[]>([]);
  const [drivers, setDrivers] = React.useState<Driver[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      // Fetch trucks and drivers in parallel
      const [trucksRes, driversRes] = await Promise.all([
        fetch(`${apiUrl}/api/trucks`, {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }),
        fetch(`${apiUrl}/api/drivers`, {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }),
      ]);

      if (!trucksRes.ok) {
        throw new Error(`Failed to fetch trucks: ${trucksRes.statusText}`);
      }
      if (!driversRes.ok) {
        throw new Error(`Failed to fetch drivers: ${driversRes.statusText}`);
      }

      const trucksData = await trucksRes.json();
      const driversData = await driversRes.json();

      // Transform backend data to match frontend schema
      const transformedTrucks = (trucksData.data || trucksData).map(
        (truck: any, index: number) => ({
          id: truck._id
            ? parseInt(truck._id.slice(-4), 16) || index + 1
            : truck.id || index + 1,
          plateNumber: truck.plateNumber,
          model: truck.model,
          capacity: truck.capacity,
          status: truck.status,
          assignedDrivers:
            truck.assignedDrivers?.map((d: any) =>
              typeof d === "object" ? d._id || d.id : d
            ) || [],
          cityFrom: truck.cityFrom,
          cityTo: truck.cityTo,
          miles: truck.miles,
          mileageRemaining: truck.mileageRemaining,
          mileageCovered: truck.mileageCovered,
          tripValue: truck.tripValue,
          tripDate: truck.tripDate,
          destinationMonth: truck.destinationMonth,
          destinationYear: truck.destinationYear,
          createdBy: truck.createdBy,
          updatedBy: truck.updatedBy,
        })
      );

      const transformedDrivers = (driversData.data || driversData).map(
        (driver: any, index: number) => ({
          id: driver._id
            ? parseInt(driver._id.slice(-4), 16) || index + 1
            : driver.id || index + 1,
          name: driver.name,
          phone: driver.phone,
          licenseNumber: driver.licenseNumber,
          salaryType: driver.salaryType,
          status: driver.status,
          assignedTrucks: driver.assignedTrucks || [],
          createdBy: driver.createdBy,
          updatedBy: driver.updatedBy,
        })
      );

      setTrucks(transformedTrucks);
      setDrivers(transformedDrivers);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch fleet data"
      );
      console.error("Error fetching fleet data:", err);
      // Fallback to local data if API fails
      try {
        const localData = await import("../client/super-admin/data.json");
        // Map status to allowed Truck type values
        const allowedStatuses = ["available", "in-use", "maintenance", "ended"];
        const trucks = (localData.default.trucks || []).map((truck: any) => ({
          ...truck,
          status: allowedStatuses.includes(truck.status)
            ? truck.status
            : "available",
        }));
        setTrucks(trucks);
        setDrivers(localData.default.drivers || []);
      } catch (localErr) {
        console.error("Failed to load local data:", localErr);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    trucks,
    drivers,
    loading,
    error,
    refetch: fetchData,
  };
}

// Helper hook to get trips filtered by selected date
export function useTripsForDate() {
  const { selectedDate } = useDate();
  const { trucks, drivers, loading, error, refetch } = useFleetData();

  const todayStr = React.useMemo(() => formatDateForComparison(new Date()), []);
  const selectedDateStr = React.useMemo(
    () => formatDateForComparison(selectedDate),
    [selectedDate]
  );

  const tripsForDate = React.useMemo(() => {
    return trucks
      .map((truck) => {
        const tripDate = truck.tripDate || todayStr;
        const matchesDate = tripDate === selectedDateStr;

        let status = truck.status as
          | "available"
          | "in-use"
          | "maintenance"
          | "ended";
        if (!matchesDate && truck.status === "in-use") {
          status = "ended";
        }

        return {
          ...truck,
          status,
          tripDate,
          destinationMonth:
            truck.destinationMonth ||
            String(new Date().getMonth() + 1).padStart(2, "0"),
          destinationYear:
            truck.destinationYear || String(new Date().getFullYear()),
        };
      })
      .filter((truck) => {
        const tripDate = truck.tripDate || todayStr;
        return tripDate === selectedDateStr;
      });
  }, [trucks, selectedDateStr, todayStr]);

  return {
    trips: tripsForDate,
    trucks,
    drivers,
    loading,
    error,
    refetch,
  };
}
