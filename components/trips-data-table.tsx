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
  IconEye,
  IconTrash,
  IconAlertTriangle,
  IconQuestionMark,
} from "@tabler/icons-react";
import React from "react";
import { toast } from "sonner";
import { DeleteTruckAlert } from "@/components/alertdialog";
import {
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useSuperAdmin } from "@/app/client/super-admin/context/SuperAdminContext";
import { z } from "zod";
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
import Link from "next/link";

export const tripSchema = z.object({
  id: z.string().optional(), // frontend convenience, maps to _id
  _id: z.string().optional(), // backend id field
  truckId: z.string(), // ObjectId reference to Truck
  product: z.enum(["AGO", "PMS", "JET A-1"]),
  cargoType: z.string().optional(),
  productType: z.string().optional(),
  route: z.object({
    origin: z.string(),
    destination: z.string(),
  }),
  transport: z.number(), // money earned
  rateValue: z.number().optional(),
  status: z.enum(["scheduled", "in-progress", "completed"]),
  startTime: z.string(), // ISO date string
  endTime: z.string().nullable().optional(),

  // Metadata
  createdBy: z.string(),
  updatedBy: z.string().optional(),

  // Optional analytics/derived fields
  trips: z.number().optional(),
  todayTrips: z.number().optional(),
  miles: z.number().optional(),
  mileageRemaining: z.number().optional(),
  mileageCovered: z.number().optional(),
  tripValue: z.number().optional(),
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

const columns: ColumnDef<z.infer<typeof tripSchema>>[] = [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => (
      <DragHandle id={String(row.original.id ?? row.original._id ?? "")} />
    ),
  },
  {
    accessorKey: "truckId",
    header: "Truck",
    cell: ({ row, table }) => {
      const trucksList = (table.options.meta as any)?.trucks || [];
      // Trip API may return truckId as an object or an id string
      const truckRaw: any = (row.original as any).truckId;
      const truckObj =
        truckRaw && typeof truckRaw === "object" ? truckRaw : null;
      const truckIdStr = truckObj?._id || (row.original.truckId as any);
      let t = truckObj;
      if (!t && truckIdStr) {
        t = trucksList.find(
          (x: any) => String(x.id || x._id) === String(truckIdStr)
        );
      }
      return t ? (
        <span className="font-medium">{t.plateNumber}</span>
      ) : (
        <span className="text-muted-foreground">Unassigned</span>
      );
    },
    enableHiding: false,
  },
  {
    id: "driverContact",
    header: "Driver Contact",
    cell: ({ row, table }) => {
      const trucksList = (table.options.meta as any)?.trucks || [];
      const usersList = (table.options.meta as any)?.users || [];

      const truckRaw: any = (row.original as any).truckId;
      const truckObj =
        truckRaw && typeof truckRaw === "object" ? truckRaw : null;
      const truckIdStr = truckObj?._id || (row.original.truckId as any);

      // Try to resolve truck from nested object or from trucksList
      const foundTruck = truckIdStr
        ? trucksList.find(
            (x: any) => String(x.id || x._id) === String(truckIdStr)
          )
        : undefined;

      // Merge nested truck object with found truck so we can get PhoneNumber from provider
      const truck = foundTruck
        ? { ...(truckObj || {}), ...foundTruck }
        : truckObj || foundTruck;

      const phoneFromTruck =
        truck?.PhoneNumber ??
        truck?.phoneNumber ??
        truck?.driverPhone ??
        truck?.driverContact ??
        null;

      // Fallback: check driverId / driver (could be nested object or id) against users list
      const driverRaw: any =
        (row.original as any).driverId ?? (row.original as any).driver;
      let phoneFromUser: string | null = null;
      if (driverRaw) {
        const driverObj = typeof driverRaw === "object" ? driverRaw : null;
        const driverIdStr = driverObj?._id || driverRaw;
        const foundUser = driverIdStr
          ? usersList.find(
              (u: any) => String(u.id || u._id) === String(driverIdStr)
            )
          : undefined;
        const user = foundUser
          ? { ...(driverObj || {}), ...foundUser }
          : driverObj || foundUser;
        phoneFromUser =
          user?.phoneNumber ??
          user?.PhoneNumber ??
          user?.mobile ??
          user?.contact ??
          null;
      }

      // Last-resort fallback: check createdBy (may contain contact info)
      const createdByRaw: any = (row.original as any).createdBy;
      let phoneFromCreator: string | null = null;
      if (createdByRaw) {
        const creatorObj =
          typeof createdByRaw === "object" ? createdByRaw : null;
        phoneFromCreator =
          creatorObj?.phoneNumber ??
          creatorObj?.PhoneNumber ??
          creatorObj?.mobile ??
          null;
      }

      const phone = phoneFromTruck ?? phoneFromUser ?? phoneFromCreator;

      return phone ? (
        <a className="text-primary underline" href={`tel:${String(phone)}`}>
          {String(phone)}
        </a>
      ) : (
        <span className="text-muted-foreground">-</span>
      );
    },
  },
  {
    accessorKey: "product",
    header: "Product",
    cell: ({ row }) => (
      <span>
        {row.original.product ||
          row.original.cargoType ||
          row.original.productType ||
          "-"}
      </span>
    ),
  },
  {
    accessorKey: "route.origin",
    header: "Origin",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.route?.origin || "-"}</span>
    ),
  },
  {
    accessorKey: "route.destination",
    header: "Destination",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.route?.destination || "-"}
      </span>
    ),
  },
  {
    accessorKey: "transport",
    header: "Revenue",
    cell: ({ row }) => (
      <span>
        $
        {Number(
          row.original.transport || row.original.rateValue || 0
        ).toLocaleString()}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      let icon: React.ReactNode = null;
      let colorClass = "";

      if (status === "scheduled") {
        icon = (
          <IconAlertTriangle className="size-4 text-yellow-500 dark:text-yellow-400" />
        );
        colorClass = "text-yellow-600 dark:text-yellow-400";
      } else if (status === "in-progress") {
        icon = (
          <IconLoader className="size-4 animate-spin text-green-500 dark:text-green-400" />
        );
        colorClass = "text-green-600 dark:text-green-400";
      } else if (status === "completed") {
        icon = (
          <IconCircleCheckFilled className="size-4 fill-blue-500 dark:fill-blue-400" />
        );
        colorClass = "text-blue-600 dark:text-blue-400";
      } else {
        icon = <IconQuestionMark className="size-4 text-gray-400" />;
        colorClass = "text-gray-500 dark:text-gray-400";
      }

      return (
        <Badge
          variant="outline"
          className={`px-1.5 flex items-center gap-1 ${colorClass}`}
        >
          {icon}
          {status === "in-progress"
            ? "In Progress"
            : status === "scheduled"
            ? "Scheduled"
            : status === "completed"
            ? "Completed"
            : status}
        </Badge>
      );
    },
  },
  {
    id: "startDate",
    header: "Start Date",
    cell: ({ row }) => {
      const s = row.original.startTime;
      return (
        <span className="text-xs text-muted-foreground">
          {s ? new Date(s).toLocaleDateString() : "-"}
        </span>
      );
    },
  },
  {
    id: "startTimeOnly",
    header: "Start Time",
    cell: ({ row }) => {
      const s = row.original.startTime;
      return (
        <span className="text-xs text-muted-foreground">
          {s
            ? new Date(s).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "-"}
        </span>
      );
    },
  },

  {
    id: "actions",
    cell: ({ row }) => (
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
        <DropdownMenuContent
          className="!p-2 !m-1 min-w-[190px] rounded-md shadow-md bg-popover text-popover-foreground"
          align="end"
        >
          <DropdownMenuItem asChild>
            <Link
              href={`/client/super-admin/trips/${encodeURIComponent(
                String(row.original.id ?? (row.original._id || ""))
              )}?id=${encodeURIComponent(
                String(row.original.id ?? (row.original._id || ""))
              )}`}
            >
              <IconEye className="mr-2 size-4 text-muted-foreground" />
              View Trip
            </Link>
          </DropdownMenuItem>

          <DeleteTruckAlert
            trigger={
              <DropdownMenuItem className="px-2 py-2 flex items-center gap-2 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-sm cursor-pointer">
                <IconTrash className="size-4 text-red-600" />
                <span>Delete Trip</span>
              </DropdownMenuItem>
            }
          >
            {(close: () => void) => (
              <DeleteTripDialog
                refNumber={String(row.original.id ?? (row.original._id || ""))}
                tripId={String(row.original.id ?? (row.original._id || ""))}
                onSuccess={close}
              />
            )}
          </DeleteTruckAlert>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

function DraggableRow({ row }: { row: Row<z.infer<typeof tripSchema>> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: String(row.original.id ?? row.original._id ?? ""),
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

function DeleteTripDialog({
  refNumber,
  tripId,
  onSuccess,
}: {
  refNumber: string;
  tripId: string;
  onSuccess?: () => void;
}) {
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const { deleteTrip, fetchTrips } = useSuperAdmin();

  const handleDelete = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await deleteTrip(tripId);
      if (!res?.success) {
        const msg = res?.message || "Failed to delete trip";
        toast.error(msg);
        throw new Error(msg);
      }
      // refresh trips list
      if (fetchTrips) await fetchTrips();
      toast.success(`Trip '${refNumber}' deleted successfully`);
      if (onSuccess) onSuccess();
    } catch (e) {
      const errorMsg =
        e &&
        typeof e === "object" &&
        "message" in e &&
        typeof (e as any).message === "string"
          ? (e as any).message
          : "Failed to delete trip";
      setError(String(errorMsg));
      toast.error(String(errorMsg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Delete Trip</AlertDialogTitle>
        <AlertDialogDescription>
          <>
            This will permanently delete the trip and related resources.
            <br />
            <input
              type="text"
              className="!mt-2 w-full border rounded !px-2 !py-1"
              placeholder={`Type '${refNumber}' to confirm`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <br />
            <span className="text-red-900 text-xs mt-2! block">
              Deleting trip {refNumber} cannot be undone.
            </span>
            {error && (
              <span className="text-red-600 text-xs mt-2!">{error}</span>
            )}
          </>
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
        <AlertDialogAction asChild>
          <button
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
            disabled={
              input.trim().toLowerCase() !==
                String(refNumber).trim().toLowerCase() || loading
            }
            onClick={async (e) => {
              e.preventDefault();
              await handleDelete();
            }}
          >
            {loading ? "Deleting..." : "Delete Trip"}
          </button>
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
}

export function DataTable({
  data: initialData,
  meta,
}: {
  data?: z.infer<typeof tripSchema>[];
  meta?: { trucks?: any[]; users?: any[]; drivers?: any[] };
}) {
  // Prefer provider trips when initial data is not passed
  const { trips: providerTrips = [] } = useSuperAdmin();
  const drivers = meta?.drivers || [];

  // Use provided data or provider trips (no demo fallback)
  const [data, setData] = React.useState<z.infer<typeof tripSchema>[]>(() => {
    if (initialData && initialData.length) return initialData;
    return providerTrips as unknown as z.infer<typeof tripSchema>[];
  });

  // Update data when provider trips or initialData change
  React.useEffect(() => {
    if (initialData && initialData.length) {
      setData(initialData);
    } else {
      setData(providerTrips as unknown as z.infer<typeof tripSchema>[]);
    }
  }, [providerTrips, initialData]);
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
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map(({ id, _id }) => String(id ?? _id ?? "")) || [],
    [data]
  );

  const table = useReactTable({
    data,
    columns,
    meta: {
      drivers,
      trucks: meta?.trucks || [],
      users: meta?.users || [],
      ...(meta || {}),
    },
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => String(row.id ?? (row as any)._id ?? ""),
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
    <div className="w-full flex-col justify-start gap-6!">
      {/* Table */}
      <div className="relative flex flex-col gap-4! overflow-auto px-2!">
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

        {/* Pagination */}
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
