export interface RetailerSeed {
  slug: string;
  name: string;
  websiteUrl: string;
  color: string;
  hasStores: boolean;
  /** Builds a retailer search URL. Real listings will store product-page URLs. */
  searchUrl: (query: string) => string;
  /** ZIP zones (first digit) with stores; undefined = everywhere */
  zones?: string[];
}

const q = encodeURIComponent;

export const RETAILERS: RetailerSeed[] = [
  { slug: "home-depot", name: "Home Depot", websiteUrl: "https://www.homedepot.com", color: "#f96302", hasStores: true, searchUrl: (s) => `https://www.homedepot.com/s/${q(s)}` },
  { slug: "lowes", name: "Lowe's", websiteUrl: "https://www.lowes.com", color: "#004990", hasStores: true, searchUrl: (s) => `https://www.lowes.com/search?searchTerm=${q(s)}` },
  { slug: "menards", name: "Menards", websiteUrl: "https://www.menards.com", color: "#0b8a3e", hasStores: true, zones: ["4", "5", "6"], searchUrl: (s) => `https://www.menards.com/main/search.html?search=${q(s)}` },
  { slug: "ace-hardware", name: "Ace Hardware", websiteUrl: "https://www.acehardware.com", color: "#d40029", hasStores: true, searchUrl: (s) => `https://www.acehardware.com/search?query=${q(s)}` },
  { slug: "harbor-freight", name: "Harbor Freight", websiteUrl: "https://www.harborfreight.com", color: "#c8102e", hasStores: true, searchUrl: (s) => `https://www.harborfreight.com/search?q=${q(s)}` },
  { slug: "amazon", name: "Amazon", websiteUrl: "https://www.amazon.com", color: "#232f3e", hasStores: false, searchUrl: (s) => `https://www.amazon.com/s?k=${q(s)}` },
];

/** Three metro areas per ZIP zone; every store retailer gets one store in each. */
export const METROS: { city: string; state: string; zip: string }[] = [
  { city: "Boston", state: "MA", zip: "02118" },
  { city: "Hartford", state: "CT", zip: "06103" },
  { city: "Newark", state: "NJ", zip: "07102" },
  { city: "Brooklyn", state: "NY", zip: "11201" },
  { city: "Pittsburgh", state: "PA", zip: "15222" },
  { city: "Philadelphia", state: "PA", zip: "19103" },
  { city: "Washington", state: "DC", zip: "20001" },
  { city: "Richmond", state: "VA", zip: "23219" },
  { city: "Charlotte", state: "NC", zip: "28202" },
  { city: "Atlanta", state: "GA", zip: "30303" },
  { city: "Orlando", state: "FL", zip: "32801" },
  { city: "Nashville", state: "TN", zip: "37203" },
  { city: "Columbus", state: "OH", zip: "43215" },
  { city: "Indianapolis", state: "IN", zip: "46204" },
  { city: "Detroit", state: "MI", zip: "48226" },
  { city: "Des Moines", state: "IA", zip: "50309" },
  { city: "Milwaukee", state: "WI", zip: "53202" },
  { city: "Minneapolis", state: "MN", zip: "55401" },
  { city: "Chicago", state: "IL", zip: "60607" },
  { city: "St. Louis", state: "MO", zip: "63101" },
  { city: "Kansas City", state: "MO", zip: "64106" },
  { city: "Dallas", state: "TX", zip: "75201" },
  { city: "Houston", state: "TX", zip: "77002" },
  { city: "Austin", state: "TX", zip: "78701" },
  { city: "Denver", state: "CO", zip: "80202" },
  { city: "Salt Lake City", state: "UT", zip: "84101" },
  { city: "Phoenix", state: "AZ", zip: "85004" },
  { city: "Los Angeles", state: "CA", zip: "90012" },
  { city: "Portland", state: "OR", zip: "97204" },
  { city: "Seattle", state: "WA", zip: "98101" },
];
