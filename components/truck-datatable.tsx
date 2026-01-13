// @ts-nocheck
import React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
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
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DropdownMenuContent } from "@/components/ui/dropdown-menu";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
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
import { Button } from "@/components/ui/button";
import { Table } from "@/components/ui/table";
import { TableHeader } from "@/components/ui/table";
import { TableRow } from "@/components/ui/table";
import { TableHead } from "@/components/ui/table";
import { TableBody } from "@/components/ui/table";
import { TableCell } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { SelectTrigger } from "@/components/ui/select";
import { SelectValue } from "@/components/ui/select";
import { SelectContent } from "@/components/ui/select";
import { SelectItem } from "@/components/ui/select";

import { Eye, GripVertical, MoreHorizontal, Trash2 } from "lucide-react";
import { useSuperAdmin } from "@/app/context/SuperAdminContext";

import {
  IconChevronsLeft,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsRight,
  IconGripVertical,
  IconRefresh,
  IconCircleCheckFilled,
  IconLoader,
  IconAlertTriangle,
  IconQuestionMark,
} from "@tabler/icons-react";
import { AlertDialog } from "@/components/ui/alert-dialog";

export const truckSchema = z.object({
  id: z.string().or(z.number()),
  _id: z.string().optional(),
  plateNumber: z.string(),
  model: z.string(),
  capacity: z.number(),
  status: z.enum(["available", "in-use", "maintenance"]),
  driverName: z.string().nullable().optional(),
  PhoneNumber: z.number().nullable().optional(),
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// Create a separate component for the drag handle
// DragHandle is defined but not used. Remove if not needed.

function DeleteTruckDialog({ plateNumber, truckId, fetchTrucks, onSuccess }) {
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const { handleDeleteTruck } = useSuperAdmin();

  const handleDelete = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await handleDeleteTruck(truckId);
      if (!result) {
        toast.error("Failed to delete truck");
        throw new Error("Failed to delete truck");
      }
      if (fetchTrucks) await fetchTrucks();
      toast.success(`Truck '${plateNumber}' deleted successfully`);
      if (onSuccess) onSuccess();
    } catch (e) {
      const errorMsg =
        e && typeof e === "object" && "message" in e
          ? (e.message as string)
          : "Failed to delete truck";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Delete Truck</AlertDialogTitle>
        <AlertDialogDescription>
          <>
            This will permanently delete the truck and related resources.
            <br />
            <input
              type="text"
              className="!mt-2 w-full border rounded !px-2 !py-1"
              placeholder={`Type '${plateNumber}' to confirm`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <br />
            <span className="text-red-900 text-xs mt-2! block">
              Deleting {plateNumber} cannot be undone.
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
              input.trim().toLowerCase() !== plateNumber.trim().toLowerCase() ||
              loading
            }
            onClick={async (e) => {
              e.preventDefault();
              await handleDelete();
            }}
          >
            {loading ? "Deleting..." : "Delete Truck"}
          </button>
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
}

function getColumns(fetchTrucks?: () => Promise<void>, currentRole?: string) {
  const { currentRole: role } = useSuperAdmin();
  return [
    {
      id: "drag",
      header: () => null,
      cell: ({ row }) => <DragHandle id={row.original.id} />,
    },

    {
      accessorKey: "plateNumber",
      header: "Truck Number",
      cell: ({ row }) => <span>{row.original.plateNumber}</span>,
      enableHiding: false,
    },
    {
      accessorKey: "model",
      header: "Model",
      cell: ({ row }) => <span>{row.original.model}</span>,
    },
    {
      accessorKey: "capacity",
      header: "Capacity",
      cell: ({ row }) => <span>{row.original.capacity}</span>,
    },
    {
      accessorKey: "driverName",
      header: "Driver Name",
      cell: ({ row }) =>
        row.original.driverName ? (
          <span>{row.original.driverName}</span>
        ) : (
          <span className="text-muted-foreground">No driver</span>
        ),
    },
    {
      accessorKey: "PhoneNumber",
      header: "Phone Number",
      cell: ({ row }) =>
        row.original.PhoneNumber ? (
          <span>{row.original.PhoneNumber}</span>
        ) : (
          <span className="text-muted-foreground">No phone</span>
        ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        let icon = null;
        let colorClass = "";

        if (status === "available") {
          icon = (
            <IconCircleCheckFilled className="size-4 fill-green-500 dark:fill-green-400" />
          );
          colorClass = "text-green-600 dark:text-green-400";
        } else if (status === "in-use") {
          icon = (
            <IconLoader className="size-4 animate-spin text-blue-500 dark:text-blue-400" />
          );
          colorClass = "text-blue-600 dark:text-blue-400";
        } else if (status === "maintenance") {
          icon = (
            <IconAlertTriangle className="size-4 text-yellow-500 dark:text-yellow-400" />
          );
          colorClass = "text-yellow-600 dark:text-yellow-400";
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
            {status === "in-use"
              ? "In Use"
              : status === "available"
              ? "Available"
              : status === "maintenance"
              ? "Maintenance"
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
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 !p-0 m-0 !mb-2 rounded-full hover:bg-accent hover:text-accent-foreground transition"
            >
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="!p-2 !m-1 min-w-[190px] rounded-md shadow-md bg-popover text-popover-foreground"
            align="end"
          >
            <DropdownMenuLabel className="!px-2 !py-1 text-xs font-semibold text-muted-foreground">
              Truck Actions
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="!my-1" />

            {/* View Truck */}
            <DropdownMenuItem
              asChild
              className="px-2 py-2 flex items-center gap-2 rounded-sm hover:bg-accent hover:text-accent-foreground cursor-pointer"
            >
              <Link
                href={`/client/${
                  currentRole === "super_admin" ? "super-admin" : currentRole
                }/trucks/${encodeURIComponent(
                  row.original.plateNumber
                )}?id=${encodeURIComponent(
                  row.original.id ?? row.original._id ?? ""
                )}`}
                target="_self"
                rel="noopener noreferrer"
              >
                <Eye className="size-4 text-muted-foreground" />
                <span>View Truck</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1" />

            {/* Delete Truck */}
            {row.original.status !== "in-use" && (
              <DeleteTruckAlert
                trigger={
                  <DropdownMenuItem className="px-2 py-2 flex items-center gap-2 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-sm cursor-pointer">
                    <Trash2 className="size-4 text-red-600" />
                    <span>Delete Truck</span>
                  </DropdownMenuItem>
                }
              >
                {(close) => (
                  <DeleteTruckDialog
                    plateNumber={row.original.plateNumber}
                    truckId={row.original.id}
                    fetchTrucks={fetchTrucks}
                    onSuccess={close}
                  />
                )}
              </DeleteTruckAlert>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
}

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

function DraggableRow({ row }: { row: Row<User> }) {
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

import {
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@radix-ui/react-dropdown-menu";

import { Separator } from "./ui/separator";
import Link from "next/link";

export function TrucksDataTable({
  data,
  fetchTrucks,
}: {
  data: z.infer<typeof truckSchema>[];
  fetchTrucks?: () => Promise<void>;
}) {
  // Normalize trucks: always have id, assignedDrivers as array, etc.
  const normalized = React.useMemo(
    () =>
      (data || []).map((t) => ({
        ...t,
        id: t.id ?? t._id ?? "",
        assignedDriver: t.assignedDriver || null,
        createdAt: t.createdAt || undefined,
        updatedAt: t.updatedAt || undefined,
      })),
    [data]
  );

  const { currentRole } = useSuperAdmin();
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
  const [order, setOrder] = React.useState<(string | number)[]>(() =>
    normalized.map((t) => t.id)
  );
  React.useEffect(() => {
    setOrder(normalized.map((t) => t.id));
  }, [data]);
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor)
  );
  const dataIds = order.map(String);
  const columns = React.useMemo(
    () => getColumns(fetchTrucks, currentRole),
    [fetchTrucks, currentRole]
  );
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
  const sortableId = React.useId();

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
    <div className="w-full flex-col justify-start gap-6">
      <div className="relative flex flex-col gap-4 overflow-auto">
        {/* large screen sizes display this  */}
        <div className="overflow-hidden rounded-lg border md:block hidden">
          <DndContext
            collisionDetection={closestCenter}
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
              <TableBody className="data-[slot=table-cell]:first:w-8">
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
                      className="h-24 text-center"
                    >
                      No trucks found. Create a truck to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>
        {/* small screen size: card list, shares pagination, alert dialog, and view logic */}
        <div className="flex flex-col gap-4 md:hidden">
          {table.getRowModel().rows.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No trucks found.
            </div>
          ) : (
            table.getRowModel().rows.map((row) => {
              const truck = row.original;
              let icon = null;
              let colorClass = "";
              if (truck.status === "available") {
                icon = (
                  <IconCircleCheckFilled className="size-4 fill-green-500 dark:fill-green-400" />
                );
                colorClass = "text-green-600 dark:text-green-400";
              } else if (truck.status === "in-use") {
                icon = (
                  <IconLoader className="size-4 animate-spin text-blue-500 dark:text-blue-400" />
                );
                colorClass = "text-blue-600 dark:text-blue-400";
              } else if (truck.status === "maintenance") {
                icon = (
                  <IconAlertTriangle className="size-4 text-yellow-500 dark:text-yellow-400" />
                );
                colorClass = "text-yellow-600 dark:text-yellow-400";
              } else {
                icon = <IconQuestionMark className="size-4 text-gray-400" />;
                colorClass = "text-gray-500 dark:text-gray-400";
              }
              // Local state for delete dialog per truck
              const [showDelete, setShowDelete] = React.useState(false);
              return (
                <div
                  key={truck._id || truck.id}
                  className="w-[400px] max-w-full h-[20vh] border rounded-md flex flex-col justify-between !p-3 bg-background shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 text-sm">
                      <img
                        src="https://png.pngtree.com/png-vector/20231023/ourmid/pngtree-3d-illustration-of-tanker-truck-png-image_10312658.png"
                        alt="truck"
                        className="w-15 h-12 object-contain"
                      />
                      <div className="flex flex-col">
                        <span>{truck.plateNumber}</span>
                        <span className="text-xs">
                          {truck.model}
                          {truck.year ? ` - ${truck.year}` : ""}
                        </span>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`!px-1.5 flex items-center gap-1 ${colorClass}`}
                    >
                      {icon}
                      {truck.status === "in-use"
                        ? "In Use"
                        : truck.status === "available"
                        ? "Available"
                        : truck.status === "maintenance"
                        ? "Maintenance"
                        : truck.status}
                    </Badge>
                  </div>
                  <div className="flex items-end justify-between">
                    <div className="flex items-center justify-between !mt-2">
                      <p className="text-sm">
                        Driver:{" "}
                        <span className="text-xs">
                          {truck.driverName || "-"}
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center !gap-2">
                      <div>
                        <div>
                          <Link
                            href={`/client/${
                              currentRole === "super_admin"
                                ? "super-admin"
                                : currentRole
                            }/trucks/${encodeURIComponent(
                              row.original.plateNumber
                            )}?id=${encodeURIComponent(
                              row.original.id ?? row.original._id ?? ""
                            )}`}
                            target="_self"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center rounded-md border bg-secondary text-secondary-foreground hover:bg-secondary/80 size-9"
                            style={{ textDecoration: "none" }}
                          >
                            <Eye className="size-4 text-muted-foreground" />
                            <span className="sr-only">View Truck</span>
                          </Link>
                        </div>
                      </div>
                      {/* Only show delete button if truck is NOT in-use */}
                      {truck.status !== "in-use" && (
                        <>
                          <div>
                            <div>
                              <Button
                                variant="destructive"
                                size="icon"
                                onClick={() => setShowDelete(true)}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2"
                                  />
                                </svg>
                              </Button>
                            </div>
                          </div>
                          {/* Wrap dialog in AlertDialog */}
                          <AlertDialog
                            open={showDelete}
                            onOpenChange={setShowDelete}
                          >
                            <DeleteTruckDialog
                              plateNumber={truck.plateNumber}
                              truckId={truck.id}
                              fetchTrucks={fetchTrucks}
                              onSuccess={() => setShowDelete(false)}
                            />
                          </AlertDialog>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        {/* Pagination (shared) */}
        <div className="flex items-center justify-between px-4">
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
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
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
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
