import React, { useState } from "react";
import { motion } from "motion/react";
import {
  ToggleLeft,
  ToggleRight,
  Settings,
  Plus,
  RotateCcw,
  Package,
  DollarSign,
  ListOrdered,
  Percent,
  Sparkles,
  CheckSquare,
  XSquare,
  Clock,
  Terminal,
  Globe,
  ExternalLink,
  Copy,
  Check,
  X,
  Lock,
  Unlock,
  Bike,
} from "lucide-react";
import { MenuItem, Order, OrderStatus, Driver } from "../types";

interface AdminDashboardProps {
  menuItems: MenuItem[];
  onUpdateMenu: (id: string, price: number, isAvailable: boolean) => void;
  onResetMenu: () => void;
  orders: Order[];
  onCancelActiveOrder: (orderId: string) => void;
  onVerifyPayment: (orderId: string) => void;
  onAssignDriver: (
    orderId: string,
    driver: { name: string; id: string; phone: string },
  ) => void;
  onDriverAccept: (orderId: string) => void;
  // Synced Telegram Bot & Operator Tunnel Configs
  botToken: string;
  setBotToken: (val: string) => void;
  operatorChatId: string;
  setOperatorChatId: (val: string) => void;
  operatorUsername: string;
  setOperatorUsername: (val: string) => void;
  customTunnelUrl: string;
  setCustomTunnelUrl: (val: string) => void;
  tunnelType: "workspace" | "ngrok";
  setTunnelType: (val: "workspace" | "ngrok") => void;
  drivers: Driver[];
  onUpdateDrivers: (drivers: Driver[]) => void;
}

