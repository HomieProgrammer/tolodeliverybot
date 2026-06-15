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
  Utensils,
  Upload,
  X,
  Image as ImageIcon
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
  receiptPhoto?: string;
  onReceiptPhotoChange?: (photoUrl: string) => void;
  isAmharic: boolean;
  onLanguageChange: (val: boolean) => void;
  orders: Order[];
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
  menuItems,
  receiptPhoto,
  onReceiptPhotoChange,
  isAmharic,
  onLanguageChange,
  orders
}: TelegramSimulatorProps) {
  const [inputText, setInputText] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Consolidated client preferences forms start completely empty on page load
  const [localName, setLocalName] = useState('');
  const [localPhone, setLocalPhone] = useState('');
  const [localAddress, setLocalAddress] = useState('');
  const [localPickupAddress, setLocalPickupAddress] = useState('');
  const [localPackageDetails, setLocalPackageDetails] = useState('');
  const [localEstimatedPrice, setLocalEstimatedPrice] = useState(150);
  const [phoneSharedStep, setPhoneSharedStep] = useState<'none' | 'fake' | 'real'>('none');

  useEffect(() => {
    if (isMenuOpen) {
      setLocalName(customerProfile.name || '');
      setLocalPhone(customerProfile.phone || '');
      setLocalAddress(customerProfile.address || '');
      setLocalPickupAddress(customerProfile.pickupAddress || '');
      setLocalPackageDetails('');
      setLocalEstimatedPrice(150);
      setPhoneSharedStep('none');
      setFormError(null);
    }
  }, [customerProfile, isMenuOpen]);

  // Simulated rapid fill sharing preferences using telegram authentication permission flow
  // Shows a fake simulated contact first, and then real profile contact on next click
  const handleShareMobileNumber = () => {
    if (phoneSharedStep === 'none') {
      const fakePhone = "0944112233"; // clearly distinct fake simulator number
      setLocalPhone(fakePhone);
      setPhoneSharedStep('fake');
      setToastMessage(isAmharic 
        ? `⚠️ አስመስሎ የተሰራ ስልክ ተጋርቷል፦ ${fakePhone}! እውነተኛውን ስልክ ለማጋራት 'ስልክ አጋራ' የሚለውን ቁልፍ እንደገና ይጫኑ።` 
        : `⚠️ Shared FAKE contact first: ${fakePhone}! Tap "Share number" again to send your real contact.`);
      setTimeout(() => setToastMessage(null), 4500);
    } else {
      const realPhone = "";
      setLocalPhone(realPhone);
      setPhoneSharedStep('real');
      setToastMessage(isAmharic 
        ? `✓ እውነተኛው ስልክ ተጋርቷል፦ ${realPhone}!` 
        : `✓ Real contact shared successfully: ${realPhone}!`);
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
  };

  const handleSendSelection = () => {
    console.log("SUBMIT BUTTON CLICKED");
    const pDetails = localPackageDetails.trim();
    if (!pDetails) {
      setFormError(isAmharic 
        ? "እባክዎን የትዕዛዙን ዝርዝር / ማብራሪያ ያስገቡ።" 
        : "Please provide a description of the package or dishes you want delivered.");
      return;
    }

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

    if (!localAddress.includes("Shared GPS")) {
      setFormError(isAmharic 
        ? "የመድረሻ አድራሻ በትክክል መጋራት አለበት! እባክዎን 'አድራሻ አጋራ (GPS)' የሚለውን ቁልፍ ይጫኑ።" 
        : "The drop-off coordinates must be shared! Please click the 'Share Live GPS Drop-off' button above.");
      return;
    }

    if (!receiptPhoto) {
      setFormError(isAmharic 
        ? "እባክዎን መጀመሪያ የክፍያ ማረጋገጫ ፎቶ ያስገቡ።" 
        : "Please upload/choose a receipt screenshot file first to authorize payment.");
      return;
    }

    setFormError(null);

    const itemsList = [`1 ${pDetails} (${localEstimatedPrice.toFixed(2)} Birr)`];

    // Build unified NLP text matching preferences interceptor perfectly including pick-up and drop-off
    const unifiedOrderMessage = `Please organize a ticket for: ${itemsList.join(", ")}.\n\nMy delivery profile parameters:\n👤 Name: ${localName.trim()}\n📞 Phone: ${localPhone.trim()}\n📍 Pick-Up Location: ${localPickupAddress.trim()}\n📍 Drop-Off Address: ${localAddress.trim()}`;
console.log("SENDING MESSAGE", unifiedOrderMessage);
    onSendMessage(unifiedOrderMessage);
    setIsMenuOpen(false);
  };

  const getSelectedItemsCount = (): number => {
    return localPackageDetails.trim() ? 1 : 0;
  };

  const getSelectedItemsTotalPrice = (): number => {
    return localPackageDetails.trim() ? localEstimatedPrice : 0.00;
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
              <span className="font-bold text-sm tracking-tight">ቶሎ | Tollo Delivery ⚡</span>
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
            onClick={() => onLanguageChange(!isAmharic)}
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
          const linkedOrder = orders?.find(o => o.id === msg.trackingOrderId);

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
                {msg.senderName && (
                  <div className="text-[10px] font-bold text-indigo-700 mb-1 pb-1 border-b border-indigo-100 flex items-center gap-1 font-sans">
                    <span>👤</span> {msg.senderName}
                  </div>
                )}
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
                          <span className="font-mono text-slate-600 font-bold">{item.totalPrice.toFixed(2)} Birr</span>
                        </div>
                      ))}

                      <div className="pt-2 mt-1 border-t border-slate-200 space-y-1 font-mono text-[11.5px] text-slate-600">
                        <div className="flex justify-between">
                          <span>Estimated Food Price:</span>
                          <span>{msg.orderSummary.subtotal.toFixed(2)} Birr</span>
                        </div>
                        <p className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1.5 rounded-lg leading-relaxed font-sans font-medium">
                          ℹ️ <strong>Price Holder Alert:</strong> The listed price is a holder reference for placeholder billing. You only pay <strong>1/3</strong> of it now.
                        </p>
                        <div className="flex justify-between font-semibold text-emerald-700 bg-emerald-55 px-1.5 py-0.5 rounded">
                          <span>Advance Payment Required (1/3):</span>
                          <span>{(msg.orderSummary.subtotal / 3).toFixed(2)} Birr</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Delivery Fee (Paid After Delivery):</span>
                          <span>{msg.orderSummary.deliveryFee.toFixed(2)} Birr</span>
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-500">
                          <span>Remaining Balance (Due After Delivery):</span>
                          <span>{((msg.orderSummary.subtotal * 2 / 3) + msg.orderSummary.deliveryFee).toFixed(2)} Birr</span>
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
                  <div className="mt-2.5 space-y-2">
                    {linkedOrder?.paymentDetails?.receiptPhoto && (
                      <div className="bg-slate-55 border border-slate-200 rounded-xl p-2.5 space-y-1.5 shadow-3xs">
                        <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block font-sans">
                          {isAmharic ? "📷 የክፍያ ማረጋገጫ (Screenshot)፦" : "📷 Submitted Payment Screenshot:"}
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
                      onClick={() => onSelectTrackOrder(msg.trackingOrderId || '')}
                      className="w-full bg-[#1e88e5] text-white hover:bg-[#1565c0] rounded-xl py-2 px-3 text-xs font-bold font-mono transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-4 h-4" /> {isAmharic ? `የቀጥታ መከታተያ #${msg.trackingOrderId}` : `Live Tracking Info #${msg.trackingOrderId}`}
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
                          if (btn.actionType === 'open_mini_app') {
                            setToastMessage(`🚀 Launching Mini App...`);
                            setTimeout(() => setToastMessage(null), 3000);
                            setIsMenuOpen(true);
                            if (btn.url) {
                              try {
                                window.open(btn.url, '_blank', 'noopener,noreferrer');
                              } catch (e) {
                                console.warn("window.open blocked, running drawer fallback.");
                              }
                            }
                          } else if (btn.actionType === 'alert_support') {
                            setToastMessage("📞 Direct support ticket opened!");
                            setTimeout(() => setToastMessage(null), 3000);
                            
                            // Let's call onSendMessage with a support request code
                            onSendMessage("CONTACT_SUPPORT_TRIGGERED_ACTION");
                          } else {
                            setToastMessage(`Opening URL...`);
                            setTimeout(() => setToastMessage(null), 2000);
                            if (btn.url) {
                              try {
                                window.open(btn.url, '_blank', 'noopener,noreferrer');
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
                {isAmharic ? "ቶሎ | Tollo Delivery ትዕዛዝዎን በመተንተን ላይ ነው..." : "ቶሎ | Tollo Delivery is parsing your request..."}
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
          onClick={() => {
            setToastMessage(`🚀 Launching ቶሎ | Tollo Delivery Mini App...`);
            setTimeout(() => setToastMessage(null), 3000);
            setIsMenuOpen(true);
          }}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md transform active:scale-95 duration-100 font-sans tracking-wide font-bold animate-pulse-subtle"
        >
          {isAmharic 
            ? "🍔 ቶሎ ክፈት | Open Tollo Delivery"
            : "🍔 Open Tollo Delivery"}
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
                            placeholder="e.g. 0911234567"
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
                            {isAmharic ? "📍 መነሻ ቦታ (Pick-Up Location)" : "📍 Pick-up Location"}
                          </label>
                        </div>
                        <div className="relative">
                          <MapPin className="w-3.5 h-3.5 text-amber-500 absolute left-3 top-2.5" />
                          <input 
                            type="text" 
                            value={localPickupAddress}
                            onChange={(e) => setLocalPickupAddress(e.target.value)}
                            placeholder={isAmharic ? "ትዕዛዙ የሚነሳበትን ቦታ አድራሻ ያስገቡ" : "Enter pick-up restaurant/kitchen location"}
                            required
                            className="w-full bg-white border border-slate-250 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 font-medium"
                          />
                        </div>
                      </div>

                      {/* Drop Off location */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-sans">
                            {isAmharic ? "📍 መድረሻ አድራሻ (Drop-Off Address)" : "📍 Drop-off Address"}
                          </label>
                          <button
                            type="button"
                            onClick={handleShareLiveLocation}
                            className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-[9px] px-2.5 py-1 rounded-lg transition flex items-center gap-1.5 shadow-sm cursor-pointer active:scale-95 animate-pulse"
                            title="Simulate Telegram GPS location share"
                          >
                            📍 {isAmharic ? "አድራሻ አጋራ" : "Share Live GPS Drop-off"}
                          </button>
                        </div>
                        <div className="relative">
                          <MapPin className="w-3.5 h-3.5 text-rose-500 absolute left-3 top-2.5" />
                          <input 
                            type="text" 
                            value={localAddress}
                            readOnly
                            placeholder={isAmharic ? "እባክዎን ከላይ ያለውን 'አድራሻ አጋራ' የሚለውን ቁልፍ ይጫኑ" : "⚠️ Click 'Share Live GPS Drop-off' button above"}
                            required
                            className={`w-full border rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-bold ${localAddress ? 'bg-emerald-50/50 border-emerald-300 text-emerald-850' : 'bg-slate-50 border-rose-300 text-rose-800'}`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-dashed border-slate-200 my-4" />

                {/* 2. ORDER SUMMARY - CUSTOM DISH & PACKAGE DETAILS */}
                <div className="bg-white border border-slate-200 p-4 rounded-2xl font-sans space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                      <span>📦</span>
                      <span>{isAmharic ? "የትዕዛዙ ዝርዝር (Dishes & Courier Package Details)" : "Package / Dish Details (Instructions)"}</span>
                    </span>
                    <span className="text-[9px] bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.5 rounded border border-indigo-100 uppercase font-mono tracking-wider">
                      {isAmharic ? "የቀጥታ ትዕዛዝ" : "Describe Order"}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9.5px] font-bold text-slate-400 uppercase font-sans">
                      {isAmharic ? "ማዘዝ የሚፈልጉትን ምግብ፣ መጠጥ ወይም ዕቃ እዚህ ይጻፉ" : "What dishes / drinks or package item should we deliver?"}
                    </label>
                    <textarea 
                      rows={2}
                      value={localPackageDetails}
                      onChange={(e) => setLocalPackageDetails(e.target.value)}
                      placeholder={isAmharic ? "ለምሳሌ፦ 2 በርገር ከሶዳ ጋር፣ ወይም ሰነዶች..." : "e.g., Double cheeseburger with cold soda and french fries"}
                      className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 font-sans font-medium"
                      required
                    />
                  </div>

                  {/* Dynamic Estimated Price Input in Birr */}
                  <div className="bg-indigo-50/20 p-2.5 rounded-xl border border-indigo-100 space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[9.5px] font-extrabold text-indigo-950 uppercase tracking-wider font-sans">
                        💵 {isAmharic ? "ግምታዊ ዋጋ በብር (Estimated Price in Birr)" : "Estimated Dish Price (Birr)"}
                      </label>
                      <span className="font-mono font-extrabold text-indigo-700 text-[11px] bg-white px-2 py-0.5 rounded border border-indigo-150">
                        {localEstimatedPrice.toFixed(2)} Birr
                      </span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <input 
                        type="number"
                        min="0"
                        max="5000"
                        value={localEstimatedPrice === 0 ? '' : localEstimatedPrice}
                        onChange={(e) => setLocalEstimatedPrice(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-24 bg-white border border-slate-250 rounded-lg px-2 py-1 text-xs text-slate-800 font-mono font-bold focus:ring-1 focus:ring-indigo-500 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <span className="text-[9px] text-slate-450 leading-tight font-sans italic">
                        {isAmharic ? "ይህ ዋጋ በራስሰር 1/3 ማስያዣውን ለማዘጋጀት ይጠቅማል።" : "Visible price estimate. Your 1/3 payment deposit maps directly to this total."}
                      </span>
                    </div>

                    {/* Calculated 1/3 Payable Deposit badge */}
                    <div className="bg-emerald-50 border border-emerald-250/60 rounded-lg p-2.5 flex justify-between items-center text-xs mt-1.5 shadow-3xs">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider font-sans">
                        {isAmharic ? "⏳ 1/3 የሚከፈል የመጀመሪያ ማስያዣ (1/3 Deposit)፦" : "⏳ 1/3 Required Deposit Payment:"}
                      </span>
                      <span className="font-mono font-extrabold text-emerald-700 text-[11.5px] bg-white px-2 py-0.5 rounded border border-emerald-250">
                        {(localEstimatedPrice / 3).toFixed(2)} Birr
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. OFFICIAL TOLO PAYMENT DETAILS SECTION */}
                <div className="bg-gradient-to-br from-indigo-50/40 to-slate-50 border border-indigo-150 p-4 rounded-2xl font-sans space-y-2.5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-widest block font-mono">💳 Tolo Payment Details</span>
                    <span className="text-[9px] bg-green-50 text-green-700 font-bold px-1.5 py-0.5 rounded border border-green-250 uppercase font-mono tracking-wider">
                      Official Details
                    </span>
                  </div>

                  {/* INSERT PICTURE / SCREENSHOT UPLOADER BUTTON */}
                  <div className="bg-white rounded-xl p-3 border border-slate-150 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-750 uppercase tracking-wide flex items-center gap-1 font-sans">
                        📷 Attached Receipt Screenshot:
                      </span>
                      {receiptPhoto && (
                        <button 
                          type="button"
                          onClick={() => onReceiptPhotoChange?.('')}
                          className="text-[9.5px] font-bold text-rose-600 hover:text-rose-800 flex items-center gap-0.5 border border-rose-100 rounded bg-rose-50 px-2 py-0.5 cursor-pointer transition hover:bg-rose-100"
                        >
                          <X className="w-2.5 h-2.5" /> Remove
                        </button>
                      )}
                    </div>

                    {receiptPhoto ? (
                      <div className="relative border border-slate-200 bg-slate-50 rounded-lg p-1.5 max-h-[110px] flex items-center justify-center overflow-hidden">
                        <img 
                          src={receiptPhoto} 
                          alt="Uploaded Attachment Preview" 
                          className="max-h-[90px] rounded-md object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {/* Styled custom file upload button */}
                        <label className="flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-xs hover:shadow transition-all py-2.5 px-3.5 rounded-xl text-xs font-bold font-sans cursor-pointer text-center">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Choose Receipt Screenshot File</span>
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
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                        <span className="text-[8.5px] text-slate-400 mt-1 block text-center leading-snug">
                          Upload PNG, JPG, or JPEG snapshot of your mobile money app payment slip
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="bg-white rounded-xl p-3 border border-slate-150 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-600">Telebirr:</span>
                      <span className="font-mono bg-sky-50 text-sky-800 px-2 py-0.5 rounded font-extrabold select-all">0916031177</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-600">CBE Birr:</span>
                      <span className="font-mono bg-amber-50 text-amber-800 px-2 py-0.5 rounded font-extrabold select-all">0916031177</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-slate-100 pt-2">
                      <span className="font-semibold text-slate-600">CBE Bank Account:</span>
                      <span className="font-mono bg-purple-50 text-purple-900 px-2 py-0.5 rounded font-extrabold select-all text-[11px]">1000100603326</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-slate-100 pt-2">
                      <span className="font-semibold text-slate-600">Support / Admin ID:</span>
                      <a 
                        href="https://t.me/Cephasimon" 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-[11px] text-indigo-700 font-extrabold hover:underline"
                      >
                        t.me/Cephasimon ↗
                      </a>
                    </div>
                  </div>
                  <p className="text-[9.5px] leading-relaxed text-slate-500 font-sans">
                    Please submit 1/3 deposit to any official Tolo Delivery account above to initiate instant kitchen prep.
                  </p>
                </div>

              </div>

              {/* Bottom WebApp Submit Cart panel */}
              {localPackageDetails.trim().length > 0 ? (
                <div className="p-3 bg-white border-t border-slate-200 shrink-0 space-y-2 select-none">
                  {formError && (
                    <div className="p-2.5 bg-rose-50 border border-rose-250 rounded-xl text-rose-800 font-sans text-xs flex items-start gap-1.5 font-bold">
                      <span className="shrink-0">⚠️</span>
                      <span className="leading-snug">{formError}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-xs font-sans">
                    <span className="text-slate-505">
                      {isAmharic ? "ትዕዛዝ፦ " : "Order Description: "}<strong className="font-mono text-slate-850">1 Package Description</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setLocalPackageDetails('')}
                      className="text-rose-500 font-bold flex items-center gap-1 hover:underline text-[10px] cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" /> {isAmharic ? "አጽዳ" : "Clear"}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleSendSelection}
                    disabled={!receiptPhoto}
                    className={`w-full font-bold py-2.5 rounded-xl text-xs transition shadow flex items-center justify-center gap-1.5 font-sans ${
                      !receiptPhoto 
                        ? 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-75' 
                        : 'bg-emerald-600 hover:bg-emerald-750 active:scale-95 text-white shadow-md cursor-pointer'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4" /> 
                    <span>
                      {!receiptPhoto 
                        ? (isAmharic ? "እባክዎን ፎቶ ያስገቡ (Upload Receipt)" : "Upload Payment Screenshot to Submit") 
                        : (isAmharic ? `ምርጫዬን ላክ (${getSelectedItemsTotalPrice().toFixed(2)} ብር)` : `Submit Order (${getSelectedItemsTotalPrice().toFixed(2)} Birr)`)}
                    </span>
                  </button>
                </div>
              ) : (
                <div className="p-3.5 bg-slate-50 border-t border-slate-250 text-center shrink-0 text-[10.5px] text-slate-550 font-medium font-sans italic">
                  {isAmharic 
                    ? "እባክዎን ከላይ የትዕዛዙን ዝርዝር አስገብተው ይላኩ።" 
                    : "Enter what Dishes / Drinks or courier item should be delivered to proceed!"}
                </div>
              )}
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
