"use client";

import { Listings } from "@/components/Listings";
import { useListings } from "@/hooks/useListings";

export default function Home() {
  const { listings, loading, error } = useListings();

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

  return <Listings listings={listings} />;
}
