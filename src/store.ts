import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Variant {
  id: string;
  name: string;
  image_url: string;
  price_override: number | null;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  discount_price: number | null;
  image_url: string;
  category: string;
  stock: number;
  variants?: string; // JSON string from DB
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  id: number;
  email: string;
  name: string;
  address?: string;
  is_admin?: boolean;
}

interface AppState {
  cart: CartItem[];
  user: User | null;
  token: string | null;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  setUser: (user: User | null, token: string | null) => void;
  logout: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      cart: [],
      user: null,
      token: null,
      addToCart: (product, quantity = 1) =>
        set((state) => {
          const existingItem = state.cart.find((item) => item.id === product.id);
          if (existingItem) {
            return {
              cart: state.cart.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }
          return { cart: [...state.cart, { ...product, quantity }] };
        }),
      removeFromCart: (productId) =>
        set((state) => ({
          cart: state.cart.filter((item) => item.id !== productId),
        })),
      updateQuantity: (productId, quantity) =>
        set((state) => ({
          cart: state.cart.map((item) =>
            item.id === productId ? { ...item, quantity } : item
          ),
        })),
      clearCart: () => set({ cart: [] }),
      setUser: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'ecommerce-storage',
    }
  )
);
