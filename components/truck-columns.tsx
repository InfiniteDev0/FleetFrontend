import * as React from "react";
import { z } from "zod";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { IconDotsVertical, IconCircleCheckFilled, IconLoader } from "@tabler/icons-react";

export const truckSchema = z.object({
  id: z.string().or(z.number()),
  plateNumber: z.string(),
  model: z.string(),
  capacity: z.number(),
  status: z.enum(["available", "in-use", "maintenance", "ended"]),
  assignedDrivers: z.array(z.string()),
  createdBy: z.string(),
  updatedBy: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const truckColumns: ColumnDef<any>[] = [
  {
    accessorKey: "plateNumber",
    header: "Truck Number",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.plateNumber}</span>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "model",
    header: "Model",
    cell: ({ row }) => <span>{row.original.model}</span>,
  },
  {
    accessorKey: "capacity",
    header: "Capacity (tons)",
    cell: ({ row }) => <span>{row.original.capacity}</span>,
  },
  {
    accessorKey: "assignedDrivers",
    header: "Operator",
    cell: ({ row, table }) => {
      const driverIds = row.original.assignedDrivers;
      const driversList = (table.options.meta as any)?.drivers || [];
      const names = driverIds
        .map((id: string) => {
          const found = driversList.find((d: any) => {
            const driverIdStr = String(d.id || d._id);
            const idStr = String(id);
            return driverIdStr === idStr;
          });
          return found ? found.name : null;
        })
        .filter(Boolean);
      return names.length > 0 ? (
        <span>{names.join(", ")}</span>
      ) : (
        <span className="text-muted-foreground">No driver assigned</span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      let icon = null;
      let colorClass = "";

      if (status === "available" || status === "in-use") {
        icon = (
          <IconCircleCheckFilled className="size-4 fill-green-500 dark:fill-green-400" />
        );
        colorClass = "text-green-600 dark:text-green-400";
      } else if (status === "ended") {
        icon = (
          <IconCircleCheckFilled className="size-4 fill-red-500 dark:fill-red-400" />
        );
        colorClass = "text-red-600 dark:text-red-400";
      } else {
        icon = <IconLoader className="size-4 text-yellow-500" />;
        colorClass = "text-yellow-600 dark:text-yellow-400";
      }

      return (
        <Badge
          variant="outline"
          className={`!px-1.5 flex items-center !gap-1 ${colorClass}`}
        >
          {icon}
          {status === "in-use"
            ? "Active"
            : status === "ended"
            ? "Ended"
            : status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {row.original.createdAt ? new Date(row.original.createdAt).toLocaleDateString() : "-"}
      </span>
    ),
  },
  {
    id: "actions",
    cell: () => (
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
              /* Edit functionality */
            }}
          >
            Edit
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
