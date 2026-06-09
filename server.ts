import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini API Client successfully initialized.");
  } catch (err) {
    console.error("Failed to initialize Gemini Client:", err);
  }
} else {
  console.warn("GEMINI_API_KEY not configured or has default placeholder. Fallback mock parsing will be active.");
}

// Default menu items list
const MENU_ITEMS = [
  { id: "item_1", name: "Cheeseburger Deluxe", category: "Burgers", price: 6.50, description: "Juicy beef patty, cheddar, lettuce, tomato, special sauce", isAvailable: true, estimatedPrepTime: 8 },
  { id: "item_2", name: "Spicy Chicken Wrap", category: "Wraps", price: 7.00, description: "Crispy chicken, hot pepper sauce, lettuce, wrapped in flatbread", isAvailable: true, estimatedPrepTime: 7 },
  { id: "item_3", name: "Pepperoni Pizza (Medium)", category: "Pizza", price: 12.00, description: "Classic tomato sauce, mozzarella, loaded with pepperoni", isAvailable: true, estimatedPrepTime: 12 },
  { id: "item_4", name: "Margherita Pizza (Medium)", category: "Pizza", price: 10.00, description: "Fresh mozzarella, tomatoes, basil leaves, extra virgin olive oil", isAvailable: true, estimatedPrepTime: 10 },
  { id: "item_5", name: "French Fries (Large)", category: "Sides", price: 3.50, description: "Crisp golden fries seasoned with a touch of sea salt", isAvailable: true, estimatedPrepTime: 5 },
  { id: "item_6", name: "BBQ Chicken Wings (8pcs)", category: "Sides", price: 8.50, description: "Tender wings glazed in smokey hickory BBQ sauce", isAvailable: true, estimatedPrepTime: 9 },
  { id: "item_7", name: "Waffles with Nutella", category: "Dessert", price: 5.50, description: "Warm waffle topped with creamy Nutella and icing sugar", isAvailable: true, estimatedPrepTime: 6 },
  { id: "item_8", name: "Coca Cola (Can)", category: "Drinks", price: 2.00, description: "Ice-cold classic fizzy beverage", isAvailable: true, estimatedPrepTime: 2 },
  { id: "item_9", name: "Fresh Orange Juice", category: "Drinks", price: 3.50, description: "100% natural, freshly squeezed orange juice", isAvailable: true, estimatedPrepTime: 3 },
  { id: "item_10", name: "Cappuccino", category: "Hot Drinks", price: 3.00, description: "Creamy espresso with steamed milk foam", isAvailable: true, estimatedPrepTime: 4 },
];

// In-memory active catalog editing support for Admin UI
let currentMenu = [...MENU_ITEMS];

// API: Get current menu
app.get("/api/menu", (req, res) => {
  res.json(currentMenu);
});

// API: Update item price or availability (Admin action)
app.post("/api/admin/menu/update", (req, res) => {
  const { id, price, isAvailable } = req.body;
  const index = currentMenu.findIndex(i => i.id === id);
  if (index !== -1) {
    if (price !== undefined) currentMenu[index].price = Number(price);
    if (isAvailable !== undefined) currentMenu[index].isAvailable = Boolean(isAvailable);
    res.json({ success: true, item: currentMenu[index] });
  } else {
    res.status(404).json({ error: "Item not found" });
  }
});

// API: Reset menu to default
app.post("/api/admin/menu/reset", (req, res) => {
  currentMenu = [...MENU_ITEMS];
  res.json({ success: true, menu: currentMenu });
});

