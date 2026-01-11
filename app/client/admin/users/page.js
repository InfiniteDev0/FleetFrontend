"use client";
import React from "react";


const Users = React.lazy(() => import("../../super-admin/components/Users"));
export default function Page() {
  return (
    <div>
      <Users />
    </div>
  );
}
