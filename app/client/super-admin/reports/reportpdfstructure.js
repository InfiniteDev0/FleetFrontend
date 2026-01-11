import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// --- MONTHLY REPORT ---
async function generateMonthlyReportPDF(trips, monthLabel, year, docOverride) {
  const doc = docOverride || new jsPDF();
  doc.setFontSize(18);
  doc.text(`${monthLabel} Monthly Report`, 14, 18);
  doc.setFontSize(12);
  doc.text("Summary", 14, 28);

  // Collect all trucks (even those with no trips)
  const allTruckIds = new Set();
  trips.forEach((trip) => {
    if (trip.truckId?.plateNumber) allTruckIds.add(trip.truckId.plateNumber);
    else if (trip.truckId) allTruckIds.add(trip.truckId);
  });
  // Optionally, you can pass a list of all trucks to this function for a full list
  const trucksMap = {};
  trips.forEach((trip) => {
    const truckKey =
      trip.truckId?.plateNumber || trip.truckId || "Unknown Truck";
    if (!trucksMap[truckKey]) trucksMap[truckKey] = [];
    trucksMap[truckKey].push(trip);
  });

  // Add trucks with no trips
  allTruckIds.forEach((truckId) => {
    if (!trucksMap[truckId]) trucksMap[truckId] = [];
  });

  // Summary
  let monthTotalRevenue = trips.reduce(
    (sum, t) => sum + Number(t.transport || 0),
    0
  );
  let monthTotalExpenses = trips.reduce(
    (sum, t) =>
      sum +
      (t.expenses
        ? t.expenses.reduce((s, e) => s + Number(e.amount || 0), 0)
        : 0),
    0
  );
  let monthTotalTrips = trips.length;
  doc.setFontSize(11);
  doc.text(`Total Trips: ${monthTotalTrips}`, 14, 36);
  doc.text(`Total Revenue: $${monthTotalRevenue.toLocaleString()}`, 14, 44);
  doc.text(`Total Expenses: $${monthTotalExpenses.toLocaleString()}`, 14, 52);
  doc.text(
    `Net Income: $${(monthTotalRevenue - monthTotalExpenses).toLocaleString()}`,
    14,
    60
  );

  let truckCount = 0;
  for (const [truck, truckTrips] of Object.entries(trucksMap)) {
    doc.addPage();
    doc.setFontSize(15);
    doc.text(`Truck: ${truck}`, 14, 18);
    // Show truck status (from first trip if available)
    let truckStatus =
      truckTrips.length > 0
        ? truckTrips[0].truckStatus || truckTrips[0].status || "-"
        : "-";
    doc.setFontSize(11);
    doc.text(`Status: ${truckStatus}`, 14, 26);
    if (truckTrips.length === 0) {
      doc.setFontSize(12);
      doc.text("This truck went on no trips this month.", 14, 38);
      continue;
    }
    let truckRevenue = 0;
    truckTrips.forEach((trip, idx) => {
      doc.setFontSize(13);
      doc.text(
        `Trip #${idx + 1}`,
        14,
        doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 38
      );
      autoTable(doc, {
        head: [
          [
            "Product",
            "Origin",
            "Destination",
            "Transport",
            "Status",
            "Created By",
            "Created At",
            "End Time",
          ],
        ],
        body: [
          [
            trip.product || "-",
            trip.route?.origin || "-",
            trip.route?.destination || "-",
            trip.transport || 0,
            trip.status,
            trip.createdBy?.name || "-",
            trip.createdAt ? new Date(trip.createdAt).toLocaleString() : "-",
            trip.endTime ? new Date(trip.endTime).toLocaleString() : "-",
          ],
        ],
        startY: doc.lastAutoTable ? doc.lastAutoTable.finalY + 14 : 44,
        margin: { left: 14, right: 14 },
        theme: "grid",
        styles: { fontSize: 9 },
      });
      truckRevenue += Number(trip.transport || 0);
      // Expenses for this trip
      if (trip.expenses && trip.expenses.length > 0) {
        doc.setFontSize(11);
        doc.text("Expenses:", 18, doc.lastAutoTable.finalY + 8);
        autoTable(doc, {
          head: [
            ["Reason", "Amount", "Payment", "Rate", "Added By", "Created At"],
          ],
          body: trip.expenses.map((exp) => [
            exp.reason || "-",
            exp.amount || 0,
            exp.Payment || 0,
            exp.rate || 0,
            exp.addedBy?.name || "-",
            exp.createdAt ? new Date(exp.createdAt).toLocaleString() : "-",
          ]),
          startY: doc.lastAutoTable.finalY + 12,
          margin: { left: 18, right: 14 },
          theme: "striped",
          styles: { fontSize: 8 },
        });
      } else {
        doc.setFontSize(11);
        doc.text(
          "No expenses for this trip.",
          18,
          doc.lastAutoTable.finalY + 10
        );
      }
    });
    doc.setFontSize(12);
    doc.text(
      `Total Revenue for this truck: $${truckRevenue.toLocaleString()}`,
      14,
      doc.lastAutoTable ? doc.lastAutoTable.finalY + 16 : 80
    );
    truckCount++;
  }

  if (!docOverride) {
    doc.save(`${monthLabel.replace(/\s+/g, "_")}_monthly_report_${year}.pdf`);
  }
}

