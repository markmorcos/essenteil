import { Category } from "./constants";

export interface Location {
  lng: number;
  lat: number;
  type: "exact" | "city";
  address?: string;
}

export interface Contact {
  method: "whatsapp" | "phone" | "email";
  value: string;
}

export interface Listing {
  id: string;
  user_id: string;
  title: string;
  categories: Category[];
  location: Location;
  contact: Contact;
  description?: string;
  image_url?: string;
  active: boolean;
  expires_at: Date;
  created_at: Date;
  updated_at: Date;
}

export interface ListingsOptions {
  user_id?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  limit?: number;
  offset?: number;
  categories?: Category[];
}
