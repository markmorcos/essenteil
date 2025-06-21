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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🍽️ EssenTeil</h1>
              <p className="text-gray-600 text-sm">
                Share food, reduce waste, build community
              </p>
            </div>

            <div className="flex items-center space-x-3">
              {user ? (
                <>
                  <Link href="/listings/new">
                    <button className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2">
                      <span>➕</span>
                      <span>Share Food</span>
                    </button>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors duration-200"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link href="/login">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200">
                    Sign In
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="py-8">
        <Listings listings={listings} />
      </main>
    </div>
  );
}
