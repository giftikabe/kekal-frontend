/**
 * src/Kekal/context/CartContext.tsx
 *
 * Client-side cart: in-memory state persisted to localStorage.
 * No backend persistence (no customer accounts).
 *
 * CartItem.price holds the raw { etb, usd } price object from the custom_row data.
 */

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CartItem {
  custom_row_id: string;
  /** Display name pulled from the product row data */
  name: string;
  price: { etb: number; usd: number };
  quantity: number;
  /** Optional image URL for cart display */
  imageUrl?: string;
}

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: "ADD_ITEM"; item: Omit<CartItem, "quantity"> }
  | { type: "REMOVE_ITEM"; custom_row_id: string }
  | {
      type: "UPDATE_QTY";
      custom_row_id: string;
      quantity: number;
    }
  | { type: "CLEAR" };

interface CartContextValue extends CartState {
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: (currency: "etb" | "usd") => number;
}

// ─── Reducer ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = "kekal_cart";

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.items.find(
        (i) => i.custom_row_id === action.item.custom_row_id
      );
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.custom_row_id === action.item.custom_row_id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        };
      }
      return { items: [...state.items, { ...action.item, quantity: 1 }] };
    }
    case "REMOVE_ITEM":
      return {
        items: state.items.filter(
          (i) => i.custom_row_id !== action.custom_row_id
        ),
      };
    case "UPDATE_QTY":
      if (action.quantity <= 0) {
        return {
          items: state.items.filter(
            (i) => i.custom_row_id !== action.custom_row_id
          ),
        };
      }
      return {
        items: state.items.map((i) =>
          i.custom_row_id === action.custom_row_id
            ? { ...i, quantity: action.quantity }
            : i
        ),
      };
    case "CLEAR":
      return { items: [] };
    default:
      return state;
  }
}

function loadInitialState(): CartState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as CartState;
  } catch {
    /* ignore malformed data */
  }
  return { items: [] };
}

// ─── Context ──────────────────────────────────────────────────────────────────

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadInitialState);

  // Persist to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* quota exceeded — silently ignore */
    }
  }, [state]);

  const addItem = (item: Omit<CartItem, "quantity">) =>
    dispatch({ type: "ADD_ITEM", item });

  const removeItem = (custom_row_id: string) =>
    dispatch({ type: "REMOVE_ITEM", custom_row_id });

  const updateQty = (custom_row_id: string, quantity: number) =>
    dispatch({ type: "UPDATE_QTY", custom_row_id, quantity });

  const clearCart = () => dispatch({ type: "CLEAR" });

  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);

  const totalPrice = (currency: "etb" | "usd") =>
    state.items.reduce(
      (sum, i) => sum + i.price[currency] * i.quantity,
      0
    );

  return (
    <CartContext.Provider
      value={{
        ...state,
        addItem,
        removeItem,
        updateQty,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
