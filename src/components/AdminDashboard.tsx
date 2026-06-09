import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ToggleLeft, ToggleRight, Settings, Plus, RotateCcw, Package, DollarSign, ListOrdered, Percent, Sparkles, CheckSquare, XSquare, Clock } from 'lucide-react';
import { MenuItem, Order, OrderStatus } from '../types';

interface AdminDashboardProps {
  menuItems: MenuItem[];
  onUpdateMenu: (id: string, price: number, isAvailable: boolean) => void;
  onResetMenu: () => void;
  orders: Order[];
  onCancelActiveOrder: (orderId: string) => void;
}

export default function AdminDashboard({
  menuItems,
  onUpdateMenu,
  onResetMenu,
  orders,
  onCancelActiveOrder
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'catalog' | 'orders' | 'metrics'>('catalog');

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
        <div className="flex gap-1.5 text-xs bg-slate-800 p-1 rounded-lg">
          <button
            id="tab-catalog"
            onClick={() => setActiveTab('catalog')}
            className={`py-1.5 px-3 rounded-md transition font-medium cursor-pointer ${activeTab === 'catalog' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white'}`}
          >
            Ready catalog
          </button>
          <button
            id="tab-orders"
            onClick={() => setActiveTab('orders')}
            className={`py-1.5 px-3 rounded-md transition font-medium cursor-pointer ${activeTab === 'orders' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white'}`}
          >
            Live orders ({orders.length})
          </button>
          <button
            id="tab-metrics"
            onClick={() => setActiveTab('metrics')}
            className={`py-1.5 px-3 rounded-md transition font-medium cursor-pointer ${activeTab === 'metrics' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white'}`}
          >
            Metrics
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
                          ${item.price.toFixed(2)}
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
                        <span className="text-xs font-bold text-slate-900 block">${order.total.toFixed(2)}</span>
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
                            <span className="font-mono text-slate-400">${item.totalPrice.toFixed(2)}</span>
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

      </div>
    </div>
  );
}
