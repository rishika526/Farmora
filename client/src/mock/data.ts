export interface Tutorial {
  id: string;
  title: string;
  thumbnail: string;
  category: string;
  duration: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  views: number;
  creator: string;
  tags: string[];
}

export interface Kit {
  id: string;
  name: string;
  image: string;
  price: number;
  rating: number;
  reviews: number;
  description: string;
  isAffiliate: boolean;
  commission: boolean;
}

export const MOCK_TUTORIALS: Tutorial[] = [
  {
    id: "1",
    title: "Mastering Urban Composting: Small Space Solutions",
    thumbnail: "/images/tutorial-garden.png",
    category: "Compost",
    duration: "12:45",
    difficulty: "Beginner",
    views: 1250,
    creator: "EcoGardener Jane",
    tags: ["compost", "urban", "sustainable"],
  },
  {
    id: "2",
    title: "Natural Pest Control: Neem Oil & Garlic Spray",
    thumbnail: "/images/tutorial-pest.png",
    category: "Bio-pesticide",
    duration: "08:20",
    difficulty: "Beginner",
    views: 890,
    creator: "Organic Mike",
    tags: ["pest control", "neem", "garlic"],
  },
  {
    id: "3",
    title: "Soil Health 101: The Soil Food Web",
    thumbnail: "/images/tutorial-soil.png",
    category: "Soil Health",
    duration: "25:00",
    difficulty: "Intermediate",
    views: 3400,
    creator: "Dr. Green",
    tags: ["soil", "organic", "biology"],
  },
];

export const MOCK_KITS: Kit[] = [
  {
    id: "1",
    name: "Urban Composter Starter Kit",
    image: "/images/kit-compost.png",
    price: 3750,
    rating: 4.8,
    reviews: 120,
    description: "Everything you need to start composting in a small apartment using bokashi and vermiculture techniques.",
    isAffiliate: true,
    commission: true,
  },
  {
    id: "2",
    name: "Organic Heirloom Seed Collection",
    image: "/images/kit-seeds.png",
    price: 2499,
    rating: 4.9,
    reviews: 340,
    description: "20 varieties of non-GMO, heirloom vegetable seeds. Perfect for biodiversity.",
    isAffiliate: true,
    commission: true,
  },
  {
    id: "3",
    name: "Professional Soil Test Kit",
    image: "/images/kit-soil.png",
    price: 2950,
    rating: 4.6,
    reviews: 85,
    description: "Test your soil pH, N, P, and K levels at home. Essential for precise nutrient management.",
    isAffiliate: true,
    commission: true,
  },
  {
    id: "4",
    name: "Automatic Drip Irrigation System",
    image: "/images/kit-irrigation.png",
    price: 7450,
    rating: 4.7,
    reviews: 210,
    description: "Save water and time with this easy-to-install drip system. Adjustable emitters.",
    isAffiliate: true,
    commission: true,
  },
];

export const MOCK_CREATOR_STATS = {
  totalViews: 45200,
  watchTime: "1.2k hrs",
  commissions: 12500, // In Rupees
  engagementScore: 92,
  recentPayouts: [
    { date: "2024-02-01", amount: 4500, status: "Paid" },
    { date: "2024-01-01", amount: 3800, status: "Paid" },
  ],
};
