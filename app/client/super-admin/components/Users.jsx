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

const UsersDataTable = dynamic(
  () => import("@/components/user-datatable").then((mod) => mod.UsersDataTable),
  { ssr: false }
);

const Users = () => {
  const {
    usersError,
    form,
    setForm,
    allowedRoles,
    canCreate,
    filteredUsers,
    // users,
    loading,
    currentUser,
    createUser,
    fetchUsers,
  } = useSuperAdmin();

  const [roleFilter, setRoleFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    const result = await createUser();
    setCreateLoading(false);
    if (result?.success) {
      toast.success(result.message);
      setSheetOpen(false);
    } else {
      toast.error(result?.message || "Failed to create user");
    }
  };

  const displayedUsers = React.useMemo(() => {
    return filteredUsers.filter((u) => {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        u.name?.toLowerCase().includes(searchLower) ||
        u.email?.toLowerCase().includes(searchLower) ||
        u.role?.toLowerCase().includes(searchLower);
      const matchesRole = roleFilter === "all" ? true : u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [filteredUsers, search, roleFilter]);

  return (
    <div className="py-6! flex flex-col gap-5 px-4!">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6!">
        <div>
          <h2 className="text-xl font-semibold">Users Management Page</h2>
          <p className="text-sm text-muted-foreground">
            Manage and monitor all users.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4">
          <Input
            placeholder="Search by name, email, or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-[350px] p-2!"
          />

          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-40 p-2!">
              <IconFilter className="mr-2! size-4 text-muted-foreground" />
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="super_admin">Super Admin</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="operator">Operator</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="default"
            className="flex items-center gap-2 p-2!"
            disabled={false}
            title={"Add User"}
          >
            <IconPlus className="size-4" />
            Add User
          </Button>
          
        </div>
      </div>

      <div className="flex flex-col !px-2 gap-4">
        {loading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="loader "></div>
            <span className="text-muted-foreground !mt-20 text-sm">
              Loading users...
            </span>
          </div>
        ) : (
          <UsersDataTable data={displayedUsers} fetchUsers={fetchUsers} />
        )}
      </div>
    </div>
  );
};

export default Users;
