"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// Categories for filtering
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

interface SearchProps {
  onSearchChange: (params: {
    lat?: number;
    lng?: number;
    radius?: number;
    categories?: string[];
  }) => void;
}

export function Search({ onSearchChange }: SearchProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [circle, setCircle] = useState<google.maps.Circle | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [isMapVisible, setIsMapVisible] = useState(true);
  const [searchCenter, setSearchCenter] = useState({ lat: 52.52, lng: 13.405 }); // Default: Berlin
  const [radius, setRadius] = useState(5); // Default: 5km
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);

  // Update search center callback
  const updateSearchCenter = useCallback(
    (newCenter: { lat: number; lng: number }) => {
      setSearchCenter(newCenter);

      if (marker) {
        marker.setPosition(newCenter);
      }
      if (circle) {
        circle.setCenter(newCenter);
      }

      // Trigger search update
      onSearchChange({
        lat: newCenter.lat,
        lng: newCenter.lng,
        radius,
        categories:
          selectedCategories.length > 0 ? selectedCategories : undefined,
      });
    },
    [marker, circle, radius, selectedCategories, onSearchChange]
  );

  // Load Google Maps API
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google) {
        setIsGoogleMapsLoaded(true);
        return;
      }

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setIsGoogleMapsLoaded(true);
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  // Initialize map
  useEffect(() => {
    if (isGoogleMapsLoaded && mapRef.current && !map) {
      const newMap = new window.google!.maps.Map(mapRef.current, {
        center: searchCenter,
        zoom: 12,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      // Add click listener to set search center
      newMap.addListener("click", (event: google.maps.MapMouseEvent) => {
        const lat = event.latLng?.lat() || 0;
        const lng = event.latLng?.lng() || 0;
        updateSearchCenter({ lat, lng });
      });

      // Add center change listener for map dragging
      newMap.addListener("center_changed", () => {
        const center = newMap.getCenter();
        if (center) {
          const lat = center.lat();
          const lng = center.lng();
          updateSearchCenter({ lat, lng });
        }
      });

      setMap(newMap);

      // Create circle for radius visualization
      const newCircle = new window.google!.maps.Circle({
        strokeColor: "#3B82F6",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#3B82F6",
        fillOpacity: 0.15,
        map: newMap,
        center: searchCenter,
        radius: radius * 1000, // Convert km to meters
      });
      setCircle(newCircle);

      // Create marker for search center
      const newMarker = new window.google!.maps.Marker({
        position: searchCenter,
        map: newMap,
        title: "Search Center",
        icon: {
          url:
            "data:image/svg+xml;charset=UTF-8," +
            encodeURIComponent(`
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#3B82F6" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          `),
          scaledSize: new window.google!.maps.Size(24, 24),
        },
      });
      setMarker(newMarker);
    }
  }, [isGoogleMapsLoaded, map, searchCenter, radius, updateSearchCenter]);

  // Update radius
  const updateRadius = (newRadius: number) => {
    setRadius(newRadius);
    if (circle) {
      circle.setRadius(newRadius * 1000); // Convert km to meters
    }

    // Trigger search update
    onSearchChange({
      lat: searchCenter.lat,
      lng: searchCenter.lng,
      radius: newRadius,
      categories:
        selectedCategories.length > 0 ? selectedCategories : undefined,
    });
  };

  // Get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newCenter = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          updateSearchCenter(newCenter);
          if (map) {
            map.setCenter(newCenter);
            map.setZoom(14);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          alert(
            "Unable to get your current location. Please allow location access or click on the map to set your search area."
          );
        }
      );
    }
  };

  // Toggle category selection
  const toggleCategory = (category: string) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter((c) => c !== category)
      : [...selectedCategories, category];

    setSelectedCategories(newCategories);

    // Trigger search update
    onSearchChange({
      lat: searchCenter.lat,
      lng: searchCenter.lng,
      radius,
      categories: newCategories.length > 0 ? newCategories : undefined,
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedCategories([]);
    onSearchChange({
      lat: undefined,
      lng: undefined,
      radius: undefined,
      categories: undefined,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          🔍 Find Food Near You
        </h2>
        <button
          onClick={() => setIsMapVisible(!isMapVisible)}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
        >
          {isMapVisible ? "Hide Map" : "Show Map"}
        </button>
      </div>

      {/* Map */}
      {isMapVisible && (
        <div className="mb-6">
          <div
            ref={mapRef}
            className="w-full h-64 rounded-lg border border-gray-300"
            style={{ minHeight: "256px" }}
          />
          <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
            <span>
              💡 Click anywhere on the map or drag to set your search area
            </span>
            <button
              onClick={getCurrentLocation}
              className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors"
            >
              📍 Use My Location
            </button>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="space-y-4">
        {/* Radius Slider */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">
              Search Radius
            </label>
            <span className="text-sm text-gray-600">{radius} km</span>
          </div>
          <input
            type="range"
            min="1"
            max="50"
            value={radius}
            onChange={(e) => updateRadius(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>1 km</span>
            <span>50 km</span>
          </div>
        </div>

        {/* Category Filters */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">
              Food Categories
            </label>
            {selectedCategories.length > 0 && (
              <button
                onClick={() => {
                  setSelectedCategories([]);
                  onSearchChange({
                    lat: searchCenter.lat,
                    lng: searchCenter.lng,
                    radius,
                    categories: undefined,
                  });
                }}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Clear All
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => toggleCategory(category)}
                className={`px-3 py-2 text-xs rounded-md border transition-colors ${
                  selectedCategories.includes(category)
                    ? "bg-blue-100 border-blue-500 text-blue-700"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Active Filters Summary */}
        {(searchCenter.lat !== 52.52 ||
          searchCenter.lng !== 13.405 ||
          selectedCategories.length > 0) && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="text-sm text-blue-800">
                <strong>Active Search:</strong>
                {searchCenter.lat !== 52.52 || searchCenter.lng !== 13.405
                  ? ` Within ${radius}km of selected location`
                  : " All locations"}
                {selectedCategories.length > 0 && (
                  <span>
                    {" "}
                    • {selectedCategories.length} categories selected
                  </span>
                )}
              </div>
              <button
                onClick={clearFilters}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                Clear All
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
