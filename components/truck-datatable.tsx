"use client";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  IconLayoutColumns,
  IconChevronDown,
  IconPlus,
  IconChevronsLeft,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsRight,
  IconCircleCheckFilled,
  IconDotsVertical,
  IconGripVertical,
  IconLoader,
  IconRefresh,
} from "@tabler/icons-react";
import React, { useMemo, useState } from "react";
// (Remove these stray lines, they are not valid at the top level)
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  type ColumnDef,
  type ColumnFiltersState,
  type Row,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { z } from "zod";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/badge";
import { useTripsForDate } from "@/app/hooks/useFleetData";
export const truckSchema = z.object({
  id: z.string().or(z.number()), // depending on your DB (_id as string or numeric id)
  plateNumber: z.string(),
  model: z.string(),
  capacity: z.number(), // in tons
  status: z.enum(["available", "in-use", "maintenance", "ended"]),
  assignedDrivers: z.array(z.string()), // driver IDs
  createdBy: z.string(),
  updatedBy: z.string().optional(),

  // Optional metadata
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// Create a separate component for the drag handle
function DragHandle({ id }: { id: string | number }) {
  const { attributes, listeners } = useSortable({
    id: String(id),
  });
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

const columns: ColumnDef<z.infer<typeof truckSchema>>[] = [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.id} />,
  },
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
          className={`px-1.5! flex items-center gap-1! ${colorClass}`}
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
        {row.original.createdAt
          ? new Date(row.original.createdAt).toLocaleDateString()
          : "-"}
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

function DraggableRow({ row }: { row: Row<z.infer<typeof truckSchema>> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  });

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}

import { toast } from "sonner";

interface TrucksDataTableProps {
  data: any[];
  fetchTrucks?: () => Promise<void>;
}

export function TrucksDataTable({ data, fetchTrucks }: TrucksDataTableProps) {
  // Normalize trucks: always have id, assignedDrivers as array, etc.
  const normalized = React.useMemo(
    () =>
      (data || []).map((t) => ({
        ...t,
        id: t.id || t._id,
        assignedDrivers: Array.isArray(t.assignedDrivers)
          ? t.assignedDrivers
          : [],
        createdAt: t.createdAt || undefined,
        updatedAt: t.updatedAt || undefined,
      })),
    [data]
  );

  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const sortableId = React.useId();
  const [order, setOrder] = React.useState<(string | number)[]>(() =>
    normalized.map((t) => t.id)
  );
  React.useEffect(() => {
    setOrder(normalized.map((t) => t.id));
  }, [normalized.length, normalized.map((t) => t.id).join(",")]);
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor)
  );
  const dataIds = order.map(String);

  const table = useReactTable({
    data: normalized,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id?.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  // Refresh state
  const [refreshing, setRefreshing] = React.useState(false);
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchTrucks?.();
      toast.success("Trucks refreshed");
    } catch {
      toast.error("Failed to refresh trucks");
    } finally {
      setRefreshing(false);
    }
  };

  // Drag and drop handler
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = order.findIndex((id) => String(id) === String(active.id));
    const newIndex = order.findIndex((id) => String(id) === String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;
    const newOrder = arrayMove(order, oldIndex, newIndex);
    setOrder(newOrder);
    // TODO: Optionally sync new order to backend here
    toast.success("Row order updated (UI only)");
  }

  return (
    <div className="w-full flex-col justify-start gap-6!">
      <div className="flex items-center justify-between mb-2!">
        {/* ...other header content can go here if needed... */}
        <div className="flex-1"></div>
        <Button
          variant="default"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="ml-2! bg-black text-white dark:bg-white dark:text-black border border-black dark:border-white hover:bg-neutral-900 dark:hover:bg-neutral-100"
          title="Refresh trucks list"
        >
          <IconRefresh className="mr-1! size-4" />
          {refreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>
      <div className="relative flex flex-col gap-4! overflow-auto px-4! lg:px-6!">
        <div className="overflow-hidden rounded-lg border">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
            <Table>
              <TableHeader className="bg-muted sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="**:data-[slot=table-cell]:first:w-8!">
                {order.length ? (
                  <SortableContext
                    items={dataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {order.map((id) => {
                      const row = table
                        .getRowModel()
                        .rows.find((r) => String(r.id) === String(id));
                      return row ? (
                        <DraggableRow key={row.id} row={row} />
                      ) : null;
                    })}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24! text-center!"
                    >
                      No trucks found. Create a truck to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4!">
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex w-full items-center gap-8! lg:w-fit!">
            <div className="hidden items-center gap-2! lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Rows per page
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger size="sm" className="w-20!" id="rows-per-page">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit! items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="ml-auto! flex items-center gap-2! lg:ml-0!">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <IconChevronsLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <IconChevronLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <IconChevronRight />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <IconChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
