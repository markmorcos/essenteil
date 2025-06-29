import { useState, useEffect, useMemo } from "react";

import { Listing } from "@/lib/types";
import { Category } from "@/lib/constants";

interface SearchParams {
  lat?: number;
  lng?: number;
  radius?: number;
  categories?: Category[];
  limit?: number;
  offset?: number;
}

export function useListings(searchParams?: SearchParams) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const search = useMemo(
    () => ({
      lat: searchParams?.lat,
      lng: searchParams?.lng,
      radius: searchParams?.radius,
      categories: searchParams?.categories || [],
      limit: searchParams?.limit || 50,
      offset: searchParams?.offset || 0,
    }),
    [searchParams]
  );

  useEffect(() => {
    async function fetchListings() {
      setLoading(!loaded);
      setError(null);
      try {
        const query = new URLSearchParams();

        if (search?.lat) query.append("lat", search.lat.toString());
        if (search?.lng) query.append("lng", search.lng.toString());
        if (search?.radius) query.append("radius", search.radius.toString());
        if (search?.categories && search.categories.length > 0) {
          query.append("categories", search.categories.join(","));
        }
        if (search?.limit) query.append("limit", search.limit.toString());
        if (search?.offset) query.append("offset", search.offset.toString());

        const url = `/api/listings${
          query.toString() ? `?${query.toString()}` : ""
        }`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Failed to fetch listings");
        }
        const data = await response.json();
        setListings(data.listings);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
        setLoaded(true);
      }
    }

    fetchListings();
  }, [search, loaded]);

  return { listings, loading, error };
}
