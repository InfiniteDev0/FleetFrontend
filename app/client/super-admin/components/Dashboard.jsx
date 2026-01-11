"use client";

import React, { useState } from "react";
import { SectionCards } from "@/components/section-cards";
import { useSuperAdmin } from "../../../context/SuperAdminContext";
import dynamic from "next/dynamic";
import { Badge } from "@/components/ui/badge";

const TrucksDataTable = dynamic(
  () =>
    import("@/components/truck-datatable").then((mod) => ({
      default: mod.TrucksDataTable,
    })),
  {
    loading: () => (
      <div className="flex flex-col items-center gap-2">
        <div className="loader mx-auto"></div>
        <span className="text-muted-foreground mt-4 text-sm">
          Loading trucks table...
        </span>
      </div>
    ),
    ssr: false,
  }
);

const Dashboard = () => {
  const { trucks, fetchTrucks, currentUser, currentRole } = useSuperAdmin();
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");

  const filteredTrucks = React.useMemo(() => {
    let filtered = trucks;
    if (status !== "all") {
      filtered = filtered.filter((t) => t.status === status);
    }
    if (search.trim() !== "") {
      const s = search.trim().toLowerCase();
      filtered = filtered.filter(
        (t) =>
          (t.plateNumber && t.plateNumber.toLowerCase().includes(s)) ||
          (t.model && t.model.toLowerCase().includes(s))
      );
    }
    return filtered;
  }, [trucks, status, search]);

  // 🔹 Greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const renderRoleBadge = () => {
    let label = "Role";
    let borderClass = "border-gray-400 text-gray-700";
    let icon = null;

    switch (currentRole) {
      case "super_admin":
        label = "Super Admin";
        borderClass = "border-cyan-500 text-cyan-500";
        icon = (
          <svg className="size-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <circle cx="10" cy="10" r="8" />
            <path
              d="M10 5v5l3 3"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
        break;
      case "admin":
        label = "Admin";
        borderClass = "border-green-500 text-green-500";
        icon = (
          <svg className="size-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <rect x="4" y="4" width="12" height="12" rx="3" />
            <path
              d="M10 7v6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        );
        break;
      case "operator":
        label = "Operator";
        borderClass = "border-yellow-500 text-yellow-500";
        icon = (
          <svg className="size-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <polygon points="10,3 17,17 3,17" />
            <path
              d="M10 8v4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        );
        break;
      default:
        label = currentRole ? currentRole.replace(/_/g, " ") : "Role";
        borderClass = "border-gray-400 text-gray-700";
    }

    return (
      <Badge
        variant="outline"
        className={`px-2 py-1 flex items-center gap-1 border ${borderClass}`}
      >
        {icon}
        {label}
      </Badge>
    );
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 !py-4 md:gap-6 md:!py-6">
          <div className="flex w-full justify-between items-center !px-5">
            <div>
              <h1 className="text-2xl">
                {getGreeting()} 👋
              </h1>
              <p className="hidden md:text-sm">
                There is the latest update for the last 7 days. Check now.
              </p>
            </div>
            <div className="!mt-2">{renderRoleBadge()}</div>
          </div>

          {/* Section cards */}
          <SectionCards />

          {/* Trucks table */}
          <div className="px-5 hidden md:flex flex-col gap-4">
            <h2 className="text-xl">Trucks Data</h2>
            <TrucksDataTable
              data={filteredTrucks}
              fetchTrucks={fetchTrucks}
              searchable
              paginated
              sortable
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