// --- YEARLY REPORT ---
async function generateYearlyReportPDF(trips, year) {
  const doc = new jsPDF();
  const now = new Date();
  const currentMonthIdx = now.getFullYear() === year ? now.getMonth() : 11;
  const FULL_MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  let annualRevenue = 0;
  let annualExpenses = 0;
  let annualTrips = 0;
  for (let m = 0; m <= currentMonthIdx; m++) {
    const monthLabel = FULL_MONTHS[m];
    const monthTrips = trips.filter((trip) => {
      const d = new Date(trip.endTime);
      return d.getFullYear() === year && d.getMonth() === m;
    });
    if (monthTrips.length === 0) continue;
    if (m > 0) doc.addPage();
    await generateMonthlyReportPDF(monthTrips, monthLabel, year, doc);
    // For summary, recalc here
    annualTrips += monthTrips.length;
    annualRevenue += monthTrips.reduce(
      (sum, trip) => sum + Number(trip.transport || 0),
      0
    );
    annualExpenses += monthTrips.reduce(
      (sum, trip) =>
        sum +
        (trip.expenses
          ? trip.expenses.reduce((s, e) => s + Number(e.amount || 0), 0)
          : 0),
      0
    );
  }
  // Annual summary
  doc.addPage();
  doc.text(`Yearly Summary (${year})`, 14, 20);
  doc.text(`Total Trips: ${annualTrips}`, 14, 28);
  doc.text(`Total Revenue: $${annualRevenue.toLocaleString()}`, 14, 36);
  doc.text(`Total Expenses: $${annualExpenses.toLocaleString()}`, 14, 44);
  doc.text(
    `Net Income: $${(annualRevenue - annualExpenses).toLocaleString()}`,
    14,
    52
  );
  doc.save(`Yearly_report_${year}.pdf`);
}

// --- DAILY REPORT ---
async function generateDailyReportPDF(trips, dateLabel = "Today's Report") {
  const doc = new jsPDF();
  doc.text(`${dateLabel} - Grouped by Truck`, 14, 14);

  // Group trips by truck
  const trucksMap = {};
  trips.forEach((trip) => {
    const truckKey =
      trip.truckId?.plateNumber || trip.truckId || "Unknown Truck";
    if (!trucksMap[truckKey]) trucksMap[truckKey] = [];
    trucksMap[truckKey].push(trip);
  });

  let y = 24;
  let truckCount = 0;
  for (const [truck, truckTrips] of Object.entries(trucksMap)) {
    if (truckCount > 0) doc.addPage();
    doc.text(`Truck: ${truck}`, 14, y);
    y += 6;
    if (truckTrips.length === 0) {
      doc.text("No trips for this truck.", 14, y);
      y += 10;
      continue;
    }
    truckTrips.forEach((trip, idx) => {
      doc.text(`Trip #${idx + 1}`, 14, y);
      y += 6;
      autoTable(doc, {
        head: [
          [
            "Product",
            "Origin",
            "Destination",
            "Transport",
            "Status",
            "Created By",
            "Created At",
            "End Time",
          ],
        ],
        body: [
          [
            trip.product || "-",
            trip.route?.origin || "-",
            trip.route?.destination || "-",
            trip.transport || 0,
            trip.status,
            trip.createdBy?.name || "-",
            trip.createdAt ? new Date(trip.createdAt).toLocaleString() : "-",
            trip.endTime ? new Date(trip.endTime).toLocaleString() : "-",
          ],
        ],
        startY: y,
        margin: { left: 14, right: 14 },
        theme: "grid",
        styles: { fontSize: 9 },
      });
      y = doc.lastAutoTable.finalY + 2;
      // Expenses for this trip
      if (trip.expenses && trip.expenses.length > 0) {
        doc.text("Expenses:", 18, y);
        y += 4;
        autoTable(doc, {
          head: [
            ["Reason", "Amount", "Payment", "Rate", "Added By", "Created At"],
          ],
          body: trip.expenses.map((exp) => [
            exp.reason || "-",
            exp.amount || 0,
            exp.Payment || 0,
            exp.rate || 0,
            exp.addedBy?.name || "-",
            exp.createdAt ? new Date(exp.createdAt).toLocaleString() : "-",
          ]),
          startY: y,
          margin: { left: 18, right: 14 },
          theme: "striped",
          styles: { fontSize: 8 },
        });
        y = doc.lastAutoTable.finalY + 4;
      } else {
        doc.text("No expenses for this trip.", 18, y);
        y += 6;
      }
    });
    truckCount++;
  }

  doc.save(`${dateLabel.replace(/\s+/g, "_")}_daily_report.pdf`);
}

export {
  generateMonthlyReportPDF,
  generateYearlyReportPDF,
  generateDailyReportPDF,
};
