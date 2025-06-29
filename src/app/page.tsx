"use client";

import { useState } from "react";
import { Listings } from "@/components/Listings";
import { Search } from "@/components/Search";
import { useListings } from "@/hooks/useListings";
import { Category } from "@/lib/constants";

export default function Home() {
  const [searchParams, setSearchParams] = useState<{
    lat?: number;
    lng?: number;
    radius?: number;
    categories?: Category[];
  }>({});

  const { listings, loading, error } = useListings(searchParams);

  const handleSearchChange = (params: {
    lat?: number;
    lng?: number;
    radius?: number;
    categories?: Category[];
  }) => {
    setSearchParams(params);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="mt-4 text-gray-600">Error fetching listings</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Search onSearchChange={handleSearchChange} />
        <Listings listings={listings} />
      </div>
    </div>
  );
}
