import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Send,
  Bot,
  User,
  Phone,
  Check,
  CheckCheck,
  Loader2,
  RefreshCw,
  Eye,
  Landmark,
  HelpCircle,
  XCircle,
  UserCheck,
  MapPin,
  ShieldCheck,
  Info,
  CreditCard,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Utensils,
  Upload,
  X,
  Image as ImageIcon,
  Search,
} from "lucide-react";
import { ChatMessage, MenuItem, Order, OrderItem } from "../types";

interface TelegramSimulatorProps {
  messages: ChatMessage[];
  isParsing: boolean;
  onSendMessage: (text: string) => void;
  onConfirmOrder: (summaryId: string) => void;
  onCancelOrder: (summaryId: string) => void;
  onSelectTrackOrder: (orderId: string) => void;
  activeOrder: Order | null;
  customerProfile: {
    name: string;
    phone: string;
    address: string;
    pickupAddress: string;
  };
  onOpenProfileModal: () => void;
  menuItems: MenuItem[];
  receiptPhoto?: string;
  onReceiptPhotoChange?: (photoUrl: string) => void;
  isAmharic: boolean;
  onLanguageChange: (val: boolean) => void;
  orders: Order[];
  onUpdateProfile?: (profile: { name: string; phone: string; address: string; pickupAddress: string }) => void;
}

export interface StoreBrandTheme {
  primary: string;
  primaryHover: string;
  primaryRgb: string;
  brandingEmoji?: string;
}

export const CENTRAL_RESTAURANT_THEMES: Record<string, StoreBrandTheme> = {
  mountain: {
    primary: "#15803D",
    primaryHover: "#166534",
    primaryRgb: "21, 128, 61",
    brandingEmoji: "🌲",
  },
  htown: {
    primary: "#DC2626",
    primaryHover: "#B91C1C",
    primaryRgb: "220, 38, 38",
    brandingEmoji: "🍔",
  },
  sunny: {
    primary: "#D97706",
    primaryHover: "#B45309",
    primaryRgb: "217, 119, 6",
    brandingEmoji: "☀️",
  },
  rome: {
    primary: "#78350F",
    primaryHover: "#451A03",
    primaryRgb: "120, 53, 15",
    brandingEmoji: "☕",
  },
  aroma: {
    primary: "#7C3AED",
    primaryHover: "#6D28D9",
    primaryRgb: "124, 58, 237",
    brandingEmoji: "🌸",
  },
  chanoly: {
    primary: "#BE123C",
    primaryHover: "#9F1239",
    primaryRgb: "190, 18, 60",
    brandingEmoji: "🥢",
  },
  neba: {
    primary: "#2563EB",
    primaryHover: "#1D4ED8",
    primaryRgb: "37, 99, 235",
    brandingEmoji: "🍹",
  },
  marti: {
    primary: "#E0560B",
    primaryHover: "#C24103",
    primaryRgb: "224, 86, 11",
    brandingEmoji: "🍳",
  },
  barcon: {
    primary: "#B45309",
    primaryHover: "#92400E",
    primaryRgb: "180, 83, 9",
    brandingEmoji: "🥩",
  },
  bliss_coffee: {
    primary: "#8B4513",
    primaryHover: "#5C4033",
    primaryRgb: "139, 69, 19",
    brandingEmoji: "☕",
  },
  boss_fries: {
    primary: "#EAB308",
    primaryHover: "#CA8A04",
    primaryRgb: "234, 179, 8",
    brandingEmoji: "🍟",
  },
  azi_hotel: {
    primary: "#4F46E5",
    primaryHover: "#4338CA",
    primaryRgb: "79, 70, 229",
    brandingEmoji: "🏨",
  },
  tina_faya: {
    primary: "#9D174D",
    primaryHover: "#831843",
    primaryRgb: "157, 23, 77",
    brandingEmoji: "🍷",
  },
  abenezer_kurt: {
    primary: "#991B1B",
    primaryHover: "#7F1D1D",
    primaryRgb: "153, 27, 27",
    brandingEmoji: "🥩",
  },
  feven: {
    primary: "#EA580C",
    primaryHover: "#C24103",
    primaryRgb: "234, 88, 12",
    brandingEmoji: "🥘",
  },
  abiy_filafil: {
    primary: "#65A30D",
    primaryHover: "#4D7C0F",
    primaryRgb: "101, 163, 13",
    brandingEmoji: "🧆",
  },
  tewedaj: {
    primary: "#9F1239",
    primaryHover: "#881337",
    primaryRgb: "159, 18, 57",
    brandingEmoji: "🍽️",
  },
  yellow_burger: {
    primary: "#EAB308",
    primaryHover: "#CA8A04",
    primaryRgb: "234, 179, 8",
    brandingEmoji: "🍔",
  },
  antsokiya: {
    primary: "#5E9D6E",
    primaryHover: "#4F8A5E",
    primaryRgb: "94, 157, 110",
    brandingEmoji: "🥗",
  },
  hibir: {
    primary: "#5E9D6E",
    primaryHover: "#4F8A5E",
    primaryRgb: "94, 157, 110",
    brandingEmoji: "☕",
  },
  mamas_cheko: {
    primary: "#EC4899",
    primaryHover: "#DB2777",
    primaryRgb: "236, 72, 153",
    brandingEmoji: "🍰",
  },
  sunny_burger_2: {
    primary: "#F97316",
    primaryHover: "#EA580C",
    primaryRgb: "249, 115, 22",
    brandingEmoji: "🍔",
  },
  rekik_coffee: {
    primary: "#8B4513",
    primaryHover: "#5C2E0B",
    primaryRgb: "139, 69, 19",
    brandingEmoji: "☕",
  },
  emi_pizza: {
    primary: "#E11D48",
    primaryHover: "#BE123C",
    primaryRgb: "225, 29, 72",
    brandingEmoji: "🍕",
  },
  yahweh_nisse: {
    primary: "#10B981",
    primaryHover: "#059669",
    primaryRgb: "16, 185, 129",
    brandingEmoji: "🥘",
  },
  mercy_fruit: {
    primary: "#EAB308",
    primaryHover: "#CA8A04",
    primaryRgb: "234, 179, 8",
    brandingEmoji: "🍹",
  },
  taso_italian: {
    primary: "#06B6D4",
    primaryHover: "#0891B2",
    primaryRgb: "6, 182, 212",
    brandingEmoji: "🍦",
  },
  colors_cafe: {
    primary: "#DB2777",
    primaryHover: "#BE185D",
    primaryRgb: "219, 39, 119",
    brandingEmoji: "🍰",
  },
  moonlight_restorant: {
    primary: "#4F46E5",
    primaryHover: "#4338CA",
    primaryRgb: "79, 70, 229",
    brandingEmoji: "🌙",
  },
  nota_lounge: {
    primary: "#D97706",
    primaryHover: "#B45309",
    primaryRgb: "217, 119, 6",
    brandingEmoji: "🍔",
  },
  queen_kitchen: {
    primary: "#8B5CF6",
    primaryHover: "#7C3AED",
    primaryRgb: "139, 92, 246",
    brandingEmoji: "👑",
  },
  konjo_cake: {
    primary: "#EC4899",
    primaryHover: "#DB2777",
    primaryRgb: "236, 72, 153",
    brandingEmoji: "🍰",
  },
  jalebib_muslim: {
    primary: "#10B981",
    primaryHover: "#059669",
    primaryRgb: "16, 185, 129",
    brandingEmoji: "🍲",
  },
};

export const STORE_PAGES = [
  // Page 1
  [
    "Aroma cafe",
    "Chanoly Noodles",
    "H-Town Burger",
    "Marti kitchen",
    "Mountain cafe",
    "Mountain Hotel",
    "Neba Cafe",
    "Rome 1960 Cafe",
    "Sunny burger",
    "YOM BURGERIZZA",
    "Barcon Migb Bet",
    "Liyu Taim (ልዩ ጣዕም)",
    "Zanzibar kitchen",
    "medi shiro",
    "Lewi piyasa",
    "Twin's Kitchen",
    "selam special",
    "Mohi Ertb",
    "Cafe 9",
  ],
  // Page 2
  [
    "Time Cafe",
    "fenet kitfo",
    "Bekos Pastry",
    "Light Burger",
    "Ana Cafe",
    "SAFELAND CAFE Piasa",
    "Addis Asa",
    "Chef Teketel",
    "DANI CHEF",
    "Funche shiro",
    "Habtsh Fiyel Tib",
    "Boss Fries",
    "Bliss Coffee",
    "Azi Hotel",
    "Tina Faaya Kitfo",
    "Abenezer Kurt Ena Kitfo",
    "Feven Restaurant",
    "Abiy Filafil",
    "Tewedaj",
    "Yellow Burger & Pizza",
  ],
  // Page 3
  [
    "Hibir Cafe & Restorant",
    "Mama's Cheko Bar",
    "Antsokiya Traditional Food",
    "Sunny burger #2",
    "Mikita coffee",
    "Rekik Coffee",
    "AMRON BURGER",
    "Emi Pizza",
    "Yahiw Nisse Cafe & Restaurant",
    "Taso Italian ice cream and Cafe",
    "Mercy Fruit Salad",
    "Colors Cafe",
    "Moonlight Restorant",
    "Nota Lounge",
    "Queen of the kitchen",
    "Konjo Cake",
    "Juve Restaurant",
    "Zebir Restaurant",
    "ጃለቢብ የሙስሊም ሬስቶራንት",
    "Blessed Gebeta",
  ],
  // Page 4
  [
    "Star Coffe",
    "ELU COFFEE HAWASSA",
    "Villa Alpha International hot...",
    "Enkutatash kurt",
    "ETHIOPIA DRUG STORE",
    "Loti Coffee",
    "Eyob Book Zone",
  ],
];

