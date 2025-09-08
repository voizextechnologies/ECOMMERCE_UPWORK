import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react'; // Add useEffect
import { CartItem, Product, ProductVariant, User } from '../types';
import { supabase } from '../lib/supabase'; // Import supabase client

interface AppState {
  cart: CartItem[];
  user: User | null;
  wishlist: string[];
  isCartOpen: boolean;
  isMenuOpen: boolean;
  authLoading: boolean; // Add authLoading state
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
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_AUTH_LOADING'; payload: boolean }; // Add action for auth loading

const initialState: AppState = {
  cart: [],
  user: null,
  wishlist: [],
  isCartOpen: false,
  isMenuOpen: false,
  authLoading: true, // Initialize authLoading to true
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_TO_CART': {
      console.log('AppContext Reducer: Handling ADD_TO_CART action. Payload:', action.payload);
      const { product, quantity, variant } = action.payload;
      const existingItemIndex = state.cart.findIndex(
        item => item.product.id === product.id &&
        (variant ? item.variant?.id === variant.id : !item.variant)
      );

      let newState;
      if (existingItemIndex > -1) {
        const updatedCart = [...state.cart]; // Creates a new array
        // IMPORTANT: Create a new object for the updated item to ensure immutability
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          quantity: updatedCart[existingItemIndex].quantity + quantity
        };
        newState = { ...state, cart: updatedCart };
      } else {
        newState = {
          ...state,
          cart: [...state.cart, { product, quantity, variant }]
        };
      }
      console.log('AppContext Reducer: New cart state:', newState.cart);
      return newState;
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

    case 'SET_AUTH_LOADING': // Handle auth loading state
      return { ...state, authLoading: action.payload };

    default:
      return state;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Auth logic moved from useAuth hook
  useEffect(() => {
    async function getUserSession() {
      dispatch({ type: 'SET_AUTH_LOADING', payload: true });
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('Error getting session:', sessionError);
        dispatch({ type: 'SET_USER', payload: null });
        dispatch({ type: 'SET_AUTH_LOADING', payload: false });
        return;
      }

      if (session?.user) {
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('first_name, last_name, role')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error('Error fetching user profile:', profileError);
          dispatch({ type: 'SET_USER', payload: null });
        } else {
          dispatch({
            type: 'SET_USER',
            payload: {
              id: session.user.id,
              email: session.user.email || '',
              firstName: profile?.first_name || '',
              lastName: profile?.last_name || '',
              role: profile?.role || 'customer',
              addresses: [],
              orders: [],
              wishlist: [],
            },
          });
        }
      } else {
        dispatch({ type: 'SET_USER', payload: null });
      }
      dispatch({ type: 'SET_AUTH_LOADING', payload: false });
    }

    getUserSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        supabase
          .from('user_profiles')
          .select('first_name, last_name, role')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profile, error: profileError }) => {
            if (profileError) {
              console.error('Error fetching user profile on auth change:', profileError);
              dispatch({ type: 'SET_USER', payload: null });
            } else {
              dispatch({
                type: 'SET_USER',
                payload: {
                  id: session.user.id,
                  email: session.user.email || '',
                  firstName: profile?.first_name || '',
                  lastName: profile?.last_name || '',
                  role: profile?.role || 'customer',
                  addresses: [],
                  orders: [],
                  wishlist: [],
                },
              });
            }
          });
      } else {
        dispatch({ type: 'SET_USER', payload: null });
      }
      dispatch({ type: 'SET_AUTH_LOADING', payload: false });
    });

    return () => subscription.unsubscribe();
  }, []); // Empty dependency array means this runs once on mount

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
