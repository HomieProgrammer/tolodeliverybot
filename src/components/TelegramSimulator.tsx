import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  Utensils
} from 'lucide-react';
import { ChatMessage, MenuItem, Order, OrderItem } from '../types';

interface TelegramSimulatorProps {
  messages: ChatMessage[];
  isParsing: boolean;
  onSendMessage: (text: string) => void;
  onConfirmOrder: (summaryId: string) => void;
  onCancelOrder: (summaryId: string) => void;
  onSelectTrackOrder: (orderId: string) => void;
  activeOrder: Order | null;
  customerProfile: { name: string; phone: string; address: string; pickupAddress: string };
  onOpenProfileModal: () => void;
  menuItems: MenuItem[];
}

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
  menuItems
}: TelegramSimulatorProps) {
  const [inputText, setInputText] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // List of extra custom items created on-the-fly by the customer
  const [customEnteredItems, setCustomEnteredItems] = useState<{ id: string; name: string; price: number; category: string; isAvailable: boolean; description: string }[]>([]);
  const [newFoodName, setNewFoodName] = useState('');
  const [newFoodPrice, setNewFoodPrice] = useState('8.50');

  // Consolidated client preferences forms
  const [localName, setLocalName] = useState(customerProfile.name);
  const [localPhone, setLocalPhone] = useState(customerProfile.phone);
  const [localAddress, setLocalAddress] = useState(customerProfile.address);
  const [localPickupAddress, setLocalPickupAddress] = useState(customerProfile.pickupAddress || '');
  const [isAmharic, setIsAmharic] = useState(false);

  useEffect(() => {
    if (isMenuOpen) {
      setLocalName(customerProfile.name || '');
      setLocalPhone(customerProfile.phone || '');
      setLocalAddress(customerProfile.address || '');
      setLocalPickupAddress(customerProfile.pickupAddress || '');
      setFormError(null);
    }
  }, [customerProfile, isMenuOpen]);

  // Simulated rapid fill sharing preferences
  const handleShareMobileNumber = () => {
    setLocalPhone('0911234567');
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
          setLocalAddress('Shared GPS Location (9.0122° N, 38.7500° E)');
        }
      );
    } else {
      setLocalAddress('Shared GPS Location (9.0122° N, 38.7500° E)');
    }
  };

  const handleModifyQuantity = (itemId: string, delta: number) => {
    setSelectedItems(prev => {
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
    setCustomEnteredItems([]);
  };

  const handleSendSelection = () => {
    const itemsList = Object.entries(selectedItems)
      .map(([id, qty]) => {
        const item = menuItems.find(i => i.id === id) || customEnteredItems.find(i => i.id === id);
        return item ? `${qty} ${item.name} ($${item.price.toFixed(2)})` : null;
      })
      .filter(Boolean);

    if (!localName.trim() || !localPhone.trim() || !localAddress.trim() || !localPickupAddress.trim()) {
      setFormError(isAmharic 
        ? "እባክዎን ስም፣ ስልክ ቁጥር፣ መነሻ (Pick-Up) እና መድረሻ (Drop-Off) አድራሻዎችን በትክክል ያስገቡ።" 
        : "Please provide Recipient Name, Phone, Pick-Up Location, and Drop-Off Address to build your preference ticket.");
      return;
    }

    const cleanPhone = localPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.length !== 10) {
      setFormError(isAmharic
        ? "እባክዎን በትክክል 10 አሃዝ ያለው ስልክ ቁጥር ያስገቡ (ለምሳሌ 0911234567)።"
        : "Phone contact number must have exactly 10 digits (e.g., 0911234567).");
      return;
    }

    if (itemsList.length === 0) {
      setFormError(isAmharic 
        ? "እባክዎን ለማዘዝ ቢያንስ አንድ ምግብ ይጻፉ/ይጨምሩ!" 
        : "Please choose or enter at least 1 delicious plate to build your food order!");
      return;
    }

    setFormError(null);

    // Build unified NLP text matching preferences interceptor perfectly including pick-up and drop-off
    const unifiedOrderMessage = `Please organize a ticket for: ${itemsList.join(", ")}.\n\nMy delivery profile parameters:\n👤 Name: ${localName.trim()}\n📞 Phone: ${localPhone.trim()}\n📍 Pick-Up Location: ${localPickupAddress.trim()}\n📍 Drop-Off Address: ${localAddress.trim()}`;

    onSendMessage(unifiedOrderMessage);
    setSelectedItems({});
    setCustomEnteredItems([]);
    setIsMenuOpen(false);
  };

  const getSelectedItemsCount = (): number => {
    return Object.entries(selectedItems).reduce((sum: number, [_, qty]: [string, number]) => sum + qty, 0);
  };

  const getSelectedItemsTotalPrice = (): number => {
    return Object.entries(selectedItems).reduce((total: number, [id, qty]: [string, number]) => {
      const item = menuItems.find(i => i.id === id) || customEnteredItems.find(i => i.id === id);
      const price = item ? item.price : 0;
      return total + (price * qty);
    }, 0);
  };

  const getCategoryEmoji = (category: string) => {
    switch (category.toLowerCase()) {
      case 'burgers': return '🍔';
      case 'wraps': return '🌯';
      case 'pizza': return '🍕';
      case 'sides': return '🍟';
      case 'dessert': return '🧇';
      case 'drinks': return '🥤';
      case 'hot drinks': return '☕';
      default: return '🍽️';
    }
  };

  const categories = Array.from(new Set(menuItems.map(item => item.category)));

  // Auto scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isParsing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isParsing) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  return (
    <div id="tg-simulator" className="bg-[#f0f3f6] border border-slate-200 rounded-2xl overflow-hidden shadow-lg h-[620px] flex flex-col relative">
      {/* Telegram Client Header */}
      <div className="bg-[#1e88e5] text-white px-4 py-3.5 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#1565c0] rounded-full flex items-center justify-center font-bold text-md text-white border-2 border-[#1e88e5]/50 shrink-0">
            T
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-tight">ቶሎ/Tolo Delivery ⚡</span>
              <span id="bot-badge" className="text-[9px] bg-[#1565c0] text-blue-100 px-1 py-0.2 rounded font-semibold uppercase">BOT</span>
            </div>
            <span className="text-xs text-blue-100/90 block font-light">
              {isParsing 
                ? (isAmharic ? "በመተንተን ላይ ነው..." : "is typing...") 
                : (isAmharic ? "በመስመር ላይ • ዝርዝር ይቀበላል" : "online • matches natural chat")}
            </span>
          </div>
        </div>
        <div id="tg-time-indicator" className="text-[10px] text-blue-100 font-mono font-medium">
          Telegram UI Client
        </div>
      </div>

      {/* Simulated Telegram Mini-App Profile Header Bar */}
      <div id="tg-profile-bar" className="bg-slate-900 border-b border-slate-850 px-3 py-2 text-xs flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-full bg-slate-800 text-indigo-400 flex items-center justify-center font-mono text-[10px] font-bold uppercase shrink-0">
            {customerProfile.name ? customerProfile.name.charAt(0) : 'U'}
          </div>
          <div className="min-w-0">
            <div className="flex items-baseline gap-1.5 text-slate-100">
              <span className="font-bold text-[11px] truncate">{customerProfile.name || (isAmharic ? "ስም ያስገቡ" : "Set Name")}</span>
              <span className="text-[9px] text-slate-400 font-mono">{customerProfile.phone || (isAmharic ? "ስልክ የለም" : "No Phone")}</span>
            </div>
            <p className="text-[10px] text-slate-400 truncate max-w-[200px]">
              {customerProfile.pickupAddress ? `[Pick: ${customerProfile.pickupAddress}] ` : ''}
              {customerProfile.address || (isAmharic ? "የማድረሻ አድራሻ ያስገቡ" : "Provide Delivery Address")}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1 shrink-0">
          <button
            id="btn-toggle-lang-top"
            type="button"
            onClick={() => setIsAmharic(!isAmharic)}
            className={`font-semibold text-[10.5px] rounded-md px-2 py-1 transition cursor-pointer flex items-center gap-0.5 border ${
              isAmharic 
                ? 'bg-emerald-600 text-white border-emerald-500' 
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
            }`}
            title="Toggle language / ቋንቋ ቀይር"
          >
            🌐 {isAmharic ? "Eng" : "አማርኛ"}
          </button>

          <button
            id="btn-edit-tg-profile"
            type="button"
            onClick={() => setIsMenuOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] tracking-wide rounded-md px-2.5 py-1.5 transition shrink-0 cursor-pointer"
          >
            👤 {isAmharic ? "ምርጫዎች" : "Set Preferences"}
          </button>
        </div>
      </div>

      {/* Telegram Wallpaper Background & Message Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#e7ebf0]" style={{ backgroundImage: "radial-gradient(#d3dbcd 0.5px, transparent 0.5px)", backgroundSize: "10px 10px" }}>
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const isBot = msg.sender === 'bot';
          const isSystem = msg.sender === 'system';

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
            <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} w-full`}>
              {/* Bot Avatar */}
              {isBot && (
                <div className="w-8 h-8 rounded-full bg-[#1e88e5] text-white flex items-center justify-center text-xs shrink-0 mr-2 shadow self-end mb-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              {/* Message Bubble */}
              <div className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 shadow-sm text-sm relative ${
                isUser 
                  ? 'bg-[#effdde] text-slate-950 rounded-br-none border border-[#e2f1cd]' 
                  : 'bg-white text-slate-950 rounded-bl-none border border-slate-100'
              }`}>
                {/* Content text */}
                <div className="whitespace-pre-line text-[13.5px] leading-relaxed text-slate-900 pr-4">
                  {msg.text}
                </div>

                {/* Structured Order Summary widget inside Bot reply bubble */}
                {msg.type === 'order_summary' && msg.orderSummary && (
                  <div className="mt-3 bg-slate-50 border border-slate-150 rounded-xl overflow-hidden text-xs">
                    <div className="bg-slate-100 px-3 py-2 border-b border-slate-150 font-bold text-slate-700 flex justify-between items-center">
                      <span>🍽️ Proposed Kitchen Summary</span>
                      <span className="text-[10px] font-mono text-slate-500 font-medium">MAPPED STATUS</span>
                    </div>
                    <div className="p-3 space-y-2">
                      {msg.orderSummary.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-start gap-2 border-b border-slate-100 pb-1.5 last:border-b-0 last:pb-0">
                          <div>
                            <span className="font-bold text-slate-800">{item.quantity}x</span> {item.name}
                            {item.customization && (
                              <span className="block text-[10px] text-amber-600 italic font-medium ml-1">
                                ({item.customization})
                              </span>
                            )}
                          </div>
                          <span className="font-mono text-slate-600 font-bold">${item.totalPrice.toFixed(2)}</span>
                        </div>
                      ))}

                      <div className="pt-2 mt-1 border-t border-slate-200 space-y-1 font-mono text-[11.5px] text-slate-600">
                        <div className="flex justify-between">
                          <span>Estimated Food Price:</span>
                          <span>${msg.orderSummary.subtotal.toFixed(2)}</span>
                        </div>
                        <p className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1.5 rounded-lg leading-relaxed font-sans font-medium">
                          ℹ️ <strong>Price Holder Alert:</strong> The listed price is a holder reference for placeholder billing. You only pay <strong>1/3</strong> of it now.
                        </p>
                        <div className="flex justify-between font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                          <span>Advance Payment Required (1/3):</span>
                          <span>${(msg.orderSummary.subtotal / 3).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Delivery Fee (Paid After Delivery):</span>
                          <span>${msg.orderSummary.deliveryFee.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-500">
                          <span>Remaining Balance (Due After Delivery):</span>
                          <span>${((msg.orderSummary.subtotal * 2 / 3) + msg.orderSummary.deliveryFee).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-slate-900 border-t border-dashed border-slate-200 pt-1 text-xs">
                          <span>Total order value:</span>
                          <span>${msg.orderSummary.total.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Cashless Rule block */}
                      <div className="bg-amber-50/80 border border-amber-250/50 rounded-lg p-2 mt-2 leading-relaxed text-[11px] text-amber-800 space-y-1 font-sans">
                        <div className="flex items-center gap-1 font-bold text-amber-900">
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>💳 1/3 ADVANCE PAYMENT ONLY</span>
                        </div>
                        <p className="text-[10.5px]">To confirm your request, please authorize 1/3 of the food's estimated price as a cashless deposit. The delivery fee is payable as cash/transfer only after the item is successfully delivered.</p>
                      </div>
                    </div>

                    {/* Telegram inline confirmation buttons */}
                    <div className="grid grid-cols-2 divide-x divide-slate-200 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => onCancelOrder(msg.orderSummary?.orderId || '')}
                        className="py-2.5 text-center text-[11px] font-bold text-rose-500 hover:bg-rose-50 transition cursor-pointer flex items-center justify-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Discard
                      </button>
                      <button
                        type="button"
                        onClick={() => onConfirmOrder(msg.orderSummary?.orderId || '')}
                        className="py-2.5 text-center text-[11px] font-bold text-blue-600 hover:bg-blue-50 transition cursor-pointer flex items-center justify-center gap-1"
                      >
                        <CreditCard className="w-3.5 h-3.5" /> Pay Advance Now
                      </button>
                    </div>
                  </div>
                )}

                {/* Dynamic Tracking Link Link inline button bubble */}
                {msg.type === 'tracking_link' && msg.trackingOrderId && (
                  <div className="mt-2.5">
                    <button
                      onClick={() => onSelectTrackOrder(msg.trackingOrderId || '')}
                      className="w-full bg-[#1e88e5] text-white hover:bg-[#1565c0] rounded-xl py-2 px-3 text-xs font-bold font-mono transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-4 h-4" /> Live Tracking Info #{msg.trackingOrderId}
                    </button>
                  </div>
                )}

                {/* Timestamp & Status double ticks */}
                <div className="text-[9px] text-slate-400 text-right font-mono mt-1 select-none flex items-center justify-end gap-0.5">
                  <span>{msg.timestamp}</span>
                  {isUser && <CheckCheck className="w-3 h-3 text-green-500 shrink-0" />}
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
                {isAmharic ? "ቶሎ/Tolo Delivery ትዕዛዝዎን በመተንተን ላይ ነው..." : "ቶሎ/Tolo Delivery is parsing your request..."}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Unified Single Action bot-keyboard button to set customer detail preferences, phone, location AND choice details */}
      <div className="px-3.5 py-3 bg-white border-t border-slate-200 flex items-center shrink-0 select-none">
        <button
          id="btn-open-webapp-menu"
          type="button"
          onClick={() => setIsMenuOpen(true)}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md transform active:scale-95 duration-100 font-sans tracking-wide font-bold animate-pulse-subtle"
        >
          {isAmharic 
            ? "🚀 ቶሎ ክፈት | Open Tolo"
            : "🚀 Open Tolo"}
        </button>
      </div>

      {/* Input Message Form */}
      <form onSubmit={handleSubmit} className="p-3 bg-[#f0f3f6] border-t border-slate-200 flex gap-1.5 shrink-0">
        <input
          id="tg-chat-input"
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isParsing}
          placeholder={isParsing 
            ? (isAmharic ? "እባክዎን ይጠብቁ..." : "Please wait...") 
            : (isAmharic ? "እዚህ ትዕዛዝዎን ይጻፉ..." : "Write your custom order message...")}
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
              <div className="bg-[#17212b] text-white px-4 py-3 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 text-sm animate-pulse">⚡</span>
                  <div>
                    <h4 className="font-bold text-xs">
                      {isAmharic ? "ቶሎ የፈጣን ትዕዛዝ መተግበሪያ" : "Tolo Speedy Delivery App"}
                    </h4>
                    <p className="text-[9px] text-[#6c7883] font-mono tracking-wider">
                      {isAmharic ? "ስም፣ ስልክ እና አድራሻዎችን በትክክል ያስገቡ" : "COMPLETE YOUR DETAILS & SUBMIT CUSTOM DISHES"}
                    </p>
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => setIsMenuOpen(false)}
                  className="text-slate-400 hover:text-white transition font-bold text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg cursor-pointer"
                >
                  {isAmharic ? "ዝጋ" : "Close App"}
                </button>
              </div>

              {/* Dynamic menu content container */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-4 bg-slate-50">
                {/* 1. COMPREHENSIVE CUSTOMER DELIVERY PREFERENCES CARD */}
                <div className="bg-gradient-to-br from-indigo-50/50 to-slate-50 border border-slate-200 p-4 rounded-2xl font-sans space-y-3.5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                      <span>👤</span>
                      <span>{isAmharic ? "መሠረታዊ የተቀባይና የአድራሻ ምርጫዎች" : "Delivery & Recipient Preferences"}</span>
                    </span>
                    <span className="text-[9px] bg-indigo-100 text-indigo-800 font-extrabold px-1.5 py-0.5 rounded border border-indigo-200 uppercase font-mono tracking-wider">
                      {isAmharic ? "አስገዳጅ ዝርዝር" : "Required Info"}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-sans">
                        {isAmharic ? "የተቀባይ ሙሉ ስም" : "Recipient Full Name"}
                      </label>
                      <div className="relative">
                        <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                        <input 
                          type="text" 
                          value={localName}
                          onChange={(e) => setLocalName(e.target.value)}
                          placeholder={isAmharic ? "ሙሉ ስምዎን እዚህ ያስገቡ" : "What is your full name?"}
                          required
                          className="w-full bg-white border border-slate-250 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-sans">
                            {isAmharic ? "የስልክ ቁጥር" : "Phone Contact"}
                          </label>
                          <button
                            type="button"
                            onClick={handleShareMobileNumber}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[9px] px-2 py-0.5 rounded-md transition flex items-center gap-0.5 shadow-xs cursor-pointer active:scale-95"
                            title="Simulate Telegram contact share"
                          >
                            📱 {isAmharic ? "ስልክ አጋራ" : "Share number"}
                          </button>
                        </div>
                        <div className="relative">
                          <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                          <input 
                            type="text" 
                            value={localPhone}
                            onChange={(e) => {
                              setLocalPhone(e.target.value);
                              setFormError(null);
                            }}
                            placeholder="e.g. +251 911 234567"
                            required
                            className={`w-full bg-white border rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 font-mono font-medium ${localPhone.trim() !== '' && localPhone.replace(/[^0-9]/g, '').length !== 10 ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-slate-250'}`}
                          />
                        </div>
                        {localPhone.trim() !== '' && localPhone.replace(/[^0-9]/g, '').length !== 10 && (
                          <p id="phone-validation-error-sub" className="text-rose-600 text-[10.5px] font-bold mt-1.5 flex items-center gap-1 font-sans">
                            ⚠️ {isAmharic 
                              ? "ስልክ ቁጥሩ በትክክል 10 አሃዝ መሆን አለበት (ለምሳሌ 0911234567)።" 
                              : "Phone contact number must have exactly 10 digits (e.g., 0911234567)."}
                          </p>
                        )}
                      </div>

                      {/* Pick Up location */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-sans">
                            {isAmharic ? "📍 መነሻ ቦታ (የተረካቢ ሱቅ / Pick-Up Location)" : "📍 Pick-up Location (Store / Address)"}
                          </label>
                          <button
                            type="button"
                            onClick={() => setLocalPickupAddress('Bella Traditional Restaurant, Piazza')}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[9px] px-2 py-0.5 rounded-md transition flex items-center gap-0.5 shadow-xs cursor-pointer active:scale-95"
                            title="Simulate point selection"
                          >
                            📍 {isAmharic ? "መነሻ ምረጥ" : "Select Point"}
                          </button>
                        </div>
                        <div className="relative">
                          <MapPin className="w-3.5 h-3.5 text-amber-500 absolute left-3 top-2.5" />
                          <input 
                            type="text" 
                            value={localPickupAddress}
                            onChange={(e) => setLocalPickupAddress(e.target.value)}
                            placeholder={isAmharic ? "ምግቡ የሚነሳበትን ሱቅ ወይም ሆቴል ስም ያስገቡ" : "e.g. Bella Traditional Restaurant, Piazza"}
                            required
                            className="w-full bg-white border border-slate-250 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 font-medium"
                          />
                        </div>
                      </div>

                      {/* Drop Off location */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-sans">
                            {isAmharic ? "📍 መድረሻ አድራሻ (Drop-Off Address)" : "📍 Drop-off Address (Destination)"}
                          </label>
                          <button
                            type="button"
                            onClick={handleShareLiveLocation}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[9px] px-2 py-0.5 rounded-md transition flex items-center gap-0.5 shadow-xs cursor-pointer active:scale-95"
                            title="Simulate Telegram GPS location share"
                          >
                            📍 {isAmharic ? "እዚህ አጋራ" : "Share location"}
                          </button>
                        </div>
                        <div className="relative">
                          <MapPin className="w-3.5 h-3.5 text-rose-500 absolute left-3 top-2.5" />
                          <input 
                            type="text" 
                            value={localAddress}
                            onChange={(e) => setLocalAddress(e.target.value)}
                            placeholder={isAmharic ? "ምግቡ የሚደርስበትን ትክክለኛ አድራሻ" : "e.g. Bole Medhaniyalem, Block 5B"}
                            required
                            className="w-full bg-white border border-slate-250 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 font-medium"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-dashed border-slate-200 my-4" />

                {/* 2. CUSTOM ENTRY OF FOODS BY CUSTOMER */}
                <div className="bg-gradient-to-br from-emerald-50/40 to-slate-50 border border-emerald-200/60 p-4 rounded-2xl font-sans space-y-3 shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                      <span>✏️</span>
                      <span>{isAmharic ? "ማዘዝ የሚፈልጉትን ምግቦች መመዝገቢያ" : "Enter Custom Dishes & Drinks"}</span>
                    </span>
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.5 rounded border border-emerald-200 uppercase font-mono tracking-wider">
                      {isAmharic ? "የደንበኛ ግቤት" : "Customer Input"}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <div className="md:col-span-2">
                        <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          {isAmharic ? "የምግቡ/መጠጡ ስም" : "Dish/Drink Name"}
                        </label>
                        <input 
                          type="text" 
                          value={newFoodName}
                          onChange={(e) => setNewFoodName(e.target.value)}
                          placeholder={isAmharic ? "ምሳሌ፦ 2 ዶሮ ወጥ፣ መካከለኛ ስጋ ጥብስ" : "e.g. 2 BBQ Spare Ribs, Sweet Samosas"}
                          className="w-full bg-white border border-slate-150 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          {isAmharic ? "ግምታዊ ዋጋ ($)" : "Estimated Price ($)"}
                        </label>
                        <input 
                          type="number" 
                          step="0.10"
                          value={newFoodPrice}
                          onChange={(e) => setNewFoodPrice(e.target.value)}
                          placeholder="8.50"
                          className="w-full bg-white border border-slate-150 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-850 font-mono font-bold"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (!newFoodName.trim()) {
                          alert(isAmharic ? "እባክዎን መጀመሪያ የምግቡን ስም ያስገቡ!" : "Please write the customer food item name!");
                          return;
                        }
                        const cleanName = newFoodName.trim();
                        const parsedPrice = parseFloat(newFoodPrice) || 8.50;
                        const newId = 'custom_' + Date.now();
                        
                        const newItem = {
                          id: newId,
                          name: cleanName,
                          price: parsedPrice,
                          category: 'Customer Entered Foods',
                          isAvailable: true,
                          description: 'Custom entry specified by customer'
                        };

                        setCustomEnteredItems(prev => [...prev, newItem]);
                        setSelectedItems(prev => ({ ...prev, [newId]: 1 }));
                        setNewFoodName('');
                        setNewFoodPrice('8.50');
                      }}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-4 rounded-xl transition shadow-xs cursor-pointer active:scale-95 flex items-center justify-center gap-1.5 font-sans"
                    >
                      <Plus className="w-3.5 h-3.5" /> {isAmharic ? "አረጋግጥና አክል (Add to List)" : "Confirm & Add Customer Food"}
                    </button>
                  </div>
                </div>

                {customEnteredItems.length > 0 && (
                  <div className="bg-emerald-50/20 border border-emerald-150 p-3 rounded-2xl space-y-2 font-sans">
                    <span className="text-[9px] font-bold text-emerald-800 uppercase tracking-wider block font-mono">
                      👤 {isAmharic ? `የታዘዙ ምግቦች ዝርዝር (${customEnteredItems.length})` : `Custom Customer Foods Added (${customEnteredItems.length})`}
                    </span>
                    <div className="space-y-1.5">
                      {customEnteredItems.map(item => {
                        const qty = selectedItems[item.id] || 0;
                        if (qty === 0) return null;
                        return (
                          <div key={item.id} className="flex justify-between items-center bg-white border border-emerald-100 p-2.5 rounded-xl text-xs leading-none">
                            <div className="truncate min-w-0 pr-2">
                              <span className="font-bold text-slate-800">{item.name}</span>
                              <span className="text-[10px] text-emerald-600 font-bold block mt-1">${item.price.toFixed(2)} each</span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleModifyQuantity(item.id, -1)}
                                className="w-6 h-6 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 flex items-center justify-center font-bold transition cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-4 text-center font-bold font-mono text-slate-800">{qty}</span>
                              <button
                                type="button"
                                onClick={() => handleModifyQuantity(item.id, 1)}
                                className="w-6 h-6 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 flex items-center justify-center font-bold transition cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedItems(prev => {
                                    const copy = { ...prev };
                                    delete copy[item.id];
                                    return copy;
                                  });
                                  setCustomEnteredItems(prev => prev.filter(x => x.id !== item.id));
                                }}
                                className="ml-1 text-rose-500 hover:text-rose-700 p-1 hover:bg-rose-55 rounded-lg transition cursor-pointer"
                                title="Remove item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>

              {/* Bottom WebApp Submit Cart panel */}
              {Object.keys(selectedItems).length > 0 ? (
                <div className="p-3 bg-white border-t border-slate-200 shrink-0 space-y-2 select-none">
                  {formError && (
                    <div className="p-2.5 bg-rose-50 border border-rose-250 rounded-xl text-rose-800 font-sans text-xs flex items-start gap-1.5 font-bold">
                      <span className="shrink-0">⚠️</span>
                      <span className="leading-snug">{formError}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-xs font-sans">
                    <span className="text-slate-505">
                      {isAmharic ? "የተመረጡ ምግቦች፦ " : "Selected: "}<strong className="font-mono text-slate-850">{getSelectedItemsCount()} {isAmharic ? "ምግቦች" : "plates"}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={handleClearSelection}
                      className="text-rose-500 font-bold flex items-center gap-1 hover:underline text-[10px] cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" /> {isAmharic ? "ሁሉንም አፅዳ" : "Clear Selection"}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleSendSelection}
                    className="w-full bg-emerald-600 hover:bg-emerald-750 text-white font-bold py-2.5 rounded-xl text-xs transition active:scale-95 shadow-md flex items-center justify-center gap-1.5 cursor-pointer font-sans"
                  >
                    <ShoppingBag className="w-4 h-4" /> 
                    <span>{isAmharic ? `ምርጫዬን ላክ ($${getSelectedItemsTotalPrice().toFixed(2)})` : `Submit Customer Choices ($${getSelectedItemsTotalPrice().toFixed(2)})`}</span>
                  </button>
                </div>
              ) : (
                <div className="p-3.5 bg-slate-50 border-t border-slate-250 text-center shrink-0 text-[10.5px] text-slate-550 font-medium font-sans italic">
                  {isAmharic 
                    ? "እባክዎን ከላይ ያሉትን የራስዎን ምግቦች አስገብተው 'አረጋግጥና አክል' በማለት ምርጫዎን ይላኩ።" 
                    : "Enter your custom items above and click \"Confirm & Add\" to build your selection. Press submit to dispatch!"}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
