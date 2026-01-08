import React from "react";
import { toast } from "sonner";
import { useSuperAdmin } from "@/app/client/super-admin/context/SuperAdminContext";
import {
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

export function DeleteTruckDialog({
  plateNumber,
  truckId,
  fetchTrucks,
  onSuccess,
}) {
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
          ? e.message
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
