import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { CartItem, Product, ProductVariant, User } from '../types';

interface AppState {
  cart: CartItem[];
  user: User | null;
  wishlist: string[];
  isCartOpen: boolean;
  isMenuOpen: boolean;
}

type AppAction =
  | { type: 'ADD_TO_CART'; payload: { product: Product; quantity: number; variant?: ProductVariant } }
  | { type: 'REMOVE_FROM_CART'; payload: { productId: string; variantId?: string } }
  | { type: 'UPDATE_CART_QUANTITY'; payload: { productId: string; variantId?: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'CLOSE_CART' }
  | { type: 'TOGGLE_MENU' }
  | { type: 'CLOSE_MENU' }
  | { type: 'ADD_TO_WISHLIST'; payload: string }
  | { type: 'REMOVE_FROM_WISHLIST'; payload: string }
  | { type: 'SET_USER'; payload: User | null }; // Ensure payload type is User | null

const initialState: AppState = {
  cart: [],
  user: null,
  wishlist: [],
  isCartOpen: false,
  isMenuOpen: false,
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const { product, quantity, variant } = action.payload;
      const existingItemIndex = state.cart.findIndex(
        item => item.product.id === product.id &&
        (variant ? item.variant?.id === variant.id : !item.variant)
      );

      if (existingItemIndex > -1) {
        const updatedCart = [...state.cart];
        updatedCart[existingItemIndex].quantity += quantity;
        return { ...state, cart: updatedCart };
      }

      return {
        ...state,
        cart: [...state.cart, { product, quantity, variant }]
      };
    }

    case 'REMOVE_FROM_CART': {
      const { productId, variantId } = action.payload;
      return {
        ...state,
        cart: state.cart.filter(
          item => !(item.product.id === productId &&
          (variantId ? item.variant?.id === variantId : !item.variant))
        )
      };
    }

    case 'UPDATE_CART_QUANTITY': {
      const { productId, variantId, quantity } = action.payload;
      if (quantity <= 0) {
        return {
          ...state,
          cart: state.cart.filter(
            item => !(item.product.id === productId &&
            (variantId ? item.variant?.id === variantId : !item.variant))
          )
        };
      }

      return {
        ...state,
        cart: state.cart.map(item =>
          item.product.id === productId &&
          (variantId ? item.variant?.id === variantId : !item.variant)
            ? { ...item, quantity }
            : item
        )
      };
    }

    case 'CLEAR_CART':
      return { ...state, cart: [] };

    case 'TOGGLE_CART':
      return { ...state, isCartOpen: !state.isCartOpen };

    case 'CLOSE_CART':
      return { ...state, isCartOpen: false };

    case 'TOGGLE_MENU':
      return { ...state, isMenuOpen: !state.isMenuOpen };

    case 'CLOSE_MENU':
      return { ...state, isMenuOpen: false };

    case 'ADD_TO_WISHLIST':
      return {
        ...state,
        wishlist: state.wishlist.includes(action.payload)
          ? state.wishlist
          : [...state.wishlist, action.payload]
      };

    case 'REMOVE_FROM_WISHLIST':
      return {
        ...state,
        wishlist: state.wishlist.filter(id => id !== action.payload)
      };

    case 'SET_USER':
      return { ...state, user: action.payload };

    default:
      return state;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
