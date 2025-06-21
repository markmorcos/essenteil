"use client";

import { useEffect, useState } from "react";

import { Listing } from "@/lib/types";
import { Listings } from "@/components/Listings";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const { loading } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);

  const fetchListings = async () => {
    try {
      const response = await fetch("/api/listings");
      const data = await response.json();
      setListings(data.listings);
    } catch (error) {
      console.error("Error fetching listings:", error);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

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

  return <Listings listings={listings} />;
}
