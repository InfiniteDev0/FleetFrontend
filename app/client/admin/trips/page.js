"use client";
import React from "react";

const Trips = React.lazy(() => import("../../super-admin/components/Trips"));
export default function page() {
  return (
    <div>
      <Trips />
    </div>
  );
}
