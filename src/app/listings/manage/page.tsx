"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { useAuth } from "@/contexts/AuthContext";
import { Listing } from "@/lib/types";

export default function ManageListings() {
  const { user, loading } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const router = useRouter();

  const fetchMyListings = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/listings?user_id=${user.uid}`);
      const data = await response.json();
      setListings(data.listings || []);
    } catch (error) {
      console.error("Error fetching listings:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      fetchMyListings();
    }
  }, [user, loading, router, fetchMyListings]);

  const handleDeleteListing = async (listingId: string) => {
    if (!user) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this listing? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      setDeletingIds((prev) => new Set(prev).add(listingId));

      const response = await fetch(
        `/api/listings?id=${listingId}&userId=${user.uid}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setListings((prev) =>
          prev.filter((listing) => listing.id !== listingId)
        );
      } else {
        const errorData = await response.json();
        alert(`Failed to delete listing: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error deleting listing:", error);
      alert("Failed to delete listing. Please try again.");
    } finally {
      setDeletingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(listingId);
        return newSet;
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getExpiryStatus = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const hoursUntilExpiry =
      (expiry.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilExpiry < 0) {
      return { status: "expired", text: "Expired", color: "text-red-600" };
    } else if (hoursUntilExpiry < 24) {
      return {
        status: "expiring",
        text: `Expires in ${Math.round(hoursUntilExpiry)} hours`,
        color: "text-orange-600",
      };
    } else {
      const days = Math.round(hoursUntilExpiry / 24);
      return {
        status: "active",
        text: `Expires in ${days} ${days === 1 ? "day" : "days"}`,
        color: "text-green-600",
      };
    }
  };

  if (loading || isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-lg text-gray-600">Loading your listings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {listings.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">
            You haven&apos;t created any listings yet
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {listings.map((listing) => {
            const expiryStatus = getExpiryStatus(listing.expires_at.toString());
            const isDeleting = deletingIds.has(listing.id);

            return (
              <div
                key={listing.id}
                className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {listing.title}
                      </h3>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {listing.categories.map((category) => (
                          <span
                            key={category}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                      <div
                        className={`text-sm font-medium ${expiryStatus.color} mb-2`}
                      >
                        {expiryStatus.text}
                      </div>
                      <p className="text-gray-600 text-sm mb-2">
                        Created: {formatDate(listing.created_at.toString())}
                      </p>
                      {listing.location?.address && (
                        <p className="text-gray-500 text-sm mb-3">
                          📍 {listing.location.address}
                        </p>
                      )}
                      {listing.description && (
                        <p className="text-gray-700 text-sm">
                          {listing.description}
                        </p>
                      )}
                    </div>

                    {listing.image_url && (
                      <div className="ml-4 flex-shrink-0">
                        <Image
                          src={listing.image_url}
                          alt={listing.title}
                          width={120}
                          height={120}
                          className="rounded-lg object-cover"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <div className="text-sm text-gray-500">
                      Contact: {listing.contact.method} -{" "}
                      {listing.contact.value}
                    </div>

                    <button
                      onClick={() => handleDeleteListing(listing.id)}
                      disabled={isDeleting}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isDeleting
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-red-600 text-white hover:bg-red-700"
                      }`}
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
