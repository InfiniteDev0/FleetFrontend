"use client";
import React, { useEffect, useMemo, useState } from "react";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";
import { useSuperAdmin } from "../../../context/SuperAdminContext";
import { BarChart2, ChevronDown, DollarSign, Truck } from "lucide-react";

const FULL_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function ReportsPage() {
  const { trips, fetchTrips, fetchExpensesByTrip, loading } =
    useSuperAdmin() || {};
  const [allExpenses, setAllExpenses] = useState([]);
  const [expensesLoading, setExpensesLoading] = useState(false);

  const now = new Date();
  const year = now.getFullYear();

  // Single source of truth for month selection
  const currentMonthName = now.toLocaleString("default", { month: "long" });
  const [selectedMonth, setSelectedMonth] = useState(currentMonthName);
  const selectedMonthIdx = FULL_MONTHS.indexOf(selectedMonth);

  // Fetch trips on mount if not loaded
  useEffect(() => {
    if (!trips || trips.length === 0) {
      fetchTrips && fetchTrips();
    }
  }, []);

  // Only completed trips with endTime
  const completedTrips = useMemo(
    () =>
      (trips || []).filter(
        (trip) => trip.status === "completed" && trip.endTime
      ),
    [trips]
  );

  // Fetch all expenses for completed trips after trips are loaded
  useEffect(() => {
    async function fetchAllExpenses() {
      setExpensesLoading(true);
      const expenseResults = await Promise.all(
        completedTrips.map((trip) => fetchExpensesByTrip(trip._id))
      );
      setAllExpenses(expenseResults.flat());
      setExpensesLoading(false);
    }
    if (completedTrips.length > 0) {
      fetchAllExpenses();
    } else {
      setAllExpenses([]);
    }
  }, [completedTrips.length]);

  // Helper: get all expenses for a set of trips
  function getExpensesForTrips(tripArr) {
    if (!allExpenses || !Array.isArray(allExpenses)) return [];
    const tripIds = tripArr.map((t) => t._id);
    return allExpenses.filter((exp) => tripIds.includes(exp.tripId));
  }

  // Date helpers (using endTime)
  function isToday(date) {
    const d = new Date(date);
    return (
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  }
  function isThisMonth(date) {
    const d = new Date(date);
    return d.getFullYear() === year && d.getMonth() === selectedMonthIdx;
  }
  function isThisYear(date) {
    const d = new Date(date);
    return d.getFullYear() === year;
  }

  // Groups
  const tripsToday = completedTrips.filter((trip) => isToday(trip.endTime));
  const tripsMonth = completedTrips.filter((trip) => isThisMonth(trip.endTime));
  const tripsYear = completedTrips.filter((trip) => isThisYear(trip.endTime));

  // Helper to get trip expenses with user info for a set of trips
  function getTripDetails(tripArr) {
    return tripArr.map((trip) => {
      const tripExpenses = allExpenses.filter((exp) => exp.tripId === trip._id);
      return {
        ...trip,
        expenses: tripExpenses,
      };
    });
  }

  // PDF export helpers
  async function exportDailyReportPDF(tripArr, dateLabel) {
    const mod = await import("./reportpdfstructure");
    await mod.generateDailyReportPDF(tripArr, dateLabel);
  }

  async function exportMonthlyReportPDF(tripArr, monthLabel, year) {
    const mod = await import("./reportpdfstructure");
    await mod.generateMonthlyReportPDF(tripArr, monthLabel, year);
  }

  async function exportYearlyReportPDF(tripArr, year) {
    const mod = await import("./reportpdfstructure");
    await mod.generateYearlyReportPDF(tripArr, year);
  }

  // Expenses for each group
  const expensesToday = getExpensesForTrips(tripsToday);
  const expensesMonth = getExpensesForTrips(tripsMonth);
  const expensesYear = getExpensesForTrips(tripsYear);

  // Totals for each group
  const totalTripsToday = tripsToday.length;
  const totalTripsMonth = tripsMonth.length;
  const totalTripsYear = tripsYear.length;

  const totalExpensesToday = expensesToday.reduce(
    (sum, exp) => sum + Number(exp.amount || 0),
    0
  );
  const totalExpensesMonth = expensesMonth.reduce(
    (sum, exp) => sum + Number(exp.amount || 0),
    0
  );
  const totalExpensesYear = expensesYear.reduce(
    (sum, exp) => sum + Number(exp.amount || 0),
    0
  );

  // Profit: for completed trips, profit is transport (backend already deducts expenses)
  const totalProfitToday = tripsToday.reduce(
    (sum, trip) => sum + Number(trip.transport || 0),
    0
  );
  const totalProfitMonth = tripsMonth.reduce(
    (sum, trip) => sum + Number(trip.transport || 0),
    0
  );
  const totalProfitYear = tripsYear.reduce(
    (sum, trip) => sum + Number(trip.transport || 0),
    0
  );

  // Analytics: breakdown by month for the year (short labels for table)
  const SHORT_MONTHS = Array.from({ length: 12 }, (_, i) =>
    new Date(year, i, 1).toLocaleString("default", { month: "short" })
  );
  const monthlyAnalytics = SHORT_MONTHS.map((m, idx) => {
    const tripsInMonth = tripsYear.filter(
      (trip) => new Date(trip.endTime).getMonth() === idx
    );
    const expensesInMonth = getExpensesForTrips(tripsInMonth);
    const profit = tripsInMonth.reduce(
      (sum, trip) => sum + Number(trip.transport || 0),
      0
    );
    return {
      month: m,
      trips: tripsInMonth.length,
      expenses: expensesInMonth.reduce(
        (sum, exp) => sum + Number(exp.amount || 0),
        0
      ),
      profit,
    };
  });

  if (loading || expensesLoading) {
    return (
      <div className="!p-6 text-muted-foreground">Loading report data...</div>
    );
  }
  return (
    <div className="!py-6 !px-4 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Today Overview Card */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardDescription className="text-muted-foreground">
            Today Overview
          </CardDescription>
          <CardTitle className="text-2xl ">Today&apos;s Report</CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className="!px-2 !py-0.5 text-sm flex items-center gap-1 text-blue-700 border-blue-700"
            >
              <BarChart2 className="size-4" /> {now.toLocaleDateString()}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex flex-col gap-2 !pt-2">
          <div className="flex items-center w-full justify-between gap-2">
            <Badge
              variant="outline"
              className="!px-2 !py-0.5 text-sm flex items-center gap-1 text-blue-600 border-blue-600"
            >
              <Truck className="size-4" /> Total Trips
            </Badge>
            <span className=" text-lg ml-auto">{totalTripsToday}</span>
          </div>
          <div className="flex items-center w-full justify-between gap-2">
            <Badge
              variant="outline"
              className="!px-2 !py-0.5 text-sm flex items-center gap-1 text-red-600 border-red-600"
            >
              <DollarSign className="size-4" /> Total Expenses
            </Badge>
            <span className=" text-lg ml-auto">
              ${totalExpensesToday.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center w-full justify-between gap-2">
            <Badge
              variant="outline"
              className="!px-2 !py-0.5 text-sm flex items-center gap-1 text-green-600 border-green-600"
            >
              <BarChart2 className="size-4" /> Total Profit
            </Badge>
            <span className=" text-lg ml-auto">
              ${totalProfitToday.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-end w-full !mt-4">
            <Button
              onClick={() =>
                exportDailyReportPDF(
                  getTripDetails(tripsToday),
                  "Today's Report"
                )
              }
              disabled={totalTripsToday === 0}
            >
              Download Today&apos;s Report
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Monthly Report Card */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardDescription className="text-muted-foreground">
            Monthly Analysis
          </CardDescription>
          <CardTitle className="text-2xl ">Monthly Report</CardTitle>
          <CardAction>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Badge
                  variant="outline"
                  className="!px-2 !py-0.5 text-sm flex items-center gap-1 text-blue-700 border-blue-700 cursor-pointer"
                >
                  <BarChart2 className="size-4" /> {selectedMonth}
                  <ChevronDown className="!ml-4" />
                </Badge>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-40 max-h-48 overflow-y-auto"
                align="end"
              >
                {FULL_MONTHS.map((m) => (
                  <DropdownMenuItem
                    key={m}
                    onSelect={() => setSelectedMonth(m)}
                    className={`!px-3 !py-2 ${
                      m === selectedMonth
                        ? "bg-blue-100 text-blue-700 font-semibold"
                        : "text-muted-foreground"
                    }`}
                  >
                    {m}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex flex-col gap-2 !pt-2">
          <div className="flex items-center w-full justify-between gap-2">
            <Badge
              variant="outline"
              className="!px-2 !py-0.5 text-sm flex items-center gap-1 text-blue-600 border-blue-600"
            >
              <Truck className="size-4" /> Total Trips
            </Badge>
            <span className=" text-base">{totalTripsMonth}</span>
          </div>
          <div className="flex items-center w-full justify-between gap-2">
            <Badge
              variant="outline"
              className="!px-2 !py-0.5 text-sm flex items-center gap-1 text-red-600 border-red-600"
            >
              <DollarSign className="size-4" /> Total Expenses
            </Badge>
            <span className=" text-base">
              ${totalExpensesMonth.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center w-full justify-between gap-2">
            <Badge
              variant="outline"
              className="!px-2 !py-0.5 text-sm flex items-center gap-1 text-green-600 border-green-600"
            >
              <BarChart2 className="size-4" /> Total Profit
            </Badge>
            <span className=" text-base">
              ${totalProfitMonth.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-end w-full !mt-4">
            <Button
              onClick={() =>
                exportMonthlyReportPDF(
                  getTripDetails(tripsMonth),
                  selectedMonth,
                  year
                )
              }
              disabled={totalTripsMonth === 0}
            >
              Download Monthly Report
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Yearly Report Card */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardDescription className="text-muted-foreground">
            Yearly Analysis
          </CardDescription>
          <CardTitle className="text-2xl ">Yearly Report</CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className="!px-2 !py-0.5 text-sm flex items-center gap-1 text-blue-700 border-blue-700"
            >
              <BarChart2 className="size-4" /> {year}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex flex-col gap-2 !pt-2">
          <div className="flex items-center w-full justify-between gap-2">
            <Badge
              variant="outline"
              className="!px-2 !py-0.5 text-sm flex items-center gap-1 text-blue-600 border-blue-600"
            >
              <Truck className="size-4" /> Total Trips
            </Badge>
            <span className=" text-base">{totalTripsYear}</span>
          </div>
          <div className="flex items-center w-full justify-between gap-2">
            <Badge
              variant="outline"
              className="!px-2 !py-0.5 text-sm flex items-center gap-1 text-red-600 border-red-600"
            >
              <DollarSign className="size-4" /> Total Expenses
            </Badge>
            <span className=" text-base">
              ${totalExpensesYear.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center w-full justify-between gap-2">
            <Badge
              variant="outline"
              className="!px-2 !py-0.5 text-sm flex items-center gap-1 text-green-600 border-green-600"
            >
              <BarChart2 className="size-4" /> Total Profit
            </Badge>
            <span className=" text-base">
              ${totalProfitYear.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-end w-full !mt-4">
            <Button
              onClick={() =>
                exportYearlyReportPDF(getTripDetails(tripsYear), year)
              }
              disabled={totalTripsYear === 0}
            >
              Download Yearly Report
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Analytics Table */}
      <div className="md:col-span-2 !mt-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">
              Monthly Analytics ({year})
            </CardTitle>
            <CardDescription>
              Trips, Expenses, and Profit for each month
            </CardDescription>
          </CardHeader>
          <CardFooter className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="!px-3 !py-2 text-left">Month</TableHead>
                  <TableHead className="!px-3 !py-2 text-left">Trips</TableHead>
                  <TableHead className="!px-3 !py-2 text-left">
                    Expenses
                  </TableHead>
                  <TableHead className="!px-3 !py-2 text-left">
                    Profit
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlyAnalytics.map((m) => (
                  <TableRow key={m.month}>
                    <TableCell className="!px-3 !py-2 font-medium">
                      {m.month}
                    </TableCell>
                    <TableCell className="!px-3 !py-2">{m.trips}</TableCell>
                    <TableCell className="!px-3 !py-2">
                      ${m.expenses.toLocaleString()}
                    </TableCell>
                    <TableCell
                      className={`!px-3 !py-2 font-semibold ${
                        m.profit >= 0 ? "text-green-700" : "text-red-700"
                      }`}
                    >
                      ${m.profit.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default ReportsPage;
