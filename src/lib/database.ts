import { query } from "./db";
import { Listing, ListingsOptions } from "./types";
import { getRedisClient, REDIS_KEYS } from "./redis";
import { ref, deleteObject } from "firebase/storage";
import { storage } from "./firebase";

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
  const {
    user_id,
    lat,
    lng,
    radius,
    limit = 50,
    offset = 0,
    categories,
  } = options;

  let filteredIds: string[] | null = null;

  if (lat && lng && radius) {
    try {
      const redis = await getRedisClient();
      filteredIds = await redis.geoRadius(
        REDIS_KEYS.LISTINGS_GEO,
        { longitude: lng, latitude: lat },
        radius,
        "km"
      );
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

  if (categories?.length) {
    paramCount++;
    sqlQuery += ` AND categories && $${paramCount}`;
    queryParams.push(categories);
  }

  if (filteredIds !== null) {
    if (filteredIds.length === 0) return [];
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

export const deleteListing = async (
  listingId: string,
  userId: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const listingResult = await query(
      `SELECT * FROM listings WHERE id = $1 AND user_id = $2`,
      [listingId, userId]
    );

    if (listingResult.rows.length === 0) {
      return { success: false, message: "Listing not found or not authorized" };
    }

    const listing = listingResult.rows[0];

    await query(`DELETE FROM listings WHERE id = $1 AND user_id = $2`, [
      listingId,
      userId,
    ]);

    try {
      const redis = await getRedisClient();
      await redis.zRem(REDIS_KEYS.LISTINGS_GEO, listingId);
    } catch (error) {
      console.error("Failed to remove geo data from Redis:", error);
    }

    if (listing.image_url) {
      try {
        const url = new URL(listing.image_url);
        const fileName = decodeURIComponent(
          url.pathname.split("/").pop() || ""
        );
        if (fileName) {
          const imageRef = ref(storage!, fileName);
          await deleteObject(imageRef);
        }
      } catch (error) {
        console.error("Failed to delete image from storage:", error);
      }
    }

    return { success: true, message: "Listing deleted successfully" };
  } catch (error) {
    console.error("Error deleting listing:", error);
    return { success: false, message: "Failed to delete listing" };
  }
};
