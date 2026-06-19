import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Bot,
  MapPin,
  ListOrdered,
  Settings2,
  Cpu,
  Pizza,
  UtensilsCrossed,
  PlayCircle,
  HelpCircle,
  Smartphone,
  Sparkles,
  Info,
  X,
  Lock,
  Loader2,
  CreditCard,
  Wallet,
  Landmark,
  ShieldCheck,
  CheckCircle2,
  User,
  Phone,
  Upload,
  Eye,
} from "lucide-react";

import {
  MenuItem,
  Order,
  OrderItem,
  ChatMessage,
  OrderStatus,
  ParsedResponse,
} from "./types";
import TelegramSimulator from "./components/TelegramSimulator";
import AdminDashboard from "./components/AdminDashboard";
import LiveTrackingView from "./components/LiveTrackingView";
import ExplanationAlert from "./components/ExplanationAlert";

export default function App() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState<
    string | null
  >(null);

  // Custom user profile and mini-app checkout state starts empty for dynamic entry
  const [customerProfile, setCustomerProfile] = useState(() => {
    try {
      const saved = localStorage.getItem("tolo_customer_profile");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      name: "",
      phone: "",
      address: "",
      pickupAddress: "",
    };
  });

  useEffect(() => {
    localStorage.setItem(
      "tolo_customer_profile",
      JSON.stringify(customerProfile),
    );
  }, [customerProfile]);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Bot configurations for direct Telegram operator alerts
  const [botToken, setBotToken] = useState(() => {
    const saved = localStorage.getItem("tolo_bot_token");
    if (!saved || saved === "8473700859:AAHsKy9mDLPIh5bR-8mO33tpO1530YkJqEk") {
      return "8473700859:AAHsKy9mDLPIh5bR-8mO33tpO1530YkJqEk";
    }
    return saved;
  });
  const [operatorChatId, setOperatorChatId] = useState(
    () => localStorage.getItem("tolo_operator_chat_id") || "7596617846",
  );
  const [operatorUsername, setOperatorUsername] = useState(
    () => localStorage.getItem("tolo_operator_username") || "Cephasimon",
  );
  const [customTunnelUrl, setCustomTunnelUrl] = useState(
    () => localStorage.getItem("tolo_custom_tunnel_url") || "",
  );
  const [tunnelType, setTunnelType] = useState<"workspace" | "ngrok">(
    () =>
      (localStorage.getItem("tolo_tunnel_type") as "workspace" | "ngrok") ||
      "workspace",
  );

  useEffect(() => {
    localStorage.setItem("tolo_bot_token", botToken);
  }, [botToken]);

  useEffect(() => {
    localStorage.setItem("tolo_operator_chat_id", operatorChatId);
  }, [operatorChatId]);

  useEffect(() => {
    localStorage.setItem("tolo_operator_username", operatorUsername);
  }, [operatorUsername]);

  useEffect(() => {
    localStorage.setItem("tolo_custom_tunnel_url", customTunnelUrl);
  }, [customTunnelUrl]);

  useEffect(() => {
    localStorage.setItem("tolo_tunnel_type", tunnelType);
  }, [tunnelType]);

  // Send Telegram admin notification on new order submission (Requirement)
  const sendNewOrderTelegramNotification = (order: Order) => {
    console.log("TELEGRAM FUNCTION CALLED", order);

    if (!botToken || !operatorChatId) {
      console.warn(
        "Telegram alert botToken or operatorChatId is not fully configured, skipped sending.",
      );
      return;
    }

    const messageText =
      `🔔 NEW ORDER RECEIVED\n\n` +
      `👤 Customer: ${order.customerName}\n` +
      `📞 Phone: ${order.customerPhone || "N/A"}\n` +
      `🆔 Order ID: ${order.id}\n` +
      `💰 Total: ${order.total.toFixed(2)} Birr\n` +
      `📍 Delivery Address: ${order.deliveryAddress}\n\n` +
      `Status: Awaiting Payment Verification`;
    console.log("TELEGRAM MESSAGE:", messageText);

    fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: operatorChatId,
        text: messageText,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          console.log(
            `Telegram admin notification successfully sent for Order #${order.id}`,
          );
        } else {
          console.error(
            "Telegram API returned error delivering admin notification:",
            data,
          );
        }
      })
      .catch((err) => {
        console.error(
          "Failed to transmit new order Telegram notification:",
          err,
        );
      });
  };

  // Advance Payment Flow Mini-App State
  const [paymentDraftOrderId, setPaymentDraftOrderId] = useState<string | null>(
    null,
  );
  const [paymentStep, setPaymentStep] = useState<
    "details" | "waiting" | "awaiting_admin" | "success"
  >("details");
  const [paymentType, setPaymentType] = useState<
    "telebirr" | "cbe_birr" | "cbe_bank"
  >("telebirr");
  const [bankTxRef, setBankTxRef] = useState("CBE-TX-9281729A");
  const [payerPhone, setPayerPhone] = useState("");
  const [receiptPhoto, setReceiptPhoto] = useState<string>("");
  const [isAmharic, setIsAmharic] = useState<boolean>(true);

  // Sync payerPhone with profile phone only when opening the modal, and default to blank if it's default dummy phone
  useEffect(() => {
    if (paymentDraftOrderId) {
      setPayerPhone(
        customerProfile.phone === "0911223344" ? "" : customerProfile.phone,
      );
      setReceiptPhoto("");
      setPaymentStep("details");
    }
  }, [paymentDraftOrderId, customerProfile.phone]);

  // Listen for admin verification or changes on the active draft order payment
  useEffect(() => {
    if (paymentDraftOrderId && paymentStep === "awaiting_admin") {
      const activeOrder = orders.find((o) => o.id === paymentDraftOrderId);
      if (activeOrder) {
        if (activeOrder.isPaymentVerified) {
          setPaymentStep("success");
        } else if (activeOrder.status === "cancelled") {
          // If the admin rejected/cancelled it, notify and go back to details
          alert(
            "The administrator has rejected the receipt screenshot. Please verify your payment reference and upload a valid transaction photo.",
          );
          setPaymentStep("details");
        }
      }
    }
  }, [orders, paymentDraftOrderId, paymentStep]);

  // View Control: On mobile, users can toggle panes if side-by-side is crowded
  const [currentPane, setCurrentPane] = useState<
    "consumer" | "admin" | "tracking"
  >("consumer");

  // Fetch menu from backend on load
  const loadMenu = async () => {
    try {
      const response = await fetch("/api/menu");
      if (response.ok) {
        const data = await response.json();
        // Consolidate Injera, injera2, and Injera 3 into a single canonical "Injera" category
        const consolidatedData = data.map((item: any) => {
          if (item && item.category) {
            const catLower = item.category.toLowerCase().trim();
            if (
              catLower === "injera" ||
              catLower === "injera2" ||
              catLower === "injera 2" ||
              catLower === "injera3" ||
              catLower === "injera 3"
            ) {
              return { ...item, category: "Injera" };
            }
          }
          return item;
        });
        setMenuItems(consolidatedData);
      }
    } catch (err) {
      console.error("Error loading menu:", err);
    }
  };

  useEffect(() => {
    localStorage.removeItem("tolo_customer_profile");
    setCustomerProfile({
      name: "",
      phone: "",
      address: "",
      pickupAddress: "",
    });
    loadMenu();

    // Welcome messages for Telegram /start onboarding flow
    const timeStr = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    setMessages([
      {
        id: "msg_welcome_1",
        sender: "bot",
        type: "start_flow",
        text: "🚀 እንኳን ወደ ቶሎ | Tollo Delivery በሰላም መጡ! 👋\n\nየምግብ፣ የሸቀጣሸቀጥ፣ የዕቃዎችና የፈጣን መልዕክት ማድረሻ አገልግሎት።\nበቀላሉ ይዘዙ፣ አስተማማኝ አሽከርካሪዎችን በቀጥታ ካርታ ይከታተሉ፣ በታማኝነት ይክፈሉ።\n\n-------------------------\n\n🚀 Welcome to ቶሎ | Tollo Delivery\n\nFast food, grocery, parcel, and courier delivery services.\nOrder quickly, track deliveries in real time, and pay securely.",
        buttons: [
          {
            label: "🍔 ቶሎ ማዘዣ ክፈት (Open Tollo App)",
            url: "https://tolodeliverybot-production.up.railway.app",
            actionType: "open_mini_app",
          },
          {
            label: "📞 እገዛ መጠየቂያ (Contact Support)",
            actionType: "alert_support",
          },
        ],
        timestamp: timeStr,
      },
    ]);
  }, []);

  // Update Item Details inside Catalog
  const handleUpdateMenu = async (
    id: string,
    price: number,
    isAvailable: boolean,
  ) => {
    try {
      const response = await fetch("/api/admin/menu/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, price, isAvailable }),
      });
      if (response.ok) {
        loadMenu();
      }
    } catch (err) {
      console.error("Error updating menu item:", err);
    }
  };

  // Reset Item Details to Defaults
  const handleResetMenu = async () => {
    try {
      const response = await fetch("/api/admin/menu/reset", { method: "POST" });
      if (response.ok) {
        loadMenu();
      }
    } catch (err) {
      console.error("Error resetting menu:", err);
    }
  };

  // Process user typing or tapping a sample order
  const handleSendMessage = async (text: string) => {
    console.log("HANDLE SEND MESSAGE", text);
    const timestampStr = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const userMsgId = "msg_user_" + Date.now();

    // 1. Add User query message
    setMessages((prev) => [
      ...prev,
      {
        id: userMsgId,
        sender: "user",
        text,
        timestamp: timestampStr,
      },
    ]);

    setIsParsing(true);

    // 1.5 Support and Mini App Onboarding Interceptor (Requirement 5 & 6)
    const normalizedText = text.toLowerCase().trim();
    console.log("STEP 1");

    if (normalizedText === "help") {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: "msg_help_" + Date.now(),
            sender: "bot",
            text: `ℹ️ *ቶሎ የማዘዣ መመሪያ / Tollo User Guide*\n\n1. *ክፍት መተግበሪያ (Open App):* Click the bottom 'Open Tollo Delivery' button to easily enter your name, phone, pickup, and delivery addresses.\n2. *የሱቅ ምርጫ (Store Selection):* Select your favorite restaurant or supermarket from our list to set it as the pickup location.\n3. *ምግብ ይዘዙ (Describe Order):* Type the items you want, e.g., '1 Special Burger and 1 Sprite'.\n4. *ቅድሚያ ክፍያ (Advance Payment):* Pay 1/3 advance via Telebirr or CBE Birr and upload the receipt screenshot in the app to finalize!\n\n👤 *የደንበኛ መረጃ / Active Profile:* \n• ስም (Name): ${customerProfile.name || "(ያልተመዘገበ / Not set)"}\n• ስልክ (Phone): ${customerProfile.phone || "(ያልተመዘገበ / Not set)"}\n\n📞 Need direct help? Call our support desk at *9801* or contact @Cephasimon.`,
            timestamp: timestampStr,
          },
        ]);
        setIsParsing(false);
      }, 650);
      return;
    }

    if (normalizedText === "recent orders") {
      setTimeout(() => {
        const userOrders = orders.filter(
          (o) =>
            o.customerName === activeName || o.customerPhone === activePhone,
        );
        let ordersText = "";
        if (orders.length === 0) {
          ordersText =
            "❌ You don't have any recent orders yet! Click 'New Order' or open the Tolo Delivery App to place your first request.";
        } else {
          ordersText =
            "📋 *Your Recent Orders Status:*\n\n" +
            orders
              .map((o) => {
                let statusEmoji = "⏳";
                if (o.status === "payment_pending")
                  statusEmoji = "💳 Pending payment verification";
                else if (o.status === "assigned" || o.status === "accepted")
                  statusEmoji = "🛵 Driver on the way";
                else if (o.status === "delivered")
                  statusEmoji = "✅ Delivered successfully";
                else if (o.status === "cancelled") statusEmoji = "❌ Cancelled";
                return `• *Order #${o.id}:* ${o.items && o.items.length > 0 ? o.items.map((it) => `${it.quantity}x ${it.name}`).join(", ") : "Custom Package"}\n   *Total:* ${o.total.toFixed(2)} Birr\n   *Status:* ${statusEmoji}`;
              })
              .join("\n\n");
        }

        setMessages((prev) => [
          ...prev,
          {
            id: "msg_recent_" + Date.now(),
            sender: "bot",
            text: ordersText,
            timestamp: timestampStr,
          },
        ]);
        setIsParsing(false);
      }, 650);
      return;
    }

    if (normalizedText === "discounts") {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: "msg_discounts_" + Date.now(),
            sender: "bot",
            text: "🎉 *ቶሎ ልዩ ቅናሾች | Tollo Special Promotions* 🎁\n\n• *TOLO50:* Use coupon code **TOLO50** in your cart to get 50 Birr discount on your first order!\n• *FREE_DELIVERY:* Get FREE delivery when ordering from selected local stores during weekends!\n• *CASHLESS_BONUS:* Receive 5% cashback directly into your wallet when uploading advance payment receipts within 5 minutes of ordering.",
            timestamp: timestampStr,
          },
        ]);
        setIsParsing(false);
      }, 650);
      return;
    }

    if (
      normalizedText === "download our app" ||
      normalizedText === "download app"
    ) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: "msg_download_" + Date.now(),
            sender: "bot",
            text: "📲 *Tollo Delivery Mobile App* 🚀\n\nGet the best food delivery experience with real-time route pathing on your screen!\n\n• *Android (.APK):* [Download for Android](https://tollodelivery.com/android-app) 🤖\n• *iOS (App Store):* [Get for iPhone / iPad](https://tollodelivery.com/ios-app) 🍏\n\nDownload today and lock-in instant customer status!",
            timestamp: timestampStr,
          },
        ]);
        setIsParsing(false);
      }, 650);
      return;
    }

    if (normalizedText.startsWith("storeselected:")) {
      const storeName = text.replace(/storeselected:\s*/i, "").trim();
      setTimeout(() => {
        setCustomerProfile((prev) => ({ ...prev, pickupAddress: storeName }));
        setMessages((prev) => [
          ...prev,
          {
            id: "msg_store_sel_" + Date.now(),
            sender: "bot",
            text: `🏪 *Store Selected:* '${storeName}' ✅\n\nWe have set this restaurant as your official pick-up point on your active preference card.\n\nType your custom food items or launch the *Open Tollo App* slider drawer to confirm your contact info and submit payment receipt snapshot to start preparation immediately!`,
            timestamp: timestampStr,
          },
        ]);
        setIsParsing(false);
      }, 650);
      return;
    }

    if (normalizedText === "change language") {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: "msg_lang_sw_" + Date.now(),
            sender: "bot",
            text: isAmharic
              ? "🌐 Language switched to *English*! All menus and system instructions are updated."
              : "🌐 ቋንቋ ወደ *አማርኛ* ተቀይሯል! ሁሉም ሜኑዎች እና መመሪያዎች በትክክል ተስተካክለዋል።",
            timestamp: timestampStr,
          },
        ]);
        setIsParsing(false);
      }, 650);
      return;
    }

    if (text === "CONTACT_SUPPORT_TRIGGERED_ACTION") {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: "msg_support_" + Date.now(),
            sender: "bot",
            text: `📞 *ቶሎ የደንበኞች ድጋፍ መስኮት | Tollo Support Desk* 🤝\n\n👤 *ደንበኛ ስም (Customer Name):* ${customerProfile.name || "(ያልተመዘገበ / Not set yet)"}\n📞 *ስልክ ቁጥር (Phone Number):* ${customerProfile.phone || "(ያልተመዘገበ / Not set yet)"}\n\nOur customer support agents are active 24/7. Replying directly to this bot goes directly to our live desk. Alternatively, you can email us at *support@tollodelivery.com* or call our toll-free support line at *9801*.`,
            timestamp: timestampStr,
          },
        ]);
        setIsParsing(false);
      }, 600);
      return;
    }

    const isStartCommand =
      normalizedText === "/start" || normalizedText === "start";
    const miniAppKeywords = [
      "order food",
      "delivery",
      "menu",
      "start order",
      "track order",
      "order",
      "track",
      "food",
      "burger",
      "pizza",
      "wrap",
      "waffle",
      "drink",
    ];
    const isTicketSubmission = text
      .trim()
      .startsWith("Please organize a ticket for:");
    const triggersMiniAppGuide =
      !isTicketSubmission &&
      (miniAppKeywords.some((keyword) => normalizedText.includes(keyword)) ||
        isStartCommand);

    if (triggersMiniAppGuide) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: "msg_onboard_" + Date.now(),
            sender: "bot",
            type: "start_flow",
            text: isStartCommand
              ? "🚀 እንኳን ወደ ቶሎ | Tollo Delivery በሰላም መጡ! 👋\n\nየምግብ፣ የሸቀጣሸቀጥ፣ የዕቃዎችና የፈጣን መልዕክት ማድረሻ አገልግሎት።\nበቀላሉ ይዘዙ፣ አስተማማኝ አሽከርካሪዎችን በቀጥታ ካርታ ይከታተሉ፣ በታማኝነት ይክፈሉ።\n\n-------------------------\n\n🚀 Welcome to ቶሎ | Tollo Delivery\n\nFast food, grocery, parcel, and courier delivery services.\nOrder quickly, track deliveries in real time, and pay securely."
              : "🍔 *ቶሎ ማዘዣ ረዳት (Tollo Mini App)*\n\nእባክዎን ከታች ያለውን የ 'Open Tollo App' ቁልፍ በመጫን ትዕዛዝዎን ይፈጽሙ፣ የማድረሻ ቦታዎችዎን ያስተካክሉ ወይም አሽከርካሪዎችን በቀጥታ ካርታ ይከታተሉ!\n\nTo place your order, browse our full live menu, track active deliveries, or manage your delivery parameters, please use our secure ቶሎ | Tollo Delivery Mini App directly inside Telegram by clicking the button below!",
            buttons: [
              {
                label: "🍔 ቶሎ ማዘዣ ክፈት (Open Tollo App)",
                url: "https://tolodeliverybot-production.up.railway.app",
                actionType: "open_mini_app",
              },
              {
                label: "📞 እገዛ መጠየቂያ (Contact Support)",
                actionType: "alert_support",
              },
            ],
            timestamp: timestampStr,
          },
        ]);
        setIsParsing(false);
      }, 600);
      return;
    }

    let activeName = customerProfile.name;
    let activePhone = customerProfile.phone;
    let activeAddress = customerProfile.address;
    let activePickupAddress = customerProfile.pickupAddress;

    // Natural Language Interceptor for Customer Profile Updates in Chat
    const profileWords = [
      "my delivery profile",
      "update my profile",
      "delivery profile is",
      "profile name:",
      "profile phone:",
      "profile address:",
      "pick-up location:",
      "delivery profile parameters",
    ];
    const matchesProfileText =
      profileWords.some((word) => text.toLowerCase().includes(word)) ||
      text.includes("👤 Name:") ||
      text.includes("📞 Phone:") ||
      text.includes("📍 Drop-Off Address:") ||
      text.includes("📍 Pick-Up Location:");

    if (matchesProfileText) {
      let updatedName = customerProfile.name;
      let updatedPhone = customerProfile.phone;
      let updatedAddress = customerProfile.address;
      let updatedPickupAddress = customerProfile.pickupAddress;

      const lines = text.split("\n");
      lines.forEach((line) => {
        const clean = line.replace(/[👤📞📍✏️]/g, "").trim();
        if (/name:/i.test(clean)) {
          const matched = clean.match(/name:\s*(.*)/i);
          if (matched && matched[1]) updatedName = matched[1].trim();
        } else if (/phone:/i.test(clean)) {
          const matched = clean.match(/phone:\s*(.*)/i);
          if (matched && matched[1]) updatedPhone = matched[1].trim();
        } else if (
          /drop-off address:/i.test(clean) ||
          /address:/i.test(clean)
        ) {
          const matched = clean.match(/(?:drop-off\s+)?address:\s*(.*)/i);
          if (matched && matched[1]) updatedAddress = matched[1].trim();
        } else if (/pick-up location:/i.test(clean) || /pickup:/i.test(clean)) {
          const matched = clean.match(/(?:pick-up\s+location|pickup):\s*(.*)/i);
          if (matched && matched[1]) updatedPickupAddress = matched[1].trim();
        }
      });

      // Simple comma parser fallback if sent on single line
      if (text.includes(",") && updatedName === customerProfile.name) {
        const parts = text.split(",");
        parts.forEach((part) => {
          if (part.toLowerCase().includes("name")) {
            const m = part.match(/name\s*(?:is|:)?\s*([^\n,]+)/i);
            if (m) updatedName = m[1].trim();
          }
          if (
            part.toLowerCase().includes("phone") ||
            part.toLowerCase().includes("number")
          ) {
            const m = part.match(/(?:phone|number)\s*(?:is|:)?\s*([^\n,]+)/i);
            if (m) updatedPhone = m[1].trim();
          }
          if (
            part.toLowerCase().includes("address") ||
            part.toLowerCase().includes("location")
          ) {
            const m = part.match(
              /(?:address|location)\s*(?:is|:)?\s*([^\n,]+)/i,
            );
            if (m) updatedAddress = m[1].trim();
          }
          if (
            part.toLowerCase().includes("pickup") ||
            part.toLowerCase().includes("pick-up")
          ) {
            const m = part.match(/(?:pickup|pick-up)\s*(?:is|:)?\s*([^\n,]+)/i);
            if (m) updatedPickupAddress = m[1].trim();
          }
        });
      }

      setCustomerProfile({
        name: updatedName,
        phone: updatedPhone,
        address: updatedAddress,
        pickupAddress: updatedPickupAddress,
      });

      activeName = updatedName;
      activePhone = updatedPhone;
      activeAddress = updatedAddress;
      activePickupAddress = updatedPickupAddress;

      // Add profile updated confirmation message to feed
      setMessages((prev) => [
        ...prev,
        {
          id: "msg_bot_profile_set_" + Date.now(),
          sender: "bot",
          text: `📝 *Delivery Profile Saved via Chat!* ✅\n\n👤 *Customer Name:* ${updatedName}\n📞 *Phone Number:* ${updatedPhone}\n📍 *Pick-Up Location:* ${updatedPickupAddress || "Not Specified (Default Store)"}\n📍 *Drop-Off Address:* ${updatedAddress}\n\nOur kitchen dispatch map is fully updated to route from your custom pick-up store to the target drop-off address.`,
          timestamp: timestampStr,
        },
      ]);

      // Check if this text ONLY contained the profile update. If there are no food items, return early!
      const hasFoodItems =
        text.toLowerCase().includes("ticket for") ||
        text.toLowerCase().includes("please organize") ||
        text.toLowerCase().includes("want") ||
        text.toLowerCase().includes("order") ||
        menuItems.some((item) =>
          text.toLowerCase().includes(item.name.toLowerCase().split(" ")[0]),
        );

      if (!hasFoodItems) {
        setIsParsing(false);
        return;
      }
    }

    // TICKET SUBMISSION PRE-PARSER (Recognizes custom customer-entered foods with prices effortlessly)
    console.log("RAW TEXT:", JSON.stringify(text));

    if (text.trim().startsWith("Please organize a ticket for:")) {
      console.log("STEP 2 - ORDER INTERCEPTOR HIT");

      const botTimestamp = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      const firstLine = text.split("\n")[0];
      const itemsText = firstLine
        .replace("Please organize a ticket for:", "")
        .trim();

      const itemsListStr = itemsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const draftItems: OrderItem[] = [];

      itemsListStr.forEach((itemStr, index) => {
        const cleanItemStr = itemStr.replace(/\.$/, "").trim();
        // Regex to extract quantity, name, and optional embedded price format like "( $12.00 )" or "($12.00)" or "(12.00 Birr)"
        const rMatch =
          cleanItemStr.match(
            /^(\d+)\s+(.+?)(?:\s+\((?:[\$]|Br|Birr)?\s*(\d+(?:\.\d+)?)\s*(?:Birr|Br)?\))?$/i,
          ) || cleanItemStr.match(/^(\d+)x?\s+(.+)$/i);

        if (rMatch) {
          const qty = parseInt(rMatch[1]) || 1;
          let name = rMatch[2].trim();
          let price = 8.5; // default standard if not present

          if (rMatch[3]) {
            price = parseFloat(rMatch[3]);
          } else {
            const pMatch = name.match(
              /\((?:[\$]|Br|Birr)?\s*(\d+(?:\.\d+)?)\s*(?:Birr|Br)?\)/i,
            );
            if (pMatch) {
              price = parseFloat(pMatch[1]);
              name = name
                .replace(
                  /\((?:[\$]|Br|Birr)?\s*(\d+(?:\.\d+)?)\s*(?:Birr|Br)?\)/i,
                  "",
                )
                .trim();
            } else {
              const existingItem = menuItems.find(
                (i) => i.name.toLowerCase() === name.toLowerCase(),
              );
              if (existingItem) {
                price = existingItem.price;
              }
            }
          }

          draftItems.push({
            menuItemId:
              "cust_" + Math.floor(Math.random() * 100000) + "_" + index,
            name: name,
            quantity: qty,
            unitPrice: price,
            totalPrice: price * qty,
          });
        }
      });

      if (draftItems.length > 0) {
        const subtotal = draftItems.reduce(
          (acc, curr) => acc + curr.totalPrice,
          0,
        );
        const deliveryFee = 2.5;
        const total = subtotal + deliveryFee;
        const orderDraftId = "draft_" + Math.floor(Math.random() * 100000);

        setTimeout(() => {
          if (receiptPhoto) {
            // Immediately register/submit completed payment details with status "payment_pending"
            const advancePaid = subtotal / 3;
            const remainingBalance = (subtotal * 2) / 3 + deliveryFee;
            const txId = `TXN-${Math.floor(100000 + Math.random() * 900000)}`;

            const tempOrder: Order = {
              id: orderDraftId,
              rawText: text,
              items: draftItems,
              subtotal,
              deliveryFee,
              tax: 0,
              total,
              status: "payment_pending",
              createdAt: new Date().toISOString(),
              customerName: activeName,
              customerPhone: activePhone,
              deliveryAddress: activeAddress,
              pickupAddress: activePickupAddress,
              driverName: "",
              driverPhone: "",
              etaMinutes: 24,
              progress: 5,
              driverPathIndex: 0,
              isPaymentVerified: false,
              isDriverAssigned: false,
              isDriverAccepted: false,
              paymentDetails: {
                amount: advancePaid,
                method: "Telebirr / CBE Birr",
                reference: txId,
                timestamp: new Date().toLocaleString(),
                receiptPhoto: receiptPhoto,
              },
            };

            console.log("CREATING ORDER", tempOrder);

            setOrders((prev) => {
              const updated = [...prev, tempOrder];
              console.log("UPDATED ORDERS", updated);
              return updated;
            });
            sendNewOrderTelegramNotification(tempOrder);

            // Add payment submitted messages to Telegram simulator stream immediately
            setMessages((prev) => [
              ...prev,
              {
                id: "msg_user_submit_form_" + Date.now(),
                sender: "user",
                senderName: activeName,
                text: isAmharic
                  ? `👤 *ከደንበኛ የተላከ፦* ${activeName}\n📞 *ስልክ፦* ${activePhone}\n📍 *መነሻ፦* ${activePickupAddress || "የቶሎ ማእድ ቤት"}\n📍 *መድረሻ፦* ${activeAddress}\n\nየክፍያ ማረጋገጫ (Screenshot) ለትዕዛዝ #${orderDraftId} ልኬያለሁ። እባክዎን ያረጋግጡልኝ! (${advancePaid.toFixed(2)} Birr)`
                  : `👤 *Submitted by:* ${activeName}\n📞 *Phone:* ${activePhone}\n📍 *Pickup:* ${activePickupAddress || "Tolo Main Kitchen"}\n📍 *Drop-off:* ${activeAddress}\n\nI have sent my payment verification screenshot for Order #${orderDraftId}. Please verify and approve my receipt! (${advancePaid.toFixed(2)} Birr)`,
                timestamp: botTimestamp,
              },
              {
                id: "msg_bot_paid_receipt_" + Date.now(),
                sender: "bot",
                text: isAmharic
                  ? `💳 *የቶሎ ማድረሻ ክፍያ ማረጋገጫ ተልኳል ለ #${orderDraftId}* ✅\n\n👤 *ደንበኛ:* ${activeName}\n📞 *ስልክ:* ${activePhone}\n📍 *መነሻ ቦታ:* ${activePickupAddress || "(ከተዘጋጀው የቶሎ ማእድ ቤት)"}\n📍 *መድረሻ ቦታ:* ${activeAddress}\n\n*የቅድሚያ ክፍያ (1/3):* ${advancePaid.toFixed(2)} Birr\n*ቀሪ እዳ (በማድረሻ ወቅት የሚከፈል):* ${remainingBalance.toFixed(2)} Birr\n*የክፍያ መንገድ:* Mobile Wallet / CBE Bank\n*መለያ ቁጥር (Ref ID):* ${txId}\n\n📷 *የማረጋገጫ ፎቶ ለባለቤቱ ተልኳል:* [https://t.me/${operatorUsername || "Cephasimon"}]\n\n⚠️ *የማረጋገጫ ሂደት በመጠባበቅ ላይ:* የእርስዎ የክፍያ ማረጋገጫ ፎቶ ለባለቤቱ (https://t.me/${operatorUsername || "Cephasimon"}) በአስተማማኝ ሁኔታ ተልኳል። ባለቤቱ ልክ ክፍያውን ሲያረጋግጥ አሽከርካሪ ይመደባል እንዲሁም የቀጥታ መከታተያ ካርታ (Live GPS) ይጀምራል!`
                  : `💳 *TOLO DELIVERY PAYMENT SUBMITTED for #${orderDraftId}* ✅\n\n👤 *Customer:* ${activeName}\n📞 *Contact Phone:* ${activePhone}\n📍 *Pick-Up From:* ${activePickupAddress || "(Ready from ToLo Kitchen)"}\n📍 *Drop-Off To:* ${activeAddress}\n\n*Advance Payment (1/3 of cost):* ${advancePaid.toFixed(2)} Birr\n*Remaining Balance (Due After Delivery):* ${remainingBalance.toFixed(2)} Birr\n*Method:* Mobile Wallet / CBE Bank\n*Receipt Reference:* ${txId}\n\n📷 *Confirmation Photo Sent To Owner:* [https://t.me/${operatorUsername || "Cephasimon"}]\n\n⚠️ *Verification Required:* Your receipt photo has been securely sent to the owner (https://t.me/${operatorUsername || "Cephasimon"}) for approval. Once he approves, a driver will be assigned immediately and live GPS tracking will begin!`,
                timestamp: botTimestamp,
                type: "tracking_link",
                trackingOrderId: orderDraftId,
              },
              {
                id: "msg_sys_alert_" + Date.now(),
                sender: "system",
                text: isAmharic
                  ? `📢 *አስተዳዳሪው ተረድቷል:* የክፍያ ቼክ ማስያዣ ለትዕዛዝ #${orderDraftId} ይጠበቃል። የማረጋገጫ ፎቶው በአስተማማኝ ሁኔታ ተሰቅሏል ለ https://t.me/${operatorUsername || "Cephasimon"}`
                  : `📢 *ADMIN NOTIFIED:* Light payment check required for Order #${orderDraftId}. Receipt confirmation photo has been uploaded for https://t.me/${operatorUsername || "Cephasimon"}!`,
                timestamp: botTimestamp,
              },
            ]);

            // Dispatch real-time Telegram alert message to operator
            if (
              botToken &&
              !botToken.includes(
                "8473700859:AAHsKy9mDLPIh5bR-8mO33tpO1530YkJqEk",
              ) &&
              operatorChatId
            ) {
              const trackingUrl = `${window.location.origin}/?order=${orderDraftId}`;
              const itemsText = draftItems
                .map(
                  (it) =>
                    `• ${it.quantity}x ${it.name} (${it.totalPrice.toFixed(2)} Birr)`,
                )
                .join("\n");
              const alertPayload =
                `🔔 *Tolo Delivery (Payment Pending)* 🔔\n\n` +
                `👤 *Customer Name:* ${activeName}\n` +
                `📞 *Phone Number:* ${activePhone}\n` +
                `📍 *Pickup Location:* ${activePickupAddress || "Tolo Kitchen"}\n` +
                `📍 *Delivery Address:* ${activeAddress}\n\n` +
                `🍔 *Ordered Items:* \n${itemsText}\n\n` +
                `💳 *Amount Sent:* ${advancePaid.toFixed(2)} Birr\n` +
                `💵 *Method:* Mobile Wallet / CBE Bank\n` +
                `🧾 *Reference ID:* ${txId}\n` +
                `🆔 *Order ID:* #${orderDraftId}\n\n` +
                `⚠️ *Action:* Please log in to your Kitchen Dashboard to verify payment and assign a driver.`;

              fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  chat_id: operatorChatId,
                  text: alertPayload,
                  parse_mode: "Markdown",
                }),
              }).catch((netErr) => {
                console.error(
                  "Failed to post custom order notification to Telegram Bot API:",
                  netErr,
                );
              });
            }

            setReceiptPhoto(""); // Reset the state screenshot so subsequent custom orders don't bleed-over
          } else {
            // Fallback draft mode
            setMessages((prev) => [
              ...prev,
              {
                id: "msg_bot_" + Date.now(),
                sender: "bot",
                text: `Awesome choice! Calculated your customer custom food ticket successfully:`,
                timestamp: botTimestamp,
                type: "order_summary",
                orderSummary: {
                  items: draftItems,
                  subtotal,
                  deliveryFee,
                  total,
                  orderId: orderDraftId,
                },
              },
            ]);

            const tempOrder: Order = {
              id: orderDraftId,
              rawText: text,
              items: draftItems,
              subtotal,
              deliveryFee,
              tax: 0,
              total,
              status: "pending",
              createdAt: new Date().toISOString(),
              customerName: activeName,
              customerPhone: activePhone,
              deliveryAddress: activeAddress,
              pickupAddress: activePickupAddress,
              driverName: "",
              driverPhone: "",
              etaMinutes: 24,
              progress: 0,
              driverPathIndex: 0,
            };
            console.log("CREATING ORDER", tempOrder);
            setOrders((prev) => [...prev, tempOrder]);
            sendNewOrderTelegramNotification(tempOrder);
          }
          setIsParsing(false);
        }, 800);

        return;
      }
    }

    try {
      // 2. Query server parser (using gemini-3.5-flash with rules fallback)
      const response = await fetch("/api/parse-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (response.ok) {
        const result: ParsedResponse & { warning?: string; aiUsed?: boolean } =
          await response.json();
        const botTimestamp = new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        // If items were successfully matched
        if (result.success && result.matchedItems.length > 0) {
          // Map matched ids to fully qualified menu details & check prices/availability
          const draftItems: OrderItem[] = [];
          const unavailableItems: string[] = [];

          result.matchedItems.forEach((match) => {
            const fullItem = menuItems.find((i) => i.id === match.id);
            if (fullItem) {
              if (fullItem.isAvailable) {
                draftItems.push({
                  menuItemId: fullItem.id,
                  name: fullItem.name,
                  quantity: match.quantity || 1,
                  unitPrice: fullItem.price,
                  totalPrice: fullItem.price * (match.quantity || 1),
                  customization: match.customization,
                });
              } else {
                unavailableItems.push(fullItem.name);
              }
            }
          });

          // Check if items are actually available to order
          if (draftItems.length > 0) {
            const subtotal = draftItems.reduce(
              (acc, curr) => acc + curr.totalPrice,
              0,
            );
            const deliveryFee = 2.5; // cozy town flat rate
            const total = subtotal + deliveryFee;

            const orderDraftId = "draft_" + Math.floor(Math.random() * 100000);

            // Add draft order to hidden queue for confirmation
            const responseText =
              result.unrecognizedItems.length > 0
                ? `I mapped your food choices!\n\n⚠️ *Excluded raw items:* I omitted "${result.unrecognizedItems.join(", ")}" as they aren't provided in our ready-catalogue.\n\nHere is your checkout proposal:`
                : `Awesome choice! Calculated your ready-made items cart successfully:`;

            setMessages((prev) => [
              ...prev,
              {
                id: "msg_bot_" + Date.now(),
                sender: "bot",
                text: responseText,
                timestamp: botTimestamp,
                type: "order_summary",
                orderSummary: {
                  items: draftItems,
                  subtotal,
                  deliveryFee,
                  total,
                  orderId: orderDraftId,
                },
              },
            ]);

            // Save raw message inside temporary store to confirm later with dynamic profile details of record
            const tempOrder: Order = {
              id: orderDraftId,
              rawText: text,
              items: draftItems,
              subtotal,
              deliveryFee,
              tax: 0,
              total,
              status: "pending",
              createdAt: new Date().toISOString(),
              customerName: activeName,
              customerPhone: activePhone,
              deliveryAddress: activeAddress,
              pickupAddress: activePickupAddress,
              driverName: "",
              driverPhone: "",
              etaMinutes: 24,
              progress: 0,
              driverPathIndex: 0,
            };
            setOrders((prev) => [...prev, tempOrder]);
            sendNewOrderTelegramNotification(tempOrder);

            if (unavailableItems.length > 0) {
              setMessages((prev) => [
                ...prev,
                {
                  id: "msg_bot_unav_" + Date.now(),
                  sender: "bot",
                  text: `Note: ${unavailableItems.join(", ")} is currently marked SOLD OUT in our kitchen catalog, so I excluded it from this draft.`,
                  timestamp: botTimestamp,
                },
              ]);
            }
          } else {
            // All items matched are sold out
            setMessages((prev) => [
              ...prev,
              {
                id: "msg_bot_" + Date.now(),
                sender: "bot",
                text: `It looks like the items you specified (${unavailableItems.join(", ")}) are currently sold out in the kitchen catalog. Please try a different dish!`,
                timestamp: botTimestamp,
              },
            ]);
          }
        } else {
          // Unsuccessful parsing
          const replyText =
            result.clarificationMessage ||
            "I couldn't map your message to our available ready-made menu items. We currently offer pizzas, burgers, wraps, wings, waffles, and beverages. Help me by clarifying your request!";
          setMessages((prev) => [
            ...prev,
            {
              id: "msg_bot_parse_fail_" + Date.now(),
              sender: "bot",
              text: replyText,
              timestamp: botTimestamp,
            },
          ]);
        }
      }
    } catch (err) {
      console.error("Error contacting order parser:", err);
    } finally {
      setIsParsing(false);
    }
  };

  // User clicked payment button in Telegram widget - triggers WebApp Dialog
  const handleConfirmOrder = (draftId: string) => {
    setPaymentDraftOrderId(draftId);
    setPaymentStep("details");
  };

  // Once Advance Payment is submitted, set status to payment_pending
  const handleCompleteAdvancePayment = (draftId: string) => {
    const timestampStr = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const targetOrder = orders.find((o) => o.id === draftId);
    const orderSubtotal = targetOrder ? targetOrder.subtotal : 0;
    const advancePaid = orderSubtotal / 3;
    const orderDeliveryFee = targetOrder ? targetOrder.deliveryFee : 2.5;
    const remainingBalance = (orderSubtotal * 2) / 3 + orderDeliveryFee;

    const txId =
      paymentType === "cbe_bank"
        ? bankTxRef
        : `TXN-${Math.floor(100000 + Math.random() * 900000)}`;
    const destinationDetail =
      paymentType === "telebirr"
        ? "Official Telebirr Account (0916031177)"
        : paymentType === "cbe_birr"
          ? "Official CBE Birr Account (0916031177)"
          : "Official CBE Bank Account (1000100603326)";

    const methodLabel =
      paymentType === "telebirr"
        ? `Telebirr Wallet [To: ${destinationDetail}]`
        : paymentType === "cbe_birr"
          ? `CBE Birr Wallet [To: ${destinationDetail}]`
          : `Commercial Bank of Ethiopia (CBE) [To: ${destinationDetail}]`;

    // Bind the final profile details exactly to this active order and mark status as "Payment Pending Verification"
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === draftId) {
          return {
            ...o,
            status: "payment_pending" as OrderStatus,
            progress: 5,
            customerName: customerProfile.name,
            customerPhone: customerProfile.phone,
            deliveryAddress: customerProfile.address,
            pickupAddress: customerProfile.pickupAddress,
            isPaymentVerified: false,
            isDriverAssigned: false,
            isDriverAccepted: false,
            driverName: "",
            driverPhone: "",
            paymentDetails: {
              amount: advancePaid,
              method:
                paymentType === "telebirr"
                  ? "Telebirr"
                  : paymentType === "cbe_birr"
                    ? "CBE Birr"
                    : "CBE Bank Account",
              reference: txId,
              timestamp: new Date().toLocaleString(),
              receiptPhoto:
                receiptPhoto ||
                "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=500&auto=format&fit=crop&q=60",
            },
          };
        }
        return o;
      }),
    );

    setMessages((prev) => [
      ...prev,
      {
        id: "msg_user_submit_payment_" + Date.now(),
        sender: "user",
        senderName: customerProfile.name,
        text: isAmharic
          ? `👤 *ከደንበኛ የተላከ፦* ${customerProfile.name}\n📞 *ስልክ፦* ${customerProfile.phone}\n📍 *መነሻ፦* ${customerProfile.pickupAddress || "የቶሎ ማእድ ቤት"}\n📍 *መድረሻ፦* ${customerProfile.address}\n\nየክፍያ ማረጋገጫ (Screenshot) አስገብቻለሁ። እባክዎን አረጋግጠው ይላኩልኝ! (${advancePaid.toFixed(2)} Birr)`
          : `👤 *Submitted by:* ${customerProfile.name}\n📞 *Phone:* ${customerProfile.phone}\n📍 *Pickup:* ${customerProfile.pickupAddress || "Tolo Main Kitchen"}\n📍 *Drop-off:* ${customerProfile.address}\n\nI have sent my payment verification screenshot for Order #${draftId}. Please verify and approve my receipt! (${advancePaid.toFixed(2)} Birr)`,
        timestamp: timestampStr,
      },
      {
        id: "msg_bot_paid_receipt_" + Date.now(),
        sender: "bot",
        text: isAmharic
          ? `💳 *የቶሎ ማድረሻ ክፍያ ማረጋገጫ ተልኳል ለ #${draftId}* ✅\n\n👤 *ደንበኛ:* ${customerProfile.name}\n📞 *ስልክ:* ${customerProfile.phone}\n📍 *መነሻ ቦታ:* ${customerProfile.pickupAddress || "(ከተዘጋጀው የቶሎ ማእድ ቤት)"}\n📍 *መድረሻ ቦታ:* ${customerProfile.address}\n\n*የቅድሚያ ክፍያ (1/3):* ${advancePaid.toFixed(2)} Birr\n*ቀሪ እዳ (በማድረሻ ወቅት የሚከፈል):* ${remainingBalance.toFixed(2)} Birr\n*የክፍያ መንገድ:* ${methodLabel}\n*መለያ ቁጥር (Ref ID):* ${txId}\n\n📷 *የማረጋገጫ ፎቶ ለባለቤቱ ተልኳል:* [https://t.me/${operatorUsername || "Cephasimon"}]\n\n⚠️ *የማረጋገጫ ሂደት በመጠባበቅ ላይ:* የእርስዎ የክፍያ ማረጋገጫ ፎቶ ለባለቤቱ (https://t.me/${operatorUsername || "Cephasimon"}) በአስተማማኝ ሁኔታ ተልኳል። ባለቤቱ ልክ ክፍያውን ሲያረጋግጥ አሽከርካሪ ይመደባል እንዲሁም የቀጥታ መከታተያ ካርታ (Live GPS) ይጀምራል!`
          : `💳 *TOLO DELIVERY PAYMENT SUBMITTED for #${draftId}* ✅\n\n👤 *Customer:* ${customerProfile.name}\n📞 *Contact Phone:* ${customerProfile.phone}\n📍 *Pick-Up From:* ${customerProfile.pickupAddress || "(Ready from Tolo Kitchen)"}\n📍 *Drop-Off To:* ${customerProfile.address}\n\n*Advance Payment (1/3 of cost):* ${advancePaid.toFixed(2)} Birr\n*Remaining Balance (Due After Delivery):* ${remainingBalance.toFixed(2)} Birr\n*Method:* ${methodLabel}\n*Receipt Reference:* ${txId}\n\n📷 *Confirmation Photo Sent To Owner:* [https://t.me/${operatorUsername || "Cephasimon"}]\n\n⚠️ *Verification Required:* Your receipt photo has been securely sent to the owner (https://t.me/${operatorUsername || "Cephasimon"}) for approval. Once he approves, a driver will be assigned immediately and live GPS tracking will begin!`,
        timestamp: timestampStr,
        type: "tracking_link",
        trackingOrderId: draftId,
      },
      {
        id: "msg_sys_alert_" + Date.now(),
        sender: "system",
        text: isAmharic
          ? `📢 *አስተዳዳሪው ተረድቷል:* የክፍያ ቼክ ማስያዣ ለትዕዛዝ #${draftId} ይጠበቃል። የማረጋገጫ ፎቶው በአስተማማኝ ሁኔታ ተሰቅሏል ለ https://t.me/${operatorUsername || "Cephasimon"}`
          : `📢 *ADMIN NOTIFIED:* Light payment check required for Order #${draftId}. Receipt confirmation photo has been uploaded for https://t.me/${operatorUsername || "Cephasimon"}!`,
        timestamp: timestampStr,
      },
    ]);

    // Dispatch real-time Telegram alert message to operator
    if (
      botToken &&
      !botToken.includes("8473700859:AAHsKy9mDLPIh5bR-8mO33tpO1530YkJqEk") &&
      operatorChatId
    ) {
      const itemsListText = targetOrder
        ? targetOrder.items
            .map(
              (it) =>
                `• ${it.quantity}x ${it.name} (${it.totalPrice.toFixed(2)} Birr)`,
            )
            .join("\n")
        : "";

      const trackingUrl = `${window.location.origin}/?order=${draftId}`;
      const alertPayload =
        `🔔 *Tolo Delivery (Payment Pending)* 🔔\n\n` +
        `👤 *Customer Name:* ${customerProfile.name}\n` +
        `📞 *Phone Number:* ${customerProfile.phone}\n` +
        `📍 *Pickup Location:* ${customerProfile.pickupAddress || "Tolo Store"}\n` +
        `📍 *Delivery Address:* ${customerProfile.address}\n\n` +
        `💳 *Amount Sent:* ${advancePaid.toFixed(2)} Birr\n` +
        `💵 *Method:* ${methodLabel}\n` +
        `🧾 *Reference ID:* ${txId}\n` +
        `🆔 *Order ID:* #${draftId}\n\n` +
        `⚠️ *Action:* Please log in to your Kitchen Dashboard to verify payment and assign a driver.`;

      fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: operatorChatId,
          text: alertPayload,
          parse_mode: "Markdown",
        }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.ok) {
            console.log(
              "Successfully transmitted operator dispatch to chat ID:",
              operatorChatId,
            );
          } else {
            console.warn(
              "Telegram API returned error delivering operator dispatch:",
              data,
            );
          }
        })
        .catch((netErr) => {
          console.error(
            "Failed to post payload warning to Telegram Bot API:",
            netErr,
          );
        });
    }

    setActiveTrackingOrderId(draftId);
    setPaymentDraftOrderId(null);
    setCurrentPane("tracking");
  };

  // User discarded/cancelled the draft summary
  const handleCancelOrder = (draftId: string) => {
    const timestampStr = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === draftId) {
          return { ...o, status: "cancelled" as OrderStatus };
        }
        return o;
      }),
    );

    setMessages((prev) => [
      ...prev,
      {
        id: "msg_bot_cancel_" + Date.now(),
        sender: "bot",
        text: `Draft order discarded successfully. Let me know whenever you would like to write a new order request!`,
        timestamp: timestampStr,
      },
    ]);
  };

  // Track state progress on Map Component
  const handleStatusChange = (
    orderId: string,
    status: OrderStatus,
    progress: number,
  ) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return { ...o, status, progress };
        }
        return o;
      }),
    );
  };

  // Cancel active order inside kitchen dashboard
  const handleCancelActiveOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return { ...o, status: "cancelled" as OrderStatus };
        }
        return o;
      }),
    );
  };

  // Administrative verification of the user's 1/3 deposit
  const handleVerifyPayment = (orderId: string) => {
    const timestampStr = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            status: "pending" as OrderStatus, // Go back to pending state for driver assignment!
            isPaymentVerified: true,
            driverId: "",
            driverName: "",
            driverPhone: "",
            isDriverAssigned: false,
            isDriverAccepted: false,
            progress: 15,
          };
        }
        return o;
      }),
    );

    setMessages((prev) => [
      ...prev,
      {
        id: "msg_sys_verify_" + Date.now(),
        sender: "bot",
        text: `💳 *TOLO ADVANCE DEPOSIT APPROVED* ✅\n\nYour 1/3 advance payment confirmation screenshot or picture for Order *#${orderId}* has been successfully approved by the owner (https://t.me/Cephasimon).\n\n🛵 *NEXT STEP:* The administrator is currently assigning a specialized rider to dispatch your order immediately. Live GPS tracking will activate as soon as the rider accepts the delivery ticket!`,
        timestamp: timestampStr,
      },
    ]);
  };

  // Assign a driver and collect Driver Name, ID, Phone Number
  const handleAssignDriver = (
    orderId: string,
    driver: { name: string; id: string; phone: string },
  ) => {
    const timestampStr = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const targetOrder = orders.find((o) => o.id === orderId);

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            driverId: driver.id,
            driverName: driver.name,
            driverPhone: driver.phone,
            isDriverAssigned: true,
            progress: 20,
          };
        }
        return o;
      }),
    );

    // Post to bot system logs
    setMessages((prev) => [
      ...prev,
      {
        id: "msg_sys_assign_" + Date.now(),
        sender: "bot",
        text: `🚖 *DRIVER ASSIGNED to Order #${orderId}*\n\nOur dispatcher assigned delivery partner *${driver.name}* (ID: ${driver.id}) to transport your items.\n📞 *Driver Contact:* ${driver.phone}\n\n*Awaiting driver confirmation...*`,
        timestamp: timestampStr,
      },
    ]);

    // Send driver notifications (Requirement 5)
    // When an order is placed and approved, notify the assigned driver
    const itemsListText = targetOrder
      ? targetOrder.items.map((it) => `• ${it.quantity}x ${it.name}`).join("\n")
      : "";
    const driverPayload =
      `🔔 *NEW DELIVERY TICKET ASSIGNED!* 🔔\n` +
      `🆔 *Order ID:* #${orderId}\n` +
      `👤 *Customer:* ${targetOrder?.customerName || "Tollo Client"}\n` +
      `📞 *Customer Phone:* ${targetOrder?.customerPhone || "N/A"}\n` +
      `📍 *Pickup:* ${targetOrder?.pickupAddress || "Tolo Kitchen Hub"}\n` +
      `📍 *Delivery Address:* ${targetOrder?.deliveryAddress || "N/A"}\n` +
      `🍔 *Items:* \n${itemsListText}\n\n` +
      `👉 Please accept this ticket on your device to begin GPS routing.`;

    if (
      botToken &&
      !botToken.includes("8473700859:AAHsKy9mDLPIh5bR-8mO33tpO1530YkJqEk") &&
      operatorChatId
    ) {
      fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: operatorChatId,
          text: `🚖 *DRIVER TERMINAL NOTIFICATION* 📢\n\n${driverPayload}`,
          parse_mode: "Markdown",
        }),
      }).catch((err) =>
        console.error("Error dispatching to driver chat:", err),
      );
    }
  };

  // Driver accepts the delivery ticket (Requirement 6)
  const handleDriverAccept = (orderId: string) => {
    const timestampStr = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const targetOrder = orders.find((o) => o.id === orderId);

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            status: "preparing" as OrderStatus,
            isDriverAccepted: true,
            progress: 30,
          };
        }
        return o;
      }),
    );

    setMessages((prev) => [
      ...prev,
      {
        id: "msg_sys_accept_" + Date.now(),
        sender: "bot",
        text: `🛵 *RIDER ON WAY!* ✅\n\nYour driver *${targetOrder?.driverName || "Tollo Rider"}* has ACCEPTED the ticket and is currently at the partner store picking up your warm meals. Kitchen status: Preparing! Live GPS tracking is now online!`,
        timestamp: timestampStr,
        type: "tracking_link",
        trackingOrderId: orderId,
      },
    ]);
  };

  const activeTrackingOrderDetails =
    orders.find((o) => o.id === activeTrackingOrderId) || null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-850 selection:bg-orange-100 flex flex-col justify-between">
      {/* Universal Workspace Header */}
      <header className="sticky top-0 bg-white border-b border-slate-200 z-30 shadow-sm px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-[#E0560B] text-white rounded-xl shadow-md shadow-orange-100">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-905 tracking-tight font-sans">
                  ቶሎ/Tolo Delivery Bot Prototype
                </span>
                <span className="text-[10px] bg-slate-100 text-slate-600 font-bold border border-slate-200 rounded px-1.5 py-0.2 uppercase font-mono tracking-wide">
                  Demo Workspace
                </span>
              </div>
              <p className="text-xs text-slate-450 font-sans">
                Conversational natural-text ordering & custom dispatch for Tolo
                Delivery
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 float-right text-xs">
            <div className="flex bg-slate-100 rounded-xl p-1 border border-slate-200">
              <button
                id="pane-trigger-consumer"
                onClick={() => setCurrentPane("consumer")}
                className={`py-1.5 px-3 rounded-lg font-medium transition flex items-center gap-1.5 cursor-pointer ${currentPane === "consumer" ? "bg-white text-slate-950 shadow-sm font-semibold" : "text-slate-500 hover:text-slate-800"}`}
              >
                <Smartphone className="w-3.5 h-3.5 text-[#E0560B]" />
                <span>Telegram Bot</span>
              </button>
              <button
                id="pane-trigger-tracking"
                onClick={() => setCurrentPane("tracking")}
                className={`py-1.5 px-3 rounded-lg font-medium transition flex items-center gap-1.5 cursor-pointer ${currentPane === "tracking" ? "bg-white text-slate-950 shadow-sm font-semibold" : "text-slate-500 hover:text-slate-800"}`}
              >
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>
                  Live GPS Tracker (
                  {
                    orders.filter(
                      (o) => o.status === "preparing" || o.status === "driving",
                    ).length
                  }
                  )
                </span>
              </button>
              <button
                id="pane-trigger-admin"
                onClick={() => setCurrentPane("admin")}
                className={`py-1.5 px-3 rounded-lg font-medium transition flex items-center gap-1.5 cursor-pointer ${currentPane === "admin" ? "bg-white text-slate-950 shadow-sm font-semibold" : "text-slate-500 hover:text-slate-800"}`}
              >
                <Settings2 className="w-3.5 h-3.5 text-slate-600" />
                <span>Kitchen Console</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Sandbox Workspace area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {/* Strategic business overview block */}
        <ExplanationAlert onAutoPlaceOrder={handleSendMessage} />

        {/* Responsive Layout Layout grid: Dual screen on desktop, tabbed switch on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          {/* LEFT PANEL: Telegram Simulator - ALWAYS visible on lg desktop, toggled on mobile */}
          <div
            className={`col-span-1 lg:col-span-5 ${currentPane === "consumer" ? "block" : "hidden lg:block"}`}
          >
            <TelegramSimulator
              messages={messages}
              isParsing={isParsing}
              onSendMessage={handleSendMessage}
              onConfirmOrder={handleConfirmOrder}
              onCancelOrder={handleCancelOrder}
              onSelectTrackOrder={(id) => {
                setActiveTrackingOrderId(id);
                setCurrentPane("tracking");
              }}
              activeOrder={activeTrackingOrderDetails}
              customerProfile={customerProfile}
              onOpenProfileModal={() => setIsProfileModalOpen(true)}
              menuItems={menuItems}
              receiptPhoto={receiptPhoto}
              onReceiptPhotoChange={setReceiptPhoto}
              isAmharic={isAmharic}
              onLanguageChange={setIsAmharic}
              orders={orders}
            />
          </div>

          {/* RIGHT PANEL: Live GPS simulator or Admin Console - toggled based on currentPane status */}
          <div
            className={`col-span-1 lg:col-span-12 lg:col-span-7 ${currentPane !== "consumer" ? "block" : "hidden lg:block"}`}
          >
            {/* If tracking is primary or user confirmed order */}
            {currentPane === "tracking" ||
            (currentPane !== "admin" && orders.length > 0) ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
                    Live Drone/Scooter Tracking Canvas
                  </span>
                  {orders.length > 1 && (
                    <div className="flex items-center gap-1.5">
                      <label className="text-xs text-slate-500 font-medium">
                        Select Order:
                      </label>
                      <select
                        value={activeTrackingOrderId || ""}
                        onChange={(e) =>
                          setActiveTrackingOrderId(e.target.value)
                        }
                        className="text-xs bg-white border border-slate-200 rounded px-2 py-1 font-mono focus:outline-none"
                      >
                        {orders.map((o) => (
                          <option key={o.id} value={o.id}>
                            Order #{o.id} ({o.status})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
                <LiveTrackingView
                  order={activeTrackingOrderDetails}
                  onStatusChange={handleStatusChange}
                />
              </div>
            ) : (
              // Inside Kitchen controller pane
              <AdminDashboard
                menuItems={menuItems}
                onUpdateMenu={handleUpdateMenu}
                onResetMenu={handleResetMenu}
                orders={orders}
                onCancelActiveOrder={handleCancelActiveOrder}
                onVerifyPayment={handleVerifyPayment}
                onAssignDriver={handleAssignDriver}
                onDriverAccept={handleDriverAccept}
                botToken={botToken}
                setBotToken={setBotToken}
                operatorChatId={operatorChatId}
                setOperatorChatId={setOperatorChatId}
                operatorUsername={operatorUsername}
                setOperatorUsername={setOperatorUsername}
                customTunnelUrl={customTunnelUrl}
                setCustomTunnelUrl={setCustomTunnelUrl}
                tunnelType={tunnelType}
                setTunnelType={setTunnelType}
              />
            )}
          </div>
        </div>
      </main>

      {/* PROFILE SETUP MODAL DIALOG */}
      <AnimatePresence>
        {isProfileModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-150 relative"
            >
              <div className="bg-slate-900 text-white px-5 py-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-base">👤</span>
                  <div>
                    <h3 className="font-bold text-sm">
                      Customer Profile Record
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      Set primary recipient details for small-city logistics
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsProfileModalOpen(false)}
                  className="text-slate-400 hover:text-white transition p-1 hover:bg-slate-850 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div className="space-y-4 font-sans">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={customerProfile.name}
                        onChange={(e) =>
                          setCustomerProfile((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        placeholder="John Doe"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#E0560B] font-medium font-sans"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={customerProfile.phone}
                        onChange={(e) =>
                          setCustomerProfile((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                        placeholder="e.g. 0911234567"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#E0560B] font-medium font-sans"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Default Pickup Location
                    </label>
                    <div className="relative">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={customerProfile.pickupAddress || ""}
                        onChange={(e) =>
                          setCustomerProfile((prev) => ({
                            ...prev,
                            pickupAddress: e.target.value,
                          }))
                        }
                        placeholder="e.g. Tolo Kitchen Hub"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#E0560B] font-medium font-sans"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Delivery Address
                    </label>
                    <div className="relative">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
                      <textarea
                        value={customerProfile.address}
                        onChange={(e) =>
                          setCustomerProfile((prev) => ({
                            ...prev,
                            address: e.target.value,
                          }))
                        }
                        placeholder="Street name, Appt number, Landmark"
                        rows={2}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#E0560B] font-medium font-sans"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-150 flex items-start gap-2 text-[10.5px] leading-relaxed text-slate-505 font-sans">
                  <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <p>
                    Once saved, any future orders matching in this sandbox
                    workspace automatically retrieve and bind to these
                    customized profile variables instantly.
                  </p>
                </div>

                <button
                  onClick={() => {
                    const cleanPhone = customerProfile.phone
                      .trim()
                      .replace(/[^0-9]/g, "");
                    if (cleanPhone.length !== 10) {
                      alert(
                        "Phone number must have exactly 10 digits (e.g., 0911234567).",
                      );
                      return;
                    }
                    setIsProfileModalOpen(false);
                    setMessages((prev) => [
                      ...prev,
                      {
                        id: "sys_" + Date.now(),
                        sender: "system",
                        text: `👤 Profile updated: ${customerProfile.name} • ${customerProfile.phone}`,
                        timestamp: new Date().toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        }),
                      },
                    ]);
                  }}
                  className="w-full bg-[#E0560B] hover:bg-[#9A3412] text-white text-xs font-bold py-2.5 rounded-xl transition shadow hover:shadow-md cursor-pointer font-sans"
                >
                  Save Delivery Profile
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADVANCE PAYMENT CASHLESS CHECKOUT MINI-APP */}
      <AnimatePresence>
        {paymentDraftOrderId && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-start sm:items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-150 relative flex flex-col max-h-[94vh] sm:max-h-[90vh] my-auto"
            >
              {/* Header */}
              <div className="bg-[#E0560B] text-white px-5 py-4 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-orange-200" />
                  <div>
                    <h3 className="font-bold text-sm">
                      Cozy Advance Payment System
                    </h3>
                    <p className="text-[10px] text-orange-200/90 font-light font-mono">
                      ORDER CHECKOUT WEBAPP
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setPaymentDraftOrderId(null)}
                  className="text-orange-200 hover:text-white transition p-1 hover:bg-[#C24103] rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* STEP 1: FILL DETAILS & COMPUTE PAYMENT */}
              {paymentStep === "details" &&
                (() => {
                  const cleanPhone = customerProfile.phone
                    .trim()
                    .replace(/[^0-9]/g, "");
                  const isPhoneInvalid = cleanPhone.length !== 10;
                  const isProfileIncomplete =
                    !customerProfile.name.trim() ||
                    !customerProfile.phone.trim() ||
                    !customerProfile.pickupAddress.trim() ||
                    !customerProfile.address.trim() ||
                    isPhoneInvalid;
                  return (
                    <div className="p-5 space-y-4 overflow-y-auto flex-1 min-h-0">
                      <div className="bg-slate-50 border border-slate-150 p-3.5 rounded-xl font-sans space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-[#E0560B] uppercase tracking-widest block">
                            Recipient Delivery Address Form
                          </span>
                          {isProfileIncomplete && (
                            <span className="text-[9px] bg-amber-50 text-amber-700 font-bold px-1.5 py-0.5 rounded border border-amber-200">
                              {isPhoneInvalid && customerProfile.phone.trim()
                                ? "Phone must be 10 characters"
                                : "Required"}
                            </span>
                          )}
                        </div>

                        <div className="space-y-2.5">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                              Recipient Full Name
                            </label>
                            <div className="relative">
                              <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                              <input
                                type="text"
                                value={customerProfile.name}
                                onChange={(e) =>
                                  setCustomerProfile((prev) => ({
                                    ...prev,
                                    name: e.target.value,
                                  }))
                                }
                                placeholder="Enter your full name"
                                className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-805 font-sans focus:outline-none focus:ring-2 focus:ring-[#E0560B] font-medium"
                                required
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                              Phone Contact Number
                            </label>
                            <div className="relative">
                              <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                              <input
                                type="text"
                                value={customerProfile.phone}
                                onChange={(e) =>
                                  setCustomerProfile((prev) => ({
                                    ...prev,
                                    phone: e.target.value,
                                  }))
                                }
                                placeholder="e.g. 0911234567"
                                className={`w-full bg-white border rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-805 font-sans focus:outline-none focus:ring-2 focus:ring-[#E0560B] font-medium ${isPhoneInvalid && customerProfile.phone.trim() !== "" ? "border-rose-500 ring-2 ring-rose-500/10" : "border-slate-200"}`}
                                required
                              />
                            </div>
                            {isPhoneInvalid &&
                              customerProfile.phone.trim() !== "" && (
                                <p className="text-rose-600 text-[10px] font-bold mt-1.5 pl-1 font-sans">
                                  ⚠️ Phone must have exactly 10 digits (e.g.,
                                  0911234567).
                                </p>
                              )}
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                              Pick-up Location
                            </label>
                            <div className="relative">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                              <input
                                type="text"
                                value={customerProfile.pickupAddress}
                                onChange={(e) =>
                                  setCustomerProfile((prev) => ({
                                    ...prev,
                                    pickupAddress: e.target.value,
                                  }))
                                }
                                placeholder="Enter restaurant or kitchen hub location"
                                className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-805 font-sans focus:outline-none focus:ring-2 focus:ring-[#E0560B] font-medium"
                                required
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between items-center mb-0.5">
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                Drop-off Location Address
                              </label>
                              <button
                                type="button"
                                onClick={() => {
                                  if (navigator.geolocation) {
                                    navigator.geolocation.getCurrentPosition(
                                      (position) => {
                                        const lat =
                                          position.coords.latitude.toFixed(4);
                                        const lng =
                                          position.coords.longitude.toFixed(4);
                                        setCustomerProfile((prev) => ({
                                          ...prev,
                                          address: `Shared GPS Location (${lat}° N, ${lng}° E)`,
                                        }));
                                      },
                                      (error) => {
                                        setCustomerProfile((prev) => ({
                                          ...prev,
                                          address:
                                            "Shared GPS Location (9.0122° N, 38.7500° E)",
                                        }));
                                      },
                                    );
                                  } else {
                                    setCustomerProfile((prev) => ({
                                      ...prev,
                                      address:
                                        "Shared GPS Location (9.0122° N, 38.7500° E)",
                                    }));
                                  }
                                }}
                                className="text-[#E0560B] hover:text-[#9A3412] font-bold text-[9px] px-2 py-0.5 rounded transition flex items-center gap-0.5 cursor-pointer bg-orange-50"
                                title="Share current customer location browser coordinates"
                              >
                                📍 Share My Location
                              </button>
                            </div>
                            <div className="relative">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                              <textarea
                                value={customerProfile.address}
                                onChange={(e) =>
                                  setCustomerProfile((prev) => ({
                                    ...prev,
                                    address: e.target.value,
                                  }))
                                }
                                placeholder="Enter specific apartment/suite, street address, and town"
                                rows={2}
                                className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-805 font-sans focus:outline-none focus:ring-2 focus:ring-[#E0560B] font-medium"
                                required
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 font-sans">
                          Select Cashless Payment Method
                        </label>
                        <div className="grid grid-cols-3 gap-2 font-sans">
                          <button
                            type="button"
                            onClick={() => setPaymentType("telebirr")}
                            className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1 ${paymentType === "telebirr" ? "border-sky-500 bg-sky-50/40 text-sky-700 font-extrabold shadow-sm" : "border-slate-200 bg-white text-slate-650 hover:bg-slate-50"}`}
                          >
                            <Wallet className="w-4 h-4 text-sky-500" />
                            <span className="text-[9px] font-bold">
                              Telebirr
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setPaymentType("cbe_birr")}
                            className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1 ${paymentType === "cbe_birr" ? "border-amber-600 bg-amber-50/40 text-amber-700 font-extrabold shadow-sm" : "border-slate-200 bg-white text-slate-650 hover:bg-slate-50"}`}
                          >
                            <Smartphone className="w-4 h-4 text-amber-550" />
                            <span className="text-[9px] font-bold">
                              CBE Birr
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setPaymentType("cbe_bank")}
                            className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1 ${paymentType === "cbe_bank" ? "border-purple-600 bg-purple-50/40 text-purple-700 font-extrabold shadow-sm" : "border-slate-200 bg-white text-slate-650 hover:bg-slate-50"}`}
                          >
                            <Landmark className="w-4 h-4 text-purple-605" />
                            <span className="text-[9px] font-bold">
                              CBE Bank
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* Simulated Fields */}
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 space-y-3">
                        {/* Owner Account Details Announcement */}
                        <div className="bg-gradient-to-br from-orange-50/30 to-slate-50 border border-orange-200/50 rounded-xl p-3.5 font-sans shadow-xs">
                          <span className="block text-[10.5px] font-extrabold text-orange-950 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                            👑 Official Tolo Delivery Payment Details:
                          </span>
                          <div className="space-y-2 font-sans text-xs">
                            {paymentType === "telebirr" && (
                              <div className="space-y-1.5 bg-white p-2.5 rounded-lg border border-orange-100 shadow-3xs">
                                <div className="flex items-center justify-between text-slate-900 font-medium">
                                  <span>Account Name:</span>
                                  <span className="font-bold text-orange-950">
                                    Tolo Delivery
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-slate-900 font-medium">
                                  <span className="text-sky-700 font-bold">
                                    Telebirr Number:
                                  </span>
                                  <span className="font-mono bg-sky-50 border border-sky-200 text-sky-850 px-2 py-0.5 rounded font-extrabold text-[12px] select-all tracking-wider">
                                    0916031177
                                  </span>
                                </div>
                              </div>
                            )}
                            {paymentType === "cbe_birr" && (
                              <div className="space-y-1.5 bg-white p-2.5 rounded-lg border border-orange-100 shadow-3xs">
                                <div className="flex items-center justify-between text-slate-900 font-medium">
                                  <span>Account Name:</span>
                                  <span className="font-bold text-orange-950">
                                    Tolo Delivery
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-slate-900 font-medium">
                                  <span className="text-amber-705 font-bold">
                                    CBE Birr Number:
                                  </span>
                                  <span className="font-mono bg-amber-50 border border-amber-200 text-amber-900 px-2 py-0.5 rounded font-extrabold text-[12px] select-all tracking-wider">
                                    0916031177
                                  </span>
                                </div>
                              </div>
                            )}
                            {paymentType === "cbe_bank" && (
                              <div className="space-y-1.5 bg-white p-2.5 rounded-lg border border-orange-100 shadow-3xs">
                                <div className="flex items-center justify-between text-slate-900 font-medium">
                                  <span>CBE Account Name:</span>
                                  <span className="font-bold text-orange-950">
                                    Tolo Delivery
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-slate-900 font-medium">
                                  <span className="text-purple-700 font-bold">
                                    CBE Account No:
                                  </span>
                                  <span className="font-mono bg-purple-50 border border-purple-200 text-purple-900 px-2 py-0.5 rounded font-extrabold text-[11.5px] select-all tracking-normal">
                                    1000100603326
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Custom Owner Telegram Support ID requested */}
                          <div className="mt-3 pt-2.5 border-t border-orange-200/50 flex items-center justify-between text-[11.5px] font-sans bg-white/60 p-2 rounded-lg border border-orange-50">
                            <span className="font-extrabold text-slate-900">
                              Telegram Payment Support:
                            </span>
                            <a
                              href="https://t.me/Cephasimon"
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#E0560B] font-extrabold hover:underline flex items-center gap-1 text-[11.5px]"
                            >
                              <span>t.me/Cephasimon ↗</span>
                            </a>
                          </div>
                        </div>

                        {paymentType === "telebirr" && (
                          <div>
                            <label className="block text-[10px] font-bold text-sky-700 mb-1 font-mono">
                              TELEBIRR PHONE NUMBER
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. 0911234567"
                              value={payerPhone}
                              onChange={(e) => setPayerPhone(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-850 font-mono focus:outline-none focus:ring-1 focus:ring-sky-500"
                            />
                            <p className="text-[9.5px] text-sky-650 mt-1 font-sans font-medium">
                              Pays directly to our official corporate telebirr
                              merchant account. Your phone will receive an
                              automated interactive push notification.
                            </p>
                          </div>
                        )}
                        {paymentType === "cbe_birr" && (
                          <div>
                            <label className="block text-[10px] font-bold text-amber-700 mb-1 font-mono">
                              CBE BIRR MOBILE NUMBER
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. 0911234567"
                              value={payerPhone}
                              onChange={(e) => setPayerPhone(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-850 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
                            />
                            <p className="text-[9.5px] text-amber-650 mt-1 font-sans font-medium">
                              Using Commercial Bank of Ethiopia mobile money to
                              transfer directly to the official corporate CBE
                              Birr merchant till.
                            </p>
                          </div>
                        )}
                        {paymentType === "cbe_bank" && (
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-purple-700 mb-1 font-mono">
                              YOUR CBE BANK TRANSACTION CODE / REFERENCE
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. CBE-TX-9281729A"
                              value={bankTxRef}
                              onChange={(e) => setBankTxRef(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-850 font-mono focus:outline-none focus:ring-1 focus:ring-purple-500"
                              required
                            />
                            <p className="text-[9.5px] text-purple-650 font-sans">
                              Once you transfer money to our official Bank
                              Account above, enter the reference code here to
                              verify.
                            </p>
                          </div>
                        )}

                        {/* Unified Photo Screenshot Uploader Section */}
                        <div className="bg-slate-100 border border-slate-250 p-3.5 rounded-xl space-y-3 font-sans">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] font-bold text-[#E0560B] uppercase tracking-wider block">
                              📷 Insert Payment Picture Mode
                            </label>
                            <span className="text-[8.5px] font-extrabold bg-orange-50 text-[#E0560B] px-1.5 py-0.5 rounded uppercase tracking-wider border border-orange-200 animate-pulse">
                              SCREENSHOT REQUIRED
                            </span>
                          </div>
                          <p className="text-[9.5px] text-slate-500 leading-snug">
                            Please attach/insert an image of your payment
                            confirmation (Telebirr slip or CBE bank screenshot)
                            to initiate kitchen prep.
                          </p>

                          {receiptPhoto ? (
                            <div className="space-y-2">
                              <div className="relative border border-slate-200 bg-white rounded-xl p-1.5 max-h-[140px] flex items-center justify-center overflow-hidden shadow-xs">
                                <img
                                  src={receiptPhoto}
                                  alt="Payment Receipt"
                                  className="max-h-[120px] rounded-lg object-contain"
                                  referrerPolicy="no-referrer"
                                />
                                <button
                                  type="button"
                                  onClick={() => setReceiptPhoto("")}
                                  className="absolute top-1.5 right-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full p-1 shadow transition cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <span className="text-[10.5px] font-bold text-emerald-700 flex items-center gap-1">
                                ✓ Receipt screenshot attached successfully!
                              </span>
                            </div>
                          ) : (
                            <div className="space-y-2.5">
                              <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-orange-500 bg-white rounded-xl p-4 text-center cursor-pointer transition hover:bg-slate-50/50">
                                <Upload className="w-5 h-5 text-[#E0560B] mb-1" />
                                <span className="text-[11px] font-bold text-slate-800">
                                  Choose custom screenshot image
                                </span>
                                <span className="text-[9px] text-slate-450 mt-0.5">
                                  Supports PNG, JPG, JPEG
                                </span>
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
                                          setReceiptPhoto(
                                            event.target.result as string,
                                          );
                                        }
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                />
                              </label>

                              <div className="space-y-1">
                                <span className="text-[9px] font-bold text-slate-500 block uppercase tracking-wider">
                                  Or simulation samples:
                                </span>
                                <div className="grid grid-cols-2 gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setReceiptPhoto(
                                        "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=500&auto=format&fit=crop&q=60",
                                      )
                                    }
                                    className="text-[9.5px] bg-slate-50 hover:bg-white text-slate-800 font-bold border border-slate-205 px-2 py-1.5 rounded-lg text-center truncate cursor-pointer transition shadow-3xs"
                                  >
                                    💳 Telebirr Slip Info
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setReceiptPhoto(
                                        "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=500&auto=format&fit=crop&q=60",
                                      )
                                    }
                                    className="text-[9.5px] bg-slate-50 hover:bg-white text-slate-800 font-bold border border-slate-205 px-2 py-1.5 rounded-lg text-center truncate cursor-pointer transition shadow-3xs"
                                  >
                                    🧾 CBE Wallet Slip Info
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <p className="text-[10px] text-slate-450 leading-relaxed font-light font-sans">
                          Your transaction details are securely processed
                          directly to Tolo Delivery's brand merchant platform.
                        </p>
                      </div>

                      {(() => {
                        const currentOrder = orders.find(
                          (o) => o.id === paymentDraftOrderId,
                        );
                        const mealPrice = currentOrder
                          ? currentOrder.subtotal
                          : 0;
                        const advancePrice = mealPrice / 3;
                        const remainingMeal = (mealPrice * 2) / 3;
                        const shippingFee = currentOrder
                          ? currentOrder.deliveryFee
                          : 2.5;
                        const payableOnDelivery = remainingMeal + shippingFee;

                        return (
                          <div className="border-t border-dashed border-slate-200 pt-3 space-y-1.5 text-xs font-sans">
                            <div className="flex justify-between text-slate-500">
                              <span>Estimated Food Price (Subtotal):</span>
                              <span className="font-mono">
                                {mealPrice.toFixed(2)} Birr
                              </span>
                            </div>
                            <p className="text-[10.5px] text-amber-700 bg-amber-50 border border-amber-200 p-2 rounded-lg leading-relaxed font-sans font-medium">
                              📢 <strong>Price Holder Notice:</strong> This
                              estimated total represents a pricing holder value
                              only. For verification during authorization, you
                              will only pay <strong>1/3 of this amount</strong>{" "}
                              right now.
                            </p>
                            <div className="flex justify-between font-bold text-slate-800">
                              <span className="text-emerald-700">
                                Advance Deposit Required (1/3 of food):
                              </span>
                              <span className="font-mono text-emerald-700 font-extrabold text-sm">
                                {advancePrice.toFixed(2)} Birr
                              </span>
                            </div>
                            <div className="flex justify-between text-slate-500">
                              <span>
                                Remaining Food Balance (Due At Delivery):
                              </span>
                              <span className="font-mono">
                                {remainingMeal.toFixed(2)} Birr
                              </span>
                            </div>
                            <div className="flex justify-between text-slate-500">
                              <span>Delivery Fee (Paid After Delivery):</span>
                              <span className="font-mono">
                                {shippingFee.toFixed(2)} Birr
                              </span>
                            </div>
                            <div className="flex justify-between font-semibold text-slate-900 border-t border-dashed border-slate-200 pt-1 text-[#E0560B]">
                              <span>Total Due Upon Delivery:</span>
                              <span className="font-mono font-bold">
                                {payableOnDelivery.toFixed(2)} Birr
                              </span>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Explicit Error Specification Box */}
                      {isProfileIncomplete && (
                        <div className="p-3 bg-rose-50 border border-rose-250 rounded-xl font-sans text-xs text-rose-800 leading-relaxed font-semibold transition-all">
                          <span className="font-bold block text-sm mb-1">
                            ⚠️ Cannot Proceed to Payment:
                          </span>
                          {!customerProfile.name.trim() && (
                            <span className="block">
                              • Recipient Full Name is required.
                            </span>
                          )}
                          {!customerProfile.phone.trim() && (
                            <span className="block">
                              • Phone Contact Number is required.
                            </span>
                          )}
                          {isPhoneInvalid &&
                            customerProfile.phone.trim() !== "" && (
                              <span className="block font-bold text-rose-700 font-sans">
                                • Phone contact number must have exactly 10
                                digits (e.g., 0911234567).
                              </span>
                            )}
                          {!customerProfile.pickupAddress.trim() && (
                            <span className="block">
                              • Pick-up Location is required.
                            </span>
                          )}
                          {!customerProfile.address.trim() && (
                            <span className="block">
                              • Drop-off Location Address is required.
                            </span>
                          )}
                        </div>
                      )}

                      {isProfileIncomplete ? null : !receiptPhoto ? (
                        <div className="p-3.5 bg-rose-50 border border-rose-250 text-rose-800 text-xs rounded-xl font-sans font-bold flex items-center gap-2">
                          <span>⚠️</span>
                          <span>
                            Please upload/insert a payment receipt picture, or
                            select a simulation preset above to trigger
                            verification.
                          </span>
                        </div>
                      ) : null}

                      <button
                        onClick={() => {
                          if (isProfileIncomplete || !receiptPhoto) return;

                          // Immediately register/submit payment details to orders array with status "payment_pending"
                          handleCompleteAdvancePayment(paymentDraftOrderId!);

                          setPaymentStep("waiting");
                          setTimeout(() => {
                            setPaymentStep("awaiting_admin");
                          }, 1500);
                        }}
                        disabled={isProfileIncomplete || !receiptPhoto}
                        className={`w-full text-xs font-bold py-3.5 rounded-xl transition shadow hover:shadow-md flex items-center justify-center gap-1.5 cursor-pointer font-sans ${isProfileIncomplete || !receiptPhoto ? "bg-slate-300 text-slate-600 cursor-not-allowed opacity-80" : "bg-emerald-600 hover:bg-emerald-700 text-white animate-pulse"}`}
                      >
                        <Lock className="w-3.5 h-3.5" />
                        {isProfileIncomplete
                          ? "Resolve Profile Errors to Authorize"
                          : !receiptPhoto
                            ? "Insert Receipt Photo to submit"
                            : "Send Screenshot to Owner (https://t.me/Cephasimon)"}
                      </button>
                    </div>
                  );
                })()}

              {/* STEP 2: LOADING GATEWAY SCREEN */}
              {paymentStep === "waiting" && (
                <div className="p-8 text-center space-y-4 overflow-y-auto flex-1">
                  <div className="flex justify-center">
                    <Loader2 className="w-10 h-10 text-[#E0560B] animate-spin" />
                  </div>
                  <div className="font-sans">
                    <h4 className="font-bold text-sm text-slate-800 animate-pulse">
                      Hashing Cashless Advance Proof
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
                      Digitizing receipt metadata coordinates... uploading file
                      elements to Tolo central store to prompt administrative
                      check.
                    </p>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    [ TRANSMITTING PHOTO PROOF TO OWNER... ]
                  </div>
                </div>
              )}

              {/* STEP 3: AWAITING ADMIN APPROVAL SCREEN */}
              {paymentStep === "awaiting_admin" && (
                <div className="p-5 text-center space-y-4 font-sans overflow-y-auto flex-1 flex flex-col justify-between min-h-0">
                  <div className="space-y-3 shrink-0">
                    <div className="flex justify-center">
                      <div className="relative">
                        <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 border border-amber-300 animate-pulse">
                          <Eye className="w-6 h-6" />
                        </div>
                        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-orange-500"></span>
                        </span>
                      </div>
                    </div>
                    <div className="font-sans">
                      <h4 className="font-bold text-slate-850 text-sm">
                        Awaiting Owner Verification...
                      </h4>
                      <p className="text-[11px] text-amber-700 font-bold bg-amber-50 rounded-lg p-2 border border-amber-200 mt-1 max-w-sm mx-auto leading-relaxed">
                        ⏳ Status: Pending Admin Approval
                      </p>
                      <p className="text-[11.5px] text-slate-500 mt-2 max-w-xs mx-auto leading-relaxed">
                        Your payment photo screenshot has been submitted and
                        shared with the owner.
                        <strong>Only the administrator</strong> can review and
                        approve it from the <strong>Kitchen Console</strong>{" "}
                        dashboard.
                      </p>
                    </div>
                  </div>

                  {/* Thumbnail display of what they uploaded */}
                  <div className="bg-slate-50 border border-slate-200 py-2.5 px-3 rounded-xl space-y-1.5 text-center my-1.5 shrink-0">
                    <span className="text-[9.5px] font-bold text-slate-500 uppercase tracking-wider block">
                      Attached Payment Picture:
                    </span>
                    <div className="relative border border-slate-150 bg-white rounded-lg p-1 max-h-[85px] max-w-[140px] mx-auto flex items-center justify-center overflow-hidden shadow-2xs">
                      {receiptPhoto ? (
                        <img
                          src={receiptPhoto}
                          alt="Submitted Receipt Thumbnail"
                          className="max-h-[75px] rounded object-contain"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">
                          No image attached
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-600 block leading-tight mt-1.5 font-bold">
                      Reference Code:{" "}
                      <span className="font-mono text-[#E0560B] font-extrabold bg-orange-50 border border-orange-100 px-1.5 rounded">
                        {bankTxRef || "TXN-AUTO"}
                      </span>
                    </span>
                  </div>

                  {/* Direct Simulator Action Buttons (Replaces kitchen console simulation guidance text) */}
                  <div className="p-3 bg-slate-50 border border-slate-205 rounded-xl space-y-2.5 mt-1 shrink-0 font-sans">
                    <span className="text-[9.5px] font-extrabold text-[#E0560B] uppercase tracking-wider block text-center">
                      ⚡ Immediate Sandbox Decision Control
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (paymentDraftOrderId) {
                            handleCancelActiveOrder(paymentDraftOrderId);
                          }
                        }}
                        className="bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-700 border border-rose-205 text-[11px] font-bold py-2.5 px-3 rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1 font-sans"
                        id="sandbox-btn-cancel"
                      >
                        ❌ Cancel Order
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (paymentDraftOrderId) {
                            handleVerifyPayment(paymentDraftOrderId);
                          }
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-[11px] font-bold py-2.5 px-3 rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1 font-sans"
                        id="sandbox-btn-approve"
                      >
                        ✅ Approve Order
                      </button>
                    </div>
                  </div>

                  {/* Action or Loader */}
                  <div className="pt-2 shrink-0">
                    <div className="flex items-center justify-center gap-1.5 text-slate-400 font-mono text-[9px] uppercase tracking-wider animate-pulse">
                      <Loader2 className="w-3 h-3 animate-spin text-[#E0560B]" />
                      <span>Polling for administrator signature...</span>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: TRANSACTION VERIFIED BY ADMIN SUCCESS */}
              {paymentStep === "success" && (
                <div className="p-6 text-center space-y-4 font-sans overflow-y-auto flex-1 flex flex-col justify-between min-h-0">
                  <div className="space-y-4 shrink-0">
                    <div className="flex justify-center">
                      <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 border border-emerald-300 shadow-xs animate-bounce">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                    </div>
                    <div className="font-sans">
                      <h4 className="font-bold text-emerald-905 text-sm">
                        Deposit Approved by Admin! 🎉
                      </h4>
                      <p className="text-xs text-slate-500 mt-1.5 max-w-sm leading-relaxed">
                        Your 1/3 advance payment screenshot has been verified
                        and approved by the owner! Your order is being cooked
                        inside the kitchen.
                      </p>
                    </div>

                    <div className="bg-slate-50 border border-slate-150 p-3 rounded-xl text-xs text-left text-slate-605 space-y-1.5 font-mono">
                      <div className="flex justify-between border-b border-dashed border-slate-150 pb-1">
                        <span>Verification Status:</span>
                        <span className="font-bold text-emerald-700">
                          VERIFIED & APPROVED ✅
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span>Consignee Name:</span>
                        <span>{customerProfile.name}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span>Delivery Coords:</span>
                        <span className="truncate max-w-[170px]">
                          {customerProfile.address}
                        </span>
                      </div>
                      {(() => {
                        const currentOrder = orders.find(
                          (o) => o.id === paymentDraftOrderId,
                        );
                        const mealPrice = currentOrder
                          ? currentOrder.subtotal
                          : 0;
                        const advancePrice = mealPrice / 3;
                        const deliveryFeeVal = currentOrder
                          ? currentOrder.deliveryFee
                          : 2.5;
                        const payableOnDelivery =
                          (mealPrice * 2) / 3 + deliveryFeeVal;

                        return (
                          <>
                            <div className="flex justify-between text-emerald-700 font-bold border-t border-dashed border-slate-150 pt-1">
                              <span>Advance Deposit paid:</span>
                              <span>{advancePrice.toFixed(2)} Birr</span>
                            </div>
                            <div className="flex justify-between text-slate-550 text-[10.5px]">
                              <span>Delivery Fee (Pay After):</span>
                              <span>{deliveryFeeVal.toFixed(2)} Birr</span>
                            </div>
                            <div className="flex justify-between text-slate-550 text-[10.5px]">
                              <span>Remaining meal price:</span>
                              <span>
                                {((mealPrice * 2) / 3).toFixed(2)} Birr
                              </span>
                            </div>
                            <div className="flex justify-between text-slate-800 font-bold border-t border-slate-200 pt-1">
                              <span>Pending Balance Due Upon Delivery:</span>
                              <span>{payableOnDelivery.toFixed(2)} Birr</span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      // Close modal and take user directly to Live Tracker
                      const trackingId = paymentDraftOrderId;
                      setPaymentDraftOrderId(null);
                      if (trackingId) {
                        setActiveTrackingOrderId(trackingId);
                        setCurrentPane("tracking");
                      }
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-3 rounded-xl transition shadow hover:shadow-md cursor-pointer font-sans shrink-0"
                  >
                    🛵 Open Live GPS & Rider Tracker
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Corporate Pitch Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-6 mt-12 shrink-0">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-light text-center sm:text-left">
          <div>
            <span className="block font-bold text-white mb-0.5 tracking-tight font-sans">
              ቶሎ/Tolo Delivery Logistics Solutions Ltd.
            </span>
            <span className="text-slate-400 block max-w-md leading-relaxed text-[11.5px]">
              Ready-made catalogue integration & semantic order parsing. Powered
              server-side by modern Antigravity Gemini-3.5 models.
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-500 block font-mono">
              Simulated Sandbox Version 1.0.4
            </span>
            <span className="text-orange-400 font-semibold block mt-0.5">
              Perfect for Small Town Hyperlocal Scaling
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
