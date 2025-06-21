import React from "react";

import { Listing } from "../../lib/types";

type ListingsProps = {
  listings: Listing[];
};

export const Listings: React.FC<ListingsProps> = ({ listings }) => {
  if (listings.length === 0) {
    return <div>No listings available.</div>;
  }

  return (
    <ul>
      {listings.map((listing) => (
        <li key={listing.id}>
          <h3>{listing.title}</h3>
          <p>{listing.description}</p>
        </li>
      ))}
    </ul>
  );
};
