import React, { useState, useEffect } from "react";
import TripExpenses from "./TripExpenses";
import { StatusBadge } from "./trips-listCards";
import dynamic from "next/dynamic";

const TripsListCards = dynamic(() => import("./trips-listCards"), {
  loading: () => (
    <div className="flex flex-col items-center gap-2">
      <div className="loader" />
      <span className="text-muted-foreground mt-4 text-sm">
        Loading trips cards...
      </span>
    </div>
  ),
  ssr: false,
});

export const tripidSm = ({
  trip,
  truck,
  creator,
  driverPhone,
  tripId,
  start,
  end,
  expenseTotals = { total: 0, remaining: 0 },
  setExpenseTotals = () => {},
  setTripExpenses = () => {},
  tripExpenses = [],
}) => {
  // Responsive: use a column layout on desktop, stacked on mobile
  // Add ! before all spacing classes
  // Table below: use TripsListCards for mobile
  // (Assume parent passes all props, or add fallback logic as needed)
  return (
    <div className="!p-2 sm:!p-4 flex flex-col gap-4 sm:gap-6">
      <div className="w-full">
        <div className="flex items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-5">
            <img
              src="https://cdn-icons-png.flaticon.com/128/3987/3987997.png"
              alt=""
              className="w-15"
            />
            {/* Left side: Route info in one line */}
            <div className="flex items-center text-2xl font-bold tracking-wider">
              <span>{trip.route?.origin || "-"}</span>

              {/* SVG route arrow */}
              <span className="!mx-2 flex items-center">
                <svg
                  // ↓↓↓ Made the SVG smaller by reducing width/height ↓↓↓
                  width="16" // was 6% → now fixed small px size
                  height="12" // was 100% → now fixed small px size
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

              <span>{trip.route?.destination || "-"}</span>
              <span className="!ml-4 text-sm text-muted-foreground">
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
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 border-b-2 !pb-4">
        {/* Left: Trip Info */}
        <div className="flex-1 flex flex-col gap-4">
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
                  <rect width="4" height="4" x="6" y="6" stroke="#fff" rx="2" />
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
                          { hour: "2-digit", minute: "2-digit" }
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
                          { hour: "2-digit", minute: "2-digit" }
                        )}`
                      : trip.arrivalTime || "-"}
                  </p>
                </div>
              </div>
            </div>
            {/* Right side: Actions */}
            <div className="flex items-center gap-2">
              <StatusBadge status={trip.status} />
            </div>
          </div>
        </div>
        {/* Equipment & Contact Info */}
        <div className="flex flex-col gap-4 sm:flex-row sm:gap-8">
          <div className="flex-1 flex flex-col gap-2 !p-2">
            <h4 className="text-sm underline tracking-wider !mb-1">
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
          <div className="flex-1 flex flex-col gap-2 !p-2">
            <h4 className="text-sm underline tracking-wider !mb-1">
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
                <p className="text-xs text-muted-foreground mb-1">Created By</p>
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
        </div>
      </div>
      {/* Trip Expenses Section */}
      <div className="!p-2 flex flex-col gap-2 border-b-2">
        <h4 className="text-sm underline tracking-wider !mb-1">
          Trip Expenses
        </h4>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground">Start Money</div>
            <div className="text-2xl font-bold">
              ${Number(trip.transport || 0).toLocaleString()}
            </div>
          </div>
        </div>
        {/* Expenses Section */}
        <div className="flex flex-col">
          <h1 className="text-sm  mb-2">Expenses</h1>
          <TripExpenses
            tripId={tripId}
            transportAmount={trip.transport}
            onTotalsChange={setExpenseTotals}
            onExpensesChange={setTripExpenses}
            hideAddExpense={trip.status === "completed"}
          />
        </div>
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
      </div>
      {/* Responsive: Related Trips Table (use TripsListCards for mobile) */}
      <div className="!mt-4">
        <h4 className="text-sm underline tracking-wider !mb-1">
          Related Trips
        </h4>
        <TripsListCards
          trips={[]} // TODO: pass related trips here
          trucks={[]} // TODO: pass trucks here
          deleteDialogTripId={null}
          setDeleteDialogTripId={() => {}}
        />
      </div>
    </div>
  );
};

export default tripidSm;
