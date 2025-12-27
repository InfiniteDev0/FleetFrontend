import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { IconFilter, IconPlus } from "@tabler/icons-react";

const TruckHeader = () => {
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
      {/* Left: Title and Description */}
      <div>
        <h2 className="text-xl font-semibold">Fleet Management</h2>
        <p className="text-sm text-muted-foreground">
          Manage and monitor all vehicles in your fleet.
        </p>
      </div>

      {/* Right: Filters and Actions */}
      <div className="flex flex-col md:flex-row items-center gap-4">
        {/* Search Field */}
        <Input
          placeholder="Search by plate, driver, or model..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-[250px]"
        />

        {/* Status Filter */}
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[150px]">
            <IconFilter className="mr-2 size-4 text-muted-foreground" />
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="in-use">In Use</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
          </SelectContent>
        </Select>

        {/* Add Truck Button (Demo) */}
        <Button variant="default" className="flex items-center gap-2">
          <IconPlus className="size-4" />
          Add Truck
        </Button>
      </div>
    </div>
  );
};

export default TruckHeader;
