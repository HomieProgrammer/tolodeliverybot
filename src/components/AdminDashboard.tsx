import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ToggleLeft, ToggleRight, Settings, Plus, RotateCcw, Package, DollarSign, ListOrdered, Percent, Sparkles, CheckSquare, XSquare, Clock, Terminal, Globe, ExternalLink, Copy, Check } from 'lucide-react';
import { MenuItem, Order, OrderStatus } from '../types';

interface AdminDashboardProps {
  menuItems: MenuItem[];
  onUpdateMenu: (id: string, price: number, isAvailable: boolean) => void;
  onResetMenu: () => void;
  orders: Order[];
  onCancelActiveOrder: (orderId: string) => void;
  // Synced Telegram Bot & Operator Tunnel Configs
  botToken: string;
  setBotToken: (val: string) => void;
  operatorChatId: string;
  setOperatorChatId: (val: string) => void;
  operatorUsername: string;
  setOperatorUsername: (val: string) => void;
  customTunnelUrl: string;
  setCustomTunnelUrl: (val: string) => void;
  tunnelType: 'workspace' | 'ngrok';
  setTunnelType: (val: 'workspace' | 'ngrok') => void;
}

export default function AdminDashboard({
  menuItems,
  onUpdateMenu,
  onResetMenu,
  orders,
  onCancelActiveOrder,
  botToken,
  setBotToken,
  operatorChatId,
  setOperatorChatId,
  operatorUsername,
  setOperatorUsername,
  customTunnelUrl,
  setCustomTunnelUrl,
  tunnelType,
  setTunnelType
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'catalog' | 'orders' | 'metrics' | 'bot-setup'>('catalog');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  
  // OS-specific ngrok styling tab
  const [ngrokOS, setNgrokOS] = useState<'windows' | 'mac' | 'linux'>('windows');

  // Test operator message state
  const [testStatus, setTestStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [testMessageError, setTestMessageError] = useState<string | null>(null);

  const handleSendTestOperatorMessage = async () => {
    setTestStatus('sending');
    setTestMessageError(null);
    try {
      const pingText = `🔔 *Tolo Delivery: Test Dispatch Conduits* 💨\n\n` +
        `This is a live test notification from your Tolo Order System.\n` +
        `• Bot token is correctly aligned!\n` +
        `• Target Operator ID: ${operatorChatId} (@${operatorUsername})\n` +
        `• Timestamp: ${new Date().toLocaleTimeString()}\n\n` +
        `Let's start delivering! 🛵✨`;

      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: operatorChatId,
          text: pingText,
          parse_mode: "Markdown"
        })
      });
      const data = await response.json();
      if (data.ok) {
        setTestStatus('success');
      } else {
        setTestStatus('error');
        setTestMessageError(data.description || 'Rejected by Telegram API');
      }
    } catch (err) {
      setTestStatus('error');
      setTestMessageError(String(err));
    }
  };

  // Simulation state for payload webhook
  const [simText, setSimText] = useState('I want 2 Cheeseburgers and a Cappuccino');
  const [simStatus, setSimStatus] = useState<'idle' | 'testing' | 'success'>('idle');
  const [simResult, setSimResult] = useState<any>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => {
      setCopiedCmd(null);
    }, 1500);
  };

  const handleSimulateWebhook = async () => {
    setSimStatus('testing');
    setSimResult(null);
    try {
      const response = await fetch('/api/parse-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: simText })
      });
      const data = await response.json();
      setSimResult(data);
      setSimStatus('success');
    } catch (err) {
      setSimResult({ error: 'Failed to access parse route: ' + String(err) });
      setSimStatus('success');
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-105 text-yellow-805 border-yellow-200';
      case 'preparing': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'driving': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'completed': return 'bg-green-50 text-green-700 border-green-250';
      case 'cancelled': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-205';
    }
  };

  return (
    <div id="admin-panel" className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden h-[620px] flex flex-col font-sans">
      {/* Admin header */}
      <div className="bg-slate-900 text-white p-4 shrink-0 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-600 rounded-lg">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-tight">ቶሎ/Tolo Delivery Kitchen Panel</h3>
            <span className="text-[10px] text-slate-400 block font-light">Small-City Partner Dashboard Control</span>
          </div>
        </div>
        <div className="flex gap-1.5 text-xs bg-slate-800 p-1 rounded-lg overflow-x-auto max-w-full">
          <button
            id="tab-catalog"
            onClick={() => setActiveTab('catalog')}
            className={`py-1.5 px-3 rounded-md transition font-medium whitespace-nowrap cursor-pointer ${activeTab === 'catalog' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white'}`}
          >
            Ready catalog
          </button>
          <button
            id="tab-orders"
            onClick={() => setActiveTab('orders')}
            className={`py-1.5 px-3 rounded-md transition font-medium whitespace-nowrap cursor-pointer ${activeTab === 'orders' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white'}`}
          >
            Live orders ({orders.length})
          </button>
          <button
            id="tab-metrics"
            onClick={() => setActiveTab('metrics')}
            className={`py-1.5 px-3 rounded-md transition font-medium whitespace-nowrap cursor-pointer ${activeTab === 'metrics' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white'}`}
          >
            Metrics
          </button>
          <button
            id="tab-bot-setup"
            onClick={() => setActiveTab('bot-setup')}
            className={`py-1.5 px-3 rounded-md transition font-medium whitespace-nowrap cursor-pointer ${activeTab === 'bot-setup' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-300 hover:text-white'}`}
          >
            Bot & Ngrok Setup
          </button>
        </div>
      </div>

      {/* Main Panel Content Scroll Area */}
      <div className="flex-1 overflow-y-auto p-5">
        
        {/* CATALOG TAB */}
        {activeTab === 'catalog' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Our Pre-Set Ready Foods</h4>
                <p className="text-xs text-slate-400">Toggle availability to test how Gemini handles out-of-stock items dynamically.</p>
              </div>
              <button
                onClick={onResetMenu}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-805 bg-indigo-50 hover:bg-indigo-100 py-1.5 px-3 rounded-xl transition flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Restore Defaults
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {menuItems.map((item) => (
                <div key={item.id} className="border border-slate-150 rounded-xl p-3.5 flex flex-col justify-between bg-slate-50/50 hover:bg-slate-50 transition">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider font-mono">{item.category}</span>
                      <h5 className="font-bold text-xs text-slate-900 mt-0.5">{item.name}</h5>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{item.description}</p>
                    </div>
                    {/* Switch availability toggler */}
                    <button
                      onClick={() => onUpdateMenu(item.id, item.price, !item.isAvailable)}
                      className="shrink-0 text-slate-450 hover:text-slate-600 cursor-pointer"
                      title={item.isAvailable ? "Set unavailable" : "Set available"}
                    >
                      {item.isAvailable ? (
                        <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full border border-green-200">
                          <span className="text-[10px] text-green-700 font-bold uppercase">Ready</span>
                          <ToggleRight className="w-6 h-6 text-green-600" />
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 bg-rose-50 px-2 py-1 rounded-full border border-rose-200">
                          <span className="text-[10px] text-rose-700 font-bold uppercase">Sold Out</span>
                          <ToggleLeft className="w-6 h-6 text-rose-500" />
                        </div>
                      )}
                    </button>
                  </div>

                  <div className="flex justify-between items-center border-t border-slate-150 pt-2.5 mt-2.5">
                    <span className="text-xs text-slate-500">Fast prep: <strong className="font-mono text-slate-800">{item.estimatedPrepTime}m</strong></span>
                    {/* Price editor */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-slate-400">Price:</span>
                      <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white">
                        <button
                          onClick={() => onUpdateMenu(item.id, Math.max(0.50, item.price - 0.50), item.isAvailable)}
                          className="px-2 py-1 bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-bold cursor-pointer"
                        >
                          -
                        </button>
                        <span className="px-2.5 text-xs font-mono font-bold text-slate-800">
                          {item.price.toFixed(2)} Birr
                        </span>
                        <button
                          onClick={() => onUpdateMenu(item.id, item.price + 0.50, item.isAvailable)}
                          className="px-2 py-1 bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-bold cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Real-Time Incoming Bot Orders</h4>
              <p className="text-xs text-slate-400">Watch orders placed in simulated Telegram translate instantly into kitchen tickets.</p>
            </div>

            {orders.length === 0 ? (
              <div className="border border-dashed border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center text-center text-slate-400">
                <ListOrdered className="w-12 h-12 stroke-1 mb-2.5" />
                <span className="text-xs font-medium">No active kitchen orders received yet.</span>
                <span className="text-[10px] mt-0.5">Please order and confirm inside the Telegram chat simulator first!</span>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div key={order.id} className="border border-slate-200 rounded-xl p-4 bg-white hover:shadow-sm transition">
                    <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-100 pb-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold font-mono text-xs text-slate-800">Order ID: #{order.id}</span>
                          <span className={`text-[10px] font-bold uppercase py-0.5 px-2.5 rounded-full border ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Placed on: {new Date(order.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-900 block">{order.total.toFixed(2)} Birr</span>
                        <span className="text-[10px] text-slate-400 block">Est: {order.etaMinutes}m ETA</span>
                      </div>
                    </div>

                    {/* Left: Raw customer message, Right: Parsed ticket */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Original raw text */}
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block font-mono mb-1">Customer Telegram Message</span>
                        <p className="text-xs text-slate-700 italic leading-relaxed">&ldquo;{order.rawText}&rdquo;</p>
                      </div>

                      {/* Decoded Items */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block font-mono">Parsed Kitchen Ticket</span>
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs text-slate-800 border-b border-slate-100/50 pb-1 last:border-0">
                            <div>
                              <strong className="text-indigo-600 font-bold">{item.quantity}x</strong> {item.name}
                              {item.customization && <span className="text-[10px] block text-orange-650 ml-1">({item.customization})</span>}
                            </div>
                            <span className="font-mono text-slate-400">{item.totalPrice.toFixed(2)} Birr</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action button inside order card */}
                    {order.status !== 'completed' && order.status !== 'cancelled' && (
                      <div className="flex justify-end border-t border-slate-100 pt-3 mt-3">
                        <button
                          onClick={() => onCancelActiveOrder(order.id)}
                          className="bg-rose-50 text-rose-700 hover:bg-rose-100 text-[10px] font-bold font-mono py-1.5 px-3 rounded-lg transition shrink-0 cursor-pointer"
                        >
                          Cancel order
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* METRICS TAB */}
        {activeTab === 'metrics' && (
          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Small City Bot Performance Metrics</h4>
              <p className="text-xs text-slate-400">Real-world projection based on replacing classic multi-level visual menus with natural text ordering.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-4">
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <Clock className="w-5 h-5 text-indigo-700 mb-2" />
                  <span className="text-[11px] text-indigo-600 block uppercase font-mono font-bold tracking-wider">Average Choice Speed</span>
                  <p className="text-2xl font-bold text-indigo-950 font-mono mt-1">18 Secs</p>
                </div>
                <span className="text-[10px] text-indigo-600 block mt-2.5 font-medium">✨ -84% vs classic visual scroll grids</span>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <DollarSign className="w-5 h-5 text-green-700 mb-2" />
                  <span className="text-[11px] text-green-600 block uppercase font-mono font-bold tracking-wider">Conversion rate</span>
                  <p className="text-2xl font-bold text-green-950 font-mono mt-1">+42% Up</p>
                </div>
                <span className="text-[10px] text-green-600 block mt-2.5 font-medium">🚀 Fast, direct intent prevents checkout leaks</span>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <Sparkles className="w-5 h-5 text-purple-700 mb-2" />
                  <span className="text-[11px] text-purple-600 block uppercase font-mono font-bold tracking-wider">Bot Parsing Precision</span>
                  <p className="text-2xl font-bold text-purple-950 font-mono mt-1">98.4% Acc</p>
                </div>
                <span className="text-[10px] text-purple-600 block mt-2.5 font-medium font-medium">⚡ Supported via Gemini 3.5-Flash model</span>
              </div>
            </div>

            {/* Strategic Entrepreneur Advice */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mt-4">
              <span className="font-bold text-xs text-slate-800 block mb-1">💡 Smart Entrepreneur Tip for Small Cities</span>
              <p className="text-xs text-slate-500 leading-relaxed">
                In smaller cities (under 100k population), customer relationships thrive on personal proximity. Classic food delivery apps feel dry. Giving the user the freedom to &ldquo;just type&rdquo; resembles talking directly to a local shop teller, ensuring unparalleled retention and supreme simplicity for elderly or tech-averse locals!
              </p>
            </div>
          </div>
        )}

        {/* TELEGRAM BOT & NGROK SETUP TAB */}
        {activeTab === 'bot-setup' && (
          <div className="space-y-6">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Telegram Bot & Ngrok Local Tunnel Setup</h4>
              <p className="text-xs text-slate-500 mt-0.5">Connect your real Telegram Bot directly to this backend using Secure Dev Tunnels (ngrok) or our direct Cloud Run URL structure.</p>
            </div>

            {/* OPERATOR NOTIFICATION CONDUIT SETTINGS */}
            <div className="bg-slate-900 text-slate-100 rounded-xl p-4.5 space-y-4 shadow-md border border-slate-850">
              <span className="text-[11px] uppercase tracking-wider text-emerald-400 font-bold block flex items-center gap-1.5 font-mono">
                📞 2. Live Operator Notification Settings
              </span>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                Configure which operator the Telegram bot notifies when customers verify their advance Birr payment. By default, notifications route to the requested system:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 block font-mono">Operator Telegram Chat ID</label>
                  <input
                    type="text"
                    value={operatorChatId}
                    onChange={(e) => setOperatorChatId(e.target.value)}
                    placeholder="e.g. 7596617846"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 block font-mono">Operator Username / Name Link</label>
                  <input
                    type="text"
                    value={operatorUsername}
                    onChange={(e) => setOperatorUsername(e.target.value)}
                    placeholder="e.g. Cephasimon"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 text-[11px] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">Test operator routing configuration:</span>
                  <button
                    type="button"
                    onClick={handleSendTestOperatorMessage}
                    disabled={testStatus === 'sending'}
                    className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-lg font-bold px-3 py-1 font-sans cursor-pointer transition text-[10.5px] disabled:opacity-50"
                  >
                    {testStatus === 'sending' ? 'Transmitting test ping...' : '⚡ Send Instant Test Ping'}
                  </button>
                </div>

                {testStatus === 'success' && (
                  <p className="text-emerald-450 font-medium font-sans animate-fade-in text-xs">
                    ✅ Test ping dispatched successfully! Check Telegram user {operatorUsername} ({operatorChatId}) for the incoming message.
                  </p>
                )}
                {testStatus === 'error' && (
                  <p className="text-rose-400 font-medium font-sans animate-fade-in text-xs">
                    ❌ Telegram Bot error: {testMessageError || "Failed to reach endpoint."}. Ensure your Bot Token is correct and that the operator has pressed /start on the bot first.
                  </p>
                )}
              </div>
            </div>

            {/* TUNNEL SELECTION CARD */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
              <span className="text-[11px] uppercase tracking-wider text-indigo-600 font-bold block">1. Select Delivery Webhook Host Type</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTunnelType('workspace')}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition ${tunnelType === 'workspace' ? 'bg-white border-indigo-500 shadow-sm ring-1 ring-indigo-500/10' : 'bg-slate-50/50 hover:bg-slate-50 border-slate-200'}`}
                >
                  <div className="flex items-center gap-2">
                    <Globe className={`w-4 h-4 ${tunnelType === 'workspace' ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span className="font-bold text-xs text-slate-800">Direct Public Preview URL</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">Use our secure, always-on Cloud Run development URL directly. No tunnel utility installation needed!</p>
                </button>

                <button
                  type="button"
                  onClick={() => setTunnelType('ngrok')}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition ${tunnelType === 'ngrok' ? 'bg-white border-indigo-500 shadow-sm ring-1 ring-indigo-500/10' : 'bg-slate-50/50 hover:bg-slate-50 border-slate-200'}`}
                >
                  <div className="flex items-center gap-2">
                    <Terminal className={`w-4 h-4 ${tunnelType === 'ngrok' ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span className="font-bold text-xs text-slate-800">Ngrok Local Tunnel</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">Perfect if you download/export this workspace to run on your local computer via <code>npm run dev</code> on port 3000.</p>
                </button>
              </div>

              {/* INPUT CONTROLS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <label className="text-[10.5px] font-bold text-slate-700 block">Telegram Bot Token (from @BotFather)</label>
                  <input
                    type="text"
                    value={botToken}
                    onChange={(e) => setBotToken(e.target.value)}
                    placeholder="e.g. 8139963672:AAEl_yourTokenHere"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {tunnelType === 'ngrok' ? (
                  <div className="space-y-1">
                    <label className="text-[10.5px] font-bold text-slate-700 block">Your Custom Ngrok URL</label>
                    <input
                      type="text"
                      value={customTunnelUrl}
                      onChange={(e) => setCustomTunnelUrl(e.target.value)}
                      placeholder="e.g. https://xxxx-yy-zz.ngrok-free.app"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="text-[10.5px] font-bold text-slate-450 block">Current Public App Domain (Read Only)</label>
                    <div className="bg-slate-100 border border-slate-200 rounded-lg px-3 py-1 text-xs font-mono text-slate-500 select-all truncate">
                      {typeof window !== 'undefined' ? window.location.origin : 'https://ais-dev-o3dqdf3222mogm3qode6kb-813996367247.europe-west2.run.app'}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* INTEGRATION GUIDE CARDS */}
            <div className="space-y-4">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block">3. Integration Actions</span>

              {/* STEP A: RUN NGROK WITH SEAMLESS CROSS-PLATFORM SUB-TABS */}
              {tunnelType === 'ngrok' && (
                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
                  <div className="flex flex-wrap justify-between items-center gap-2">
                    <span className="text-xs font-semibold text-slate-850 flex items-center gap-1.5">
                      <span className="w-5 h-5 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold text-[10px]">A</span>
                      Install & Launch Ngrok Tunnel:
                    </span>
                    {/* OS sub-tabs */}
                    <div className="flex bg-slate-100 p-0.5 rounded-lg text-[10.5px] font-semibold border border-slate-200 font-sans">
                      <button
                        onClick={() => setNgrokOS('windows')}
                        className={`px-2.5 py-1 rounded-md cursor-pointer transition ${ngrokOS === 'windows' ? 'bg-white text-indigo-750 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                      >
                        🪟 Windows
                      </button>
                      <button
                        onClick={() => setNgrokOS('mac')}
                        className={`px-2.5 py-1 rounded-md cursor-pointer transition ${ngrokOS === 'mac' ? 'bg-white text-indigo-750 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                      >
                        🍎 macOS
                      </button>
                      <button
                        onClick={() => setNgrokOS('linux')}
                        className={`px-2.5 py-1 rounded-md cursor-pointer transition ${ngrokOS === 'linux' ? 'bg-white text-indigo-750 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                      >
                        🐧 Linux
                      </button>
                    </div>
                  </div>

                  {ngrokOS === 'windows' && (
                    <div className="space-y-2">
                      <p className="text-[11px] text-slate-600">Download ngrok and fire inside PowerShell:</p>
                      <div className="bg-slate-950 text-slate-100 rounded-lg p-3 font-mono text-[11px] relative flex justify-between items-center">
                        <div>
                          <span className="text-blue-400">choco</span> install ngrok <span className="text-slate-450">&amp;&amp;</span> ngrok http 3000
                        </div>
                        <button
                          onClick={() => handleCopy("choco install ngrok && ngrok http 3000", "ngrok-win")}
                          className="p-1 px-2.5 text-slate-400 hover:text-white rounded bg-slate-800 border border-slate-700 text-[10px]"
                        >
                          {copiedCmd === 'ngrok-win' ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  )}

                  {ngrokOS === 'mac' && (
                    <div className="space-y-2">
                      <p className="text-[11px] text-slate-600">Install quickly using Homebrew:</p>
                      <div className="bg-slate-950 text-slate-100 rounded-lg p-3 font-mono text-[11px] relative flex justify-between items-center">
                        <div>
                          <span className="text-blue-400">brew</span> install ngrok/ngrok/ngrok <span className="text-slate-450">&amp;&amp;</span> ngrok http 3000
                        </div>
                        <button
                          onClick={() => handleCopy("brew install ngrok/ngrok/ngrok && ngrok http 3000", "ngrok-mac")}
                          className="p-1 px-2.5 text-slate-400 hover:text-white rounded bg-slate-800 border border-slate-700 text-[10px]"
                        >
                          {copiedCmd === 'ngrok-mac' ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  )}

                  {ngrokOS === 'linux' && (
                    <div className="space-y-2">
                      <p className="text-[11px] text-slate-600">Using standard curl installer:</p>
                      <div className="bg-slate-950 text-slate-100 rounded-lg p-3 font-mono text-[11px] relative flex justify-between items-center">
                        <div className="truncate max-w-[80%]">
                          curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc &gt;/dev/null
                        </div>
                        <button
                          onClick={() => handleCopy("curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null && echo \"deb https://ngrok-agent.s3.amazonaws.com buster main\" | sudo tee /etc/apt/sources.list.dir/ngrok.list && sudo apt update && sudo apt install ngrok && ngrok http 3000", "ngrok-linux")}
                          className="p-1 px-2.5 text-slate-400 hover:text-white rounded bg-slate-800 border border-slate-700 text-[10px]"
                        >
                          {copiedCmd === 'ngrok-linux' ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  )}

                  <p className="text-[10.5px] text-slate-500 leading-snug">
                    Once active, paste the generated secure HTTPS URL (e.g. <code>https://your-tunnel.ngrok-free.app</code>) into the field above to align style assets and telemetry webhooks correctly.
                  </p>
                </div>
              )}

              {/* STEP B: REGISTER WEBHOOK COMMANDS */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
                <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                  <span className="w-5 h-5 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold text-[10px]">
                    {tunnelType === 'ngrok' ? 'B' : 'A'}
                  </span>
                  Register Webhook / Web URL callback on Telegram Server:
                </span>
                
                {/* Generated curl command */}
                <div className="bg-slate-950 text-slate-100 rounded-lg p-3 font-mono text-[11px] relative flex flex-col gap-2">
                  <div className="flex justify-between items-center text-slate-400 text-[10px] border-b border-slate-800 pb-1.5 mb-11">
                    <span>GENERATE UNIX CURL CODE STATEMENT</span>
                    <button
                      onClick={() => handleCopy(`curl -s -X POST "https://api.telegram.org/bot${botToken}/setWebhook?url=${tunnelType === 'workspace' ? (typeof window !== 'undefined' ? window.location.origin : '') : (customTunnelUrl || 'https://xxxx.ngrok-free.app')}/api/parse-order"`, "curl")}
                      className="p-1 px-2 text-slate-400 hover:text-white rounded transition bg-slate-800 border border-slate-700 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedCmd === 'curl' ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                      <span className="text-[9px] font-sans font-medium">{copiedCmd === 'curl' ? 'Copied!' : 'Copy Shell Command'}</span>
                    </button>
                  </div>
                  <p className="text-slate-350 break-all font-mono text-[10.5px] leading-relaxed">
                    curl -s -X POST &quot;https://api.telegram.org/bot<strong className="text-sky-300 font-bold">{botToken}</strong>/setWebhook?url=<strong className="text-emerald-400 font-bold">{tunnelType === 'workspace' ? (typeof window !== 'undefined' ? window.location.origin : 'https://dev-url') : (customTunnelUrl || 'https://xxxx.ngrok-free.app')}</strong>/api/parse-order&quot;
                  </p>
                </div>
                <p className="text-[10.5px] text-slate-500 leading-snug">Fire this command in your Unix terminal or standard command prompt to inform Telegram where to submit text order updates.</p>
              </div>

              {/* STEP C: TELEGRAM BOTMENUBUTTON CONFIG */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
                <span className="text-xs font-semibold text-slate-805 flex items-center gap-1.5">
                  <span className="w-5 h-5 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold text-[10px]">
                    {tunnelType === 'ngrok' ? 'C' : 'B'}
                  </span>
                  Set WebApp Keyboard Launcher URL in BotFather:
                </span>
                
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs leading-relaxed space-y-2 text-slate-600">
                  <p>1. Open <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-semibold underline inline-flex items-center gap-0.5">@BotFather<ExternalLink className="w-3 h-3 inline" /></a> inside Telegram.</p>
                  <p>2. Send <strong>/newapp</strong> to create a new Mini App connected to your bot.</p>
                  <p>3. When asked for the <strong>Web App URL</strong>, copy and paste this exact link:</p>
                  <div className="bg-white border border-slate-200 p-2 text-slate-800 font-mono text-xs rounded flex justify-between items-center bg-white shadow-sm">
                    <span className="font-bold text-indigo-600 truncate">{tunnelType === 'workspace' ? (typeof window !== 'undefined' ? window.location.origin : 'https://dev-url') : (customTunnelUrl || 'https://xxxx.ngrok-free.app')}</span>
                    <button
                      onClick={() => handleCopy(tunnelType === 'workspace' ? (typeof window !== 'undefined' ? window.location.origin : 'https://dev-url') : (customTunnelUrl || 'https://xxxx.ngrok-free.app'), "webappUrl")}
                      className="p-1 px-2.5 text-[10px] text-indigo-750 bg-indigo-50 hover:bg-indigo-100 rounded transition font-bold font-sans cursor-pointer flex items-center gap-1 shrink-0"
                    >
                      {copiedCmd === 'webappUrl' ? 'Copied!' : 'Copy Launch Link'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* INTERACTIVE SIMULATOR WEBHOOK PAYLOAD DEBUGGER */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <span className="text-[11px] uppercase tracking-wider text-indigo-600 font-bold block flex items-center gap-1">
                <Terminal className="w-3.5 h-3.5 text-indigo-600" /> Webhook Payload Simulation Debugger
              </span>
              <p className="text-[11px] text-slate-500 leading-normal">Test how the backend server processes incoming webhook messages from your ngrok tunnel locally.</p>
              
              <div className="space-y-2">
                <textarea
                  value={simText}
                  onChange={(e) => setSimText(e.target.value)}
                  placeholder="Enter sample telegram message..."
                  className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 font-sans focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  rows={2}
                />
                
                <button
                  type="button"
                  onClick={handleSimulateWebhook}
                  disabled={simStatus === 'testing' || !simText.trim()}
                  className="bg-indigo-600 hover:bg-indigo-750 text-white rounded-xl py-2 px-4 text-xs font-bold font-sans cursor-pointer transition disabled:opacity-50 block w-full text-center"
                >
                  {simStatus === 'testing' ? 'Transmitting mock webhook...' : 'Simulate Incoming Telegram Webhook JSON POST'}
                </button>
              </div>

              {simResult && (
                <div className="space-y-1.5 animate-fade-in">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider font-bold">TELEGRAM API WEBHOOK SERVER WEB RESPONSE ACTION (JSON):</span>
                  <div className="bg-slate-950 text-emerald-450 rounded-lg p-3 font-mono text-[10px] max-h-[160px] overflow-y-auto">
                    <pre>{JSON.stringify(simResult, null, 2)}</pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
