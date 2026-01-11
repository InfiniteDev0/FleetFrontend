"use client";

import React, { useState } from "react";
import { SectionCards } from "@/components/section-cards";
import { useSuperAdmin } from "../../../context/SuperAdminContext";
import dynamic from "next/dynamic";

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
  const { trucks, fetchTrucks } = useSuperAdmin();
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

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4  !py-4 md:gap-6 md:!py-6">
          {/* Section cards */}
          <SectionCards />

          {/* ongoing trips today */}
          

          {/* Trucks table */}
          <div className="!px-5 hidden md:flex flex-col gap-4">
            <h2 className="text-xl  flex-1">Trucks Data</h2>
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
