"use client";
import React from "react";

const Trucks = React.lazy(() => import("../../super-admin/components/Trucks"));
export default function Page() {
  return (
    <div>
      <Trucks />
    </div>
  );
}
