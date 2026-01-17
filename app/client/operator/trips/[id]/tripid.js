"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";

const DataTable = dynamic(
  () =>
    import("../../../../../components/trips-data-table").then((mod) => ({
      default: mod.DataTable,
    })),
  {
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div className="loader"></div>
      </div>
    ),
    ssr: false,
  }
);

const AddExpenseForm = dynamic(
  () => import("../../../super-admin/components/forms/AddExpenseForm"),
  {
    loading: () => (
      <div className="flex items-center justify-center p-4">
        <div className="loader"></div>
      </div>
    ),
    ssr: false,
  }
);

const TripExpenses = dynamic(
  () => import("../../../../../components/TripExpenses"),
  {
    loading: () => (
      <div className="flex items-center justify-center !p-8">
        <div className="loader"></div>
      </div>
    ),
    ssr: false,
  }
);

const TripCompleteForm = dynamic(
  () =>
    import("../../../super-admin/components/forms/TripCompleteDataSubmitform"),
  {
    loading: () => (
      <div className="flex items-center justify-center p-4">
        <div className="loader"></div>
      </div>
    ),
    ssr: false,
  }
);

import {
  IconAlertTriangle,
  IconLoader,
  IconCircleCheckFilled,
  IconQuestionMark,
  IconTrendingUp,
  IconGripVertical,
  IconDownload,
} from "@tabler/icons-react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
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
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

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
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Printer,
  Filter,
  Search,
  X,
  MoreHorizontal,
  Eye,
  Trash2,
  SlidersHorizontal,
} from "lucide-react";
import { useSuperAdmin } from "../../../../context/SuperAdminContext";

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

