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
}

export const STORE_PAGES = [
  // Page 1
  [
    "Mountain cafe",
    "H-Town Burger",
    "Sunny burger",
    "Rome 1960 Cafe",
    "Aroma cafe",
    "Chanoly Noodles",
    "Neba Cafe",
    "Mountain Hotel",
    "Marti kitchen",
    "YOM BURGERIZZA",
    "Barcon Migb Bet",
    "liyu taim migb bet",
    "Zanzibar kitchen",
    "Yegna Store",
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
  let hash = 0;
  for (let i = 0; i < storeName.length; i++) {
    hash = storeName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const absHash = Math.abs(hash);
  const rating = (4.2 + (absHash % 8) * 0.1).toFixed(1); // 4.2 to 4.9
  const deliveryTime = `${10 + (absHash % 3) * 5}-${20 + (absHash % 3) * 5} min`;
  const deliveryFee = absHash % 4 === 0 ? "Free Delivery" : `${25 + (absHash % 4) * 10} Birr`;

  const foodKeywords = ["cafe", "burger", "pizza", "noodles", "kitchen", "restaurant", "hotel", "pastry", "coffee", "kitfo", "fries", "shiro"];
  let matchedKeyword = "default";
  for (const kw of foodKeywords) {
    if (storeName.toLowerCase().includes(kw)) {
      matchedKeyword = kw;
      break;
    }
  }

  const categoryImages: Record<string, string> = {
    burger: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&q=80",
    pizza: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=300&q=80",
    cafe: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=300&q=80",
    coffee: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=300&q=80",
    kitchen: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=300&q=80",
    pastry: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=300&q=80",
    restaurant: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=300&q=80",
    hotel: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=300&q=80",
    default: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80"
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
  if (nameLower.includes("pizza") || catLower.includes("pizza")) {
    return "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=300&q=80";
  }
  if (nameLower.includes("juice") || nameLower.includes("shake") || catLower.includes("juice")) {
    return "https://images.unsplash.com/photo-1536882240095-0379873feb4e?auto=format&fit=crop&w=300&q=80";
  }
  if (nameLower.includes("sandwich") || nameLower.includes("club") || catLower.includes("sandwich")) {
    return "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=300&q=80";
  }
  if (nameLower.includes("cake") || nameLower.includes("pastry") || catLower.includes("cake")) {
    return "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=300&q=80";
  }
  if (nameLower.includes("breakfast") || nameLower.includes("egg") || catLower.includes("breakfast")) {
    return "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=300&q=80";
  }
  if (nameLower.includes("chicken") || nameLower.includes("wing") || catLower.includes("chicken")) {
    return "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=300&q=80";
  }
  if (nameLower.includes("shawarma") || nameLower.includes("wrap") || catLower.includes("shawarma")) {
    return "https://images.unsplash.com/photo-1644704170947-fbf7cfcc1512?auto=format&fit=crop&w=300&q=80";
  }
  if (nameLower.includes("coke") || nameLower.includes("soda") || nameLower.includes("drink") || catLower.includes("drink")) {
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
}: TelegramSimulatorProps) {
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
  >("main");
  const [mountainCategory, setMountainCategory] = useState<string>("Juice");
  const [mountainSelected, setMountainSelected] = useState<
    Record<string, number>
  >({});
  const [menuPage, setMenuPage] = useState<number>(0);

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
  // Shows a fake simulated contact first, and then real profile contact on next click
  const handleShareMobileNumber = () => {
    if (phoneSharedStep === "none") {
      const fakePhone = "0944112233"; // clearly distinct fake simulator number
      setLocalPhone(fakePhone);
      setPhoneSharedStep("fake");
      setToastMessage(
        isAmharic
          ? `⚠️ አስመስሎ የተሰራ ስልክ ተጋርቷል፦ ${fakePhone}! እውነተኛውን ስልክ ለማጋራት 'ስልክ አጋራ' የሚለውን ቁልፍ እንደገና ይጫኑ።`
          : `⚠️ Shared FAKE contact first: ${fakePhone}! Tap "Share number" again to send your real contact.`,
      );
      setTimeout(() => setToastMessage(null), 4500);
    } else {
      const realPhone = "";
      setLocalPhone(realPhone);
      setPhoneSharedStep("real");
      setToastMessage(
        isAmharic
          ? `✓ እውነተኛው ስልክ ተጋርቷል፦ ${realPhone}!`
          : `✓ Real contact shared successfully: ${realPhone}!`,
      );
      setTimeout(() => setToastMessage(null), 3000);
    }
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
    menuType: "mountain" | "htown" | "sunny",
  ) => {
    const categories = [
      "All",
      "Burger",
      "Pizza",
      "Juice",
      "Sandwich",
      "Chicken",
      "Shawarma",
      "Soft Drink",
      "Breakfast",
      "Cake",
    ];
    const menuData =
      menuType === "mountain"
        ? MOUNTAIN_HOTEL_MENU
        : menuType === "htown"
          ? HTOWN_MENU
          : SUNNY_BURGER_MENU;

    // Choose theme properties for a polished professional aesthetic
    // Use H-Town Burger's dark translucent color style for ALL menus as requested, but preserve proper titles/descriptions.
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
        default:
          return {
            title: "🍔 Sunny Burger Premium Menu",
            desc: isAmharic
              ? "ከሳኒ በርገር ሲግኔቸር ምርጫዎች ይምረጡ (በገጽ 10 እቃዎች)፦"
              : "Select from Sunny Burger's signature recipes (10 per page):",
          };
      }
    };

    const details = getStoreDetails();

    const storeMeta = getStoreMeta(
      menuType === "mountain"
        ? "Mountain Hotel"
        : menuType === "htown"
          ? "H-Town Burger"
          : "Sunny Burger"
    );

    const theme = {
      title: details.title,
      desc: details.desc,
      headerBg: "bg-white text-slate-800 border-b border-rose-100",
      headerTag: "bg-orange-50 text-[#E0560B] border-orange-100",
      catContainer: "bg-white border border-slate-100 shadow-2xs",
      catButtonSelected: "bg-[#E0560B] text-white border-[#E0560B] shadow-sm",
      catButtonInactive: "bg-white hover:bg-slate-50 text-slate-600 border-slate-200",
      itemCardBg: "bg-white border border-slate-200 hover:border-orange-200 hover:-translate-y-1 shadow-sm hover:shadow-md",
      badgeColor: "text-[#E0560B] bg-orange-50 border-orange-100",
      cartSummaryBg: "bg-gradient-to-r from-orange-600 to-[#E0560B] text-white border-none shadow-md",
      qtyActionsBg: "bg-slate-50 border border-slate-200",
      btnBack: "bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-2xs hover:-translate-y-0.5",
      btnCancel: "bg-slate-100 hover:bg-slate-250 border-slate-200 text-slate-700 shadow-2xs hover:-translate-y-0.5",
      btnSubmit: "bg-[#E0560B] hover:bg-[#C24103] border-[#E0560B] text-white uppercase tracking-wider font-extrabold shadow-md hover:shadow-lg hover:-translate-y-0.5",
      itemNameText: "text-slate-900 font-bold",
      itemPriceText: "text-[#E0560B] font-extrabold",
      btnActiveBg: "hover:bg-slate-50",
      itemQtyText: "text-slate-900 font-extrabold",
      scrollbarColor: "scrollbar-thin scrollbar-track-slate-100 scrollbar-thumb-slate-200",
      listContainerBg: "bg-slate-50/50 border-slate-200/50",
    };

    let itemsToDisplay: { name: string; price: number }[] = [];
    if (mountainCategory === "All") {
      itemsToDisplay = Object.values(menuData).flat();
    } else {
      itemsToDisplay = menuData[mountainCategory] || [];
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

    const handleToggleItem = (item: { name: string; price: number }) => {
      setMountainSelected((prev) => {
        const qty = prev[item.name] || 0;
        return { ...prev, [item.name]: qty + 1 };
      });
      setToastMessage(`✓ Added ${item.name}!`);
      setTimeout(() => setToastMessage(null), 1500);
    };

    const handleDecrementItem = (item: { name: string; price: number }) => {
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

      const nameText = customerProfile.name || localName || "Valued Customer";
      const phoneText = customerProfile.phone || localPhone || "0911223344";
      const dropAddress =
        customerProfile.address || localAddress || "Default Delivery Area";
      const pickupAddress =
        menuType === "mountain" ? "Mountain Hotel" : "H-Town Burger";

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

    return (
      <div className="w-full flex flex-col gap-3 font-sans text-slate-800 leading-normal animate-fadeIn">
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
              <span className="text-white/40">•</span>
              <span>🛵 {storeMeta.deliveryFee}</span>
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
                  isSelected ? "bg-[#E0560B] text-white border-[#E0560B] shadow-sm transform scale-102" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:-translate-y-0.5 shadow-2xs"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Item Selector List Box - Two Column Grid */}
        <div
          className={`grid grid-cols-2 gap-3 max-h-[350px] overflow-y-auto p-1 rounded-xl scrollbar-xs`}
        >
          {paginatedItems.map((item, itemIdx) => {
            const qty = mountainSelected[item.name] || 0;
            return (
              <div
                key={itemIdx}
                className="flex flex-col bg-white border border-slate-200/85 rounded-2xl p-3.5 transition-all duration-300 hover:shadow-md hover:border-orange-250 hover:-translate-y-0.5 relative group justify-between min-h-[142px] shadow-3xs"
              >
                {qty > 0 && (
                  <div className="absolute top-2.5 right-2.5 bg-[#E0560B] text-white text-[10px] font-black w-5.5 h-5.5 rounded-full flex items-center justify-center shadow-sm z-10 animate-pulse-subtle">
                    {qty}
                  </div>
                )}

                <div className="flex flex-col gap-1.5 flex-1 justify-between">
                  <div className="space-y-1 min-w-0">
                    <span
                      className="text-[12px] font-extrabold text-slate-800 leading-tight block truncate group-hover:text-[#E0560B] transition-colors"
                      title={item.name}
                    >
                      {item.name}
                    </span>
                    <span className="text-[9.5px] text-slate-400 block line-clamp-2 font-medium leading-normal">
                      {item.name.toLowerCase().includes("burger") 
                        ? "Flame-grilled juicy patty with premium fresh toppings" 
                        : item.name.toLowerCase().includes("pizza") 
                          ? "Freshly baked dough with classic savory cheeses" 
                          : item.name.toLowerCase().includes("juice")
                            ? "Pure, freshly-squeezed organic raw seasonal fruits"
                            : item.name.toLowerCase().includes("sandwich")
                              ? "Warm toasted bread with gourmet fillings and house sauce"
                              : "Expertly prepared specialty dish, served warm and fresh"}
                    </span>
                  </div>

                  <div className="space-y-1.5 mt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[12.5px] font-black text-[#E0560B]">
                        {item.price.toFixed(2)} Br
                      </span>
                    </div>

                    {qty > 0 ? (
                      <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-lg p-0.5 select-none text-[12px]">
                        <button
                          type="button"
                          onClick={() => handleDecrementItem(item)}
                          className="text-slate-600 hover:text-[#E0560B] font-extrabold text-[12px] bg-white rounded shadow-2xs border border-slate-250 w-5.5 h-5.5 flex items-center justify-center hover:bg-rose-50 transition cursor-pointer"
                        >
                          -
                        </button>
                        <span className="text-[11px] font-extrabold text-slate-800 font-mono">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleToggleItem(item)}
                          className="text-slate-600 hover:text-[#E0560B] font-extrabold text-[12px] bg-white rounded shadow-2xs border border-slate-250 w-5.5 h-5.5 flex items-center justify-center hover:bg-orange-50 transition cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleToggleItem(item)}
                        className="w-full bg-[#E0560B] hover:bg-[#C24103] active:scale-95 text-white text-[10px] font-black py-1.5 px-2 rounded-lg text-center transition cursor-pointer"
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
    if (!inputText.trim() || isParsing) return;
    onSendMessage(inputText.trim());
    setInputText("");
  };

  return (
    <div
      id="tg-simulator"
      className="bg-[#f0f3f6] border border-slate-200 rounded-2xl overflow-hidden shadow-lg h-[620px] flex flex-col relative"
    >
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
              {isParsing
                ? isAmharic
                  ? "በመተንተን ላይ ነው..."
                  : "is typing..."
                : isAmharic
                  ? "በመስመር ላይ • ዝርዝር ይቀበላል"
                  : "online • matches natural chat"}
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
            className="bg-[#E0560B] hover:bg-[#C24103] text-white font-bold text-[10px] tracking-wide rounded-md px-2.5 py-1.5 transition shrink-0 cursor-pointer"
          >
            👤 {isAmharic ? "ምርጫዎች" : "Set Preferences"}
          </button>
        </div>
      </div>

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
                {msg.senderName && (
                  <div className="text-[10px] font-bold text-[#E0560B] mb-1 pb-1 border-b border-orange-100 flex items-center gap-1 font-sans">
                    <span>👤</span> {msg.senderName}
                  </div>
                )}
                {/* Content text */}
                <div className="whitespace-pre-line text-[13.5px] leading-relaxed text-slate-900 pr-4">
                  {msg.text}
                </div>

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
                        <p className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1.5 rounded-lg leading-relaxed font-sans font-medium">
                          ℹ️ <strong>Price Holder Alert:</strong> The listed
                          price is a holder reference for placeholder billing.
                          You only pay <strong>1/3</strong> of it now.
                        </p>
                        <div className="flex justify-between font-semibold text-emerald-700 bg-emerald-55 px-1.5 py-0.5 rounded">
                          <span>Advance Payment Required (1/3):</span>
                          <span>
                            {(msg.orderSummary.subtotal / 3).toFixed(2)} Birr
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Delivery Fee (Paid After Delivery):</span>
                          <span>
                            {msg.orderSummary.deliveryFee.toFixed(2)} Birr
                          </span>
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-500">
                          <span>Remaining Balance (Due After Delivery):</span>
                          <span>
                            {(
                              (msg.orderSummary.subtotal * 2) / 3 +
                              msg.orderSummary.deliveryFee
                            ).toFixed(2)}{" "}
                            Birr
                          </span>
                        </div>
                        <div className="flex justify-between font-bold text-slate-900 border-t border-dashed border-slate-200 pt-1 text-xs">
                          <span>Total order value:</span>
                          <span>{msg.orderSummary.total.toFixed(2)} Birr</span>
                        </div>
                      </div>

                      {/* Cashless Rule block */}
                      <div className="bg-amber-50/80 border border-amber-250/50 rounded-lg p-2 mt-2 leading-relaxed text-[11px] text-amber-800 space-y-1 font-sans">
                        <div className="flex items-center gap-1 font-bold text-amber-900">
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>💳 1/3 ADVANCE PAYMENT ONLY</span>
                        </div>
                        <p className="text-[10.5px]">
                          To confirm your request, please authorize 1/3 of the
                          food's estimated price as a cashless deposit. The
                          delivery fee is payable as cash/transfer only after
                          the item is successfully delivered.
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
                {msg.buttons && msg.buttons.length > 0 && (
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
                            setToastMessage("📞 Direct support ticket opened!");
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
                        className="w-full bg-[#f0f3f6] hover:bg-[#e4ebf3] text-blue-600 rounded-xl py-2 px-3 text-xs font-bold text-center border border-slate-200/60 cursor-pointer transition flex items-center justify-center gap-1.5"
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
        <div className="mt-4 p-3 bg-orange-50/40 border border-orange-100/90 rounded-2xl space-y-3.5 select-none shadow-3xs">
          {tgKeyboard === "mountain_hotel_menu" ||
          tgKeyboard === "htown_menu" ||
          tgKeyboard === "sunny_menu" ? (
            renderInteractiveMenu(
              false,
              tgKeyboard === "mountain_hotel_menu"
                ? "mountain"
                : tgKeyboard === "htown_menu"
                  ? "htown"
                  : "sunny",
            )
          ) : (
            <>
              {/* Chat bubble title or header just like in the screenshots */}
              <div className="bg-white text-slate-800 rounded-2xl rounded-bl-none px-3.5 py-2.5 border border-slate-100 shadow-sm text-xs md:text-sm max-w-[85%] self-start flex flex-col gap-1 font-sans">
                <span className="font-bold text-slate-900 leading-relaxed">
                  {tgKeyboard === "main"
                    ? isAmharic
                      ? `እንኳን በደህና መጡ ${customerProfile.name || "Cepha"}! ዛሬ ምን ማዘዝ ይፈልጋሉ?`
                      : `Welcome ${customerProfile.name || "Cepha"}! What would you like to order today?`
                    : isAmharic
                      ? "እባክዎን ሱቅ (ካፌ) ይምረጡ፦"
                      : "Select a store (cafe):"}
                </span>
                {tgKeyboard === "main" && (
                  <span className="text-slate-500 text-[11px] font-medium leading-normal">
                    {isAmharic
                      ? "እባክዎን ከታች ካሉት አማራጮች ውስጥ አንዱን ይምረጡ።"
                      : "Please select an option from the list below."}
                  </span>
                )}
                <div className="text-[9px] text-slate-450 text-right mt-1 font-mono">
                  {new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>

              {/* The Orange Action Button Grid */}
              <div className="mt-2 text-xs">
                {tgKeyboard === "main" ? (
                  <div className="w-full flex flex-col gap-1.5 font-sans">
                    {/* Row 1: New Order */}
                    <button
                      type="button"
                      onClick={() => handleKeyboardAction("new_order")}
                      className="w-full bg-[#E0560B] hover:bg-[#C24103] text-white font-extrabold text-[12.5px] py-3 px-4 rounded-xl text-center flex items-center justify-center transition cursor-pointer shadow-xs border border-orange-700/10 active:scale-98 tracking-wide uppercase font-bold"
                    >
                      🍔 {isAmharic ? "አዲስ ትዕዛዝ (New Order)" : "New Order"}
                    </button>

                    {/* Row 2: Change Language, Help */}
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleKeyboardAction("change_language")}
                        className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-[12px] py-3 px-3 rounded-xl text-center flex items-center justify-center transition cursor-pointer shadow-2xs active:scale-98 leading-tight font-bold"
                      >
                        🌐 {isAmharic ? "ቋንቋ ቀይር" : "Change Language"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleKeyboardAction("help")}
                        className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-[12px] py-3 px-3 rounded-xl text-center flex items-center justify-center transition cursor-pointer shadow-2xs active:scale-98 leading-tight font-bold"
                      >
                        💡 {isAmharic ? "እገዛ (Help)" : "Help"}
                      </button>
                    </div>

                    {/* Row 3: Recent Orders */}
                    <button
                      type="button"
                      onClick={() => handleKeyboardAction("recent_orders")}
                      className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-[12.5px] py-2.5 px-4 rounded-xl text-center flex items-center justify-center transition cursor-pointer shadow-2xs active:scale-98 font-bold"
                    >
                      📋{" "}
                      {isAmharic
                        ? "የቅርብ ጊዜ ትዕዛዞች (Recent Orders)"
                        : "Recent Orders"}
                    </button>

                    {/* Row 4: Discounts, Download Our App */}
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleKeyboardAction("discounts")}
                        className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-[12px] py-3 px-3 rounded-xl text-center flex items-center justify-center transition cursor-pointer shadow-2xs active:scale-98 leading-tight font-bold"
                      >
                        🎁 {isAmharic ? "ቅናሾች (Discounts)" : "Discounts"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleKeyboardAction("download_app")}
                        className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-[12px] py-3 px-3 rounded-xl text-center flex items-center justify-center transition cursor-pointer shadow-2xs active:scale-98 leading-tight font-bold"
                      >
                        📲 {isAmharic ? "መተግበሪያ አውርድ" : "Download Our App"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="w-full flex flex-col gap-2 font-sans">
                    {/* 2-column grid of stores with modern card overlays */}
                    <div className="grid grid-cols-2 gap-2">
                      {(
                        STORE_PAGES[
                          tgKeyboard === "stores_p1"
                            ? 0
                            : tgKeyboard === "stores_p2"
                              ? 1
                              : tgKeyboard === "stores_p3"
                                ? 2
                                : 3
                        ] || []
                      ).map((store, sIdx) => {
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
                            className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-[11px] py-2 px-1.5 rounded-xl flex flex-col gap-1 items-center justify-center transition-all cursor-pointer shadow-2xs hover:shadow-sm hover:-translate-y-0.5 active:scale-98 font-bold w-full"
                            title={store}
                          >
                            <span className="truncate w-full text-center tracking-tight text-slate-850 block">🔧 {store}</span>
                            <span className="text-[9px] text-[#E0560B] font-mono leading-none block">⭐ {meta.rating} ({meta.deliveryTime})</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Special case: Eyob Book Zone rendered full width */}
                    {tgKeyboard === "stores_p4" && (
                      <button
                        type="button"
                        onClick={() =>
                          handleKeyboardAction("select_store", "Eyob Book Zone")
                        }
                        className="w-full bg-[#E0560B] hover:bg-[#C24103] text-white font-extrabold text-[11px] py-3 px-1.5 rounded-xl text-center flex items-center justify-center transition cursor-pointer shadow-sm active:scale-98 font-bold"
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
                            className={`bg-[#E0560B] hover:bg-[#C24103] text-white font-extrabold text-[11.5px] py-2.5 rounded-xl text-center flex items-center justify-center transition cursor-pointer border-none shadow-sm ${tgKeyboard === "stores_p1" ? "col-span-2" : ""}`}
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
          className="w-full bg-[#E0560B] hover:bg-[#C24103] text-white text-xs font-extrabold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md transform active:scale-95 duration-100 font-sans tracking-wide font-bold animate-pulse-subtle"
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
              <div className="bg-[#E0560B] text-white px-4 py-3 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm animate-pulse">
                    ⚡
                  </span>
                  <div>
                    <h4 className="font-extrabold text-xs tracking-tight uppercase">
                      {isAmharic
                        ? "ቶሎ የፈጣን ትዕዛዝ መተግበሪያ"
                        : "Tolo Speedy Delivery App"}
                    </h4>
                    <p className="text-[9px] text-orange-200 font-mono tracking-wider">
                      {isAmharic
                        ? "ይዘዙ እና ይደሰቱ!"
                        : "BROWSE AND SELECT STORE COMMANDS"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-white hover:text-orange-100 transition font-black text-xs bg-[#C24103] hover:bg-[#A13401] px-3 py-1.5 rounded-full cursor-pointer shadow-2xs"
                >
                  {isAmharic ? "ዝጋ" : "Close App"}
                </button>
              </div>

              {/* Dynamic menu content container representing the Custom Web App Menu */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 flex flex-col justify-between">
                <div>
                  {/* Web App Branding Portal Box */}
                  <div className="bg-gradient-to-r from-orange-600 to-[#E0560B] text-white rounded-2xl p-4 shadow-sm text-center mb-4 font-sans relative overflow-hidden">
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
                      <div className="w-10 h-10 rounded-full bg-orange-50 text-[#E0560B] font-extrabold uppercase border border-orange-100 flex items-center justify-center text-sm shadow-2xs">
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
                      <span className="bg-orange-50 text-[#E0560B] border border-orange-100 rounded-full px-3 py-1 text-[10px] font-extrabold max-w-[150px] truncate leading-tight shadow-3xs">
                        🏪 {customerProfile.pickupAddress}
                      </span>
                    )}
                  </div>

                  {/* Render the Custom Telegram Bot Menu Keyboard in Web App */}
                  <div className="p-3 bg-white border border-slate-200/85 rounded-2xl space-y-3 select-none shadow-2xs">
                    {webAppKeyboard === "mountain_hotel_menu" ||
                    webAppKeyboard === "htown_menu" ||
                    webAppKeyboard === "sunny_menu" ? (
                      renderInteractiveMenu(
                        true,
                        webAppKeyboard === "mountain_hotel_menu"
                          ? "mountain"
                          : webAppKeyboard === "htown_menu"
                            ? "htown"
                            : "sunny",
                      )
                    ) : (
                      <>
                        {/* Active menu conversation subtitle */}
                        <div className="bg-slate-50 text-slate-800 rounded-2xl px-4 py-3 border border-slate-100 shadow-2xs text-xs md:text-sm max-w-full flex flex-col gap-1 font-sans">
                          <span className="font-extrabold text-slate-800 leading-relaxed text-[11px] md:text-[12px] uppercase tracking-wide">
                            {webAppKeyboard === "main"
                              ? isAmharic
                                ? `እንስራ እንድናደርስልዎ ምን ማድረግ ይፈልጋሉ?`
                                : `What service or option would you like to request?`
                              : isAmharic
                                ? "እባክዎን የትዕዛዝ መነሻ ሱቅ (ካፌ) ይምረጡ፦"
                                : "Select a partner restaurant/cafe below:"}
                          </span>
                          {webAppKeyboard === "main" && (
                            <span className="text-slate-450 text-[10px] font-medium leading-normal">
                              {isAmharic
                                ? "ከታች ካሉት አማራጮች ውስጥ አንዱን ይጫኑ።"
                                : "Please choose an action to execute."}
                            </span>
                          )}
                        </div>

                        {/* Button grids & page switches */}
                        <div className="mt-2 text-xs">
                          {webAppKeyboard === "main" ? (
                            <div className="w-full flex flex-col gap-2 font-sans">
                              {/* Row 1: New Order */}
                              <button
                                type="button"
                                onClick={() => {
                                  setWebAppKeyboard("stores_p1");
                                  setToastMessage(
                                    isAmharic
                                      ? "🏬 የሱቆች ዝርዝር በቲኤምኤ ተከፍቷል"
                                      : "🏬 Displaying partner store catalogs",
                                  );
                                  setTimeout(() => setToastMessage(null), 3000);
                                }}
                                className="w-full bg-[#E0560B] hover:bg-[#C24103] text-white font-extrabold text-[12.5px] py-3.5 px-4 rounded-xl text-center flex items-center justify-center transition-all cursor-pointer shadow-md active:scale-98 tracking-wide uppercase font-bold"
                              >
                                🍔{" "}
                                {isAmharic
                                  ? "አዲስ ትዕዛዝ (New Order)"
                                  : "New Order"}
                              </button>

                              {/* Row 2: Change Language, Help */}
                              <div className="grid grid-cols-2 gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    onLanguageChange(!isAmharic);
                                    onSendMessage("Change Language");
                                    setToastMessage(
                                      isAmharic
                                        ? "🌐 Language switched to English"
                                        : "🌐 ቋንቋ ወደ አማርኛ ተቀይሯል",
                                    );
                                    setTimeout(
                                      () => setToastMessage(null),
                                      3000,
                                    );
                                  }}
                                  className="bg-white hover:bg-slate-50 text-slate-700 font-extrabold text-[12px] py-3 px-3 rounded-xl text-center flex items-center justify-center transition-all cursor-pointer shadow-2xs border border-slate-200 active:scale-98 leading-tight"
                                >
                                  🌐 {isAmharic ? "ቋንቋ ቀይር" : "Change Language"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    onSendMessage("Help");
                                    setIsMenuOpen(false);
                                    setToastMessage(
                                      "💡 Help instructions sent!",
                                    );
                                    setTimeout(
                                      () => setToastMessage(null),
                                      3000,
                                    );
                                  }}
                                  className="bg-white hover:bg-slate-50 text-slate-700 font-extrabold text-[12px] py-3 px-3 rounded-xl text-center flex items-center justify-center transition-all cursor-pointer shadow-2xs border border-slate-200 active:scale-98 leading-tight"
                                >
                                  💡 {isAmharic ? "እገዛ (Help)" : "Help"}
                                </button>
                              </div>

                              {/* Row 3: Recent Orders */}
                              <button
                                type="button"
                                onClick={() => {
                                  onSendMessage("Recent Orders");
                                  setIsMenuOpen(false);
                                  setToastMessage(
                                    "📋 Recent orders requested!",
                                  );
                                  setTimeout(() => setToastMessage(null), 3000);
                                }}
                                className="w-full bg-white hover:bg-slate-50 text-slate-700 font-extrabold text-[12px] py-3 px-4 rounded-xl text-center flex items-center justify-center transition-all cursor-pointer shadow-2xs border border-slate-200 active:scale-98"
                              >
                                📋{" "}
                                {isAmharic
                                  ? "የቅርብ ጊዜ ትዕዛዞች (Recent Orders)"
                                  : "Recent Orders"}
                              </button>

                              {/* Row 4: Discounts, Download Our App */}
                              <div className="grid grid-cols-2 gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    onSendMessage("Discounts");
                                    setIsMenuOpen(false);
                                    setToastMessage("🎁 Discounts menu sent!");
                                    setTimeout(
                                      () => setToastMessage(null),
                                      3000,
                                    );
                                  }}
                                  className="bg-white hover:bg-slate-50 text-slate-700 font-extrabold text-[12px] py-3 px-3 rounded-xl text-center flex items-center justify-center transition-all cursor-pointer shadow-2xs border border-slate-200 active:scale-98 leading-tight"
                                >
                                  🎁{" "}
                                  {isAmharic ? "ቅናሾች (Discounts)" : "Discounts"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    onSendMessage("Download Our App");
                                    setIsMenuOpen(false);
                                    setToastMessage("📲 Download link sent!");
                                    setTimeout(
                                      () => setToastMessage(null),
                                      3000,
                                    );
                                  }}
                                  className="bg-white hover:bg-slate-50 text-slate-700 font-extrabold text-[12px] py-3 px-3 rounded-xl text-center flex items-center justify-center transition-all cursor-pointer shadow-2xs border border-slate-200 active:scale-98 leading-tight"
                                >
                                  📲{" "}
                                  {isAmharic
                                    ? "መተግበሪያ አውርድ"
                                    : "Download Our App"}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="w-full flex flex-col gap-3 font-sans animate-fadeIn">
                              {/* Restaurant Selection Grid with rating, images, and lift animations */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto p-1 bg-slate-50/40 rounded-xl">
                                {(
                                  STORE_PAGES[
                                    webAppKeyboard === "stores_p1"
                                      ? 0
                                      : webAppKeyboard === "stores_p2"
                                        ? 1
                                        : webAppKeyboard === "stores_p3"
                                          ? 2
                                          : 3
                                  ] || []
                                ).map((store, sIdx) => {
                                  const isEyob = store === "Eyob Book Zone";
                                  if (isEyob) return null;

                                  const meta = getStoreMeta(store);

                                  return (
                                    <button
                                      key={sIdx}
                                      type="button"
                                      onClick={() => {
                                        setLocalPickupAddress(store);
                                        onSendMessage(`StoreSelected: ${store}`);
                                        if (store === "Mountain Hotel" || store === "Mountain cafe") {
                                          setWebAppKeyboard("mountain_hotel_menu");
                                          setMountainCategory("Juice");
                                          setMenuPage(0);
                                          setToastMessage("⛰️ Opening Mountain Hotel Live Interactive Menu!");
                                        } else if (store === "H-Town Burger") {
                                          setWebAppKeyboard("htown_menu");
                                          setMountainCategory("Burger");
                                          setMenuPage(0);
                                          setToastMessage("🍔 Opening H-Town Burger Premium Menu!");
                                        } else if (store.toLowerCase().includes("sunny")) {
                                          setWebAppKeyboard("sunny_menu");
                                          setMountainCategory("Burger");
                                          setMenuPage(0);
                                          setToastMessage("☀️ Opening Sunny Burger Premium Menu!");
                                        } else {
                                          setToastMessage(`🏪 Choice Set: ${store}! Now describe your items in chat!`);
                                          setIsMenuOpen(false);
                                        }
                                        setTimeout(() => setToastMessage(null), 4000);
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
                                        <h4 className="font-extrabold text-[12px] text-slate-800 tracking-tight leading-tight uppercase group-hover:text-[#E0560B] transition-colors truncate">
                                          {store}
                                        </h4>
                                        
                                        <div className="flex items-center gap-1.5 text-[9.5px] font-extrabold text-slate-400">
                                          <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                                            ⏱️ {meta.deliveryTime}
                                          </span>
                                          <span className="bg-orange-50 text-[#E0560B] px-1.5 py-0.5 rounded">
                                            🛵 {meta.deliveryFee}
                                          </span>
                                        </div>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>

                              {/* Custom Eyob Book Zone row in TWA */}
                              {webAppKeyboard === "stores_p4" && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setLocalPickupAddress("Eyob Book Zone");
                                    onSendMessage("StoreSelected: Eyob Book Zone");
                                    setToastMessage("🏪 Choice Set: Eyob Book Zone!");
                                    setTimeout(() => setToastMessage(null), 4000);
                                    setIsMenuOpen(false);
                                  }}
                                  className="w-full bg-[#E0560B] hover:bg-[#C24103] text-white font-extrabold text-[11px] py-3 rounded-xl text-center flex items-center justify-center transition cursor-pointer shadow-sm border-none active:scale-98 font-bold"
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
                                      className={`bg-[#E0560B] hover:bg-[#C24103] text-white font-extrabold text-[11.5px] py-2.5 rounded-xl text-center flex items-center justify-center transition border-none shadow-sm ${webAppKeyboard === "stores_p1" ? "col-span-2" : ""}`}
                                    >
                                      {isAmharic ? "ቀጣይ" : "Next"} ▶
                                    </button>
                                  ) : null}
                                </div>

                                {/* Back and Discard row in Mini App */}
                                <div className="grid grid-cols-2 gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setWebAppKeyboard("main")}
                                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-[11.5px] py-2.5 rounded-xl text-center flex items-center justify-center gap-1 transition-all border border-slate-250 shadow-2xs"
                                  >
                                    🔙 {isAmharic ? "ተመለስ" : "Back"}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setWebAppKeyboard("main");
                                      setIsMenuOpen(false);
                                    }}
                                    className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-extrabold text-[11.5px] py-2.5 rounded-xl text-center flex items-center justify-center transition-all border border-rose-200 shadow-2xs"
                                  >
                                    ❌ {isAmharic ? "ሰርዝ" : "Cancel"}
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
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