export default function AdminDashboard({
  menuItems,
  onUpdateMenu,
  onResetMenu,
  orders,
  onCancelActiveOrder,
  onVerifyPayment,
  onAssignDriver,
  onDriverAccept,
  botToken,
  setBotToken,
  operatorChatId,
  setOperatorChatId,
  operatorUsername,
  setOperatorUsername,
  customTunnelUrl,
  setCustomTunnelUrl,
  tunnelType,
  setTunnelType,
  drivers,
  onUpdateDrivers,
}: AdminDashboardProps) {
  console.log("ADMIN RECEIVED ORDERS", orders.length);
  console.log("ADMIN ORDER IDS", orders.map(o => o.id));

  const pendingPaymentOrders = orders.filter((o) => (o.status === "payment_pending") || (o.status === "pending" && !o.isPaymentVerified));
  const awaitingDriverOrders = orders.filter((o) => o.isPaymentVerified && !o.isDriverAssigned && o.status !== "completed" && o.status !== "cancelled");
  const preparingOrders = orders.filter((o) => o.isPaymentVerified && o.isDriverAssigned && (o.status === "driver_accepted" || o.status === "preparing" || o.status === "pending"));
  const inTransitOrders = orders.filter((o) => o.status === "driving");
  const archiveOrders = orders.filter((o) => o.status === "completed" || o.status === "cancelled");

  orders.forEach((o) => {
    const order = o;
    console.log("ADMIN RECEIPT SOURCE", order.paymentDetails?.receiptPhoto?.substring(0,200));
    let queue = "NONE";
    if ((o.status === "payment_pending") || (o.status === "pending" && !o.isPaymentVerified)) {
      queue = "Pending Payment Verification";
    } else if (o.isPaymentVerified && !o.isDriverAssigned && o.status !== "completed" && o.status !== "cancelled") {
      queue = "Awaiting Driver Assignment";
    } else if (o.isPaymentVerified && o.isDriverAssigned && (o.status === "driver_accepted" || o.status === "preparing" || o.status === "pending")) {
      queue = "Driver Accepted / Preparing";
    } else if (o.status === "driving") {
      queue = "In Transit";
    } else if (o.status === "completed" || o.status === "cancelled") {
      queue = "Archive";
    }
    console.log(`ORDER ID: ${o.id}`);
    console.log(`STATUS: ${o.status}`);
    console.log(`isPaymentVerified: ${o.isPaymentVerified}`);
    console.log(`WHICH QUEUE IT WAS ASSIGNED TO: ${queue}`);
  });

  console.log("PENDING PAYMENT", pendingPaymentOrders);
  console.log("AWAITING DRIVER", awaitingDriverOrders);
  console.log("PREPARING", preparingOrders);
  console.log("IN TRANSIT", inTransitOrders);
  console.log("ARCHIVE", archiveOrders);

  const [activeTab, setActiveTab] = useState<
    "orders" | "metrics" | "bot-setup" | "drivers"
  >("orders");
  const [passcode, setPasscode] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);

  const handleUnlock = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (passcode.trim() === "Dag0916031177?") {
      setIsUnlocked(true);
      setPasscode("");
      setPassError(null);
    } else {
      setPassError("Incorrect secure passcode! Please try again.");
    }
  };

  const handleLock = () => {
    setIsUnlocked(false);
    setPasscode("");
    setPassError(null);
  };
  const [driverAssignments, setDriverAssignments] = useState<
    Record<string, { name: string; id: string; phone: string }>
  >({});
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  // OS-specific ngrok styling tab
  const [ngrokOS, setNgrokOS] = useState<"windows" | "mac" | "linux">(
    "windows",
  );

  // Test operator message state
  const [testStatus, setTestStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");
  const [testMessageError, setTestMessageError] = useState<string | null>(null);

  const handleSendTestOperatorMessage = async () => {
    setTestStatus("sending");
    setTestMessageError(null);
    try {
      const pingText =
        `🔔 *Tolo Delivery: Test Dispatch Conduits* 💨\n\n` +
        `This is a live test notification from your Tolo Order System.\n` +
        `• Bot token is correctly aligned!\n` +
        `• Target Operator ID: ${operatorChatId} (@${operatorUsername})\n` +
        `• Timestamp: ${new Date().toLocaleTimeString()}\n\n` +
        `Let's start delivering! 🛵✨`;

      const response = await fetch(
        `https://api.telegram.org/bot${botToken}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: operatorChatId,
            text: pingText,
            parse_mode: "Markdown",
          }),
        },
      );
      const data = await response.json();
      if (data.ok) {
        setTestStatus("success");
      } else {
        setTestStatus("error");
        setTestMessageError(data.description || "Rejected by Telegram API");
      }
    } catch (err) {
      setTestStatus("error");
      setTestMessageError(String(err));
    }
  };

  // Simulation state for payload webhook
  const [simText, setSimText] = useState(
    "I want 2 Cheeseburgers and a Cappuccino",
  );
  const [simStatus, setSimStatus] = useState<"idle" | "testing" | "success">(
    "idle",
  );
  const [simResult, setSimResult] = useState<any>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => {
      setCopiedCmd(null);
    }, 1500);
  };

  const handleSimulateWebhook = async () => {
    setSimStatus("testing");
    setSimResult(null);
    try {
      const response = await fetch("/api/parse-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: simText }),
      });
      const data = await response.json();
      setSimResult(data);
      setSimStatus("success");
    } catch (err) {
      setSimResult({ error: "Failed to access parse route: " + String(err) });
      setSimStatus("success");
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return "bg-yellow-105 text-yellow-805 border-yellow-200";
      case "preparing":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "driving":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "completed":
        return "bg-green-50 text-green-700 border-green-250";
      case "cancelled":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-205";
    }
  };

  return (
    <div
      id="admin-panel"
      className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden h-[620px] flex flex-col font-sans"
    >
      {/* Admin header */}
      <div className="bg-slate-900 text-white p-4 shrink-0 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#E0560B] rounded-lg">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-tight font-sans">
              ቶሎ/Tolo Delivery Kitchen Panel
            </h3>
            <span className="text-[10px] text-slate-400 block font-light font-mono">
              {isUnlocked
                ? "🟢 Active Session / Unlocked"
                : "🔒 Restricted Access"}
            </span>
          </div>
        </div>
        {isUnlocked ? (
          <div className="flex items-center gap-2.5 font-sans">
            <div className="flex gap-1.5 text-xs bg-slate-800 p-1 rounded-lg overflow-x-auto max-w-full">
              <button
                id="tab-orders"
                onClick={() => setActiveTab("orders")}
                className={`py-1.5 px-3 rounded-md transition font-medium whitespace-nowrap cursor-pointer ${activeTab === "orders" ? "bg-[#E0560B] text-white font-bold" : "text-slate-300 hover:text-white"}`}
              >
                Live orders ({orders.length})
              </button>
              <button
                id="tab-metrics"
                onClick={() => setActiveTab("metrics")}
                className={`py-1.5 px-3 rounded-md transition font-medium whitespace-nowrap cursor-pointer ${activeTab === "metrics" ? "bg-[#E0560B] text-white font-bold" : "text-slate-300 hover:text-white"}`}
              >
                Metrics
              </button>
              <button
                id="tab-drivers"
                onClick={() => setActiveTab("drivers")}
                className={`py-1.5 px-3 rounded-md transition font-medium whitespace-nowrap cursor-pointer ${activeTab === "drivers" ? "bg-[#E0560B] text-white font-bold" : "text-slate-300 hover:text-white"}`}
              >
                Drivers ({drivers.length})
              </button>
              <button
                id="tab-bot-setup"
                onClick={() => setActiveTab("bot-setup")}
                className={`py-1.5 px-3 rounded-md transition font-medium whitespace-nowrap cursor-pointer ${activeTab === "bot-setup" ? "bg-[#E0560B] text-white font-semibold" : "text-slate-300 hover:text-white"}`}
              >
                Bot & Ngrok Setup
              </button>
            </div>
            <button
              onClick={handleLock}
              className="p-1.5 bg-slate-800 hover:bg-slate-750 text-rose-450 hover:text-rose-350 border border-slate-700/60 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-bold px-2 shrink-0 h-[28px]"
              title="Lock Console"
            >
              <Lock className="w-3 h-3 text-rose-500" />
              <span>Lock</span>
            </button>
          </div>
        ) : (
          <span className="text-[10px] font-extrabold text-rose-400 uppercase tracking-wider flex items-center gap-1.5 bg-rose-950/40 border border-rose-900/50 px-2.5 py-1.5 rounded-lg h-[28px]">
            <Lock className="w-3.5 h-3.5 text-rose-500 animate-pulse" />{" "}
            Restricted
          </span>
        )}
      </div>

      {/* Main Panel Content Scroll Area */}
      <div
        className={`flex-1 overflow-y-auto ${isUnlocked ? "p-5" : "p-0 bg-slate-50"}`}
      >
        {!isUnlocked ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center font-sans">
            <div className="max-w-xs w-full bg-white border border-slate-205 rounded-2xl p-6 shadow-md space-y-5">
              <div className="mx-auto w-12 h-12 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center text-[#E0560B] shadow-3xs">
                <Lock className="w-5 h-5 text-[#E0560B]" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-sm text-slate-900 tracking-tight text-center">
                  Dispatcher Authorization
                </h4>
                <p className="text-[11px] text-slate-400 leading-normal text-center">
                  Please input the secure access code to load current live
                  telemetry, metrics, and orders.
                </p>
              </div>

              <form onSubmit={handleUnlock} className="space-y-3.5 text-left">
                <div className="space-y-1.5">
                  <label className="text-[9.5px] font-bold text-slate-500 uppercase tracking-widest pl-0.5">
                    Admin Security PIN
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={passcode}
                    onChange={(e) => {
                      setPasscode(e.target.value);
                      if (passError) setPassError(null);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#E0560B] font-mono tracking-widest font-bold text-center"
                    autoFocus
                  />
                  {passError && (
                    <span className="text-[10px] text-rose-600 font-extrabold block mt-1 text-center leading-normal">
                      ⚠️ {passError}
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#E0560B] hover:bg-[#C24103] active:scale-98 text-white font-bold py-2 px-4 rounded-xl text-xs transition shadow-xs hover:shadow flex items-center justify-center gap-1 cursor-pointer font-sans"
                >
                  <Unlock className="w-3.5 h-3.5" /> Confirm Access
                </button>
              </form>
            </div>
          </div>
        ) : (
          <>
            {/* DEBUG PANEL */}
            <div
              id="debug-panel"
              className="mb-4 p-3 bg-slate-900 border border-slate-800 rounded-xl font-mono text-xs text-slate-300"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
                <span className="font-extrabold text-orange-400">
                  🔧 Dispatch Debug Log
                </span>
                <span className="bg-orange-950/60 text-orange-300 px-2.1 py-0.5 rounded border border-orange-855/60 font-bold">
                  Total Orders: {orders.length}
                </span>
              </div>
              {orders.length === 0 ? (
                <p className="text-slate-500 italic text-[10px]">
                  No orders currently stored in application memory.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[100px] overflow-y-auto pr-1">
                  {orders.map((o) => (
                    <div
                      key={o.id}
                      className="bg-slate-950/70 p-2 rounded-lg border border-slate-850 flex flex-col gap-0.5 text-[10.5px]"
                    >
                      <div className="flex justify-between items-center text-slate-450">
                        <span>
                          Order ID:{" "}
                          <span className="text-orange-300 font-bold font-mono">
                            #{o.id}
                          </span>
                        </span>
                        <span className="text-amber-500 font-extrabold uppercase text-[9.5px]">
                          {o.status}
                        </span>
                      </div>
                      <div className="text-slate-400 truncate">
                        Customer Name:{" "}
                        <span className="text-slate-200 font-semibold">
                          {o.customerName || "N/A"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ORDERS TAB */}
            {activeTab === "orders" && (
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Real-Time Kitchen Order Pipeline
                  </h4>
                  <p className="text-xs text-slate-400">
                    Strictly authorized workflow: track deposit receipts, assign
                    drivers, and trigger active tracker maps.
                  </p>
                </div>

                {orders.length === 0 ? (
                  <div className="border border-dashed border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center text-center text-slate-400">
                    <ListOrdered className="w-12 h-12 stroke-1 mb-2.5" />
                    <span className="text-xs font-medium">
                      No system orders placed yet.
                    </span>
                    <span className="text-[10px] mt-0.5">
                      Place an order using the Telegram chat simulator to begin.
                    </span>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* QUEUE 1: PENDING PAYMENT VERIFICATION */}
                    {(() => {
                      const items = orders.filter(
                        (o) => (o.status === "payment_pending") || (o.status === "pending" && !o.isPaymentVerified),
                      );
                      return (
                        <div className="bg-slate-50/75 border border-slate-200 rounded-2xl p-4">
                          <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-2.5 h-2.5 rounded-full bg-amber-500 ${items.length > 0 ? "animate-ping" : ""}`}
                              />
                              <h5 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                                1. Pending Payment Verification ({items.length})
                              </h5>
                            </div>
                            <span className="text-[10px] bg-amber-55 text-amber-700 font-mono font-bold px-2 py-0.5 rounded border border-amber-200 uppercase">
                              Awaiting Verification
                            </span>
                          </div>

                          {items.length === 0 ? (
                            <p className="text-xs text-slate-400 py-2 italic font-sans">
                              No customer receipts are currently awaiting verification.
                            </p>
                          ) : (
                            <div className="space-y-3">
                              {items.map((order) => (
                                <div
                                  key={order.id}
                                  className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-3xs space-y-3"
                                >
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <span className="text-xs font-bold text-[#E0560B] font-mono block">
                                        Order ID: #{order.id}
                                      </span>
                                      <span className="text-[10.5px] text-slate-800 block font-medium mt-1">
                                        👤 Customer:{" "}
                                        <strong>
                                          {order.customerName || "Pending"}
                                        </strong>{" "}
                                        ({order.customerPhone || "N/A"})
                                      </span>
                                    </div>
                                    <div className="text-right">
                                      <span className="text-xs font-bold font-mono text-amber-600 block">
                                        1/3 Hold Dep:{" "}
                                        {order.paymentDetails?.amount.toFixed(
                                          2,
                                        )}{" "}
                                        Birr
                                      </span>
                                      <span className="text-[9.5px] text-slate-400 block mt-0.5">
                                        Total: {order.total.toFixed(2)} Birr
                                      </span>
                                    </div>
                                  </div>

                                  <div className="bg-amber-50/50 border border-amber-200/60 p-2.5 rounded-lg space-y-1.5 text-xs">
                                    <div className="flex justify-between text-amber-900 font-sans font-medium">
                                      <span>Payment Method:</span>
                                      <span className="font-bold">
                                        {order.paymentDetails?.method || "N/A"}
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-amber-900 font-sans">
                                      <span>Transaction Reference / Slip:</span>
                                      <span className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-amber-250/30 text-amber-950">
                                        {order.paymentDetails?.reference ||
                                          "N/A"}
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                                      <span>Submitted Timestamp:</span>
                                      <span>
                                        {order.paymentDetails?.timestamp ||
                                          "N/A"}
                                      </span>
                                    </div>
                                  </div>

                                  {order.paymentDetails?.receiptPhoto && (
                                    <div className="space-y-1 font-sans">
                                      {(() => {
                                        console.log("RECEIPT LENGTH", order.paymentDetails?.receiptPhoto?.length);
                                        console.log("RECEIPT PREFIX", order.paymentDetails?.receiptPhoto?.substring(0,100));
                                        return null;
                                      })()}
                                      <span className="text-[10px] font-bold text-[#E0560B] uppercase tracking-wider block">
                                        📷 Uploaded Proof Receipt (Screenshot):
                                      </span>
                                      <div className="relative border-4 border-red-500 rounded-xl p-2 bg-slate-50 flex justify-center items-center shadow-inner w-full max-w-full">
                                        <img
                                          src={
                                            order.paymentDetails.receiptPhoto
                                          }
                                          alt="Payment proof screenshot"
                                          className="rounded-lg cursor-zoom-in hover:scale-[1.02] transition"
                                          style={{
                                            width: "100%",
                                            maxWidth: "100%",
                                            height: "auto",
                                            objectFit: "contain",
                                          }}
                                          referrerPolicy="no-referrer"
                                          onLoad={(e) => {
                                            const img = e.currentTarget;
                                            console.log("IMG LOAD SUCCESS");
                                            console.log("IMG ELEMENT SRC", img.src);
                                            console.log("IMG NATURAL WIDTH", img.naturalWidth);
                                            console.log("IMG NATURAL HEIGHT", img.naturalHeight);
                                          }}
                                          onError={(e) => {
                                            const img = e.currentTarget;
                                            console.log("IMG LOAD ERROR");
                                            console.log("IMG ELEMENT SRC", img.src);
                                            console.log("IMG NATURAL WIDTH", img.naturalWidth);
                                            console.log("IMG NATURAL HEIGHT", img.naturalHeight);
                                          }}
                                        />
                                      </div>
                                    </div>
                                  )}

                                  <div className="grid grid-cols-2 gap-2.5 border-t border-slate-150 pt-3 mt-3">
                                    <button
                                      onClick={() =>
                                        onCancelActiveOrder(order.id)
                                      }
                                      className="text-[11px] bg-rose-50 hover:bg-rose-100 active:bg-rose-250 text-rose-700 border border-rose-205 font-bold py-2.5 px-3 rounded-xl shadow-3xs transition-all cursor-pointer flex items-center justify-center gap-1.5 font-sans"
                                      id={`btn-reject-${order.id}`}
                                    >
                                      <X className="w-3.5 h-3.5" /> Cancel / Reject Order
                                    </button>
                                    <button
                                      onClick={() => onVerifyPayment(order.id)}
                                      className="text-[11px] bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-850 text-white font-bold py-2.5 px-3 rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 font-sans"
                                      id={`btn-approve-${order.id}`}
                                    >
                                      <Check className="w-3.5 h-3.5 font-bold" /> Approve Order
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* QUEUE 2: AWAITING DRIVER ASSIGNMENT */}
                    {(() => {
                      const items = orders.filter(
                        (o) => o.isPaymentVerified && !o.isDriverAssigned && o.status !== "completed" && o.status !== "cancelled",
                      );
                      return (
                        <div className="bg-slate-50/75 border border-slate-200 rounded-2xl p-4">
                          <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-2.5 h-2.5 rounded-full bg-blue-500 ${items.length > 0 ? "animate-ping" : ""}`}
                              />
                              <h5 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                                2. Awaiting Driver Assignment ({items.length})
                              </h5>
                            </div>
                            <span className="text-[10px] bg-blue-55 text-blue-700 font-mono font-bold px-2 py-0.5 rounded border border-blue-200 uppercase">
                              Rider Assignment
                            </span>
                          </div>

                          {items.length === 0 ? (
                            <p className="text-xs text-slate-400 py-2 italic font-sans">
                              No orders currently awaiting driver assignment.
                            </p>
                          ) : (
                            <div className="space-y-3">
                              {items.map((order) => {
                                const assignState = driverAssignments[
                                  order.id
                                ] || { name: "", id: "", phone: "" };
                                const canSubmit =
                                  assignState.name.trim() !== "" &&
                                  assignState.phone.trim() !== "";

                                return (
                                  <div
                                    key={order.id}
                                    className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-3xs space-y-3"
                                  >
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <span className="text-xs font-bold text-[#E0560B] font-mono">
                                          Order ID: #{order.id}
                                        </span>
                                        <p className="text-[10.5px] text-slate-500 mt-0.5">
                                          Consignee:{" "}
                                          <strong>{order.customerName}</strong>{" "}
                                          • Address: {order.deliveryAddress}
                                        </p>
                                      </div>
                                      <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded font-mono">
                                        Verified ✅
                                      </span>
                                    </div>

                                    {/* Parsed Kitchen Ticket */}
                                    <div className="bg-slate-50 p-2.5 rounded-lg text-xs space-y-1 my-1">
                                      <span className="text-[9px] text-slate-400 font-mono font-bold uppercase tracking-wider block mb-1">
                                        Kitchen items ticket
                                      </span>
                                      {order.items.map((it, i) => (
                                        <div
                                          key={i}
                                          className="flex justify-between font-medium"
                                        >
                                          <span>
                                            {it.quantity}x {it.name}
                                          </span>
                                          <span className="text-slate-400 font-mono">
                                            {it.totalPrice.toFixed(2)} Br
                                          </span>
                                        </div>
                                      ))}
                                    </div>

                                    {/* Form assignment fields */}
                                    <div className="border border-slate-150 p-3 rounded-lg space-y-3 bg-slate-50/30">
                                      <div className="flex justify-between items-center pb-1">
                                        <span className="text-[10.5px] font-bold text-slate-700 uppercase tracking-wide">
                                          Assign Driver:
                                        </span>

                                        {/* Fast Presets button */}
                                        <div className="flex flex-wrap gap-1.5">
                                          <span className="text-[9px] text-slate-400 self-center font-mono">
                                            Presets:
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setDriverAssignments(
                                                (prev) => ({
                                                  ...prev,
                                                  [order.id]: {
                                                    name: "Almaz Demeke",
                                                    id: "DRV-102",
                                                    phone: "0912112233",
                                                  },
                                                }),
                                              );
                                            }}
                                            className="bg-orange-50 hover:bg-orange-100 text-[#E0560B] text-[9px] font-bold px-2 py-0.5 rounded border border-orange-200 transition cursor-pointer"
                                          >
                                            🚴 Almaz
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setDriverAssignments(
                                                (prev) => ({
                                                  ...prev,
                                                  [order.id]: {
                                                    name: "Bekele Abebe",
                                                    id: "DRV-405",
                                                    phone: "0916454545",
                                                  },
                                                }),
                                              );
                                            }}
                                            className="bg-orange-50 hover:bg-orange-100 text-[#E0560B] text-[9px] font-bold px-2 py-0.5 rounded border border-orange-200 transition cursor-pointer"
                                          >
                                            🛵 Bekele
                                          </button>
                                        </div>
                                      </div>

                                      {/* Registered Drivers list select */}
                                      <div className="bg-white p-2 text-xs rounded border border-slate-200 space-y-1">
                                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
                                          Quick Assign Registered Rider
                                        </span>
                                        <select
                                          onChange={(e) => {
                                            const selected = drivers.find(d => d.id === e.target.value);
                                            if (selected) {
                                              setDriverAssignments(
                                                (prev) => ({
                                                  ...prev,
                                                  [order.id]: {
                                                    name: selected.name,
                                                    id: selected.id,
                                                    phone: selected.phone,
                                                  },
                                                }),
                                              );
                                            }
                                          }}
                                          value={assignState.id || ""}
                                          className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 p-1 rounded font-semibold cursor-pointer"
                                        >
                                          <option value="">-- Choose Driver --</option>
                                          {drivers.map((d) => (
                                            <option key={d.id} value={d.id}>
                                              {d.name} ({d.status})
                                            </option>
                                          ))}
                                        </select>
                                      </div>

                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <div>
                                          <label className="text-[10px] text-slate-400 font-bold block mb-1">
                                            Rider Name
                                          </label>
                                          <input
                                            type="text"
                                            placeholder="e.g. Almaz"
                                            value={assignState.name}
                                            onChange={(e) =>
                                              setDriverAssignments(
                                                (prev) => ({
                                                  ...prev,
                                                  [order.id]: {
                                                    ...assignState,
                                                    name: e.target.value,
                                                  },
                                                }),
                                              )
                                            }
                                            className="w-full bg-white border border-slate-200 px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#E0560B] rounded"
                                          />
                                        </div>
                                        <div>
                                          <label className="text-[10px] text-slate-400 font-bold block mb-1">
                                            Rider Phone
                                          </label>
                                          <input
                                            type="text"
                                            placeholder="e.g. +251 091..."
                                            value={assignState.phone}
                                            onChange={(e) =>
                                              setDriverAssignments(
                                                (prev) => ({
                                                  ...prev,
                                                  [order.id]: {
                                                    ...assignState,
                                                    phone: e.target.value,
                                                  },
                                                }),
                                              )
                                            }
                                            className="w-full bg-white border border-slate-200 px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#E0560B] rounded font-mono"
                                          />
                                        </div>
                                      </div>

                                      <div className="flex justify-end pt-1">
                                        <button
                                          type="button"
                                          disabled={!canSubmit}
                                          onClick={() =>
                                            onAssignDriver(
                                              order.id,
                                              assignState,
                                            )
                                          }
                                          className="bg-[#E0560B] hover:bg-[#C24103] disabled:bg-slate-200 disabled:text-slate-400 text-white text-[10px] font-bold px-4 py-1.5 rounded transition cursor-pointer"
                                        >
                                          🚖 Assign & Notify Driver
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* QUEUE 3: DRIVER ACCEPTED / PREPARING */}
                    {(() => {
                      const items = orders.filter(
                        (o) => o.isPaymentVerified && o.isDriverAssigned && (o.status === "driver_accepted" || o.status === "preparing" || o.status === "pending"),
                      );
                      return (
                        <div className="bg-slate-50/75 border border-slate-200 rounded-2xl p-4">
                          <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-2.5 h-2.5 rounded-full bg-emerald-500 ${items.length > 0 ? "animate-ping" : ""}`}
                              />
                              <h5 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                                3. Driver Accepted / Preparing ({items.length})
                              </h5>
                            </div>
                            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-mono font-bold px-2 py-0.5 rounded border border-emerald-200 uppercase">
                              Food Prep / Accepted
                            </span>
                          </div>

                          {items.length === 0 ? (
                            <p className="text-xs text-slate-400 py-2 italic font-sans">
                              No orders in preparing or driver accepted stage.
                            </p>
                          ) : (
                            <div className="space-y-3">
                              {items.map((order) => (
                                <div
                                  key={order.id}
                                  className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-3xs space-y-3"
                                >
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <span className="text-xs font-bold text-[#E0560B] font-mono">
                                        Order ID: #{order.id}
                                      </span>
                                      <p className="text-[10.5px] text-slate-500 mt-0.5">
                                        Consignee:{" "}
                                        <strong>{order.customerName}</strong>{" "}
                                        • Address: {order.deliveryAddress}
                                      </p>
                                    </div>
                                    <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded font-mono">
                                      {order.status}
                                    </span>
                                  </div>

                                  <div className="bg-orange-50/50 border border-orange-200/30 rounded-lg p-3 space-y-2 text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                    <div>
                                      <span className="text-[10px] text-[#E0560B] block uppercase font-mono font-bold">
                                        Assigned delivery partner:
                                      </span>
                                      <span className="text-slate-800 font-bold font-sans text-xs">
                                        {order.driverName}
                                        {order.driverId
                                          ? ` (ID: ${order.driverId})`
                                          : ""}
                                      </span>
                                      <span className="text-slate-500 block font-mono text-[11px]">
                                        {order.driverPhone}
                                      </span>
                                    </div>
                                    <div className="shrink-0 mt-2 sm:mt-0">
                                      {!order.isDriverAccepted ? (
                                        <button
                                          onClick={() =>
                                            onDriverAccept(order.id)
                                          }
                                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-3 py-1.5 rounded transition cursor-pointer flex items-center gap-1 animate-pulse"
                                        >
                                          🛵 Simulated Driver: Accept Delivery Ticket
                                        </button>
                                      ) : (
                                        <span className="text-emerald-700 font-bold text-[11px] flex items-center gap-1 font-mono uppercase bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                                          ● Ticket Accepted
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* QUEUE 4: IN TRANSIT */}
                    {(() => {
                      const items = orders.filter(
                        (o) => o.status === "driving",
                      );
                      return (
                        <div className="bg-slate-50/75 border border-slate-200 rounded-2xl p-4">
                          <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-2.5 h-2.5 rounded-full bg-[#E0560B] ${items.length > 0 ? "animate-ping" : ""}`}
                              />
                              <h5 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                                4. In Transit ({items.length})
                              </h5>
                            </div>
                            <span className="text-[10px] bg-orange-50 text-[#E0560B] font-mono font-bold px-2 py-0.5 rounded border border-orange-200 uppercase">
                              GPS Transit
                            </span>
                          </div>

                          {items.length === 0 ? (
                            <p
                              className="text-xs text-slate-400 py-2 italic font-sans"
                              id="no-active-deliveries"
                            >
                              No coordinates currently in transit on the map.
                            </p>
                          ) : (
                            <div className="space-y-3">
                              {items.map((order) => (
                                <div
                                  key={order.id}
                                  className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-3xs space-y-2"
                                >
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <span className="text-xs font-bold text-[#E0560B] font-mono">
                                        Order ID: #{order.id}
                                      </span>
                                      <p className="text-[10.5px] text-slate-500 mt-0.5">
                                        Dest:{" "}
                                        <strong>{order.deliveryAddress}</strong>
                                      </p>
                                    </div>
                                    <span className="text-xs font-bold text-slate-800 font-mono">
                                      {Math.round(order.progress)}% Progress
                                    </span>
                                  </div>

                                  {/* Progress bar info */}
                                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                                    <div
                                      className="bg-[#E0560B] h-full transition-all duration-300"
                                      style={{ width: `${order.progress}%` }}
                                    />
                                  </div>

                                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-slate-650 pt-1 border-t border-slate-100/50">
                                    <span className="font-sans">
                                      Driver:{" "}
                                      <strong className="text-slate-850 font-bold">
                                        {order.driverName}
                                      </strong>{" "}
                                      ({order.driverPhone})
                                    </span>
                                    <span className="text-[11px] text-[#E0560B] font-bold uppercase tracking-wider font-mono bg-orange-50 px-2 py-0.5 rounded mt-1 sm:mt-0">
                                      {order.status} stage
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* QUEUE 5: COMPLETED */}
                    {(() => {
                      const items = orders.filter(
                        (o) =>
                          o.status === "completed" || o.status === "cancelled",
                      );
                      return (
                        <div className="bg-slate-50/75 border border-slate-200 rounded-2xl p-4">
                          <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                              <h5 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                                5. Completed / Archived ({items.length})
                              </h5>
                            </div>
                            <span className="text-[10px] bg-slate-100 text-slate-600 font-mono font-bold px-2 py-0.5 rounded border border-slate-200 uppercase">
                              Archive Log
                            </span>
                          </div>

                          {items.length === 0 ? (
                            <p className="text-xs text-slate-400 py-2 italic font-sans">
                              Kitchen archival log is empty.
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {items.map((order) => (
                                <div
                                  key={order.id}
                                  className="bg-white border border-slate-150 rounded-xl px-3 py-2 text-xs flex justify-between items-center bg-slate-50/30"
                                >
                                  <div>
                                    <span className="font-mono font-bold text-slate-650">
                                      #{order.id}
                                    </span>
                                    <span className="text-slate-500 font-sans ml-2">
                                      {order.customerName}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 font-mono">
                                    <span className="text-slate-500">
                                      {order.total.toFixed(2)} Br
                                    </span>
                                    <span
                                      className={`text-[9.5px] font-bold uppercase py-0.5 px-2 rounded-full border ${getStatusColor(order.status)}`}
                                    >
                                      {order.status}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}

            {/* METRICS TAB */}
            {activeTab === "metrics" && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Small City Bot Performance Metrics
                  </h4>
                  <p className="text-xs text-slate-400">
                    Real-world projection based on replacing classic multi-level
                    visual menus with natural text ordering.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-4">
                  <div className="bg-gradient-to-br from-orange-50/30 to-orange-100/40 border border-orange-200 rounded-xl p-4 flex flex-col justify-between">
                    <div>
                      <Clock className="w-5 h-5 text-[#E0560B] mb-2" />
                      <span className="text-[11px] text-[#E0560B] block uppercase font-mono font-bold tracking-wider">
                        Average Choice Speed
                      </span>
                      <p className="text-2xl font-bold text-slate-900 font-mono mt-1">
                        18 Secs
                      </p>
                    </div>
                    <span className="text-[10px] text-[#E0560B] block mt-2.5 font-medium">
                      ✨ -84% vs classic visual scroll grids
                    </span>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4 flex flex-col justify-between">
                    <div>
                      <DollarSign className="w-5 h-5 text-green-700 mb-2" />
                      <span className="text-[11px] text-green-600 block uppercase font-mono font-bold tracking-wider">
                        Conversion rate
                      </span>
                      <p className="text-2xl font-bold text-green-950 font-mono mt-1">
                        +42% Up
                      </p>
                    </div>
                    <span className="text-[10px] text-green-600 block mt-2.5 font-medium">
                      🚀 Fast, direct intent prevents checkout leaks
                    </span>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4 flex flex-col justify-between">
                    <div>
                      <Sparkles className="w-5 h-5 text-purple-700 mb-2" />
                      <span className="text-[11px] text-purple-600 block uppercase font-mono font-bold tracking-wider">
                        Bot Parsing Precision
                      </span>
                      <p className="text-2xl font-bold text-purple-950 font-mono mt-1">
                        98.4% Acc
                      </p>
                    </div>
                    <span className="text-[10px] text-purple-600 block mt-2.5 font-medium font-medium">
                      ⚡ Supported via Gemini 3.5-Flash model
                    </span>
                  </div>
                </div>

                {/* Strategic Entrepreneur Advice */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mt-4">
                  <span className="font-bold text-xs text-slate-800 block mb-1">
                    💡 Smart Entrepreneur Tip for Small Cities
                  </span>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    In smaller cities (under 100k population), customer
                    relationships thrive on personal proximity. Classic food
                    delivery apps feel dry. Giving the user the freedom to
                    &ldquo;just type&rdquo; resembles talking directly to a
                    local shop teller, ensuring unparalleled retention and
                    supreme simplicity for elderly or tech-averse locals!
                  </p>
                </div>
              </div>
            )}

            {/* DRIVERS MANAGEMENT TAB */}
            {activeTab === "drivers" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <Bike className="w-4 h-4 text-[#E0560B]" />
                      Driver Directory & Performance Portal
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Register dispatch partners, manage shift availability, configure motorcycle assets, and track payouts (40% client delivery fee).
                    </p>
                  </div>
                  <div className="flex gap-4 font-mono text-xs">
                    <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-center">
                      <span className="text-[10px] text-slate-400 block font-sans">Active Fleet</span>
                      <strong className="text-slate-800 text-sm">
                        {drivers.filter(d => d.status !== "Offline").length} / {drivers.length}
                      </strong>
                    </div>
                    <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-center">
                      <span className="text-[10px] text-slate-400 block font-sans">Paid Fleet Cut</span>
                      <strong className="text-[#E0560B] text-sm">
                        {drivers.reduce((acc, d) => acc + d.totalEarnings, 0).toFixed(0)} Br
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* LEFT: Driver Register Form */}
                  <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-4 space-y-4 shadow-sm self-start">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block border-b border-slate-100 pb-2">
                      🆕 Register New Fleet Partner
                    </span>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const form = e.currentTarget;
                        const data = new FormData(form);
                        const name = data.get("name") as string;
                        const phone = data.get("phone") as string;
                        const customId = data.get("driverId") as string;
                        const plate = data.get("plate") as string;

                        if (!name || !phone || !plate) {
                          alert("Please fill in Name, Phone, and Plate number.");
                          return;
                        }

                        const driverId = customId.trim() || "DRV-" + Math.floor(100 + Math.random() * 900);
                        if (drivers.some(d => d.id === driverId)) {
                          alert(`A driver with ID ${driverId} already exists.`);
                          return;
                        }

                        const newDriver: Driver = {
                          id: driverId,
                          name,
                          phone,
                          plateNumber: plate,
                          status: "Online" as const,
                          totalEarnings: 0,
                          todayEarnings: 0,
                          totalDeliveries: 0,
                          earningsHistory: []
                        };

                        onUpdateDrivers([...drivers, newDriver]);
                        form.reset();
                      }}
                      className="space-y-3"
                    >
                      <div>
                        <label className="text-[10px] text-slate-400 font-bold block mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          required
                          placeholder="e.g. Samuel Kebede"
                          className="w-full bg-slate-50 border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#E0560B] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 font-bold block mb-1">
                          Phone Number *
                        </label>
                        <input
                          type="text"
                          name="phone"
                          required
                          placeholder="e.g. 0912345678"
                          className="w-full bg-slate-50 border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#E0560B] rounded-lg font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 font-bold block mb-1">
                          Motorcycle License Plate *
                        </label>
                        <input
                          type="text"
                          name="plate"
                          required
                          placeholder="e.g. AA 3-A9876"
                          className="w-full bg-slate-50 border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#E0560B] rounded-lg font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 font-bold block mb-1">
                          Driver ID (Optional - Auto-generated if empty)
                        </label>
                        <input
                          type="text"
                          name="driverId"
                          placeholder="e.g. DRV-808"
                          className="w-full bg-slate-50 border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#E0560B] rounded-lg font-mono"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-[#E0560B] hover:bg-[#9A3412] text-white rounded-xl py-2 px-4 text-xs font-bold font-sans cursor-pointer transition text-center"
                      >
                        Add Rider to Fleet
                      </button>
                    </form>
                  </div>

                  {/* RIGHT: Driver Accounts Directory & Assigned Orders */}
                  <div className="lg:col-span-8 space-y-4">
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                          Registered Dispatch Partners
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Count: {drivers.length}
                        </span>
                      </div>
                      <div className="divide-y divide-slate-150 overflow-x-auto">
                        {drivers.length === 0 ? (
                          <div className="p-8 text-center text-slate-400 text-xs">
                            No registered drivers in your dispatch fleet yet. Use the form to enroll one.
                          </div>
                        ) : (
                          drivers.map((d) => {
                            const activeOrder = orders.find(
                              (o) =>
                                o.driverId === d.id &&
                                (o.status === "driver_accepted" ||
                                  o.status === "preparing" ||
                                  o.status === "driving"),
                            );

                            return (
                              <div key={d.id} className="p-4 hover:bg-slate-50/40 transition">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                  {/* Info */}
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-slate-800 text-xs sm:text-sm">
                                        {d.name}
                                      </span>
                                      <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded border border-slate-200 font-mono">
                                        ID: {d.id}
                                      </span>
                                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                        d.status === "Busy"
                                          ? "bg-rose-50 text-rose-600 border border-rose-100"
                                          : d.status === "Online"
                                            ? "bg-green-50 text-green-600 border border-green-100"
                                            : "bg-slate-100 text-slate-500 border border-slate-200"
                                      }`}>
                                        ● {d.status}
                                      </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[11px] text-slate-500">
                                      <span>📞 <strong>{d.phone}</strong></span>
                                      <span>🏍️ Plate: <strong>{d.plateNumber}</strong></span>
                                    </div>
                                  </div>

                                  {/* Actions */}
                                  <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
                                    <button
                                      onClick={() => {
                                        const updated = drivers.map((driver) => {
                                          if (driver.id === d.id) {
                                            const newStatus: "Online" | "Offline" | "Busy" = driver.status === "Offline" ? "Online" : "Offline";
                                            return { ...driver, status: newStatus };
                                          }
                                          return driver;
                                        });
                                        onUpdateDrivers(updated);
                                      }}
                                      disabled={d.status === "Busy"}
                                      className={`px-3 py-1 rounded text-[10px] font-bold transition cursor-pointer shrink-0 ${
                                        d.status === "Offline"
                                          ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200"
                                          : "bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200"
                                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                      {d.status === "Offline" ? "Go Online" : "Go Offline"}
                                    </button>

                                    <button
                                      onClick={() => {
                                        const proceed = confirm(`Are you sure you want to remove ${d.name} from the fleet?`);
                                        if (proceed) {
                                          onUpdateDrivers(drivers.filter(drv => drv.id !== d.id));
                                        }
                                      }}
                                      className="px-2 py-1 text-slate-400 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 rounded text-[10px] font-bold transition shrink-0 cursor-pointer"
                                      title="Remove Driver"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>

                                {/* Active Job */}
                                {activeOrder && (
                                  <div className="mt-2.5 bg-amber-50/50 border border-amber-200 rounded-lg p-2.5 flex justify-between items-center text-xs">
                                    <div className="flex items-center gap-2">
                                      <span className="animate-pulse w-2 h-2 rounded-full bg-amber-500" />
                                      <span className="text-slate-600 font-medium">
                                        Transporting Order <strong>#{activeOrder.id}</strong>
                                      </span>
                                      <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded uppercase tracking-wider font-mono">
                                        {activeOrder.status}
                                      </span>
                                    </div>
                                    <span className="text-[11px] text-slate-500 font-medium">
                                      Handoff Fee: {activeOrder.deliveryFee} Br (Cut: {(activeOrder.deliveryFee * 0.40).toFixed(0)} Br)
                                    </span>
                                  </div>
                                )}

                                {/* Earnings stats metrics row */}
                                <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 border-t border-slate-100 pt-2.5 font-mono text-[10.5px]">
                                  <div className="bg-slate-50/50 p-1.5 rounded text-center">
                                    <span className="text-[9px] text-slate-400 font-sans block">Today's Cut</span>
                                    <strong className="text-slate-700">{d.todayEarnings.toFixed(0)} Br</strong>
                                  </div>
                                  <div className="bg-slate-50/50 p-1.5 rounded text-center">
                                    <span className="text-[9px] text-slate-400 font-sans block">Total Cut</span>
                                    <strong className="text-[#E0560B]">{d.totalEarnings.toFixed(0)} Br</strong>
                                  </div>
                                  <div className="bg-slate-50/50 p-1.5 rounded text-center">
                                    <span className="text-[9px] text-slate-400 font-sans block">Total Deliveries</span>
                                    <strong className="text-slate-700">{d.totalDeliveries} trips</strong>
                                  </div>
                                  <div className="bg-slate-50/50 p-1.5 rounded text-center">
                                    <span className="text-[9px] text-slate-400 font-sans block">Avg Cut / Trip</span>
                                    <strong className="text-slate-700">
                                      {d.totalDeliveries > 0
                                        ? (d.totalEarnings / d.totalDeliveries).toFixed(0)
                                        : 0} Br
                                    </strong>
                                  </div>
                                </div>

                                {/* Earnings Ledger Details */}
                                {d.earningsHistory.length > 0 && (
                                  <div className="mt-2 text-[10px] text-slate-400 bg-slate-50/30 rounded p-2">
                                    <span className="font-semibold text-slate-500 uppercase tracking-wide text-[9px] block mb-1">
                                      📜 Dispatch Earnings Log ({d.earningsHistory.length}):
                                    </span>
                                    <div className="max-h-[80px] overflow-y-auto space-y-1 font-mono">
                                      {d.earningsHistory.map((h, hidx) => (
                                        <div key={hidx} className="flex justify-between items-center border-b border-dashed border-slate-100 pb-0.5">
                                          <span>Trip #{h.orderId} - Fee {h.deliveryFee} Br (Cut 40%)</span>
                                          <span className="text-[#E0560B] font-bold">+{h.amount.toFixed(0)} Br</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TELEGRAM BOT & NGROK SETUP TAB */}
            {activeTab === "bot-setup" && (
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Telegram Bot & Ngrok Local Tunnel Setup
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Connect your real Telegram Bot directly to this backend
                    using Secure Dev Tunnels (ngrok) or our direct Cloud Run URL
                    structure.
                  </p>
                </div>

                {/* OPERATOR NOTIFICATION CONDUIT SETTINGS */}
                <div className="bg-slate-900 text-slate-100 rounded-xl p-4.5 space-y-4 shadow-md border border-slate-850">
                  <span className="text-[11px] uppercase tracking-wider text-emerald-400 font-bold block flex items-center gap-1.5 font-mono">
                    📞 2. Live Operator Notification Settings
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    Configure which operator the Telegram bot notifies when
                    customers verify their advance Birr payment. By default,
                    notifications route to the requested system:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400 block font-mono">
                        Operator Telegram Chat ID
                      </label>
                      <input
                        type="text"
                        value={operatorChatId}
                        onChange={(e) => setOperatorChatId(e.target.value)}
                        placeholder="e.g. 7596617846"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400 block font-mono">
                        Operator Username / Name Link
                      </label>
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
                      <span className="font-semibold text-slate-200">
                        Test operator routing configuration:
                      </span>
                      <button
                        type="button"
                        onClick={handleSendTestOperatorMessage}
                        disabled={testStatus === "sending"}
                        className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-lg font-bold px-3 py-1 font-sans cursor-pointer transition text-[10.5px] disabled:opacity-50"
                      >
                        {testStatus === "sending"
                          ? "Transmitting test ping..."
                          : "⚡ Send Instant Test Ping"}
                      </button>
                    </div>

                    {testStatus === "success" && (
                      <p className="text-emerald-450 font-medium font-sans animate-fade-in text-xs">
                        ✅ Test ping dispatched successfully! Check Telegram
                        user {operatorUsername} ({operatorChatId}) for the
                        incoming message.
                      </p>
                    )}
                    {testStatus === "error" && (
                      <p className="text-rose-400 font-medium font-sans animate-fade-in text-xs">
                        ❌ Telegram Bot error:{" "}
                        {testMessageError || "Failed to reach endpoint."}.
                        Ensure your Bot Token is correct and that the operator
                        has pressed /start on the bot first.
                      </p>
                    )}
                  </div>
                </div>

                {/* TUNNEL SELECTION CARD */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
                  <span className="text-[11px] uppercase tracking-wider text-[#E0560B] font-bold block">
                    1. Select Delivery Webhook Host Type
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setTunnelType("workspace")}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition ${tunnelType === "workspace" ? "bg-white border-orange-500 shadow-sm ring-1 ring-[#E0560B]/10" : "bg-slate-50/50 hover:bg-slate-50 border-slate-200"}`}
                    >
                      <div className="flex items-center gap-2">
                        <Globe
                          className={`w-4 h-4 ${tunnelType === "workspace" ? "text-[#E0560B]" : "text-slate-400"}`}
                        />
                        <span className="font-bold text-xs text-slate-800">
                          Direct Public Preview URL
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">
                        Use our secure, always-on Cloud Run development URL
                        directly. No tunnel utility installation needed!
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTunnelType("ngrok")}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition ${tunnelType === "ngrok" ? "bg-white border-orange-500 shadow-sm ring-1 ring-[#E0560B]/10" : "bg-slate-50/50 hover:bg-slate-50 border-slate-200"}`}
                    >
                      <div className="flex items-center gap-2">
                        <Terminal
                          className={`w-4 h-4 ${tunnelType === "ngrok" ? "text-[#E0560B]" : "text-slate-400"}`}
                        />
                        <span className="font-bold text-xs text-slate-800">
                          Ngrok Local Tunnel
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">
                        Perfect if you download/export this workspace to run on
                        your local computer via <code>npm run dev</code> on port
                        3000.
                      </p>
                    </button>
                  </div>

                  {/* INPUT CONTROLS */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1">
                      <label className="text-[10.5px] font-bold text-slate-700 block">
                        Telegram Bot Token (from @BotFather)
                      </label>
                      <input
                        type="text"
                        value={botToken}
                        onChange={(e) => setBotToken(e.target.value)}
                        placeholder="e.g. 8139963672:AAEl_yourTokenHere"
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-[#E0560B]"
                      />
                    </div>

                    {tunnelType === "ngrok" ? (
                      <div className="space-y-1">
                        <label className="text-[10.5px] font-bold text-slate-700 block">
                          Your Custom Ngrok URL
                        </label>
                        <input
                          type="text"
                          value={customTunnelUrl}
                          onChange={(e) => setCustomTunnelUrl(e.target.value)}
                          placeholder="e.g. https://xxxx-yy-zz.ngrok-free.app"
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-[#E0560B]"
                        />
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <label className="text-[10.5px] font-bold text-slate-450 block">
                          Current Public App Domain (Read Only)
                        </label>
                        <div className="bg-slate-100 border border-slate-200 rounded-lg px-3 py-1 text-xs font-mono text-slate-500 select-all truncate">
                          {typeof window !== "undefined"
                            ? window.location.origin
                            : "https://ais-dev-o3dqdf3222mogm3qode6kb-813996367247.europe-west2.run.app"}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* INTEGRATION GUIDE CARDS */}
                <div className="space-y-4">
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block">
                    3. Integration Actions
                  </span>

                  {/* STEP A: RUN NGROK WITH SEAMLESS CROSS-PLATFORM SUB-TABS */}
                  {tunnelType === "ngrok" && (
                    <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
                      <div className="flex flex-wrap justify-between items-center gap-2">
                        <span className="text-xs font-semibold text-slate-850 flex items-center gap-1.5">
                          <span className="w-5 h-5 bg-orange-50 text-[#E0560B] rounded-full flex items-center justify-center font-bold text-[10px]">
                            A
                          </span>
                          Install & Launch Ngrok Tunnel:
                        </span>
                        {/* OS sub-tabs */}
                        <div className="flex bg-slate-100 p-0.5 rounded-lg text-[10.5px] font-semibold border border-slate-200 font-sans">
                          <button
                            onClick={() => setNgrokOS("windows")}
                            className={`px-2.5 py-1 rounded-md cursor-pointer transition ${ngrokOS === "windows" ? "bg-white text-[#9A3412] shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
                          >
                            🪟 Windows
                          </button>
                          <button
                            onClick={() => setNgrokOS("mac")}
                            className={`px-2.5 py-1 rounded-md cursor-pointer transition ${ngrokOS === "mac" ? "bg-white text-[#9A3412] shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
                          >
                            🍎 macOS
                          </button>
                          <button
                            onClick={() => setNgrokOS("linux")}
                            className={`px-2.5 py-1 rounded-md cursor-pointer transition ${ngrokOS === "linux" ? "bg-white text-[#9A3412] shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
                          >
                            🐧 Linux
                          </button>
                        </div>
                      </div>

                      {ngrokOS === "windows" && (
                        <div className="space-y-2">
                          <p className="text-[11px] text-slate-600">
                            Download ngrok and fire inside PowerShell:
                          </p>
                          <div className="bg-slate-950 text-slate-100 rounded-lg p-3 font-mono text-[11px] relative flex justify-between items-center">
                            <div>
                              <span className="text-blue-400">choco</span>{" "}
                              install ngrok{" "}
                              <span className="text-slate-450">&amp;&amp;</span>{" "}
                              ngrok http 3000
                            </div>
                            <button
                              onClick={() =>
                                handleCopy(
                                  "choco install ngrok && ngrok http 3000",
                                  "ngrok-win",
                                )
                              }
                              className="p-1 px-2.5 text-slate-400 hover:text-white rounded bg-slate-800 border border-slate-700 text-[10px]"
                            >
                              {copiedCmd === "ngrok-win" ? "Copied" : "Copy"}
                            </button>
                          </div>
                        </div>
                      )}

                      {ngrokOS === "mac" && (
                        <div className="space-y-2">
                          <p className="text-[11px] text-slate-600">
                            Install quickly using Homebrew:
                          </p>
                          <div className="bg-slate-950 text-slate-100 rounded-lg p-3 font-mono text-[11px] relative flex justify-between items-center">
                            <div>
                              <span className="text-blue-400">brew</span>{" "}
                              install ngrok/ngrok/ngrok{" "}
                              <span className="text-slate-450">&amp;&amp;</span>{" "}
                              ngrok http 3000
                            </div>
                            <button
                              onClick={() =>
                                handleCopy(
                                  "brew install ngrok/ngrok/ngrok && ngrok http 3000",
                                  "ngrok-mac",
                                )
                              }
                              className="p-1 px-2.5 text-slate-400 hover:text-white rounded bg-slate-800 border border-slate-700 text-[10px]"
                            >
                              {copiedCmd === "ngrok-mac" ? "Copied" : "Copy"}
                            </button>
                          </div>
                        </div>
                      )}

                      {ngrokOS === "linux" && (
                        <div className="space-y-2">
                          <p className="text-[11px] text-slate-600">
                            Using standard curl installer:
                          </p>
                          <div className="bg-slate-950 text-slate-100 rounded-lg p-3 font-mono text-[11px] relative flex justify-between items-center">
                            <div className="truncate max-w-[80%]">
                              curl -s
                              https://ngrok-agent.s3.amazonaws.com/ngrok.asc |
                              sudo tee /etc/apt/trusted.gpg.d/ngrok.asc
                              &gt;/dev/null
                            </div>
                            <button
                              onClick={() =>
                                handleCopy(
                                  'curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null && echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.dir/ngrok.list && sudo apt update && sudo apt install ngrok && ngrok http 3000',
                                  "ngrok-linux",
                                )
                              }
                              className="p-1 px-2.5 text-slate-400 hover:text-white rounded bg-slate-800 border border-slate-700 text-[10px]"
                            >
                              {copiedCmd === "ngrok-linux" ? "Copied" : "Copy"}
                            </button>
                          </div>
                        </div>
                      )}

                      <p className="text-[10.5px] text-slate-500 leading-snug">
                        Once active, paste the generated secure HTTPS URL (e.g.{" "}
                        <code>https://your-tunnel.ngrok-free.app</code>) into
                        the field above to align style assets and telemetry
                        webhooks correctly.
                      </p>
                    </div>
                  )}

                  {/* STEP B: REGISTER WEBHOOK COMMANDS */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
                    <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                      <span className="w-5 h-5 bg-orange-50 text-[#E0560B] rounded-full flex items-center justify-center font-bold text-[10px]">
                        {tunnelType === "ngrok" ? "B" : "A"}
                      </span>
                      Register Webhook / Web URL callback on Telegram Server:
                    </span>

                    {/* Generated curl command */}
                    <div className="bg-slate-950 text-slate-100 rounded-lg p-3 font-mono text-[11px] relative flex flex-col gap-2">
                      <div className="flex justify-between items-center text-slate-400 text-[10px] border-b border-slate-800 pb-1.5 mb-11">
                        <span>GENERATE UNIX CURL CODE STATEMENT</span>
                        <button
                          onClick={() =>
                            handleCopy(
                              `curl -s -X POST "https://api.telegram.org/bot${botToken}/setWebhook?url=${tunnelType === "workspace" ? (typeof window !== "undefined" ? window.location.origin : "") : customTunnelUrl || "https://xxxx.ngrok-free.app"}/api/parse-order"`,
                              "curl",
                            )
                          }
                          className="p-1 px-2 text-slate-400 hover:text-white rounded transition bg-slate-800 border border-slate-700 flex items-center gap-1 cursor-pointer"
                        >
                          {copiedCmd === "curl" ? (
                            <Check className="w-3 h-3 text-green-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span className="text-[9px] font-sans font-medium">
                            {copiedCmd === "curl"
                              ? "Copied!"
                              : "Copy Shell Command"}
                          </span>
                        </button>
                      </div>
                      <p className="text-slate-350 break-all font-mono text-[10.5px] leading-relaxed">
                        curl -s -X POST &quot;https://api.telegram.org/bot
                        <strong className="text-sky-300 font-bold">
                          {botToken}
                        </strong>
                        /setWebhook?url=
                        <strong className="text-emerald-400 font-bold">
                          {tunnelType === "workspace"
                            ? typeof window !== "undefined"
                              ? window.location.origin
                              : "https://dev-url"
                            : customTunnelUrl || "https://xxxx.ngrok-free.app"}
                        </strong>
                        /api/parse-order&quot;
                      </p>
                    </div>
                    <p className="text-[10.5px] text-slate-500 leading-snug">
                      Fire this command in your Unix terminal or standard
                      command prompt to inform Telegram where to submit text
                      order updates.
                    </p>
                  </div>

                  {/* STEP C: TELEGRAM BOTMENUBUTTON CONFIG */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
                    <span className="text-xs font-semibold text-slate-805 flex items-center gap-1.5">
                      <span className="w-5 h-5 bg-orange-50 text-[#E0560B] rounded-full flex items-center justify-center font-bold text-[10px]">
                        {tunnelType === "ngrok" ? "C" : "B"}
                      </span>
                      Set WebApp Keyboard Launcher URL in BotFather:
                    </span>

                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs leading-relaxed space-y-2 text-slate-600">
                      <p>
                        1. Open{" "}
                        <a
                          href="https://t.me/BotFather"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#E0560B] font-semibold underline inline-flex items-center gap-0.5"
                        >
                          @BotFather
                          <ExternalLink className="w-3 h-3 inline" />
                        </a>{" "}
                        inside Telegram.
                      </p>
                      <p>
                        2. Send <strong>/newapp</strong> to create a new Mini
                        App connected to your bot.
                      </p>
                      <p>
                        3. When asked for the <strong>Web App URL</strong>, copy
                        and paste this exact link:
                      </p>
                      <div className="bg-white border border-slate-200 p-2 text-slate-800 font-mono text-xs rounded flex justify-between items-center bg-white shadow-sm">
                        <span className="font-bold text-[#E0560B] truncate">
                          {tunnelType === "workspace"
                            ? typeof window !== "undefined"
                              ? window.location.origin
                              : "https://dev-url"
                            : customTunnelUrl || "https://xxxx.ngrok-free.app"}
                        </span>
                        <button
                          onClick={() =>
                            handleCopy(
                              tunnelType === "workspace"
                                ? typeof window !== "undefined"
                                  ? window.location.origin
                                  : "https://dev-url"
                                : customTunnelUrl ||
                                    "https://xxxx.ngrok-free.app",
                              "webappUrl",
                            )
                          }
                          className="p-1 px-2.5 text-[10px] text-[#9A3412] bg-orange-50 hover:bg-orange-100 rounded transition font-bold font-sans cursor-pointer flex items-center gap-1 shrink-0"
                        >
                          {copiedCmd === "webappUrl"
                            ? "Copied!"
                            : "Copy Launch Link"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* INTERACTIVE SIMULATOR WEBHOOK PAYLOAD DEBUGGER */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <span className="text-[11px] uppercase tracking-wider text-[#E0560B] font-bold block flex items-center gap-1">
                    <Terminal className="w-3.5 h-3.5 text-[#E0560B]" /> Webhook
                    Payload Simulation Debugger
                  </span>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Test how the backend server processes incoming webhook
                    messages from your ngrok tunnel locally.
                  </p>

                  <div className="space-y-2">
                    <textarea
                      value={simText}
                      onChange={(e) => setSimText(e.target.value)}
                      placeholder="Enter sample telegram message..."
                      className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 font-sans focus:outline-none focus:ring-1 focus:ring-[#E0560B]"
                      rows={2}
                    />

                    <button
                      type="button"
                      onClick={handleSimulateWebhook}
                      disabled={simStatus === "testing" || !simText.trim()}
                      className="bg-[#E0560B] hover:bg-[#9A3412] text-white rounded-xl py-2 px-4 text-xs font-bold font-sans cursor-pointer transition disabled:opacity-50 block w-full text-center"
                    >
                      {simStatus === "testing"
                        ? "Transmitting mock webhook..."
                        : "Simulate Incoming Telegram Webhook JSON POST"}
                    </button>
                  </div>

                  {simResult && (
                    <div className="space-y-1.5 animate-fade-in">
                      <span className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider font-bold">
                        TELEGRAM API WEBHOOK SERVER WEB RESPONSE ACTION (JSON):
                      </span>
                      <div className="bg-slate-950 text-emerald-450 rounded-lg p-3 font-mono text-[10px] max-h-[160px] overflow-y-auto">
                        <pre>{JSON.stringify(simResult, null, 2)}</pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
