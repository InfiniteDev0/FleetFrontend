"use client";

import React from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";

const Truckpage = dynamic(() => import("./truckid"), {
  loading: () => (
    <div className="flex items-center justify-center h-full min-h-[300px]">
      <div className="loader mx-auto"></div>
    </div>
  ),
  ssr: false,
});

const IdTruckpage = () => {
  const params = useParams();
  const truckId = params?.id;

  return (
    <div>
      <Truckpage truckId={truckId} />
    </div>
  );
};

export default IdTruckpage;
