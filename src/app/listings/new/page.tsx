"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Contact, Location } from "@/lib/types";

// Simple Google Maps type declarations
declare global {
  interface Window {
    google?: {
      maps: {
        places: {
          Autocomplete: new (input: HTMLInputElement, options?: object) => {
            addListener: (event: string, callback: () => void) => void;
            getPlace: () => {
              formatted_address?: string;
              geometry?: {
                location: {
                  lat: () => number;
                  lng: () => number;
                };
              };
            };
          };
        };
      };
    };
  }
}

const CATEGORIES = [
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
];

const SHELF_LIFE_OPTIONS = [
  { label: "1 Day", value: 1 },
  { label: "1 Week", value: 7 },
  { label: "1 Month", value: 30 },
  { label: "3 Months", value: 90 },
  { label: "6 Months", value: 180 },
  { label: "1 Year", value: 365 },
  { label: "5 Years", value: 1825 },
];

interface FormData {
  title: string;
  description: string;
  categories: string[];
  location: Location;
  contact: Contact;
  image_file: FileList | null;
  shelf_life_days: number;
}

export default function NewListingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const addressInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<{
    addListener: (event: string, callback: () => void) => void;
    getPlace: () => {
      formatted_address?: string;
      geometry?: {
        location: {
          lat: () => number;
          lng: () => number;
        };
      };
    };
  } | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      title: "",
      description: "",
      categories: [],
      location: {
        address: "",
        lat: 0,
        lng: 0,
        type: "city",
      },
      contact: {
        method: "whatsapp",
        value: "",
      },
      image_file: null,
      shelf_life_days: 30,
    },
  });

  const watchedCategories = watch("categories");

  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google) {
        initializeAutocomplete();
        return;
      }

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initializeAutocomplete;
      document.head.appendChild(script);
    };

    const initializeAutocomplete = () => {
      if (addressInputRef.current && window.google) {
        autocompleteRef.current = new window.google.maps.places.Autocomplete(
          addressInputRef.current,
          {
            types: ["address"],
            componentRestrictions: { country: "de" },
          }
        );

        autocompleteRef.current.addListener("place_changed", () => {
          const place = autocompleteRef.current?.getPlace();
          if (place && place.geometry && place.geometry.location) {
            setValue("location", {
              address: place.formatted_address || "",
              lat: place.geometry!.location.lat(),
              lng: place.geometry!.location.lng(),
              type: "exact" as const,
            });
          }
        });
      }
    };

    loadGoogleMaps();
  }, [setValue]);

  const uploadImage = async (file: File): Promise<string> => {
    const timestamp = Date.now();
    const fileName = `listings/${user?.uid}/${timestamp}_${file.name}`;
    const imageRef = ref(storage, fileName);

    try {
      const snapshot = await uploadBytes(imageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw new Error("Failed to upload image");
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!user) {
      alert("Please log in to create a listing");
      return;
    }

    try {
      // Calculate expiry date based on shelf life
      const expiresAt = new Date(
        Date.now() + data.shelf_life_days * 24 * 60 * 60 * 1000
      );

      // Handle image upload if present
      let image_url = "";
      if (data.image_file && data.image_file.length > 0) {
        image_url = await uploadImage(data.image_file[0]);
      }

      const response = await fetch("/api/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          categories: data.categories,
          location: data.location,
          contact: data.contact,
          image_url,
          user_id: user.uid,
          expires_at: expiresAt,
        }),
      });

      if (response.ok) {
        router.push("/");
      } else {
        throw new Error("Failed to create listing");
      }
    } catch (error) {
      console.error("Error creating listing:", error);
      alert("Failed to create listing. Please try again.");
    }
  };

  const handleCategoryToggle = (category: string) => {
    const currentCategories = watchedCategories;
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter((c) => c !== category)
      : [...currentCategories, category];
    setValue("categories", newCategories);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Share Food Items
            </h1>
            <p className="text-gray-600">
              List food items you want to share with your community
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Title *
              </label>
              <input
                type="text"
                id="title"
                {...register("title", { required: "Title is required" })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
                placeholder="Enter a descriptive food title..."
              />
              {errors.title && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                {...register("description")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
                placeholder="Describe the food item, ingredients, condition, etc..."
              />
            </div>

            {/* Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categories *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CATEGORIES.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => handleCategoryToggle(category)}
                    className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                      watchedCategories.includes(category)
                        ? "bg-blue-100 border-blue-500 text-blue-700"
                        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
              {watchedCategories.length === 0 && (
                <p className="text-sm text-red-600 mt-1">
                  Please select at least one category
                </p>
              )}
            </div>

            {/* Location with Google Autocomplete */}
            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Location *
              </label>
              <Controller
                name="location.address"
                control={control}
                rules={{ required: "Location is required" }}
                render={({ field }) => (
                  <input
                    {...field}
                    ref={(e) => {
                      field.ref(e);
                      addressInputRef.current = e;
                    }}
                    type="text"
                    id="address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
                    placeholder="Start typing your address..."
                  />
                )}
              />
              {errors.location?.address && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.location.address.message}
                </p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                Google Places autocomplete will be enabled with a valid API key
              </p>
            </div>

            {/* Contact Information */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Information *
              </label>
              <div className="space-y-3">
                <div>
                  <Controller
                    name="contact.method"
                    control={control}
                    rules={{ required: "Contact method is required" }}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      >
                        <option value="whatsapp">WhatsApp</option>
                        <option value="phone">Phone</option>
                        <option value="email">Email</option>
                      </select>
                    )}
                  />
                </div>
                <div>
                  <Controller
                    name="contact.value"
                    control={control}
                    rules={{ required: "Contact information is required" }}
                    render={({ field }) => {
                      const contactMethod = watch("contact.method");
                      return (
                        <input
                          {...field}
                          type={contactMethod === "email" ? "email" : "tel"}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
                          placeholder={
                            contactMethod === "email"
                              ? "your@email.com"
                              : contactMethod === "whatsapp"
                              ? "+1234567890"
                              : "Phone number"
                          }
                        />
                      );
                    }}
                  />
                  {errors.contact?.value && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.contact.value.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Image Picker */}
            <div>
              <label
                htmlFor="image"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Image (optional)
              </label>
              <div className="space-y-2">
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  {...register("image_file")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {watch("image_file") && watch("image_file")![0] && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>Selected: {watch("image_file")![0].name}</span>
                    <button
                      type="button"
                      onClick={() => setValue("image_file", null)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Shelf Life */}
            <div>
              <label
                htmlFor="shelf_life"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Shelf Life
              </label>
              <select
                id="shelf_life"
                {...register("shelf_life_days")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              >
                {SHELF_LIFE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-1">
                How long is this item good for?
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || watchedCategories.length === 0}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? "Sharing..." : "Share Food Item"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
