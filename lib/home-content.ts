export const HOME_IMAGES = {
  hero: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2400&q=80",
  uttara: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=900&q=80",
  gulshan: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80",
  dhanmondi: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80",
  bashundhara: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80",
  mirpur: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=80",
  banani: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=900&q=80",
  fallback:
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80",
};

export const POPULAR_LOCATIONS = [
  { name: "Uttara", count: 128, image: HOME_IMAGES.uttara },
  { name: "Gulshan", count: 96, image: HOME_IMAGES.gulshan },
  { name: "Dhanmondi", count: 84, image: HOME_IMAGES.dhanmondi },
  { name: "Bashundhara", count: 112, image: HOME_IMAGES.bashundhara },
  { name: "Mirpur", count: 140, image: HOME_IMAGES.mirpur },
  { name: "Banani", count: 72, image: HOME_IMAGES.banani },
];

export const CATEGORIES = [
  { label: "Apartment", type: "apartment" },
  { label: "House", type: "house" },
  { label: "Commercial", type: "commercial" },
  { label: "Office", type: "commercial" },
  { label: "Villa", type: "villa" },
  { label: "Land", type: "land" },
];

export const AGENTS = [
  {
    name: "Nusrat Jahan",
    role: "Senior Agent",
    experience: "8 years",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Rafiul Hasan",
    role: "Luxury Specialist",
    experience: "6 years",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Mehnaz Chowdhury",
    role: "Investment Advisor",
    experience: "10 years",
    rating: 5.0,
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80",
  },
];

export const REVIEWS = [
  {
    name: "Sabbir Ahmed",
    text: "AI Finder suggested three homes in Uttara that actually matched our budget. We booked a visit the same day.",
  },
  {
    name: "Farhana Islam",
    text: "Clean listings, verified agents, and WhatsApp follow-up made the whole process feel premium.",
  },
  {
    name: "Tanvir Rahman",
    text: "PropertyAI feels like Zillow with smarter recommendations. The featured and luxury collections are excellent.",
  },
];

export const BLOG_POSTS = [
  {
    title: "How AI is changing Dhaka property search",
    tag: "AI",
    href: "/blog",
  },
  {
    title: "Uttara vs Bashundhara: where to buy in 2026",
    tag: "Guide",
    href: "/blog",
  },
  {
    title: "5 questions to ask before a site visit",
    tag: "Tips",
    href: "/blog",
  },
];

export function propertyImage(property: { images?: string[] }) {
  const first = property.images?.[0];
  if (first?.startsWith("http") || first?.startsWith("/")) return first;
  return HOME_IMAGES.fallback;
}
