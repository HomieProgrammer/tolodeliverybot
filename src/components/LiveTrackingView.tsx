import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Bike, Soup, CheckCircle, Navigation, MapPin, Compass, Play, Pause, FastForward } from 'lucide-react';
import { Order, OrderStatus } from '../types';

interface LiveTrackingViewProps {
  order: Order | null;
  onStatusChange: (orderId: string, status: OrderStatus, progress: number) => void;
}

export default function LiveTrackingView({ order, onStatusChange }: LiveTrackingViewProps) {
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  
  // Define path coordinates for SVG map
  // Route goes from Restaurant (20%, 30%) to Customer Home (80%, 75%)
  const waypoints = [
    { x: 120, y: 140, name: "Partner Fast Food Kitchen (Start)" },
    { x: 220, y: 140, name: "Broad Street Intersection" },
    { x: 340, y: 140, name: "City Center Roundabout" },
    { x: 340, y: 220, name: "Riverside Park Avenue" },
    { x: 500, y: 220, name: "East Bridge" },
    { x: 500, y: 320, name: "Residential Green Lanes" },
    { x: 620, y: 320, name: "Customer House (Finish)" }
  ];

  // Calculate coordinates based on order progress percentage
  const getScooterCoords = (pct: number) => {
    if (pct <= 0) return { x: waypoints[0].x, y: waypoints[0].y, rot: 0 };
    if (pct >= 100) return { x: waypoints[waypoints.length - 1].x, y: waypoints[waypoints.length - 1].y, rot: 0 };

    // Total length calculations
    const segments = waypoints.length - 1;
    const step = 100 / segments;
    const curSegIndex = Math.floor(pct / step);
    const segPct = (pct % step) / step;

    if (curSegIndex >= segments) {
      return { x: waypoints[waypoints.length - 1].x, y: waypoints[waypoints.length - 1].y, rot: 0 };
    }

    const startPt = waypoints[curSegIndex];
    const endPt = waypoints[curSegIndex + 1];

    const x = startPt.x + (endPt.x - startPt.x) * segPct;
    const y = startPt.y + (endPt.y - startPt.y) * segPct;

    // Calculate rotation angle
    const dx = endPt.x - startPt.x;
    const dy = endPt.y - startPt.y;
    const rot = Math.atan2(dy, dx) * (180 / Math.PI);

    return { x, y, rot };
  };

  useEffect(() => {
    if (!order || !isPlaying) return;

    const interval = setInterval(() => {
      let nextProgress = order.progress + (1 * speedMultiplier);
      if (nextProgress > 100) {
        nextProgress = 100;
      }

      let nextStatus: OrderStatus = order.status;
      if (nextProgress >= 100) {
        nextStatus = 'completed';
      } else if (nextProgress >= 30) {
        nextStatus = 'driving';
      } else if (nextProgress > 0) {
        nextStatus = 'preparing';
      }

      onStatusChange(order.id, nextStatus, nextProgress);

      if (nextProgress >= 100) {
        setIsPlaying(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [order?.progress, order?.status, order?.id, isPlaying, speedMultiplier, onStatusChange]);

  if (!order) {
    return (
      <div id="no-order-tracker" className="bg-slate-50 border border-slate-200/60 rounded-2xl p-10 flex flex-col items-center justify-center text-center h-[525px]">
        <Compass className="w-16 h-16 text-slate-300 animate-spin-pulse mb-4" />
        <h3 className="font-bold text-lg text-slate-800">No Active Deliveries</h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          Type can you request or confirm an order in the Telegram bot chat simulator to start active real-time tracking.
        </p>
      </div>
    );
  }

  const currentCoords = getScooterCoords(order.status === 'preparing' ? 0 : (order.progress - 30) * (100 / 70));
  const etaLeft = Math.max(1, Math.ceil(order.etaMinutes * (1 - order.progress / 100)));

  return (
    <div id="active-tracker-container" className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm h-[620px] flex flex-col">
      {/* Header Info */}
      <div className="bg-slate-900 text-white p-4 flex flex-wrap justify-between items-center gap-3">
        <div>
          <span className="text-xs uppercase bg-indigo-600 text-indigo-100 font-bold px-2.5 py-1 rounded-full">
            REAL-TIME SYSTEM GPS ACTIVE
          </span>
          <h3 className="text-md font-bold mt-1 tracking-tight">Tracking Order ID: #{order.id}</h3>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-xs text-slate-400 block font-normal">Simulated Delivery Timer</span>
            <span className="font-mono text-xl font-bold tracking-wider text-green-400">
              {order.status === 'completed' ? "ARRIVED 🎉" : `${etaLeft} mins left`}
            </span>
          </div>
          {/* Controls */}
          <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1 px-2 text-xs rounded transition hover:bg-slate-750 flex items-center gap-1 cursor-pointer"
              title={isPlaying ? "Pause tracking" : "Resume tracking"}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-green-450" />}
            </button>
            <button
              onClick={() => setSpeedMultiplier(prev => prev === 1 ? 3 : prev === 3 ? 6 : 1)}
              className="p-1 px-2 text-xs rounded transition hover:bg-slate-750 flex items-center gap-1 cursor-pointer"
              title="Toggle Multiplier"
            >
              <FastForward className="w-3.5 h-3.5" />
              <span className="text-[10px] font-mono font-bold font-semibold uppercase">{speedMultiplier}x</span>
            </button>
          </div>
        </div>
      </div>

      {/* Progress Stepper */}
      <div className="grid grid-cols-4 border-b border-slate-100 bg-slate-50/50 p-3 text-center text-xs">
        <div className={`p-1 border-r border-slate-100 flex flex-col items-center ${order.progress >= 0 ? 'text-indigo-600 font-semibold' : 'text-slate-400'}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] mb-1 ${order.progress >= 5 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>1</div>
          <span>Received</span>
        </div>
        <div className={`p-1 border-r border-slate-100 flex flex-col items-center ${order.progress >= 10 ? 'text-indigo-600 font-semibold' : 'text-slate-400'}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] mb-1 ${order.progress >= 30 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
            {order.status === 'preparing' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "2"}
          </div>
          <span className="flex items-center gap-1">Cooking</span>
        </div>
        <div className={`p-1 border-r border-slate-100 flex flex-col items-center ${order.progress >= 30 ? 'text-indigo-600 font-semibold' : 'text-slate-400'}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] mb-1 ${order.progress >= 85 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
            {order.status === 'driving' ? <Bike className="w-3.5 h-3.5 animate-bounce" /> : "3"}
          </div>
          <span>On Road</span>
        </div>
        <div className={`p-1 flex flex-col items-center ${order.progress === 100 ? 'text-green-600 font-semibold' : 'text-slate-400'}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] mb-1 ${order.progress === 100 ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-600'}`}>4</div>
          <span>At Door</span>
        </div>
      </div>

      {/* Interactive Map Canvas Section */}
      <div className="relative flex-1 bg-sky-200/20 overflow-hidden">
        {/* Animated Vector Map */}
        <svg viewBox="0 0 740 400" className="w-full h-full bg-[#f4ebd0] opacity-90 transition-all select-none">
          {/* Map Grid Grid roads */}
          <rect x="0" y="0" width="740" height="400" fill="#eae1c9" />
          
          {/* Parks & River */}
          <rect x="40" y="240" width="120" height="120" rx="12" fill="#d2dec1" />
          <rect x="420" y="40" width="220" height="130" rx="16" fill="#cbe3bc" stroke="#bac08f" strokeWidth="1" />
          <text x="530" y="100" fill="#5c8246" className="text-[10px] font-semibold tracking-wider italic fill-opacity-65" textAnchor="middle">Riverside Forest Park</text>

          {/* Sinuous River blue */}
          <path d="M -40,350 Q 180,310 320,380 T 700,280 T 800,320" fill="none" stroke="#add8e6" strokeWidth="26" strokeLinecap="round" />
          
          {/* Streets Grids / Roads */}
          <path d="M 40,80 H 700 M 40,140 H 700 M 40,220 H 700 M 40,320 H 700 M 120,40 V 360 M 340,40 V 360 M 500,40 V 360 M 620,40 V 360" 
                fill="none" stroke="#fafafa" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 40,80 H 700 M 40,140 H 700 M 40,220 H 700 M 40,320 H 700 M 120,40 V 360 M 340,40 V 360 M 500,40 V 360 M 620,40 V 360" 
                fill="none" stroke="#dad0be" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />

          {/* Streets names labels */}
          <text x="50" y="130" fill="#a49980" className="text-[9px] font-mono tracking-tight font-medium">Main Broadway St.</text>
          <text x="360" y="300" fill="#a49980" className="text-[9px] font-mono tracking-tight font-medium font-semibold uppercase origin-center rotate-90">River Parkway</text>
          <text x="520" y="210" fill="#a49980" className="text-[9px] font-mono tracking-tight font-medium">East Bridge Rd.</text>

          {/* Landmarks */}
          <circle cx="120" cy="140" r="14" fill="#6366f1" className="animate-pulse" opacity="0.15" />
          <circle cx="120" cy="140" r="6" fill="#6366f1" />
          <g transform="translate(100, 105)">
            <rect width="64" height="18" rx="4" fill="#312e81" />
            <text x="32" y="12" fill="#ffffff" className="text-[8px] font-sans font-bold text-center" textAnchor="middle">OUR KITCHEN</text>
          </g>

          {/* Delivery Road Tracker Line (Flashing active route helper) */}
          <path d="M 120,140 H 340 V 220 H 500 V 320 H 620" 
                fill="none" stroke="#2563eb" strokeWidth="4" strokeLinecap="round" strokeDasharray="6 4" opacity="0.65" />

          {/* Customer Destination House */}
          <circle cx="620" cy="320" r="14" fill="#10b981" className="animate-pulse" opacity="0.15" />
          <circle cx="620" cy="320" r="6" fill="#10b981" />
          <g transform="translate(590, 335)">
            <rect width="60" height="18" rx="4" fill="#064e3b" />
            <text x="30" y="12" fill="#ffffff" className="text-[8px] font-sans font-bold text-center" textAnchor="middle">YOUR DOOOR</text>
          </g>

          {/* Scooter / Driver marker */}
          {order.status !== 'preparing' && (
            <g transform={`translate(${currentCoords.x - 14}, ${currentCoords.y - 14})`}>
              {/* Pulsing indicator */}
              <circle cx="14" cy="14" r="18" fill="#e11d48" className="animate-pulse" opacity="0.25" />
              <rect x="0" y="0" width="28" height="28" rx="14" fill="#e11d48" className="shadow-lg border border-white" />
              <g transform="translate(6, 6) scale(0.6)">
                <path d="M21 16H18V12H21V16ZM14.99 12H11.99V16H14.99V12ZM14.99 18H11.99V22H14.99V18ZM21 18H18V22H21V18ZM2.99 12H5.99V16H2.99V12ZM8.99 12H5.99V16H8.99V12ZM8.99 18H5.99V22H8.99V18ZM2.99 18H5.99V22H2.99V18ZM11 5V8.5L8.5 11H3.5C2.12 11 1 9.88 1 8.5C1 7.12 2.12 6 3.5 6H6.5L8.5 4H10.5V5ZM13 7H14.5V11C14.5 12.1 13.6 13 12.5 13H5C4.45 13 4 12.55 4 12C4 11.45 4.45 11 5 11H12V8C12.55 8 13 7.55 13 7Z" fill="#ffffff" />
              </g>
              {/* Miniature Arrow */}
              <polygon points="14,2 18,8 10,8" fill="#e11d48" transform={`rotate(${currentCoords.rot}, 14, 14)`} />
            </g>
          )}
        </svg>

        {/* Real-time Stage Overlay Card */}
        <div className="absolute top-4 left-4 right-4 bg-white/95 backdrop-blur-sm border border-slate-200/80 p-3.5 rounded-xl shadow-lg flex items-center gap-3">
          <div className="p-2.5 bg-rose-50 rounded-lg text-rose-650 shrink-0">
            {order.status === 'preparing' ? <Soup className="w-5 h-5 animate-pulse" /> : 
             order.status === 'completed' ? <CheckCircle className="w-5 h-5 text-green-600" /> :
             <Bike className="w-5 h-5 animate-bounce" />}
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Current Activity</span>
            <p className="text-sm font-semibold text-slate-800 truncate">
              {order.status === 'preparing' ? "Chef is handcrafting your meal inside ready-kitchen..." :
               order.status === 'driving' ? `Driver ${order.driverName} picked up and navigating Broad Street...` :
               order.status === 'completed' ? "Dispatched scooter arrived outside your door! Enjoy!" :
               "Order received and waiting restaurant acceptance."}
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase block font-mono">Step Progress</span>
            <span className="text-xs font-mono font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">{Math.round(order.progress)}%</span>
          </div>
        </div>
      </div>

      {/* Driver and Address Info */}
      <div className="bg-slate-50 border-t border-slate-100 p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-150">
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
            {order.driverName.charAt(0)}
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-mono uppercase font-bold">Assigned Rider</span>
            <span className="text-sm font-bold text-slate-800 block">{order.driverName}</span>
            <span className="text-xs text-slate-500 font-mono italic">{order.driverPhone}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-150">
          <div className="p-2 bg-green-50 text-green-700 rounded-lg">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] text-slate-400 block font-mono uppercase font-bold">Delivery Address</span>
            <span className="text-sm font-bold text-slate-800 block truncate">{order.deliveryAddress}</span>
            <span className="text-xs text-slate-500">Mailed instructions: Ring doorbell or call.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
