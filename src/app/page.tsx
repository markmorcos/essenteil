"use client";

import Link from "next/link";

import { useAuth } from "@/contexts/AuthContext";
import { Listings } from "@/components/Listings";
import { Listing } from "@/lib/types";
import { useEffect, useState } from "react";

export default function Home() {
  const { user, loading, signOut } = useAuth();
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

  const handleSignOut = async () => {
    try {
      await signOut();
      console.log("Signed out successfully");
    } catch (error) {
      console.error("Error signing out:", error);
    }
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

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-8">
      <div className="max-w-md mx-auto">
        {user ? (
          <>
            <Link href="/listings/new">
              <button className="w-full bg-green-700 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors">
                New Listing
              </button>
            </Link>
            <button
              onClick={handleSignOut}
              className="w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition-colors"
            >
              Sign Out
            </button>
          </>
        ) : (
          <Link href="/login">
            <button className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors">
              Sign in to add a listing
            </button>
          </Link>
        )}
      </div>
      <Listings listings={listings} />
    </div>
  );
}