// API: Parse Order text using gemini-3.5-flash with a fallback rules-based parser
app.post("/api/parse-order", async (req, res) => {
  const { text } = req.body;
  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Order text is required" });
  }

  // Fallback / mock parser in case API keys are not valid
  const fallbackParse = () => {
    // Basic pattern-based search
    const matched = [];
    const unrecognized = [];
    const lowerText = text.toLowerCase();

    currentMenu.forEach(item => {
      // Find matches using basic keywords
      const itemKeywords = item.name.toLowerCase().split(' ');
      let matchesItem = false;

      if (lowerText.includes(item.name.toLowerCase())) {
        matchesItem = true;
      } else {
        // match sub-keywords (pizza, burger, wrap, fries, wing, waffle, coke, juice, coffee)
        const commonWord = item.name.split(' ')[0].toLowerCase();
        if (commonWord.length > 3 && lowerText.includes(commonWord)) {
          matchesItem = true;
        }
      }

      if (matchesItem) {
        // extract quantity if written before key terms like "2 fries" or "2 pepperoni"
        const index = lowerText.indexOf(item.name.split(' ')[0].toLowerCase());
        let quantity = 1;
        if (index > 0) {
          const prevChar = lowerText.substring(index - 3, index).trim();
          const matchNum = prevChar.match(/\d+/);
          if (matchNum) {
            quantity = parseInt(matchNum[0], 10);
          }
        }
        
        // detect customization words nearby
        let customization = "";
        if (lowerText.includes("no onion") || lowerText.includes("without onion")) {
          customization = "no onion";
        } else if (lowerText.includes("extra cheese")) {
          customization = "extra cheese";
        } else if (lowerText.includes("extra garlic") || lowerText.includes("with garlic sauce")) {
          customization = "extra garlic sauce";
        }

        matched.push({
          id: item.id,
          name: item.name,
          quantity: quantity > 0 ? quantity : 1,
          customization: customization || undefined
        });
      }
    });

    // Simple unrecognized collector: if we got absolutely nothing, say so split raw words
    if (matched.length === 0) {
      unrecognized.push(text);
    }

    return {
      success: matched.length > 0,
      matchedItems: matched,
      unrecognizedItems: unrecognized,
      clarificationMessage: matched.length === 0 
        ? "I couldn't identify any food items on our menu. Could you please check what you wrote or clarify?" 
        : unrecognized.length > 0 ? "Let me know if I missed anything else!" : undefined
    };
  };

  // If Gemini client is ready
  if (ai) {
    try {
      const systemInstruction = `You are the backend AI order processor for a local Telegram food delivery bot called "ቶሎ/Tolo Delivery".
Your job is to read raw natural-language order text messages written by customers, parse them, and map them to our select list of "ready-made available foods".

Here is the current Restaurant Menu:
${JSON.stringify(currentMenu, null, 2)}

Instructions:
1. Parse the quantity (default to 1 if not specified).
2. Look at the product names closely and match the user's requested item to the closest available MenuItem ID and Name.
3. Be smart about typos and generic descriptions (e.g., "pepperoni pizza" -> "Pepperoni Pizza (Medium)", "fries" -> "French Fries (Large)", "cappuccino" -> "Cappuccino", "orange juice" -> "Fresh Orange Juice").
4. If an item is clearly on the menu, add it to 'matchedItems' with the correct ID, exact menuItem name, parsed quantity, and any special customization details (e.g., "no onions", "extra sauce", "cold beverage") specified by the user.
5. If some items in the text have no clear match on our menu (e.g. they ask for "a helicopter", "pork ribs", "vegan ice cream" which we don't sell), put those exact terms in the 'unrecognizedItems' list.
6. Provide a friendly, short response or suggestion in 'clarificationMessage' if there are unrecognized items or if any items are missing details. Keep it conversational as if you were a friendly Telegram Bot administrator.

Return your response strictly as JSON conforming to this schema:
{
  "success": boolean,
  "matchedItems": [
    {
      "id": "item_id_string",
      "name": "Exact Menu Item Name",
      "quantity": number,
      "customization": "customization detail or empty string"
    }
  ],
  "unrecognizedItems": ["unmatched text item first", "unmatched text item second"],
  "clarificationMessage": "Short clarification text to send to user if needed, otherwise null"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Process this order order: "${text}"`,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.1, // low temp for accurate deterministic mapping
        }
      });

      const parsedJson = JSON.parse(response.text || "{}");
      return res.json({
        ...parsedJson,
        aiUsed: true
      });
    } catch (gErr) {
      console.error("Gemini Parsing Error - falling back to rules engine:", gErr);
      return res.json({
        ...fallbackParse(),
        aiUsed: false,
        warning: "Gemini server error, fallback search engaged."
      });
    }
  } else {
    // Call fallback parser if no API key is specified
    return res.json({
      ...fallbackParse(),
      aiUsed: false,
      warning: "Demo Mode Mock Parser active (Enter a real GEMINI_API_KEY to test smart AI translation)."
    });
  }
});

// Setup Vite Dev server or Serve static files
async function initServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite dev middleware attached.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static handler attached targeting", distPath);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ቶሎ/Tolo Delivery Server booted successfully. Accessible on port ${PORT}`);
  });
}

initServer().catch(err => {
  console.error("Critical server boot failure:", err);
});
