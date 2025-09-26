
export enum View {
  RESTAURANTS = 'restaurants',
  MENU = 'menu',
  CART = 'cart',
  CHECKOUT = 'checkout',
  CONFIRMATION = 'confirmation',
}

export interface Restaurant {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviews: number;
  deliveryTime: string;
  minOrder: number;
  image: string;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  restaurantName: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface OrderDetails {
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  paymentMethod: string;
  orderNotes?: string;
}

export interface ConfirmedOrder extends OrderDetails {
  orderNumber: string;
  estimatedDeliveryTime: string;
  items: { name: string; quantity: number }[];
  subtotal: number;
  shippingFee: number;
  total: number;
}

export interface AlertState {
    message: string;
    type: 'success' | 'error';
}

export interface SheetOrderData {
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    deliveryAddress: string;
    paymentMethod: string;
    // FIX: Made `orderNotes` optional to align with the `OrderDetails` interface and fix the type error in App.tsx.
    orderNotes?: string;
    items: string;
    subtotal: number;
    shippingFee: number;
    total: number;
    orderTime: string;
}
