"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconFilter, IconPlus } from "@tabler/icons-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { useSuperAdmin } from "../context/SuperAdminContext";
import { toast } from "sonner";
import dynamic from "next/dynamic";
const DriverDataTable = dynamic(
  () =>
    import("@/components/ui/driver-datatable").then(
      (mod) => mod.DriverDataTable
    ),
  { ssr: false }
);

const DriversPage = () => {
  const {
    drivers: driversRaw,
    driversError,
    fetchDrivers,
    createDriver,
    form,
    setForm,
    canCreate,
    loading,
  } = useSuperAdmin();
  const drivers = Array.isArray(driversRaw) ? driversRaw : [];

  const [search, setSearch] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  const handleCreateDriver = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    const result = await createDriver();
    setCreateLoading(false);
    if (result?.success) {
      toast.success(result.message);
      setSheetOpen(false);
      fetchDrivers();
    } else {
      toast.error(result?.message || "Failed to create driver");
    }
  };

  const displayedDrivers = React.useMemo(() => {
    return drivers.filter((d) => {
      const searchLower = search.toLowerCase();
      return (
        d.name?.toLowerCase().includes(searchLower) ||
        d.phone?.toLowerCase().includes(searchLower) ||
        d.licenseNumber?.toLowerCase().includes(searchLower)
      );
    });
  }, [drivers, search]);

  return (
    <div className="py-6! flex flex-col gap-5 px-4!">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6!">
        <div>
          <h2 className="text-xl font-semibold">Drivers Management Page</h2>
          <p className="text-sm text-muted-foreground">
            Manage and monitor all Drivers.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4">
          <Input
            placeholder="Search by name, email, or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-62.5 p-2!"
          />

          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="default"
                className="flex items-center gap-2 p-2!"
                disabled={false}
                title={"Add User"}
              >
                <IconPlus className="size-4" />
                Add Driver
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Add Driver</SheetTitle>
                <SheetDescription>
                  Fill in the details to create a new user. Role options depend
                  on your permissions.
                </SheetDescription>
              </SheetHeader>

              <form onSubmit={handleCreateDriver} className="grid gap-6 ">
                <div className="grid gap-2 p-0!">
                  <Label htmlFor="driver-name">Name</Label>
                  <Input
                    id="driver-name"
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    placeholder="Full name"
                    required
                  />
                </div>
                <div className="grid gap-2 p-0!">
                  <Label htmlFor="driver-phone">Phone</Label>
                  <Input
                    id="driver-phone"
                    value={form.phone || ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, phone: e.target.value }))
                    }
                    placeholder="e.g. 0712345678"
                    required
                  />
                </div>
                <div className="grid gap-2 p-0!">
                  <Label htmlFor="driver-license">License Number</Label>
                  <Input
                    id="driver-license"
                    value={form.licenseNumber || ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, licenseNumber: e.target.value }))
                    }
                    placeholder="e.g. DL123456"
                    required
                  />
                </div>
                <div className="grid gap-2 p-0!">
                  <Label htmlFor="driver-status">Status</Label>
                  <Select
                    value={form.status || "available"}
                    onValueChange={(val) =>
                      setForm((f) => ({ ...f, status: val }))
                    }
                  >
                    <SelectTrigger id="driver-status" className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="assigned">Assigned</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {driversError && (
                  <div className="text-red-600 text-sm">{driversError}</div>
                )}
                <SheetFooter className="mt-2!">
                  <Button type="submit" disabled={!canCreate || createLoading}>
                    {createLoading ? "Creating..." : "Create Driver"}
                  </Button>
                  <SheetClose asChild>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </SheetClose>
                </SheetFooter>
              </form>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="flex flex-col !px-2 gap-4">
        {loading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="loader"></div>
            <span className="text-muted-foreground !mt-20 text-sm">
              Loading drivers...
            </span>
          </div>
        ) : (
          <DriverDataTable data={displayedDrivers} fetchUsers={fetchDrivers} />
        )}
      </div>
    </div>
  );
};

export default DriversPage;
