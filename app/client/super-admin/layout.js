"use client";
import React from "react";
import { SuperAdminProvider } from "./context/SuperAdminContext";

export default function Layout({ children }) {
  return <SuperAdminProvider>{children}</SuperAdminProvider>;
}
