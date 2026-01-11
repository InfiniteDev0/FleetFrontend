"use client";
import React from "react";

const Users = React.lazy(() => import("../components/Users"));
export default function Page() {
  return (
    <div>
      <Users />
    </div>
  );
}