export const getStoreMeta = (storeName: string) => {
  if (
    storeName === "Rekik Coffee" ||
    storeName.toLowerCase().includes("rekik")
  ) {
    return {
      rating: "4.8",
      deliveryTime: "10-20 min",
      deliveryFee: "Free Delivery",
      image:
        "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=400&q=80",
    };
  }

  if (storeName === "Emi Pizza" || storeName.toLowerCase().includes("emi")) {
    return {
      rating: "4.9",
      deliveryTime: "15-30 min",
      deliveryFee: "Free Delivery",
      image:
        "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80",
    };
  }

  if (
    storeName === "Yahiw Nisse Cafe & Restaurant" ||
    storeName.toLowerCase().includes("yahiw") ||
    storeName.toLowerCase().includes("nisse") ||
    storeName.toLowerCase().includes("yahweh")
  ) {
    return {
      rating: "4.8",
      deliveryTime: "15-30 min",
      deliveryFee: "Free Delivery",
      image:
        "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=400&q=80",
    };
  }

  if (
    storeName === "Mercy Fruit Salad" ||
    storeName.toLowerCase().includes("mercy")
  ) {
    return {
      rating: "4.9",
      deliveryTime: "10-25 min",
      deliveryFee: "Free Delivery",
      image:
        "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=400&q=80",
    };
  }

  if (
    storeName === "Rome 1960 Cafe" ||
    storeName.toLowerCase().includes("rome")
  ) {
    return {
      rating: "4.8",
      deliveryTime: "15-25 min",
      deliveryFee: "Free Delivery",
      image:
        "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=400&q=80",
    };
  }

  if (storeName === "Aroma cafe" || storeName.toLowerCase().includes("aroma")) {
    return {
      rating: "4.7",
      deliveryTime: "15-30 min",
      deliveryFee: "Free Delivery",
      image:
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=400&q=80",
    };
  }

  if (
    storeName === "Chanoly Noodles" ||
    storeName.toLowerCase().includes("chanoly")
  ) {
    return {
      rating: "4.9",
      deliveryTime: "15-30 min",
      deliveryFee: "Free Delivery",
      image:
        "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=400&q=80",
    };
  }

  if (storeName === "Neba Cafe" || storeName.toLowerCase().includes("neba")) {
    return {
      rating: "4.8",
      deliveryTime: "15-30 min",
      deliveryFee: "Free Delivery",
      image:
        "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=400&q=80",
    };
  }

  if (
    storeName === "Mama's Cheko Bar" ||
    storeName.toLowerCase().includes("mamas cheko") ||
    storeName.toLowerCase().includes("cheko")
  ) {
    return {
      rating: "4.9",
      deliveryTime: "15-25 min",
      deliveryFee: "Free Delivery",
      image:
        "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80",
    };
  }

  if (
    storeName === "Sunny burger #2" ||
    storeName.toLowerCase().includes("sunny burger #2") ||
    (storeName.toLowerCase().includes("sunny") && storeName.includes("2"))
  ) {
    return {
      rating: "4.8",
      deliveryTime: "10-20 min",
      deliveryFee: "Free Delivery",
      image:
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80",
    };
  }

  if (
    storeName === "Marti kitchen" ||
    storeName === "Marti Kitchen" ||
    storeName.toLowerCase().includes("marti")
  ) {
    return {
      rating: "4.8",
      deliveryTime: "15-30 min",
      deliveryFee: "Free Delivery",
      image:
        "https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=400&q=80",
    };
  }

  if (
    storeName === "Barcon Migb Bet" ||
    storeName.toLowerCase().includes("barcon") ||
    storeName.toLowerCase().includes("barkon")
  ) {
    return {
      rating: "4.9",
      deliveryTime: "15-30 min",
      deliveryFee: "Free Delivery",
      image:
        "https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=400&q=80",
    };
  }

  if (
    storeName === "liyu taim migb bet" ||
    storeName === "Liyu Taim (ልዩ ጣዕም)" ||
    storeName.toLowerCase().includes("liyu") ||
    storeName.toLowerCase().includes("taim")
  ) {
    return {
      rating: "4.8",
      deliveryTime: "15-30 min",
      deliveryFee: "Free Delivery",
      image:
        "https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=400&q=80",
    };
  }

  if (
    storeName === "Zanzibar kitchen" ||
    storeName.toLowerCase().includes("zanzibar")
  ) {
    return {
      rating: "4.9",
      deliveryTime: "15-35 min",
      deliveryFee: "Free Delivery",
      image:
        "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=400&q=80",
    };
  }

  if (
    storeName === "YOM BURGERIZZA" ||
    storeName.toLowerCase().includes("yom") ||
    storeName.toLowerCase().includes("burgerizza")
  ) {
    return {
      rating: "4.8",
      deliveryTime: "15-30 min",
      deliveryFee: "Free Delivery",
      image:
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80",
    };
  }

  if (
    storeName === "medi shiro" ||
    storeName.toLowerCase().includes("medi shiro") ||
    storeName.toLowerCase().includes("medi_shiro") ||
    storeName.toLowerCase().includes("medishiro")
  ) {
    return {
      rating: "4.9",
      deliveryTime: "15-25 min",
      deliveryFee: "Free Delivery",
      image:
        "https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=400&q=80",
    };
  }

  if (
    storeName === "Lewi piyasa" ||
    storeName.toLowerCase().includes("lewi") ||
    storeName.toLowerCase().includes("piyasa") ||
    storeName.toLowerCase().includes("piyassa")
  ) {
    return {
      rating: "4.9",
      deliveryTime: "15-30 min",
      deliveryFee: "Free Delivery",
      image:
        "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80",
    };
  }

  if (
    storeName === "Twin's Kitchen" ||
    storeName.toLowerCase().includes("twin") ||
    storeName.toLowerCase().includes("twins")
  ) {
    return {
      rating: "4.8",
      deliveryTime: "15-30 min",
      deliveryFee: "Free Delivery",
      image:
        "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=400&q=80",
    };
  }

  if (
    storeName === "Mohi Ertb" ||
    storeName.toLowerCase().includes("mohi") ||
    storeName.toLowerCase().includes("ertb") ||
    storeName.toLowerCase().includes("ertib")
  ) {
    return {
      rating: "4.7",
      deliveryTime: "15-25 min",
      deliveryFee: "Free Delivery",
      image:
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80",
    };
  }

  if (
    storeName === "Habtsh Fiyel Tib" ||
    storeName.toLowerCase().includes("habtsh")
  ) {
    return {
      rating: "4.9",
      deliveryTime: "15-30 min",
      deliveryFee: "Free Delivery",
      image:
        "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80",
    };
  }

  if (
    storeName === "Boss Fries" ||
    storeName.toLowerCase().includes("boss fries") ||
    storeName.toLowerCase().includes("boss")
  ) {
    return {
      rating: "4.8",
      deliveryTime: "15-25 min",
      deliveryFee: "Free Delivery",
      image:
        "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=400&q=80",
    };
  }

  if (
    storeName === "Bliss Coffee" ||
    storeName.toLowerCase().includes("bliss") ||
    storeName.toLowerCase().includes("bliss coffee")
  ) {
    return {
      rating: "4.8",
      deliveryTime: "15-30 min",
      deliveryFee: "Free Delivery",
      image:
        "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=400&q=80",
    };
  }

  if (
    storeName === "Azi Hotel" ||
    storeName.toLowerCase().includes("azi") ||
    storeName.toLowerCase().includes("azi hotel")
  ) {
    return {
      rating: "4.8",
      deliveryTime: "20-35 min",
      deliveryFee: "Free Delivery",
      image:
        "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80",
    };
  }

  if (
    storeName === "Tina Faaya Kitfo" ||
    storeName.toLowerCase().includes("tina") ||
    storeName.toLowerCase().includes("faya") ||
    storeName.toLowerCase().includes("faaya")
  ) {
    return {
      rating: "4.9",
      deliveryTime: "15-30 min",
      deliveryFee: "Free Delivery",
      image:
        "https://images.unsplash.com/photo-1514326640560-7d063ef2aed5?auto=format&fit=crop&w=400&q=80",
    };
  }

  if (
    storeName === "Abenezer Kurt Ena Kitfo" ||
    storeName.toLowerCase().includes("abenezer") ||
    storeName.toLowerCase().includes("kurt")
  ) {
    return {
      rating: "4.9",
      deliveryTime: "15-30 min",
      deliveryFee: "Free Delivery",
      image:
        "https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=400&q=80",
    };
  }

  let hash = 0;
  for (let i = 0; i < storeName.length; i++) {
    hash = storeName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const absHash = Math.abs(hash);
  const rating = (4.2 + (absHash % 8) * 0.1).toFixed(1); // 4.2 to 4.9
  const deliveryTime = `${10 + (absHash % 3) * 5}-${20 + (absHash % 3) * 5} min`;
  const deliveryFee =
    absHash % 4 === 0 ? "Free Delivery" : `${25 + (absHash % 4) * 10} Birr`;

  const foodKeywords = [
    "cafe",
    "burger",
    "pizza",
    "noodles",
    "kitchen",
    "restaurant",
    "hotel",
    "pastry",
    "coffee",
    "kitfo",
    "fries",
    "shiro",
  ];
  let matchedKeyword = "default";
  for (const kw of foodKeywords) {
    if (storeName.toLowerCase().includes(kw)) {
      matchedKeyword = kw;
      break;
    }
  }

  const categoryImages: Record<string, string> = {
    burger:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&q=80",
    pizza:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=300&q=80",
    cafe: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=300&q=80",
    coffee:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=300&q=80",
    kitchen:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=300&q=80",
    pastry:
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=300&q=80",
    restaurant:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=300&q=80",
    hotel:
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=300&q=80",
    default:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80",
  };

  const image = categoryImages[matchedKeyword] || categoryImages.default;

  return { rating, deliveryTime, deliveryFee, image };
};

export const getFoodImage = (itemName: string, categoryName: string) => {
  const nameLower = itemName.toLowerCase();
  const catLower = categoryName.toLowerCase();
  if (nameLower.includes("burger") || catLower.includes("burger")) {
    return "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&q=80";
  }
  if (
    nameLower.includes("kitfo") ||
    nameLower.includes("ክትፎ") ||
    nameLower.includes("tibs") ||
    nameLower.includes("ጥብስ") ||
    catLower.includes("traditional") ||
    catLower.includes("habeshan")
  ) {
    return "https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=300&q=80";
  }
  if (nameLower.includes("pizza") || catLower.includes("pizza")) {
    return "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=300&q=80";
  }
  if (
    nameLower.includes("juice") ||
    nameLower.includes("shake") ||
    catLower.includes("juice")
  ) {
    return "https://images.unsplash.com/photo-1536882240095-0379873feb4e?auto=format&fit=crop&w=300&q=80";
  }
  if (
    nameLower.includes("sandwich") ||
    nameLower.includes("club") ||
    catLower.includes("sandwich")
  ) {
    return "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=300&q=80";
  }
  if (
    nameLower.includes("cake") ||
    nameLower.includes("pastry") ||
    catLower.includes("cake")
  ) {
    return "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=300&q=80";
  }
  if (
    nameLower.includes("breakfast") ||
    nameLower.includes("egg") ||
    catLower.includes("breakfast")
  ) {
    return "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=300&q=80";
  }
  if (
    nameLower.includes("chicken") ||
    nameLower.includes("wing") ||
    catLower.includes("chicken")
  ) {
    return "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=300&q=80";
  }
  if (
    nameLower.includes("shawarma") ||
    nameLower.includes("wrap") ||
    catLower.includes("shawarma")
  ) {
    return "https://images.unsplash.com/photo-1644704170947-fbf7cfcc1512?auto=format&fit=crop&w=300&q=80";
  }
  if (
    nameLower.includes("coke") ||
    nameLower.includes("soda") ||
    nameLower.includes("drink") ||
    catLower.includes("drink")
  ) {
    return "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=300&q=80";
  }
  return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80";
};

export interface MountainItem {
  name: string;
  price: number;
}

export const MOUNTAIN_HOTEL_MENU: Record<string, MountainItem[]> = {
  Juice: [
    { name: "Special Juice", price: 370.0 },
    { name: "Mango Juice", price: 290.0 },
    { name: "Avocado Juice", price: 290.0 },
    { name: "Strawberry Mojito", price: 270.0 },
    { name: "Strawberry Shake", price: 410.0 },
    { name: "Macchiato", price: 110.0 },
    { name: "Sprice Juice", price: 290.0 },
    { name: "Chocolate Shake", price: 430.0 },
    { name: "Papaya Juice", price: 290.0 },
    { name: "Iced late", price: 240.0 },
    { name: "Pineapple Mojito", price: 270.0 },
    { name: "Strawberry Smoothie", price: 370.0 },
    { name: "Lemon Mojito", price: 270.0 },
    { name: "Orange Tea", price: 200.0 },
  ],
  Pizza: [
    { name: "Special Pizza", price: 810.0 },
    { name: "Fasting Pizza", price: 490.0 },
    { name: "Special Mini Beef Pizza", price: 520.0 },
    { name: "Chicken Pizza", price: 820.0 },
    { name: "Mini beef pizza", price: 480.0 },
    { name: "Mountain Family Pizza", price: 1100.0 },
    { name: "Beef Pizza", price: 780.0 },
    { name: "Tuna Pizza", price: 740.0 },
    { name: "Margarita Pizza", price: 580.0 },
    { name: "Al Tuna", price: 730.0 },
  ],
  Sandwich: [
    { name: "Club Sandwich", price: 690.0 },
    { name: "Chef's Special Sandwich", price: 730.0 },
    { name: "Half Club sandwich", price: 550.0 },
    { name: "Egg Sandwich", price: 350.0 },
    { name: "Tuna Sandwich", price: 540.0 },
    { name: "Fasting Sandwich", price: 480.0 },
    { name: "Vegetable Sandwich", price: 450.0 },
  ],
  Shawarma: [
    { name: "Special Shawarma", price: 770.0 },
    { name: "Fasting Shawarma", price: 560.0 },
    { name: "Beef Shwarma", price: 720.0 },
    { name: "Normal Chips", price: 290.0 },
    { name: "Chicken Shawarma", price: 730.0 },
    { name: "Chicken Burrito", price: 780.0 },
    { name: "Beef Burrito", price: 680.0 },
    { name: "Beef Roll", price: 560.0 },
    { name: "Tuna Shawarma", price: 680.0 },
    { name: "Tuna Burrito", price: 730.0 },
  ],
  Breakfast: [
    { name: "Beef Loaded Fries", price: 460.0 },
    { name: "Special ፈጠራ", price: 390.0 },
    { name: "Special Melewa", price: 380.0 },
    { name: "Chips Masala", price: 310.0 },
    { name: "Beef Fajita", price: 700.0 },
    { name: "Chechebsa", price: 360.0 },
    { name: "Fasting Salad", price: 380.0 },
    { name: "Special Beef Salad", price: 530.0 },
    { name: "Special Chips", price: 370.0 },
  ],
  Burger: [
    { name: "Special Burger", price: 690.0 },
    { name: "Juicy Burger", price: 610.0 },
    { name: "Cheese Burger", price: 560.0 },
    { name: "Beef Burger", price: 550.0 },
    { name: "Chicken Burger", price: 730.0 },
    { name: "Double cheese Burger", price: 690.0 },
    { name: "Barbecue Burger", price: 600.0 },
    { name: "Fasting Burger", price: 460.0 },
  ],
  Cake: [
    { name: "Torta cake 2 killo", price: 1500.0 },
    { name: "White fores mini cake", price: 150.0 },
    { name: "Starwberry mini cake", price: 180.0 },
    { name: "Tekorach", price: 110.0 },
    { name: "Tekorach", price: 90.0 },
    { name: "Puncakes", price: 260.0 },
  ],
  Chicken: [
    { name: "Chicken loaded fries", price: 480.0 },
    { name: "Crispy Fried chicken", price: 770.0 },
    { name: "Chicken tender", price: 790.0 },
    { name: "Chicken Wings", price: 790.0 },
  ],
};

export const HTOWN_MENU: Record<string, MountainItem[]> = {
  Pizza: [
    { name: "Special Pizza", price: 750.0 },
    { name: "Fasting pizza", price: 470.0 },
    { name: "Chicken Pizza", price: 750.0 },
    { name: "Beef Lover Pizza", price: 600.0 },
    { name: "Calzone Pizza", price: 670.0 },
    { name: "Marzarita Pizza", price: 470.0 },
    { name: "Tuna with cheese Pizza", price: 720.0 },
    { name: "Tuna Pizza", price: 600.0 },
  ],
  Sandwich: [
    { name: "Chicken Steak Sandwich", price: 700.0 },
    { name: "Beef steak sandwich", price: 650.0 },
    { name: "Egg Sandwich", price: 300.0 },
  ],
  Shawarma: [
    { name: "Chicken Shawarma", price: 810.0 },
    { name: "Beef Shawarma", price: 700.0 },
    { name: "Chicken Burrito", price: 700.0 },
    { name: "Beef Burrito", price: 700.0 },
    { name: "Fasting Shwarma", price: 450.0 },
    { name: "Beef Roll", price: 350.0 },
    { name: "የጾም Burrito", price: 500.0 },
    { name: "Chicken Roll", price: 450.0 },
    { name: "Vegetables shwarma", price: 500.0 },
    { name: "Beef Fajita", price: 650.0 },
    { name: "Vegetable Roll", price: 350.0 },
  ],
  Breakfast: [
    { name: "Loaded Fries", price: 500.0 },
    { name: "Beef Chao fan (fried rice )", price: 500.0 },
    { name: "Normal Chips", price: 350.0 },
    { name: "Special Chips", price: 400.0 },
    { name: "Healthy Bowl", price: 1000.0 },
  ],
  Burger: [
    { name: "Special Burger", price: 710.0 },
    { name: "Cheese Burger", price: 600.0 },
    { name: "Beef Burger(chef Burger)", price: 650.0 },
    { name: "Htown double smash burger", price: 790.0 },
    { name: "Chicken Burger", price: 600.0 },
    { name: "የጾም በርገር", price: 450.0 },
    { name: "Chef's Burger", price: 650.0 },
  ],
  Cake: [{ name: "Crispy Lokma", price: 450.0 }],
  Chicken: [
    { name: "Special Chicken Wrap", price: 400.0 },
    { name: "BBQ Chicken with rice Full", price: 2000.0 },
    { name: "Chicken Fatija", price: 600.0 },
    { name: "Chicken Fajita", price: 750.0 },
    { name: "Chicken Chao fan (fried rice", price: 550.0 },
  ],
  Juice: [
    { name: "Special Juice", price: 300.0 },
    { name: "Fasting Special Juice", price: 200.0 },
    { name: "Mango Juice", price: 180.0 },
    { name: "Spric juice", price: 180.0 },
    { name: "Avocado Juice", price: 180.0 },
  ],
};

export const SUNNY_BURGER_MENU: Record<string, MountainItem[]> = {
  Juice: [
    { name: "Special Juice", price: 230.0 },
    { name: "Chocolate Shake", price: 270.0 },
    { name: "Sprice Juice", price: 200.0 },
    { name: "Mango Juice", price: 200.0 },
    { name: "Strawberry Shake", price: 230.0 },
    { name: "Special Shake", price: 270.0 },
    { name: "Avocado Juice", price: 200.0 },
    { name: "Papaya Juice", price: 200.0 },
    { name: "Iced Late", price: 170.0 },
    { name: "Macchiato", price: 110.0 },
  ],
  Pizza: [
    { name: "Sunny Special Pizza", price: 920.0 },
    { name: "Meat Lover Pizza", price: 900.0 },
    { name: "Beef Pizza", price: 750.0 },
    { name: "Margarita Pizza", price: 670.0 },
    { name: "Fasting pizza", price: 500.0 },
    { name: "Sunny Chicken Pizza", price: 900.0 },
    { name: "Mini Special Pizza", price: 720.0 },
    { name: "Tuna Pizza", price: 700.0 },
    { name: "Tuna with cheese pizza", price: 860.0 },
    { name: "Combo Pizza", price: 970.0 },
  ],
  Sandwich: [
    { name: "Special Chips", price: 340.0 },
    { name: "Normal Chips", price: 280.0 },
    { name: "Half Club sandwich", price: 670.0 },
    { name: "Egg Roll", price: 500.0 },
    { name: "Egg Sandwich", price: 350.0 },
    { name: "Full Club sandwich", price: 1220.0 },
  ],
  Shawarma: [
    { name: "Beef Rolls", price: 820.0 },
    { name: "Vegetable Rap", price: 500.0 },
  ],
  Breakfast: [
    { name: "Special Chechebsa", price: 340.0 },
    { name: "Special Fetira", price: 320.0 },
    { name: "Bonbolino", price: 60.0 },
  ],
  Burger: [
    { name: "Doctor's Triple Treat", price: 910.0 },
    { name: "Double Trouble Burger", price: 660.0 },
    { name: "Doctor's Pill", price: 750.0 },
    { name: "Saucy melt", price: 720.0 },
    { name: "Beef Chunk Burger", price: 520.0 },
    { name: "Texas style burger", price: 830.0 },
    { name: "Sunny Ultra", price: 1650.0 },
    { name: "Cheese Chunk", price: 570.0 },
    { name: "Doctors pills three piece", price: 1000.0 },
    { name: "Doctors pills four piece", price: 1330.0 },
    { name: "Beef and Chicken Burger", price: 750.0 },
    { name: "chilly burger", price: 660.0 },
    { name: "Sunny Breakfast", price: 730.0 },
  ],
  Chicken: [
    { name: "Chicken Roll", price: 870.0 },
    { name: "Chicken wrap", price: 870.0 },
  ],
  "Soft Drink": [
    { name: "Coca Cola", price: 50.0 },
    { name: "Fanta", price: 50.0 },
    { name: "Sprite", price: 50.0 },
    { name: "Water (Small)", price: 40.0 },
    { name: "Water (Large)", price: 70.0 },
  ],
  Cake: [
    { name: "Chocolate Cake Slice", price: 120.0 },
    { name: "Forest Cake Slice", price: 130.0 },
  ],
};

export const ROME_1960_MENU: Record<string, MountainItem[]> = {
  Noodles: [
    { name: "Special Combo Noodles", price: 870.0 },
    { name: "Vegetable noodle", price: 620.0 },
    { name: "Fish Noodles", price: 720.0 },
    { name: "Chicken Noodles", price: 820.0 },
    { name: "Beef Noodles", price: 820.0 },
    { name: "Vegetable Noodles", price: 620.0 },
    { name: "Fasting salad", price: 470.0 },
    { name: "Beef sizzling", price: 970.0 },
  ],
  Pizza: [
    { name: "Special Pizza", price: 780.0 },
    { name: "Vegetable Pizza", price: 480.0 },
    { name: "Normal Pizza", price: 680.0 },
    { name: "Chicken pizza", price: 880.0 },
    { name: "Tuna Pizza", price: 550.0 },
    { name: "Beef Pizza", price: 680.0 },
    { name: "Tuna With Cheese Pizza", price: 660.0 },
  ],
  Burger: [
    { name: "Special Burger", price: 570.0 },
    { name: "Chicken Burger", price: 770.0 },
    { name: "Beef Burger", price: 470.0 },
    { name: "Cheese Burger", price: 520.0 },
    { name: "Fasting Burger", price: 420.0 },
    { name: "Burgerizza", price: 880.0 },
  ],
  Juice: [
    { name: "Mango Juice", price: 290.0 },
    { name: "Chocolate Shake", price: 360.0 },
    { name: "Special Juice", price: 340.0 },
    { name: "Avocado Juice", price: 290.0 },
    { name: "Strawberry shake", price: 360.0 },
  ],
  Sandwich: [
    { name: "Special Club Sandwich", price: 570.0 },
    { name: "Club Sandwich", price: 470.0 },
    { name: "Rome chips", price: 280.0 },
    { name: "Chicken Friend Rice", price: 720.0 },
    { name: "Egg Sandwich", price: 320.0 },
    { name: "Egg Club Sandwich", price: 420.0 },
    { name: "Tuna Sandwich", price: 470.0 },
  ],
  Shawarma: [
    { name: "Special Burrito", price: 720.0 },
    { name: "Special Shawarma", price: 670.0 },
    { name: "Chicken Burrito", price: 670.0 },
    { name: "Fish Burrito", price: 520.0 },
    { name: "Beef Burrito", price: 620.0 },
    { name: "Beef Roll", price: 490.0 },
    { name: "Beef Shawarma", price: 620.0 },
    { name: "Chicken Shawarma", price: 620.0 },
    { name: "Tuna Burrito", price: 720.0 },
  ],
  Chicken: [
    { name: "Chicken Combo", price: 870.0 },
    { name: "Chicken Lollipop", price: 1070.0 },
    { name: "Nugget Combo", price: 1070.0 },
    { name: "Sizzling Chicken", price: 1170.0 },
  ],
  Breakfast: [
    { name: "Beef fried rice", price: 720.0 },
    { name: "Beef Soup", price: 420.0 },
    { name: "Special Chips", price: 370.0 },
    { name: "Special Salad", price: 570.0 },
    { name: "Fasting Rize", price: 470.0 },
    { name: "Egg Rize", price: 490.0 },
  ],
};

export const AROMA_CAFE_MENU: Record<string, MountainItem[]> = {
  Breakfast: [
    { name: "Loaded Fries", price: 480.0 },
    { name: "Loaded fries የጾም", price: 410.0 },
    { name: "Chips", price: 240.0 },
    { name: "Normal Fries", price: 240.0 },
    { name: "Beef Shakshuka", price: 410.0 },
    { name: "Shakshuka", price: 410.0 },
  ],
  Shawarma: [
    { name: "Burrito", price: 620.0 },
    { name: "Burrito Half", price: 420.0 },
    { name: "የጾም Burrito", price: 460.0 },
    { name: "Tuna Wrap", price: 440.0 },
    { name: "Fasting Half Burrito", price: 300.0 },
  ],
  Burger: [
    { name: "Double Special Burger", price: 580.0 },
    { name: "Triple Burger", price: 660.0 },
    { name: "Double Cheese Burger", price: 580.0 },
    { name: "Cheese Burger", price: 490.0 },
  ],
  Sandwich: [
    { name: "Club Sandwich", price: 530.0 },
    { name: "የጾም club Sandwich", price: 410.0 },
    { name: "Half Club sandwich", price: 460.0 },
    { name: "Special Sandwich", price: 410.0 },
    { name: "Egg Sandwich", price: 320.0 },
    { name: "Fasting Sandwich", price: 280.0 },
  ],
};

export const CHANOLY_NOODLES_MENU: Record<string, MountainItem[]> = {
  Noodles: [
    { name: "Special Chanoly Noodle", price: 935.0 },
    { name: "Stir Fry Vegetable Noodle", price: 735.0 },
    { name: "Chicken Noodles", price: 945.0 },
    { name: "Combo Salad Half", price: 775.0 },
    { name: "Stir Fry Beef Noodle", price: 905.0 },
    { name: "Combo Full Salad", price: 915.0 },
    { name: "Beef Fried Rize", price: 805.0 },
    { name: "Stif fry Fish Noodle", price: 805.0 },
    { name: "Vegetable salad Full", price: 795.0 },
    { name: "Vegetable salad Half", price: 615.0 },
    { name: "Vegetable Rize", price: 685.0 },
    { name: "Chicken Salad Half", price: 755.0 },
    { name: "Beef sizzling", price: 1185.0 },
    { name: "Fish Fried Rize", price: 755.0 },
    { name: "Beef broccoli", price: 1015.0 },
    { name: "Vegetable tofu", price: 595.0 },
  ],
  Breakfast: [
    { name: "Combo rize", price: 815.0 },
    { name: "Chicken Salad Full", price: 915.0 },
  ],
  Chicken: [
    { name: "Chicken lollipop", price: 1215.0 },
    { name: "Chicken sizzling", price: 1355.0 },
    { name: "Chicken fried rize", price: 825.0 },
    { name: "Peanut Chicken", price: 1355.0 },
  ],
  Fish: [
    { name: "Fish Salad Full", price: 825.0 },
    { name: "Half Fish Salad", price: 685.0 },
  ],
  Juice: [
    { name: "Chanoly best smoothie", price: 300.0 },
    { name: "Chocolate peanut butter smoothie", price: 300.0 },
    { name: "Avocado smoothie", price: 300.0 },
    { name: "Cinnamon mojito", price: 250.0 },
    { name: "Avocado juice", price: 300.0 },
    { name: "Ginger mojito", price: 250.0 },
    { name: "Strawberry mojito", price: 290.0 },
    { name: "Lemon Mojito", price: 290.0 },
  ],
};

export const NEBA_CAFE_MENU: Record<string, MountainItem[]> = {
  Sandwich: [
    { name: "Club Sandwich", price: 650.0 },
    { name: "Half Clubsandwich", price: 500.0 },
  ],
  Shawarma: [
    { name: "Special Chicken Shawarma", price: 750.0 },
    { name: "Chicken Rap", price: 650.0 },
  ],
  Cake: [{ name: "baklaba", price: 170.0 }],
  Breakfast: [
    { name: "Loaded Fries", price: 650.0 },
    { name: "chips", price: 300.0 },
    { name: "Cheese Chips", price: 450.0 },
  ],
  Burger: [
    { name: "Special burger", price: 740.0 },
    { name: "Mini Burger", price: 500.0 },
    { name: "Single Burger ?", price: 500.0 },
    { name: "Neba Tower Burger", price: 1350.0 },
    { name: "Fried Chicken Burger", price: 650.0 },
    { name: "Pepperoni Pizza", price: 550.0 },
    { name: "Double Cheese Burger", price: 650.0 },
    { name: "የጾም በርገር", price: 400.0 },
    { name: "Cheese burger", price: 550.0 },
    { name: "Fasting Burger", price: 450.0 },
    { name: "Beef With Cheese Burger", price: 550.0 },
  ],
  Chicken: [
    { name: "Chicken Loaded Fries", price: 650.0 },
    { name: "Chicken Load Fries", price: 650.0 },
    { name: "chicken wings", price: 700.0 },
    { name: "Chicken Combo", price: 1850.0 },
    { name: "Chicken Nugget", price: 600.0 },
  ],
  Juice: [
    { name: "special juice", price: 220.0 },
    { name: "Mango Juice", price: 220.0 },
  ],
  Pizza: [
    { name: "Special Pizza", price: 750.0 },
    { name: "Quatro Pizza", price: 600.0 },
    { name: "Quattro Pizza", price: 600.0 },
    { name: "Fasting Pizza", price: 450.0 },
    { name: "Margarita Pizza", price: 500.0 },
  ],
};

export const BARCON_MENU: Record<string, MountainItem[]> = {
  Injera: [
    { name: "Key Wet(ቀይ ወጥ)", price: 450.0 },
    { name: "Tefersho(ተፈረሾ)", price: 450.0 },
    { name: "Beyeaynet (በአይነት)", price: 200.0 },
    { name: "Gomen Besiga(ጎመን በስጋ)", price: 450.0 },
    { name: "Mahberawi 1/2(ማህበራዊ)", price: 1100.0 },
    { name: "Shiro Feses(ሽሮ ፈሰስ)", price: 200.0 },
    { name: "Misir Wet(ምስር ወጥ)", price: 200.0 },
    { name: "vegetabl With Meat(አትክልት በስጋ)", price: 400.0 },
  ],
  Pasta: [
    { name: "ፓስታ በስጎ", price: 200.0 },
    { name: "Pasta Beatikilt (ፓስታ በአትክልት)", price: 200.0 },
    { name: "Pasta Besiga(ፓስታ በስጋ)", price: 450.0 },
  ],
  Breakfast: [
    { name: "Enkulal Firfir (እንቁላል ፍርፍር)", price: 250.0 },
    { name: "እንቁላል ስልስ", price: 250.0 },
  ],
  Local: [
    { name: "Ayb Besiga(አይብ በስጋ)", price: 450.0 },
    { name: "አገልግል ግማሽ", price: 1100.0 },
    { name: "Mahberawi(ማህበራዊ)", price: 1600.0 },
    { name: "Enkulal Besiga (እንቁላል በስጋ)", price: 450.0 },
    { name: "ስጋ ፍርፍር", price: 400.0 },
    { name: "Merek Tibs", price: 450.0 },
    { name: "Ayb Begomen(አይብ በጎመን)", price: 300.0 },
    { name: "Dulet", price: 400.0 },
    { name: "Pasta Be enkulal", price: 250.0 },
    { name: "Minchet", price: 400.0 },
    { name: "Dinch Wot", price: 200.0 },
  ],
};

export const MEDI_SHIRO_MENU: Record<string, MountainItem[]> = {
  Injera: [
    { name: "በየአይነት beaynet", price: 180.0 },
    { name: "ተፈረሽ", price: 340.0 },
    { name: "ጥብስ", price: 340.0 },
    { name: "ፓስታ በአትክልት (L)", price: 290.0 },
    { name: "አሮ በቅቤ", price: 240.0 },
    { name: "ቀይ ወጥ", price: 340.0 },
    { name: "ምንቸት", price: 340.0 },
    { name: "Firfir besiga", price: 290.0 },
    { name: "Special firfr", price: 240.0 },
    { name: "Injera ፍርፍር", price: 180.0 },
  ],
  Local: [
    { name: "ጭቅና ጥብስ", price: 340.0 },
    { name: "Misir Wot", price: 180.0 },
    { name: "ቃሊሎ", price: 340.0 },
    { name: "Dinch Besiga", price: 240.0 },
    { name: "enkulal sills", price: 220.0 },
    { name: "Gomen Besiga", price: 290.0 },
    { name: "Pasta Besugo", price: 180.0 },
  ],
  "Traditional Foods": [{ name: "አትክልት በስጋ", price: 290.0 }],
  Pasta: [{ name: "ፓስታ በአትክልት", price: 180.0 }],
};

export const LEWI_PIYASA_MENU: Record<string, MountainItem[]> = {
  Burger: [
    { name: "Lewi Burger", price: 810.0 },
    { name: "Beef Burger", price: 700.0 },
    { name: "Fish Burger", price: 810.0 },
    { name: "Cheese Burger", price: 850.0 },
  ],
  Breakfast: [
    { name: "French Fries", price: 505.0 },
    { name: "Normal Chips", price: 390.0 },
  ],
  Local: [
    { name: "Lewi Agelgl", price: 1100.0 },
    { name: "Kuanta firfr", price: 720.0 },
    { name: "Misto", price: 655.0 },
    { name: "Misto Fresh", price: 655.0 },
    { name: "Macchiato", price: 150.0 },
    { name: "Tibs teferso", price: 800.0 },
    { name: "Merek Tibs", price: 1350.0 },
    { name: "Special Kitfo", price: 1050.0 },
  ],
  Pizza: [
    { name: "Lewi Special Pizza", price: 950.0 },
    { name: "Vegetable Pizza", price: 670.0 },
    { name: "Tuna Pizza", price: 650.0 },
    { name: "Beef Pizza", price: 850.0 },
    { name: "AL Tuna Pizza", price: 650.0 },
    { name: "Spice Chicken Pizza", price: 1000.0 },
    { name: "Margarita Pizza", price: 850.0 },
  ],
  Lazagna: [{ name: "Lewi Lassagna", price: 820.0 }],
  Fish: [
    { name: "Fish gulash", price: 860.0 },
    { name: "Fish Cotlet", price: 860.0 },
  ],
  Sandwich: [
    { name: "Lewi Club Sandwich", price: 960.0 },
    { name: "Chicken Sandwich", price: 800.0 },
    { name: "Cheese Sandwich", price: 880.0 },
    { name: "Fish Sandwich", price: 800.0 },
    { name: "Steak Sandwich", price: 760.0 },
    { name: "Tuna Melt", price: 820.0 },
  ],
  Juice: [
    { name: "Mango Juice", price: 305.0 },
    { name: "Mini_Strawberry Shake", price: 170.0 },
    { name: "Sprice Juice", price: 320.0 },
    { name: "Avocado Juice", price: 320.0 },
  ],
};

export const TWINS_KITCHEN_MENU: Record<string, MountainItem[]> = {
  Local: [
    { name: "Kuanta Firfr", price: 400.0 },
    { name: "Tefersho(ተፈረሾ)", price: 400.0 },
    { name: "Kilikil", price: 300.0 },
    { name: "Merek Tibs", price: 550.0 },
    { name: "Minchet", price: 350.0 },
    { name: "Doro Wot", price: 750.0 },
    { name: "Gomen Besiga", price: 350.0 },
    { name: "Pasta Besiga", price: 350.0 },
    { name: "Pasta beatikilt", price: 250.0 },
    { name: "TIbs", price: 550.0 },
    { name: "Fasting firfr", price: 250.0 },
    { name: "Gomen Kitfo", price: 350.0 },
    { name: "Siga Firfr", price: 350.0 },
    { name: "Gomen Beboloke", price: 250.0 },
    { name: "Tegabino", price: 300.0 },
    { name: "Ayib", price: 250.0 },
    { name: "Enkulal Besiga", price: 350.0 },
    { name: "Enkulal Firfr", price: 250.0 },
    { name: "Fasting Shiro", price: 250.0 },
  ],
  Breakfast: [{ name: "Ruz Besiga", price: 350.0 }],
};

export const MOHI_ERTB_MENU: Record<string, MountainItem[]> = {
  Sandwich: [{ name: "እርጥብ ertib", price: 100.0 }],
  Injera: [
    { name: "Teferisho", price: 300.0 },
    { name: "ምንቸት", price: 270.0 },
    { name: "በየአይነት", price: 130.0 },
    { name: "ሽሮ", price: 130.0 },
    { name: "ቀይ ወጥ", price: 270.0 },
    { name: "Siga Firfir", price: 270.0 },
    { name: "እንቁላል በስጋ", price: 280.0 },
    { name: "እንቁላል ፍርፍር", price: 160.0 },
    { name: "pasta በስጋ", price: 260.0 },
    { name: "አትክልት", price: 130.0 },
    { name: "ፍርፍር", price: 130.0 },
    { name: "ምስር", price: 130.0 },
    { name: "አትክልት በስጋ", price: 230.0 },
    { name: "ጥብስ", price: 430.0 },
  ],
  Pasta: [
    { name: "Pasta በስጋ", price: 140.0 },
    { name: "pasta በእንቁላል", price: 160.0 },
    { name: "Pasta በአትክልት", price: 130.0 },
  ],
};

export const SELAM_SPECIAL_MENU: Record<string, MountainItem[]> = {
  Local: [
    { name: "Selam Special Half", price: 850.0 },
    { name: "Selam Special 1/4", price: 650.0 },
    { name: "Selam Special Full", price: 1400.0 },
    { name: "Selam Special ነዑስ", price: 450.0 },
    { name: "Tibs", price: 300.0 },
    { name: "Teferisho", price: 400.0 },
    { name: "Tibs teferso", price: 400.0 },
    { name: "ምስር በእንቁላል", price: 300.0 },
    { name: "Gomen Besiga", price: 350.0 },
  ],
};

export const CAFE_9_MENU: Record<string, MountainItem[]> = {
  Local: [
    { name: "ቋንጣ ፍርፍር", price: 485.0 },
    { name: "Combo", price: 585.0 },
    { name: "Fasting firfr", price: 265.0 },
    { name: "Bozena beayib", price: 435.0 },
    { name: "Avocado Salad", price: 335.0 },
    { name: "Fasting combo", price: 385.0 },
    { name: "Pasta Besugo", price: 285.0 },
    { name: "Siga Firfir", price: 435.0 },
  ],
  Sandwich: [
    { name: "Club Sandwich", price: 635.0 },
    { name: "Egg Sandwich", price: 325.0 },
    { name: "Power Sandwich", price: 635.0 },
    { name: "Tuna Sandwich", price: 385.0 },
  ],
  Pizza: [
    { name: "Beef Pizza", price: 630.0 },
    { name: "Chicken Pizza", price: 730.0 },
    { name: "Margarita Pizza", price: 530.0 },
    { name: "Tuna pizza", price: 485.0 },
    { name: "Cheese Pizza", price: 580.0 },
    { name: "Special Pizza", price: 730.0 },
  ],
  Breakfast: [
    { name: "የፆም ስንድዊች", price: 435.0 },
    { name: "French Fries", price: 215.0 },
    { name: "Vegetable Rize", price: 285.0 },
  ],
  Burger: [
    { name: "Cheese Burger", price: 525.0 },
    { name: "Beef Burger", price: 525.0 },
  ],
  Fish: [{ name: "Fish cotlet", price: 385.0 }],
  Juice: [{ name: "Special Juice", price: 225.0 }],
  Shawarma: [{ name: "Tuna Wrap", price: 415.0 }],
};

export const LIYU_TAIM_MENU: Record<string, MountainItem[]> = {
  Injera: [
    { name: "ተፈረሾ(Tefersho)", price: 475.0 },
    { name: "Mahiberawi(ማህበራዊ)", price: 630.0 },
    { name: "በየአይነት (Beyeaynet)", price: 175.0 },
    { name: "Misir Besiga(ምስር በስጋ)", price: 375.0 },
    { name: "ስፔሻል ዱለት", price: 395.0 },
    { name: "ድንች በስጋ(Dinch Besiga)", price: 375.0 },
    { name: "ጥብስ(Tibs)", price: 425.0 },
    { name: "Minchet(ምንቸት)", price: 375.0 },
    { name: "ተጋቢኖ", price: 225.0 },
    { name: "ኖርማል ዱለት", price: 375.0 },
    { name: "ኮሌክሽን", price: 425.0 },
    { name: "ሽሮ በቅቤ", price: 275.0 },
  ],
  Pasta: [
    { name: "ፓስታ በአትክልት(Pasta Beatkilt)", price: 200.0 },
    { name: "እስፔሻል ፓስታ", price: 275.0 },
  ],
  Breakfast: [
    { name: "እንቁላል በስጋ", price: 375.0 },
    { name: "እንቁላል ፍርፍር (Enkulal Firfir)", price: 275.0 },
  ],
  Local: [
    { name: "ጥብስ", price: 425.0 },
    { name: "ቀይ ወጥ", price: 375.0 },
    { name: "ስጋ ፍርፍር", price: 375.0 },
    { name: "Atkilt besiga (አትክልት በስጋ)", price: 375.0 },
    { name: "senber", price: 375.0 },
    { name: "ሚንቶ", price: 375.0 },
    { name: "normal አትክልት", price: 175.0 },
    { name: "Misir Wot", price: 175.0 },
    { name: "አይብ በስጋ", price: 425.0 },
  ],
};

export const MARTI_KITCHEN_MENU: Record<string, MountainItem[]> = {
  Local: [
    { name: "የፍስክ እጨብጭቡለት", price: 1260.0 },
    { name: "ማርቲ ኮምቦ(ማርቲ ስፔሻል)", price: 1260.0 },
    { name: "ድርቆሽ ፍርፍር", price: 410.0 },
    { name: "Beyeaynet(በየአይነት)", price: 410.0 },
    { name: "Teferisho", price: 760.0 },
    { name: "የጾም እጨብጭቡለት ሙሉ", price: 760.0 },
    { name: "ዱለት Dulet", price: 410.0 },
    { name: "ቋንጣ ፍርፍር kuanta firfr", price: 960.0 },
    { name: "Kitfo(ክትፎ)", price: 1060.0 },
    { name: "Tibs (ጥብስ)", price: 960.0 },
    { name: "ዶሮ ወጥ", price: 1060.0 },
    { name: "Special ክትፎ", price: 1260.0 },
    { name: "ስፔሻል በየአይነት", price: 860.0 },
    { name: "Shiro(ሽሮ)", price: 410.0 },
    { name: "ፓስታ በአትክልት", price: 410.0 },
    { name: "ለሁለት ሰው የሚበቃ ዶሮ", price: 1260.0 },
    { name: "ከበቡሽ", price: 1860.0 },
    { name: "Ayib And Gomen(አይብ በጎመን)", price: 360.0 },
    { name: "Tegabino", price: 560.0 },
  ],
  Injera: [
    { name: "half የጾም አገልግሎት", price: 660.0 },
    { name: "ጥብስ", price: 960.0 },
    { name: "በወዙ", price: 960.0 },
    { name: "የጭቅና ጥብስ", price: 960.0 },
    { name: "ደርቅ ጥብስ", price: 960.0 },
  ],
  Breakfast: [
    { name: "Rice And Meat(ሩዝ በስጋ)", price: 560.0 },
    { name: "Chechbsa (ጨጨብሳ)", price: 410.0 },
    { name: "Enkulal Firfir (እንቁላል ፍርፍር)", price: 360.0 },
    { name: "Rice And Egg(ሩዝ በእንቁላል)", price: 560.0 },
  ],
  "Soft Drink": [{ name: "Marti Tela", price: 300.0 }],
  Sandwich: [{ name: "Egg Sandwich", price: 360.0 }],
};

export const YOM_BURGERIZZA_MENU: Record<string, MountainItem[]> = {
  Burger: [
    { name: "YOM Burgerizza", price: 960.0 },
    { name: "Special Burger", price: 750.0 },
    { name: "Chicken Burger", price: 760.0 },
    { name: "Double Burger", price: 730.0 },
    { name: "Cheese Burger", price: 650.0 },
    { name: "Beef Burger", price: 600.0 },
    { name: "የየም በረገር", price: 450.0 },
    { name: "Fasting Burger", price: 350.0 },
    { name: "Margarita Pizza", price: 690.0 },
  ],
  Pizza: [
    { name: "YOM Special Pizza", price: 820.0 },
    { name: "Chicken Pizza", price: 820.0 },
    { name: "Meat Lover's Pizza", price: 810.0 },
    { name: "Calzone Pizza", price: 810.0 },
    { name: "Stromboli Pizza", price: 810.0 },
    { name: "Tuna With Cheese Pizza", price: 800.0 },
    { name: "Beef Pizza", price: 750.0 },
    { name: "Peperoni Pizza", price: 720.0 },
    { name: "Mini Special Fasting Pizza", price: 650.0 },
    { name: "Fasting Special Pizza", price: 610.0 },
    { name: "Mini Pizza", price: 580.0 },
  ],
  Shawarma: [
    { name: "Chicken Burrito", price: 790.0 },
    { name: "Chicken Burrito", price: 810.0 },
    { name: "YOM Shawarma", price: 750.0 },
    { name: "Chicken Shawarma", price: 720.0 },
    { name: "Beef Shawarma", price: 680.0 },
    { name: "Fasting Shawarma", price: 590.0 },
    { name: "Vegetable Shawarma", price: 590.0 },
  ],
  Chicken: [
    { name: "Chicken Waffel", price: 1250.0 },
    { name: "Chicken Wings", price: 850.0 },
    { name: "Boneless Wing", price: 850.0 },
    { name: "Chicken Nugget", price: 760.0 },
  ],
  Breakfast: [
    { name: "Georgian Khachapuri", price: 750.0 },
    { name: "Special Fetira", price: 420.0 },
    { name: "Special Chips", price: 410.0 },
    { name: "Normal Fetira", price: 360.0 },
  ],
  Sandwich: [
    { name: "Chicken Club Sandwich", price: 680.0 },
    { name: "Full Club Sandwich", price: 650.0 },
    { name: "Tuna Sandwich", price: 640.0 },
    { name: "Egg Club Sandwich", price: 490.0 },
    { name: "Egg Sandwich", price: 490.0 },
    { name: "Half Club Sandwich", price: 490.0 },
    { name: "Hash Brown", price: 430.0 },
    { name: "French Toast", price: 400.0 },
    { name: "French Fries", price: 360.0 },
  ],
  Juice: [
    { name: "Strawberry Shake", price: 300.0 },
    { name: "Special Juice", price: 280.0 },
    { name: "Papaya Juice", price: 280.0 },
    { name: "Mango Juice", price: 280.0 },
    { name: "Avocado Juice", price: 280.0 },
  ],
  Local: [
    { name: "Grilled Goat Tibs", price: 950.0 },
    { name: "Tibs", price: 860.0 },
    { name: "በዘነ ሽሮ", price: 590.0 },
  ],
};

export const ZANZIBAR_MENU: Record<string, MountainItem[]> = {
  Fish: [
    { name: "Fish Gulash", price: 670.0 },
    { name: "Asa Dulet", price: 550.0 },
    { name: "Asa lebleb", price: 550.0 },
  ],
  Local: [
    { name: "Fasting Half Combo", price: 755.0 },
    { name: "Half Combo", price: 855.0 },
    { name: "Full Combo", price: 1105.0 },
    { name: "ቁንጣ ፍርፍር", price: 620.0 },
    { name: "Fasting Full Combo", price: 955.0 },
    { name: "ፓስታ በስጎ", price: 500.0 },
    { name: "Merek Tibs", price: 660.0 },
    { name: "Tefersho", price: 650.0 },
    { name: "Fasting Firfr", price: 420.0 },
    { name: "Special Avocado", price: 410.0 },
    { name: "Chikina Tibs", price: 670.0 },
    { name: "ድርቆሽ ፍርፍር", price: 520.0 },
    { name: "Chikina Tefersho", price: 660.0 },
    { name: "Pasta beatkilt", price: 500.0 },
    { name: "Drkosh Firfr Besiga", price: 580.0 },
    { name: "Shiro Bekibe", price: 370.0 },
    { name: "tegabino", price: 430.0 },
    { name: "Ruz Besiga", price: 560.0 },
  ],
  Juice: [
    { name: "Sprice Juice", price: 250.0 },
    { name: "Special Juice", price: 310.0 },
  ],
  Pizza: [
    { name: "Special Pizza", price: 800.0 },
    { name: "Vegetable Pizza", price: 570.0 },
    { name: "Margarita Pizza", price: 640.0 },
  ],
  Sandwich: [
    { name: "Tuna Salad", price: 720.0 },
    { name: "Tuna Sandwich", price: 570.0 },
  ],
  Breakfast: [
    { name: "Fish Cotlet With rize", price: 590.0 },
    { name: "Normal Chips", price: 380.0 },
    { name: "አትክልት", price: 410.0 },
  ],
  Burger: [
    { name: "Special Burger", price: 650.0 },
    { name: "Cheese Burger", price: 570.0 },
  ],
  Chicken: [
    { name: "Half Arrosto", price: 2060.0 },
    { name: "Full Arrosto", price: 4060.0 },
  ],
};

export const TIME_CAFE_MENU: Record<string, MountainItem[]> = {
  Pizza: [
    { name: "Special Pizza", price: 870.0 },
    { name: "Cheese Pizza", price: 760.0 },
    { name: "Fasting Pizza", price: 670.0 },
  ],
  Sandwich: [
    { name: "Club Sandwich Full", price: 790.0 },
    { name: "Club Sandwich Half", price: 670.0 },
    { name: "Fries", price: 250.0 },
  ],
  Burger: [
    { name: "Special Burger", price: 650.0 },
    { name: "Cheese Burger", price: 630.0 },
  ],
  Cake: [
    { name: "Mini Cake", price: 190.0 },
    { name: "Tekorach", price: 170.0 },
    { name: "Torta Cake", price: 1500.0 },
  ],
};

export const FENET_KITFO_MENU: Record<string, MountainItem[]> = {
  "Traditional Foods": [
    { name: "kitfo", price: 1400.0 },
    { name: "Special ክትፎ", price: 2100.0 },
    { name: "Gomen Kitfo", price: 780.0 },
  ],
  Habeshan: [
    { name: "Special ክትፎ", price: 2100.0 },
    { name: "ጥብስ", price: 780.0 },
    { name: "Gomen Kitfo", price: 780.0 },
  ],
};

export const BEKOS_PASTRY_MENU: Record<string, MountainItem[]> = {
  Cake: [
    { name: "Torta Cake", price: 1000.0 },
    { name: "Mini Torta Cake", price: 600.0 },
    { name: "Opera", price: 250.0 },
    { name: "Tekorach", price: 130.0 },
    { name: "Caramel Mini cake", price: 200.0 },
    { name: "Chocolate minicake", price: 200.0 },
  ],
  Pizza: [{ name: "Beef Pizza", price: 630.0 }],
  Breakfast: [{ name: "Normal Chips", price: 250.0 }],
  Burger: [
    { name: "Special Burger", price: 710.0 },
    { name: "Hat Creek Burger", price: 770.0 },
    { name: "Juicy Burger", price: 730.0 },
    { name: "Mini Burger", price: 400.0 },
    { name: "Loaded Burger", price: 750.0 },
    { name: "Cheese Burger", price: 570.0 },
    { name: "Triple Burger", price: 770.0 },
  ],
};

export const LIGHT_BURGER_MENU: Record<string, MountainItem[]> = {
  Burger: [
    { name: "Chicken Rap", price: 1310.0 },
    { name: "King Burger", price: 2025.0 },
    { name: "Cheese Burger", price: 950.0 },
    { name: "Classic Burger (Double)", price: 1060.0 },
    { name: "Classic Burger (Single)", price: 530.0 },
    { name: "Chicken Burger", price: 1260.0 },
    { name: "Beef Burger", price: 810.0 },
  ],
  Cake: [
    { name: "Mille Feuille", price: 180.0 },
    { name: "Torta cake", price: 1000.0 },
  ],
  Chicken: [
    { name: "Chicken Combo", price: 2080.0 },
    { name: "Drumsticks", price: 1680.0 },
    { name: "Chicken Nugget", price: 1325.0 },
  ],
  Sandwich: [
    { name: "Club Sandwich", price: 1580.0 },
    { name: "Special Wrap", price: 1970.0 },
  ],
  Pizza: [
    { name: "Tuna With Cheese pizza", price: 1200.0 },
    { name: "Special pizza", price: 1930.0 },
    { name: "Beef Pizza", price: 1480.0 },
    { name: "Chicken Pizza", price: 1980.0 },
  ],
  Breakfast: [{ name: "French Fries", price: 480.0 }],
};

export const ANA_CAFE_MENU: Record<string, MountainItem[]> = {
  Sandwich: [
    { name: "Club Sandwich", price: 610.0 },
    { name: "Chips", price: 280.0 },
  ],
  Chicken: [{ name: "Special Chicken Shawarma", price: 710.0 }],
  Shawarma: [{ name: "Special Fetira", price: 410.0 }],
  Burger: [
    { name: "Special Burger", price: 640.0 },
    { name: "Special Club Sandwich", price: 710.0 },
    { name: "Beef Burger", price: 510.0 },
    { name: "Egg Burger", price: 560.0 },
  ],
  Fish: [{ name: "Fish Gulash", price: 610.0 }],
  እንጀራ: [{ name: "Teferisho", price: 510.0 }],
  Pizza: [
    { name: "Special Pizza", price: 710.0 },
    { name: "Meat Lover Pizza", price: 660.0 },
    { name: "Vegetable Pizza", price: 560.0 },
    { name: "AL Tuna Pizza", price: 710.0 },
  ],
};

export const SAFELAND_CAFE_MENU: Record<string, MountainItem[]> = {
  Burger: [
    { name: "Safeland Juicy King Burger", price: 750.0 },
    { name: "Special Burger", price: 750.0 },
    { name: "Fasting በርገር", price: 400.0 },
    { name: "Beef Burger", price: 460.0 },
    { name: "Burgerizza", price: 750.0 },
  ],
  Cake: [{ name: "Custard Donut", price: 115.0 }],
  Chicken: [{ name: "Chicken wings", price: 700.0 }],
  Juice: [
    { name: "Banana Shake", price: 240.0 },
    { name: "Chocolate Shake", price: 290.0 },
  ],
  Pizza: [
    { name: "Fasting Pizza", price: 450.0 },
    { name: "Chicken Pizza", price: 660.0 },
    { name: "Tuna Pizza", price: 600.0 },
    { name: "Beef Pizza", price: 620.0 },
    { name: "marigarita Pizza", price: 550.0 },
  ],
  Shawarma: [
    { name: "Special Takos", price: 700.0 },
    { name: "Beef Shawarma", price: 600.0 },
    { name: "Special Shawarma", price: 700.0 },
    { name: "Vegetable Shawarma", price: 500.0 },
    { name: "Fasting Takos", price: 450.0 },
    { name: "Chicken Shawarma", price: 630.0 },
  ],
  Breakfast: [{ name: "Special Chips", price: 500.0 }],
};

export const ADDIS_ASA_MENU: Record<string, MountainItem[]> = {
  Fish: [
    { name: "Fish With Rice (እሳ በሩዝ)", price: 500.0 },
    { name: "እሳ ሸክላ", price: 550.0 },
    { name: "እሳ ጉላሽ", price: 550.0 },
    { name: "እሳ ለብለብ", price: 500.0 },
    { name: "Fish Cotelate (እሳ ኮተሌት)", price: 550.0 },
    { name: "እሳ ጥብስ ግማሽ", price: 750.0 },
    { name: "እሳ ዱለት", price: 500.0 },
    { name: "ዓሳ ወጥ", price: 500.0 },
    { name: "እሳ ዱለት", price: 500.0 },
    { name: "Fish With Vegetab (እሳ በአትክልት)", price: 500.0 },
    { name: "እሳ ጥብስ 1ኪሎ", price: 950.0 },
    { name: "Fish Salad", price: 550.0 },
  ],
};

export const CHEF_TEKETEL_MENU: Record<string, MountainItem[]> = {
  Habeshan: [
    { name: "ለ2 ሰው የጾም የሚበቃ ኮምቦ", price: 465.0 },
    { name: "ለሶስት ሰው የፍስክ የሚበቃ ኮምቦ", price: 845.0 },
    { name: "ለ3 ሰው የጾም የሚበቃ ኮምቦ", price: 575.0 },
    { name: "ለ2 ሰው የፍስክ የሚበቃ ኮምቦ", price: 745.0 },
    { name: "Special Shifinfin", price: 525.0 },
    { name: "Siga Firfr", price: 425.0 },
    { name: "Special Shiro", price: 345.0 },
    { name: "ለ4 ሰው የፍስክ የሚበቃ ኮምቦ", price: 995.0 },
    { name: "Teferisho", price: 405.0 },
    { name: "Firfr be avocado", price: 275.0 },
    { name: "Selata", price: 305.0 },
    { name: "shiro", price: 245.0 },
    { name: "Special Shiro", price: 345.0 },
    { name: "Suf Fitft", price: 295.0 },
    { name: "ለ4 ሰው የጾም የሚበቃ ኮምቦ", price: 695.0 },
  ],
};

export const DANI_CHEF_MENU: Record<string, MountainItem[]> = {
  Shawarma: [
    { name: "Special Ertb", price: 130.0 },
    { name: "Normal Ertb", price: 110.0 },
  ],
};

export const FUNCHE_SHIRO_MENU: Record<string, MountainItem[]> = {
  Habeshan: [
    { name: "Salad (ሰላጣ)", price: 300.0 },
    { name: "Key Wet (ቀይ ወጥ)", price: 450.0 },
    { name: "Shiro", price: 250.0 },
    { name: "ጥብስ(Tibis)", price: 550.0 },
    { name: "gomen Bekita", price: 300.0 },
    { name: "Bozena shiro", price: 430.0 },
    { name: "Misto", price: 450.0 },
    { name: "Suf Fitft", price: 250.0 },
  ],
  Pasta: [
    { name: "Pasta Beatikilt (ፓስታ በአትክልት)", price: 250.0 },
    { name: "Pasta Besugo(ፓስታ በሱጎ)", price: 250.0 },
    { name: "Pasta Besiga (ፓስታ በስጋ)", price: 450.0 },
  ],
  እንጀራ: [
    { name: "Beyeaynet (በየአይነት)", price: 300.0 },
    { name: "Misto(ሚስቶ)", price: 450.0 },
    { name: "Tefersho(ተፈረሾ)", price: 450.0 },
    { name: "Tegabino(ተገቢኖ)", price: 350.0 },
    { name: "Enkulal Besiga (እንቁላል በስጋ)", price: 450.0 },
    { name: "Atikilt Besiga (አትክልት በስጋ)", price: 450.0 },
    { name: "Cooked Vegetable", price: 250.0 },
    { name: "Firfir (እንጀራ ፍርፍር)", price: 250.0 },
    { name: "Ambasha Firfir (አምባሻ ፍርፍር)", price: 250.0 },
  ],
};

export const HABTSH_MENU: Record<string, MountainItem[]> = {
  Habeshan: [{ name: "Half Punch", price: 2080.0 }],
};

export const BOSS_FRIES_MENU: Record<string, MountainItem[]> = {
  Breakfast: [
    { name: "Special Chips", price: 370.0 },
    { name: "Fasting Special Chips", price: 270.0 },
    { name: "Normal Fasting Chips", price: 270.0 },
  ],
};

export const BLISS_COFFEE_MENU: Record<string, MountainItem[]> = {
  Cake: [
    { name: "Icecream Nachos", price: 320.0 },
    { name: "Vannela ice cream", price: 215.0 },
  ],
  Burger: [
    { name: "Bliss Special Burger", price: 750.0 },
    { name: "Cheese Burger", price: 600.0 },
    { name: "Beef Burger", price: 500.0 },
    { name: "Super Mix Burger", price: 750.0 },
    { name: "Chiken Burger", price: 550.0 },
  ],
  Pizza: [{ name: "Meat Lover Pizza", price: 750.0 }],
  Sandwich: [
    { name: "Club Sandwich", price: 650.0 },
    { name: "Tuna Sandwich", price: 600.0 },
    { name: "Vegetables Sandwich", price: 450.0 },
  ],
  Shawarma: [{ name: "Beef Rap", price: 550.0 }],
};

export const TINA_FAYA_MENU: Record<string, MountainItem[]> = {
  "Traditional Foods": [
    { name: "Chukame Betibis(ጨካሜ በትቢስ) with እርጎ", price: 930.0 },
    { name: "Chukame Betibis(ጨካሜ በትቢስ) without እርጎ", price: 850.0 },
    { name: "Burissame", price: 630.0 },
  ],
  Habeshan: [
    { name: "Chukame Betibis(ጨካሜ በትቢስ) with እርጎ", price: 930.0 },
    { name: "Chukame Betibis(ጨካሜ በትቢስ) without እርጎ", price: 850.0 },
    { name: "Burissame", price: 630.0 },
  ],
};

export const AZI_HOTEL_MENU: Record<string, MountainItem[]> = {
  "Traditional Foods": [
    { name: "Chukame Betibis(ጨካሜ በትቢስ) with እርጎ", price: 930.0 },
    { name: "Chukame Betibis(ጨካሜ በትቢስ) without እርጎ", price: 850.0 },
    { name: "Burissame", price: 630.0 },
    { name: "ኮርኒስ", price: 740.0 },
    { name: "Omolcho Betibs", price: 750.0 },
    { name: "Traditional Food Combo", price: 1880.0 },
    { name: "Azi Special", price: 1500.0 },
    { name: "Dulet", price: 390.0 },
  ],
  Habeshan: [
    { name: "Chukame Betibis(ጨካሜ በትቢስ) with እርጎ", price: 930.0 },
    { name: "Chukame Betibis(ጨካሜ በትቢስ) without እርጎ", price: 850.0 },
    { name: "Burissame", price: 630.0 },
    { name: "ኮርኒስ", price: 740.0 },
    { name: "Omolcho Betibs", price: 750.0 },
    { name: "Traditional Food Combo", price: 1880.0 },
    { name: "Azi Special", price: 1500.0 },
    { name: "Dulet", price: 390.0 },
  ],
};

export const ABENEZER_KURT_MENU: Record<string, MountainItem[]> = {
  Habeshan: [
    { name: "Kitfo", price: 1261.0 },
    { name: "እሩብ ጥብስ", price: 861.0 },
    { name: "Dulet", price: 460.0 },
    { name: "1/4 ሆላንድ", price: 1050.0 },
    { name: "Tire Siga Erub", price: 850.0 },
    { name: "Tefersho", price: 650.0 },
    { name: "Enkulal Besiga", price: 550.0 },
    { name: "1 Kg Tire Siga", price: 3300.0 },
    { name: "Special Kitfo", price: 1650.0 },
    { name: "አቤኔዘር ኮምቦ ግማሽ", price: 1350.0 },
    { name: "አቤኔዘር ሙሉ ኮምቦ", price: 2710.0 },
    { name: "ጥሬ ስጋ", price: 2700.0 },
    { name: "Senber", price: 450.0 },
    { name: "ግማሽ ጥሬ ስጋ", price: 1350.0 },
    { name: "Erub Tire", price: 800.0 },
  ],
};

export const ABIY_FILAFIL_MENU: Record<string, MountainItem[]> = {
  Breakfast: [{ name: "Normal Filafil", price: 120.0 }],
  Burger: [{ name: "Special Filafil", price: 125.0 }],
  Shawarma: [{ name: "Normal Ertb", price: 80.0 }],
};

export const FEVEN_RESTAURANT_MENU: Record<string, MountainItem[]> = {
  Habeshan: [
    { name: "ክትፎ", price: 960.0 },
    { name: "ሙሉ ኮርኒስ", price: 1450.0 },
    { name: "Tibs Tefersho", price: 660.0 },
    { name: "ማህበራዊ", price: 1560.0 },
    { name: "የበግ ጥብስ", price: 760.0 },
    { name: "ሳምን በስጋ", price: 460.0 },
    { name: "Merek Tibs", price: 760.0 },
    { name: "Kuanta Firfr", price: 660.0 },
    { name: "ዶሮ ወጥ", price: 840.0 },
    { name: "Aynet", price: 460.0 },
    { name: "Key Wot", price: 660.0 },
    { name: "Misto", price: 650.0 },
    { name: "Tegabino", price: 460.0 },
    { name: "Fasting Full Agelgl", price: 1060.0 },
    { name: "Half Fasting Agelgl", price: 660.0 },
  ],
};

export const TEWEDAJ_MENU: Record<string, MountainItem[]> = {
  እንጀራ: [
    { name: "የጾም አገልግል", price: 500.0 },
    { name: "ምንቸት", price: 400.0 },
    { name: "የፍስክ አገልግል", price: 800.0 },
    { name: "ጥብስ", price: 450.0 },
    { name: "ምንቸት በ አይብ", price: 450.0 },
  ],
  Habeshan: [
    { name: "Aynet", price: 220.0 },
    { name: "Full Agelgl", price: 800.0 },
    { name: "Tefersho", price: 400.0 },
    { name: "Misir Wot", price: 200.0 },
    { name: "Pasta beatikilt", price: 200.0 },
    { name: "special Combo", price: 1200.0 },
    { name: "Suf Fitft", price: 250.0 },
    { name: "Half Agelgl", price: 500.0 },
    { name: "Shiro", price: 200.0 },
  ],
};

export const YELLOW_BURGER_MENU: Record<string, MountainItem[]> = {
  Burger: [
    { name: "Triple Burger", price: 780.0 },
    { name: "Yellow Burger", price: 720.0 },
    { name: "Cheese Burger", price: 520.0 },
    { name: "Mini Burger", price: 290.0 },
    { name: "Beef Burger", price: 470.0 },
  ],
  Pizza: [
    { name: "Special Pizza", price: 750.0 },
    { name: "Vegetable Pizza", price: 380.0 },
    { name: "Mini Pizza", price: 440.0 },
    { name: "Margarita Pizza", price: 550.0 },
    { name: "Tuna Pizza", price: 580.0 },
  ],
  Juice: [
    { name: "Mango Juice", price: 180.0 },
    { name: "Spric juice", price: 180.0 },
    { name: "Chocolate Shake", price: 260.0 },
  ],
  Breakfast: [
    { name: "Fetira", price: 290.0 },
    { name: "Normal Chips", price: 270.0 },
  ],
  Sandwich: [
    { name: "Vegetable Sandwich", price: 310.0 },
    { name: "Club Sandwich", price: 670.0 },
    { name: "Egg Sandwich", price: 330.0 },
  ],
};

export const ANTSOKIYA_MENU: Record<string, MountainItem[]> = {
  Habeshan: [
    { name: "አገልግል ግማሽ", price: 550.0 },
    { name: "አገልግል ሙሉ", price: 850.0 },
    { name: "Tibs Normal", price: 550.0 },
    { name: "Ye hulet sew ye fisik agelgl", price: 750.0 },
    { name: "Ayb Besiga", price: 450.0 },
    { name: "ክትፎ Normal", price: 950.0 },
    { name: "ክትፎ Special", price: 1050.0 },
  ],
  እንጀራ: [
    { name: "ስጋ ፍርፍር", price: 350.0 },
    { name: "ተፈሪሽ Normal", price: 350.0 },
    { name: "ተፈሪሽ special", price: 650.0 },
    { name: "Tibs Special", price: 650.0 },
    { name: "ቀይ ወጥ", price: 350.0 },
  ],
  "Traditional Foods": [{ name: "Ayib Begomen", price: 350.0 }],
};

export const HIBIR_MENU: Record<string, MountainItem[]> = {
  Burger: [
    { name: "Hibir Double Juice Burger", price: 700.0 },
    { name: "Cheese Burger", price: 550.0 },
    { name: "Hibir Burgerizza", price: 900.0 },
    { name: "Double Cheese Burger", price: 600.0 },
    { name: "Chicken Burger", price: 830.0 },
    { name: "Fasting Burger", price: 450.0 },
    { name: "Hibir Special Burger", price: 730.0 },
    { name: "Triple Burger", price: 750.0 },
    { name: "Beef Burger", price: 530.0 },
    { name: "Fish Burger", price: 550.0 },
    { name: "Stromboli Pizza", price: 670.0 },
  ],
  Pizza: [
    { name: "Special Pizza", price: 800.0 },
    { name: "Beef Pizza", price: 650.0 },
    { name: "Margarita Pizza", price: 530.0 },
  ],
  Lazagna: [{ name: "Lazagna", price: 940.0 }],
  Sandwich: [
    { name: "french fries", price: 250.0 },
    { name: "Hibir Burrito", price: 870.0 },
  ],
  Juice: [
    { name: "Mango Iced Tea", price: 280.0 },
    { name: "Special Juice", price: 280.0 },
  ],
  Habeshan: [{ name: "ቋንጣ ፍርፍር", price: 530.0 }],
};

export const MAMAS_CHEKO_MENU: Record<string, MountainItem[]> = {
  Cake: [
    { name: "Combo", price: 520.0 },
    { name: "Churros", price: 400.0 },
    { name: "Crepes", price: 400.0 },
    { name: "Fasting Churros", price: 400.0 },
    { name: "Fasting Crepes", price: 400.0 },
    { name: "Waffle", price: 400.0 },
    { name: "Dessert Oreo", price: 300.0 },
    { name: "Pancakes", price: 400.0 },
  ],
};

export const REKIK_COFFEE_MENU: Record<string, MountainItem[]> = {
  Habeshan: [
    { name: "Tegabino", price: 300.0 },
    { name: "Drkosh Firfr", price: 310.0 },
    { name: "Aynet", price: 290.0 },
    { name: "Merek Tibs", price: 550.0 },
    { name: "Tefersho", price: 470.0 },
    { name: "Siga Firfr", price: 400.0 },
    { name: "Special kuanta firfr", price: 550.0 },
    { name: "Half Half Drkosh", price: 320.0 },
    { name: "Ruz Besiga", price: 470.0 },
    { name: "Suf Fitft", price: 300.0 },
    { name: "Firfr bekibe", price: 310.0 },
    { name: "Half Half Shiro beselata", price: 290.0 },
    { name: "Misir Wot", price: 290.0 },
    { name: "Pasta Beatikilt", price: 290.0 },
    { name: "Shiro", price: 250.0 },
    { name: "Enkulal Sils", price: 300.0 },
    { name: "Fasting Firfr", price: 270.0 },
  ],
};

export const EMI_PIZZA_MENU: Record<string, MountainItem[]> = {
  Pizza: [
    { name: "Special Pizza", price: 800.0 },
    { name: "Calazone Pizza", price: 750.0 },
  ],
  Juice: [
    { name: "Special Juice", price: 240.0 },
    { name: "Chocolate Shake", price: 280.0 },
    { name: "Emi Juice", price: 230.0 },
  ],
  Shawarma: [
    { name: "Chicken Shawarma", price: 770.0 },
    { name: "Vegetable Shawarma", price: 550.0 },
  ],
  Burger: [
    { name: "Special Burger", price: 780.0 },
    { name: "Triple Burger", price: 850.0 },
  ],
  Sandwich: [{ name: "Club Sandwich", price: 700.0 }],
  Cake: [
    { name: "Chocolate Cake", price: 180.0 },
    { name: "Strawberry Cake", price: 190.0 },
    { name: "Vanilla Cake", price: 170.0 },
    { name: "Cheese Cake", price: 220.0 },
  ],
};

export const YAHWEH_NISSE_MENU: Record<string, MountainItem[]> = {
  Habeshan: [
    { name: "Teferisho", price: 600.0 },
    { name: "Merek Tibs", price: 700.0 },
    { name: "Gomen Besiga", price: 400.0 },
    { name: "Half Agelgl", price: 550.0 },
    { name: "Kuanta firfr", price: 600.0 },
    { name: "Special Ayb", price: 600.0 },
    { name: "Special Kitfo", price: 1350.0 },
    { name: "Ayib Besiga", price: 600.0 },
    { name: "Dulet", price: 450.0 },
    { name: "Full Agelgl", price: 1100.0 },
  ],
};

export const MERCY_FRUIT_MENU: Record<string, MountainItem[]> = {
  Juice: [
    { name: "Fruit Punch", price: 560.0 },
    { name: "Mango Juice", price: 260.0 },
    { name: "Special Juice", price: 290.0 },
    { name: "Avocado with strawberry juice", price: 540.0 },
    { name: "Banana Juice", price: 240.0 },
    { name: "Telba Juice", price: 290.0 },
    { name: "Habab Juice", price: 300.0 },
  ],
  Breakfast: [
    { name: "Full Fruit Punch", price: 920.0 },
    { name: "half selata", price: 570.0 },
    { name: "Half Fruit Punch", price: 570.0 },
    { name: "Sambusa", price: 50.0 },
  ],
  Habeshan: [
    { name: "Papaya Juice", price: 240.0 },
  ],
};

export const TASO_ITALIAN_MENU: Record<string, MountainItem[]> = {
  Lazagna: [
    { name: "Special Lazagna", price: 950.0 },
  ],
  Cake: [
    { name: "Norma ice cream", price: 150.0 },
    { name: "Italian Biscuit", price: 100.0 },
    { name: "Dry Cake Slice", price: 70.0 },
  ],
  Burger: [
    { name: "Cheese Burger", price: 600.0 },
    { name: "Special Burger", price: 650.0 },
    { name: "Double Chesse Burger", price: 750.0 },
    { name: "Beef Burgur", price: 550.0 },
  ],
  Pizza: [
    { name: "Special Pizza", price: 850.0 },
    { name: "Mini Margarita Pizza", price: 500.0 },
  ],
  "Ice Cream": [
    { name: "Black Forest Cup", price: 430.0 },
    { name: "Affogato Al Caffe", price: 550.0 },
  ],
  Sandwich: [
    { name: "Banana Split", price: 600.0 },
    { name: "French Fries", price: 450.0 },
    { name: "Egg Sandwich", price: 400.0 },
    { name: "Taso Sandwich", price: 700.0 },
    { name: "Tuna Sandwich", price: 450.0 },
  ],
  Habeshan: [
    { name: "Tuna Salad", price: 750.0 },
    { name: "Mixed Salad", price: 500.0 },
  ],
  Breakfast: [
    { name: "Normal Lazagna", price: 900.0 },
  ],
};

export const COLORS_CAFE_MENU: Record<string, MountainItem[]> = {
  Cake: [
    { name: "None Fasting Baklava", price: 100.0 },
  ],
};

export const MOONLIGHT_RESTORANT_MENU: Record<string, MountainItem[]> = {
  Chicken: [
    { name: "Chicken Combo", price: 900.0 },
  ],
};

export const NOTA_LOUNGE_MENU: Record<string, MountainItem[]> = {
  Burger: [
    { name: "Normal Ertb", price: 100.0 },
    { name: "Special Ertb", price: 120.0 },
  ],
};

export const QUEEN_KITCHEN_MENU: Record<string, MountainItem[]> = {};

export const KONJO_CAKE_MENU: Record<string, MountainItem[]> = {
  Cake: [
    { name: "Chocolate Tart 6 Piece", price: 230.0 },
    { name: "Chocolate Tart 12 Piece", price: 420.0 },
    { name: "Vanilla Boxegna 12 Piece", price: 480.0 },
    { name: "Chocolate Tart 4 Piece", price: 150.0 },
    { name: "Vanilla Boxegna 6 Piece", price: 330.0 },
    { name: "Vanilla Tart 12 Piece", price: 600.0 },
    { name: "Chocolate Custard 6 Piece", price: 330.0 },
    { name: "Vanilla Boxegna 4 Piece", price: 150.0 },
    { name: "Vanilla Tart 4 Piece", price: 150.0 },
    { name: "Vanilla Tart 6 Piece", price: 230.0 },
    { name: "Boxegna Chocolate 12 Piece", price: 420.0 },
    { name: "Boxegna Chocolate 4 Piece", price: 150.0 },
    { name: "Boxegna Chocolate 6 Piece", price: 230.0 },
    { name: "Chocolate Custard 12 Piece", price: 420.0 },
    { name: "Chocolate Custard 4 Piece", price: 150.0 },
    { name: "Vanilla Custard 12 Piece", price: 420.0 },
    { name: "Vanilla Custard 4 Piece", price: 150.0 },
    { name: "Vanilla Custard 6 Piece", price: 230.0 },
  ],
};

export const JALEBIB_MUSLIM_MENU: Record<string, MountainItem[]> = {
  Habeshan: [
    { name: "መረቅ ጥብስ", price: 480.0 },
    { name: "Derek Tibs", price: 530.0 },
  ],
};


export const SUNNY_BURGER_2_MENU: Record<string, MountainItem[]> = {
  Burger: [
    { name: "Doctor's Triple Treat", price: 900.0 },
    { name: "Cheese Burger", price: 570.0 },
    { name: "Texas style burger", price: 740.0 },
    { name: "Sunny Ultra", price: 1650.0 },
    { name: "Doctor Pill three tab", price: 1030.0 },
  ],
  Juice: [
    { name: "Chocolate Shake", price: 270.0 },
    { name: "Mango Juice", price: 200.0 },
    { name: "Strawberry mojito", price: 200.0 },
  ],
  Pizza: [{ name: "Special Pizza", price: 920.0 }],
  Sandwich: [
    { name: "Egg Roll", price: 500.0 },
    { name: "Egg Sandwich", price: 300.0 },
  ],
  Shawarma: [{ name: "Fasting Roll", price: 430.0 }],
};

export default function TelegramSimulator({
  messages,
  isParsing,
  onSendMessage,
  onConfirmOrder,
  onCancelOrder,
  onSelectTrackOrder,
  activeOrder,
  customerProfile,
  onOpenProfileModal,
  menuItems,
  receiptPhoto,
  onReceiptPhotoChange,
  isAmharic,
  onLanguageChange,
  orders,
  onUpdateProfile,
}: TelegramSimulatorProps) {
  const isClosed = new Date().getHours() >= 20 || new Date().getHours() < 6;
  const [inputText, setInputText] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>(
    {},
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [tgKeyboard, setTgKeyboard] = useState<
    | "main"
    | "stores_p1"
    | "stores_p2"
    | "stores_p3"
    | "stores_p4"
    | "mountain_hotel_menu"
    | "htown_menu"
    | "sunny_menu"
    | "rome_menu"
    | "aroma_menu"
    | "chanoly_menu"
    | "neba_menu"
    | "marti_menu"
    | "yom_menu"
    | "barcon_menu"
    | "medi_shiro_menu"
    | "lewi_piyasa_menu"
    | "twins_kitchen_menu"
    | "mohi_ertb_menu"
    | "selam_special_menu"
    | "cafe_9_menu"
    | "liyu_taim_menu"
    | "zanzibar_menu"
    | "time_cafe_menu"
    | "fenet_kitfo_menu"
    | "bekos_pastry_menu"
    | "light_burger_menu"
    | "ana_cafe_menu"
    | "safeland_cafe_menu"
    | "addis_asa_menu"
    | "chef_teketel_menu"
    | "dani_chef_menu"
    | "funche_shiro_menu"
    | "habtsh_menu"
    | "boss_fries_menu"
    | "bliss_coffee_menu"
    | "tina_faya_menu"
    | "azi_hotel_menu"
    | "abenezer_kurt_menu"
    | "feven_restaurant_menu"
    | "abiy_filafil_menu"
    | "tewedaj_menu"
    | "yellow_burger_menu"
    | "antsokiya_menu"
    | "hibir_menu"
    | "mamas_cheko_menu"
    | "sunny_burger_2_menu"
    | "rekik_coffee_menu"
    | "emi_pizza_menu"
    | "yahweh_nisse_menu"
    | "mercy_fruit_menu"
    | "taso_italian_menu"
    | "colors_cafe_menu"
    | "moonlight_restorant_menu"
    | "nota_lounge_menu"
    | "queen_kitchen_menu"
    | "konjo_cake_menu"
    | "jalebib_muslim_menu"
  >("main");
  const [webAppKeyboard, setWebAppKeyboard] = useState<
    | "main"
    | "stores_p1"
    | "stores_p2"
    | "stores_p3"
    | "stores_p4"
    | "mountain_hotel_menu"
    | "htown_menu"
    | "sunny_menu"
    | "rome_menu"
    | "aroma_menu"
    | "chanoly_menu"
    | "neba_menu"
    | "marti_menu"
    | "yom_menu"
    | "barcon_menu"
    | "medi_shiro_menu"
    | "lewi_piyasa_menu"
    | "twins_kitchen_menu"
    | "mohi_ertb_menu"
    | "selam_special_menu"
    | "cafe_9_menu"
    | "liyu_taim_menu"
    | "zanzibar_menu"
    | "time_cafe_menu"
    | "fenet_kitfo_menu"
    | "bekos_pastry_menu"
    | "light_burger_menu"
    | "ana_cafe_menu"
    | "safeland_cafe_menu"
    | "addis_asa_menu"
    | "chef_teketel_menu"
    | "dani_chef_menu"
    | "funche_shiro_menu"
    | "habtsh_menu"
    | "boss_fries_menu"
    | "bliss_coffee_menu"
    | "tina_faya_menu"
    | "azi_hotel_menu"
    | "abenezer_kurt_menu"
    | "feven_restaurant_menu"
    | "abiy_filafil_menu"
    | "tewedaj_menu"
    | "yellow_burger_menu"
    | "antsokiya_menu"
    | "hibir_menu"
    | "mamas_cheko_menu"
    | "sunny_burger_2_menu"
    | "rekik_coffee_menu"
    | "emi_pizza_menu"
    | "yahweh_nisse_menu"
    | "mercy_fruit_menu"
    | "taso_italian_menu"
    | "colors_cafe_menu"
    | "moonlight_restorant_menu"
    | "nota_lounge_menu"
    | "queen_kitchen_menu"
    | "konjo_cake_menu"
    | "jalebib_muslim_menu"
  >("stores_p1");
  const [mountainCategory, setMountainCategory] = useState<string>("Juice");
  const [mountainSelected, setMountainSelected] = useState<
    Record<string, number>
  >({});
  const [menuPage, setMenuPage] = useState<number>(0);
  const [storeSearchQuery, setStoreSearchQuery] = useState<string>("");
  const [chukameModal, setChukameModal] = useState<{
    isOpen: boolean;
    storeName: "tina_faya" | "azi_hotel";
  } | null>(null);

  const handleKeyboardAction = (action: string, arg?: string) => {
    switch (action) {
      case "new_order":
        setTgKeyboard("stores_p1");
        onSendMessage("New Order");
        break;

      case "change_language":
        onLanguageChange(!isAmharic);
        onSendMessage("Change Language");
        break;

      case "help":
        onSendMessage("Help");
        break;

      case "recent_orders":
        onSendMessage("Recent Orders");
        break;

      case "discounts":
        onSendMessage("Discounts");
        break;

      case "download_app":
        onSendMessage("Download Our App");
        break;

      case "select_store":
        if (arg) {
          setLocalPickupAddress(arg);
          onSendMessage(`StoreSelected: ${arg}`);
          if (arg === "Mountain Hotel" || arg === "Mountain cafe") {
            setTgKeyboard("mountain_hotel_menu");
            setMountainCategory("Juice");
            setMenuPage(0);
            setToastMessage(
              `⛰️ Welcome to Mountain Hotel Live Interactive Menu!`,
            );
          } else if (arg === "H-Town Burger") {
            setTgKeyboard("htown_menu");
            setMountainCategory("Burger");
            setMenuPage(0);
            setToastMessage(`🍔 Welcome to H-Town Burger Premium Menu!`);
          } else if (arg.toLowerCase().includes("sunny")) {
            setTgKeyboard("sunny_menu");
            setMountainCategory("Burger");
            setMenuPage(0);
            setToastMessage(`☀️ Welcome to Sunny Burger Premium Menu!`);
          } else if (
            arg === "Rome 1960 Cafe" ||
            arg.toLowerCase().includes("rome")
          ) {
            setTgKeyboard("rome_menu");
            setMountainCategory("Pizza");
            setMenuPage(0);
            setToastMessage(`🇮🇹 Welcome to Rome 1960 Cafe Premium Menu!`);
          } else if (
            arg === "Aroma cafe" ||
            arg.toLowerCase().includes("aroma")
          ) {
            setTgKeyboard("aroma_menu");
            setMountainCategory("Breakfast");
            setMenuPage(0);
            setToastMessage(`☕ Welcome to Aroma Cafe Premium Menu!`);
          } else if (
            arg === "Chanoly Noodles" ||
            arg.toLowerCase().includes("chanoly")
          ) {
            setTgKeyboard("chanoly_menu");
            setMountainCategory("Noodles");
            setMenuPage(0);
            setToastMessage(`🍜 Welcome to Chanoly Noodles Premium Menu!`);
          } else if (
            arg === "Neba Cafe" ||
            arg.toLowerCase().includes("neba")
          ) {
            setTgKeyboard("neba_menu");
            setMountainCategory("Burger");
            setMenuPage(0);
            setToastMessage(`🍔 Welcome to Neba Cafe Premium Menu!`);
          } else if (
            arg === "Marti kitchen" ||
            arg.toLowerCase().includes("marti")
          ) {
            setTgKeyboard("marti_menu");
            setMountainCategory("Local");
            setMenuPage(0);
            setToastMessage(`🥘 Welcome to Marti Kitchen Premium Menu!`);
          } else if (
            arg === "YOM BURGERIZZA" ||
            arg.toLowerCase().includes("yom") ||
            arg.toLowerCase().includes("burgerizza")
          ) {
            setTgKeyboard("yom_menu");
            setMountainCategory("Burger");
            setMenuPage(0);
            setToastMessage(`🍔 Welcome to YOM Burgerizza Premium Menu!`);
          } else if (
            arg === "Barcon Migb Bet" ||
            arg.toLowerCase().includes("barcon") ||
            arg.toLowerCase().includes("barkon")
          ) {
            setTgKeyboard("barcon_menu");
            setMountainCategory("Injera");
            setMenuPage(0);
            setToastMessage(`🥘 Welcome to Barkon ምግብ ቤት Premium Menu!`);
          } else if (
            arg === "liyu taim migb bet" ||
            arg === "Liyu Taim (ልዩ ጣዕም)" ||
            arg.toLowerCase().includes("liyu") ||
            arg.toLowerCase().includes("taim")
          ) {
            setTgKeyboard("liyu_taim_menu");
            setMountainCategory("Injera");
            setMenuPage(0);
            setToastMessage(`🥘 Welcome to Liyu Taim (ልዩ ጣዕም) Premium Menu!`);
          } else if (
            arg === "Zanzibar kitchen" ||
            arg.toLowerCase().includes("zanzibar")
          ) {
            setTgKeyboard("zanzibar_menu");
            setMountainCategory("Fish");
            setMenuPage(0);
            setToastMessage(`🥘 Welcome to Zanzibar kitchen Premium Menu!`);
          } else if (
            arg === "medi shiro" ||
            arg.toLowerCase().includes("medi shiro") ||
            arg.toLowerCase().includes("medi_shiro") ||
            arg.toLowerCase().includes("medishiro")
          ) {
            setTgKeyboard("medi_shiro_menu");
            setMountainCategory("Injera");
            setMenuPage(0);
            setToastMessage(`🥘 Welcome to medi shiro Premium Menu!`);
          } else if (
            arg === "Lewi piyasa" ||
            arg.toLowerCase().includes("lewi") ||
            arg.toLowerCase().includes("piyasa") ||
            arg.toLowerCase().includes("piyassa")
          ) {
            setTgKeyboard("lewi_piyasa_menu");
            setMountainCategory("Pizza");
            setMenuPage(0);
            setToastMessage(`🥘 Welcome to Lewi Piyassa Premium Menu!`);
          } else if (
            arg === "Twin's Kitchen" ||
            arg.toLowerCase().includes("twin") ||
            arg.toLowerCase().includes("twins")
          ) {
            setTgKeyboard("twins_kitchen_menu");
            setMountainCategory("Local");
            setMenuPage(0);
            setToastMessage(`🥘 Welcome to Twin's Kitchen Premium Menu!`);
          } else if (
            arg === "Mohi Ertb" ||
            arg.toLowerCase().includes("mohi") ||
            arg.toLowerCase().includes("ertb") ||
            arg.toLowerCase().includes("ertib")
          ) {
            setTgKeyboard("mohi_ertb_menu");
            setMountainCategory("Sandwich");
            setMenuPage(0);
            setToastMessage(`🥘 Welcome to Mohi Ertb Premium Menu!`);
          } else if (
            arg === "selam special" ||
            arg.toLowerCase().includes("selam")
          ) {
            setTgKeyboard("selam_special_menu");
            setMountainCategory("Local");
            setMenuPage(0);
            setToastMessage(`🥘 Welcome to Selam Special Premium Menu!`);
          } else if (
            arg === "Cafe 9" ||
            arg.toLowerCase().includes("cafe 9") ||
            arg.toLowerCase().includes("cafe9") ||
            arg.toLowerCase().includes("cafe_9")
          ) {
            setTgKeyboard("cafe_9_menu");
            setMountainCategory("Local");
            setMenuPage(0);
            setToastMessage(`🥘 Welcome to Cafe 9 Premium Menu!`);
          } else if (
            arg === "Time Cafe" ||
            arg.toLowerCase().includes("time")
          ) {
            setTgKeyboard("time_cafe_menu");
            setMountainCategory("Sandwich");
            setMenuPage(0);
            setToastMessage(`☕ Welcome to Time Cafe Premium Menu!`);
          } else if (
            arg === "fenet kitfo" ||
            arg.toLowerCase().includes("fenet") ||
            arg.toLowerCase().includes("kitfo")
          ) {
            setTgKeyboard("fenet_kitfo_menu");
            setMountainCategory("Habeshan");
            setMenuPage(0);
            setToastMessage(`🥘 Welcome to Fenet Kitfo Premium Menu!`);
          } else if (
            arg === "Bekos Pastry" ||
            arg.toLowerCase().includes("bekos") ||
            arg.toLowerCase().includes("bekso") ||
            arg.toLowerCase().includes("pastry")
          ) {
            setTgKeyboard("bekos_pastry_menu");
            setMountainCategory("Cake");
            setMenuPage(0);
            setToastMessage(`🍰 Welcome to Bekos Pastry Premium Menu!`);
          } else if (
            arg === "Light Burger" ||
            arg.toLowerCase().includes("light burger") ||
            arg.toLowerCase().includes("light")
          ) {
            setTgKeyboard("light_burger_menu");
            setMountainCategory("Burger");
            setMenuPage(0);
            setToastMessage(`🍔 Welcome to Light Burger Premium Menu!`);
          } else if (
            arg === "Ana Cafe" ||
            arg.toLowerCase().includes("ana cafe") ||
            arg.toLowerCase().includes("ana")
          ) {
            setTgKeyboard("ana_cafe_menu");
            setMountainCategory("Sandwich");
            setMenuPage(0);
            setToastMessage(`🍽️ Welcome to Ana Cafe Premium Menu!`);
          } else if (
            arg === "SAFELAND CAFE Piasa" ||
            arg.toLowerCase().includes("safeland") ||
            arg.toLowerCase().includes("safe")
          ) {
            setTgKeyboard("safeland_cafe_menu");
            setMountainCategory("Burger");
            setMenuPage(0);
            setToastMessage(`🍔 Welcome to SAFELAND CAFE Premium Menu!`);
          } else if (
            arg === "Addis Asa" ||
            arg.toLowerCase().includes("addis asa") ||
            arg.toLowerCase().includes("asa") ||
            arg.toLowerCase().includes("ዓሳ")
          ) {
            setTgKeyboard("addis_asa_menu");
            setMountainCategory("Fish");
            setMenuPage(0);
            setToastMessage(`🐠 Welcome to Addis Asa Premium Menu!`);
          } else if (
            arg === "Chef Teketel" ||
            arg.toLowerCase().includes("teketel") ||
            arg.toLowerCase().includes("chef teketel")
          ) {
            setTgKeyboard("chef_teketel_menu");
            setMountainCategory("Habeshan");
            setMenuPage(0);
            setToastMessage(`👩‍🍳 Welcome to Chef Teketel Premium Menu!`);
          } else if (
            arg === "DANI CHEF" ||
            arg.toLowerCase().includes("dani") ||
            arg.toLowerCase().includes("chef dani")
          ) {
            setTgKeyboard("dani_chef_menu");
            setMountainCategory("Shawarma");
            setMenuPage(0);
            setToastMessage(`👩‍🍳 Welcome to DANI CHEF Premium Menu!`);
          } else if (
            arg === "Funche shiro" ||
            arg.toLowerCase().includes("funche") ||
            arg.toLowerCase().includes("funche shiro")
          ) {
            setTgKeyboard("funche_shiro_menu");
            setMountainCategory("Habeshan");
            setMenuPage(0);
            setToastMessage(`🥘 Welcome to Funche shiro Premium Menu!`);
          } else if (
            arg === "Habtsh Fiyel Tib" ||
            arg.toLowerCase().includes("habtsh") ||
            arg.toLowerCase().includes("fiyel")
          ) {
            setTgKeyboard("habtsh_menu");
            setMountainCategory("Habeshan");
            setMenuPage(0);
            setToastMessage(`🥘 Welcome to Habtsh Premium Menu!`);
          } else if (
            arg === "Boss Fries" ||
            arg.toLowerCase().includes("boss fries") ||
            arg.toLowerCase().includes("boss")
          ) {
            setTgKeyboard("boss_fries_menu");
            setMountainCategory("Breakfast");
            setMenuPage(0);
            setToastMessage(`🍟 Welcome to Boss Fries Premium Menu!`);
          } else if (
            arg === "Bliss Coffee" ||
            arg.toLowerCase().includes("bliss") ||
            arg.toLowerCase().includes("bliss coffee")
          ) {
            setTgKeyboard("bliss_coffee_menu");
            setMountainCategory("Cake");
            setMenuPage(0);
            setToastMessage(`☕ Welcome to Bliss Coffee Premium Menu!`);
          } else if (
            arg === "Azi Hotel" ||
            arg.toLowerCase().includes("azi") ||
            arg.toLowerCase().includes("azi hotel")
          ) {
            setTgKeyboard("azi_hotel_menu");
            setMountainCategory("Traditional Foods");
            setMenuPage(0);
            setToastMessage(`🏨 Welcome to Azi Hotel Premium Menu!`);
          } else if (
            arg === "Tina Faaya Kitfo" ||
            arg.toLowerCase().includes("tina") ||
            arg.toLowerCase().includes("faya") ||
            arg.toLowerCase().includes("faaya")
          ) {
            setTgKeyboard("tina_faya_menu");
            setMountainCategory("Traditional Foods");
            setMenuPage(0);
            setToastMessage(`🥘 Welcome to Tina Faaya Kitfo Premium Menu!`);
          } else if (
            arg === "Abenezer Kurt Ena Kitfo" ||
            arg.toLowerCase().includes("abenezer") ||
            arg.toLowerCase().includes("kurt")
          ) {
            setTgKeyboard("abenezer_kurt_menu");
            setMountainCategory("Habeshan");
            setMenuPage(0);
            setToastMessage(
              `🥩 Welcome to Abenezer Kurt Ena Kitfo Premium Menu!`,
            );
          } else if (
            arg === "Feven Restaurant" ||
            arg.toLowerCase().includes("feven")
          ) {
            setTgKeyboard("feven_restaurant_menu");
            setMountainCategory("Habeshan");
            setMenuPage(0);
            setToastMessage(`🥘 Welcome to Feven Restaurant Premium Menu!`);
          } else if (
            arg === "Abiy Filafil" ||
            arg.toLowerCase().includes("abiy") ||
            arg.toLowerCase().includes("filafil") ||
            arg.toLowerCase().includes("felafil")
          ) {
            setTgKeyboard("abiy_filafil_menu");
            setMountainCategory("Breakfast");
            setMenuPage(0);
            setToastMessage(`🧆 Welcome to Abiy Filafil Combined Menu!`);
          } else if (
            arg === "Tewedaj" ||
            arg.toLowerCase().includes("tewedaj")
          ) {
            setTgKeyboard("tewedaj_menu");
            setMountainCategory("እንጀራ");
            setMenuPage(0);
            setToastMessage(`🥘 Welcome to Tewedaj Premium Menu!`);
          } else if (
            arg === "Yellow Burger & Pizza" ||
            arg === "Yellow Burger" ||
            arg.toLowerCase().includes("yellow burger") ||
            arg.toLowerCase().includes("yellow")
          ) {
            setTgKeyboard("yellow_burger_menu");
            setMountainCategory("Burger");
            setMenuPage(0);
            setToastMessage(
              `🍔 Welcome to Yellow Burger & Pizza Combined Menu!`,
            );
          } else if (
            arg === "Hibir Cafe & Restorant" ||
            arg === "Hibir" ||
            arg.toLowerCase().includes("hibir")
          ) {
            setTgKeyboard("hibir_menu");
            setMountainCategory("Burger");
            setMenuPage(0);
            setToastMessage(
              `☕ Welcome to Hibir Cafe & Restorant Premium Menu!`,
            );
          } else if (
            arg === "Antsokiya Traditional Food" ||
            arg === "Antsokiya" ||
            arg.toLowerCase().includes("antsokiya")
          ) {
            setTgKeyboard("antsokiya_menu");
            setMountainCategory("Habeshan");
            setMenuPage(0);
            setToastMessage(
              `🥘 Welcome to Antsokiya Traditional Food Premium Menu!`,
            );
          } else if (
            arg === "Mama's Cheko Bar" ||
            arg.toLowerCase().includes("mamas cheko") ||
            arg.toLowerCase().includes("cheko")
          ) {
            setTgKeyboard("mamas_cheko_menu");
            setMountainCategory("Cake");
            setMenuPage(0);
            setToastMessage(`🍰 Welcome to Mama's Cheko Bar Premium Menu!`);
          } else if (
            arg === "Sunny burger #2" ||
            arg.toLowerCase().includes("sunny burger #2") ||
            (arg.toLowerCase().includes("sunny") &&
              (arg.includes("2") || arg.toLowerCase().includes("two")))
          ) {
            setTgKeyboard("sunny_burger_2_menu");
            setMountainCategory("Burger");
            setMenuPage(0);
            setToastMessage(`☀️ Welcome to Sunny burger #2 Premium Menu!`);
          } else if (
            arg === "Rekik Coffee" ||
            arg.toLowerCase().includes("rekik")
          ) {
            setTgKeyboard("rekik_coffee_menu");
            setMountainCategory("Habeshan");
            setMenuPage(0);
            setToastMessage(`☕ Welcome to Rekik Coffee Premium Menu!`);
          } else if (arg === "Emi Pizza" || arg.toLowerCase().includes("emi")) {
            setTgKeyboard("emi_pizza_menu");
            setMountainCategory("Pizza");
            setMenuPage(0);
            setToastMessage(`🍕 Welcome to Emi Pizza Premium Menu!`);
          } else if (
            arg === "Yahiw Nisse Cafe & Restaurant" ||
            arg.toLowerCase().includes("yahiw") ||
            arg.toLowerCase().includes("nisse") ||
            arg.toLowerCase().includes("yahweh")
          ) {
            setTgKeyboard("yahweh_nisse_menu");
            setMountainCategory("Habeshan");
            setMenuPage(0);
            setToastMessage(`🥘 Welcome to Yahiw Nisse Premium Menu!`);
          } else if (
            arg === "Mercy Fruit Salad" ||
            arg.toLowerCase().includes("mercy")
          ) {
            setTgKeyboard("mercy_fruit_menu");
            setMountainCategory("Juice");
            setMenuPage(0);
            setToastMessage(`🍹 Welcome to Mercy Fruit Premium Menu!`);
          } else if (
            arg === "Taso Italian ice cream and Cafe" ||
            arg.toLowerCase().includes("taso") ||
            arg.toLowerCase().includes("italian")
          ) {
            setTgKeyboard("taso_italian_menu");
            setMountainCategory("Pizza");
            setMenuPage(0);
            setToastMessage(`🍦 Welcome to Taso Italian Premium Menu!`);
          } else if (
            arg === "Colors Cafe" ||
            arg.toLowerCase().includes("colors")
          ) {
            setTgKeyboard("colors_cafe_menu");
            setMountainCategory("Cake");
            setMenuPage(0);
            setToastMessage(`🍰 Welcome to Colors Cafe Premium Menu!`);
          } else if (
            arg === "Moonlight Restorant" ||
            arg.toLowerCase().includes("moonlight")
          ) {
            setTgKeyboard("moonlight_restorant_menu");
            setMountainCategory("Chicken");
            setMenuPage(0);
            setToastMessage(`🌙 Welcome to Moonlight Restorant Premium Menu!`);
          } else if (
            arg === "Nota Lounge" ||
            arg.toLowerCase().includes("nota")
          ) {
            setTgKeyboard("nota_lounge_menu");
            setMountainCategory("Burger");
            setMenuPage(0);
            setToastMessage(`🍔 Welcome to Nota Lounge Premium Menu!`);
          } else if (
            arg === "Konjo Cake" ||
            arg.toLowerCase().includes("konjo")
          ) {
            setTgKeyboard("konjo_cake_menu");
            setMountainCategory("Cake");
            setMenuPage(0);
            setToastMessage(`🍰 Welcome to Konjo Cake Premium Menu!`);
          } else if (
            arg === "ጃለቢብ የሙስሊም ሬስቶራንት" ||
            arg.toLowerCase().includes("ጃለቢብ") ||
            arg.toLowerCase().includes("jalebib") ||
            arg.toLowerCase().includes("jelebib") ||
            arg.toLowerCase().includes("muslim")
          ) {
            setTgKeyboard("jalebib_muslim_menu");
            setMountainCategory("Habeshan");
            setMenuPage(0);
            setToastMessage(`🍲 Welcome to ጃለቢብ የሙስሊም ሬስቶራንት Premium Menu!`);
          } else if (false) {
            // Queen Kitchen premium menu disabled
          } else {
            setIsMenuOpen(true);
            setToastMessage(`🏪 Selected: ${arg}! Set as pick-up location.`);
          }
          setTimeout(() => setToastMessage(null), 3500);
        }
        break;

      default:
        break;
    }
  };

  // Consolidated client preferences forms start completely empty on page load
  const [localName, setLocalName] = useState("");
  const [localPhone, setLocalPhone] = useState("");
  const [localAddress, setLocalAddress] = useState("");
  const [localPickupAddress, setLocalPickupAddress] = useState("");
  const [localPackageDetails, setLocalPackageDetails] = useState("");
  const [localEstimatedPrice, setLocalEstimatedPrice] = useState(150);
  const [phoneSharedStep, setPhoneSharedStep] = useState<
    "none" | "fake" | "real"
  >("none");

  useEffect(() => {
    if (isMenuOpen) {
      setLocalName(customerProfile.name || "");
      setLocalPhone(customerProfile.phone || "");
      setLocalAddress(customerProfile.address || "");
      setLocalPickupAddress(customerProfile.pickupAddress || "");
      setLocalPackageDetails("");
      setLocalEstimatedPrice(150);
      setPhoneSharedStep("none");
      setFormError(null);
    }
  }, [customerProfile, isMenuOpen]);

  // Simulated rapid fill sharing preferences using telegram authentication permission flow
  const handleShareMobileNumber = () => {
    const correctPhone = (customerProfile.phone || localPhone || "").replace(/[^0-9]/g, "").length === 10
      ? (customerProfile.phone || localPhone)
      : "0911223344";
    setLocalPhone(correctPhone);
    setPhoneSharedStep("real");
    setToastMessage(
      isAmharic
        ? `✓ ስልክ ቁጥር ተጋርቷል፦ ${correctPhone}!`
        : `✓ Contact shared successfully: ${correctPhone}!`,
    );
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleShareLiveLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude.toFixed(4);
          const lng = position.coords.longitude.toFixed(4);
          setLocalAddress(`Shared GPS Location (${lat}° N, ${lng}° E)`);
        },
        (error) => {
          setLocalAddress("Shared GPS Location (9.0122° N, 38.7500° E)");
        },
      );
    } else {
      setLocalAddress("Shared GPS Location (9.0122° N, 38.7500° E)");
    }
  };

  const handleModifyQuantity = (itemId: string, delta: number) => {
    setSelectedItems((prev) => {
      const current = prev[itemId] || 0;
      const next = current + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      }
      return { ...prev, [itemId]: next };
    });
  };

  const handleClearSelection = () => {
    setSelectedItems({});
  };

  const handleSendSelection = () => {
    console.log("SUBMIT BUTTON CLICKED");
    const pDetails = localPackageDetails.trim();
    if (!pDetails) {
      setFormError(
        isAmharic
          ? "እባክዎን የትዕዛዙን ዝርዝር / ማብራሪያ ያስገቡ።"
          : "Please provide a description of the package or dishes you want delivered.",
      );
      return;
    }

    if (
      !localName.trim() ||
      !localPhone.trim() ||
      !localAddress.trim() ||
      !localPickupAddress.trim()
    ) {
      setFormError(
        isAmharic
          ? "እባክዎን ስም፣ ስልክ ቁጥር፣ መነሻ (Pick-Up) እና መድረሻ (Drop-Off) አድራሻዎችን በትክክል ያስገቡ።"
          : "Please provide Recipient Name, Phone, Pick-Up Location, and Drop-Off Address to build your preference ticket.",
      );
      return;
    }

    const cleanPhone = localPhone.replace(/[^0-9]/g, "");
    if (cleanPhone.length !== 10) {
      setFormError(
        isAmharic
          ? "እባክዎን በትክክል 10 አሃዝ ያለው ስልክ ቁጥር ያስገቡ (ለምሳሌ 0911234567)።"
          : "Phone contact number must have exactly 10 digits (e.g., 0911234567).",
      );
      return;
    }

    if (!localAddress.includes("Shared GPS")) {
      setFormError(
        isAmharic
          ? "የመድረሻ አድራሻ በትክክል መጋራት አለበት! እባክዎን 'አድራሻ አጋራ (GPS)' የሚለውን ቁልፍ ይጫኑ።"
          : "The drop-off coordinates must be shared! Please click the 'Share Live GPS Drop-off' button above.",
      );
      return;
    }

    if (!receiptPhoto) {
      setFormError(
        isAmharic
          ? "እባክዎን መጀመሪያ የክፍያ ማረጋገጫ ፎቶ ያስገቡ።"
          : "Please upload/choose a receipt screenshot file first to authorize payment.",
      );
      return;
    }

    setFormError(null);

    const itemsList = [
      `1 ${pDetails} (${localEstimatedPrice.toFixed(2)} Birr)`,
    ];

    // Build unified NLP text matching preferences interceptor perfectly including pick-up and drop-off
    const unifiedOrderMessage = `Please organize a ticket for: ${itemsList.join(", ")}.\n\nMy delivery profile parameters:\n👤 Name: ${localName.trim()}\n📞 Phone: ${localPhone.trim()}\n📍 Pick-Up Location: ${localPickupAddress.trim()}\n📍 Drop-Off Address: ${localAddress.trim()}`;
    console.log("SENDING MESSAGE", unifiedOrderMessage);
    onSendMessage(unifiedOrderMessage);
    setIsMenuOpen(false);
  };

  const renderInteractiveMenu = (
    isInsideWebApp: boolean,
    menuType:
      | "mountain"
      | "htown"
      | "sunny"
      | "rome"
      | "aroma"
      | "chanoly"
      | "neba"
      | "marti"
      | "yom"
      | "barcon"
      | "medi_shiro"
      | "lewi_piyasa"
      | "twins_kitchen"
      | "mohi_ertb"
      | "selam_special"
      | "cafe_9"
      | "liyu_taim"
      | "zanzibar"
      | "time_cafe"
      | "fenet_kitfo"
      | "bekos_pastry"
      | "light_burger"
      | "ana_cafe"
      | "safeland_cafe"
      | "addis_asa"
      | "chef_teketel"
      | "chef_dani"
      | "funche_shiro"
      | "habtsh"
      | "boss_fries"
      | "bliss_coffee"
      | "tina_faya"
      | "azi_hotel"
      | "abenezer_kurt"
      | "feven"
      | "abiy_filafil"
      | "tewedaj"
      | "yellow_burger"
      | "antsokiya"
      | "hibir"
      | "mamas_cheko"
      | "sunny_burger_2"
      | "rekik_coffee"
      | "emi_pizza"
      | "yahweh_nisse"
      | "mercy_fruit"
      | "taso_italian"
      | "colors_cafe"
      | "moonlight_restorant"
      | "nota_lounge"
      | "queen_kitchen"
      | "konjo_cake"
      | "jalebib_muslim",
  ) => {
    const menuData =
      menuType === "mountain"
        ? MOUNTAIN_HOTEL_MENU
        : menuType === "htown"
          ? HTOWN_MENU
          : menuType === "sunny"
            ? SUNNY_BURGER_MENU
            : menuType === "rome"
              ? ROME_1960_MENU
              : menuType === "aroma"
                ? AROMA_CAFE_MENU
                : menuType === "chanoly"
                  ? CHANOLY_NOODLES_MENU
                  : menuType === "neba"
                    ? NEBA_CAFE_MENU
                    : menuType === "marti"
                      ? MARTI_KITCHEN_MENU
                      : menuType === "barcon"
                        ? BARCON_MENU
                        : menuType === "medi_shiro"
                          ? MEDI_SHIRO_MENU
                          : menuType === "lewi_piyasa"
                            ? LEWI_PIYASA_MENU
                            : menuType === "twins_kitchen"
                              ? TWINS_KITCHEN_MENU
                              : menuType === "mohi_ertb"
                                ? MOHI_ERTB_MENU
                                : menuType === "selam_special"
                                  ? SELAM_SPECIAL_MENU
                                  : menuType === "cafe_9"
                                    ? CAFE_9_MENU
                                    : menuType === "liyu_taim"
                                      ? LIYU_TAIM_MENU
                                      : menuType === "zanzibar"
                                        ? ZANZIBAR_MENU
                                        : menuType === "time_cafe"
                                          ? TIME_CAFE_MENU
                                          : menuType === "fenet_kitfo"
                                            ? FENET_KITFO_MENU
                                            : menuType === "bekos_pastry"
                                              ? BEKOS_PASTRY_MENU
                                              : menuType === "light_burger"
                                                ? LIGHT_BURGER_MENU
                                                : menuType === "ana_cafe"
                                                  ? ANA_CAFE_MENU
                                                  : menuType === "safeland_cafe"
                                                    ? SAFELAND_CAFE_MENU
                                                    : menuType === "addis_asa"
                                                      ? ADDIS_ASA_MENU
                                                      : menuType ===
                                                          "chef_teketel"
                                                        ? CHEF_TEKETEL_MENU
                                                        : menuType ===
                                                            "chef_dani"
                                                          ? DANI_CHEF_MENU
                                                          : menuType ===
                                                              "funche_shiro"
                                                            ? FUNCHE_SHIRO_MENU
                                                            : menuType ===
                                                                "habtsh"
                                                              ? HABTSH_MENU
                                                              : menuType ===
                                                                  "boss_fries"
                                                                ? BOSS_FRIES_MENU
                                                                : menuType ===
                                                                    "bliss_coffee"
                                                                  ? BLISS_COFFEE_MENU
                                                                  : menuType ===
                                                                      "tina_faya"
                                                                    ? TINA_FAYA_MENU
                                                                    : menuType ===
                                                                        "azi_hotel"
                                                                      ? AZI_HOTEL_MENU
                                                                      : menuType ===
                                                                          "abenezer_kurt"
                                                                        ? ABENEZER_KURT_MENU
                                                                        : menuType ===
                                                                            "feven"
                                                                          ? FEVEN_RESTAURANT_MENU
                                                                          : menuType ===
                                                                              "abiy_filafil"
                                                                            ? ABIY_FILAFIL_MENU
                                                                            : menuType ===
                                                                                "tewedaj"
                                                                              ? TEWEDAJ_MENU
                                                                              : menuType ===
                                                                                  "yellow_burger"
                                                                                ? YELLOW_BURGER_MENU
                                                                                : menuType ===
                                                                                    "antsokiya"
                                                                                  ? ANTSOKIYA_MENU
                                                                                  : menuType ===
                                                                                      "hibir"
                                                                                    ? HIBIR_MENU
                                                                                    : menuType ===
                                                                                        "mamas_cheko"
                                                                                      ? MAMAS_CHEKO_MENU
                                                                                      : menuType ===
                                                                                          "sunny_burger_2"
                                                                                        ? SUNNY_BURGER_2_MENU
                                                                                        : menuType ===
                                                                                            "rekik_coffee"
                                                                                          ? REKIK_COFFEE_MENU
                                                                                          : menuType ===
                                                                                              "emi_pizza"
                                                                                            ? EMI_PIZZA_MENU
                                                                                            : menuType ===
                                                                                                "yahweh_nisse"
                                                                                              ? YAHWEH_NISSE_MENU
                                                                                              : menuType ===
                                                                                                  "mercy_fruit"
                                                                                                ? MERCY_FRUIT_MENU
                                                                                                : menuType ===
                                                                                                    "taso_italian"
                                                                                                  ? TASO_ITALIAN_MENU
                                                                                                  : menuType ===
                                                                                                      "colors_cafe"
                                                                                                    ? COLORS_CAFE_MENU
                                                                                                    : menuType ===
                                                                                                        "moonlight_restorant"
                                                                                                      ? MOONLIGHT_RESTORANT_MENU
                                                                                                      : menuType ===
                                                                                                          "nota_lounge"
                                                                                                        ? NOTA_LOUNGE_MENU
                                                                                                        : menuType === "queen_kitchen"
                                                                                                            ? QUEEN_KITCHEN_MENU
                                                                                                            : menuType === "konjo_cake"
                                                                                                              ? KONJO_CAKE_MENU
                                                                                                              : menuType === "jalebib_muslim"
                                                                                                                ? JALEBIB_MUSLIM_MENU
                                                                                                                : YOM_BURGERIZZA_MENU;

    const rawCategories =
      menuType === "yom"
        ? [
            "All",
            "Burger",
            "Pizza",
            "Shawarma",
            "Chicken",
            "Breakfast",
            "Sandwich",
            "Juice",
            "Local",
          ]
        : menuType === "marti"
          ? ["All", "Local", "Injera", "Breakfast", "Soft Drink", "Sandwich"]
          : menuType === "barcon" || menuType === "liyu_taim"
            ? ["All", "Injera", "Local", "Pasta", "Breakfast"]
            : menuType === "medi_shiro"
              ? ["All", "Injera", "Local", "Traditional Foods", "Pasta"]
              : menuType === "lewi_piyasa"
                ? [
                    "All",
                    "Burger",
                    "Breakfast",
                    "Local",
                    "Pizza",
                    "Lazagna",
                    "Fish",
                    "Sandwich",
                    "Juice",
                  ]
                : menuType === "twins_kitchen"
                  ? ["All", "Local", "Breakfast"]
                  : menuType === "mohi_ertb"
                    ? ["All", "Sandwich", "Injera", "Pasta"]
                    : menuType === "selam_special"
                      ? ["All", "Local"]
                      : menuType === "chef_dani"
                        ? ["All", "Shawarma"]
                        : menuType === "funche_shiro"
                          ? ["All", "እንጀራ", "Habeshan", "Pasta"]
                          : menuType === "cafe_9"
                            ? [
                                "All",
                                "Local",
                                "Sandwich",
                                "Pizza",
                                "Breakfast",
                                "Burger",
                                "Fish",
                                "Juice",
                                "Shawarma",
                              ]
                            : menuType === "zanzibar"
                              ? [
                                  "All",
                                  "Fish",
                                  "Local",
                                  "Juice",
                                  "Pizza",
                                  "Sandwich",
                                  "Breakfast",
                                  "Burger",
                                  "Chicken",
                                ]
                              : menuType === "time_cafe"
                                ? ["All", "Sandwich", "Pizza", "Burger", "Cake"]
                                : menuType === "fenet_kitfo" ||
                                    menuType === "tina_faya" ||
                                    menuType === "azi_hotel"
                                  ? ["All", "Traditional Foods", "Habeshan"]
                                  : menuType === "bekos_pastry"
                                    ? [
                                        "All",
                                        "Cake",
                                        "Pizza",
                                        "Breakfast",
                                        "Burger",
                                      ]
                                    : menuType === "light_burger"
                                      ? [
                                          "All",
                                          "Burger",
                                          "Cake",
                                          "Chicken",
                                          "Sandwich",
                                          "Pizza",
                                          "Breakfast",
                                        ]
                                      : menuType === "ana_cafe"
                                        ? [
                                            "All",
                                            "Sandwich",
                                            "Chicken",
                                            "Shawarma",
                                            "Burger",
                                            "Fish",
                                            "እንጀራ",
                                            "Pizza",
                                          ]
                                        : menuType === "safeland_cafe"
                                          ? [
                                              "All",
                                              "Burger",
                                              "Cake",
                                              "Chicken",
                                              "Juice",
                                              "Pizza",
                                              "Shawarma",
                                              "Breakfast",
                                            ]
                                          : menuType === "addis_asa"
                                            ? ["All", "Fish"]
                                            : menuType === "chef_teketel"
                                              ? ["All", "Habeshan"]
                                              : menuType === "feven"
                                                ? ["All", "Habeshan"]
                                                : menuType === "abiy_filafil"
                                                  ? [
                                                      "All",
                                                      "Breakfast",
                                                      "Burger",
                                                      "Shawarma",
                                                    ]
                                                  : menuType === "tewedaj"
                                                    ? [
                                                        "All",
                                                        "እንጀራ",
                                                        "Habeshan",
                                                      ]
                                                    : menuType ===
                                                        "yellow_burger"
                                                      ? [
                                                          "All",
                                                          "Burger",
                                                          "Pizza",
                                                          "Juice",
                                                          "Breakfast",
                                                          "Sandwich",
                                                        ]
                                                      : menuType === "antsokiya"
                                                        ? [
                                                            "All",
                                                            "Habeshan",
                                                            "እንጀራ",
                                                            "Traditional Foods",
                                                          ]
                                                        : menuType === "hibir"
                                                          ? [
                                                              "All",
                                                              "Burger",
                                                              "Pizza",
                                                              "Lazagna",
                                                              "Sandwich",
                                                              "Juice",
                                                              "Habeshan",
                                                            ]
                                                          : menuType ===
                                                              "mamas_cheko"
                                                            ? ["All", "Cake"]
                                                            : menuType ===
                                                                "sunny_burger_2"
                                                              ? [
                                                                  "All",
                                                                  "Burger",
                                                                  "Juice",
                                                                  "Sandwich",
                                                                  "Pizza",
                                                                  "Shawarma",
                                                                ]
                                                              : menuType ===
                                                                  "rekik_coffee"
                                                                ? [
                                                                    "All",
                                                                    "Habeshan",
                                                                  ]
                                                                : menuType ===
                                                                    "emi_pizza"
                                                                  ? [
                                                                      "All",
                                                                      "Pizza",
                                                                      "Juice",
                                                                      "Shawarma",
                                                                      "Burger",
                                                                      "Sandwich",
                                                                      "Cake",
                                                                    ]
                                                                  : menuType ===
                                                                      "yahweh_nisse"
                                                                    ? [
                                                                        "All",
                                                                        "Habeshan",
                                                                      ]
                                                                    : menuType ===
                                                                        "mercy_fruit"
                                                                      ? [
                                                                          "All",
                                                                          "Juice",
                                                                          "Breakfast",
                                                                          "Habeshan",
                                                                        ]
                                                                      : menuType ===
                                                                          "taso_italian"
                                                                        ? [
                                                                            "All",
                                                                            "Lazagna",
                                                                            "Cake",
                                                                            "Burger",
                                                                            "Pizza",
                                                                            "Ice Cream",
                                                                            "Sandwich",
                                                                            "Habeshan",
                                                                            "Breakfast",
                                                                          ]
                                                                        : menuType === "colors_cafe" ? ["All", "Cake"] : menuType === "moonlight_restorant" ? ["All", "Chicken"] : menuType === "nota_lounge" ? ["All", "Burger"] : menuType === "queen_kitchen" ? ["All"] : menuType === "konjo_cake" ? ["All", "Cake"] : menuType === "jalebib_muslim" ? ["All", "Habeshan"] : [
                                                                      "All",
                                                                      "Noodles",
                                                                      "Pizza",
                                                                      "Burger",
                                                                      "Juice",
                                                                      "Sandwich",
                                                                      "Shawarma",
                                                                      "Chicken",
                                                                      "Breakfast",
                                                                      "Coffee",
                                                                      "Pasta",
                                                                      "Soft Drink",
                                                                      "Cake",
                                                                      "Pastry",
                                                                    ];

    const categories = rawCategories.filter(
      (cat) =>
        cat === "All" ||
        (menuData && menuData[cat] && menuData[cat].length > 0),
    );

    const getStoreDetails = () => {
      switch (menuType) {
        case "mountain":
          return {
            title: "⛰️ Mountain Hotel Live Menu",
            desc: isAmharic
              ? "ከምርጦቹ ምርጫዎች ይምረጡ (በገጽ 10 እቃዎች)፦"
              : "Select from Mountain Hotel's premium offerings (10 per page):",
          };
        case "htown":
          return {
            title: "🍔 H-Town Burger Premium Menu",
            desc: isAmharic
              ? "ከኤች-ታውን ሲግኔቸር ምርጫዎች ይምረጡ (በገጽ 10 እቃዎች)፦"
              : "Select from H-Town Burger's signature recipes (10 per page):",
          };
        case "sunny":
          return {
            title: "🍔 Sunny Burger Premium Menu",
            desc: isAmharic
              ? "ከአሮማ ካፌ ምርጥ ምርጫዎች ይምረጡ (በገጽ 10 እቃዎች)፦"
              : "Select from Sunny Burger's signature recipes (10 per page):",
          };
        case "rome":
          return {
            title: "🇮🇹 Rome 1960 Cafe Premium Menu",
            desc: isAmharic
              ? "ከሮም 1960 ምርጥ የጣሊያን ምርጫዎች ይምረጡ (በገጽ 10 እቃዎች)፦"
              : "Select from Rome 1960's fine Italian selections (10 per page):",
          };
        case "aroma":
          return {
            title: "☕ Aroma Cafe Premium Menu",
            desc: isAmharic
              ? "ከአሮማ ካፌ ምርጥ ምርጫዎች ይምረጡ (በገጽ 10 እቃዎች)፦"
              : "Select from Aroma Cafe's finest selections (10 per page):",
          };
        case "chanoly":
          return {
            title: "🍜 Chanoly Noodles Premium Menu",
            desc: isAmharic
              ? "ከቻኖሊ ኑድል ምርጥ ምርጫዎች ይምረጡ (በገጽ 10 እቃዎች)፦"
              : "Select from Chanoly Noodles' high-quality selections (10 per page):",
          };
        case "neba":
          return {
            title: "🍔 Neba Cafe Premium Menu",
            desc: isAmharic
              ? "ከነባ ካፌ ምርጥ ምርጫዎች ይምረጡ (በገጽ 10 እቃዎች)፦"
              : "Select from Neba Cafe's finest selections (10 per page):",
          };
        case "yom":
          return {
            title: "🍔 YOM Burgerizza Premium Menu",
            desc: isAmharic
              ? "ከየም በርገሪዛ ምርጥ ምርጫዎች ይምረጡ (በገጽ 10 እቃዎች)፦"
              : "Select from YOM Burgerizza's finest selections (10 per page):",
          };
        case "barcon":
          return {
            title: "🥘 Barkon ምግብ ቤት Premium Menu",
            desc: isAmharic
              ? "ከባርኮን ምግብ ቤት ምርጥ ምርጫዎች ይምረጡ (በገጽ 20 እቃዎች)፦"
              : "Select an item to add (20 per page):",
          };
        case "liyu_taim":
          return {
            title: "🥘 Liyu Taim (ልዩ ጣዕም) Premium Menu",
            desc: isAmharic
              ? "ከሊዩ ጣዕም ምርጥ ምርጫዎች ይምረጡ (በገጽ 20 እቃዎች)፦"
              : "Select an item to add (20 per page):",
          };
        case "zanzibar":
          return {
            title: "🥘 Zanzibar Kitchen Premium Menu",
            desc: isAmharic
              ? "ከዛንዚባር ምርጥ ምርጫዎች ይምረጡ (በገጽ 20 እቃዎች)፦"
              : "Select an item to add (20 per page):",
          };
        case "medi_shiro":
          return {
            title: "🥘 Medi Shiro Premium Menu",
            desc: isAmharic
              ? "ከሜዲ ሽሮ ምግብ ቤት ምርጥ ምርጫዎች ይምረጡ (በገጽ 20 እቃዎች)፦"
              : "Select an item to add (20 per page):",
          };
        case "lewi_piyasa":
          return {
            title: "🍕 Lewi Piyassa Premium Menu",
            desc: isAmharic
              ? "ከሌዊ ፒያሳ ይምረጡ (በገጽ 20 እቃዎች)፦"
              : "Select an item to add (20 per page):",
          };
        case "twins_kitchen":
          return {
            title: "🥘 Twin's Kitchen Premium Menu",
            desc: isAmharic
              ? "ከቱዊንስ ኪችን ይምረጡ (በገጽ 20 እቃዎች)፦"
              : "Select an item to add (20 per page):",
          };
        case "mohi_ertb":
          return {
            title: "🥘 Mohi Ertb Premium Menu",
            desc: isAmharic
              ? "ከሞሂ እርጥብ ይምረጡ (በገጽ 20 እቃዎች)፦"
              : "Select an item to add (20 per page):",
          };
        case "selam_special":
          return {
            title: "🥘 Selam Special Premium Menu",
            desc: isAmharic
              ? "ከሰላም ስፔሻል ይምረጡ (በገጽ 20 እቃዎች)፦"
              : "Select an item to add (20 per page):",
          };
        case "cafe_9":
          return {
            title: "🥘 Cafe 9 Premium Menu",
            desc: isAmharic
              ? "ከካፌ 9 ምረጡ (በገጽ 20 እቃዎች)፦"
              : "Select an item to add (20 per page):",
          };
        case "time_cafe":
          return {
            title: "☕ It's Time Cafe Premium Menu",
            desc: isAmharic
              ? "ከኢትስ ታይም ካፌ ይምረጡ (በገጽ 20 እቃዎች)፦"
              : "Select an item to add (20 per page):",
          };
        case "fenet_kitfo":
          return {
            title: "🥘 Fenet Kitfo Premium Menu",
            desc: isAmharic
              ? "ከፌነት ክትፎ ይምረጡ (በገጽ 20 እቃዎች)፦"
              : "Select an item to add (20 per page):",
          };
        case "bekos_pastry":
          return {
            title: "🍰 Bekos Pastry Premium Menu",
            desc: isAmharic
              ? "ከቤኮስ ፔስትሪ ይምረጡ (በገጽ 20 እቃዎች)፦"
              : "Select an item to add (20 per page):",
          };
        case "light_burger":
          return {
            title: "🍔 Light Burger Premium Menu",
            desc: isAmharic
              ? "ከላይት በርገር ይምረጡ (በገጽ 20 እቃዎች)፦"
              : "Select an item to add (20 per page):",
          };
        case "ana_cafe":
          return {
            title: "🍽️ Ana Cafe Premium Menu",
            desc: isAmharic
              ? "ከአና ካፌ ይምረጡ (በገጽ 20 እቃዎች)፦"
              : "Select an item to add (20 per page):",
          };
        case "safeland_cafe":
          return {
            title: "🍔 Safeland Cafe Premium Menu",
            desc: isAmharic
              ? "ከሴፍላንድ ካፌ ይምረጡ (በገጽ 20 እቃዎች)፦"
              : "Select an item to add (20 per page):",
          };
        case "addis_asa":
          return {
            title: "🐠 Addis Asa Premium Menu",
            desc: isAmharic
              ? "ከአዲስ ዓሳ ይምረጡ (በገጽ 20 እቃዎች)፦"
              : "Select an item to add (20 per page):",
          };
        case "chef_teketel":
          return {
            title: "👩‍🍳 Chef Teketel Premium Menu",
            desc: isAmharic
              ? "ከሼፍ ተከተል ይምረጡ (በገጽ 20 እቃዎች)፦"
              : "Select an item to add (20 per page):",
          };
        case "chef_dani":
          return {
            title: "👩‍🍳 Chef Dani Premium Menu",
            desc: isAmharic
              ? "ከሼፍ ዳኒ ይምረጡ (በገጽ 20 እቃዎች)፦"
              : "Select an item to add (20 per page):",
          };
        case "funche_shiro":
          return {
            title: "🥘 Funche shiro Premium Menu",
            desc: isAmharic
              ? "ከፉንቼ ሽሮ ይምረጡ (በገጽ 20 እቃዎች)፦"
              : "Select an item to add (20 per page):",
          };
        case "tina_faya":
          return {
            title: "🥘 Tina Faaya Kitfo Premium Menu",
            desc: isAmharic
              ? "ከቲና ፋያ ኪትፎ ይምረጡ (በገጽ 20 እቃዎች)፦"
              : "Select an item to add (20 per page):",
          };
        case "azi_hotel":
          return {
            title: "🏨 Azi Hotel Premium Menu",
            desc: isAmharic
              ? "ከአዚ ሆቴል ይምረጡ (በገጽ 20 እቃዎች)፦"
              : "Select an item to add (20 per page):",
          };
        case "abenezer_kurt":
          return {
            title: "🥩 Abenezer Kurt Ena Kitfo Premium Menu",
            desc: isAmharic
              ? "ከአቤኔዘር ቁርጥ ይምረጡ (በገጽ 20 እቃዎች)፦"
              : "Select an item to add (20 per page):",
          };
        case "feven":
          return {
            title: "🥘 Feven Restaurant Premium Menu",
            desc: isAmharic
              ? "ከፈቨን ሬስቶራንት ይምረጡ (በገጽ 20 እቃዎች)፦"
              : "Select an item to add (20 per page):",
          };
        case "abiy_filafil":
          return {
            title: "🧆 Abiy Filafil Combined Menu",
            desc: isAmharic
              ? "ከአብይ ፊላፊል ይምረጡ (በገጽ 20 እቃዎች)፦"
              : "Select an item to add (20 per page):",
          };
        case "tewedaj":
          return {
            title: "🥘 Tewedaj Premium Menu",
            desc: isAmharic
              ? "ከተወዳጅ ምግብ ቤት ይምረጡ (በገጽ 20 እቃዎች)፦"
              : "Select an item to add (20 per page):",
          };
        case "yellow_burger":
          return {
            title: "🍔 Yellow Burger & Pizza Combined Menu",
            desc: isAmharic
              ? "ከየሎው በርገር እና ፒዛ ይምረጡ (በገጽ 20 እቃዎች)፦"
              : "Select an item to add (20 per page):",
          };
        case "antsokiya":
          return {
            title: "🥘 Antsokiya Traditional Food Premium Menu",
            desc: isAmharic
              ? "ከአንጾኪያ ባህላዊ ምግቦች ይምረጡ (በገጽ 20 እቃዎች)፦"
              : "Select an item to add (20 per page):",
          };
        case "hibir":
          return {
            title: "☕ Hibir Cafe & Restorant Premium Menu",
            desc: isAmharic
              ? "ከህብር ካፌ ምርጫዎች ይምረጡ (በገጽ 20 እቃዎች)፦"
              : "Select an item to add (20 per page):",
          };
        case "mamas_cheko":
          return {
            title: "🍰 Mama's Cheko Bar Premium Menu",
            desc: isAmharic
              ? "ከማማስ ቼኮ ባር ይምረጡ (በገጽ 20 እቃዎች)፦"
              : "Select an item to add (20 per page):",
          };
        case "sunny_burger_2":
          return {
            title: "☀️ Sunny burger #2 Premium Menu",
            desc: isAmharic
              ? "ከሳኒ በርገር #2 ይምረጡ (በገጽ 20 እቃዎች)፦"
              : "Select an item to add (20 per page):",
          };
        case "rekik_coffee":
          return {
            title: "☕ Rekik Coffee Premium Menu",
            desc: isAmharic
              ? "ከረቂቅ ኮፊ ምርጫዎች ይምረጡ (በገጽ 20 እቃዎች)፦"
              : "Select an item to add (20 per page):",
          };
        case "emi_pizza":
          return {
            title: "🍕 Emi Pizza Premium Menu",
            desc: isAmharic
              ? "ከእሚ ፒዛ ምርጫዎች ይምረጡ (በገጽ 20 እቃዎች)፦"
              : "Select an item to add (20 per page):",
          };
        case "yahweh_nisse":
          return {
            title: "🥘 Yahiw Nisse Premium Menu",
            desc: isAmharic
              ? "ከያሂው ኒሴ ምርጫዎች ይምረጡ (በገጽ 20 እቃዎች)፦"
              : "Select an item to add (20 per page):",
          };
        case "mercy_fruit":
          return {
            title: "🍹 Mercy Fruit Premium Menu",
            desc: isAmharic
              ? "ከመርሲ ፍሩት ምርጫዎች ይምረጡ (በገጽ 20 እቃዎች)፦"
              : "Select an item to add (20 per page):",
          };
        case "taso_italian":
          return {
            title: "🍦 Taso Italian Premium Menu",
            desc: isAmharic
              ? "ከታሶ ኢታሊያን ምርጫዎች ይምረጡ (በገጽ 20 እቃዎች)፦"
              : "Select an item to add (20 per page):",
          };
        case "colors_cafe":
          return {
            title: "🍰 Colors Cafe Premium Menu",
            desc: isAmharic
              ? "ከከለርስ ካፌ ምርጫዎች ይምረጡ (በገጽ 20 እቃዎች)፦"
              : "Select an item to add (20 per page):",
          };
        case "moonlight_restorant":
          return {
            title: "🌙 Moonlight Restorant Premium Menu",
            desc: isAmharic
              ? "ከሙንላይት ሬስቶራንት ምርጫዎች ይምረጡ (በገጽ 20 እቃዎች)፦"
              : "Select an item to add (20 per page):",
          };
        case "nota_lounge":
          return {
            title: "🍔 Nota Lounge Premium Menu",
            desc: isAmharic
              ? "ከኖታ ላውንጅ ምርጫዎች ይምረጡ (በገጽ 20 እቃዎች)፦"
              : "Select an item to add (20 per page):",
          };
        case "queen_kitchen":
          return {
            title: "👑 Queen Kitchen Premium Menu",
            desc: isAmharic
              ? "ከኩዊን ኪችን ምርጫዎች ይምረጡ (በገጽ 20 እቃዎች)፦"
              : "Select an item to add (20 per page):",
          };
        case "konjo_cake":
          return {
            title: "🍰 Konjo Cake Premium Menu",
            desc: isAmharic
              ? "ከኮንጆ ኬክ ምርጫዎች ይምረጡ (በገጽ 20 እቃዎች)፦"
              : "Select an item to add (20 per page):",
          };
        case "jalebib_muslim":
          return {
            title: "🍲 ጃለቢብ የሙስሊም ሬስቶራንት Premium Menu",
            desc: isAmharic
              ? "ከጃለቢብ የሙስሊም ሬስቶራንት ምርጫዎች ይምረጡ (በገጽ 20 እቃዎች)፦"
              : "Select an item to add (20 per page):",
          };
        case "marti":
        default:
          return {
            title: "🥘 Marti Kitchen Premium Menu",
            desc: isAmharic
              ? "ከማርት ኪችን ምርጥ ምርጫዎች ይምረጡ (በገጽ 10 እቃዎች)፦"
              : "Select from Marti Kitchen's premium local & international dishes (10 per page):",
          };
      }
    };

    const details = getStoreDetails();

    const storeMeta = getStoreMeta(
      menuType === "mountain"
        ? "Mountain Hotel"
        : menuType === "htown"
          ? "H-Town Burger"
          : menuType === "sunny"
            ? "Sunny Burger"
            : menuType === "rome"
              ? "Rome 1960 Cafe"
              : menuType === "aroma"
                ? "Aroma cafe"
                : menuType === "chanoly"
                  ? "Chanoly Noodles"
                  : menuType === "neba"
                    ? "Neba Cafe"
                    : menuType === "marti"
                      ? "Marti kitchen"
                      : menuType === "barcon"
                        ? "Barcon Migb Bet"
                        : menuType === "medi_shiro"
                          ? "medi shiro"
                          : menuType === "lewi_piyasa"
                            ? "Lewi piyasa"
                            : menuType === "twins_kitchen"
                              ? "Twin's Kitchen"
                              : menuType === "mohi_ertb"
                                ? "Mohi Ertb"
                                : menuType === "selam_special"
                                  ? "selam special"
                                  : menuType === "cafe_9"
                                    ? "Cafe 9"
                                    : menuType === "time_cafe"
                                      ? "Time Cafe"
                                      : menuType === "fenet_kitfo"
                                        ? "fenet kitfo"
                                        : menuType === "bekos_pastry"
                                          ? "Bekos Pastry"
                                          : menuType === "light_burger"
                                            ? "Light Burger"
                                            : menuType === "ana_cafe"
                                              ? "Ana Cafe"
                                              : menuType === "safeland_cafe"
                                                ? "SAFELAND CAFE Piasa"
                                                : menuType === "liyu_taim"
                                                  ? "Liyu Taim (ልዩ ጣዕም)"
                                                  : menuType === "zanzibar"
                                                    ? "Zanzibar kitchen"
                                                    : menuType === "addis_asa"
                                                      ? "Addis Asa"
                                                      : menuType ===
                                                          "chef_teketel"
                                                        ? "Chef Teketel"
                                                        : menuType ===
                                                            "chef_dani"
                                                          ? "DANI CHEF"
                                                          : menuType ===
                                                              "funche_shiro"
                                                            ? "Funche shiro"
                                                            : menuType ===
                                                                "tina_faya"
                                                              ? "Tina Faaya Kitfo"
                                                              : menuType ===
                                                                  "azi_hotel"
                                                                ? "Azi Hotel"
                                                                : menuType ===
                                                                    "abenezer_kurt"
                                                                  ? "Abenezer Kurt Ena Kitfo"
                                                                  : menuType ===
                                                                      "feven"
                                                                    ? "Feven Restaurant"
                                                                    : menuType ===
                                                                        "abiy_filafil"
                                                                      ? "Abiy Filafil"
                                                                      : menuType ===
                                                                          "tewedaj"
                                                                        ? "Tewedaj"
                                                                        : menuType ===
                                                                            "yellow_burger"
                                                                          ? "Yellow Burger & Pizza"
                                                                          : menuType ===
                                                                              "antsokiya"
                                                                            ? "Antsokiya Traditional Food"
                                                                            : menuType ===
                                                                                "hibir"
                                                                              ? "Hibir Cafe & Restorant"
                                                                              : menuType ===
                                                                                  "mamas_cheko"
                                                                                ? "Mama's Cheko Bar"
                                                                                : menuType ===
                                                                                    "sunny_burger_2"
                                                                                  ? "Sunny burger #2"
                                                                                  : menuType ===
                                                                                      "rekik_coffee"
                                                                                    ? "Rekik Coffee"
                                                                                    : menuType ===
                                                                                        "emi_pizza"
                                                                                      ? "Emi Pizza"
                                                                                      : menuType ===
                                                                                          "yahweh_nisse"
                                                                                        ? "Yahiw Nisse Cafe & Restaurant"
                                                                                        : menuType ===
                                                                                            "mercy_fruit"
                                                                                          ? "Mercy Fruit Salad"
                                                                                          : menuType ===
                                                                                              "taso_italian" ? "Taso Italian ice cream and Cafe" : menuType === "colors_cafe" ? "Colors Cafe" : menuType === "moonlight_restorant" ? "Moonlight Restorant" : menuType === "nota_lounge" ? "Nota Lounge" : menuType === "queen_kitchen" ? "Queen of the kitchen" : menuType === "konjo_cake" ? "Konjo Cake" : menuType === "jalebib_muslim" ? "ጃለቢብ የሙስሊም ሬስቶራንት" : "YOM BURGERIZZA",
    );

    const getThemeColors = () => {
      const activeTheme = CENTRAL_RESTAURANT_THEMES[menuType] || {
        primary: "#5E9D6E",
        primaryHover: "#4F8A5E",
        primaryRgb: "94, 157, 110",
      };

      return {
        primary: activeTheme.primary,
        primaryHover: activeTheme.primaryHover,
        primaryBg: "bg-[rgba(var(--brand-primary-rgb),0.06)]",
        primaryBorder: "border-[rgba(var(--brand-primary-rgb),0.18)]",
        primaryText: "text-[var(--brand-primary)]",
        textAccent: "text-[var(--brand-primary)]",
        itemCardBorderHover: "hover:border-[var(--brand-primary)]",
        cartGradient:
          "from-[var(--brand-primary-hover)] to-[var(--brand-primary)]",
        headerBg:
          "bg-white text-slate-800 border-b border-[rgba(var(--brand-primary-rgb),0.12)]",
        headerTag:
          "bg-[rgba(var(--brand-primary-rgb),0.06)] text-[var(--brand-primary)] border-[rgba(var(--brand-primary-rgb),0.18)]",
        catButtonSelected:
          "bg-[var(--brand-primary)] text-white border-[var(--brand-primary)] shadow-sm",
        btnSubmit:
          "bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] border-[var(--brand-primary)] text-white uppercase tracking-wider font-extrabold shadow-md hover:shadow-lg hover:-translate-y-0.5",
        badgeColor:
          "text-[var(--brand-primary)] bg-[rgba(var(--brand-primary-rgb),0.06)] border-[rgba(var(--brand-primary-rgb),0.18)]",
        itemCardBg:
          "bg-white border border-slate-200/85 hover:border-[var(--brand-primary)] hover:-translate-y-0.5 shadow-3xs",
        qtyCircleBg: "bg-[var(--brand-primary)]",
        textPrice: "text-[var(--brand-primary)]",
        textGroupHover: "group-hover:text-[var(--brand-primary)]",
        btnHoverText: "hover:text-[var(--brand-primary)] border-slate-250",
        buttonMainBg:
          "bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)]",
      };
    };
    const colors = getThemeColors();

    const theme = {
      title: details.title,
      desc: details.desc,
      headerBg: colors.headerBg,
      headerTag: colors.headerTag,
      catContainer: "bg-white border border-slate-100 shadow-2xs",
      catButtonSelected: colors.catButtonSelected,
      catButtonInactive:
        "bg-white hover:bg-slate-50 text-slate-600 border-slate-200",
      itemCardBg: colors.itemCardBg,
      badgeColor: colors.badgeColor,
      cartSummaryBg: `bg-gradient-to-r ${colors.cartGradient} text-white border-none shadow-md`,
      qtyActionsBg: "bg-slate-50 border border-slate-200",
      btnBack:
        "bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-2xs hover:-translate-y-0.5",
      btnCancel:
        "bg-slate-100 hover:bg-slate-250 border-slate-200 text-slate-700 shadow-2xs hover:-translate-y-0.5",
      btnSubmit: colors.btnSubmit,
      itemNameText: "text-slate-900 font-bold",
      itemPriceText: `${colors.primaryText} font-extrabold`,
      btnActiveBg: "hover:bg-slate-50",
      itemQtyText: "text-slate-900 font-extrabold",
      scrollbarColor:
        "scrollbar-thin scrollbar-track-slate-100 scrollbar-thumb-slate-200",
      listContainerBg: "bg-slate-50/50 border-slate-200/50",
    };

    let itemsToDisplay: { name: string; price: number }[] = [];
    if (mountainCategory === "All") {
      itemsToDisplay = Object.values(menuData).flat();
    } else {
      itemsToDisplay = menuData[mountainCategory] || [];
    }

    // Merge Chukame Betibis items for Tina Faya and Azi Hotel
    const isChukameStore = menuType === "tina_faya" || menuType === "azi_hotel";
    if (isChukameStore) {
      const filtered = itemsToDisplay.filter(
        (it) =>
          it.name !== "Chukame Betibis(ጨካሜ በትቢስ) with እርጎ" &&
          it.name !== "Chukame Betibis(ጨካሜ በትቢስ) without እርጎ",
      );
      const hasChukameInOriginal = itemsToDisplay.some(
        (it) =>
          it.name === "Chukame Betibis(ጨካሜ በትቢስ) with እርጎ" ||
          it.name === "Chukame Betibis(ጨካሜ በትቢስ) without እርጎ",
      );
      if (hasChukameInOriginal) {
        filtered.push({ name: "Chukame Betibis(ጨካሜ በትቢስ)", price: 850.0 });
      }
      itemsToDisplay = filtered;
    }

    // Sort items alphabetically
    const sortedItems = [...itemsToDisplay].sort((a, b) =>
      a.name.localeCompare(b.name),
    );

    // Handle 10 entries per page pagination
    const itemsPerPage = 10;
    const totalPages = Math.ceil(sortedItems.length / itemsPerPage);
    const activePage = menuPage < totalPages ? menuPage : 0;
    const paginatedItems = sortedItems.slice(
      activePage * itemsPerPage,
      (activePage + 1) * itemsPerPage,
    );

    const getChukameQty = () => {
      return (
        (mountainSelected["Chukame Betibis(ጨካሜ በትቢስ) with እርጎ"] || 0) +
        (mountainSelected["Chukame Betibis(ጨካሜ በትቢስ) without እርጎ"] || 0)
      );
    };

    const handleToggleItem = (item: { name: string; price: number }) => {
      if (item.name === "Chukame Betibis(ጨካሜ በትቢስ)") {
        setChukameModal({
          isOpen: true,
          storeName: menuType === "tina_faya" ? "tina_faya" : "azi_hotel",
        });
        return;
      }
      setMountainSelected((prev) => {
        const qty = prev[item.name] || 0;
        return { ...prev, [item.name]: qty + 1 };
      });
      setToastMessage(`✓ Added ${item.name}!`);
      setTimeout(() => setToastMessage(null), 1500);
    };

    const handleDecrementItem = (item: { name: string; price: number }) => {
      if (item.name === "Chukame Betibis(ጨካሜ በትቢስ)") {
        const withYogurtQty =
          mountainSelected["Chukame Betibis(ጨካሜ በትቢስ) with እርጎ"] || 0;
        const withoutYogurtQty =
          mountainSelected["Chukame Betibis(ጨካሜ በትቢስ) without እርጎ"] || 0;
        if (withYogurtQty > 0 && withoutYogurtQty > 0) {
          setChukameModal({
            isOpen: true,
            storeName: menuType === "tina_faya" ? "tina_faya" : "azi_hotel",
          });
        } else if (withYogurtQty > 0) {
          setMountainSelected((prev) => {
            const updated = { ...prev };
            if (withYogurtQty <= 1) {
              delete updated["Chukame Betibis(ጨካሜ በትቢስ) with እርጎ"];
            } else {
              updated["Chukame Betibis(ጨካሜ በትቢስ) with እርጎ"] = withYogurtQty - 1;
            }
            return updated;
          });
          setToastMessage("Removed 1 Chukame Betibis with እርጎ");
          setTimeout(() => setToastMessage(null), 1500);
        } else if (withoutYogurtQty > 0) {
          setMountainSelected((prev) => {
            const updated = { ...prev };
            if (withoutYogurtQty <= 1) {
              delete updated["Chukame Betibis(ጨካሜ በትቢስ) without እርጎ"];
            } else {
              updated["Chukame Betibis(ጨካሜ በትቢስ) without እርጎ"] =
                withoutYogurtQty - 1;
            }
            return updated;
          });
          setToastMessage("Removed 1 Chukame Betibis without እርጎ");
          setTimeout(() => setToastMessage(null), 1500);
        }
        return;
      }
      setMountainSelected((prev) => {
        const qty = prev[item.name] || 0;
        if (qty <= 1) {
          const updated = { ...prev };
          delete updated[item.name];
          return updated;
        }
        return { ...prev, [item.name]: qty - 1 };
      });
    };

    const totalSelectedCount = (
      Object.values(mountainSelected) as number[]
    ).reduce((a, b) => a + b, 0);
    const totalPrice = (
      Object.entries(mountainSelected) as [string, number][]
    ).reduce((sum, [name, qty]) => {
      const allItems = Object.values(menuData).flat();
      const match = allItems.find((it) => it.name === name);
      return sum + (match ? match.price * qty : 0);
    }, 0);

    const handleBackOrderMenu = () => {
      if (isInsideWebApp) {
        setWebAppKeyboard("stores_p1");
      } else {
        setTgKeyboard("stores_p1");
      }
    };

    const handleCancelOrderMenu = () => {
      setMountainSelected({});
      if (isInsideWebApp) {
        setWebAppKeyboard("main");
        setIsMenuOpen(false);
      } else {
        setTgKeyboard("main");
      }
    };

    const handleSubmitOrderMenu = () => {
      if (isClosed) {
        setToastMessage(
          isAmharic
            ? "⚠️ ቶሎ ማዘዣ ተዘግቷል! የሥራ ሰዓታችን ከምሽቱ 2:00 (20:00) ያበቃል።"
            : "⚠️ Tollo Delivery is closed! Our operating hours are before 20:00 PM."
        );
        setTimeout(() => setToastMessage(null), 4000);
        return;
      }

      if (totalSelectedCount === 0) {
        setToastMessage("⚠️ Please select at least one item first!");
        setTimeout(() => setToastMessage(null), 3000);
        return;
      }

      const itemsList = Object.entries(mountainSelected).map(([name, qty]) => {
        const allItems = Object.values(menuData).flat();
        const match = allItems.find((it) => it.name === name);
        const itemPrice = match ? match.price : 0;
        return `${qty} ${name} (${itemPrice.toFixed(2)} Birr)`;
      });

      const nameText = customerProfile.name || localName;
      const phoneText = customerProfile.phone || localPhone;
      const dropAddress = customerProfile.address || localAddress;

      if (!nameText.trim() || nameText.trim() === "Valued Customer" || !phoneText.trim() || !dropAddress.trim()) {
        setToastMessage(
          isAmharic
            ? "⚠️ እባክዎን ማዘዙን ከመቀጠልዎ በፊት ስምዎን፣ ስልክ ቁጥርዎን እና መድረሻ አድራሻዎን ያስገቡ ወይም ያጋሩ!"
            : "⚠️ Please enter your name, phone number, and drop-off address before submitting!"
        );
        setTimeout(() => setToastMessage(null), 4000);
        return;
      }

      const cleanPhone = phoneText.replace(/[^0-9]/g, "");
      if (cleanPhone.length !== 10) {
        setToastMessage(
          isAmharic
            ? "⚠️ እባክዎን በትክክል 10 አሃዝ ያለው ስልክ ቁጥር ያስገቡ (ለምሳሌ 0911234567)!"
            : "⚠️ Phone contact number must have exactly 10 digits (e.g., 0911234567)!"
        );
        setTimeout(() => setToastMessage(null), 4000);
        return;
      }
      const pickupAddress =
        menuType === "mountain"
          ? "Mountain Hotel"
          : menuType === "htown"
            ? "H-Town Burger"
            : menuType === "sunny"
              ? "Sunny Burger"
              : menuType === "rome"
                ? "Rome 1960 Cafe"
                : menuType === "aroma"
                  ? "Aroma cafe"
                  : menuType === "chanoly"
                    ? "Chanoly Noodles"
                    : menuType === "neba"
                      ? "Neba Cafe"
                      : menuType === "marti"
                        ? "Marti kitchen"
                        : menuType === "barcon"
                          ? "Barcon Migb Bet"
                          : menuType === "medi_shiro"
                            ? "medi shiro"
                            : menuType === "lewi_piyasa"
                              ? "Lewi piyasa"
                              : menuType === "twins_kitchen"
                                ? "Twin's Kitchen"
                                : menuType === "mohi_ertb"
                                  ? "Mohi Ertb"
                                  : menuType === "selam_special"
                                    ? "selam special"
                                    : menuType === "cafe_9"
                                      ? "Cafe 9"
                                      : menuType === "liyu_taim"
                                        ? "Liyu Taim (ልዩ ጣዕም)"
                                        : menuType === "zanzibar"
                                          ? "Zanzibar kitchen"
                                          : "YOM BURGERIZZA";

      const finalMsg = `Please organize a ticket for: ${itemsList.join(", ")}.\n\nMy delivery profile parameters:\n👤 Name: ${nameText}\n📞 Phone: ${phoneText}\n📍 Pick-Up Location: ${pickupAddress}\n📍 Drop-Off Address: ${dropAddress}`;

      onSendMessage(finalMsg);
      setMountainSelected({});

      if (isInsideWebApp) {
        setWebAppKeyboard("main");
        setIsMenuOpen(false);
      } else {
        setTgKeyboard("main");
      }

      setToastMessage("🎉 Order submitted successfully!");
      setTimeout(() => setToastMessage(null), 4000);
    };

    const activeTheme = CENTRAL_RESTAURANT_THEMES[menuType] || {
      primary: "#5E9D6E",
      primaryHover: "#4F8A5E",
      primaryRgb: "94, 157, 110",
    };

    return (
      <div className="w-full flex flex-col gap-3 font-sans text-slate-800 leading-normal animate-fadeIn text-slate-800">
        <style
          dangerouslySetInnerHTML={{
            __html: `
          :root {
            --brand-primary: ${activeTheme.primary};
            --brand-primary-hover: ${activeTheme.primaryHover};
            --brand-primary-rgb: ${activeTheme.primaryRgb};
          }
        `,
          }}
        />
        {/* Simple elegant button at the very top of a specific hotel menu to show other hotels */}
        <button
          type="button"
          id="menu-btn-show-other-hotels"
          onClick={handleBackOrderMenu}
          className={`w-full ${colors.badgeColor} font-extrabold text-[11.5px] py-2.5 px-4 rounded-xl transition flex text-center items-center justify-center gap-2 cursor-pointer border shadow-3xs hover:-translate-y-0.5 active:scale-98 font-sans transition-all duration-300`}
        >
          🏬 {isAmharic ? "ሌሎች ሆቴሎችን አሳይ" : "Show Other Hotels"}
        </button>

        {/* Fancy Custom Branded Header Bubble */}
        <div
          className={`p-4 rounded-2xl rounded-bl-none shadow-sm flex flex-col gap-1.5 transition-all duration-300 border bg-white border-slate-200`}
        >
          <span className="font-extrabold text-sm tracking-tight flex items-center justify-between text-slate-800">
            <span className="flex items-center gap-1.5">{theme.title}</span>
            <span
              className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase font-mono border ${theme.headerTag}`}
            >
              Eth Birr (Br)
            </span>
          </span>
          <p className="text-slate-500 text-[11px] leading-tight font-medium">
            {theme.desc}
          </p>

          {/* SINGLE elegant picture cover representing the restaurant menu rather than specific individual item pictures */}
          <div className="w-full h-28 my-1 rounded-xl overflow-hidden relative shadow-3xs border border-slate-100">
            <img
              src={storeMeta.image}
              alt={details.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-103"
            />
            {/* Elegant vignette gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
            <div className="absolute bottom-2 left-2 flex items-center gap-1.5 text-white font-extrabold text-[10.5px] bg-black/60 backdrop-blur-3xs px-2.5 py-0.5 rounded-full shadow-lg">
              <span>⭐ {storeMeta.rating}</span>
              <span className="text-white/40">•</span>
              <span>⏱️ {storeMeta.deliveryTime}</span>
            </div>
          </div>

          <div className="text-[8.5px] text-slate-400 text-right mt-1 font-mono leading-none">
            ⏰{" "}
            {new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>

        {/* Category Controls Selector */}
        <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-none font-sans select-none">
          {categories.map((cat, idx) => {
            const isSelected = mountainCategory === cat;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setMountainCategory(cat);
                  setMenuPage(0);
                }}
                className={`text-[10.5px] font-bold py-1.5 px-3.5 rounded-full text-center flex items-center justify-center transition cursor-pointer shrink-0 border duration-150 whitespace-nowrap ${
                  isSelected
                    ? `${colors.catButtonSelected} transform scale-102`
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:-translate-y-0.5 shadow-2xs"
                }`}
              >
                {cat.toLowerCase().trim() === "injera" && isAmharic
                  ? "Injera"
                  : cat}
              </button>
            );
          })}
        </div>

        {/* Item Selector List Box - Two Column Grid */}
        <div
          className={`grid grid-cols-2 gap-3 max-h-[350px] overflow-y-auto p-1 rounded-xl scrollbar-xs`}
        >
          {paginatedItems.map((item, itemIdx) => {
            const qty =
              item.name === "Chukame Betibis(ጨካሜ በትቢስ)"
                ? getChukameQty()
                : mountainSelected[item.name] || 0;
            return (
              <div
                key={itemIdx}
                className={`flex flex-col bg-white border border-slate-200/85 rounded-2xl p-3.5 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 relative group justify-between min-h-[142px] shadow-3xs ${colors.itemCardBorderHover}`}
              >
                {qty > 0 && (
                  <div
                    className={`absolute top-2.5 right-2.5 text-white text-[10px] font-black w-5.5 h-5.5 rounded-full flex items-center justify-center shadow-sm z-10 animate-pulse-subtle ${colors.qtyCircleBg}`}
                  >
                    {qty}
                  </div>
                )}

                <div className="flex flex-col gap-1.5 flex-1 justify-between">
                  <div className="space-y-1 min-w-0">
                    <span
                      className={`text-[12px] font-extrabold text-slate-800 leading-tight block truncate transition-colors ${colors.textGroupHover}`}
                      title={item.name}
                    >
                      {item.name}
                    </span>
                    <span className="text-[9.5px] text-slate-400 block line-clamp-2 font-medium leading-normal">
                      {item.name.toLowerCase().includes("burger")
                        ? "Flame-grilled juicy patty with premium fresh toppings"
                        : item.name.toLowerCase().includes("pizza")
                          ? "Freshly baked dough with classic savory cheeses"
                          : item.name.toLowerCase().includes("juice") ||
                              item.name.toLowerCase().includes("smoothie") ||
                              item.name.toLowerCase().includes("mojito") ||
                              item.name.toLowerCase().includes("shake")
                            ? "Pure, freshly-squeezed organic raw seasonal fruits, shakes, and mojitos"
                            : item.name.toLowerCase().includes("sandwich") ||
                                item.name.toLowerCase().includes("chips")
                              ? "Warm toasted bread with gourmet fillings or fine potato fries"
                              : item.name.toLowerCase().includes("shawarma") ||
                                  item.name.toLowerCase().includes("burrito") ||
                                  item.name.toLowerCase().includes("roll")
                                ? "Savory fillings wrapped or rolled in a warm toasted flatbread"
                                : item.name.toLowerCase().includes("noodle")
                                  ? "Wok-tossed noodles with garden vegetables and proteins"
                                  : item.name.toLowerCase().includes("chicken")
                                    ? "Gourmet seasoned chicken, crispy golden-fried or sizzling"
                                    : item.name
                                          .toLowerCase()
                                          .includes("rize") ||
                                        item.name.toLowerCase().includes("rice")
                                      ? "Savory cooked rice wok-tossed with delicious seasonings"
                                      : item.name.toLowerCase().includes("soup")
                                        ? "Warm, comforting savory broth, simmered with aromatic spices"
                                        : item.name
                                              .toLowerCase()
                                              .includes("coffee")
                                          ? "Authentic Italian roasted beans handcrafted to perfection"
                                          : item.name
                                                .toLowerCase()
                                                .includes("pasta")
                                            ? "Artisanal freshly rolled pasta in gourmet slow-cooked sauces"
                                            : item.name
                                                  .toLowerCase()
                                                  .includes("pastry")
                                              ? "Classic European delicate pastries and sweet oven treats"
                                              : "Expertly prepared specialty dish, served warm and fresh"}
                    </span>
                  </div>

                  <div className="space-y-1.5 mt-2">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[12.5px] font-black ${colors.primaryText}`}
                      >
                        {item.name === "Chukame Betibis(ጨካሜ በትቢስ)"
                          ? "850.00 - 930.00 Br"
                          : `${item.price.toFixed(2)} Br`}
                      </span>
                    </div>

                    {qty > 0 ? (
                      <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-lg p-0.5 select-none text-[12px]">
                        <button
                          type="button"
                          onClick={() => handleDecrementItem(item)}
                          className={`text-slate-600 font-extrabold text-[12px] bg-white rounded shadow-2xs border border-slate-250 w-5.5 h-5.5 flex items-center justify-center hover:bg-rose-50 transition cursor-pointer ${colors.btnHoverText}`}
                        >
                          -
                        </button>
                        <span className="text-[11px] font-extrabold text-slate-800 font-mono">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleToggleItem(item)}
                          className={`text-slate-600 font-extrabold text-[12px] bg-white rounded shadow-2xs border border-slate-250 w-5.5 h-5.5 flex items-center justify-center hover:bg-[rgba(var(--brand-primary-rgb),0.06)] transition cursor-pointer ${colors.btnHoverText}`}
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleToggleItem(item)}
                        className={`w-full active:scale-95 text-white text-[10px] font-black py-1.5 px-2 rounded-lg text-center transition cursor-pointer ${colors.buttonMainBg}`}
                      >
                        + Add to Cart
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dynamic Pagination Controls Toolbar (shown only if total pages > 1) */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-stone-800 text-[10.5px] font-sans font-bold shadow-2xs mt-0.5 select-none">
            <button
              type="button"
              disabled={activePage === 0}
              onClick={() => setMenuPage((prev) => Math.max(0, prev - 1))}
              className={`px-3 py-1.5 rounded-lg border flex items-center gap-1 transition-all cursor-pointer select-none active:scale-95 duration-100 ${
                activePage === 0
                  ? "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed"
                  : "bg-white hover:bg-slate-100 text-slate-700 border-slate-300 font-bold"
              }`}
            >
              ◀ Prev
            </button>
            <span className="font-mono text-[10px] uppercase font-black text-slate-500 tracking-wide">
              Page {activePage + 1} of {totalPages}
            </span>
            <button
              type="button"
              disabled={activePage >= totalPages - 1}
              onClick={() =>
                setMenuPage((prev) => Math.min(totalPages - 1, prev + 1))
              }
              className={`px-3 py-1.5 rounded-lg border flex items-center gap-1 transition-all cursor-pointer select-none active:scale-95 duration-100 ${
                activePage >= totalPages - 1
                  ? "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed"
                  : "bg-white hover:bg-slate-100 text-slate-700 border-slate-300 font-bold"
              }`}
            >
              Next ▶
            </button>
          </div>
        )}

        {/* Fancy Total Cart Banner */}
        {totalSelectedCount > 0 && (
          <div
            className={`rounded-xl px-3.5 py-2.5 text-xs flex justify-between items-center shadow-xs animate-fadeIn shrink-0 select-none font-sans mt-0.5 transition duration-300 ${theme.cartSummaryBg}`}
          >
            <span className="font-black flex items-center gap-1.5">
              <span>🛒 Selection:</span>
              <span
                className={`rounded-full px-2.5 py-0.5 font-mono font-black text-[10.5px] border border-white/20`}
              >
                {totalSelectedCount} items
              </span>
            </span>
            <span className="font-black font-mono tracking-tight text-white text-[12.5px]">
              Total: {totalPrice.toFixed(2)} Br
            </span>
          </div>
        )}

        {/* Delivery Parameter Inputs right inside the ordering flow before submitting */}
        {totalSelectedCount > 0 && (
          <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 mt-2 text-slate-700 font-sans shadow-3xs space-y-2.5 animate-fadeIn shrink-0">
            <div className="flex justify-between items-center border-b border-slate-200/60 pb-1.5">
              <span className="font-extrabold text-[11px] text-slate-600 uppercase tracking-wide flex items-center gap-1">
                <span>📍</span> {isAmharic ? "የማድረሻ መረጃ (ስም፣ ስልክ እና አድራሻ)" : "Delivery Details (Name, Phone & Address)"}
              </span>
              <span className="text-[10px] text-orange-600 font-bold">
                {isAmharic ? "*መሞላት ያለበት" : "*Required"}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">
                  {isAmharic ? "👤 ሙሉ ስም" : "👤 Recipient Name"}
                </label>
                <input
                  type="text"
                  placeholder={isAmharic ? "ለምሳሌ፦ አበበ ከበደ" : "e.g. Abebe Kebede"}
                  value={customerProfile.name || localName}
                  onChange={(e) => {
                    const val = e.target.value;
                    setLocalName(val);
                    if (onUpdateProfile) {
                      onUpdateProfile({ ...customerProfile, name: val });
                    }
                  }}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">
                    {isAmharic ? "📞 ስልክ ቁጥር" : "📞 Phone Number"}
                  </label>
                  <div className="flex gap-1">
                    <input
                      type="tel"
                      placeholder="e.g. 0911234567"
                      value={customerProfile.phone || localPhone}
                      onChange={(e) => {
                        const val = e.target.value;
                        setLocalPhone(val);
                        if (onUpdateProfile) {
                          onUpdateProfile({ ...customerProfile, phone: val });
                        }
                      }}
                      className={`flex-1 min-w-0 bg-white border rounded-lg px-2 py-1 text-xs font-semibold focus:outline-none focus:ring-1 ${
                        (customerProfile.phone || localPhone || "").trim() !== "" &&
                        (customerProfile.phone || localPhone || "").replace(/[^0-9]/g, "").length !== 10
                          ? "border-rose-500 text-rose-600 focus:ring-rose-500 focus:border-rose-500 bg-rose-50/10"
                          : "border-slate-200 focus:ring-orange-500"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const correctPhone = (customerProfile.phone || localPhone || "").replace(/[^0-9]/g, "").length === 10
                          ? (customerProfile.phone || localPhone)
                          : "0911223344";
                        setLocalPhone(correctPhone);
                        if (onUpdateProfile) {
                          onUpdateProfile({ ...customerProfile, phone: correctPhone });
                        }
                        setToastMessage(
                          isAmharic
                            ? `✓ ስልክ ቁጥር ተጋርቷል: ${correctPhone}`
                            : `✓ Contact shared: ${correctPhone}`
                        );
                        setTimeout(() => setToastMessage(null), 3000);
                      }}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 rounded-lg text-[10px] font-bold border border-slate-200 transition active:scale-95 flex items-center gap-0.5 shrink-0 cursor-pointer"
                      title={isAmharic ? "ስልክ ቁጥር አጋራ" : "Share Contact"}
                    >
                      <span>📱</span> {isAmharic ? "አጋራ" : "Share"}
                    </button>
                  </div>
                  {(customerProfile.phone || localPhone || "").trim() !== "" &&
                    (customerProfile.phone || localPhone || "").replace(/[^0-9]/g, "").length !== 10 && (
                      <p className="text-rose-600 text-[9.5px] font-bold mt-1 font-sans animate-pulse">
                        {isAmharic
                          ? "⚠️ ስልክ ቁጥር በትክክል 10 አሃዝ መሆን አለበት!"
                          : "⚠️ Phone number must be exactly 10 digits!"}
                      </p>
                    )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">
                    {isAmharic ? "📍 መድረሻ ቦታ" : "📍 Drop-off Location"}
                  </label>
                  <div className="flex gap-1">
                    <input
                      type="text"
                      placeholder={isAmharic ? "ምሳሌ፦ ቦሌ ማተሚያ" : "e.g. Bole Matemiya"}
                      value={customerProfile.address || localAddress}
                      onChange={(e) => {
                        const val = e.target.value;
                        setLocalAddress(val);
                        if (onUpdateProfile) {
                          onUpdateProfile({ ...customerProfile, address: val });
                        }
                      }}
                      className="flex-1 min-w-0 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (navigator.geolocation) {
                          navigator.geolocation.getCurrentPosition(
                            (position) => {
                              const lat = position.coords.latitude.toFixed(4);
                              const lng = position.coords.longitude.toFixed(4);
                              const gpsStr = `Shared GPS Location (${lat}° N, ${lng}° E)`;
                              setLocalAddress(gpsStr);
                              if (onUpdateProfile) {
                                onUpdateProfile({ ...customerProfile, address: gpsStr });
                              }
                              setToastMessage(
                                isAmharic
                                  ? "✓ የቀጥታ GPS አድራሻ ተጋርቷል!"
                                  : "✓ GPS location shared successfully!"
                              );
                              setTimeout(() => setToastMessage(null), 3000);
                            },
                            (error) => {
                              const fallbackGps = "Shared GPS Location (9.0122° N, 38.7500° E)";
                              setLocalAddress(fallbackGps);
                              if (onUpdateProfile) {
                                onUpdateProfile({ ...customerProfile, address: fallbackGps });
                              }
                              setToastMessage(
                                isAmharic
                                  ? "✓ የተቀመጠ GPS አድራሻ ተጋርቷል!"
                                  : "✓ Location shared (default Addis Ababa GPS)!"
                              );
                              setTimeout(() => setToastMessage(null), 3000);
                            }
                          );
                        } else {
                          const fallbackGps = "Shared GPS Location (9.0122° N, 38.7500° E)";
                          setLocalAddress(fallbackGps);
                          if (onUpdateProfile) {
                            onUpdateProfile({ ...customerProfile, address: fallbackGps });
                          }
                        }
                      }}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 rounded-lg text-[10px] font-bold border border-slate-200 transition active:scale-95 flex items-center gap-0.5 shrink-0 cursor-pointer"
                      title={isAmharic ? "አድራሻ አጋራ (GPS)" : "Share Location"}
                    >
                      <span>📍</span> {isAmharic ? "አጋራ" : "GPS"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Combined Autofill Button requested specifically by the user */}
            <button
              type="button"
              onClick={() => {
                const correctName = (customerProfile.name || localName || "").trim() || "Abebe Kebede";
                const correctPhone = (customerProfile.phone || localPhone || "").replace(/[^0-9]/g, "").length === 10
                  ? (customerProfile.phone || localPhone)
                  : "0911223344";
                const fallbackGps = (customerProfile.address || localAddress || "").trim() || "Shared GPS Location (9.0122° N, 38.7500° E)";
                setLocalName(correctName);
                setLocalPhone(correctPhone);
                setLocalAddress(fallbackGps);
                if (onUpdateProfile) {
                  onUpdateProfile({
                    ...customerProfile,
                    name: correctName,
                    phone: correctPhone,
                    address: fallbackGps
                  });
                }
                setToastMessage(
                  isAmharic
                    ? "✓ ስም፣ ስልክ እና GPS አድራሻ በአንድ ላይ ተጋርተዋል!"
                    : "✓ Name, phone, and GPS location shared in one-tap!"
                );
                setTimeout(() => setToastMessage(null), 3000);
              }}
              className="w-full bg-orange-50 hover:bg-orange-100 text-[#E0560B] border border-orange-200 py-1.5 rounded-lg text-[10.5px] font-extrabold flex items-center justify-center gap-1.5 transition active:scale-[0.98] cursor-pointer"
            >
              <span>👤📱</span>
              <span>
                {isAmharic
                  ? "ሁሉንም መረጃዎች በአንድ ቁልፍ ያጋሩ (Share All Info)"
                  : "Share Name, Phone & GPS Location instantly"}
              </span>
            </button>
          </div>
        )}

        <div className="grid grid-cols-3 gap-1.5 mt-2 pt-2 border-t border-slate-200/50">
          <button
            type="button"
            onClick={handleBackOrderMenu}
            className={`font-extrabold text-[11px] py-3 rounded-xl text-center flex items-center justify-center gap-0.5 transition cursor-pointer border ${theme.btnBack}`}
          >
            ◀ Back
          </button>

          <button
            type="button"
            onClick={handleCancelOrderMenu}
            className={`font-extrabold text-[11px] py-3 rounded-xl text-center flex items-center justify-center transition cursor-pointer border ${theme.btnCancel}`}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmitOrderMenu}
            className={`font-black text-[11px] py-3 rounded-xl text-center flex items-center justify-center transition cursor-pointer border ${theme.btnSubmit}`}
          >
            Submit Order
          </button>
        </div>

        {chukameModal && chukameModal.isOpen && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3.5 z-50 animate-fadeIn font-sans">
            <div className="bg-white rounded-3xl w-full max-w-sm p-5 border border-slate-200 shadow-2xl relative overflow-hidden flex flex-col gap-3">
              {/* Top decoration bar */}
              <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto" />

              <div className="text-center">
                <h4 className="font-extrabold text-[var(--brand-primary)] text-base mb-1 tracking-tight">
                  Chukame Betibis (ጨካሜ በትቢስ)
                </h4>
                <p className="text-[10px] text-slate-500 font-bold leading-normal">
                  {isAmharic
                    ? "እባክዎ በእርጎ ወይም ያለእርጎ ይምረጡ"
                    : "Choose if you want with/without traditional yogurt (Ego)"}
                </p>
              </div>

              {/* Options layout */}
              <div className="flex flex-col gap-2.5">
                {/* Variant 1: With Yogurt */}
                <div className="border border-[rgba(var(--brand-primary-rgb),0.18)] bg-[rgba(var(--brand-primary-rgb),0.03)] rounded-2xl p-3 flex justify-between items-center transition hover:border-[var(--brand-primary)]">
                  <div className="flex flex-col select-none">
                    <span className="font-extrabold text-[11.5px] text-slate-800 flex items-center gap-1.5">
                      🥛 With እርጎ (Yogurt)
                    </span>
                    <span className="text-[10.5px] font-black text-[var(--brand-primary)] mt-0.5 font-mono">
                      930.00 Br
                    </span>
                  </div>

                  {/* Plus/minus triggers */}
                  <div className="flex items-center gap-2">
                    {(mountainSelected["Chukame Betibis(ጨካሜ በትቢስ) with እርጎ"] ||
                      0) > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          const currentQty =
                            mountainSelected[
                              "Chukame Betibis(ጨካሜ በትቢስ) with እርጎ"
                            ] || 0;
                          setMountainSelected((prev) => {
                            const updated = { ...prev };
                            if (currentQty <= 1) {
                              delete updated[
                                "Chukame Betibis(ጨካሜ በትቢስ) with እርጎ"
                              ];
                            } else {
                              updated["Chukame Betibis(ጨካሜ በትቢስ) with እርጎ"] =
                                currentQty - 1;
                            }
                            return updated;
                          });
                          setToastMessage("Removed 1 with እርጎ");
                          setTimeout(() => setToastMessage(null), 1500);
                        }}
                        className="w-6 h-6 bg-white border border-slate-200 hover:bg-rose-50 rounded-lg font-extrabold text-xs text-slate-700 flex items-center justify-center transition active:scale-95 cursor-pointer"
                      >
                        -
                      </button>
                    )}

                    <span className="font-bold text-xs min-w-[16px] text-center font-mono text-slate-800">
                      {mountainSelected["Chukame Betibis(ጨካሜ በትቢስ) with እርጎ"] ||
                        0}
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        const currentQty =
                          mountainSelected[
                            "Chukame Betibis(ጨካሜ በትቢስ) with እርጎ"
                          ] || 0;
                        setMountainSelected((prev) => ({
                          ...prev,
                          ["Chukame Betibis(ጨካሜ በትቢስ) with እርጎ"]:
                            currentQty + 1,
                        }));
                        setToastMessage("Added 1 with እርጎ");
                        setTimeout(() => setToastMessage(null), 1500);
                      }}
                      className="w-6 h-6 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] rounded-lg font-extrabold text-xs text-white flex items-center justify-center transition active:scale-95 cursor-pointer shadow-3xs"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Variant 2: Without Yogurt */}
                <div className="border border-slate-150 bg-slate-50/30 rounded-2xl p-3 flex justify-between items-center transition hover:border-slate-300">
                  <div className="flex flex-col select-none">
                    <span className="font-extrabold text-[11.5px] text-slate-800 flex items-center gap-1.5">
                      🥘 Without እርጎ
                    </span>
                    <span className="text-[10.5px] font-black text-slate-700 mt-0.5 font-mono">
                      850.00 Br
                    </span>
                  </div>

                  {/* Plus/minus triggers */}
                  <div className="flex items-center gap-2">
                    {(mountainSelected[
                      "Chukame Betibis(ጨካሜ በትቢስ) without እርጎ"
                    ] || 0) > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          const currentQty =
                            mountainSelected[
                              "Chukame Betibis(ጨካሜ በትቢስ) without እርጎ"
                            ] || 0;
                          setMountainSelected((prev) => {
                            const updated = { ...prev };
                            if (currentQty <= 1) {
                              delete updated[
                                "Chukame Betibis(ጨካሜ በትቢስ) without እርጎ"
                              ];
                            } else {
                              updated["Chukame Betibis(ጨካሜ በትቢስ) without እርጎ"] =
                                currentQty - 1;
                            }
                            return updated;
                          });
                          setToastMessage("Removed 1 without እርጎ");
                          setTimeout(() => setToastMessage(null), 1500);
                        }}
                        className="w-6 h-6 bg-white border border-slate-200 hover:bg-rose-50 rounded-lg font-extrabold text-xs text-slate-700 flex items-center justify-center transition active:scale-95 cursor-pointer"
                      >
                        -
                      </button>
                    )}

                    <span className="font-bold text-xs min-w-[16px] text-center font-mono text-slate-800">
                      {mountainSelected[
                        "Chukame Betibis(ጨካሜ በትቢስ) without እርጎ"
                      ] || 0}
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        const currentQty =
                          mountainSelected[
                            "Chukame Betibis(ጨካሜ በትቢስ) without እርጎ"
                          ] || 0;
                        setMountainSelected((prev) => ({
                          ...prev,
                          ["Chukame Betibis(ጨካሜ በትቢስ) without እርጎ"]:
                            currentQty + 1,
                        }));
                        setToastMessage("Added 1 without እርጎ");
                        setTimeout(() => setToastMessage(null), 1500);
                      }}
                      className="w-6 h-6 bg-zinc-800 hover:bg-zinc-900 rounded-lg font-extrabold text-xs text-white flex items-center justify-center transition active:scale-95 cursor-pointer shadow-3xs"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-2 pt-2 border-t border-slate-100 flex gap-2 w-full">
                <button
                  type="button"
                  onClick={() => setChukameModal(null)}
                  className="w-full bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white font-extrabold text-[10px] py-2.5 rounded-xl text-center cursor-pointer transition active:scale-95 uppercase tracking-wide"
                >
                  {isAmharic ? "ያለቀ" : "Close Option Selector"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const categories = Array.from(
    new Set(menuItems.map((item) => item.category)),
  );

  // Auto scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isParsing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const txt = inputText.trim();
    if (!txt || isParsing) return;

    const normalized = txt.toLowerCase();
    if (
      normalized.includes("mountain hotel menu") ||
      normalized.includes("mountain hotel") ||
      normalized === "mountain menu"
    ) {
      handleKeyboardAction("select_store", "Mountain Hotel");
      setInputText("");
      return;
    }
    if (
      normalized.includes("neba cafe menu") ||
      normalized.includes("neba cafe") ||
      normalized === "neba menu"
    ) {
      handleKeyboardAction("select_store", "Neba Cafe");
      setInputText("");
      return;
    }
    if (
      normalized.includes("chanoly noodles menu") ||
      normalized.includes("chanoly noodles") ||
      normalized === "chanoly menu"
    ) {
      handleKeyboardAction("select_store", "Chanoly Noodles");
      setInputText("");
      return;
    }
    if (
      normalized.includes("h-town burger menu") ||
      normalized.includes("h-town") ||
      normalized.includes("htown")
    ) {
      handleKeyboardAction("select_store", "H-Town Burger");
      setInputText("");
      return;
    }
    if (
      normalized.includes("sunny burger menu") ||
      normalized.includes("sunny burger")
    ) {
      handleKeyboardAction("select_store", "Sunny burger");
      setInputText("");
      return;
    }
    if (
      normalized.includes("rome 1960 cafe menu") ||
      normalized.includes("rome cafe") ||
      normalized.includes("rome 1960")
    ) {
      handleKeyboardAction("select_store", "Rome 1960 Cafe");
      setInputText("");
      return;
    }
    if (
      normalized.includes("aroma cafe menu") ||
      normalized.includes("aroma cafe")
    ) {
      handleKeyboardAction("select_store", "Aroma cafe");
      setInputText("");
      return;
    }
    if (
      normalized.includes("marti kitchen menu") ||
      normalized.includes("marti kitchen") ||
      normalized.includes("marti kichen") ||
      normalized === "marti menu"
    ) {
      handleKeyboardAction("select_store", "Marti kitchen");
      setInputText("");
      return;
    }
    if (
      normalized.includes("yom burgerizza menu") ||
      normalized.includes("yom burgeritza") ||
      normalized.includes("yom menu") ||
      normalized === "yom burger menu" ||
      normalized === "yom"
    ) {
      handleKeyboardAction("select_store", "YOM BURGERIZZA");
      setInputText("");
      return;
    }
    if (
      normalized.includes("barcon menu") ||
      normalized.includes("barkon menu") ||
      normalized.includes("barcon") ||
      normalized.includes("barkon")
    ) {
      handleKeyboardAction("select_store", "Barcon Migb Bet");
      setInputText("");
      return;
    }

    onSendMessage(txt);
    setInputText("");
  };

  const currentActiveKey = (() => {
    const activeKbd = isMenuOpen ? webAppKeyboard : tgKeyboard;
    if (activeKbd === "mountain_hotel_menu") return "mountain";
    if (activeKbd === "htown_menu") return "htown";
    if (activeKbd === "sunny_menu") return "sunny";
    if (activeKbd === "rome_menu") return "rome";
    if (activeKbd === "aroma_menu") return "aroma";
    if (activeKbd === "chanoly_menu") return "chanoly";
    if (activeKbd === "neba_menu") return "neba";
    if (activeKbd === "marti_menu") return "marti";
    if (activeKbd === "barcon_menu") return "barcon";
    if (activeKbd === "medi_shiro_menu") return "medi_shiro";
    if (activeKbd === "lewi_piyasa_menu") return "lewi_piyasa";
    if (activeKbd === "twins_kitchen_menu") return "twins_kitchen";
    if (activeKbd === "mohi_ertb_menu") return "mohi_ertb";
    if (activeKbd === "selam_special_menu") return "selam_special";
    if (activeKbd === "cafe_9_menu") return "cafe_9";
    if (activeKbd === "liyu_taim_menu") return "liyu_taim";
    if (activeKbd === "zanzibar_menu") return "zanzibar";
    if (activeKbd === "time_cafe_menu") return "time_cafe";
    if (activeKbd === "fenet_kitfo_menu") return "fenet_kitfo";
    if (activeKbd === "bekos_pastry_menu") return "bekos_pastry";
    if (activeKbd === "light_burger_menu") return "light_burger";
    if (activeKbd === "ana_cafe_menu") return "ana_cafe";
    if (activeKbd === "safeland_cafe_menu") return "safeland_cafe";
    if (activeKbd === "addis_asa_menu") return "addis_asa";
    if (activeKbd === "chef_teketel_menu") return "chef_teketel";
    if (activeKbd === "dani_chef_menu") return "chef_dani";
    if (activeKbd === "funche_shiro_menu") return "funche_shiro";
    if (activeKbd === "tina_faya_menu") return "tina_faya";
    if (activeKbd === "azi_hotel_menu") return "azi_hotel";
    if (activeKbd === "abenezer_kurt_menu") return "abenezer_kurt";
    if (activeKbd === "feven_restaurant_menu") return "feven";
    if (activeKbd === "abiy_filafil_menu") return "abiy_filafil";
    if (activeKbd === "tewedaj_menu") return "tewedaj";
    if (activeKbd === "yellow_burger_menu") return "yellow_burger";
    if (activeKbd === "antsokiya_menu") return "antsokiya";
    if (activeKbd === "hibir_menu") return "hibir";
    if (activeKbd === "mamas_cheko_menu") return "mamas_cheko";
    if (activeKbd === "sunny_burger_2_menu") return "sunny_burger_2";
    if (activeKbd === "rekik_coffee_menu") return "rekik_coffee";
    if (activeKbd === "emi_pizza_menu") return "emi_pizza";
    if (activeKbd === "yahweh_nisse_menu") return "yahweh_nisse";
    if (activeKbd === "mercy_fruit_menu") return "mercy_fruit";
    if (activeKbd === "taso_italian_menu") return "taso_italian";
    if (activeKbd === "colors_cafe_menu") return "colors_cafe";
    if (activeKbd === "moonlight_restorant_menu") return "moonlight_restorant";
    if (activeKbd === "nota_lounge_menu") return "nota_lounge";
    if (activeKbd === "queen_kitchen_menu") return "queen_kitchen";
    if (activeKbd === "konjo_cake_menu") return "konjo_cake";
    if (activeKbd === "jalebib_muslim_menu") return "jalebib_muslim";
    return null;
  })();

  const activeGlobalTheme =
    currentActiveKey && CENTRAL_RESTAURANT_THEMES[currentActiveKey]
      ? CENTRAL_RESTAURANT_THEMES[currentActiveKey]
      : {
          primary: "#5E9D6E",
          primaryHover: "#4F8A5E",
          primaryRgb: "94, 157, 110",
        };

  return (
    <div
      id="tg-simulator"
      className="bg-[#f0f3f6] border border-slate-200 rounded-2xl overflow-hidden shadow-lg h-[620px] flex flex-col relative"
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
        :root {
          --brand-primary: ${activeGlobalTheme.primary};
          --brand-primary-hover: ${activeGlobalTheme.primaryHover};
          --brand-primary-rgb: ${activeGlobalTheme.primaryRgb};
        }
      `,
        }}
      />
      {/* Telegram Client Header */}
      <div className="bg-[#1e88e5] text-white px-4 py-3.5 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#1565c0] rounded-full flex items-center justify-center font-bold text-md text-white border-2 border-[#1e88e5]/50 shrink-0">
            T
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-tight">
                ቶሎ | Tollo Delivery ⚡
              </span>
              <span
                id="bot-badge"
                className="text-[9px] bg-[#1565c0] text-blue-100 px-1 py-0.2 rounded font-semibold uppercase"
              >
                BOT
              </span>
            </div>
            <span className="text-xs text-blue-100/90 block font-light">
              {isClosed ? (
                isAmharic
                  ? "🔴 ዝግ ነው • ከምሽቱ 2:00 (20:00) ጀምሮ"
                  : "🔴 Closed • after 20:00 PM"
              ) : isParsing ? (
                isAmharic
                  ? "በመተንተን ላይ ነው..."
                  : "is typing..."
              ) : (
                isAmharic
                  ? "በመስመር ላይ • ዝርዝር ይቀበላል"
                  : "online • matches natural chat"
              )}
            </span>
          </div>
        </div>
        <div
          id="tg-time-indicator"
          className="text-[10px] text-blue-100 font-mono font-medium"
        >
          Telegram UI Client
        </div>
      </div>

      {/* Simulated Telegram Mini-App Profile Header Bar */}
      <div
        id="tg-profile-bar"
        className="bg-slate-900 border-b border-slate-850 px-3 py-2 text-xs flex items-center justify-between shrink-0 select-none"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-full bg-slate-800 text-orange-400 flex items-center justify-center font-mono text-[10px] font-bold uppercase shrink-0">
            {customerProfile.name ? customerProfile.name.charAt(0) : "U"}
          </div>
          <div className="min-w-0">
            <div className="flex items-baseline gap-1.5 text-slate-100">
              <span className="font-bold text-[11px] truncate">
                {customerProfile.name || (isAmharic ? "ስም ያስገቡ" : "Set Name")}
              </span>
              <span className="text-[9px] text-slate-400 font-mono">
                {customerProfile.phone || (isAmharic ? "ስልክ የለም" : "No Phone")}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 truncate max-w-[200px]">
              {customerProfile.pickupAddress
                ? `[Pick: ${customerProfile.pickupAddress}] `
                : ""}
              {customerProfile.address ||
                (isAmharic ? "የማድረሻ አድራሻ ያስገቡ" : "Provide Delivery Address")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            id="btn-toggle-lang-top"
            type="button"
            onClick={() => onLanguageChange(!isAmharic)}
            className={`font-semibold text-[10.5px] rounded-md px-2 py-1 transition cursor-pointer flex items-center gap-0.5 border ${
              isAmharic
                ? "bg-emerald-600 text-white border-emerald-500"
                : "bg-slate-800 text-slate-300 border-slate-700 hover:text-white"
            }`}
            title="Toggle language / ቋንቋ ቀይር"
          >
            🌐 {isAmharic ? "Eng" : "አማርኛ"}
          </button>

          <button
            id="btn-edit-tg-profile"
            type="button"
            onClick={() => setIsMenuOpen(true)}
            className="bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white font-bold text-[10px] tracking-wide rounded-md px-2.5 py-1.5 transition shrink-0 cursor-pointer"
          >
            👤 {isAmharic ? "ምርጫዎች" : "Set Preferences"}
          </button>
        </div>
      </div>

      {isClosed && (
        <div className="bg-rose-500 text-white px-3 py-1.5 text-[11px] font-semibold text-center flex items-center justify-center gap-1.5 shrink-0 animate-fadeIn font-sans">
          <span>🔴</span>
          <span>
            {isAmharic
              ? "ቶሎ ማዘዣ ተዘግቷል! (ከምሽቱ 2:00 / 20:00 በኋላ)"
              : "Tollo Delivery is currently closed (after 20:00 PM)"}
          </span>
        </div>
      )}

      {/* Telegram Wallpaper Background & Message Feed */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#e7ebf0]"
        style={{
          backgroundImage: "radial-gradient(#d3dbcd 0.5px, transparent 0.5px)",
          backgroundSize: "10px 10px",
        }}
      >
        {messages.map((msg) => {
          const isUser = msg.sender === "user";
          const isBot = msg.sender === "bot";
          const isSystem = msg.sender === "system";
          const linkedOrder = orders?.find((o) => o.id === msg.trackingOrderId);

          if (isSystem) {
            return (
              <div key={msg.id} className="flex justify-center my-3">
                <div className="bg-slate-800/20 backdrop-blur-sm text-slate-800 text-[11px] font-medium font-mono px-3 py-1.5 rounded-full text-center max-w-sm">
                  {msg.text}
                </div>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex ${isUser ? "justify-end" : "justify-start"} w-full`}
            >
              {/* Bot Avatar */}
              {isBot && (
                <div className="w-8 h-8 rounded-full bg-[#1e88e5] text-white flex items-center justify-center text-xs shrink-0 mr-2 shadow self-end mb-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 shadow-sm text-sm relative ${
                  isUser
                    ? "bg-[#effdde] text-slate-950 rounded-br-none border border-[#e2f1cd]"
                    : "bg-white text-slate-950 rounded-bl-none border border-slate-100"
                }`}
              >
                {msg.type === "start_flow" ? (
                  <>
                    <div className="whitespace-pre-line text-[13.5px] leading-relaxed text-slate-900 pr-4 font-sans select-text">
                      {msg.text}
                    </div>

                    {/* Action Buttons styled like standard Telegram inline keyboard buttons */}
                    <div className="flex flex-col gap-1 mt-2.5 w-full">
                      <button
                        type="button"
                        onClick={() => {
                          setWebAppKeyboard("stores_p1");
                          setToastMessage("🚀 Launching Mini App...");
                          setTimeout(() => setToastMessage(null), 3000);
                          setIsMenuOpen(true);
                        }}
                        className="w-full bg-[#f1f6fb] hover:bg-[#e4effb] text-[#0088cc] font-bold text-[11.5px] py-2 px-3 rounded-lg text-center flex items-center justify-center gap-1.5 transition cursor-pointer border border-blue-100/50 active:scale-98"
                      >
                        🍔 ቶሎ ማዘዣ ክፈት (Open Tollo App)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setToastMessage("📞 Direct support ticket opened!");
                          setTimeout(() => setToastMessage(null), 3000);
                          onSendMessage("CONTACT_SUPPORT_TRIGGERED_ACTION");
                          setIsMenuOpen(false);
                        }}
                        className="w-full bg-[#f1f6fb] hover:bg-[#e4effb] text-[#0088cc] font-bold text-[11.5px] py-2 px-3 rounded-lg text-center flex items-center justify-center gap-1.5 transition cursor-pointer border border-blue-100/50 active:scale-98"
                      >
                        📞 እገዛ መጠየቂያ (Contact Support)
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {msg.senderName && (
                      <div className="text-[10px] font-bold text-[var(--brand-primary)] mb-1 pb-1 border-b border-[rgba(var(--brand-primary-rgb),0.12)] flex items-center gap-1 font-sans">
                        <span>👤</span> {msg.senderName}
                      </div>
                    )}
                    {/* Content text */}
                    <div className="whitespace-pre-line text-[13.5px] leading-relaxed text-slate-900 pr-4">
                      {msg.text}
                    </div>
                  </>
                )}

                {/* Structured Order Summary widget inside Bot reply bubble */}
                {msg.type === "order_summary" && msg.orderSummary && (
                  <div className="mt-3 bg-slate-50 border border-slate-150 rounded-xl overflow-hidden text-xs">
                    <div className="bg-slate-100 px-3 py-2 border-b border-slate-150 font-bold text-slate-700 flex justify-between items-center">
                      <span>🍽️ Proposed Kitchen Summary</span>
                      <span className="text-[10px] font-mono text-slate-500 font-medium">
                        MAPPED STATUS
                      </span>
                    </div>
                    <div className="p-3 space-y-2">
                      {msg.orderSummary.items.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-start gap-2 border-b border-slate-100 pb-1.5 last:border-b-0 last:pb-0"
                        >
                          <div>
                            <span className="font-bold text-slate-800">
                              {item.quantity}x
                            </span>{" "}
                            {item.name}
                            {item.customization && (
                              <span className="block text-[10px] text-amber-600 italic font-medium ml-1">
                                ({item.customization})
                              </span>
                            )}
                          </div>
                          <span className="font-mono text-slate-600 font-bold">
                            {item.totalPrice.toFixed(2)} Birr
                          </span>
                        </div>
                      ))}

                      <div className="pt-2 mt-1 border-t border-slate-200 space-y-1 font-mono text-[11.5px] text-slate-600">
                        <div className="flex justify-between">
                          <span>Estimated Food Price:</span>
                          <span>
                            {msg.orderSummary.subtotal.toFixed(2)} Birr
                          </span>
                        </div>
                        <p className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-1.5 rounded-lg leading-relaxed font-sans font-medium">
                          ℹ️ <strong>Direct Prepayment Required:</strong> You pay the <strong>full food price plus the 100BR delivery fee</strong> in advance.
                        </p>
                        <div className="flex justify-between font-semibold text-emerald-700 bg-emerald-55 px-1.5 py-0.5 rounded">
                          <span>Full Food Prepayment:</span>
                          <span>
                            {msg.orderSummary.subtotal.toFixed(2)} Birr
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Delivery Fee (Flat Rate):</span>
                          <span>
                            {msg.orderSummary.deliveryFee.toFixed(2)} Birr
                          </span>
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-500">
                          <span>Remaining Balance (Due At Delivery):</span>
                          <span>
                            0.00 Birr
                          </span>
                        </div>
                        <div className="flex justify-between font-bold text-slate-900 border-t border-dashed border-slate-200 pt-1 text-xs">
                          <span>Total Amount to Pay:</span>
                          <span>{msg.orderSummary.total.toFixed(2)} Birr</span>
                        </div>
                      </div>

                      {/* Cashless Rule block */}
                      <div className="bg-emerald-50/80 border border-emerald-250/50 rounded-lg p-2 mt-2 leading-relaxed text-[11px] text-emerald-800 space-y-1 font-sans">
                        <div className="flex items-center gap-1 font-bold text-emerald-900">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>💳 FULL ADVANCE PAYMENT ONLY</span>
                        </div>
                        <p className="text-[10.5px]">
                          To confirm your request, please authorize the full food price plus the 100BR delivery fee as a secure cashless prepayment. Once verified, a driver will be assigned immediately!
                        </p>
                      </div>
                    </div>

                    {/* Telegram inline confirmation buttons */}
                    <div className="grid grid-cols-2 divide-x divide-slate-200 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() =>
                          onCancelOrder(msg.orderSummary?.orderId || "")
                        }
                        className="py-2.5 text-center text-[11px] font-bold text-rose-500 hover:bg-rose-50 transition cursor-pointer flex items-center justify-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Discard
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onConfirmOrder(msg.orderSummary?.orderId || "")
                        }
                        className="py-2.5 text-center text-[11px] font-bold text-blue-600 hover:bg-blue-50 transition cursor-pointer flex items-center justify-center gap-1"
                      >
                        <CreditCard className="w-3.5 h-3.5" /> Pay Advance Now
                      </button>
                    </div>
                  </div>
                )}

                {/* Dynamic Tracking Link Link inline button bubble */}
                {msg.type === "tracking_link" && msg.trackingOrderId && (
                  <div className="mt-2.5 space-y-2">
                    {linkedOrder?.paymentDetails?.receiptPhoto && (
                      <div className="bg-slate-55 border border-slate-200 rounded-xl p-2.5 space-y-1.5 shadow-3xs">
                        <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block font-sans">
                          {isAmharic
                            ? "📷 የክፍያ ማረጋገጫ (Screenshot)፦"
                            : "📷 Submitted Payment Screenshot:"}
                        </span>
                        <div className="relative border border-slate-150 rounded-lg p-1 bg-white overflow-hidden max-h-[140px] flex justify-center items-center">
                          <img
                            src={linkedOrder.paymentDetails.receiptPhoto}
                            alt="Payment receipt proof"
                            className="max-h-[120px] rounded object-contain"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      </div>
                    )}
                    <button
                      onClick={() =>
                        onSelectTrackOrder(msg.trackingOrderId || "")
                      }
                      className="w-full bg-[#1e88e5] text-white hover:bg-[#1565c0] rounded-xl py-2 px-3 text-xs font-bold font-mono transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />{" "}
                      {isAmharic
                        ? `የቀጥታ መከታተያ #${msg.trackingOrderId}`
                        : `Live Tracking Info #${msg.trackingOrderId}`}
                    </button>
                  </div>
                )}

                {/* Dynamic Inline Keyboard Buttons */}
                {msg.buttons &&
                  msg.buttons.length > 0 &&
                  msg.type !== "start_flow" && (
                    <div className="mt-2.5 flex flex-col gap-1.5 w-full">
                      {msg.buttons.map((btn, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            if (btn.actionType === "open_mini_app") {
                              setToastMessage(`🚀 Launching Mini App...`);
                              setTimeout(() => setToastMessage(null), 3000);
                              setIsMenuOpen(true);
                              if (btn.url) {
                                try {
                                  window.open(
                                    btn.url,
                                    "_blank",
                                    "noopener,noreferrer",
                                  );
                                } catch (e) {
                                  console.warn(
                                    "window.open blocked, running drawer fallback.",
                                  );
                                }
                              }
                            } else if (btn.actionType === "alert_support") {
                              setToastMessage(
                                "📞 Direct support ticket opened!",
                              );
                              setTimeout(() => setToastMessage(null), 3000);

                              // Let's call onSendMessage with a support request code
                              onSendMessage("CONTACT_SUPPORT_TRIGGERED_ACTION");
                            } else {
                              setToastMessage(`Opening URL...`);
                              setTimeout(() => setToastMessage(null), 2000);
                              if (btn.url) {
                                try {
                                  window.open(
                                    btn.url,
                                    "_blank",
                                    "noopener,noreferrer",
                                  );
                                } catch (e) {
                                  console.warn(e);
                                }
                              }
                            }
                          }}
                          className="w-full bg-[#f0f4f9] hover:bg-[#e5ecf4] text-[#007aff] rounded-2xl py-3 px-4 text-[13px] font-semibold text-center border-none cursor-pointer transition flex items-center justify-center gap-1.5 active:scale-[0.98]"
                        >
                          {btn.label}
                        </button>
                      ))}
                    </div>
                  )}

                {/* Timestamp & Status double ticks */}
                <div className="text-[9px] text-slate-400 text-right font-mono mt-1 select-none flex items-center justify-end gap-0.5">
                  <span>{msg.timestamp}</span>
                  {isUser && (
                    <CheckCheck className="w-3 h-3 text-green-500 shrink-0" />
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing loading indicator */}
        {isParsing && (
          <div className="flex justify-start w-full">
            <div className="w-8 h-8 rounded-full bg-[#1e88e5] text-white flex items-center justify-center text-xs shrink-0 mr-2 shadow self-end">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white text-slate-650 rounded-2xl rounded-bl-none px-4 py-3 border border-slate-100 shadow-sm flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
              <span className="text-xs font-medium font-mono">
                {isAmharic
                  ? "ቶሎ | Tollo Delivery ትዕዛዝዎን በመተንተን ላይ ነው..."
                  : "ቶሎ | Tollo Delivery is parsing your request..."}
              </span>
            </div>
          </div>
        )}

        {/* Render the Custom Telegram Bot Menu Keyboard */}
        {false && (
          <div
            className={`mt-4 p-3 rounded-2xl space-y-3.5 select-none shadow-3xs border transition-all duration-300 ${
              tgKeyboard === "mountain_hotel_menu"
                ? "bg-emerald-800/5 border-emerald-500/10"
                : tgKeyboard === "htown_menu"
                  ? "bg-[#E0560B]/5 border-[#E0560B]/10"
                  : tgKeyboard === "sunny_menu"
                    ? "bg-amber-500/5 border-amber-500/10"
                    : tgKeyboard === "rome_menu"
                      ? "bg-red-800/5 border-red-500/10"
                      : tgKeyboard === "aroma_menu"
                        ? "bg-amber-800/5 border-amber-550/10"
                        : tgKeyboard === "chanoly_menu"
                          ? "bg-orange-850/5 border-orange-500/10"
                          : tgKeyboard === "neba_menu"
                            ? "bg-cyan-800/5 border-cyan-500/10"
                            : tgKeyboard === "marti_menu"
                              ? "bg-orange-800/5 border-orange-500/10"
                              : tgKeyboard === "yom_menu"
                                ? "bg-emerald-800/5 border-emerald-500/10"
                                : tgKeyboard === "barcon_menu"
                                  ? "bg-emerald-850/5 border-emerald-500/15"
                                  : tgKeyboard === "medi_shiro_menu"
                                    ? "bg-amber-800/5 border-amber-500/10"
                                    : tgKeyboard === "lewi_piyasa_menu"
                                      ? "bg-red-500/5 border-red-500/10"
                                      : tgKeyboard === "twins_kitchen_menu"
                                        ? "bg-amber-900/5 border-amber-600/10"
                                        : tgKeyboard === "mohi_ertb_menu"
                                          ? "bg-amber-500/5 border-amber-500/10"
                                          : tgKeyboard === "selam_special_menu"
                                            ? "bg-emerald-800/5 border-emerald-500/10"
                                            : tgKeyboard === "cafe_9_menu"
                                              ? "bg-green-700/5 border-green-500/10"
                                              : tgKeyboard === "liyu_taim_menu"
                                                ? "bg-green-800/5 border-green-500/10"
                                                : tgKeyboard === "zanzibar_menu"
                                                  ? "bg-teal-800/5 border-teal-500/10"
                                                  : "bg-orange-50/40 border-orange-100/90"
            }`}
          >
            {tgKeyboard === "mountain_hotel_menu" ||
            tgKeyboard === "htown_menu" ||
            tgKeyboard === "sunny_menu" ||
            tgKeyboard === "rome_menu" ||
            tgKeyboard === "aroma_menu" ||
            tgKeyboard === "chanoly_menu" ||
            tgKeyboard === "neba_menu" ||
            tgKeyboard === "marti_menu" ||
            tgKeyboard === "yom_menu" ||
            tgKeyboard === "barcon_menu" ||
            tgKeyboard === "medi_shiro_menu" ||
            tgKeyboard === "lewi_piyasa_menu" ||
            tgKeyboard === "twins_kitchen_menu" ||
            tgKeyboard === "mohi_ertb_menu" ||
            tgKeyboard === "selam_special_menu" ||
            tgKeyboard === "cafe_9_menu" ||
            tgKeyboard === "liyu_taim_menu" ||
            tgKeyboard === "zanzibar_menu" ||
            tgKeyboard === "time_cafe_menu" ||
            tgKeyboard === "fenet_kitfo_menu" ||
            tgKeyboard === "bekos_pastry_menu" ||
            tgKeyboard === "light_burger_menu" ||
            tgKeyboard === "ana_cafe_menu" ||
            tgKeyboard === "safeland_cafe_menu" ||
            tgKeyboard === "addis_asa_menu" ||
            tgKeyboard === "chef_teketel_menu" ||
            tgKeyboard === "dani_chef_menu" ||
            tgKeyboard === "funche_shiro_menu" ||
            tgKeyboard === "habtsh_menu" ||
            tgKeyboard === "boss_fries_menu" ||
            tgKeyboard === "bliss_coffee_menu" ||
            tgKeyboard === "tina_faya_menu" ||
            tgKeyboard === "azi_hotel_menu" ||
            tgKeyboard === "abenezer_kurt_menu" ||
            tgKeyboard === "feven_restaurant_menu" ||
            tgKeyboard === "abiy_filafil_menu" ||
            tgKeyboard === "tewedaj_menu" ||
            tgKeyboard === "yellow_burger_menu" ||
            tgKeyboard === "antsokiya_menu" ||
            tgKeyboard === "hibir_menu" ||
            tgKeyboard === "mamas_cheko_menu" ||
            tgKeyboard === "sunny_burger_2_menu" ||
            tgKeyboard === "rekik_coffee_menu" ||
            tgKeyboard === "emi_pizza_menu" ||
            tgKeyboard === "yahweh_nisse_menu" ||
            tgKeyboard === "colors_cafe_menu" ||
            tgKeyboard === "moonlight_restorant_menu" ||
            tgKeyboard === "nota_lounge_menu" ||
            tgKeyboard === "queen_kitchen_menu" ||
            tgKeyboard === "konjo_cake_menu" ||
            tgKeyboard === "jalebib_muslim_menu" ||
            tgKeyboard === "mercy_fruit_menu" ||
            tgKeyboard === "taso_italian_menu" ? (
              renderInteractiveMenu(
                false,
                tgKeyboard === "mountain_hotel_menu"
                  ? "mountain"
                  : tgKeyboard === "htown_menu"
                    ? "htown"
                    : tgKeyboard === "sunny_menu"
                      ? "sunny"
                      : tgKeyboard === "rome_menu"
                        ? "rome"
                        : tgKeyboard === "aroma_menu"
                          ? "aroma"
                          : tgKeyboard === "chanoly_menu"
                            ? "chanoly"
                            : tgKeyboard === "neba_menu"
                              ? "neba"
                              : tgKeyboard === "marti_menu"
                                ? "marti"
                                : tgKeyboard === "barcon_menu"
                                  ? "barcon"
                                  : tgKeyboard === "medi_shiro_menu"
                                    ? "medi_shiro"
                                    : tgKeyboard === "lewi_piyasa_menu"
                                      ? "lewi_piyasa"
                                      : tgKeyboard === "twins_kitchen_menu"
                                        ? "twins_kitchen"
                                        : tgKeyboard === "mohi_ertb_menu"
                                          ? "mohi_ertb"
                                          : tgKeyboard === "selam_special_menu"
                                            ? "selam_special"
                                            : tgKeyboard === "cafe_9_menu"
                                              ? "cafe_9"
                                              : tgKeyboard === "liyu_taim_menu"
                                                ? "liyu_taim"
                                                : tgKeyboard === "zanzibar_menu"
                                                  ? "zanzibar"
                                                  : tgKeyboard ===
                                                      "time_cafe_menu"
                                                    ? "time_cafe"
                                                    : tgKeyboard ===
                                                        "fenet_kitfo_menu"
                                                      ? "fenet_kitfo"
                                                      : tgKeyboard ===
                                                          "bekos_pastry_menu"
                                                        ? "bekos_pastry"
                                                        : tgKeyboard ===
                                                            "light_burger_menu"
                                                          ? "light_burger"
                                                          : tgKeyboard ===
                                                              "ana_cafe_menu"
                                                            ? "ana_cafe"
                                                            : tgKeyboard ===
                                                                "safeland_cafe_menu"
                                                              ? "safeland_cafe"
                                                              : tgKeyboard ===
                                                                  "addis_asa_menu"
                                                                ? "addis_asa"
                                                                : tgKeyboard ===
                                                                    "chef_teketel_menu"
                                                                  ? "chef_teketel"
                                                                  : tgKeyboard ===
                                                                      "dani_chef_menu"
                                                                    ? "chef_dani"
                                                                    : tgKeyboard ===
                                                                        "funche_shiro_menu"
                                                                      ? "funche_shiro"
                                                                      : tgKeyboard ===
                                                                          "habtsh_menu"
                                                                        ? "habtsh"
                                                                        : tgKeyboard ===
                                                                            "boss_fries_menu"
                                                                          ? "boss_fries"
                                                                          : tgKeyboard ===
                                                                              "bliss_coffee_menu"
                                                                            ? "bliss_coffee"
                                                                            : tgKeyboard ===
                                                                                "tina_faya_menu"
                                                                              ? "tina_faya"
                                                                              : tgKeyboard ===
                                                                                  "azi_hotel_menu"
                                                                                ? "azi_hotel"
                                                                                : tgKeyboard ===
                                                                                    "abenezer_kurt_menu"
                                                                                  ? "abenezer_kurt"
                                                                                  : tgKeyboard ===
                                                                                      "feven_restaurant_menu"
                                                                                    ? "feven"
                                                                                    : tgKeyboard ===
                                                                                        "abiy_filafil_menu"
                                                                                      ? "abiy_filafil"
                                                                                      : tgKeyboard ===
                                                                                          "tewedaj_menu"
                                                                                        ? "tewedaj"
                                                                                        : tgKeyboard ===
                                                                                            "hibir_menu"
                                                                                          ? "hibir"
                                                                                          : tgKeyboard ===
                                                                                              "yellow_burger_menu"
                                                                                            ? "yellow_burger"
                                                                                            : tgKeyboard ===
                                                                                                "antsokiya_menu"
                                                                                              ? "antsokiya"
                                                                                              : tgKeyboard ===
                                                                                                  "mamas_cheko_menu"
                                                                                                ? "mamas_cheko"
                                                                                                : tgKeyboard ===
                                                                                                    "sunny_burger_2_menu"
                                                                                                  ? "sunny_burger_2"
                                                                                                  : tgKeyboard ===
                                                                                                      "rekik_coffee_menu"
                                                                                                    ? "rekik_coffee"
                                                                                                    : tgKeyboard ===
                                                                                                        "emi_pizza_menu"
                                                                                                      ? "emi_pizza"
                                                                                                      : tgKeyboard ===
                                                                                                          "yahweh_nisse_menu"
                                                                                                        ? "yahweh_nisse"
                                                                                                        : tgKeyboard === "colors_cafe_menu" ? "colors_cafe" : tgKeyboard === "moonlight_restorant_menu" ? "moonlight_restorant" : tgKeyboard === "nota_lounge_menu" ? "nota_lounge" : tgKeyboard === "queen_kitchen_menu" ? "queen_kitchen" : tgKeyboard === "konjo_cake_menu" ? "konjo_cake" : tgKeyboard === "jalebib_muslim_menu" ? "jalebib_muslim" : tgKeyboard === "mercy_fruit_menu" ? "mercy_fruit" : tgKeyboard === "taso_italian_menu" ? "taso_italian" : "yom",
              )
            ) : (
              <>
                {/* Chat bubble title or header just like in the screenshots */}
                <div className="bg-white text-slate-800 rounded-2xl rounded-bl-none px-3.5 py-2.5 border border-slate-100 shadow-sm text-xs md:text-sm max-w-[85%] self-start flex flex-col gap-1 font-sans">
                  {tgKeyboard === "main" ? (
                    isAmharic ? (
                      <div className="whitespace-pre-line leading-relaxed text-slate-800 text-[12px] font-medium">
                        📞{" "}
                        <span className="font-extrabold text-[var(--brand-primary)]">
                          የቶሎ ዕገዛ መጠየቂያ (Contact Support)
                        </span>
                        👤{" "}
                        <span className="font-bold text-slate-750">
                          የደንበኛ ስም፦
                        </span>{" "}
                        {customerProfile.name || "(ያልተመዘገበ)"}
                        📞{" "}
                        <span className="font-bold text-slate-755">
                          ስልክ ቁጥር፦
                        </span>{" "}
                        {customerProfile.phone || "(ያልተመዘገበ)"}
                        እገዛ ይፈልጋሉ? እባክዎን በቴሌግራም *@tollodeliverysupport* ወይም በቀጥታ
                        በስልክ ቁጥር *+251965803642* ያግኙን እና እንረዳዎታለን። ከታች ያሉትን ቁልፎች
                        ይጠቀሙ።
                      </div>
                    ) : (
                      <div className="whitespace-pre-line leading-relaxed text-slate-805 text-[12.5px] font-semibold">
                        📞{" "}
                        <span className="font-extrabold text-[var(--brand-primary)]">
                          Tollo Support Center (Contact Support)
                        </span>
                        👤{" "}
                        <span className="font-bold text-slate-750">
                          Customer Name:
                        </span>{" "}
                        {customerProfile.name || "(Not set)"}
                        📞{" "}
                        <span className="font-bold text-slate-755">
                          Phone Number:
                        </span>{" "}
                        {customerProfile.phone || "(Not set)"}
                        Need help? Please reach us on Telegram at
                        *@tollodeliverysupport* or call us directly at
                        *+251965803642* and we will assist you. Use the buttons
                        below.
                      </div>
                    )
                  ) : (
                    <span className="font-bold text-slate-900 leading-relaxed text-[12.5px]">
                      {isAmharic
                        ? "እባክዎን ሱቅ (ካፌ) ይምረጡ፦"
                        : "Select a store (cafe):"}
                    </span>
                  )}
                  <div className="text-[9px] text-slate-400 text-right mt-1 font-mono">
                    {new Date().toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>

                {/* Outside action menu buttons */}
                <div className="mt-2 text-xs">
                  {tgKeyboard === "main" ? (
                    <div className="w-full flex flex-col gap-1.5 font-sans">
                      {/* Row 1: New Order */}
                      <button
                        type="button"
                        onClick={() => handleKeyboardAction("new_order")}
                        className="w-full bg-[#538761] hover:bg-[#437251] text-white font-extrabold text-[12.5px] py-2.5 px-4 rounded-lg text-center flex items-center justify-center transition cursor-pointer shadow-xs border border-emerald-700/10 active:scale-98 tracking-wide font-bold"
                      >
                        {isAmharic ? "አዲስ ትዕዛዝ" : "New Order"}
                      </button>

                      {/* Row 2: Change Language, Help */}
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            handleKeyboardAction("change_language")
                          }
                          className="bg-[#538761] hover:bg-[#437251] text-white font-semibold text-[12px] py-2.5 px-3 rounded-lg text-center flex items-center justify-center transition cursor-pointer shadow-xs border border-emerald-700/10 active:scale-98 leading-tight font-bold"
                        >
                          {isAmharic ? "ቋንቋ ቀይር" : "Change Language"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleKeyboardAction("help")}
                          className="bg-[#538761] hover:bg-[#437251] text-white font-semibold text-[12px] py-2.5 px-3 rounded-lg text-center flex items-center justify-center transition cursor-pointer shadow-xs border border-emerald-700/10 active:scale-98 leading-tight font-bold"
                        >
                          {isAmharic ? "እገዛ" : "Help"}
                        </button>
                      </div>

                      {/* Row 4: Recent Orders */}
                      <button
                        type="button"
                        onClick={() => handleKeyboardAction("recent_orders")}
                        className="w-full bg-[#538761] hover:bg-[#437251] text-white font-semibold text-[12.5px] py-2.5 px-4 rounded-lg text-center flex items-center justify-center transition cursor-pointer shadow-xs border border-emerald-700/10 active:scale-98 font-bold"
                      >
                        {isAmharic ? "የቅርብ ጊዜ ትዕዛዞች" : "Recent Orders"}
                      </button>

                      {/* Row 5: Discounts, Download Our App */}
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleKeyboardAction("discounts")}
                          className="bg-[#538761] hover:bg-[#437251] text-white font-semibold text-[12px] py-2.5 px-3 rounded-lg text-center flex items-center justify-center transition cursor-pointer shadow-xs border border-emerald-700/10 active:scale-98 leading-tight font-bold"
                        >
                          {isAmharic ? "ቅናሾች" : "Discounts"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleKeyboardAction("download_app")}
                          className="bg-[#538761] hover:bg-[#437251] text-white font-semibold text-[12px] py-2.5 px-3 rounded-lg text-center flex items-center justify-center transition cursor-pointer shadow-xs border border-emerald-700/10 active:scale-98 leading-tight font-bold"
                        >
                          {isAmharic ? "መተግበሪያችንን ያውርዱ" : "Download Our App"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full flex flex-col gap-2 font-sans">
                      {/* Search bar inside Telegram Panel */}
                      <div className="relative w-full mb-1 px-1">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                          <Search size={14} />
                        </div>
                        <input
                          type="text"
                          placeholder={
                            isAmharic
                              ? "ሆቴሎችን ይፈልጉ..."
                              : "Search hotels/restaurants..."
                          }
                          value={storeSearchQuery}
                          onChange={(e) => setStoreSearchQuery(e.target.value)}
                          className="w-full bg-white border border-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none rounded-xl py-1.5 pl-9 pr-8 text-[11px] font-semibold shadow-3xs transition-all duration-150"
                        />
                        {storeSearchQuery && (
                          <button
                            type="button"
                            onClick={() => setStoreSearchQuery("")}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 font-bold text-xs"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      {/* 2-column grid of stores with modern card overlays */}
                      <div className="grid grid-cols-2 gap-2">
                        {(() => {
                          const displayedStores = storeSearchQuery.trim()
                            ? STORE_PAGES.flat().filter((s) =>
                                s
                                  .toLowerCase()
                                  .includes(storeSearchQuery.toLowerCase()),
                              )
                            : STORE_PAGES[
                                tgKeyboard === "stores_p1"
                                  ? 0
                                  : tgKeyboard === "stores_p2"
                                    ? 1
                                    : tgKeyboard === "stores_p3"
                                      ? 2
                                      : 3
                              ] || [];

                          if (displayedStores.length === 0) {
                            return (
                              <div className="col-span-full py-8 text-center text-slate-400 font-bold text-xs flex flex-col items-center justify-center gap-1.5 animate-fadeIn">
                                <span>
                                  🔍{" "}
                                  {isAmharic
                                    ? "ምንም አልተገኘም"
                                    : "No matches found"}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setStoreSearchQuery("")}
                                  className="text-orange-600 hover:underline text-[10px]"
                                >
                                  {isAmharic ? "ፍለጋውን አጽዳ" : "Clear search"}
                                </button>
                              </div>
                            );
                          }

                          return displayedStores.map((store, sIdx) => {
                            const isEyob = store === "Eyob Book Zone";
                            if (isEyob) return null;

                            const meta = getStoreMeta(store);

                            return (
                              <button
                                key={sIdx}
                                type="button"
                                onClick={() =>
                                  handleKeyboardAction("select_store", store)
                                }
                                className="bg-white hover:bg-slate-50 border border-slate-200/85 text-slate-800 rounded-xl overflow-hidden flex flex-col transition-all cursor-pointer shadow-3xs hover:shadow-2xs hover:-translate-y-0.5 active:scale-98 font-sans w-full text-left"
                                title={store}
                              >
                                <div className="w-full h-15 bg-slate-100 relative">
                                  <img
                                    src={meta.image}
                                    alt={store}
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute top-1 right-1 bg-white/95 backdrop-blur-3xs text-slate-800 text-[8.5px] font-black px-1.5 py-0.2 rounded-full shadow-3xs">
                                    ⭐ {meta.rating}
                                  </div>
                                </div>
                                <div className="p-1.5 flex flex-col min-w-0">
                                  <span className="text-[9.5px] font-extrabold text-slate-800 truncate block leading-tight tracking-tight uppercase">
                                    {store}
                                  </span>
                                  <span className="text-[8.5px] text-slate-400 font-bold leading-normal">
                                    ⏱️ {meta.deliveryTime}
                                  </span>
                                </div>
                              </button>
                            );
                          });
                        })()}
                      </div>

                      {/* Special case: Eyob Book Zone rendered full width */}
                      {tgKeyboard === "stores_p4" && (
                        <button
                          type="button"
                          onClick={() =>
                            handleKeyboardAction(
                              "select_store",
                              "Eyob Book Zone",
                            )
                          }
                          className="w-full bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white font-extrabold text-[11px] py-3 px-1.5 rounded-xl text-center flex items-center justify-center transition cursor-pointer shadow-sm active:scale-98 font-bold"
                        >
                          📓 Eyob Book Zone
                        </button>
                      )}

                      {/* Navigation Row */}
                      <div className="space-y-1.5 mt-2 border-t border-slate-200 pt-2">
                        <div className="grid grid-cols-2 gap-1.5 animate-fadeIn">
                          {tgKeyboard !== "stores_p1" ? (
                            <button
                              type="button"
                              onClick={() => {
                                const prevPage =
                                  tgKeyboard === "stores_p2"
                                    ? "stores_p1"
                                    : tgKeyboard === "stores_p3"
                                      ? "stores_p2"
                                      : "stores_p3";
                                setTgKeyboard(prevPage as any);
                              }}
                              className={`bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-[11.5px] py-2.5 rounded-xl text-center flex items-center justify-center transition cursor-pointer shadow-2xs ${tgKeyboard === "stores_p4" ? "col-span-2" : ""}`}
                            >
                              ◀ Prev
                            </button>
                          ) : null}

                          {tgKeyboard !== "stores_p4" ? (
                            <button
                              type="button"
                              onClick={() => {
                                const nextPage =
                                  tgKeyboard === "stores_p1"
                                    ? "stores_p2"
                                    : tgKeyboard === "stores_p2"
                                      ? "stores_p3"
                                      : "stores_p4";
                                setTgKeyboard(nextPage as any);
                              }}
                              className={`bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white font-extrabold text-[11.5px] py-2.5 rounded-xl text-center flex items-center justify-center transition cursor-pointer border-none shadow-sm ${tgKeyboard === "stores_p1" ? "col-span-2" : ""}`}
                            >
                              Next ▶
                            </button>
                          ) : null}
                        </div>

                        {/* Back, Cancel */}
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            onClick={() => setTgKeyboard("main")}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11.5px] py-2 rounded-xl text-center flex items-center justify-center gap-1 transition cursor-pointer border border-slate-250 shadow-2xs"
                          >
                            🔙 Back
                          </button>
                          <button
                            type="button"
                            onClick={() => setTgKeyboard("main")}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-[11.5px] py-2 rounded-xl text-center flex items-center justify-center transition cursor-pointer border border-rose-200 shadow-2xs"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Unified Single Action bot-keyboard button to set customer detail preferences, phone, location AND choice details */}
      <div className="px-3.5 py-3 bg-white border-t border-slate-200 flex items-center shrink-0 select-none">
        <button
          id="btn-open-webapp-menu"
          type="button"
          onClick={() => {
            setToastMessage(`🚀 Launching ቶሎ | Tollo Delivery Mini App...`);
            setTimeout(() => setToastMessage(null), 3000);
            setIsMenuOpen(true);
          }}
          className="w-full bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white text-xs font-extrabold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md transform active:scale-95 duration-100 font-sans tracking-wide font-bold animate-pulse-subtle"
        >
          {isAmharic
            ? "🍔 ቶሎ ክፈት | Open Tollo Delivery"
            : "🍔 Open Tollo Delivery"}
        </button>
      </div>

      {/* Input Message Form */}
      <form
        onSubmit={handleSubmit}
        className="p-3 bg-[#f0f3f6] border-t border-slate-200 flex gap-1.5 shrink-0"
      >
        <label
          className="bg-white border border-slate-250 hover:bg-slate-100 text-slate-650 p-2.5 rounded-xl transition cursor-pointer flex items-center justify-center shrink-0 shadow-3xs"
          title="Attach Telebirr / CBE payment screenshot"
        >
          <ImageIcon className="w-4 h-4 text-[#1e88e5]" />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                  if (event.target?.result) {
                    onReceiptPhotoChange?.(event.target.result as string);
                    setToastMessage(
                      isAmharic
                        ? "📸 የክፍያ ማረጋገጫ ፎቶ በትክክል ተያይዟል!"
                        : "📸 CBE / Telebirr Receipt Screenshot attached!",
                    );
                    setTimeout(() => setToastMessage(null), 3500);
                  }
                };
                reader.readAsDataURL(file);
              }
            }}
          />
        </label>

        <input
          id="tg-chat-input"
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isParsing}
          placeholder={
            isParsing
              ? isAmharic
                ? "እባክዎን ይጠብቁ..."
                : "Please wait..."
              : isAmharic
                ? "እዚህ ትዕዛዝዎን ይጻፉ..."
                : "Write your custom order message..."
          }
          className="flex-1 bg-slate-150 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-400 font-sans min-w-0"
        />
        <button
          id="tg-send-btn"
          type="submit"
          disabled={!inputText.trim() || isParsing}
          className="bg-[#1e88e5] text-white p-2.5 rounded-xl hover:bg-[#1565c0] transition disabled:bg-slate-200 disabled:text-slate-400 transform active:scale-95 shrink-0 cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Simulated TELEGRAM WEB-APP SLIDE BACKDROP DRAWER CHOOSE FOODS */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop shadow overlay inside app bounds */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="absolute inset-0 bg-slate-900/40 z-30 transition-opacity"
            />

            {/* Slider Drawer Canvas */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="absolute inset-x-0 bottom-0 top-[60px] bg-white z-40 flex flex-col rounded-t-2xl shadow-2xl border-t border-slate-200 overflow-hidden"
            >
              {/* WebApp Topbar */}
              <div className="bg-[var(--brand-primary)] text-white px-4 py-3 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm animate-pulse">⚡</span>
                  <div>
                    <h4 className="font-extrabold text-xs tracking-tight uppercase">
                      {isAmharic
                        ? "ቶሎ የፈጣን ትዕዛዝ መተግበሪያ"
                        : "Tolo Speedy Delivery App"}
                    </h4>
                    <p className="text-[9px] text-[rgba(255,255,255,0.7)] font-mono tracking-wider">
                      {isAmharic
                        ? "ይዘዙ እና ይደሰቱ!"
                        : "BROWSE AND SELECT STORE COMMANDS"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-white hover:text-orange-100 transition font-black text-xs bg-[var(--brand-primary-hover)] hover:bg-[var(--brand-primary)] px-3 py-1.5 rounded-full cursor-pointer shadow-2xs"
                >
                  {isAmharic ? "ዝጋ" : "Close App"}
                </button>
              </div>

              {/* Dynamic menu content container representing the Custom Web App Menu */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 flex flex-col justify-between">
                <div>
                  {webAppKeyboard === "main" ? null : (
                    <>
                      {/* Web App Branding Portal Box */}
                      <div className="bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-primary-hover)] text-white rounded-2xl p-4 shadow-sm text-center mb-4 font-sans relative overflow-hidden">
                        <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-white/10 rounded-full blur-xl" />
                        <h3 className="font-extrabold text-xs md:text-sm tracking-wide flex items-center justify-center gap-1.5 uppercase">
                          🛵{" "}
                          {isAmharic
                            ? "ቶሎ ፈጣን መላኪያ መተግበሪያ"
                            : "Tollo Speedy Delivery Portal"}
                        </h3>
                        <p className="text-[10px] text-orange-50 font-medium mt-1 leading-normal">
                          {isAmharic
                            ? "ምቹ እና ፈጣን የትዕዛዝ መተግበሪያ፤ ሱቆችን ይምረጡ፣ በቀጥታ ይዘዙ።"
                            : "Browse partner restaurants and place orders effortlessly."}
                        </p>
                      </div>

                      {/* Profile/System State Box for Continuity */}
                      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 flex justify-between items-center text-xs text-slate-700 font-sans shadow-2xs mb-4">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-full bg-[rgba(var(--brand-primary-rgb),0.06)] text-[var(--brand-primary)] font-extrabold uppercase border border-[rgba(var(--brand-primary-rgb),0.18)] flex items-center justify-center text-sm shadow-2xs">
                            {customerProfile.name
                              ? customerProfile.name.charAt(0)
                              : "U"}
                          </div>
                          <div className="leading-snug">
                            <span className="font-extrabold text-[12px] block text-slate-800">
                              {customerProfile.name ||
                                (isAmharic ? "እንግዳ ደንበኛ" : "Guest Customer")}
                            </span>
                            <span className="text-[10.5px] text-slate-400 font-mono font-medium">
                              {customerProfile.phone ||
                                (isAmharic ? "ስልክ አልተገለጸም" : "No Phone")}
                            </span>
                          </div>
                        </div>
                        {customerProfile.pickupAddress && (
                          <span className="bg-[rgba(var(--brand-primary-rgb),0.06)] text-[var(--brand-primary)] border border-[rgba(var(--brand-primary-rgb),0.18)] rounded-full px-3 py-1 text-[10px] font-extrabold max-w-[150px] truncate leading-tight shadow-3xs">
                            🏪 {customerProfile.pickupAddress}
                          </span>
                        )}
                      </div>

                      {/* Render the Custom Telegram Bot Menu Keyboard in Web App */}
                      <div className="p-3 bg-white border border-slate-200/85 rounded-2xl space-y-3 select-none shadow-2xs">
                        {webAppKeyboard === "mountain_hotel_menu" ||
                        webAppKeyboard === "htown_menu" ||
                        webAppKeyboard === "sunny_menu" ||
                        webAppKeyboard === "rome_menu" ||
                        webAppKeyboard === "aroma_menu" ||
                        webAppKeyboard === "chanoly_menu" ||
                        webAppKeyboard === "neba_menu" ||
                        webAppKeyboard === "marti_menu" ||
                        webAppKeyboard === "yom_menu" ||
                        webAppKeyboard === "barcon_menu" ||
                        webAppKeyboard === "medi_shiro_menu" ||
                        webAppKeyboard === "lewi_piyasa_menu" ||
                        webAppKeyboard === "twins_kitchen_menu" ||
                        webAppKeyboard === "mohi_ertb_menu" ||
                        webAppKeyboard === "selam_special_menu" ||
                        webAppKeyboard === "cafe_9_menu" ||
                        webAppKeyboard === "liyu_taim_menu" ||
                        webAppKeyboard === "zanzibar_menu" ||
                        webAppKeyboard === "time_cafe_menu" ||
                        webAppKeyboard === "fenet_kitfo_menu" ||
                        webAppKeyboard === "bekos_pastry_menu" ||
                        webAppKeyboard === "light_burger_menu" ||
                        webAppKeyboard === "ana_cafe_menu" ||
                        webAppKeyboard === "safeland_cafe_menu" ||
                        webAppKeyboard === "addis_asa_menu" ||
                        webAppKeyboard === "chef_teketel_menu" ||
                        webAppKeyboard === "dani_chef_menu" ||
                        webAppKeyboard === "funche_shiro_menu" ||
                        webAppKeyboard === "habtsh_menu" ||
                        webAppKeyboard === "boss_fries_menu" ||
                        webAppKeyboard === "bliss_coffee_menu" ||
                        webAppKeyboard === "tina_faya_menu" ||
                        webAppKeyboard === "azi_hotel_menu" ||
                        webAppKeyboard === "abenezer_kurt_menu" ||
                        webAppKeyboard === "feven_restaurant_menu" ||
                        webAppKeyboard === "abiy_filafil_menu" ||
                        webAppKeyboard === "tewedaj_menu" ||
                        webAppKeyboard === "yellow_burger_menu" ||
                        webAppKeyboard === "antsokiya_menu" ||
                        webAppKeyboard === "hibir_menu" ||
                        webAppKeyboard === "mamas_cheko_menu" ||
                        webAppKeyboard === "sunny_burger_2_menu" ||
                        webAppKeyboard === "rekik_coffee_menu" ||
                        webAppKeyboard === "emi_pizza_menu" ||
                        webAppKeyboard === "yahweh_nisse_menu" ||
                        webAppKeyboard === "colors_cafe_menu" || webAppKeyboard === "moonlight_restorant_menu" || webAppKeyboard === "nota_lounge_menu" || webAppKeyboard === "queen_kitchen_menu" || webAppKeyboard === "konjo_cake_menu" || webAppKeyboard === "jalebib_muslim_menu" || webAppKeyboard === "mercy_fruit_menu" || webAppKeyboard === "taso_italian_menu" ? (
                          renderInteractiveMenu(
                            true,
                            webAppKeyboard === "mountain_hotel_menu"
                              ? "mountain"
                              : webAppKeyboard === "htown_menu"
                                ? "htown"
                                : webAppKeyboard === "sunny_menu"
                                  ? "sunny"
                                  : webAppKeyboard === "rome_menu"
                                    ? "rome"
                                    : webAppKeyboard === "aroma_menu"
                                      ? "aroma"
                                      : webAppKeyboard === "chanoly_menu"
                                        ? "chanoly"
                                        : webAppKeyboard === "neba_menu"
                                          ? "neba"
                                          : webAppKeyboard === "marti_menu"
                                            ? "marti"
                                            : webAppKeyboard === "barcon_menu"
                                              ? "barcon"
                                              : webAppKeyboard ===
                                                  "medi_shiro_menu"
                                                ? "medi_shiro"
                                                : webAppKeyboard ===
                                                    "lewi_piyasa_menu"
                                                  ? "lewi_piyasa"
                                                  : webAppKeyboard ===
                                                      "twins_kitchen_menu"
                                                    ? "twins_kitchen"
                                                    : webAppKeyboard ===
                                                        "mohi_ertb_menu"
                                                      ? "mohi_ertb"
                                                      : webAppKeyboard ===
                                                          "selam_special_menu"
                                                        ? "selam_special"
                                                        : webAppKeyboard ===
                                                            "cafe_9_menu"
                                                          ? "cafe_9"
                                                          : webAppKeyboard ===
                                                              "liyu_taim_menu"
                                                            ? "liyu_taim"
                                                            : webAppKeyboard ===
                                                                "zanzibar_menu"
                                                              ? "zanzibar"
                                                              : webAppKeyboard ===
                                                                  "time_cafe_menu"
                                                                ? "time_cafe"
                                                                : webAppKeyboard ===
                                                                    "fenet_kitfo_menu"
                                                                  ? "fenet_kitfo"
                                                                  : webAppKeyboard ===
                                                                      "bekos_pastry_menu"
                                                                    ? "bekos_pastry"
                                                                    : webAppKeyboard ===
                                                                        "light_burger_menu"
                                                                      ? "light_burger"
                                                                      : webAppKeyboard ===
                                                                          "ana_cafe_menu"
                                                                        ? "ana_cafe"
                                                                        : webAppKeyboard ===
                                                                            "safeland_cafe_menu"
                                                                          ? "safeland_cafe"
                                                                          : webAppKeyboard ===
                                                                              "addis_asa_menu"
                                                                            ? "addis_asa"
                                                                            : webAppKeyboard ===
                                                                                "chef_teketel_menu"
                                                                              ? "chef_teketel"
                                                                              : webAppKeyboard ===
                                                                                  "dani_chef_menu"
                                                                                ? "chef_dani"
                                                                                : webAppKeyboard ===
                                                                                    "funche_shiro_menu"
                                                                                  ? "funche_shiro"
                                                                                  : webAppKeyboard ===
                                                                                      "habtsh_menu"
                                                                                    ? "habtsh"
                                                                                    : webAppKeyboard ===
                                                                                        "boss_fries_menu"
                                                                                      ? "boss_fries"
                                                                                      : webAppKeyboard ===
                                                                                          "bliss_coffee_menu"
                                                                                        ? "bliss_coffee"
                                                                                        : webAppKeyboard ===
                                                                                            "tina_faya_menu"
                                                                                          ? "tina_faya"
                                                                                          : webAppKeyboard ===
                                                                                              "azi_hotel_menu"
                                                                                            ? "azi_hotel"
                                                                                            : webAppKeyboard ===
                                                                                                "abenezer_kurt_menu"
                                                                                              ? "abenezer_kurt"
                                                                                              : webAppKeyboard ===
                                                                                                  "feven_restaurant_menu"
                                                                                                ? "feven"
                                                                                                : webAppKeyboard ===
                                                                                                    "abiy_filafil_menu"
                                                                                                  ? "abiy_filafil"
                                                                                                  : webAppKeyboard ===
                                                                                                      "tewedaj_menu"
                                                                                                    ? "tewedaj"
                                                                                                    : webAppKeyboard ===
                                                                                                        "yellow_burger_menu"
                                                                                                      ? "yellow_burger"
                                                                                                      : webAppKeyboard ===
                                                                                                          "antsokiya_menu"
                                                                                                        ? "antsokiya"
                                                                                                        : webAppKeyboard ===
                                                                                                            "hibir_menu"
                                                                                                          ? "hibir"
                                                                                                          : webAppKeyboard ===
                                                                                                              "mamas_cheko_menu"
                                                                                                            ? "mamas_cheko"
                                                                                                            : webAppKeyboard ===
                                                                                                                "sunny_burger_2_menu"
                                                                                                              ? "sunny_burger_2"
                                                                                                              : webAppKeyboard ===
                                                                                                                  "rekik_coffee_menu"
                                                                                                                ? "rekik_coffee"
                                                                                                                : webAppKeyboard ===
                                                                                                                    "emi_pizza_menu"
                                                                                                                  ? "emi_pizza"
                                                                                                                  : webAppKeyboard ===
                                                                                                                      "yahweh_nisse_menu"
                                                                                                                    ? "yahweh_nisse"
                                                                                                                    : webAppKeyboard === "colors_cafe_menu" ? "colors_cafe" : webAppKeyboard === "moonlight_restorant_menu" ? "moonlight_restorant" : webAppKeyboard === "nota_lounge_menu" ? "nota_lounge" : webAppKeyboard === "queen_kitchen_menu" ? "queen_kitchen" : webAppKeyboard === "konjo_cake_menu" ? "konjo_cake" : webAppKeyboard === "jalebib_muslim_menu" ? "jalebib_muslim" : webAppKeyboard === "mercy_fruit_menu" ? "mercy_fruit" : webAppKeyboard === "taso_italian_menu" ? "taso_italian" : "yom",
                          )
                        ) : (
                          <>
                            {/* Active menu conversation subtitle */}
                            <div className="bg-slate-50 text-slate-800 rounded-2xl px-4 py-3 border border-slate-100 shadow-2xs text-xs md:text-sm max-w-full flex flex-col gap-1 font-sans">
                              <span className="font-extrabold text-slate-800 leading-relaxed text-[11px] md:text-[12px] uppercase tracking-wide">
                                {isAmharic
                                  ? "እባክዎን የትዕዛዝ መነሻ ሱቅ (ካፌ) ይምረጡ፦"
                                  : "Select a partner restaurant/cafe below:"}
                              </span>
                            </div>

                            {/* Button grids & page switches */}
                            <div className="mt-2 text-xs">
                              {/* Search bar inside Web App */}
                              <div className="relative w-full mb-3 px-1">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                  <Search size={14} />
                                </div>
                                <input
                                  type="text"
                                  placeholder={
                                    isAmharic
                                      ? "ሆቴሎችን ይፈልጉ..."
                                      : "Search hotels/restaurants..."
                                  }
                                  value={storeSearchQuery}
                                  onChange={(e) =>
                                    setStoreSearchQuery(e.target.value)
                                  }
                                  className="w-full bg-white border border-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none rounded-xl py-2 pl-9 pr-8 text-[11px] font-semibold shadow-3xs transition-all duration-150"
                                />
                                {storeSearchQuery && (
                                  <button
                                    type="button"
                                    onClick={() => setStoreSearchQuery("")}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 font-bold text-xs"
                                  >
                                    ✕
                                  </button>
                                )}
                              </div>

                              {/* Restaurant grid rendered directly */}
                              <div className="w-full flex flex-col gap-3 font-sans animate-fadeIn">
                                {/* Restaurant Selection Grid with rating, images, and lift animations */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto p-1 bg-slate-50/40 rounded-xl">
                                  {(() => {
                                    const displayedStores =
                                      storeSearchQuery.trim()
                                        ? STORE_PAGES.flat().filter((s) =>
                                            s
                                              .toLowerCase()
                                              .includes(
                                                storeSearchQuery.toLowerCase(),
                                              ),
                                          )
                                        : STORE_PAGES[
                                            webAppKeyboard === "stores_p1"
                                              ? 0
                                              : webAppKeyboard === "stores_p2"
                                                ? 1
                                                : webAppKeyboard === "stores_p3"
                                                  ? 2
                                                  : 3
                                          ] || [];

                                    if (displayedStores.length === 0) {
                                      return (
                                        <div className="col-span-full py-10 text-center text-slate-400 font-bold text-xs flex flex-col items-center justify-center gap-1.5">
                                          <span>
                                            🔍{" "}
                                            {isAmharic
                                              ? "ምንም አልተገኘም"
                                              : "No matches found"}
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setStoreSearchQuery("")
                                            }
                                            className="text-orange-600 hover:underline text-[10px]"
                                          >
                                            {isAmharic
                                              ? "ፍለጋውን አጽዳ"
                                              : "Clear search"}
                                          </button>
                                        </div>
                                      );
                                    }

                                    return displayedStores.map(
                                      (store, sIdx) => {
                                        const isEyob =
                                          store === "Eyob Book Zone";
                                        if (isEyob) return null;

                                        const meta = getStoreMeta(store);

                                        return (
                                          <button
                                            key={sIdx}
                                            type="button"
                                            onClick={() => {
                                              setLocalPickupAddress(store);
                                              onSendMessage(
                                                `StoreSelected: ${store}`,
                                              );
                                              if (
                                                store === "Mountain Hotel" ||
                                                store === "Mountain cafe"
                                              ) {
                                                setWebAppKeyboard(
                                                  "mountain_hotel_menu",
                                                );
                                                setMountainCategory("Juice");
                                                setMenuPage(0);
                                                setToastMessage(
                                                  "⛰️ Opening Mountain Hotel Live Interactive Menu!",
                                                );
                                              } else if (
                                                store === "H-Town Burger"
                                              ) {
                                                setWebAppKeyboard("htown_menu");
                                                setMountainCategory("Burger");
                                                setMenuPage(0);
                                                setToastMessage(
                                                  "🍔 Opening H-Town Burger Premium Menu!",
                                                );
                                              } else if (
                                                store
                                                  .toLowerCase()
                                                  .includes("sunny")
                                              ) {
                                                if (
                                                  store.includes("2") ||
                                                  store
                                                    .toLowerCase()
                                                    .includes("two")
                                                ) {
                                                  setWebAppKeyboard(
                                                    "sunny_burger_2_menu",
                                                  );
                                                  setMountainCategory("Burger");
                                                  setMenuPage(0);
                                                  setToastMessage(
                                                    "☀️ Opening Sunny Burger #2 Premium Menu!",
                                                  );
                                                  setTimeout(
                                                    () => setToastMessage(null),
                                                    4000,
                                                  );
                                                  return;
                                                }
                                                setWebAppKeyboard("sunny_menu");
                                                setMountainCategory("Burger");
                                                setMenuPage(0);
                                                setToastMessage(
                                                  "☀️ Opening Sunny Burger Premium Menu!",
                                                );
                                              } else if (
                                                store === "Mama's Cheko Bar" ||
                                                store
                                                  .toLowerCase()
                                                  .includes("mamas cheko") ||
                                                store
                                                  .toLowerCase()
                                                  .includes("cheko")
                                              ) {
                                                setWebAppKeyboard(
                                                  "mamas_cheko_menu",
                                                );
                                                setMountainCategory("Cake");
                                                setMenuPage(0);
                                                setToastMessage(
                                                  "🍰 Opening Mama's Cheko Bar Premium Menu!",
                                                );
                                              } else if (
                                                store === "Rekik Coffee" ||
                                                store
                                                  .toLowerCase()
                                                  .includes("rekik")
                                              ) {
                                                setWebAppKeyboard(
                                                  "rekik_coffee_menu",
                                                );
                                                setMountainCategory("Habeshan");
                                                setMenuPage(0);
                                                setToastMessage(
                                                  "☕ Opening Rekik Coffee Premium Menu!",
                                                );
                                              } else if (
                                                store === "Emi Pizza" ||
                                                store
                                                  .toLowerCase()
                                                  .includes("emi")
                                              ) {
                                                setWebAppKeyboard(
                                                  "emi_pizza_menu",
                                                );
                                                setMountainCategory("Pizza");
                                                setMenuPage(0);
                                                setToastMessage(
                                                  "🍕 Opening Emi Pizza Premium Menu!",
                                                );
                                              } else if (
                                                store === "Yahiw Nisse Cafe & Restaurant" ||
                                                store
                                                  .toLowerCase()
                                                  .includes("yahiw") ||
                                                store
                                                  .toLowerCase()
                                                  .includes("nisse") ||
                                                store
                                                  .toLowerCase()
                                                  .includes("yahweh")
                                              ) {
                                                setWebAppKeyboard(
                                                  "yahweh_nisse_menu",
                                                );
                                                setMountainCategory("Habeshan");
                                                setMenuPage(0);
                                                setToastMessage(
                                                  "🥘 Opening Yahiw Nisse Premium Menu!",
                                                );
                                              } else if (
                                                store === "Mercy Fruit Salad" ||
                                                store
                                                  .toLowerCase()
                                                  .includes("mercy")
                                              ) {
                                                setWebAppKeyboard(
                                                  "mercy_fruit_menu",
                                                );
                                                setMountainCategory("Juice");
                                                setMenuPage(0);
                                                setToastMessage(
                                                  "🍹 Opening Mercy Fruit Premium Menu!",
                                                );
                                              } else if (
                                                store === "Taso Italian ice cream and Cafe" ||
                                                store
                                                  .toLowerCase()
                                                  .includes("taso") ||
                                                store
                                                  .toLowerCase()
                                                  .includes("italian")
                                              ) {
                                                setWebAppKeyboard(
                                                  "taso_italian_menu",
                                                );
                                                setMountainCategory("Pizza");
                                                setMenuPage(0);
                                                setToastMessage(
                                                  "🍦 Opening Taso Italian Premium Menu!",
                                                );
                                              } else if (
                                                store === "Colors Cafe" ||
                                                store
                                                  .toLowerCase()
                                                  .includes("colors")
                                              ) {
                                                setWebAppKeyboard(
                                                  "colors_cafe_menu",
                                                );
                                                setMountainCategory("Cake");
                                                setMenuPage(0);
                                                setToastMessage(
                                                  "🍰 Opening Colors Cafe Premium Menu!",
                                                );
                                              } else if (
                                                store === "Moonlight Restorant" ||
                                                store
                                                  .toLowerCase()
                                                  .includes("moonlight")
                                              ) {
                                                setWebAppKeyboard(
                                                  "moonlight_restorant_menu",
                                                );
                                                setMountainCategory("Chicken");
                                                setMenuPage(0);
                                                setToastMessage(
                                                  "🌙 Opening Moonlight Restorant Premium Menu!",
                                                );
                                              } else if (
                                                store === "Nota Lounge" ||
                                                 store
                                                   .toLowerCase()
                                                   .includes("nota")
                                               ) {
                                                 setWebAppKeyboard(
                                                   "nota_lounge_menu",
                                                 );
                                                 setMountainCategory("Burger");
                                                 setMenuPage(0);
                                                 setToastMessage(
                                                   "🍔 Opening Nota Lounge Premium Menu!",
                                                 );
                                               } else if (
                                                 store === "Konjo Cake" ||
                                                 store
                                                   .toLowerCase()
                                                   .includes("konjo")
                                               ) {
                                                 setWebAppKeyboard(
                                                   "konjo_cake_menu",
                                                 );
                                                 setMountainCategory("Cake");
                                                 setMenuPage(0);
                                                 setToastMessage(
                                                   "🍰 Opening Konjo Cake Premium Menu!",
                                                 );
                                               } else if (
                                                 store === "ጃለቢብ የሙስሊም ሬስቶራንት" ||
                                                 store
                                                   .toLowerCase()
                                                   .includes("ጃለቢብ") ||
                                                 store
                                                   .toLowerCase()
                                                   .includes("jalebib") ||
                                                 store
                                                   .toLowerCase()
                                                   .includes("jelebib") ||
                                                 store
                                                   .toLowerCase()
                                                   .includes("muslim")
                                               ) {
                                                 setWebAppKeyboard(
                                                   "jalebib_muslim_menu",
                                                 );
                                                 setMountainCategory("Habeshan");
                                                 setMenuPage(0);
                                                 setToastMessage(
                                                   "🍲 Opening ጃለቢብ የሙስሊም ሬስቶራንት Premium Menu!",
                                                 );
                                               } else if (false) {
                                                 // Queen Kitchen premium webapp trigger disabled
                                              } else if (
                                                store === "Rome 1960 Cafe" ||
                                                store
                                                  .toLowerCase()
                                                  .includes("rome")
                                              ) {
                                                setWebAppKeyboard("rome_menu");
                                                setMountainCategory("Pizza");
                                                setMenuPage(0);
                                                setToastMessage(
                                                  "🇮🇹 Opening Rome 1960 Cafe Premium Menu!",
                                                );
                                              } else if (
                                                store === "Aroma cafe" ||
                                                store
                                                  .toLowerCase()
                                                  .includes("aroma")
                                              ) {
                                                setWebAppKeyboard("aroma_menu");
                                                setMountainCategory(
                                                  "Breakfast",
                                                );
                                                setMenuPage(0);
                                                setToastMessage(
                                                  "☕ Opening Aroma Cafe Premium Menu!",
                                                );
                                              } else if (
                                                store === "Chanoly Noodles" ||
                                                store
                                                  .toLowerCase()
                                                  .includes("chanoly")
                                              ) {
                                                setWebAppKeyboard(
                                                  "chanoly_menu",
                                                );
                                                setMountainCategory("Noodles");
                                                setMenuPage(0);
                                                setToastMessage(
                                                  "🍜 Opening Chanoly Noodles Premium Menu!",
                                                );
                                              } else if (
                                                store === "Marti kitchen" ||
                                                store
                                                  .toLowerCase()
                                                  .includes("marti")
                                              ) {
                                                setWebAppKeyboard("marti_menu");
                                                setMountainCategory("Local");
                                                setMenuPage(0);
                                                setToastMessage(
                                                  "🥘 Opening Marti Kitchen Premium Menu!",
                                                );
                                              } else if (
                                                store === "Neba Cafe" ||
                                                store
                                                  .toLowerCase()
                                                  .includes("neba")
                                              ) {
                                                setWebAppKeyboard("neba_menu");
                                                setMountainCategory("Burger");
                                                setMenuPage(0);
                                                setToastMessage(
                                                  "🍔 Opening Neba Cafe Premium Menu!",
                                                );
                                              } else if (
                                                store === "YOM BURGERIZZA" ||
                                                store
                                                  .toLowerCase()
                                                  .includes("yom") ||
                                                store
                                                  .toLowerCase()
                                                  .includes("burgerizza")
                                              ) {
                                                setWebAppKeyboard("yom_menu");
                                                setMountainCategory("Burger");
                                                setMenuPage(0);
                                                setToastMessage(
                                                  "🍔 Opening YOM Burgerizza Premium Menu!",
                                                );
                                              } else if (
                                                store === "Barcon Migb Bet" ||
                                                store
                                                  .toLowerCase()
                                                  .includes("barcon") ||
                                                store
                                                  .toLowerCase()
                                                  .includes("barkon")
                                              ) {
                                                setWebAppKeyboard(
                                                  "barcon_menu",
                                                );
                                                setMountainCategory("Injera");
                                                setMenuPage(0);
                                                setToastMessage(
                                                  "🥘 Opening Barkon ምግብ ቤት Premium Menu!",
                                                );
                                              } else if (
                                                store ===
                                                  "liyu taim migb bet" ||
                                                store ===
                                                  "Liyu Taim (ልዩ ጣዕም)" ||
                                                store
                                                  .toLowerCase()
                                                  .includes("liyu") ||
                                                store
                                                  .toLowerCase()
                                                  .includes("taim")
                                              ) {
                                                setWebAppKeyboard(
                                                  "liyu_taim_menu",
                                                );
                                                setMountainCategory("Injera");
                                                setMenuPage(0);
                                                setToastMessage(
                                                  "🥘 Opening Liyu Taim (ልዩ ጣዕም) Premium Menu!",
                                                );
                                              } else if (
                                                store === "Zanzibar kitchen" ||
                                                store
                                                  .toLowerCase()
                                                  .includes("zanzibar")
                                              ) {
                                                setWebAppKeyboard(
                                                  "zanzibar_menu",
                                                );
                                                setMountainCategory("Fish");
                                                setMenuPage(0);
                                                setToastMessage(
                                                  "🥘 Opening Zanzibar kitchen Premium Menu!",
                                                );
                                              } else if (
                                                store === "medi shiro" ||
                                                store
                                                  .toLowerCase()
                                                  .includes("medi shiro") ||
                                                store
                                                  .toLowerCase()
                                                  .includes("medi_shiro") ||
                                                store
                                                  .toLowerCase()
                                                  .includes("medishiro")
                                              ) {
                                                setWebAppKeyboard(
                                                  "medi_shiro_menu",
                                                );
                                                setMountainCategory("Injera");
                                                setMenuPage(0);
                                                setToastMessage(
                                                  "🥘 Opening Medi Shiro Premium Menu!",
                                                );
                                              } else if (
                                                store === "Lewi piyasa" ||
                                                store
                                                  .toLowerCase()
                                                  .includes("lewi") ||
                                                store
                                                  .toLowerCase()
                                                  .includes("piyasa") ||
                                                store
                                                  .toLowerCase()
                                                  .includes("piyassa")
                                              ) {
                                                setWebAppKeyboard(
                                                  "lewi_piyasa_menu",
                                                );
                                                setMountainCategory("Pizza");
                                                setMenuPage(0);
                                                setToastMessage(
                                                  "🍕 Opening Lewi Piyassa Premium Menu!",
                                                );
                                              } else if (
                                                store === "Twin's Kitchen" ||
                                                store
                                                  .toLowerCase()
                                                  .includes("twin") ||
                                                store
                                                  .toLowerCase()
                                                  .includes("twins")
                                              ) {
                                                setWebAppKeyboard(
                                                  "twins_kitchen_menu",
                                                );
                                                setMountainCategory("Local");
                                                setMenuPage(0);
                                                setToastMessage(
                                                  "🥘 Opening Twin's Kitchen Premium Menu!",
                                                );
                                              } else if (
                                                store === "Mohi Ertb" ||
                                                store
                                                  .toLowerCase()
                                                  .includes("mohi") ||
                                                store
                                                  .toLowerCase()
                                                  .includes("ertb") ||
                                                store
                                                  .toLowerCase()
                                                  .includes("ertib")
                                              ) {
                                                setWebAppKeyboard(
                                                  "mohi_ertb_menu",
                                                );
                                                setMountainCategory("Sandwich");
                                                setMenuPage(0);
                                                setToastMessage(
                                                  "🥘 Opening Mohi Ertb Premium Menu!",
                                                );
                                              } else if (
                                                store === "selam special" ||
                                                store
                                                  .toLowerCase()
                                                  .includes("selam")
                                              ) {
                                                setWebAppKeyboard(
                                                  "selam_special_menu",
                                                );
                                                setMountainCategory("Local");
                                                setMenuPage(0);
                                                setToastMessage(
                                                  "🥘 Opening Selam Special Premium Menu!",
                                                );
                                              } else if (
                                                store === "Cafe 9" ||
                                                store
                                                  .toLowerCase()
                                                  .includes("cafe 9") ||
                                                store
                                                  .toLowerCase()
                                                  .includes("cafe9") ||
                                                store
                                                  .toLowerCase()
                                                  .includes("cafe_9")
                                              ) {
                                                setWebAppKeyboard(
                                                  "cafe_9_menu",
                                                );
                                                setMountainCategory("Local");
                                                setMenuPage(0);
                                                setToastMessage(
                                                  "🥘 Opening Cafe 9 Premium Menu!",
                                                );
                                              } else if (
                                                store === "Time Cafe" ||
                                                store
                                                  .toLowerCase()
                                                  .includes("time")
                                              ) {
                                                setWebAppKeyboard(
                                                  "time_cafe_menu",
                                                );
                                                setMountainCategory("Sandwich");
                                                setMenuPage(0);
                                                setToastMessage(
                                                  "☕ Opening Time Cafe Premium Menu!",
                                                );
                                              } else if (
                                                store === "fenet kitfo" ||
                                                store
                                                  .toLowerCase()
                                                  .includes("fenet") ||
                                                store
                                                  .toLowerCase()
                                                  .includes("kitfo")
                                              ) {
                                                setWebAppKeyboard(
                                                  "fenet_kitfo_menu",
                                                );
                                                setMountainCategory("Habeshan");
                                                setMenuPage(0);
                                                setToastMessage(
                                                  "🥘 Opening Fenet Kitfo Premium Menu!",
                                                );
                                              } else if (
                                                store === "Bekos Pastry" ||
                                                store
                                                  .toLowerCase()
                                                  .includes("bekos") ||
                                                store
                                                  .toLowerCase()
                                                  .includes("bekso") ||
                                                store
                                                  .toLowerCase()
                                                  .includes("pastry")
                                              ) {
                                                setWebAppKeyboard(
                                                  "bekos_pastry_menu",
                                                );
                                                setMountainCategory("Cake");
                                                setMenuPage(0);
                                                setToastMessage(
                                                  "🍰 Opening Bekos Pastry Premium Menu!",
                                                );
                                              } else if (
                                                store === "Light Burger" ||
                                                store
                                                  .toLowerCase()
                                                  .includes("light burger") ||
                                                store
                                                  .toLowerCase()
                                                  .includes("light")
                                              ) {
                                                setWebAppKeyboard(
                                                  "light_burger_menu",
                                                );
                                                setMountainCategory("Burger");
                                                setMenuPage(0);
                                                setToastMessage(
                                                  "🍔 Opening Light Burger Premium Menu!",
                                                );
                                              } else if (
                                                store === "Ana Cafe" ||
                                                store
                                                  .toLowerCase()
                                                  .includes("ana") ||
                                                store
                                                  .toLowerCase()
                                                  .includes("ana cafe")
                                              ) {
                                                setWebAppKeyboard(
                                                  "ana_cafe_menu",
                                                );
                                                setMountainCategory("Sandwich");
                                                setMenuPage(0);
                                                setToastMessage(
                                                  "🍽️ Opening Ana Cafe Premium Menu!",
                                                );
                                              } else if (
                                                store ===
                                                  "SAFELAND CAFE Piasa" ||
                                                store
                                                  .toLowerCase()
                                                  .includes("safeland") ||
                                                store
                                                  .toLowerCase()
                                                  .includes("safe")
                                              ) {
                                                setWebAppKeyboard(
                                                  "safeland_cafe_menu",
                                                );
                                                setMountainCategory("Burger");
                                                setMenuPage(0);
                                                setToastMessage(
                                                  "🍔 Opening SAFELAND CAFE Premium Menu!",
                                                );
                                              } else if (
                                                store === "Addis Asa" ||
                                                store
                                                  .toLowerCase()
                                                  .includes("addis asa") ||
                                                store
                                                  .toLowerCase()
                                                  .includes("asa") ||
                                                store
                                                  .toLowerCase()
                                                  .includes("ዓሳ")
                                              ) {
                                                setWebAppKeyboard(
                                                  "addis_asa_menu",
                                                );
                                                setMountainCategory("Fish");
                                                setMenuPage(0);
                                                setToastMessage(
                                                  "🐠 Opening Addis Asa Premium Menu!",
                                                );
                                              } else if (
                                                store === "Chef Teketel" ||
                                                store
                                                  .toLowerCase()
                                                  .includes("teketel") ||
                                                store
                                                  .toLowerCase()
                                                  .includes("chef teketel")
                                              ) {
                                                setWebAppKeyboard(
                                                  "chef_teketel_menu",
                                                );
                                                setMountainCategory("Habeshan");
                                                setMenuPage(0);
                                                setToastMessage(
                                                  "👩‍🍳 Opening Chef Teketel Premium Menu!",
                                                );
                                              } else if (
                                                store === "DANI CHEF" ||
                                                store
                                                  .toLowerCase()
                                                  .includes("dani") ||
                                                store
                                                  .toLowerCase()
                                                  .includes("chef dani")
                                              ) {
                                                setWebAppKeyboard(
                                                  "dani_chef_menu",
                                                );
                                                setMountainCategory("Shawarma");
                                                setMenuPage(0);
                                                setToastMessage(
                                                  "👩‍🍳 Opening DANI CHEF Premium Menu!",
                                                );
                                              } else if (
                                                store === "Funche shiro" ||
                                                store
                                                  .toLowerCase()
                                                  .includes("funche") ||
                                                store
                                                  .toLowerCase()
                                                  .includes("funche shiro")
                                              ) {
                                                setWebAppKeyboard(
                                                  "funche_shiro_menu",
                                                );
                                                setMountainCategory("Habeshan");
                                                setMenuPage(0);
                                                setToastMessage(
                                                  "🥘 Opening Funche shiro Premium Menu!",
                                                );
                                              } else if (
                                                store === "Habtsh Fiyel Tib" ||
                                                store
                                                  .toLowerCase()
                                                  .includes("habtsh")
                                              ) {
                                                setWebAppKeyboard(
                                                  "habtsh_menu",
                                                );
                                                setMountainCategory("Habeshan");
                                                setMenuPage(0);
                                                setToastMessage(
                                                  "🥘 Opening Habtsh Premium Menu!",
                                                );
                                              } else if (
                                                store === "Boss Fries" ||
                                                store
                                                  .toLowerCase()
                                                  .includes("boss fries") ||
                                                store
                                                  .toLowerCase()
                                                  .includes("boss")
                                              ) {
                                                setWebAppKeyboard(
                                                  "boss_fries_menu",
                                                );
                                                setMountainCategory(
                                                  "Breakfast",
                                                );
                                                setMenuPage(0);
                                                setToastMessage(
                                                  "🍟 Opening Boss Fries Premium Menu!",
                                                );
                                              } else if (
                                                store === "Bliss Coffee" ||
                                                store
                                                  .toLowerCase()
                                                  .includes("bliss") ||
                                                store
                                                  .toLowerCase()
                                                  .includes("bliss coffee")
                                              ) {
                                                setWebAppKeyboard(
                                                  "bliss_coffee_menu",
                                                );
                                                setMountainCategory("Cake");
                                                setMenuPage(0);
                                                setToastMessage(
                                                  "☕ Opening Bliss Coffee Premium Menu!",
                                                );
                                              } else if (
                                                store === "Azi Hotel" ||
                                                store
                                                  .toLowerCase()
                                                  .includes("azi") ||
                                                store
                                                  .toLowerCase()
                                                  .includes("azi hotel")
                                              ) {
                                                setWebAppKeyboard(
                                                  "azi_hotel_menu",
                                                );
                                                setMountainCategory(
                                                  "Traditional Foods",
                                                );
                                                setMenuPage(0);
                                                setToastMessage(
                                                  "🏨 Opening Azi Hotel Premium Menu!",
                                                );
                                              } else if (
                                                store === "Tina Faaya Kitfo" ||
                                                store
                                                  .toLowerCase()
                                                  .includes("tina") ||
                                                store
                                                  .toLowerCase()
                                                  .includes("faya") ||
                                                store
                                                  .toLowerCase()
                                                  .includes("faaya")
                                              ) {
                                                setWebAppKeyboard(
                                                  "tina_faya_menu",
                                                );
                                                setMountainCategory(
                                                  "Traditional Foods",
                                                );
                                                setMenuPage(0);
                                                setToastMessage(
                                                  "🥘 Opening Tina Faaya Kitfo Premium Menu!",
                                                );
                                              } else if (
                                                store ===
                                                  "Abenezer Kurt Ena Kitfo" ||
                                                store
                                                  .toLowerCase()
                                                  .includes("abenezer") ||
                                                store
                                                  .toLowerCase()
                                                  .includes("kurt")
                                              ) {
                                                setWebAppKeyboard(
                                                  "abenezer_kurt_menu",
                                                );
                                                setMountainCategory("Habeshan");
                                                setMenuPage(0);
                                                setToastMessage(
                                                  "🥩 Opening Abenezer Kurt Ena Kitfo Premium Menu!",
                                                );
                                              } else if (
                                                store === "Feven Restaurant" ||
                                                store
                                                  .toLowerCase()
                                                  .includes("feven")
                                              ) {
                                                setWebAppKeyboard(
                                                  "feven_restaurant_menu",
                                                );
                                                setMountainCategory("Habeshan");
                                                setMenuPage(0);
                                                setToastMessage(
                                                  "🥘 Opening Feven Restaurant Premium Menu!",
                                                );
                                              } else if (
                                                store === "Abiy Filafil" ||
                                                store
                                                  .toLowerCase()
                                                  .includes("abiy") ||
                                                store
                                                  .toLowerCase()
                                                  .includes("filafil") ||
                                                store
                                                  .toLowerCase()
                                                  .includes("felafil")
                                              ) {
                                                setWebAppKeyboard(
                                                  "abiy_filafil_menu",
                                                );
                                                setMountainCategory(
                                                  "Breakfast",
                                                );
                                                setMenuPage(0);
                                                setToastMessage(
                                                  "🧆 Opening Abiy Filafil Combined Menu!",
                                                );
                                              } else if (
                                                store === "Tewedaj" ||
                                                store
                                                  .toLowerCase()
                                                  .includes("tewedaj")
                                              ) {
                                                setWebAppKeyboard(
                                                  "tewedaj_menu",
                                                );
                                                setMountainCategory("እንጀራ");
                                                setMenuPage(0);
                                                setToastMessage(
                                                  "🥘 Opening Tewedaj Premium Menu!",
                                                );
                                              } else if (
                                                store ===
                                                  "Yellow Burger & Pizza" ||
                                                store === "Yellow Burger" ||
                                                store
                                                  .toLowerCase()
                                                  .includes("yellow burger") ||
                                                store
                                                  .toLowerCase()
                                                  .includes("yellow")
                                              ) {
                                                setWebAppKeyboard(
                                                  "yellow_burger_menu",
                                                );
                                                setMountainCategory("Burger");
                                                setMenuPage(0);
                                                setToastMessage(
                                                  "🍔 Opening Yellow Burger & Pizza Premium Menu!",
                                                );
                                              } else if (
                                                store ===
                                                  "Hibir Cafe & Restorant" ||
                                                store === "Hibir" ||
                                                store
                                                  .toLowerCase()
                                                  .includes("hibir")
                                              ) {
                                                setWebAppKeyboard("hibir_menu");
                                                setMountainCategory("Burger");
                                                setMenuPage(0);
                                                setToastMessage(
                                                  "☕ Opening Hibir Cafe & Restorant Premium Menu!",
                                                );
                                              } else if (
                                                store ===
                                                  "Antsokiya Traditional Food" ||
                                                store === "Antsokiya" ||
                                                store
                                                  .toLowerCase()
                                                  .includes("antsokiya")
                                              ) {
                                                setWebAppKeyboard(
                                                  "antsokiya_menu",
                                                );
                                                setMountainCategory("Habeshan");
                                                setMenuPage(0);
                                                setToastMessage(
                                                  "🥘 Opening Antsokiya Traditional Food Premium Menu!",
                                                );
                                              } else {
                                                setToastMessage(
                                                  `🏪 Choice Set: ${store}! Now describe your items in chat!`,
                                                );
                                                setIsMenuOpen(false);
                                              }
                                              setTimeout(
                                                () => setToastMessage(null),
                                                4000,
                                              );
                                            }}
                                            className="bg-white hover:bg-slate-50 border border-slate-100 rounded-2xl p-3 text-left flex flex-col gap-2 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 cursor-pointer active:scale-98 relative shadow-2xs group"
                                            title={store}
                                          >
                                            {/* Store Cover Image */}
                                            <div className="w-full h-24 rounded-xl overflow-hidden bg-slate-100 relative shadow-3xs">
                                              <img
                                                src={meta.image}
                                                alt={store}
                                                referrerPolicy="no-referrer"
                                                className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                                              />
                                              <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-3xs text-slate-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
                                                ⭐ {meta.rating}
                                              </div>
                                            </div>

                                            <div className="space-y-1">
                                              <h4 className="font-extrabold text-[12px] text-slate-800 tracking-tight leading-tight uppercase group-hover:text-[var(--brand-primary)] transition-colors truncate">
                                                {store}
                                              </h4>

                                              <div className="flex items-center gap-1.5 text-[9.5px] font-extrabold text-slate-400">
                                                <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                                                  ⏱️ {meta.deliveryTime}
                                                </span>
                                              </div>
                                            </div>
                                          </button>
                                        );
                                      },
                                    );
                                  })()}
                                </div>

                                {/* Custom Eyob Book Zone row in TWA */}
                                {webAppKeyboard === "stores_p4" && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setLocalPickupAddress("Eyob Book Zone");
                                      onSendMessage(
                                        "StoreSelected: Eyob Book Zone",
                                      );
                                      setToastMessage(
                                        "🏪 Choice Set: Eyob Book Zone!",
                                      );
                                      setTimeout(
                                        () => setToastMessage(null),
                                        4000,
                                      );
                                      setIsMenuOpen(false);
                                    }}
                                    className="w-full bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white font-extrabold text-[11px] py-3 rounded-xl text-center flex items-center justify-center transition cursor-pointer shadow-sm border-none active:scale-98 font-bold"
                                  >
                                    📔 Eyob Book Zone
                                  </button>
                                )}

                                {/* Navigation commands inside Mini App */}
                                <div className="space-y-1.5 mt-2 border-t border-slate-150 pt-2 font-sans">
                                  <div className="grid grid-cols-2 gap-1.5">
                                    {webAppKeyboard !== "stores_p1" ? (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const prevPage =
                                            webAppKeyboard === "stores_p2"
                                              ? "stores_p1"
                                              : webAppKeyboard === "stores_p3"
                                                ? "stores_p2"
                                                : "stores_p3";
                                          setWebAppKeyboard(prevPage as any);
                                        }}
                                        className={`bg-white hover:bg-slate-50 text-slate-700 font-extrabold text-[11.5px] py-2.5 rounded-xl text-center flex items-center justify-center transition border border-slate-200 shadow-2xs ${webAppKeyboard === "stores_p4" ? "col-span-2" : ""}`}
                                      >
                                        ◀ {isAmharic ? "ወደኋላ" : "Prev"}
                                      </button>
                                    ) : null}

                                    {webAppKeyboard !== "stores_p4" ? (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const nextPage =
                                            webAppKeyboard === "stores_p1"
                                              ? "stores_p2"
                                              : webAppKeyboard === "stores_p2"
                                                ? "stores_p3"
                                                : "stores_p4";
                                          setWebAppKeyboard(nextPage as any);
                                        }}
                                        className={`bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white font-extrabold text-[11.5px] py-2.5 rounded-xl text-center flex items-center justify-center transition border-none shadow-sm ${webAppKeyboard === "stores_p1" ? "col-span-2" : ""}`}
                                      >
                                        {isAmharic ? "ቀጣይ" : "Next"} ▶
                                      </button>
                                    ) : null}
                                  </div>

                                  {/* Back and Discard row in Mini App */}
                                  <div className="grid grid-cols-2 gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (
                                          webAppKeyboard === "stores_p1" ||
                                          webAppKeyboard === "stores_p2" ||
                                          webAppKeyboard === "stores_p3" ||
                                          webAppKeyboard === "stores_p4"
                                        ) {
                                          setIsMenuOpen(false);
                                        } else {
                                          setWebAppKeyboard("stores_p1");
                                        }
                                      }}
                                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-[11.5px] py-2.5 rounded-xl text-center flex items-center justify-center gap-1 transition-all border border-slate-250 shadow-2xs cursor-pointer"
                                    >
                                      🔙 {isAmharic ? "ተመለስ" : "Back"}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setIsMenuOpen(false);
                                      }}
                                      className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-extrabold text-[11.5px] py-2.5 rounded-xl text-center flex items-center justify-center transition-all border border-rose-200 shadow-2xs cursor-pointer"
                                    >
                                      ❌ {isAmharic ? "ዝጋ" : "Close"}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>

                <div className="p-4 bg-slate-100 rounded-xl border border-slate-200 mt-4 text-[10.5px] text-slate-550 italic font-medium font-sans text-center leading-relaxed">
                  💡{" "}
                  {isAmharic
                    ? "ከላይ የፈለጉትን ምርጫ ሲጫኑ ለቦቱ መልዕክት በራስሰር ይላካል። ከዚያ በኋላ የትዕዛዝ ዝርዝርና የክፍያ ፎቶ በቻቱ መላክ ይችላሉ።"
                    : "Interacting with the menu above instantly pipes instructions to the bot chat inside the simulator feed. Type your item specifics or attach mobile payment screenshots there!"}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating native-like Telegram Toast message */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-md text-white rounded-full px-5 py-2.5 text-xs font-semibold z-50 shadow-xl border border-slate-800 text-center pointer-events-none tracking-wide"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
