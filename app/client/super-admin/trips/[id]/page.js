"use client";

import React from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";

const TripPage = dynamic(() => import("./tripid"), {
  loading: () => (
    <div className="flex items-center justify-center h-full min-h-[300px]">
      <div className="loader mx-auto"></div>
    </div>
  ),
  ssr: false,
});

const page = () => {
  const params = useParams();
  const tripId = params?.id;

  return (
    <div>
      <TripPage tripId={tripId} />
    </div>
  );
};

export default page;
