import React from "react";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

import {
  IconAlertTriangle,
  IconCircleCheckFilled,
  IconLoader,
  IconQuestionMark,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
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
import { toast } from "sonner";

export function StatusBadge({ status }) {
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

export function DeleteTripDialog({ refNumber, tripId, onSuccess }) {
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
      if (fetchTrips) await fetchTrips();
      toast.success(`Trip '${refNumber}' deleted successfully`);
      if (onSuccess) onSuccess();
    } catch (e) {
      const errorMsg =
        e &&
        typeof e === "object" &&
        "message" in e &&
        typeof e.message === "string"
          ? e.message
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

// Props: trips, trucks, onDeleteTrip (setDeleteDialogTripId), deleteDialogTripId, setDeleteDialogTripId
const TripsListCards = ({
  trips = [],
  trucks = [],
  deleteDialogTripId,
  setDeleteDialogTripId,
}) => {
  return (
    <div className="flex flex-col gap-4">
      {trips.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          No trips found.
        </div>
      ) : (
        trips.map((trip) => {
          const truck = trucks.find(
            (t) => String(t.id ?? t._id) === String(trip.truckId)
          );
          const start = trip.startTime ? new Date(trip.startTime) : null;
          const end = trip.endTime ? new Date(trip.endTime) : null;
          const tripId = String(trip.id ?? trip._id ?? "");
          return (
            <Card
              key={tripId}
              className="w-full flex flex-row items-stretch justify-between !py- !px-3 gap-2"
            >
              {/* Left: SVG + route info */}
              <div className="flex flex-col justify-between flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {/* SVG route icon vertical */}
                  <div className="flex flex-col items-center justify-center !pr-2">
                    <svg
                      width="12"
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
                  {/* Route info */}
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-base truncate">
                        {trip.route?.origin || "-"}
                      </span>
                      <span className="text-xs text-muted-foreground !ml-2 truncate">
                        {start
                          ? `${start.toLocaleDateString()} ${start.toLocaleTimeString(
                              [],
                              { hour: "2-digit", minute: "2-digit" }
                            )}`
                          : "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 !mt-8">
                      <span className="font-semibold text-base truncate">
                        {trip.route?.destination || "-"}
                      </span>
                      <span className="text-xs text-muted-foreground !ml-2 truncate">
                        {end
                          ? `${end.toLocaleDateString()} ${end.toLocaleTimeString(
                              [],
                              { hour: "2-digit", minute: "2-digit" }
                            )}`
                          : trip.arrivalTime || "-"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Right: status badge (top), actions (bottom) */}
              <div className="flex flex-col justify-between items-end min-w-17.5 pl-2">
                {/* Status badge (from trips-data-table) */}
                <StatusBadge status={trip.status} />
                {/* Actions: view, delete, complete (if not completed) */}
                <div className="flex flex-row gap-2 mt-auto">
                  {/* View button */}
                  <Link
                    href={`/client/super-admin/trips/${encodeURIComponent(
                      tripId
                    )}?id=${encodeURIComponent(tripId)}`}
                    passHref
                  >
                    <Button size="icon" variant="ghost" title="View Trip">
                      <span className="sr-only">View</span>
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
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </Button>
                  </Link>
                  {/* Delete button with dialog */}
                  <Button
                    size="icon"
                    variant="ghost"
                    title="Delete Trip"
                    onClick={() => setDeleteDialogTripId(tripId)}
                  >
                    <span className="sr-only">Delete</span>
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
            </Card>
          );
        })
      )}
      {/* Single delete dialog rendered once, using selected trip id */}
      <Dialog
        open={!!deleteDialogTripId}
        onOpenChange={(open) => !open && setDeleteDialogTripId(null)}
      >
        <DialogContent>
          {deleteDialogTripId && (
            <DeleteTripDialog
              refNumber={deleteDialogTripId}
              tripId={deleteDialogTripId}
              onSuccess={() => setDeleteDialogTripId(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TripsListCards;
