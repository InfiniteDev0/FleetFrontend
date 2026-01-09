"use client";
import React, { useEffect, useState } from "react";
import {
  Card,
  CardDescription,
  CardAction,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSuperAdmin } from "../context/SuperAdminContext";
import { Truck, DollarSign, BarChart2 } from "lucide-react";

const ReportsPage = () => {
  const { trips, fetchExpensesByTrip, loading } = useSuperAdmin() || {};
  const [allExpenses, setAllExpenses] = useState([]);
  const [expensesLoading, setExpensesLoading] = useState(false);
  const now = new Date();
  const year = now.getFullYear();
  const monthIdx = now.getMonth();
  const month = now.toLocaleString("default", { month: "long" });

  // Only completed trips for analytics
  const completedTrips = (trips || []).filter(
    (trip) => trip.status === "completed" && trip.endTime
  );

  // Fetch all expenses for completed trips
  useEffect(() => {
    async function fetchAllExpenses() {
      setExpensesLoading(true);
      const expenseResults = await Promise.all(
        completedTrips.map((trip) => fetchExpensesByTrip(trip._id))
      );
      // Flatten and merge all expenses
      const merged = expenseResults.flat();
      setAllExpenses(merged);
      setExpensesLoading(false);
    }
    if (completedTrips.length > 0) {
      fetchAllExpenses();
    } else {
      setAllExpenses([]);
    }
  }, [completedTrips.length]);

  // Group completed trips by year and month
  const tripsYear = completedTrips.filter(
    (trip) => new Date(trip.endTime).getFullYear() === year
  );
  const tripsMonth = tripsYear.filter(
    (trip) => new Date(trip.endTime).getMonth() === monthIdx
  );

  // Helper: get all expenses for a set of trips
  function getExpensesForTrips(tripArr) {
    if (!allExpenses || !Array.isArray(allExpenses)) return [];
    const tripIds = tripArr.map((t) => t._id);
    return allExpenses.filter((exp) => tripIds.includes(exp.tripId));
  }

  // Expenses for year/month (for completed trips only)
  const expensesYear = getExpensesForTrips(tripsYear);
  const expensesMonth = getExpensesForTrips(tripsMonth);

  // Totals
  const totalTrips = tripsYear.length;
  const monthlyTrips = tripsMonth.length;
  const totalExpenses = expensesYear.reduce(
    (sum, exp) => sum + Number(exp.amount || 0),
    0
  );
  const monthlyExpenses = expensesMonth.reduce(
    (sum, exp) => sum + Number(exp.amount || 0),
    0
  );
  const totalProfit =
    tripsYear.reduce((sum, trip) => sum + Number(trip.transport || 0), 0) -
    totalExpenses;
  const monthlyProfit =
    tripsMonth.reduce((sum, trip) => sum + Number(trip.transport || 0), 0) -
    monthlyExpenses;

  // Analytics: breakdown by month for the year
  const months = Array.from({ length: 12 }, (_, i) =>
    new Date(year, i, 1).toLocaleString("default", { month: "short" })
  );
  const monthlyAnalytics = months.map((m, idx) => {
    const tripsInMonth = tripsYear.filter(
      (trip) => new Date(trip.endTime).getMonth() === idx
    );
    const expensesInMonth = getExpensesForTrips(tripsInMonth);
    const profit =
      tripsInMonth.reduce((sum, trip) => sum + Number(trip.transport || 0), 0) -
      expensesInMonth.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
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
      {/* Overview Card */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardDescription className="text-muted-foreground">
            Year Overview
          </CardDescription>
          <CardTitle className="text-2xl ">Reports Overview</CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className="px-2 py-0.5 text-sm flex items-center gap-1 text-blue-700 border-blue-700"
            >
              <BarChart2 className="size-4" /> Analysis
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex flex-col gap-2 !pt-2">
          <div className="flex items-center w-full justify-between gap-2">
            <Badge
              variant="outline"
              className="px-2 py-0.5 text-sm flex items-center gap-1 text-blue-600 border-blue-600"
            >
              <Truck className="size-4" /> Total Trips
            </Badge>
            <span className=" text-lg ml-auto">{totalTrips}</span>
          </div>
          <div className="flex items-center w-full justify-between gap-2">
            <Badge
              variant="outline"
              className="px-2 py-0.5 text-sm flex items-center gap-1 text-red-600 border-red-600"
            >
              <DollarSign className="size-4" /> Total Expenses
            </Badge>
            <span className=" text-lg ml-auto">
              ${totalExpenses.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center w-full justify-between gap-2">
            <Badge
              variant="outline"
              className="px-2 py-0.5 text-sm flex items-center gap-1 text-green-600 border-green-600"
            >
              <BarChart2 className="size-4" /> Total Profit
            </Badge>
            <span className=" text-lg ml-auto">
              ${totalProfit.toLocaleString()}
            </span>
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
            <Badge
              variant="outline"
              className="px-2 py-0.5 text-sm flex items-center gap-1 text-blue-700 border-blue-700"
            >
              <BarChart2 className="size-4" /> {month}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex flex-col gap-2 pt-2">
          <div className="flex items-center w-full justify-between gap-2">
            <Badge
              variant="outline"
              className="px-2 py-0.5 text-sm flex items-center gap-1 text-blue-600 border-blue-600"
            >
              <Truck className="size-4" /> Total Trips
            </Badge>
            <span className=" text-base">{monthlyTrips}</span>
          </div>
          <div className="flex items-center w-full justify-between gap-2">
            <Badge
              variant="outline"
              className="px-2 py-0.5 text-sm flex items-center gap-1 text-red-600 border-red-600"
            >
              <DollarSign className="size-4" /> Total Expenses
            </Badge>
            <span className=" text-base">
              ${monthlyExpenses.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center w-full justify-between gap-2">
            <Badge
              variant="outline"
              className="px-2 py-0.5 text-sm flex items-center gap-1 text-green-600 border-green-600"
            >
              <BarChart2 className="size-4" /> Total Profit
            </Badge>
            <span className=" text-base">
              ${monthlyProfit.toLocaleString()}
            </span>
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
              className="px-2 py-0.5 text-sm flex items-center gap-1 text-blue-700 border-blue-700"
            >
              <BarChart2 className="size-4" /> {year}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex flex-col gap-2 pt-2">
          <div className="flex items-center w-full justify-between gap-2">
            <Badge
              variant="outline"
              className="px-2 py-0.5 text-sm flex items-center gap-1 text-blue-600 border-blue-600"
            >
              <Truck className="size-4" /> Total Trips
            </Badge>
            <span className=" text-base">{totalTrips}</span>
          </div>
          <div className="flex items-center w-full justify-between gap-2">
            <Badge
              variant="outline"
              className="px-2 py-0.5 text-sm flex items-center gap-1 text-red-600 border-red-600"
            >
              <DollarSign className="size-4" /> Total Expenses
            </Badge>
            <span className=" text-base">
              ${totalExpenses.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center w-full justify-between gap-2">
            <Badge
              variant="outline"
              className="px-2 py-0.5 text-sm flex items-center gap-1 text-green-600 border-green-600"
            >
              <BarChart2 className="size-4" /> Total Profit
            </Badge>
            <span className=" text-base">${totalProfit.toLocaleString()}</span>
          </div>
        </CardFooter>
      </Card>

      {/* Analytics Table */}
      <div className="md:col-span-2 mt-6">
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
            <table className="min-w-full text-sm border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="px-2 py-1 text-left">Month</th>
                  <th className="px-2 py-1 text-left">Trips</th>
                  <th className="px-2 py-1 text-left">Expenses</th>
                  <th className="px-2 py-1 text-left">Profit</th>
                </tr>
              </thead>
              <tbody>
                {monthlyAnalytics.map((m) => (
                  <tr key={m.month} className="border-b last:border-0">
                    <td className="px-2 py-1 font-medium">{m.month}</td>
                    <td className="px-2 py-1">{m.trips}</td>
                    <td className="px-2 py-1">
                      ${m.expenses.toLocaleString()}
                    </td>
                    <td className="px-2 py-1 font-semibold {m.profit >= 0 ? 'text-green-700' : 'text-red-700'}">
                      ${m.profit.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ReportsPage;
