"use client";

import React from "react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  IconCircleCheckFilled,
  IconLoader,
  IconRefresh,
  IconGripVertical,
  IconChevronsLeft,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsRight,
} from "@tabler/icons-react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  getFilteredRowModel,
  getSortedRowModel,
  type ColumnDef,
  type Row,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  type DragEndEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";

import { useSuperAdmin } from "../app/client/super-admin/context/SuperAdminContext";
import { DeleteIcon, MoreHorizontal } from "lucide-react";

function DeleteUserAlert({
  userName,
  userId,
  fetchUsers,
  trigger,
}: {
  userName: string;
  userId: string | number;
  fetchUsers?: () => Promise<void>;
  trigger: React.ReactNode;
}) {
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const { handleDeleteUser } = useSuperAdmin();

  const handleDelete = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await handleDeleteUser(userId);
      if (!result) {
        toast.error("Failed to delete user");
        throw new Error("Failed to delete user");
      }
      if (fetchUsers) await fetchUsers();
      toast.success(`User '${userName}' deleted successfully`);
      setOpen(false);
    } catch (e) {
      const errorMsg =
        e && typeof e === "object" && "message" in e
          ? (e.message as string)
          : "Failed to delete user";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete User</AlertDialogTitle>
          <AlertDialogDescription>
            <>
              This will permanently delete the user and related resources.
              <br />
              <input
                type="text"
                className="mt-2! w-full border rounded px-2! py-1!"
                placeholder={`Type '${userName}' to confirm`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
              />
              <br />
              <span className="text-red-900 text-xs mt-2! block">
                Deleting {userName} cannot be undone.
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
                input.trim().toLowerCase() !== userName.trim().toLowerCase() ||
                loading
              }
              onClick={async (e) => {
                e.preventDefault();
                await handleDelete();
              }}
            >
              {loading ? "Deleting..." : "Delete User"}
            </button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface User {
  id: string | number;
  _id?: string | number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt?: string;
}

const userColumns: ColumnDef<User>[] = [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.id ?? ""} />,
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <span>{row.original.email}</span>,
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => (
      <span className="capitalize">{row.original.role.replace("_", " ")}</span>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.original.isActive;
      let icon = null;
      let colorClass = "";
      if (isActive) {
        icon = (
          <IconCircleCheckFilled className="size-4 fill-green-500 dark:fill-green-400" />
        );
        colorClass = "text-green-600 dark:text-green-400";
      } else {
        icon = <IconLoader className="size-4 text-red-500" />;
        colorClass = "text-red-600 dark:text-red-400";
      }
      return (
        <Badge
          variant="outline"
          className={`px-1.5 flex items-center gap-1 ${colorClass}`}
        >
          {icon}
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: (info) => (
      <DeleteUserAlert
        userName={info.row.original.name}
        userId={info.row.original.id ?? ""}
        fetchUsers={undefined}
        trigger={
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8 p-0 m-0 mb-2 cursor-pointer rounded-full  transition"
          >
            <span className="sr-only">Open menu</span>
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
        }
      />
    ),
  },
];

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

function DraggableRow({
  row,
}: {
  row: Row<{
    id: string | number;
    _id?: string | number;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
    createdAt?: string;
  }>;
}) {
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

interface UsersDataTableProps {
  meta?: { fetchUsers?: () => Promise<void> };
  data: User[];
  fetchUsers?: () => Promise<void>;
}

export function UsersDataTable({ data, fetchUsers }: UsersDataTableProps) {
  const normalized = React.useMemo(
    () =>
      (data || []).map((u) => ({
        ...u,
        id: u.id ?? u._id ?? "",
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
  const [order, setOrder] = React.useState<(string | number)[]>(
    () => normalized.map((u) => u.id ?? "") as (string | number)[]
  );
  React.useEffect(() => {
    setOrder(normalized.map((u) => u.id ?? "") as (string | number)[]);
  }, [normalized]);
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor)
  );
  const dataIds = order.map(String);

  const table = useReactTable({
    data: normalized,
    columns: userColumns,
    meta: { fetchUsers },
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id?.toString() ?? "",
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
  });

  // Refresh state
  const [refreshing, setRefreshing] = React.useState(false);
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchUsers?.();
      toast.success("Users refreshed");
    } catch {
      toast.error("Failed to refresh users");
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
    toast.success("Row order updated (UI only)");
  }

  return (
    <>
      {/* Table for large screens */}
      <div className="w-full flex-col justify-start gap-6 hidden lg:block">
        <div className="relative flex flex-col gap-4 overflow-auto px-2">
          <div className="overflow-hidden rounded-lg border">
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
                <TableBody>
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
                        colSpan={userColumns.length}
                        className="h-24 text-center"
                      >
                        No users found. Create a user to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </DndContext>
          </div>
          {/* Pagination */}
          <div className="flex items-center justify-between px-4">
            <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
            <div className="flex w-full items-center gap-8 lg:w-fit">
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

      {/* Card list for small screens */}
      <div className="block lg:hidden w-full">
        {/* Card-based user list */}
        {(table.getRowModel().rows.length > 0
          ? table.getRowModel().rows
          : []
        ).map((row) => {
          const user = row.original;
          return (
            <div key={user._id || user.email} className="mb-2!">
              <div className="w-full flex flex-col gap-3 px-3! py-2! rounded-lg border bg-card">
                <div className="flex flex-row items-center justify-between">
                  <div className="flex items-center gap-5">
                    {/* Avatar */}
                    <div className="bg-white/60 backdrop-blur-md border border-white/30 text-black flex items-center justify-center w-10 h-10 rounded-full shadow-md">
                      {user.name
                        ? user.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .toUpperCase()
                        : "U"}
                    </div>
                    <div>
                      <p className="text-sm">{user.name}</p>
                      <p className="text-xs">{user.email}</p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="px-1.5! flex items-center gap-1"
                  >
                    <IconCircleCheckFilled className="size-4 fill-green-500 dark:fill-green-400" />
                    {user.isActive ? "active" : "inactive"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between mt-2!">
                  <p className="text-sm">
                    role: <span className="text-xs">{user.role}</span>
                  </p>
                  <div className="flex items-center gap-2">
                    <DeleteUserAlert
                      userName={user.name}
                      userId={user._id ? user._id : user.id ?? ""}
                      fetchUsers={fetchUsers}
                      trigger={
                        <Button variant="ghost" size="icon">
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
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {/* Pagination for mobile cards */}
        <div className="flex items-center justify-between px-4! mt-2!">
          <div className="text-muted-foreground flex-1 text-sm">
            {/* No row selection for mobile */}
          </div>
          <div className="flex w-full items-center gap-8">
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="ml-auto! flex items-center gap-2">
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
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
                className="size-8"
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
    </>
  );
}
