import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Bike,
  DollarSign,
  Award,
  CheckCircle2,
  XCircle,
  Navigation,
  User,
  ToggleLeft,
  ToggleRight,
  Phone,
  MapPin,
  Sparkles,
  Package,
  Clock,
  Check,
  TrendingUp,
} from "lucide-react";
import { Driver, Order, OrderStatus } from "../types";

interface DriverPortalProps {
  orders: Order[];
  drivers: Driver[];
  onAcceptOrder: (orderId: string, driverId: string) => void;
  onRejectOrder: (orderId: string, driverId: string) => void;
  onCompleteOrder: (orderId: string, driverId: string, earnings: number) => void;
  onUpdateDrivers: (drivers: Driver[]) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus, progress: number) => void;
}

export default function DriverPortal({
  orders,
  drivers,
  onAcceptOrder,
  onRejectOrder,
  onCompleteOrder,
  onUpdateDrivers,
  onUpdateOrderStatus,
}: DriverPortalProps) {
  // Select active driver for simulation
  const [activeDriverId, setActiveDriverId] = useState<string>(() => {
    return drivers.length > 0 ? drivers[0].id : "";
  });

  const activeDriver = drivers.find((d) => d.id === activeDriverId) || null;

  // Find any active order assigned to this driver that has NOT been completed/cancelled
  // Statuses that are active for driver: 'driver_accepted' or 'preparing' or 'driving'
  const activeAssignedOrder = orders.find(
    (o) =>
      o.driverId === activeDriverId &&
      (o.status === "driver_accepted" || o.status === "preparing" || o.status === "driving")
  );

  // Find if there is a pending assignment (driverId matches, isDriverAssigned is true, but isDriverAccepted is false)
  const pendingOffer = orders.find(
    (o) =>
      o.driverId === activeDriverId &&
      o.status === "pending" &&
      o.isDriverAssigned &&
      !o.isDriverAccepted
  );

  const toggleDriverStatus = () => {
    if (!activeDriver) return;
    if (activeDriver.status === "Busy") return; // cannot toggle while busy

    const updatedDrivers = drivers.map((d) => {
      if (d.id === activeDriverId) {
        const nextStatus: "Online" | "Offline" =
          d.status === "Online" ? "Offline" : "Online";
        return { ...d, status: nextStatus };
      }
      return d;
    });
    onUpdateDrivers(updatedDrivers);
  };

  const handleAccept = () => {
    if (!activeDriver || !pendingOffer) return;
    onAcceptOrder(pendingOffer.id, activeDriver.id);
  };

  const handleReject = () => {
    if (!activeDriver || !pendingOffer) return;
    onRejectOrder(pendingOffer.id, activeDriver.id);
  };

  const handlePickup = () => {
    if (!activeDriver || !activeAssignedOrder) return;
    // Set order status to driving and progress to 50
    onUpdateOrderStatus(activeAssignedOrder.id, "driving", 50);
  };

  const handleDeliver = () => {
    if (!activeDriver || !activeAssignedOrder) return;
    
    // Formula: Driver Earnings = 40% of the delivery fee
    const deliveryFee = activeAssignedOrder.deliveryFee || 100;
    const driverEarning = deliveryFee * 0.40;

    // Complete order in main app
    onCompleteOrder(activeAssignedOrder.id, activeDriver.id, driverEarning);
  };

  const averageEarnings = activeDriver
    ? activeDriver.totalDeliveries > 0
      ? activeDriver.totalEarnings / activeDriver.totalDeliveries
      : 0
    : 0;

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-4 -translate-y-4">
          <Bike className="w-48 h-48 text-[#E0560B]" />
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#E0560B] uppercase tracking-widest mb-1">
              <span className="w-2 h-2 rounded-full bg-[#E0560B] animate-ping" />
              <span>Tolo Delivery Rider Terminal</span>
            </div>
            <h2 className="text-xl font-extrabold tracking-tight">Rider Dashboard</h2>
          </div>

          {/* Active Driver Switcher */}
          <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 p-2 rounded-xl text-xs">
            <User className="w-4 h-4 text-slate-400" />
            <span className="text-slate-300 font-medium">Select Driver:</span>
            <select
              value={activeDriverId}
              onChange={(e) => setActiveDriverId(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-white px-2 py-1 rounded font-semibold focus:outline-none focus:ring-1 focus:ring-[#E0560B]"
            >
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.status})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {activeDriver ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* LEFT: Driver stats & profile */}
          <div className="col-span-1 md:col-span-4 space-y-6">
            {/* Profile Info Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-3xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-[#E0560B]">
                  <Bike className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm">{activeDriver.name}</h3>
                  <p className="text-[11px] text-slate-400 font-mono">ID: {activeDriver.id}</p>
                  <p className="text-[11px] text-slate-500 font-mono">{activeDriver.phone}</p>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Motorcycle Plate
                  </span>
                  <span className="text-xs font-bold text-slate-700 font-mono">
                    {activeDriver.plateNumber || "N/A"}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Active Status
                  </span>
                  <div className="flex items-center gap-1.5 justify-end">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        activeDriver.status === "Online"
                          ? "bg-green-500"
                          : activeDriver.status === "Busy"
                          ? "bg-amber-500"
                          : "bg-slate-400"
                      }`}
                    />
                    <span
                      className={`text-xs font-bold ${
                        activeDriver.status === "Online"
                          ? "text-green-600"
                          : activeDriver.status === "Busy"
                          ? "text-amber-600"
                          : "text-slate-500"
                      }`}
                    >
                      {activeDriver.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Toggle Button */}
              {activeDriver.status !== "Busy" ? (
                <button
                  onClick={toggleDriverStatus}
                  className={`w-full py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                    activeDriver.status === "Online"
                      ? "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-250"
                      : "bg-[#E0560B] hover:bg-[#C24103] text-white border-transparent"
                  }`}
                >
                  {activeDriver.status === "Online" ? (
                    <>
                      <ToggleRight className="w-4 h-4 text-green-500" />
                      <span>Go Offline</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-4 h-4 text-slate-300" />
                      <span>Go Online</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="bg-amber-50 text-amber-800 text-[10.5px] font-bold p-2.5 rounded-xl border border-amber-200 text-center">
                  ⚠️ Busy with an active delivery. Cannot toggle status.
                </div>
              )}
            </div>

            {/* Earnings Stats Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-3xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Today's Earnings
                </span>
                <span className="text-lg font-black text-slate-800 tracking-tight block mt-0.5">
                  {activeDriver.todayEarnings.toFixed(2)} <span className="text-xs text-slate-400">Br</span>
                </span>
              </div>
              <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-3xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Total Earnings
                </span>
                <span className="text-lg font-black text-[#E0560B] tracking-tight block mt-0.5">
                  {activeDriver.totalEarnings.toFixed(2)} <span className="text-xs text-slate-400">Br</span>
                </span>
              </div>
              <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-3xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Total Deliveries
                </span>
                <span className="text-lg font-black text-slate-800 tracking-tight block mt-0.5">
                  {activeDriver.totalDeliveries}
                </span>
              </div>
              <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-3xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Avg Per Trip
                </span>
                <span className="text-lg font-black text-slate-800 tracking-tight block mt-0.5">
                  {averageEarnings.toFixed(2)} <span className="text-xs text-slate-400">Br</span>
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT: Active Delivery Offer and Driver Controls */}
          <div className="col-span-1 md:col-span-8 space-y-6">
            {/* PENDING ASSIGNMENT OFFER CARD */}
            {pendingOffer && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-amber-50/75 border-2 border-amber-300 rounded-2xl p-5 shadow-sm space-y-4 relative overflow-hidden"
              >
                <div className="absolute right-0 top-0 bg-amber-400 text-slate-900 text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                  New Delivery Offer!
                </div>
                
                <div className="flex gap-3 items-center">
                  <div className="w-10 h-10 rounded-full bg-amber-250 flex items-center justify-center text-amber-900 animate-bounce">
                    <Navigation className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-sm">
                      New Delivery Available!
                    </h3>
                    <p className="text-xs text-slate-500 font-mono">
                      Order ID: #{pendingOffer.id}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-y border-amber-200/50 py-3 text-xs">
                  <div className="space-y-1.5">
                    <div className="flex items-start gap-1.5 text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block text-slate-700">Delivery Address:</span>
                        <span>{pendingOffer.deliveryAddress}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <div>
                        <span className="font-bold">Customer:</span> {pendingOffer.customerName}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 bg-white/60 p-2.5 rounded-xl border border-amber-100">
                    <div className="flex justify-between font-bold text-slate-700">
                      <span>Delivery Fee:</span>
                      <span>{pendingOffer.deliveryFee} Birr</span>
                    </div>
                    <div className="flex justify-between font-extrabold text-[#E0560B]">
                      <span>Your Payout (40%):</span>
                      <span>{(pendingOffer.deliveryFee * 0.4).toFixed(2)} Birr</span>
                    </div>
                    <div className="text-[9px] text-slate-400 mt-1 font-mono italic">
                      Formula: {pendingOffer.deliveryFee} Br * 0.40
                    </div>
                  </div>
                </div>

                {/* Items List inside pending offer */}
                <div className="space-y-1 text-xs">
                  <span className="font-bold text-slate-600 block">Food Items to Transport:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {pendingOffer.items.map((it, idx) => (
                      <span key={idx} className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 font-semibold text-[11px]">
                        {it.quantity}x {it.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Accept/Reject actions */}
                <div className="flex gap-3">
                  <button
                    onClick={handleAccept}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold text-xs py-3 rounded-xl transition shadow hover:shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Accept Delivery Ticket</span>
                  </button>
                  <button
                    onClick={handleReject}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs px-5 py-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4 text-rose-500" />
                    <span>Reject</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* ACTIVE IN-PROGRESS DELIVERY CONTROLS */}
            {activeAssignedOrder ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-3xs space-y-4">
                <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-orange-100 text-[#E0560B] rounded-lg">
                      <Bike className="w-5 h-5 animate-bounce" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest font-mono block">
                        Active Ticket
                      </span>
                      <h4 className="font-extrabold text-slate-800 text-sm">
                        Order #{activeAssignedOrder.id}
                      </h4>
                    </div>
                  </div>
                  <span className="text-[10px] bg-[#E0560B]/10 text-[#E0560B] font-bold px-2.5 py-1 rounded-full uppercase">
                    {activeAssignedOrder.status === "driver_accepted"
                      ? "Awaiting Food Pickup"
                      : activeAssignedOrder.status === "preparing"
                      ? "In Kitchen Prep"
                      : "Out for Delivery"}
                  </span>
                </div>

                {/* Tracking Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-500 font-semibold">
                    <span>Delivery Progress</span>
                    <span>{activeAssignedOrder.progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#E0560B] transition-all duration-500"
                      style={{ width: `${activeAssignedOrder.progress}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-3 text-center text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                    <span className={activeAssignedOrder.progress >= 20 ? "text-[#E0560B]" : ""}>Accepted</span>
                    <span className={activeAssignedOrder.progress >= 50 ? "text-[#E0560B]" : ""}>Picked Up</span>
                    <span className={activeAssignedOrder.progress >= 100 ? "text-[#E0560B]" : ""}>Delivered</span>
                  </div>
                </div>

                {/* Delivery details card */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-3 text-xs">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-slate-700">Deliver To Address:</span>
                      <span className="text-slate-600 font-medium">{activeAssignedOrder.deliveryAddress}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 border-t border-slate-200/60 pt-2.5">
                    <div>
                      <span className="text-slate-400 font-bold text-[9px] uppercase tracking-wider block">Customer</span>
                      <span className="font-bold text-slate-700">{activeAssignedOrder.customerName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold text-[9px] uppercase tracking-wider block">Customer Phone</span>
                      <span className="font-bold text-slate-700 font-mono">{activeAssignedOrder.customerPhone || "N/A"}</span>
                    </div>
                  </div>
                </div>

                {/* Interactive Status Transition buttons */}
                <div className="space-y-2 pt-2">
                  {activeAssignedOrder.status === "driver_accepted" || activeAssignedOrder.status === "preparing" ? (
                    <button
                      onClick={handlePickup}
                      className="w-full bg-[#E0560B] hover:bg-[#C24103] text-white font-bold text-xs py-3 rounded-xl transition shadow hover:shadow-md flex items-center justify-center gap-1.5 cursor-pointer animate-pulse"
                    >
                      <Navigation className="w-4 h-4" />
                      <span>Depart: Picked Up Food (Start Driving)</span>
                    </button>
                  ) : activeAssignedOrder.status === "driving" ? (
                    <button
                      onClick={handleDeliver}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-xs py-3 rounded-xl transition shadow hover:shadow-md flex items-center justify-center gap-1.5 cursor-pointer animate-pulse"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm Delivered (Add Payout: {(activeAssignedOrder.deliveryFee * 0.40).toFixed(2)} Birr)</span>
                    </button>
                  ) : null}
                </div>
              </div>
            ) : (
              !pendingOffer && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center space-y-3">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto">
                    <Bike className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-700 text-sm">No Active Shipments</h3>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                      You are currently online and waiting for dispatcher assignment. Keep this tab open to see real-time updates!
                    </p>
                  </div>
                </div>
              )
            )}

            {/* EARNINGS HISTORY LIST */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-3xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-150 pb-2">
                <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-[#E0560B]" />
                  <span>Earnings History</span>
                </h4>
                <span className="text-[10px] bg-slate-100 text-slate-500 font-mono font-bold px-2 py-0.5 rounded">
                  {activeDriver.earningsHistory.length} Trips
                </span>
              </div>

              {activeDriver.earningsHistory.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-4 text-center">
                  No completed deliveries yet. Accept tickets to start generating income!
                </p>
              ) : (
                <div className="divide-y divide-slate-100 max-h-[220px] overflow-y-auto pr-1 space-y-2">
                  {activeDriver.earningsHistory.slice().reverse().map((history, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2.5 text-xs">
                      <div>
                        <span className="font-bold text-slate-800 block">
                          Trip Order #{history.orderId}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          {history.timestamp}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-green-600 block">
                          +{history.amount.toFixed(2)} Br
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono">
                          Fee: {history.deliveryFee} Br (40%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-2">
          <p className="text-slate-500">Please register or enable drivers in the Kitchen Console Dashboard.</p>
        </div>
      )}
    </div>
  );
}
