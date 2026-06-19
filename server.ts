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
  // Injera (እንጀራ)
  { id: "item_b1", name: "Key Wet(ቀይ ወጥ)", category: "Injera", price: 450.00, description: "Classic spicy Ethiopian beef stew cooked with berbere and savory spices, served with fresh Injera.", isAvailable: true, estimatedPrepTime: 12 },
  { id: "item_b2", name: "Tefersho(ተፈረሾ)", category: "Injera", price: 450.00, description: "Savory pulled beef or lamb stew sautéed with spiced butter, garlic, and onions, served with Injera.", isAvailable: true, estimatedPrepTime: 10 },
  { id: "item_b3", name: "Beyeaynet (በአይነት)", category: "Injera", price: 200.00, description: "Variety platter of traditional fasting stews including lentils, peas, and standard vegetables on Injera.", isAvailable: true, estimatedPrepTime: 5 },
  { id: "item_b4", name: "Gomen Besiga(ጎመን በስጋ)", category: "Injera", price: 450.00, description: "Collard greens slow-cooked with succulent pieces of beef, garlic, ginger, and kibbeh (Ethiopian clarified butter).", isAvailable: true, estimatedPrepTime: 15 },
  { id: "item_b5", name: "Mahberawi 1/2(ማህበራዊ)", category: "Injera", price: 1100.00, description: "Half-portion combination platter of mixed meat and vegetable stews, perfect for sharing.", isAvailable: true, estimatedPrepTime: 18 },
  { id: "item_b6", name: "Shiro Feses(ሽሮ ፈሰስ)", category: "Injera", price: 200.00, description: "Smooth, liquid-consistency chickpea stew slow-simmered with onions, garlic, and spices.", isAvailable: true, estimatedPrepTime: 8 },
  { id: "item_b7", name: "Misir Wet(ምስር ወጥ)", category: "Injera", price: 200.00, description: "Aromatic and spicy red lentil stew slow-cooked with berbere sauce.", isAvailable: true, estimatedPrepTime: 8 },
  { id: "item_b8", name: "vegetabl With Meat(አትክልት በስጋ)", category: "Injera", price: 400.00, description: "Garden vegetables (cabbage, carrots, potatoes) sautéed with juicy beef chunks.", isAvailable: true, estimatedPrepTime: 14 },

  // Pasta
  { id: "item_b9", name: "ፓስታ በስጎ", category: "Pasta", price: 200.00, description: "Classic pasta noodles tossed in a home-style spiced tomato and onion sauce (sigo).", isAvailable: true, estimatedPrepTime: 8 },
  { id: "item_b10", name: "Pasta Beatikilt (ፓስታ በአትክልት)", category: "Pasta", price: 200.00, description: "Freshly prepared pasta mixed with steamed seasonal vegetables and aromatic herbs.", isAvailable: true, estimatedPrepTime: 8 },
  { id: "item_b11", name: "Pasta Besiga(ፓስታ በስጋ)", category: "Pasta", price: 450.00, description: "Perfectly boiled pasta topped with rich, savory beef bolognese sauce.", isAvailable: true, estimatedPrepTime: 10 },

  // Breakfast
  { id: "item_b12", name: "Enkulal Firfir (እንቁላል ፍርፍር)", category: "Breakfast", price: 250.00, description: "Ethiopian scrambled eggs sautéed with tomatoes, onions, green peppers, and spiced butter.", isAvailable: true, estimatedPrepTime: 6 },
  { id: "item_b13", name: "እንቁላል ስልስ", category: "Breakfast", price: 250.00, description: "Scrambled eggs simmered in a rich tomato sauce with local spices and kibbeh.", isAvailable: true, estimatedPrepTime: 8 },

  // Habeshan
  { id: "item_b14", name: "Ayb Besiga(አይብ በስጋ)", category: "Habeshan", price: 450.00, description: "Sautéed savory beef pieces accompanied by spicy local yellow/white home-style cheese (ayeb).", isAvailable: true, estimatedPrepTime: 12 },
  { id: "item_b15", name: "አገልግል ግማሽ", category: "Habeshan", price: 1100.00, description: "Half-size traditional wrapped meat basket containing various rich stews and rolls.", isAvailable: true, estimatedPrepTime: 20 },
  { id: "item_b16", name: "Mahberawi(ማህበራዊ)", category: "Habeshan", price: 1600.00, description: "Grand festive mixed platter of meat wots, tibs, and boiled eggs, served over double-layered Injera.", isAvailable: true, estimatedPrepTime: 20 },
  { id: "item_b17", name: "Enkulal Besiga (እንቁላል በስጋ)", category: "Habeshan", price: 450.00, description: "Scrambled egg platter sautéed with tender shredded beef pieces and green chillies.", isAvailable: true, estimatedPrepTime: 8 },
  { id: "item_b18", name: "ስጋ ፍርፍር", category: "Habeshan", price: 400.00, description: "Succulent beef pieces sautéed in spiced butter, stewed in berbere, shredded and mixed with Injera.", isAvailable: true, estimatedPrepTime: 10 },
  { id: "item_b19", name: "Merek Tibs", category: "Habeshan", price: 450.00, description: "Juicy pan-fried meat chunks served with a savory, spiced seasoned broth.", isAvailable: true, estimatedPrepTime: 12 },
  { id: "item_b20", name: "Ayb Begomen(አይብ በጎመን)", category: "Habeshan", price: 300.00, description: "Local cottage cheese (ayeb) blended with spiced leafy greens and ghee.", isAvailable: true, estimatedPrepTime: 10 },
  { id: "item_b21", name: "Dulet", category: "Habeshan", price: 400.00, description: "Traditional spicy minced tripe, liver, and lean beef sautéed in mitmita and clarified spiced butter.", isAvailable: true, estimatedPrepTime: 12 },
  { id: "item_b22", name: "Pasta Be enkulal", category: "Habeshan", price: 250.00, description: "Stir-fried pasta tossed with savory scrambled eggs and sliced sautéed peppers.", isAvailable: true, estimatedPrepTime: 8 },
  { id: "item_b23", name: "Minchet", category: "Habeshan", price: 400.00, description: "Minced lean beef simmered in a rich, mild or spicy berbere gravy, garnished with boiled eggs.", isAvailable: true, estimatedPrepTime: 12 },
  { id: "item_b24", name: "Dinch Wot", category: "Habeshan", price: 200.00, description: "Slow-cooked savory potato stew infused with onions, garlic, turmeric, and local herbs.", isAvailable: true, estimatedPrepTime: 8 }
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
