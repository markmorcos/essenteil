import { NextResponse } from "next/server";

import { createListing, getListings, deleteListing } from "@/lib/database";
import { Listing, ListingsOptions } from "@/lib/types";
import { Category } from "@/lib/constants";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const options: ListingsOptions = {};

  // Parse query parameters
  const user_id = searchParams.get("user_id");
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const radius = searchParams.get("radius");
  const limit = searchParams.get("limit");
  const offset = searchParams.get("offset");
  const categories = searchParams.get("categories");

  if (user_id) options.user_id = user_id;
  if (lat) options.lat = parseFloat(lat);
  if (lng) options.lng = parseFloat(lng);
  if (radius) options.radius = parseFloat(radius);
  if (limit) options.limit = parseInt(limit, 10);
  if (offset) options.offset = parseInt(offset, 10);
  if (categories) options.categories = categories.split(",") as Category[];

  const listings = await getListings(options);

  return NextResponse.json({ listings });
}

export async function POST(request: Request) {
  const data: Partial<Listing> = await request.json();

  const listing = await createListing(data);

  return NextResponse.json({ listing });
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get("id");
    const userId = searchParams.get("userId");

    if (!listingId || !userId) {
      return NextResponse.json(
        { error: "Missing listing ID or user ID" },
        { status: 400 }
      );
    }

    const result = await deleteListing(listingId, userId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: result.message.includes("not found") ? 404 : 403 }
      );
    }

    return NextResponse.json({ message: result.message });
  } catch (error) {
    console.error("Error in DELETE /api/listings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
