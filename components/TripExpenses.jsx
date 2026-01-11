"use client";

import React, { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import{
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  IconGripVertical,
  IconRefresh,
  IconTrendingDown,
  IconTrendingUp,
} from "@tabler/icons-react";
import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useSuperAdmin } from "../app/context/SuperAdminContext";

const AddExpenseForm = dynamic(
  () => import("../app/client/super-admin/components/forms/AddExpenseFrom"),
  {
    loading: () => (
      <div className="flex items-center justify-center p-4">
        <div className="loader"></div>
      </div>
    ),
    ssr: false,
  }
);

// Drag handle component
function DragHandle({ id }) {
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

// Draggable row component
function DraggableRow({ row }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id || row.id,
  });
  return (
    <TableRow
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      data-dragging={isDragging}
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

const TripExpenses = ({
  tripId,
  transportAmount = 0,
  onTotalsChange,
  onExpensesChange,
  hideAddExpense = false,
}) => {
  const { fetchExpensesByTrip, addExpenseToTrip, currentUser } =
    useSuperAdmin();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    Payment: "",
    rate: "",
    reason: "",
  });
  const [order, setOrder] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch expenses on mount
  useEffect(() => {
    const loadExpenses = async () => {
      if (!tripId) return;
      setLoading(true);
      const data = await fetchExpensesByTrip(tripId);
      const normalizedData = (data || []).map((exp, idx) => ({
        ...exp,
        id: exp._id || exp.id || `expense-${idx}`,
      }));
      setExpenses(normalizedData);
      setOrder(normalizedData.map((exp) => exp.id));
      setLoading(false);
    };
    loadExpenses();
  }, [tripId]);

  // Calculate total expenses
  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
  }, [expenses]);

  // Calculate remaining amount
  const remainingAmount = useMemo(() => {
    return Number(transportAmount) - totalExpenses;
  }, [transportAmount, totalExpenses]);

  // Notify parent of totals changes
  useEffect(() => {
    if (onTotalsChange) {
      onTotalsChange({
        total: totalExpenses,
        remaining: remainingAmount,
      });
    }
  }, [totalExpenses, remainingAmount, onTotalsChange]);

  // Notify parent of expenses changes
  useEffect(() => {
    if (onExpensesChange) {
      onExpensesChange(expenses);
    }
  }, [expenses, onExpensesChange]);

  // Handle add expense
  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!formData.Payment || !formData.rate) {
      toast.error("Payment and rate are required");
      return;
    }

    // Calculate USD amount as Payment / rate
    const amountUSD =
      Number(formData.rate) !== 0
        ? Number(formData.Payment) / Number(formData.rate)
        : 0;

    const result = await addExpenseToTrip(tripId, {
      Payment: Number(formData.Payment),
      rate: Number(formData.rate),
      amount: amountUSD,
      reason: formData.reason,
    });

    if (result.success) {
      toast.success("Expense added successfully");
      // Refresh expenses
      const data = await fetchExpensesByTrip(tripId);
      const normalizedData = (data || []).map((exp, idx) => ({
        ...exp,
        id: exp._id || exp.id || `expense-${idx}`,
      }));
      setExpenses(normalizedData);
      setOrder(normalizedData.map((exp) => exp.id));
      // Reset form
      setFormData({ Payment: "", rate: "", reason: "" });
      setDialogOpen(false);
    } else {
      toast.error(result.message || "Failed to add expense");
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await fetchExpensesByTrip(tripId);
      const normalizedData = (data || []).map((exp, idx) => ({
        ...exp,
        id: exp._id || exp.id || `expense-${idx}`,
      }));
      setExpenses(normalizedData);
      setOrder(normalizedData.map((exp) => exp.id));
      toast.success("Expenses refreshed");
    } catch {
      toast.error("Failed to refresh expenses");
    } finally {
      setRefreshing(false);
    }
  };

  // Handle drag end
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = order.findIndex((id) => String(id) === String(active.id));
    const newIndex = order.findIndex((id) => String(id) === String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;
    const newOrder = arrayMove(order, oldIndex, newIndex);
    setOrder(newOrder);
    toast.success("Expense order updated");
  };

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor)
  );

  const sortableId = React.useId();

  // Expenses columns for DataTable
  const expensesColumns = [
    {
      id: "drag",
      header: () => <div className="w-8"></div>,
      cell: ({ row }) => <DragHandle id={row.original.id} />,
      size: 50,
    },
    {
      accessorKey: "Payment",
      header: () => <span className="font-semibold">Payment (L)</span>,
      cell: ({ row }) => (
        <div className="font-semibold text-foreground">
          {Number(row.getValue("Payment")).toLocaleString()} L
        </div>
      ),
      size: 150,
    },
    {
      accessorKey: "rate",
      header: () => <span className="font-semibold">Rate</span>,
      cell: ({ row }) => (
        <Badge variant="secondary" className="font-mono">
          ${Number(row.getValue("rate")).toFixed(2)}/L
        </Badge>
      ),
      size: 120,
    },
    {
      accessorKey: "amount",
      header: () => <div className="font-semibold">Amount</div>,
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("amount"));
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount);
        return (
          <Badge
            variant="outline"
            className="font-semibold text-red-600 border-red-200 dark:border-red-800"
          >
            {formatted}
          </Badge>
        );
      },
      size: 150,
    },
    {
      accessorKey: "reason",
      header: () => <span className="font-semibold">Description</span>,
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {row.getValue("reason") || (
            <span className="italic opacity-50">No description</span>
          )}
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <div className="w-8"></div>,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 p-0 rounded-full hover:bg-accent"
            >
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem className="cursor-pointer">
              <Pencil className="mr-2 h-4 w-4" />
              Edit Expense
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Expense
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      size: 60,
    },
  ];

  const table = useReactTable({
    data: expenses,
    columns: expensesColumns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id?.toString() ?? "",
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center !p-8">
        <div className="loader"></div>
      </div>
    );
  }

  const dataIds = order.map(String);

  return (
    <>
      {/* Refresh button */}
      <div className="flex items-center justify-between !mb-4">
        <div className="flex-1"></div>
        <Button
          variant="default"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="bg-black text-white dark:bg-white dark:text-black border border-black dark:border-white hover:bg-neutral-900 dark:hover:bg-neutral-100"
          title="Refresh expenses"
        >
          <IconRefresh className="mr-1 size-4" />
          {refreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {/* Scrollable expenses table */}
      <div
        className={`${
          hideAddExpense === true ? "max-h-[180px]" : "max-h-[120px]"
        } overflow-y-auto`}
      >
        <div className="w-full">
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
                        <TableHead key={header.id}>
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
                        colSpan={expensesColumns.length}
                        className="h-24 text-center text-muted-foreground"
                      >
                        No expenses yet.
                        {!hideAddExpense && " Add your first expense below."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </DndContext>
          </div>
        </div>
      </div>

      {/* Fixed Add Expense button, only show if not completed */}
      {!hideAddExpense && (
        <AddExpenseForm
          dialogOpen={dialogOpen}
          setDialogOpen={setDialogOpen}
          formData={formData}
          setFormData={setFormData}
          handleAddExpense={handleAddExpense}
          totalExpenses={totalExpenses}
          remainingAmount={remainingAmount}
        />
      )}
    </>
  );
};

export default TripExpenses;
