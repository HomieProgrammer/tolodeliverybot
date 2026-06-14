import React from 'react';
import { Lightbulb, CheckCircle2, MessageSquareCode, Route } from 'lucide-react';

interface ExplanationAlertProps {
  onAutoPlaceOrder: (text: string) => void;
}

export default function ExplanationAlert({ onAutoPlaceOrder }: ExplanationAlertProps) {
  const suggestions = [
    "I want 2 Pepperoni Pizzas and one fresh Orange Juice please!",
    "Can you bring me a cheeseburger with extra cheese, french fries and a can of coke, no onions",
    "Hey! Give me one Spicy Chicken Wrap, cappucino, and a waffle",
  ];

  return (
    <div id="explanation-card" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
          <Lightbulb className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">ቶሎ | Tollo Delivery: Telegram-Style Delivery Bot</h2>
          <p className="text-sm text-slate-500 mt-1 max-w-4xl">
            This prototype simulates a **"Just Write It"** style bot. Instead of endless button-clicking or scrolling through long menu interfaces, users simply text their orders naturally or use our smart express panel. Our integrated server-side **Gemini AI model** instantly translates their text into structured kitchen tickets, matches available foods, and issues an active **real-time order tracker**.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="flex items-start gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
          <MessageSquareCode className="w-5 h-5 text-indigo-500 mt-0.5 shrink-0" />
          <div>
            <span className="font-semibold text-xs text-slate-700 block">1. Natural Order Processing</span>
            <span className="text-xs text-slate-500 leading-snug">Gemini reads raw text (e.g., typos, quantities, minus items) and outputs JSON.</span>
          </div>
        </div>

        <div className="flex items-start gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
          <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
          <div>
            <span className="font-semibold text-xs text-slate-700 block">2. Customer Custom Entries</span>
            <span className="text-xs text-slate-500 leading-snug">Fills the complete ticket from customer orders, including custom pick-up & drop-off locations.</span>
          </div>
        </div>

        <div className="flex items-start gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
          <Route className="w-5 h-5 text-sky-500 mt-0.5 shrink-0" />
          <div>
            <span className="font-semibold text-xs text-slate-700 block">3. Live Mini-Map Tracking</span>
            <span className="text-xs text-slate-500 leading-snug">Animated real-time route maps for small cities to avoid driver dispatch friction.</span>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-5 border-t border-slate-100">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">💡 Tap a sample message to simulate customer text:</span>
        <div className="flex flex-col sm:flex-row gap-2">
          {suggestions.map((s, idx) => (
            <button
              id={`suggest-btn-${idx}`}
              key={idx}
              onClick={() => onAutoPlaceOrder(s)}
              className="text-left text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 py-2.5 px-3.5 rounded-xl transition font-medium border border-slate-200/50 cursor-pointer"
            >
              &ldquo;{s}&rdquo;
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
