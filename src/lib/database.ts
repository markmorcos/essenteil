import { query } from "./db";
import { Listing } from "./types";

// Listing operations
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
  return result.rows[0];
};

export const getActiveListings = async (
  limit = 50,
  offset = 0
): Promise<Listing[]> => {
  const result = await query(
    `SELECT * FROM listings 
     WHERE active = true AND expires_at > CURRENT_TIMESTAMP 
     ORDER BY created_at DESC 
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return result.rows;
};

export const getListingsByUser = async (userId: string): Promise<Listing[]> => {
  const result = await query(
    "SELECT * FROM listings WHERE user_id = $1 ORDER BY created_at DESC",
    [userId]
  );
  return result.rows;
};
