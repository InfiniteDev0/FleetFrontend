"use client";

import React from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import TripsListCards from "../../../../../components/trips-listCards";

const TripidPage = dynamic(() => import("./tripid"), {
  loading: () => (
    <div className="flex items-center justify-center h-full min-h-[300px]">
      <div className="loader mx-auto"></div>
    </div>
  ),
  ssr: false,
});

const IdTripPage = () => {
  const params = useParams();
  const tripId = params?.id;

  return (
    <div>
      <TripidPage tripId={tripId} />
      <TripsListCards tripId={tripId} />
    </div>
  );
};

export default IdTripPage;