// Expenses Data Table Component
function ExpensesDataTable({ data, onView, onRemove }) {
  const expensesColumns = [
    {
      accessorKey: "name",
      header: "Expense",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "amount",
      header: () => <div className="text-right">Amount</div>,
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("amount"));
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount);
        return <div className="text-right font-medium">{formatted}</div>;
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const expense = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onView?.(expense)}>
                <Eye className="mr-2 h-4 w-4" />
                View Expense
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onRemove?.(expense.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remove Expense
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns: expensesColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full">
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={expensesColumns.length}
                  className="h-24 text-center"
                >
                  No expenses yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default function TripPage() {
  const params = useParams();
  const search = useSearchParams();
  const idFromParams = params?.id;
  const idFromQuery = search?.get("id");
  const tripId = idFromParams || idFromQuery || "";

  const {
    trips = [],
    trucks = [],
    users = [],
    fetchTrips,
    updateTrip,
    handleUpdateTruck,
  } = useSuperAdmin();
  const [loading, setLoading] = React.useState(true);
  const [expenseTotals, setExpenseTotals] = React.useState({
    total: 0,
    remaining: 0,
  });
  const [completeDialogOpen, setCompleteDialogOpen] = React.useState(false);
  const [tripExpenses, setTripExpenses] = React.useState([]);
  const [startingTrip, setStartingTrip] = React.useState(false);

  useEffect(() => {
    if (!trips || trips.length === 0) {
      fetchTrips?.();
    }
  }, [trips, fetchTrips]);

  const trip = trips.find((t) => String(t.id ?? t._id) === String(tripId));

  useEffect(() => {
    // Set loading to false once trips are loaded
    if (trips && trips.length > 0) {
      setLoading(false);
    }
    // Notification for scheduled trip start time
    if (trip && trip.status === "scheduled" && trip.startTime) {
      const startDate = new Date(trip.startTime);
      const now = new Date();
      if (now >= startDate) {
        toast.info(
          "Scheduled trip start time reached! You can now start the trip."
        );
      } else {
        // Set a timer to notify when start time is reached
        const msUntilStart = startDate.getTime() - now.getTime();
        if (msUntilStart > 0) {
          const timer = setTimeout(() => {
            toast.info(
              "Scheduled trip start time reached! You can now start the trip."
            );
          }, msUntilStart);
          return () => clearTimeout(timer);
        }
      }
    }
  }, [trips, trip]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[300px]">
        <div className="loader mx-auto"></div>
        <span className="block w-full text-center text-muted-foreground !mt-20 text-sm">
          Preparing trip details...
        </span>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="!py-6 px-4 lg:px-6">
        <div className="rounded-lg border p-6">
          <h2 className="text-lg font-semibold">Trip not found</h2>
          <p className="text-sm text-muted-foreground">
            No trip matches the provided id.
          </p>
        </div>
      </div>
    );
  }

  // Start Trip logic
  const handleStartTrip = async () => {
    setStartingTrip(true);
    try {
      const tripIdStr = String(trip?.id ?? trip?._id);
      const truckIdStr = String(truck?.id ?? truck?._id);
      // Update trip status to in-progress
      const result = await updateTrip(tripIdStr, { status: "in-progress" });
      if (result.success) {
        // Update truck status to in-use
        if (truckIdStr && handleUpdateTruck) {
          await handleUpdateTruck(truckIdStr, { status: "in-use" });
        }
        toast.success("Trip started!");
        await fetchTrips?.();
      } else {
        toast.error(result.message || "Failed to start trip");
      }
    } catch (e) {
      toast.error("Failed to start trip");
    } finally {
      setStartingTrip(false);
    }
  };

  // Resolve truck - merge nested trip.truckId with provider truck record (so driver/contact from provider is used when present)
  const truckRaw = trip?.truckId;
  const truckObj = truckRaw && typeof truckRaw === "object" ? truckRaw : null;
  const truckIdStr = truckObj?._id || truckRaw;
  const foundTruck = truckIdStr
    ? trucks.find((x) => String(x.id ?? x._id) === String(truckIdStr))
    : undefined;
  const truck = foundTruck
    ? { ...(truckObj || {}), ...foundTruck }
    : truckObj || foundTruck;

  // Resolve driver contact from truck only
  const driverPhone =
    truck?.PhoneNumber ??
    truck?.phoneNumber ??
    truck?.driverPhone ??
    truck?.driverContact ??
    null;

  // Resolve trip creator - check if createdBy is already an object or just an ID
  const createdByRaw = trip?.createdBy;
  const createdByObj =
    createdByRaw && typeof createdByRaw === "object" ? createdByRaw : null;
  const createdById = createdByObj?._id || createdByRaw;

  const creator =
    createdByObj ||
    (createdById
      ? users.find((u) => String(u.id ?? u._id) === String(createdById))
      : null);

  const start = trip.startTime ? new Date(trip.startTime) : null;
  const end = trip.endTime ? new Date(trip.endTime) : null;

  const handleCompleteTrip = async (tripData) => {
    try {
      const tripId = String(trip?.id ?? trip?._id);
      const truckIdStr = String(truck?.id ?? truck?._id);

      // Update trip with new status and endTime
      const result = await updateTrip(tripId, {
        status: "completed",
        endTime: tripData.endTime,
      });

      if (result.success) {
        // Update truck status to available
        if (truckIdStr && handleUpdateTruck) {
          await handleUpdateTruck(truckIdStr, { status: "available" });
        }

        toast.success("Trip completed successfully!");
        setCompleteDialogOpen(false);
        await fetchTrips?.();
      } else {
        toast.error(result.message || "Failed to complete trip");
      }
    } catch (error) {
      console.error("Complete trip error:", error);
      toast.error("Failed to complete trip");
    }
  };

  const handleDownloadCompletedTripPDF = () => {
    try {
      const startMoney = Number(trip?.transport || 0);
      const totalExpenses = expenseTotals?.total || 0;
      const netProfit = expenseTotals?.remaining || startMoney;

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Title
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("Trip Report", pageWidth / 2, 20, { align: "center" });

      // Trip ID/Reference
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Trip ID: ${trip?.id || trip?._id || "N/A"}`, 14, 30);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 36);

      // Section: Trip Details
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Trip Details", 14, 48);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const tripDetails = [
        [
          "Route",
          `${trip?.route?.origin || "-"} → ${trip?.route?.destination || "-"}`,
        ],
        ["Product", trip?.product || "-"],
        [
          "Truck",
          `${truck?.plateNumber || "-"}${
            truck?.model ? ` (${truck.model})` : ""
          }`,
        ],
        ["Driver", truck?.driverName || truck?.driver || "-"],
        ["Driver Contact", truck?.PhoneNumber || truck?.phoneNumber || "-"],
        [
          "Start Time",
          trip?.startTime ? new Date(trip.startTime).toLocaleString() : "-",
        ],
        [
          "End Time",
          trip?.endTime ? new Date(trip.endTime).toLocaleString() : "-",
        ],
        ["Status", trip?.status || "-"],
        [
          "Created By",
          creator?.name ? `${creator.name} (${creator.email || ""})` : "-",
        ],
      ];

      autoTable(doc, {
        startY: 52,
        head: [],
        body: tripDetails,
        theme: "plain",
        styles: { fontSize: 10, cellPadding: 2 },
        columnStyles: {
          0: { fontStyle: "bold", cellWidth: 40 },
          1: { cellWidth: "auto" },
        },
      });

      // Section: Expenses
      let finalY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Trip Expenses", 14, finalY);

      if (tripExpenses && tripExpenses.length > 0) {
        const expenseRows = tripExpenses.map((expense) => [
          `${Number(expense.Payment || 0).toLocaleString()}`,
          `${Number(expense.rate || 0).toFixed(2)}`,
          `${Number(expense.amount || 0).toLocaleString()}$`,
          expense.reason || "No description",
        ]);

        autoTable(doc, {
          startY: finalY + 4,
          head: [["Payment", "Rate", "Amount", "Description"]],
          body: expenseRows,
          theme: "grid",
          styles: { fontSize: 9, cellPadding: 3 },
          headStyles: { fillColor: [66, 139, 202], fontStyle: "bold" },
          columnStyles: {
            0: { cellWidth: 30 },
            1: { cellWidth: 30 },
            2: { cellWidth: 30, fontStyle: "bold", textColor: [220, 53, 69] },
            3: { cellWidth: "auto", fontStyle: "italic" },
          },
        });

        finalY = doc.lastAutoTable.finalY + 10;
      } else {
        doc.setFontSize(10);
        doc.setFont("helvetica", "italic");
        doc.text("No expenses recorded", 14, finalY + 6);
        finalY += 16;
      }

      // Section: Financial Summary
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Financial Summary", 14, finalY);

      autoTable(doc, {
        startY: finalY + 4,
        head: [],
        body: [
          ["Start Money", `$${startMoney.toLocaleString()}`],
          ["Total Expenses", `-$${totalExpenses.toLocaleString()}`],
          ["Net Profit", `$${netProfit.toLocaleString()}`],
        ],
        theme: "striped",
        styles: { fontSize: 11, cellPadding: 4 },
        columnStyles: {
          0: { fontStyle: "bold", cellWidth: 60 },
          1: { cellWidth: "auto", halign: "right", fontStyle: "bold" },
        },
        didParseCell: function (data) {
          if (data.row.index === 1) {
            data.cell.styles.textColor = [220, 53, 69];
          }
          if (data.row.index === 2) {
            data.cell.styles.textColor = [40, 167, 69];
            data.cell.styles.fontSize = 12;
          }
        },
      });

      // Footer
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(128);
      doc.text("Fleet Manager - Trip Report", pageWidth / 2, pageHeight - 10, {
        align: "center",
      });

      // Save PDF
      const fileName = `Trip_Report_${
        trip?.id || trip?._id || "Unknown"
      }_${new Date().getTime()}.pdf`;
      doc.save(fileName);

      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF");
    }
  };

  function StatusBadge({ status }) {
    let icon = null;
    let colorClass = "";
    let label = status;

    if (status === "scheduled") {
      icon = (
        <IconAlertTriangle className="size-4 text-yellow-500 dark:text-yellow-400" />
      );
      colorClass = "text-yellow-600 dark:text-yellow-400";
      label = "Scheduled";
    } else if (status === "in-progress") {
      icon = (
        <IconLoader className="size-4 animate-spin text-green-500 dark:text-green-400" />
      );
      colorClass = "text-green-600 dark:text-green-400";
      label = "In Progress";
    } else if (status === "completed") {
      icon = (
        <IconCircleCheckFilled className="size-4 fill-blue-500 dark:fill-blue-400" />
      );
      colorClass = "text-blue-600 dark:text-blue-400";
      label = "Completed";
    } else {
      icon = <IconQuestionMark className="size-4 text-gray-400" />;
      colorClass = "text-gray-500 dark:text-gray-400";
      label = status || "Unknown";
    }

    return (
      <Badge
        variant="outline"
        className={`px-1.5 flex items-center gap-1 ${colorClass}`}
      >
        {icon}
        {label}
      </Badge>
    );
  }

  return (
    <div className="!py-6 !px-4 lg:!px-6 flex flex-col gap-5">
      <Card className="w-full md:flex hidden">
        <CardContent className="flex items-center justify-between gap-4 p-4">
          <div className="flex flex-wrap items-center gap-3 sm:gap-5">
            {/* Icon */}
            <img
              src="https://cdn-icons-png.flaticon.com/128/3987/3987997.png"
              alt="Route icon"
              className="w-10 h-10 sm:w-12 sm:h-12"
            />

            {/* Route info */}
            <div className="flex flex-wrap items-center text-lg sm:text-2xl gap-3 font-bold tracking-wider">
              <span className="truncate max-w-[120px] sm:max-w-none">
                {trip.route?.origin || "-"}
              </span>

              {/* Arrow */}
              <span className="mx-2 flex items-center">
                <svg
                  width="16"
                  height="12"
                  viewBox="0 0 22 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M3 7.28571C3.71008 7.28571 4.28571 6.71008 4.28571 6C4.28571 5.28992 3.71008 4.71429 3 4.71429C2.28992 4.71429 1.71429 5.28992 1.71429 6C1.71429 6.71008 2.28992 7.28571 3 7.28571ZM3 9C4.65685 9 6 7.65685 6 6C6 4.34315 4.65685 3 3 3C1.34315 3 0 4.34315 0 6C0 7.65685 1.34315 9 3 9Z"
                    fill="#0046E0"
                  />
                  <g clipPath="url(#clip0_269_43946)">
                    <path
                      d="M15.5266 0L14 1.415L18.9467 6L14 10.585L15.5266 12L22 6L15.5266 0Z"
                      fill="#0046E0"
                    />
                  </g>
                  <rect x="8" y="5" width="2" height="2" fill="#0046E0" />
                  <rect x="12" y="5" width="2" height="2" fill="#0046E0" />
                  <defs>
                    <clipPath id="clip0_269_43946">
                      <rect
                        width="8"
                        height="12"
                        fill="white"
                        transform="translate(14)"
                      />
                    </clipPath>
                  </defs>
                </svg>
              </span>

              <span className="truncate max-w-[120px] sm:max-w-none">
                {trip.route?.destination || "-"}
              </span>

              {/* Truck info */}
              <span className="block w-full sm:w-auto sm:ml-4 text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-0">
                {truck?.plateNumber || truck?.model
                  ? `(${truck?.plateNumber || ""}${
                      truck?.model ? ` — ${truck.model}` : ""
                    }${truck?.status ? ` • ${truck.status}` : ""})`
                  : "Unassigned"}
              </span>
            </div>
          </div>

          {/* Right side: Actions */}
          <div className="flex items-center gap-2">
            <StatusBadge status={trip.status} />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6">
        {/* Left column - Trip */}
        <Card className="w-full">
          <CardHeader className="!pb-2 flex flex-col gap-2 ">
            <h4 className="text-sm underline tracking-wider !mb-1">
              Trip Information
            </h4>
            <div className="flex justify-between w-full items-start">
              <div className="flex items-center gap-4">
                {/* SVG route icon */}
                <div className="w-4 h-24 flex-shrink-0 flex items-center justify-center">
                  <svg
                    width="14"
                    height="100%"
                    viewBox="0 0 16 100"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Origin block */}
                    <path
                      fill="#0046E0"
                      stroke="#9FBBF7"
                      strokeWidth=".5"
                      d="M14 2v12H2V2h12z"
                    />
                    <rect
                      width="4"
                      height="4"
                      x="6"
                      y="6"
                      stroke="#fff"
                      rx="2"
                    />
                    {/* Destination block */}
                    <path
                      fill="#0046E0"
                      stroke="#9FBBF7"
                      strokeWidth=".5"
                      d="M14 86v12H2V86h12z"
                    />
                    <rect
                      width="4"
                      height="4"
                      x="6"
                      y="90"
                      fill="#fff"
                      stroke="#fff"
                      rx="2"
                    />
                    {/* Connecting line */}
                    <path
                      fill="#636D78"
                      fillRule="evenodd"
                      d="M7.872 20v1.454h1V20h-1zm0 4.361v2.907h1v-2.907h-1zm0 5.815v2.907h1v-2.907h-1zm0 5.814v2.907h1V35.99h-1zm0 5.815v2.907h1v-2.907h-1zm0 5.815v2.907h1V47.62h-1zm0 5.814v2.907h1v-2.907h-1zm0 5.815v2.907h1V59.25h-1zm0 5.814v2.908h1v-2.908h-1zm0 5.815v2.907h1v-2.907h-1zm1 7.819V75h-1v3.697l-2.129-2.365-.743.67 3 3.333.372.412.371-.412 3-3.334-.743-.669-2.128 2.365z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>

                {/* Origin/Destination */}
                <div className="flex flex-col gap-4">
                  <div className="!mb-5">
                    <p className="tracking-wider text-xs ">
                      {trip.route?.origin || "Origin"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {start
                        ? `${start.toLocaleDateString()} ${start.toLocaleTimeString(
                            [],
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}`
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <p className=" text-xs tracking-wider">
                      {trip.route?.destination || "Destination"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {end
                        ? `${end.toLocaleDateString()} ${end.toLocaleTimeString(
                            [],
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}`
                        : trip.arrivalTime || "-"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="md:hidden flex">
                <StatusBadge status={trip.status} />
              </div>
            </div>
          </CardHeader>

          <CardContent className="!space-y-5 h-fit text-sm">
            <div>
              <h4 className="text-sm font-semibold !mb-3 text-foreground">
                Equipment
              </h4>
              <div className="!space-y-2">
                <div className="text-xs flex items-start">
                  <span className="text-muted-foreground min-w-[70px]">
                    Product:
                  </span>
                  <span className="font-medium">{trip.product || "-"}</span>
                </div>
                <div className="text-xs flex items-start">
                  <span className="text-muted-foreground min-w-[70px]">
                    Truck:
                  </span>
                  <span className="font-medium">
                    {truck?.plateNumber
                      ? `${truck.plateNumber}${
                          truck?.model ? ` — ${truck.model}` : ""
                        }`
                      : "Unassigned"}
                  </span>
                </div>
                <div className="text-xs flex items-start">
                  <span className="text-muted-foreground min-w-[70px]">
                    Driver:
                  </span>
                  <span className="font-medium">
                    {truck?.driverName || truck?.driver || "—"}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold !mb-3 text-foreground">
                Contact Information
              </h4>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Driver Contact
                  </p>
                  {driverPhone ? (
                    <a
                      className="text-xs font-medium text-primary hover:underline"
                      href={`tel:${String(driverPhone)}`}
                    >
                      {String(driverPhone)}
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Created By
                  </p>
                  {creator ? (
                    <div className="text-xs">
                      <span className="font-medium">{creator.name || "-"}</span>
                      {creator.email && (
                        <>
                          {" • "}
                          <a
                            className="text-primary hover:underline"
                            href={`mailto:${creator.email}`}
                          >
                            {creator.email}
                          </a>
                        </>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end !pt-4 border-t">
            {trip.status === "completed" ? (
              <Button
                variant="default"
                size="sm"
                onClick={handleDownloadCompletedTripPDF}
                className="gap-2"
              >
                <IconDownload className="h-4 w-4" />
                Download Trip PDF
              </Button>
            ) : trip.status === "scheduled" ? (
              <Button
                variant="default"
                size="sm"
                onClick={handleStartTrip}
                disabled={startingTrip}
                className="gap-2"
              >
                <IconLoader
                  className={startingTrip ? "h-4 w-4 animate-spin" : "h-4 w-4"}
                />
                {startingTrip ? "Starting..." : "Start Trip"}
              </Button>
            ) : (
              <Dialog
                open={completeDialogOpen}
                onOpenChange={setCompleteDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="default" size="sm">
                    Complete Trip
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Complete Trip</DialogTitle>
                    <DialogDescription>
                      Review the trip summary and mark the trip as complete
                    </DialogDescription>
                  </DialogHeader>
                  <TripCompleteForm
                    trip={trip}
                    truck={truck}
                    expenseTotals={expenseTotals}
                    expenses={tripExpenses}
                    creator={creator}
                    onComplete={handleCompleteTrip}
                    onCancel={() => setCompleteDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            )}
          </CardFooter>
        </Card>
        {/* Middle column - Trips expense calculator */}

        <Card className="w-full">
          <CardHeader className="!pb-3">
            <CardTitle className="text-sm underline tracking-wider">
              Trip Expenses
            </CardTitle>
          </CardHeader>

          <CardContent className="!space-y-3">
            {/* Total */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground">Start Money</div>
                <div className="text-2xl font-bold">
                  ${Number(trip.transport || 0).toLocaleString()}
                </div>
              </div>
            </div>
            {/* Expenses Section */}
            <div className="flex flex-col">
              <h1 className="text-xs font-semibold mb-2">Expenses</h1>

              <TripExpenses
                tripId={tripId}
                transportAmount={trip.transport}
                onTotalsChange={setExpenseTotals}
                onExpensesChange={setTripExpenses}
                hideAddExpense={trip.status !== "in-progress"}
              />
            </div>
          </CardContent>

          <CardFooter className="!pt-5 border-t flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Total Expenses</p>
              <p className="text-sm font-semibold text-red-600">
                -${expenseTotals.total.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Net Profit Amount</p>
              <p className="text-lg font-bold text-green-600">
                ${expenseTotals.remaining.toLocaleString()}
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Related Trips Section */}
      <RelatedTripsSection
        truckId={truck?._id || truck?.id}
        truckPlateNumber={truck?.plateNumber}
        currentTripId={tripId}
      />
    </div>
  );
}

// Helper component to show related trips with filters
function RelatedTripsSection({ truckId, truckPlateNumber, currentTripId }) {
  const { trips = [], users = [], trucks = [] } = useSuperAdmin();
  const [sheetOpen, setSheetOpen] = useState(false);

  // Filter states
  const [statusFilter, setStatusFilter] = useState("all");
  const [timePeriodFilter, setTimePeriodFilter] = useState("all");
  const [productSearch, setProductSearch] = useState("");
  const [destinationSearch, setDestinationSearch] = useState("");

  // Count active filters
  const activeFiltersCount = [
    statusFilter !== "all",
    timePeriodFilter !== "all",
    productSearch !== "",
    destinationSearch !== "",
  ].filter(Boolean).length;

  const filteredTrips = React.useMemo(() => {
    return (trips || []).filter((t) => {
      // Filter by truck
      const truckRaw = (t && t.truckId) || null;
      const truckObj =
        truckRaw && typeof truckRaw === "object" ? truckRaw : null;
      const truckIdStr = truckObj?._id || truckRaw;
      if (String(truckIdStr) !== String(truckId)) return false;

      // Filter by status
      if (statusFilter !== "all" && t.status !== statusFilter) return false;

      // Filter by time period
      if (timePeriodFilter !== "all" && t.startTime) {
        const tripDate = new Date(t.startTime);
        const now = new Date();

        switch (timePeriodFilter) {
          case "today":
            if (
              tripDate.getDate() !== now.getDate() ||
              tripDate.getMonth() !== now.getMonth() ||
              tripDate.getFullYear() !== now.getFullYear()
            )
              return false;
            break;
          case "this-week":
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - now.getDay());
            weekStart.setHours(0, 0, 0, 0);
            if (tripDate < weekStart) return false;
            break;
          case "this-month":
            if (
              tripDate.getMonth() !== now.getMonth() ||
              tripDate.getFullYear() !== now.getFullYear()
            )
              return false;
            break;
          case "this-year":
            if (tripDate.getFullYear() !== now.getFullYear()) return false;
            break;
        }
      }

      // Filter by product (case-insensitive)
      if (
        productSearch &&
        !t.product?.toLowerCase().includes(productSearch.toLowerCase())
      ) {
        return false;
      }

      // Filter by destination (case-insensitive)
      if (destinationSearch) {
        const destination = t.route?.destination?.toLowerCase() || "";
        if (!destination.includes(destinationSearch.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }, [
    trips,
    truckId,
    statusFilter,
    timePeriodFilter,
    productSearch,
    destinationSearch,
  ]);

  const clearAllFilters = () => {
    setStatusFilter("all");
    setTimePeriodFilter("all");
    setProductSearch("");
    setDestinationSearch("");
  };

  return (
    <div className="!space-y-4">
      {/* Header with filter button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Left: Title with count */}
        <div className="flex items-center justify-between gap-2 text-sm tracking-wider">
          <span className="font-medium">
            {truckPlateNumber ? truckPlateNumber : "KBX"} Trips
          </span>
          <Button
            size="sm"
            className="rounded-full !px-3  text-xs font-semibold"
          >
            {filteredTrips.length}
          </Button>
        </div>
        {/* Right: Filter button */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <SlidersHorizontal />
              Filters
              {activeFiltersCount > 0 && (
                <Badge
                  variant="secondary"
                  className="!ml-1 !px-1.5 py-0 text-xs"
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Filter Trips</SheetTitle>
              <SheetDescription>
                Refine your trip results using the filters below
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-6 mt-6">
              {/* Status Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Status</Label>
                <div className="flex flex-wrap gap-2">
                  {["all", "scheduled", "in-progress", "completed"].map(
                    (status) => (
                      <Button
                        key={status}
                        variant={
                          statusFilter === status ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setStatusFilter(status)}
                        className="capitalize"
                      >
                        {status === "all" ? "All" : status.replace("-", " ")}
                      </Button>
                    )
                  )}
                </div>
              </div>

              {/* Time Period Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Time Period</Label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "all", label: "All Time" },
                    { value: "today", label: "Today" },
                    { value: "this-week", label: "This Week" },
                    { value: "this-month", label: "This Month" },
                    { value: "this-year", label: "This Year" },
                  ].map((period) => (
                    <Button
                      key={period.value}
                      variant={
                        timePeriodFilter === period.value
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => setTimePeriodFilter(period.value)}
                    >
                      {period.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Product Search */}
              <div className="!space-y-2">
                <Label htmlFor="product-search" className="text-sm font-medium">
                  Product
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="product-search"
                    placeholder="Search by product..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="!pl-9 !pr-9"
                  />
                  {productSearch && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
                      onClick={() => setProductSearch("")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Destination Search */}
              <div className="space-y-2">
                <Label
                  htmlFor="destination-search"
                  className="text-sm font-medium"
                >
                  Destination
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="destination-search"
                    placeholder="Search by destination..."
                    value={destinationSearch}
                    onChange={(e) => setDestinationSearch(e.target.value)}
                    className="!pl-9 !pr-9"
                  />
                  {destinationSearch && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
                      onClick={() => setDestinationSearch("")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Clear all button */}
              {activeFiltersCount > 0 && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={clearAllFilters}
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Data Table */}
      <DataTable data={filteredTrips} meta={{ trucks, users }} />
    </div>
  );
}
