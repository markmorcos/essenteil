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
  categories: string[];
  location: Location;
  contact: Contact;
  description?: string;
  image_url?: string;
  active: boolean;
  expires_at: Date;
  created_at: Date;
  updated_at: Date;
}
