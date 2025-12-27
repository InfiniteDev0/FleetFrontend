"use client";

import * as React from "react";
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
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconCircleCheckFilled,
  IconDotsVertical,
  IconGripVertical,
  IconLayoutColumns,
  IconLoader,
  IconMapPin,
  IconPlus,
} from "@tabler/icons-react";
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type Row,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTripsForDate } from "@/app/hooks/useFleetData";

export const schema = z.object({
  id: z.number(),
  plateNumber: z.string(),
  model: z.string(),
  capacity: z.number(),
  status: z.enum(["available", "in-use", "maintenance", "ended"]),
  assignedDrivers: z.array(z.string()),
  createdBy: z.string(),
  updatedBy: z.string(),
  trips: z.number().optional(),
  route: z.string().optional(),
  cityFrom: z.string().optional(),
  cityTo: z.string().optional(),
  todayTrips: z.number().optional(),
  miles: z.number().optional(),
  destinationMonth: z.string().optional(),
  destinationYear: z.string().optional(),
  tripDate: z.string().optional(),
  mileageRemaining: z.number().optional(),
  mileageCovered: z.number().optional(),
  tripValue: z.number().optional(),
});

// Create a separate component for the drag handle
function DragHandle({ id }: { id: number }) {
  const { attributes, listeners } = useSortable({
    id,
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

const columns: ColumnDef<z.infer<typeof schema>>[] = [
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
    accessorKey: "cityFrom",
    header: "From",
    cell: ({ row }) => (
      <span className="font-medium text-sm text-cyan-500">
        {row.original.cityFrom || "-"}
      </span>
    ),
  },
  {
    accessorKey: "cityTo",
    header: "To",
    cell: ({ row }) => (
      <span className="font-medium text-sm text-red-500">
        {row.original.cityTo || "-"}
      </span>
    ),
  },
  {
    accessorKey: "assignedDrivers",
    header: "Operator",
    cell: ({ row, table }) => {
      const driverIds = row.original.assignedDrivers;
      const driversList = (table.options.meta as any)?.drivers || [];
      const names = driverIds
        .map((id) => {
          const found = driversList.find((d: any) => {
            const driverIdStr = String(d.id || d._id);
            const idStr = String(id);
            return driverIdStr === idStr || d.id === Number(id) || d._id === id;
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

function DraggableRow({ row }: { row: Row<z.infer<typeof schema>> }) {
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

export function DataTable({
  data: initialData,
}: {
  data?: z.infer<typeof schema>[];
}) {
  const { trips, drivers, loading: dataLoading } = useTripsForDate();

  // Use provided data or fetched trips
  const [data, setData] = React.useState<z.infer<typeof schema>[]>(() => {
    if (initialData && initialData.length) {
      return initialData;
    }
    return trips.map((truck) => ({
      ...truck,
      trips: truck.trips || 0,
      todayTrips: truck.todayTrips || 0,
      miles: truck.miles || 0,
      mileageRemaining: truck.mileageRemaining,
      mileageCovered:
        truck.mileageCovered ||
        (truck.status === "ended" ? truck.miles : undefined),
      tripValue: truck.tripValue,
    })) as z.infer<typeof schema>[];
  });

  // Update data when trips change
  React.useEffect(() => {
    if (initialData && initialData.length) {
      setData(initialData);
    } else {
      setData(
        trips.map((truck) => ({
          ...truck,
          trips: truck.trips || 0,
          todayTrips: truck.todayTrips || 0,
          miles: truck.miles || 0,
          mileageRemaining: truck.mileageRemaining,
          mileageCovered:
            truck.mileageCovered ||
            (truck.status === "ended" ? truck.miles : undefined),
          tripValue: truck.tripValue,
        })) as z.infer<typeof schema>[]
      );
    }
  }, [trips, initialData]);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const sortableId = React.useId();
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map(({ id }) => id) || [],
    [data]
  );

  const table = useReactTable({
    data,
    columns,
    meta: {
      drivers,
    },
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
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

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id);
        const newIndex = dataIds.indexOf(over.id);
        return arrayMove(data, oldIndex, newIndex);
      });
    }
  }

  return (
    <div className="w-full flex-col justify-start !gap-6">
      <div className="flex items-center justify-between !px-4 !mb-4 lg:!px-6">
        <h1 className="text-xl font-semibold">Trips</h1>
        {/* Actions */}
        <div className="flex items-center !gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <IconLayoutColumns />
                <span className="hidden lg:inline">Customize Columns</span>
                <span className="lg:hidden">Columns</span>
                <IconChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide()
                )
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Navigate to Trips section
              if (typeof window !== "undefined") {
                const event = new CustomEvent("navigateToSection", {
                  detail: "Trips",
                });
                window.dispatchEvent(event);
              }
            }}
          >
            <IconPlus />
            <span className="hidden lg:inline">Add Trip</span>
          </Button>
        </div>
      </div>
      <div className="relative flex flex-col !gap-4 overflow-auto !px-4 lg:!px-6">
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
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} colSpan={header.colSpan}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="**:data-[slot=table-cell]:first:w-8">
                {table.getRowModel().rows?.length ? (
                  <SortableContext
                    items={dataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>
        <div className="flex items-center justify-between !px-4">
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex w-full items-center !gap-8 lg:w-fit">
            <div className="hidden items-center !gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Rows per page
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
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
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center !gap-2 lg:!ml-0">
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
