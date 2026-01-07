"use client";

import React from "react";
import { DataTable } from "@/components/trips-data-table";
import { SectionCards } from "@/components/section-cards";
import { useSuperAdmin } from "../context/SuperAdminContext";

import { TrendingUp } from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import data from "../data.json";

const Dashboard = () => {
  const { trucks } = useSuperAdmin();

  // --- Monthly Generation Data ---
  const revenueData = [
    { month: "Jun", revenue: 210000 },
    { month: "Jul", revenue: 225000 },
    { month: "Aug", revenue: 238000 },
    { month: "Sep", revenue: 250000 },
    { month: "Oct", revenue: 260000 },
    { month: "Nov", revenue: 270000 },
  ];

  const revenueConfig = {
    revenue: {
      label: "Revenue",
      color: "var(--chart-1)",
    },
  };

  // --- Repairs by Truck Data (using real trucks) ---
  const repairsData = trucks.slice(0, 6).map((truck) => ({
    truck: truck.plateNumber || "N/A",
    cost: Math.floor(Math.random() * 3000) + 200, // Random cost for demo
  }));

  const repairsConfig = {
    cost: {
      label: "Cost",
      color: "var(--chart-2)",
    },
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 !py-4 md:gap-6 md:!py-6">
          {/* Section cards */}
          <SectionCards />

          {/* Trucks table */}
          {/* <DataTable data={data.trucks} onNavigateToTrips={() => {}} /> */}

          {/* Charts Section */}

          <div className="flex flex-wrap gap-6 !mt-6 !px-4">
            {/* Monthly Generation */}
            <Card className="flex-1 min-w-[350px] max-w-[600px]">
              <CardHeader>
                <CardTitle>Monthly Generation</CardTitle>
                <CardDescription>
                  Revenue trend over the last 6 months
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={revenueConfig}>
                  <AreaChart
                    accessibilityLayer
                    data={revenueData}
                    margin={{ left: -20, right: 12, bottom: 20 }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      angle={-90}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(value) =>
                        `$${(value / 1000).toFixed(0)}k`
                      }
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent />}
                    />
                    <Area
                      dataKey="revenue"
                      type="natural"
                      fill="var(--color-revenue)"
                      fillOpacity={0.4}
                      stroke="var(--color-revenue)"
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
              <CardFooter>
                <div className="flex w-full items-start gap-2 text-sm">
                  <div className="grid gap-2">
                    <div className="flex items-center gap-2 leading-none font-medium">
                      Trending up by 5.2% this month{" "}
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <div className="text-muted-foreground flex items-center gap-2 leading-none">
                      June - November 2024
                    </div>
                  </div>
                </div>
              </CardFooter>
            </Card>

            {/* Repairs by Truck */}
            <Card className="flex-1 min-w-[350px] max-w-[600px]">
              <CardHeader>
                <CardTitle>Repairs by Truck</CardTitle>
                <CardDescription>Maintenance costs per vehicle</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={repairsConfig}>
                  <BarChart
                    accessibilityLayer
                    data={repairsData}
                    margin={{ bottom: 40 }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="truck"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      angle={-90}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(value) => value}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent />}
                    />
                    <Bar
                      dataKey="cost"
                      fill="var(--color-cost)"
                      radius={[6, 6, 0, 0]}
                      barSize={40}
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
