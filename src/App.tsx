import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  Phone
} from 'lucide-react';

import { MenuItem, Order, OrderItem, ChatMessage, OrderStatus, ParsedResponse } from './types';
import TelegramSimulator from './components/TelegramSimulator';
import AdminDashboard from './components/AdminDashboard';
import LiveTrackingView from './components/LiveTrackingView';
import ExplanationAlert from './components/ExplanationAlert';

export default function App() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState<string | null>(null);
  
  // Custom user profile and mini-app checkout state
  const [customerProfile, setCustomerProfile] = useState({
    name: "",
    phone: "",
    address: "",
    pickupAddress: ""
  });
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Advance Payment Flow Mini-App State
  const [paymentDraftOrderId, setPaymentDraftOrderId] = useState<string | null>(null);
  const [paymentStep, setPaymentStep] = useState<'details' | 'waiting' | 'success'>('details');
  const [paymentType, setPaymentType] = useState<'telebirr' | 'cbe_birr' | 'cbe_bank'>('telebirr');
  const [bankTxRef, setBankTxRef] = useState('CBE-TX-9281729A');
  const [payerPhone, setPayerPhone] = useState('');

  // Sync payerPhone with profile phone only when opening the modal, and default to blank if it's default dummy phone
  useEffect(() => {
    if (paymentDraftOrderId) {
      setPayerPhone(customerProfile.phone === '0911223344' ? '' : customerProfile.phone);
    }
  }, [paymentDraftOrderId, customerProfile.phone]);

  // View Control: On mobile, users can toggle panes if side-by-side is crowded
  const [currentPane, setCurrentPane] = useState<'consumer' | 'admin' | 'tracking'>('consumer');

  // Fetch menu from backend on load
  const loadMenu = async () => {
    try {
      const response = await fetch('/api/menu');
      if (response.ok) {
        const data = await response.json();
        setMenuItems(data);
      }
    } catch (err) {
      console.error('Error loading menu:', err);
    }
  };

  useEffect(() => {
    loadMenu();

    // Welcome messages for Telegram
    setMessages([
      {
        id: 'msg_welcome_1',
        sender: 'bot',
        text: "Hello! Welcome to ቶሎ/Tolo Delivery. 🛵💨\nI'm your speedy city food and parcel order companion. Ready to order?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      },
      {
        id: 'msg_welcome_2',
        sender: 'bot',
        text: "Instead of clicking heavy menus, simply *write* what you want in natural text!\n\nFor example:\n\"Hi, I would like 2 Custom Pizzas and 2 BBQ Spare Ribs.\"\n\nI will instantly read your text, build your kitchen ticket, and enable real-time tracking!\n\n🌐 **Amharic Language Preference / አማርኛ**: You can toggle the Telegram interface to Amharic using the language button in the top menu bar anytime!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, []);

  // Update Item Details inside Catalog
  const handleUpdateMenu = async (id: string, price: number, isAvailable: boolean) => {
    try {
      const response = await fetch('/api/admin/menu/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, price, isAvailable })
      });
      if (response.ok) {
        loadMenu();
      }
    } catch (err) {
      console.error('Error updating menu item:', err);
    }
  };

  // Reset Item Details to Defaults
  const handleResetMenu = async () => {
    try {
      const response = await fetch('/api/admin/menu/reset', { method: 'POST' });
      if (response.ok) {
        loadMenu();
      }
    } catch (err) {
      console.error('Error resetting menu:', err);
    }
  };

  // Process user typing or tapping a sample order
  const handleSendMessage = async (text: string) => {
    const timestampStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsgId = 'msg_user_' + Date.now();

    // 1. Add User query message
    setMessages(prev => [...prev, {
      id: userMsgId,
      sender: 'user',
      text,
      timestamp: timestampStr
    }]);

    setIsParsing(true);

    let activeName = customerProfile.name;
    let activePhone = customerProfile.phone;
    let activeAddress = customerProfile.address;
    let activePickupAddress = customerProfile.pickupAddress;

    // Natural Language Interceptor for Customer Profile Updates in Chat
    const profileWords = ["my delivery profile", "update my profile", "delivery profile is", "profile name:", "profile phone:", "profile address:", "pick-up location:", "delivery profile parameters"];
    const matchesProfileText = profileWords.some(word => text.toLowerCase().includes(word)) || text.includes("👤 Name:") || text.includes("📞 Phone:") || text.includes("📍 Drop-Off Address:") || text.includes("📍 Pick-Up Location:");
    
    if (matchesProfileText) {
      let updatedName = customerProfile.name;
      let updatedPhone = customerProfile.phone;
      let updatedAddress = customerProfile.address;
      let updatedPickupAddress = customerProfile.pickupAddress;

      const lines = text.split('\n');
      lines.forEach(line => {
        const clean = line.replace(/[👤📞📍✏️]/g, '').trim();
        if (/name:/i.test(clean)) {
          const matched = clean.match(/name:\s*(.*)/i);
          if (matched && matched[1]) updatedName = matched[1].trim();
        } else if (/phone:/i.test(clean)) {
          const matched = clean.match(/phone:\s*(.*)/i);
          if (matched && matched[1]) updatedPhone = matched[1].trim();
        } else if (/drop-off address:/i.test(clean) || /address:/i.test(clean)) {
          const matched = clean.match(/(?:drop-off\s+)?address:\s*(.*)/i);
          if (matched && matched[1]) updatedAddress = matched[1].trim();
        } else if (/pick-up location:/i.test(clean) || /pickup:/i.test(clean)) {
          const matched = clean.match(/(?:pick-up\s+location|pickup):\s*(.*)/i);
          if (matched && matched[1]) updatedPickupAddress = matched[1].trim();
        }
      });

      // Simple comma parser fallback if sent on single line
      if (text.includes(",") && updatedName === customerProfile.name) {
        const parts = text.split(',');
        parts.forEach(part => {
          if (part.toLowerCase().includes("name")) {
            const m = part.match(/name\s*(?:is|:)?\s*([^\n,]+)/i);
            if (m) updatedName = m[1].trim();
          }
          if (part.toLowerCase().includes("phone") || part.toLowerCase().includes("number")) {
            const m = part.match(/(?:phone|number)\s*(?:is|:)?\s*([^\n,]+)/i);
            if (m) updatedPhone = m[1].trim();
          }
          if (part.toLowerCase().includes("address") || part.toLowerCase().includes("location")) {
            const m = part.match(/(?:address|location)\s*(?:is|:)?\s*([^\n,]+)/i);
            if (m) updatedAddress = m[1].trim();
          }
          if (part.toLowerCase().includes("pickup") || part.toLowerCase().includes("pick-up")) {
            const m = part.match(/(?:pickup|pick-up)\s*(?:is|:)?\s*([^\n,]+)/i);
            if (m) updatedPickupAddress = m[1].trim();
          }
        });
      }

      setCustomerProfile({
        name: updatedName,
        phone: updatedPhone,
        address: updatedAddress,
        pickupAddress: updatedPickupAddress
      });

      activeName = updatedName;
      activePhone = updatedPhone;
      activeAddress = updatedAddress;
      activePickupAddress = updatedPickupAddress;

      // Add profile updated confirmation message to feed
      setMessages(prev => [...prev, {
        id: 'msg_bot_profile_set_' + Date.now(),
        sender: 'bot',
        text: `📝 *Delivery Profile Saved via Chat!* ✅\n\n👤 *Customer Name:* ${updatedName}\n📞 *Phone Number:* ${updatedPhone}\n📍 *Pick-Up Location:* ${updatedPickupAddress || "Not Specified (Default Store)"}\n📍 *Drop-Off Address:* ${updatedAddress}\n\nOur kitchen dispatch map is fully updated to route from your custom pick-up store to the target drop-off address.`,
        timestamp: timestampStr
      }]);

      // Check if this text ONLY contained the profile update. If there are no food items, return early!
      const hasFoodItems = text.toLowerCase().includes("ticket for") || 
                           text.toLowerCase().includes("please organize") ||
                           text.toLowerCase().includes("want") ||
                           text.toLowerCase().includes("order") ||
                           menuItems.some(item => text.toLowerCase().includes(item.name.toLowerCase().split(' ')[0]));
      
      if (!hasFoodItems) {
        setIsParsing(false);
        return;
      }
    }

    // TICKET SUBMISSION PRE-PARSER (Recognizes custom customer-entered foods with prices effortlessly)
    if (text.startsWith("Please organize a ticket for:")) {
      const botTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const firstLine = text.split('\n')[0];
      const itemsText = firstLine.replace("Please organize a ticket for:", "").trim();
      
      const itemsListStr = itemsText.split(',').map(s => s.trim()).filter(Boolean);
      const draftItems: OrderItem[] = [];

      itemsListStr.forEach((itemStr, index) => {
        const cleanItemStr = itemStr.replace(/\.$/, '').trim();
        // Regex to extract quantity, name, and optional embedded price format like "( $12.00 )" or "($12.00)"
        const rMatch = cleanItemStr.match(/^(\d+)\s+(.+?)(?:\s+\(\$(\d+(?:\.\d+)?)\))?$/) || cleanItemStr.match(/^(\d+)x?\s+(.+)$/);
        
        if (rMatch) {
          const qty = parseInt(rMatch[1]) || 1;
          let name = rMatch[2].trim();
          let price = 8.50; // default standard if not present

          if (rMatch[3]) {
            price = parseFloat(rMatch[3]);
          } else {
            const pMatch = name.match(/\(\$(\d+(?:\.\d+)?)\)/);
            if (pMatch) {
              price = parseFloat(pMatch[1]);
              name = name.replace(/\(\$(\d+(?:\.\d+)?)\)/, '').trim();
            } else {
              const existingItem = menuItems.find(i => i.name.toLowerCase() === name.toLowerCase());
              if (existingItem) {
                price = existingItem.price;
              }
            }
          }

          draftItems.push({
            menuItemId: 'cust_' + Math.floor(Math.random() * 100000) + '_' + index,
            name: name,
            quantity: qty,
            unitPrice: price,
            totalPrice: price * qty
          });
        }
      });

      if (draftItems.length > 0) {
        const subtotal = draftItems.reduce((acc, curr) => acc + curr.totalPrice, 0);
        const deliveryFee = 2.50;
        const total = subtotal + deliveryFee;
        const orderDraftId = 'draft_' + Math.floor(Math.random() * 100000);

        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: 'msg_bot_' + Date.now(),
            sender: 'bot',
            text: `Awesome choice! Calculated your customer custom food ticket successfully:`,
            timestamp: botTimestamp,
            type: 'order_summary',
            orderSummary: {
              items: draftItems,
              subtotal,
              deliveryFee,
              total,
              orderId: orderDraftId
            }
          }]);

          const tempOrder: Order = {
            id: orderDraftId,
            rawText: text,
            items: draftItems,
            subtotal,
            deliveryFee,
            tax: 0,
            total,
            status: 'pending',
            createdAt: new Date().toISOString(),
            customerName: activeName,
            deliveryAddress: activeAddress,
            driverName: 'Maxim (Speedy Scott)',
            driverPhone: '+1 (555) 304-SCOOT',
            etaMinutes: 24,
            progress: 5,
            driverPathIndex: 0
          };
          setOrders(prev => [...prev, tempOrder]);
          setIsParsing(false);
        }, 800);

        return;
      }
    }

    try {
      // 2. Query server parser (using gemini-3.5-flash with rules fallback)
      const response = await fetch('/api/parse-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      if (response.ok) {
        const result: ParsedResponse & { warning?: string; aiUsed?: boolean } = await response.json();
        const botTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // If items were successfully matched
        if (result.success && result.matchedItems.length > 0) {
          // Map matched ids to fully qualified menu details & check prices/availability
          const draftItems: OrderItem[] = [];
          const unavailableItems: string[] = [];

          result.matchedItems.forEach(match => {
            const fullItem = menuItems.find(i => i.id === match.id);
            if (fullItem) {
              if (fullItem.isAvailable) {
                draftItems.push({
                  menuItemId: fullItem.id,
                  name: fullItem.name,
                  quantity: match.quantity || 1,
                  unitPrice: fullItem.price,
                  totalPrice: fullItem.price * (match.quantity || 1),
                  customization: match.customization
                });
              } else {
                unavailableItems.push(fullItem.name);
              }
            }
          });

          // Check if items are actually available to order
          if (draftItems.length > 0) {
            const subtotal = draftItems.reduce((acc, curr) => acc + curr.totalPrice, 0);
            const deliveryFee = 2.50; // cozy town flat rate
            const total = subtotal + deliveryFee;

            const orderDraftId = 'draft_' + Math.floor(Math.random() * 100000);

            // Add draft order to hidden queue for confirmation
            const responseText = result.unrecognizedItems.length > 0 
              ? `I mapped your food choices!\n\n⚠️ *Excluded raw items:* I omitted "${result.unrecognizedItems.join(', ')}" as they aren't provided in our ready-catalogue.\n\nHere is your checkout proposal:`
              : `Awesome choice! Calculated your ready-made items cart successfully:`;

            setMessages(prev => [...prev, {
              id: 'msg_bot_' + Date.now(),
              sender: 'bot',
              text: responseText,
              timestamp: botTimestamp,
              type: 'order_summary',
              orderSummary: {
                items: draftItems,
                subtotal,
                deliveryFee,
                total,
                orderId: orderDraftId
              }
            }]);

            // Save raw message inside temporary store to confirm later with dynamic profile details of record
            const tempOrder: Order = {
              id: orderDraftId,
              rawText: text,
              items: draftItems,
              subtotal,
              deliveryFee,
              tax: 0,
              total,
              status: 'pending',
              createdAt: new Date().toISOString(),
              customerName: activeName,
              deliveryAddress: activeAddress,
              driverName: 'Maxim (Speedy Scott)',
              driverPhone: '+1 (555) 304-SCOOT',
              etaMinutes: 24,
              progress: 5,
              driverPathIndex: 0
            };
            setOrders(prev => [...prev, tempOrder]);

            if (unavailableItems.length > 0) {
              setMessages(prev => [...prev, {
                id: 'msg_bot_unav_' + Date.now(),
                sender: 'bot',
                text: `Note: ${unavailableItems.join(', ')} is currently marked SOLD OUT in our kitchen catalog, so I excluded it from this draft.`,
                timestamp: botTimestamp
              }]);
            }
          } else {
            // All items matched are sold out
            setMessages(prev => [...prev, {
              id: 'msg_bot_' + Date.now(),
              sender: 'bot',
              text: `It looks like the items you specified (${unavailableItems.join(', ')}) are currently sold out in the kitchen catalog. Please try a different dish!`,
              timestamp: botTimestamp
            }]);
          }
        } else {
          // Unsuccessful parsing
          const replyText = result.clarificationMessage || "I couldn't map your message to our available ready-made menu items. We currently offer pizzas, burgers, wraps, wings, waffles, and beverages. Help me by clarifying your request!";
          setMessages(prev => [...prev, {
            id: 'msg_bot_parse_fail_' + Date.now(),
            sender: 'bot',
            text: replyText,
            timestamp: botTimestamp
          }]);
        }
      }
    } catch (err) {
      console.error('Error contacting order parser:', err);
    } finally {
      setIsParsing(false);
    }
  };

  // User clicked payment button in Telegram widget - triggers WebApp Dialog
  const handleConfirmOrder = (draftId: string) => {
    setPaymentDraftOrderId(draftId);
    setPaymentStep('details');
  };

  // Once Advance Payment clears, update the order status
  const handleCompleteAdvancePayment = (draftId: string) => {
    const timestampStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Bind the final profile details exactly to this active order
    setOrders(prev => prev.map(o => {
      if (o.id === draftId) {
        return { 
          ...o, 
          status: 'preparing' as OrderStatus, 
          progress: 15,
          customerName: customerProfile.name,
          deliveryAddress: customerProfile.address,
          pickupAddress: customerProfile.pickupAddress
        };
      }
      return o;
    }));

    // Post bot-chat payment receipt
    const txId = `TXN-${Math.floor(100000 + Math.random() * 900000)}`;
    const methodLabel = paymentType === 'telebirr' ? 'Telebirr Wallet' : paymentType === 'cbe_birr' ? 'CBE Birr Wallet' : 'Commercial Bank of Ethiopia (CBE) Direct';
    
    const targetOrder = orders.find(o => o.id === draftId);
    const orderSubtotal = targetOrder ? targetOrder.subtotal : 0;
    const advancePaid = orderSubtotal / 3;
    const orderDeliveryFee = targetOrder ? targetOrder.deliveryFee : 2.50;
    const remainingBalance = (orderSubtotal * 2 / 3) + orderDeliveryFee;

    setMessages(prev => [...prev, {
      id: 'msg_bot_paid_receipt_' + Date.now(),
      sender: 'bot',
      text: `💳 *TOLO SPEEDY PAYMENT VERIFIED* ✅\n\n👤 *Customer:* ${customerProfile.name}\n📞 *Contact Phone:* ${customerProfile.phone}\n📍 *Pick-Up From:* ${customerProfile.pickupAddress || "(Ready from Tolo Kitchen Hub)"}\n📍 *Drop-Off To:* ${customerProfile.address}\n\n*Advance Payment Made (1/3 of food):* $${advancePaid.toFixed(2)}\n*Remaining Balance (Due After Delivery):* $${remainingBalance.toFixed(2)} (inc. $${orderDeliveryFee.toFixed(2)} delivery fee payable after delivery)\n*Method:* ${methodLabel}\n*Receipt ID:* ${txId}\n\nOur kitchen has queued your order as CONFIRMED. Your 1/3 deposit is secured. The delivery fee is payable after the item is delivered. Live GPS tracking is now active!`,
      timestamp: timestampStr,
      type: 'tracking_link',
      trackingOrderId: draftId
    }]);

    setActiveTrackingOrderId(draftId);
    setPaymentDraftOrderId(null);
    setCurrentPane('tracking');
  };

  // User discarded/cancelled the draft summary
  const handleCancelOrder = (draftId: string) => {
    const timestampStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    setOrders(prev => prev.map(o => {
      if (o.id === draftId) {
        return { ...o, status: 'cancelled' as OrderStatus };
      }
      return o;
    }));

    setMessages(prev => [...prev, {
      id: 'msg_bot_cancel_' + Date.now(),
      sender: 'bot',
      text: `Draft order discarded successfully. Let me know whenever you would like to write a new order request!`,
      timestamp: timestampStr
    }]);
  };

  // Track state progress on Map Component
  const handleStatusChange = (orderId: string, status: OrderStatus, progress: number) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return { ...o, status, progress };
      }
      return o;
    }));
  };

  // Cancel active order inside kitchen dashboard
  const handleCancelActiveOrder = (orderId: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return { ...o, status: 'cancelled' as OrderStatus };
      }
      return o;
    }));
  };

  const activeTrackingOrderDetails = orders.find(o => o.id === activeTrackingOrderId) || null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-850 selection:bg-indigo-100 flex flex-col justify-between">
      
      {/* Universal Workspace Header */}
      <header className="sticky top-0 bg-white border-b border-slate-200 z-30 shadow-sm px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-100">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-905 tracking-tight">ቶሎ/Tolo Delivery Bot Prototype</span>
                <span className="text-[10px] bg-slate-100 text-slate-600 font-bold border border-slate-200 rounded px-1.5 py-0.2 uppercase font-mono tracking-wide">
                  Demo Workspace
                </span>
              </div>
              <p className="text-xs text-slate-450">Conversational natural-text ordering & custom dispatch for Tolo Delivery</p>
            </div>
          </div>

          <div className="flex items-center gap-2 float-right text-xs">
            <div className="flex bg-slate-100 rounded-xl p-1 border border-slate-200">
              <button
                id="pane-trigger-consumer"
                onClick={() => setCurrentPane('consumer')}
                className={`py-1.5 px-3 rounded-lg font-medium transition flex items-center gap-1.5 cursor-pointer ${currentPane === 'consumer' ? 'bg-white text-slate-950 shadow-sm font-semibold' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <Smartphone className="w-3.5 h-3.5 text-indigo-500" />
                <span>Telegram Bot</span>
              </button>
              <button
                id="pane-trigger-tracking"
                onClick={() => setCurrentPane('tracking')}
                className={`py-1.5 px-3 rounded-lg font-medium transition flex items-center gap-1.5 cursor-pointer ${currentPane === 'tracking' ? 'bg-white text-slate-950 shadow-sm font-semibold' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>Live GPS Tracker ({orders.filter(o => o.status === 'preparing' || o.status === 'driving').length})</span>
              </button>
              <button
                id="pane-trigger-admin"
                onClick={() => setCurrentPane('admin')}
                className={`py-1.5 px-3 rounded-lg font-medium transition flex items-center gap-1.5 cursor-pointer ${currentPane === 'admin' ? 'bg-white text-slate-950 shadow-sm font-semibold' : 'text-slate-500 hover:text-slate-800'}`}
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
          <div className={`col-span-1 lg:col-span-5 ${currentPane === 'consumer' ? 'block' : 'hidden lg:block'}`}>
            <TelegramSimulator
              messages={messages}
              isParsing={isParsing}
              onSendMessage={handleSendMessage}
              onConfirmOrder={handleConfirmOrder}
              onCancelOrder={handleCancelOrder}
              onSelectTrackOrder={(id) => {
                setActiveTrackingOrderId(id);
                setCurrentPane('tracking');
              }}
              activeOrder={activeTrackingOrderDetails}
              customerProfile={customerProfile}
              onOpenProfileModal={() => setIsProfileModalOpen(true)}
              menuItems={menuItems}
            />
          </div>

          {/* RIGHT PANEL: Live GPS simulator or Admin Console - toggled based on currentPane status */}
          <div className={`col-span-1 lg:col-span-12 lg:col-span-7 ${currentPane !== 'consumer' ? 'block' : 'hidden lg:block'}`}>
            
            {/* If tracking is primary or user confirmed order */}
            {currentPane === 'tracking' || (currentPane !== 'consumer' && !activeTrackingOrderId && orders.length > 0) ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Live Drone/Scooter Tracking Canvas</span>
                  {orders.length > 1 && (
                    <div className="flex items-center gap-1.5">
                      <label className="text-xs text-slate-500 font-medium">Select Order:</label>
                      <select 
                        value={activeTrackingOrderId || ''} 
                        onChange={(e) => setActiveTrackingOrderId(e.target.value)}
                        className="text-xs bg-white border border-slate-200 rounded px-2 py-1 font-mono focus:outline-none"
                      >
                        {orders.map(o => (
                          <option key={o.id} value={o.id}>Order #{o.id} ({o.status})</option>
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
                    <h3 className="font-bold text-sm">Customer Profile Record</h3>
                    <p className="text-[10px] text-slate-400">Set primary recipient details for small-city logistics</p>
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
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Full Name</label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
                      <input 
                        type="text" 
                        value={customerProfile.name}
                        onChange={(e) => setCustomerProfile(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="John Doe"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium font-sans"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
                      <input 
                        type="text" 
                        value={customerProfile.phone}
                        onChange={(e) => setCustomerProfile(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="e.g. 0911234567"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium font-sans"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Delivery Address</label>
                    <div className="relative">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
                      <textarea 
                        value={customerProfile.address}
                        onChange={(e) => setCustomerProfile(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="Street name, Appt number, Landmark"
                        rows={2}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium font-sans"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-150 flex items-start gap-2 text-[10.5px] leading-relaxed text-slate-505 font-sans">
                  <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <p>Once saved, any future orders matching in this sandbox workspace automatically retrieve and bind to these customized profile variables instantly.</p>
                </div>

                <button
                  onClick={() => {
                    const cleanPhone = customerProfile.phone.trim().replace(/[^0-9]/g, '');
                    if (cleanPhone.length !== 10) {
                      alert("Phone number must have exactly 10 digits (e.g., 0911234567).");
                      return;
                    }
                    setIsProfileModalOpen(false);
                    setMessages(prev => [...prev, {
                      id: 'sys_' + Date.now(),
                      sender: 'system',
                      text: `👤 Profile updated: ${customerProfile.name} • ${customerProfile.phone}`,
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }]);
                  }}
                  className="w-full bg-indigo-600 hover:bg-indigo-750 text-white text-xs font-bold py-2.5 rounded-xl transition shadow hover:shadow-md cursor-pointer font-sans"
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
              <div className="bg-indigo-600 text-white px-5 py-4 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-200" />
                  <div>
                    <h3 className="font-bold text-sm">Cozy Advance Payment System</h3>
                    <p className="text-[10px] text-indigo-200/90 font-light font-mono">ORDER CHECKOUT WEBAPP</p>
                  </div>
                </div>
                <button 
                  onClick={() => setPaymentDraftOrderId(null)}
                  className="text-indigo-200 hover:text-white transition p-1 hover:bg-indigo-700 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* STEP 1: FILL DETAILS & COMPUTE PAYMENT */}
              {paymentStep === 'details' && (() => {
                const cleanPhone = customerProfile.phone.trim().replace(/[^0-9]/g, '');
                const isPhoneInvalid = cleanPhone.length !== 10;
                const isProfileIncomplete = !customerProfile.name.trim() || !customerProfile.phone.trim() || !customerProfile.address.trim() || isPhoneInvalid;
                return (
                  <div className="p-5 space-y-4 overflow-y-auto flex-1 min-h-0">
                    <div className="bg-slate-50 border border-slate-150 p-3.5 rounded-xl font-sans space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block">Recipient Delivery Address Form</span>
                        {isProfileIncomplete && (
                          <span className="text-[9px] bg-amber-50 text-amber-700 font-bold px-1.5 py-0.5 rounded border border-amber-200">
                            {isPhoneInvalid && customerProfile.phone.trim() ? "Phone must be 10 characters" : "Required"}
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-2.5">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Recipient Full Name</label>
                          <div className="relative">
                            <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                            <input 
                              type="text" 
                              value={customerProfile.name}
                              onChange={(e) => setCustomerProfile(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="Enter your full name"
                              className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-805 font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Phone Contact Number</label>
                          <div className="relative">
                            <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                            <input 
                              type="text" 
                              value={customerProfile.phone}
                              onChange={(e) => setCustomerProfile(prev => ({ ...prev, phone: e.target.value }))}
                              placeholder="e.g. 0911234567"
                              className={`w-full bg-white border rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-805 font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium ${isPhoneInvalid && customerProfile.phone.trim() !== '' ? 'border-rose-500 ring-2 ring-rose-500/10' : 'border-slate-200'}`}
                              required
                            />
                          </div>
                          {isPhoneInvalid && customerProfile.phone.trim() !== '' && (
                            <p className="text-rose-600 text-[10px] font-bold mt-1.5 pl-1 font-sans">
                              ⚠️ Phone must have exactly 10 digits (e.g., 0911234567).
                            </p>
                          )}
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-0.5">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Drop-off Location Address</label>
                            <button
                              type="button"
                              onClick={() => {
                                if (navigator.geolocation) {
                                  navigator.geolocation.getCurrentPosition(
                                    (position) => {
                                      const lat = position.coords.latitude.toFixed(4);
                                      const lng = position.coords.longitude.toFixed(4);
                                      setCustomerProfile(prev => ({ ...prev, address: `Shared GPS Location (${lat}° N, ${lng}° E)` }));
                                    },
                                    (error) => {
                                      setCustomerProfile(prev => ({ ...prev, address: 'Shared GPS Location (9.0122° N, 38.7500° E)' }));
                                    }
                                  );
                                } else {
                                  setCustomerProfile(prev => ({ ...prev, address: 'Shared GPS Location (9.0122° N, 38.7500° E)' }));
                                }
                              }}
                              className="text-indigo-600 hover:text-indigo-805 font-bold text-[9px] px-2 py-0.5 rounded transition flex items-center gap-0.5 cursor-pointer bg-indigo-50"
                              title="Share current customer location browser coordinates"
                            >
                              📍 Share My Location
                            </button>
                          </div>
                          <div className="relative">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                            <textarea 
                              value={customerProfile.address}
                              onChange={(e) => setCustomerProfile(prev => ({ ...prev, address: e.target.value }))}
                              placeholder="Enter specific apartment/suite, street address, and town"
                              rows={2}
                              className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-805 font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 font-sans">Select Cashless Payment Method</label>
                      <div className="grid grid-cols-3 gap-2 font-sans">
                        <button
                          type="button"
                          onClick={() => setPaymentType('telebirr')}
                          className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1 ${paymentType === 'telebirr' ? 'border-sky-500 bg-sky-50/40 text-sky-700 font-extrabold shadow-sm' : 'border-slate-200 bg-white text-slate-650 hover:bg-slate-50'}`}
                        >
                          <Wallet className="w-4 h-4 text-sky-500" />
                          <span className="text-[9px] font-bold">Telebirr</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentType('cbe_birr')}
                          className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1 ${paymentType === 'cbe_birr' ? 'border-amber-600 bg-amber-50/40 text-amber-700 font-extrabold shadow-sm' : 'border-slate-200 bg-white text-slate-650 hover:bg-slate-50'}`}
                        >
                          <Smartphone className="w-4 h-4 text-amber-550" />
                          <span className="text-[9px] font-bold">CBE Birr</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentType('cbe_bank')}
                          className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1 ${paymentType === 'cbe_bank' ? 'border-purple-600 bg-purple-50/40 text-purple-700 font-extrabold shadow-sm' : 'border-slate-200 bg-white text-slate-650 hover:bg-slate-50'}`}
                        >
                          <Landmark className="w-4 h-4 text-purple-605" />
                          <span className="text-[9px] font-bold">CBE Bank</span>
                        </button>
                      </div>
                    </div>

                    {/* Simulated Fields */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 space-y-3">
                      {/* Owner Account Details Announcement */}
                      <div className="bg-indigo-50/70 border border-indigo-150 rounded-xl p-3 font-sans">
                        <span className="block text-[10.5px] font-extrabold text-indigo-900 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                          👑 Verified Merchant (Corporate Account) Destination:
                        </span>
                        <div className="space-y-1 font-sans text-xs">
                          {paymentType === 'telebirr' && (
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-indigo-950 font-medium">
                                <span>Account Name:</span>
                                <span className="font-bold text-indigo-900">Tolo Delivery Service plc</span>
                              </div>
                              <div className="flex items-center justify-between text-indigo-950 font-medium">
                                <span>Telebirr Till No:</span>
                                <span className="font-mono bg-white border border-indigo-150 text-indigo-800 px-2 py-0.5 rounded font-bold text-[12px] select-all">890412</span>
                              </div>
                            </div>
                          )}
                          {paymentType === 'cbe_birr' && (
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-indigo-950 font-medium">
                                <span>Account Name:</span>
                                <span className="font-bold text-indigo-900">Tolo Delivery Service plc</span>
                              </div>
                              <div className="flex items-center justify-between text-indigo-950 font-medium">
                                <span>CBE Birr Till Code:</span>
                                <span className="font-mono bg-white border border-indigo-150 text-indigo-800 px-2 py-0.5 rounded font-bold text-[12px] select-all">110928</span>
                              </div>
                            </div>
                          )}
                          {paymentType === 'cbe_bank' && (
                            <div className="text-indigo-950 space-y-1 pt-0.5">
                              <div className="flex items-center justify-between font-medium">
                                <span>CBE Account Name:</span>
                                <span className="font-bold text-indigo-900">Tolo Delivery Corporate Group</span>
                              </div>
                              <div className="flex items-center justify-between font-medium">
                                <span>CBE Account No:</span>
                                <span className="font-mono bg-white border border-indigo-150 text-indigo-800 px-2 py-0.5 rounded font-bold text-[11px] select-all">1000293817162</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {paymentType === 'telebirr' && (
                        <div>
                          <label className="block text-[10px] font-bold text-sky-700 mb-1 font-mono">TELEBIRR PHONE NUMBER</label>
                          <input 
                            type="text" 
                            placeholder="e.g. 0911234567"
                            value={payerPhone}
                            onChange={(e) => setPayerPhone(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-850 font-mono focus:outline-none focus:ring-1 focus:ring-sky-500"
                          />
                          <p className="text-[9.5px] text-sky-650 mt-1 font-sans font-medium">Pays directly to our official corporate telebirr merchant account. Your phone will receive an automated interactive push notification.</p>
                        </div>
                      )}
                      {paymentType === 'cbe_birr' && (
                        <div>
                          <label className="block text-[10px] font-bold text-amber-700 mb-1 font-mono">CBE BIRR MOBILE NUMBER</label>
                          <input 
                            type="text" 
                            placeholder="e.g. 0911234567"
                            value={payerPhone}
                            onChange={(e) => setPayerPhone(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-850 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
                          />
                          <p className="text-[9.5px] text-amber-650 mt-1 font-sans font-medium">Using Commercial Bank of Ethiopia mobile money to transfer directly to the official corporate CBE Birr merchant till.</p>
                        </div>
                      )}
                      {paymentType === 'cbe_bank' && (
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-purple-700 mb-1 font-mono">YOUR CBE BANK TRANSACTION CODE / REFERENCE</label>
                          <input 
                            type="text" 
                            placeholder="e.g. CBE-TX-9281729A"
                            value={bankTxRef}
                            onChange={(e) => setBankTxRef(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-850 font-mono focus:outline-none focus:ring-1 focus:ring-purple-500"
                            required
                          />
                          <p className="text-[9.5px] text-purple-650 font-sans">Once you transfer money to our official Bank Account above, enter the reference code here to verify.</p>
                        </div>
                      )}
                      <p className="text-[10px] text-slate-450 leading-relaxed font-light font-sans">Your transaction details are securely processed directly to Tolo Delivery's brand merchant platform.</p>
                    </div>

                    {(() => {
                      const currentOrder = orders.find(o => o.id === paymentDraftOrderId);
                      const mealPrice = currentOrder ? currentOrder.subtotal : 0;
                      const advancePrice = mealPrice / 3;
                      const remainingMeal = mealPrice * 2 / 3;
                      const shippingFee = currentOrder ? currentOrder.deliveryFee : 2.50;
                      const payableOnDelivery = remainingMeal + shippingFee;

                      return (
                        <div className="border-t border-dashed border-slate-200 pt-3 space-y-1.5 text-xs font-sans">
                          <div className="flex justify-between text-slate-500">
                            <span>Estimated Food Price (Subtotal):</span>
                            <span className="font-mono">${mealPrice.toFixed(2)}</span>
                          </div>
                          <p className="text-[10.5px] text-amber-700 bg-amber-50 border border-amber-200 p-2 rounded-lg leading-relaxed font-sans font-medium">
                            📢 <strong>Price Holder Notice:</strong> This estimated total represents a pricing holder value only. For verification during authorization, you will only pay <strong>1/3 of this amount</strong> right now.
                          </p>
                          <div className="flex justify-between font-bold text-slate-800">
                            <span className="text-emerald-700">Advance Deposit Required (1/3 of food):</span>
                            <span className="font-mono text-emerald-700 font-extrabold text-sm">${advancePrice.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-slate-500">
                            <span>Remaining Food Balance (Due At Delivery):</span>
                            <span className="font-mono">${remainingMeal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-slate-500">
                            <span>Delivery Fee (Paid After Delivery):</span>
                            <span className="font-mono">${shippingFee.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between font-semibold text-slate-900 border-t border-dashed border-slate-200 pt-1 text-indigo-700">
                            <span>Total Due Upon Delivery:</span>
                            <span className="font-mono font-bold">${payableOnDelivery.toFixed(2)}</span>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Explicit Error Specification Box */}
                    {isProfileIncomplete && (
                      <div className="p-3 bg-rose-50 border border-rose-250 rounded-xl font-sans text-xs text-rose-800 leading-relaxed font-semibold transition-all">
                        <span className="font-bold block text-sm mb-1">⚠️ Cannot Proceed to Payment:</span>
                        {!customerProfile.name.trim() && <span className="block">• Recipient Full Name is required.</span>}
                        {!customerProfile.phone.trim() && <span className="block">• Phone Contact Number is required.</span>}
                        {isPhoneInvalid && customerProfile.phone.trim() !== '' && <span className="block font-bold text-rose-700 font-sans">• Phone contact number must have exactly 10 digits (e.g., 0911234567).</span>}
                        {!customerProfile.address.trim() && <span className="block">• Drop-off Location Address is required.</span>}
                      </div>
                    )}

                    <button
                      onClick={() => {
                        if (isProfileIncomplete) return;
                        setPaymentStep('waiting');
                        setTimeout(() => {
                          setPaymentStep('success');
                        }, 2000);
                      }}
                      className={`w-full text-xs font-bold py-3 rounded-xl transition shadow hover:shadow-md flex items-center justify-center gap-1.5 cursor-pointer font-sans ${isProfileIncomplete ? 'bg-rose-600 hover:bg-rose-700 text-white' : 'bg-slate-900 hover:bg-black text-white'}`}
                    >
                      <Lock className="w-3.5 h-3.5" /> 
                      {isProfileIncomplete ? "Resolve Form Errors to Authorize" : "Authorize 1/3 Advance Payment"}
                    </button>
                  </div>
                );
              })()}

              {/* STEP 2: LOADING GATEWAY SCREEN */}
              {paymentStep === 'waiting' && (
                <div className="p-8 text-center space-y-4 overflow-y-auto flex-1">
                  <div className="flex justify-center">
                    <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                  </div>
                  <div className="font-sans">
                    <h4 className="font-bold text-sm text-slate-800 animate-pulse">Verifying Cashless Advance Hold</h4>
                    <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">Connecting to Delivra instant settlement gate... checking balance clearance to launch kitchen priority ticket.</p>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    [ AWAITING INSTANT LEDGER ACCEPT... ]
                  </div>
                </div>
              )}

              {/* STEP 3: TRANSACTION COMPLETE RECEIPT SUCCESS */}
              {paymentStep === 'success' && (
                <div className="p-6 text-center space-y-4 font-sans overflow-y-auto flex-1">
                  <div className="flex justify-center">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                  </div>
                  <div className="font-sans">
                    <h4 className="font-bold text-emerald-900 text-sm">Advance Payment Settled!</h4>
                    <p className="text-xs text-slate-500 mt-1.5 max-w-sm">
                      Thank you! Payment cleared. This order has been dispatched to the cooking queue and is bound to delivery coordinates.
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-150 p-3 rounded-xl text-xs text-left text-slate-605 space-y-1.5 font-mono">
                    <div className="flex justify-between border-b border-dashed border-slate-150 pb-1">
                      <span>Receipt Status:</span>
                      <span className="font-bold text-emerald-700">1/3 DEPOSIT CONFIRMED</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span>Consignee Name:</span>
                      <span>{customerProfile.name}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span>Delivery Coords:</span>
                      <span className="truncate max-w-[170px]">{customerProfile.address}</span>
                    </div>
                    {(() => {
                      const currentOrder = orders.find(o => o.id === paymentDraftOrderId);
                      const mealPrice = currentOrder ? currentOrder.subtotal : 0;
                      const advancePrice = mealPrice / 3;
                      const deliveryFeeVal = currentOrder ? currentOrder.deliveryFee : 2.5;
                      const payableOnDelivery = (mealPrice * 2 / 3) + deliveryFeeVal;

                      return (
                        <>
                          <div className="flex justify-between text-emerald-700 font-bold border-t border-dashed border-slate-150 pt-1">
                            <span>Advance Deposit paid:</span>
                            <span>${advancePrice.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-slate-550 text-[10.5px]">
                            <span>Delivery Fee (Pay After):</span>
                            <span>${deliveryFeeVal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-slate-550 text-[10.5px]">
                            <span>Remaining meal price:</span>
                            <span>${(mealPrice * 2 / 3).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-slate-800 font-bold border-t border-slate-200 pt-1">
                            <span>Pending Balance Due Upon Delivery:</span>
                            <span>${payableOnDelivery.toFixed(2)}</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  <button
                    onClick={() => handleCompleteAdvancePayment(paymentDraftOrderId)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 rounded-xl transition cursor-pointer font-sans"
                  >
                    🚚 Track Kitchen & Driver Route
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
            <span className="block font-bold text-white mb-0.5 tracking-tight font-sans">ቶሎ/Tolo Delivery Logistics Solutions Ltd.</span>
            <span className="text-slate-400 block max-w-md leading-relaxed text-[11.5px]">
              Ready-made catalogue integration & semantic order parsing. Powered server-side by modern Antigravity Gemini-3.5 models.
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-500 block font-mono">Simulated Sandbox Version 1.0.4</span>
            <span className="text-indigo-400 font-semibold block mt-0.5">Perfect for Small Town Hyperlocal Scaling</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
