"use client";

import React from "react";

// Lazy imports (sections only load when needed)
const Dashboard = React.lazy(() => import("./components/Dashboard"));
export default function Page() {
  return (
    <div>
      <Dashboard />
    </div>
  );
}
