export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  isAvailable: boolean;
  estimatedPrepTime: number; // in minutes
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  customization?: string; // e.g. "no onion", "extra sauce"
}

export type OrderStatus = 'pending' | 'preparing' | 'driving' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  rawText: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  customerName: string;
  deliveryAddress: string;
  pickupAddress?: string;
  driverName: string;
  driverPhone: string;
  etaMinutes: number; // dynamically changing
  progress: number; // 0 to 100
  driverPathIndex: number; // for tracking animated map path
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot' | 'system';
  text: string;
  timestamp: string;
  type?: 'text' | 'order_summary' | 'tracking_link';
  orderSummary?: {
    items: OrderItem[];
    subtotal: number;
    deliveryFee: number;
    total: number;
    orderId: string;
  };
  trackingOrderId?: string;
}

export interface ParsedResponse {
  success: boolean;
  matchedItems: Array<{
    id: string;
    name: string;
    quantity: number;
    customization?: string;
  }>;
  unrecognizedItems: string[];
  clarificationMessage?: string;
}
