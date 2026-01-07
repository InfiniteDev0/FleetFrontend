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
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { IconEye, IconTrash, IconDotsVertical } from "@tabler/icons-react";
import {
  // Removed unused IconDotsVertical import
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
import { MoreHorizontal } from "lucide-react";

type DeleteUserAlertProps = {
  userName: string;
  userId: string | number;
  fetchUsers?: () => Promise<void>;
  trigger?: React.ReactNode;
  open: boolean;
  setOpen: (open: boolean) => void;
};

function DeleteUserAlert({
  open,
  setOpen,
  userName,
  userId,
  fetchUsers,
  trigger,
}: DeleteUserAlertProps) {
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
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
                className="mt-2 w-full border rounded px-2 py-1"
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
    cell: ({ row }) => <DragHandle id={row.original.id} />,
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
  // The actions column will be handled in the UsersDataTable component, not here
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

function DraggableRow({ row }: { row: Row<any> }) {
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
        id: u.id || u._id,
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
    columns: userColumns as any,
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
    <div className="w-full flex-col justify-start gap-6!">
      <div className="flex items-center justify-between mb-2!">
        <div className="flex-1"></div>
        <Button
          variant="default"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="ml-2! bg-black text-white dark:bg-white dark:text-black border border-black dark:border-white hover:bg-neutral-900 dark:hover:bg-neutral-100"
          title="Refresh users list"
        >
          <IconRefresh className="mr-1! size-4" />
          {refreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>
      <div className="relative flex flex-col gap-4! overflow-auto px-2!">
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
                      colSpan={userColumns.length}
                      className="h-24! text-center!"
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
        <div className="flex items-center justify-between px-4!">
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex w-full items-center gap-8! lg:w-fit!">
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
