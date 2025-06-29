// Centralized constants for the application

export const CATEGORIES = [
  "Fresh Produce",
  "Dairy & Eggs",
  "Meat & Seafood",
  "Bakery",
  "Pantry Staples",
  "Beverages",
  "Snacks",
  "Frozen Foods",
  "Condiments & Sauces",
  "Spices & Herbs",
  "Prepared Meals",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];
