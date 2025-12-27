"use client";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  IconDotsVertical,
  IconGripVertical,
  IconCircleCheckFilled,
  IconLoader,
} from "@tabler/icons-react";
import { useSortable } from "@dnd-kit/sortable";

function DragHandle({ id }) {
  const { attributes, listeners } = useSortable({ id });
  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="text-muted-foreground size-7 hover:bg-transparent"
    >
      <IconGripVertical className="text-muted-foreground size-3" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  );
}

function statusBadge(status) {
  let icon = null;
  let colorClass = "";
  if (status === "available" || status === "in-use") {
    icon = (
      <IconCircleCheckFilled className="size-4 fill-green-500 dark:fill-green-400" />
    );
    colorClass = "text-green-600 dark:text-green-400";
  } else if (status === "maintenance") {
    icon = <IconLoader className="size-4 text-yellow-500" />;
    colorClass = "text-yellow-600 dark:text-yellow-400";
  } else {
    colorClass = "text-gray-600 dark:text-gray-400";
  }
  return (
    <Badge
      variant="outline"
      className={`!px-1.5 flex items-center !gap-1 ${colorClass}`}
    >
      {icon}
      {status === "in-use"
        ? "Active"
        : status === "maintenance"
        ? "Maintenance"
        : status === "available"
        ? "Active"
        : status}
    </Badge>
  );
}

const TruckTable = ({ trucks }) => {
  return (
    <div className="w-full flex-col justify-start gap-6">
      <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted sticky top-0 z-10">
              <TableRow>
                <TableHead></TableHead>
                <TableHead>Truck</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Driver(s)</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Created</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trucks.map((truck) => (
                <TableRow key={truck._id || truck.id} className="border-b">
                  <TableCell>
                    <DragHandle id={truck._id || truck.id} />
                  </TableCell>
                  <TableCell className="font-medium">
                    {truck.plateNumber}
                  </TableCell>
                  <TableCell>{truck.model}</TableCell>
                  <TableCell>{statusBadge(truck.status)}</TableCell>
                  <TableCell>
                    {truck.assignedDrivers?.length
                      ? truck.assignedDrivers.map((d) => d.name).join(", ")
                      : "Unassigned"}
                  </TableCell>
                  <TableCell>{truck.capacity} tons</TableCell>
                  <TableCell>
                    {truck.createdAt
                      ? new Date(truck.createdAt).toLocaleDateString()
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                          size="icon"
                        >
                          <IconDotsVertical />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem
                          onClick={() => {
                            // View Details functionality
                          }}
                        >
                          View Details
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default TruckTable;
