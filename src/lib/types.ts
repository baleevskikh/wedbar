export type OrderStatus = "pending" | "in_progress" | "delivering" | "rejected";

export type Drink = {
  id: string;
  name: string;
  description: string;
  ingredients: string;
  recipe: string;
  imagePath: string;
  videoPath: string | null;
  position: number;
  isStopped: boolean;
  isDeleted: boolean;
  createdAt: string;
};

export type OrderItem = {
  orderId: string;
  drinkId: string;
  drinkName: string;
  imagePath: string | null;
  recipe: string;
  qty: number;
};

export type Order = {
  id: string;
  tableNumber: number;
  comment: string;
  status: OrderStatus;
  rejectReason: string | null;
  createdAt: string;
  acceptedAt: string | null;
  readyAt: string | null;
  closedAt: string | null;
  items: OrderItem[];
};

export type ActiveOrdersResponse = {
  orders: Order[];
  queued: number;
};

export type Stats = {
  summary: {
    totalOrders: number;
    totalPortions: number;
    rejectedOrders: number;
    activeTables: number;
  };
  topDrinks: Array<{ drinkId: string; name: string; portions: number }>;
  timeline: Array<{ label: string; orders: number }>;
  tables: Array<{ tableNumber: number; orders: number; portions: number }>;
};
