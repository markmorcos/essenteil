import { query } from "./db";
import { Listing, ListingsOptions } from "./types";
import { getRedisClient, REDIS_KEYS } from "./redis";

export const createListing = async (
  listingData: Partial<Listing>
): Promise<Listing> => {
  const result = await query(
    `INSERT INTO listings (title, user_id, description, categories, location, image_url, contact, expires_at) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
     RETURNING *`,
    [
      listingData.title,
      listingData.user_id,
      listingData.description,
      listingData.categories,
      JSON.stringify(listingData.location),
      listingData.image_url,
      JSON.stringify(listingData.contact),
      listingData.expires_at,
    ]
  );

  const listing = result.rows[0];

  if (listing?.location?.lng && listing?.location?.lat) {
    try {
      const redis = await getRedisClient();
      await redis.geoAdd(REDIS_KEYS.LISTINGS_GEO, {
        longitude: listing.location.lng,
        latitude: listing.location.lat,
        member: listing.id,
      });
    } catch (error) {
      console.error("Failed to store geo data in Redis:", error);
    }
  }

  return listing;
};

export const getListings = async (
  options: ListingsOptions = {}
): Promise<Listing[]> => {
  const { user_id, lat, lng, radius, limit = 50, offset = 0 } = options;

  let filteredIds: string[] | null = null;

  if (lat && lng && radius) {
    try {
      const redis = await getRedisClient();
      const results = await redis.geoRadius(
        REDIS_KEYS.LISTINGS_GEO,
        { longitude: lng, latitude: lat },
        radius,
        "km"
      );
      filteredIds = results.map((result) => String(result));
    } catch (error) {
      console.error("Failed to query Redis for geo data:", error);
    }
  }

  let sqlQuery = `
    SELECT * FROM listings 
    WHERE active = true AND expires_at > CURRENT_TIMESTAMP
  `;
  const queryParams: (string | number | string[])[] = [];
  let paramCount = 0;

  if (user_id) {
    paramCount++;
    sqlQuery += ` AND user_id = $${paramCount}`;
    queryParams.push(user_id);
  }

  if (filteredIds !== null) {
    if (filteredIds.length === 0) {
      return [];
    }
    paramCount++;
    sqlQuery += ` AND id = ANY($${paramCount})`;
    queryParams.push(filteredIds);
  }

  sqlQuery += ` ORDER BY created_at DESC`;

  paramCount++;
  sqlQuery += ` LIMIT $${paramCount}`;
  queryParams.push(limit);

  paramCount++;
  sqlQuery += ` OFFSET $${paramCount}`;
  queryParams.push(offset);

  const result = await query(sqlQuery, queryParams);

  return result.rows;
};
