import { NextResponse } from "next/server";

import { createListing, getActiveListings } from "@/lib/database";
import { Listing } from "@/lib/types";

export async function GET() {
  const listings = await getActiveListings();

  return NextResponse.json({ listings });
}

export async function POST(request: Request) {
  const data: Partial<Listing> = await request.json();

  const listing = await createListing(data);

  return NextResponse.json({ listing });
}
