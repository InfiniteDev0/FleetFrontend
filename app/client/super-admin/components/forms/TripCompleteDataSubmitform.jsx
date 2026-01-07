"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  IconTruck,
  IconCurrencyDollar,
  IconReceipt,
  IconAlertTriangle,
  IconLoader,
  IconCircleCheckFilled,
  IconQuestionMark,
  IconDownload,
} from "@tabler/icons-react";

const TripCompleteDataSubmitform = ({
  trip,
  truck,
  expenseTotals,
  expenses = [],
  creator,
  onComplete,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false);
  const [endTime, setEndTime] = useState(() => {
    const now = new Date();
    return now.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:mm
  });

  const handleEndTrip = async () => {
    if (!endTime) {
      toast.error("Please select an end time");
      return;
    }

    setLoading(true);
    try {
      // Calculate net profit
      const netProfit = expenseTotals?.remaining ?? trip.transport;
      // Call the onComplete callback with trip data, end time, and updated transport
      await onComplete?.({
        ...trip,
        endTime: new Date(endTime).toISOString(),
        status: "completed",
        transport: netProfit,
      });
      toast.success("Trip completed successfully!");
    } catch (error) {
      toast.error("Failed to complete trip");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    try {
      // Calculate financial values
      const startMoney = Number(trip?.transport || 0);
      const totalExpenses = expenseTotals?.total || 0;
      const netProfit = expenseTotals?.remaining || startMoney;

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Title
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("Trip Completion Report", pageWidth / 2, 20, {
        align: "center",
      });

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
        ["End Time", endTime ? new Date(endTime).toLocaleString() : "-"],
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

      if (expenses && expenses.length > 0) {
        const expenseRows = expenses.map((expense) => [
          `${Number(expense.Payment || 0).toLocaleString()} L`,
          `$${Number(expense.rate || 0).toFixed(2)}/L`,
          `$${Number(expense.amount || 0).toLocaleString()}`,
          expense.reason || "No description",
        ]);

        autoTable(doc, {
          startY: finalY + 4,
          head: [["Payment (L)", "Rate", "Amount", "Description"]],
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
            data.cell.styles.textColor = [220, 53, 69]; // Red for expenses
          }
          if (data.row.index === 2) {
            data.cell.styles.textColor = [40, 167, 69]; // Green for profit
            data.cell.styles.fontSize = 12;
          }
        },
      });

      // Footer
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(128);
      doc.text(
        "Fleet Manager - Trip Completion Report",
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" }
      );

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

  const startMoney = Number(trip?.transport || 0);
  const totalExpenses = expenseTotals?.total || 0;
  const netProfit = expenseTotals?.remaining || startMoney;

  return (
    <div className="!space-y-6">
      {/* Trip Summary Header */}
      <div className="!space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center !gap-2">
            <IconTruck className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">Trip Summary</h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadPDF}
            className="!gap-2"
          >
            <IconDownload className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Review the trip details before marking it as complete
        </p>
      </div>

      <Separator />

      {/* Trip Details Section */}
      <div className="!space-y-4">
        <h4 className="text-sm font-semibold text-foreground">Trip Details</h4>

        <div className="grid grid-cols-2 !gap-4">
          <div>
            <p className="text-xs text-muted-foreground !mb-1">Route</p>
            <p className="text-sm font-medium">
              {trip?.route?.origin || "-"} → {trip?.route?.destination || "-"}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground !mb-1">Product</p>
            <p className="text-sm font-medium">{trip?.product || "-"}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground !mb-1">Truck</p>
            <p className="text-sm font-medium">
              {truck?.plateNumber || "-"}
              {truck?.model && ` (${truck.model})`}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground !mb-1">Driver</p>
            <p className="text-sm font-medium">
              {truck?.driverName || truck?.driver || "-"}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground !mb-1">Start Time</p>
            <p className="text-sm font-medium">
              {trip?.startTime
                ? new Date(trip.startTime).toLocaleString()
                : "-"}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground !mb-1">
              Driver Contact
            </p>
            <p className="text-sm font-medium">
              {truck?.PhoneNumber ||
              truck?.phoneNumber ||
              truck?.driverPhone ||
              truck?.driverContact ? (
                <a
                  className="text-primary underline"
                  href={`tel:${String(
                    truck?.PhoneNumber ||
                      truck?.phoneNumber ||
                      truck?.driverPhone ||
                      truck?.driverContact
                  )}`}
                >
                  {String(
                    truck?.PhoneNumber ||
                      truck?.phoneNumber ||
                      truck?.driverPhone ||
                      truck?.driverContact
                  )}
                </a>
              ) : (
                "-"
              )}
            </p>
          </div>

          <div className="col-span-2">
            <p className="text-xs text-muted-foreground !mb-1">Created By</p>
            <p className="text-sm font-medium">
              {creator?.name || "-"}
              {creator?.email && (
                <>
                  {" • "}
                  <a
                    className="text-primary underline"
                    href={`mailto:${creator.email}`}
                  >
                    {creator.email}
                  </a>
                </>
              )}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground !mb-1">Status</p>
            {(() => {
              const status = trip?.status;
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
                  className={`px-1.5 flex items-center !gap-1 ${colorClass}`}
                >
                  {icon}
                  {label}
                </Badge>
              );
            })()}
          </div>
        </div>
      </div>

      <Separator />

      {/* End Time Input */}
      <div className="!space-y-4">
        <h4 className="text-sm font-semibold text-foreground">End Time</h4>
        <div>
          <Label htmlFor="endTime" className="text-xs text-muted-foreground">
            Trip Completion Date & Time
          </Label>
          <Input
            id="endTime"
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="!mt-2"
            required
          />
        </div>
      </div>

      <Separator />

      {/* Expenses List */}
      {expenses && expenses.length > 0 && (
        <>
          <div className="!space-y-4">
            <div className="flex items-center !gap-2">
              <IconReceipt className="h-4 w-4 text-primary" />
              <h4 className="text-sm font-semibold text-foreground">
                Trip Expenses ({expenses.length})
              </h4>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left !p-2 text-xs font-semibold">
                      Payment (L)
                    </th>
                    <th className="text-left !p-2 text-xs font-semibold">
                      Rate
                    </th>
                    <th className="text-left !p-2 text-xs font-semibold">
                      Amount
                    </th>
                    <th className="text-left !p-2 text-xs font-semibold">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense, index) => (
                    <tr key={expense.id || index} className="border-t">
                      <td className="!p-2 font-medium">
                        {Number(expense.Payment || 0).toLocaleString()} L
                      </td>
                      <td className="!p-2">
                        ${Number(expense.rate || 0).toFixed(2)}/L
                      </td>
                      <td className="!p-2 font-semibold text-red-600">
                        ${Number(expense.amount || 0).toLocaleString()}
                      </td>
                      <td className="!p-2 text-muted-foreground italic">
                        {expense.reason || "No description"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Separator />
        </>
      )}

      {/* Financial Summary */}
      <div className="!space-y-4">
        <div className="flex items-center !gap-2">
          <IconReceipt className="h-4 w-4 text-primary" />
          <h4 className="text-sm font-semibold text-foreground">
            Financial Summary
          </h4>
        </div>

        <div className="bg-muted/50 rounded-lg !p-4 !space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Start Money</span>
            <span className="text-lg font-bold">
              ${startMoney.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              Total Expenses
            </span>
            <span className="text-sm font-semibold text-red-600">
              -${totalExpenses.toLocaleString()}
            </span>
          </div>

          <Separator />

          <div className="flex justify-between items-center !pt-2">
            <div className="flex items-center !gap-2">
              <IconCurrencyDollar className="h-5 w-5 text-green-600" />
              <span className="text-sm font-semibold">Net Profit</span>
            </div>
            <span className="text-2xl font-bold text-green-600">
              ${netProfit.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex !gap-3 !pt-4">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          onClick={handleEndTrip}
          disabled={loading}
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          {loading ? "Completing..." : "End Trip"}
        </Button>
      </div>
    </div>
  );
};

export default TripCompleteDataSubmitform;
