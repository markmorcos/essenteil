"use client";

import React from "react";
import Image from "next/image";
import { formatDistanceToNow, isPast, isToday, isTomorrow } from "date-fns";

import { Listing } from "@/lib/types";

type ListingsProps = {
  listings: Listing[];
};

const formatTimeAgo = (date: Date) => {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

const formatExpiresIn = (date: Date) => {
  const expiryDate = new Date(date);

  if (isPast(expiryDate)) return "Expired";
  if (isToday(expiryDate)) return "Expires today";
  if (isTomorrow(expiryDate)) return "Expires tomorrow";

  return `Expires ${formatDistanceToNow(expiryDate, { addSuffix: true })}`;
};

const getContactIcon = (method: string) => {
  switch (method) {
    case "whatsapp":
      return "💬";
    case "phone":
      return "📞";
    case "email":
      return "✉️";
    default:
      return "📞";
  }
};

const getCategoryIcon = (category: string) => {
  const icons: { [key: string]: string } = {
    "Fresh Produce": "🥬",
    "Dairy & Eggs": "🥛",
    "Meat & Seafood": "🥩",
    Bakery: "🍞",
    "Pantry Staples": "🏺",
    Beverages: "🥤",
    Snacks: "🍿",
    "Frozen Foods": "🧊",
    "Condiments & Sauces": "🍯",
    "Spices & Herbs": "🌿",
    "Prepared Meals": "🍱",
    Other: "🍽️",
  };
  return icons[category] || "🍽️";
};

export const Listings: React.FC<ListingsProps> = ({ listings }) => {
  if (listings.length === 0) {
    return (
      <div className="max-w-4xl mx-auto mt-12 text-center">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12">
          <div className="text-6xl mb-6">🍽️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No food items shared yet
          </h3>
          <p className="text-gray-500 mb-6">
            Be the first to share food with your community!
          </p>
          <div className="text-sm text-gray-400">
            Items shared here help reduce food waste and bring neighbors
            together
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-8 px-4">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Available Food Items
        </h2>
        <p className="text-gray-600">
          {listings.length} item{listings.length !== 1 ? "s" : ""} shared by
          your community
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing) => (
          <div
            key={listing.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
          >
            {/* Image Section */}
            <div className="relative h-48 bg-gradient-to-br from-green-50 to-blue-50">
              {listing.image_url ? (
                <Image
                  src={listing.image_url}
                  alt={listing.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-6xl opacity-60">
                    {getCategoryIcon(listing.categories[0])}
                  </div>
                </div>
              )}

              {/* Expiry Badge */}
              <div className="absolute top-3 right-3">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    new Date(listing.expires_at) <= new Date()
                      ? "bg-red-100 text-red-700"
                      : new Date(listing.expires_at) <=
                        new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {formatExpiresIn(listing.expires_at)}
                </span>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-6">
              {/* Categories */}
              <div className="flex flex-wrap gap-1 mb-3">
                {listing.categories.slice(0, 2).map((category) => (
                  <span
                    key={category}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                  >
                    <span>{getCategoryIcon(category)}</span>
                    {category}
                  </span>
                ))}
                {listing.categories.length > 2 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-md">
                    +{listing.categories.length - 2} more
                  </span>
                )}
              </div>

              {/* Title */}
              <h3
                className="text-lg font-semibold text-gray-900 mb-2 overflow-hidden"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical" as const,
                  lineHeight: "1.5rem",
                  maxHeight: "3rem",
                }}
              >
                {listing.title}
              </h3>

              {/* Description */}
              {listing.description && (
                <p
                  className="text-gray-600 text-sm mb-4 overflow-hidden"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical" as const,
                    lineHeight: "1.25rem",
                    maxHeight: "3.75rem",
                  }}
                >
                  {listing.description}
                </p>
              )}

              {/* Location */}
              <div className="flex items-center text-gray-500 text-sm mb-4">
                <span className="mr-1">📍</span>
                {listing.location.address ? (
                  <button
                    onClick={() => {
                      window.open(
                        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          listing.location.address!
                        )}`,
                        "_blank"
                      );
                    }}
                    className="text-left truncate hover:text-blue-600 hover:underline transition-colors duration-200 cursor-pointer"
                    title="Click to open in Google Maps"
                  >
                    {listing.location.address}
                  </button>
                ) : (
                  <span className="truncate">Location not specified</span>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                {/* Contact */}
                <div className="flex items-center space-x-2">
                  <span className="text-lg">
                    {getContactIcon(listing.contact.method)}
                  </span>
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {listing.contact.method}
                  </span>
                </div>

                {/* Time */}
                <span className="text-xs text-gray-400">
                  {formatTimeAgo(listing.created_at)}
                </span>
              </div>

              {/* Contact Button */}
              <button
                onClick={() => {
                  if (listing.contact.method === "whatsapp") {
                    window.open(
                      `https://wa.me/${listing.contact.value.replace(
                        /\D/g,
                        ""
                      )}`,
                      "_blank"
                    );
                  } else if (listing.contact.method === "phone") {
                    window.open(`tel:${listing.contact.value}`, "_blank");
                  } else if (listing.contact.method === "email") {
                    window.open(`mailto:${listing.contact.value}`, "_blank");
                  }
                }}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
              >
                Contact via{" "}
                {listing.contact.method === "whatsapp"
                  ? "WhatsApp"
                  : listing.contact.method}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button - Future Enhancement */}
      {listings.length >= 6 && (
        <div className="text-center mt-8">
          <button className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors duration-200">
            Load More Items
          </button>
        </div>
      )}
    </div>
  );
};
