"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useUser } from "@clerk/nextjs";
import {
  getCartItems,
  addCartItem,
  updateCartItemQuantity,
  removeCartItem,
  clearCart as clearCartDB,
  getFavorites,
  addFavorite,
  removeFavorite,
  mergeGuestCart,
  mergeGuestFavorites,
} from "./cartActions";

const CartContext = createContext(null);

const GUEST_CART_KEY = "swarnika_cart_guest";
const GUEST_FAV_KEY = "swarnika_favorites_guest";
const GUEST_COUPON_KEY = "swarnika_coupon_guest";

export function CartProvider({ children }) {
  const { user, isLoaded, isSignedIn } = useUser();
  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [hydrated, setHydrated] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Ref to track previous signed-in state so we can detect sign-out
  const prevSignedInRef = useRef(undefined);
  // Ref to track the user whose data is currently being loaded.
  // If auth changes while a load is in flight we ignore the stale result.
  const activeUserIdRef = useRef(null);

  // ── Hydrate on mount AND on every auth change ──
  useEffect(() => {
    if (!isLoaded) return;

    const wasSignedIn = prevSignedInRef.current;
    prevSignedInRef.current = isSignedIn;

    if (isSignedIn && user?.id) {
      // Logged in — always check localStorage for guest data and merge it,
      // then load from DB. This is idempotent: if localStorage is already
      // empty nothing happens.
      loadUserData(user.id);
    } else {
      // Guest mode (or signed-out).
      // If we just came from a logged-in state, explicitly wipe memory first
      // so DB items don’t linger on the screen.
      if (wasSignedIn === true) {
        // Wipe localStorage immediately so the persist effect can never
        // pick up the old logged-in cart after sign-out.
        localStorage.removeItem(GUEST_CART_KEY);
        localStorage.removeItem(GUEST_FAV_KEY);
        localStorage.removeItem(GUEST_COUPON_KEY);
        setCart([]);
        setFavorites([]);
        setAppliedCoupon(null);
        activeUserIdRef.current = null; // invalidate any in-flight loadUserData
      }

      try {
        const storedCart = localStorage.getItem(GUEST_CART_KEY);
        const storedFavs = localStorage.getItem(GUEST_FAV_KEY);
        const storedCoupon = localStorage.getItem(GUEST_COUPON_KEY);
        setCart(storedCart ? JSON.parse(storedCart) : []);
        setFavorites(storedFavs ? JSON.parse(storedFavs) : []);
        setAppliedCoupon(storedCoupon ? JSON.parse(storedCoupon) : null);
      } catch {
        setCart([]);
        setFavorites([]);
        setAppliedCoupon(null);
      }
      setHydrated(true);
    }
  }, [isLoaded, isSignedIn, user?.id]);

  async function loadUserData(userId) {
    activeUserIdRef.current = userId;
    setIsSyncing(true);
    try {
      // Pull any guest data from localStorage and clear it *immediately*
      // so it can never be re-read later (e.g. after a logout).
      const guestCart = localStorage.getItem(GUEST_CART_KEY);
      const guestFavs = localStorage.getItem(GUEST_FAV_KEY);

      if (guestCart) {
        localStorage.removeItem(GUEST_CART_KEY);
        const parsed = JSON.parse(guestCart);
        if (Array.isArray(parsed) && parsed.length > 0) {
          try {
            await mergeGuestCart(userId, parsed);
          } catch (e) {
            console.error("Failed to merge guest cart", e);
          }
        }
      }

      if (guestFavs) {
        localStorage.removeItem(GUEST_FAV_KEY);
        const parsed = JSON.parse(guestFavs);
        if (Array.isArray(parsed) && parsed.length > 0) {
          try {
            await mergeGuestFavorites(userId, parsed);
          } catch (e) {
            console.error("Failed to merge guest favorites", e);
          }
        }
      }

      const [dbCart, dbFavs] = await Promise.all([
        getCartItems(userId),
        getFavorites(userId),
      ]);

      // Ignore result if user switched or logged out while we were loading
      if (activeUserIdRef.current !== userId) return;

      setCart(
        dbCart.map((item) => ({ productId: item.productId, quantity: item.quantity }))
      );
      setFavorites(dbFavs);
    } catch (e) {
      console.error("Failed to load user cart/favorites", e);
    } finally {
      if (activeUserIdRef.current === userId) {
        setHydrated(true);
        setIsSyncing(false);
      }
    }
  }

  // ── Cross-tab sync for guests ──
  useEffect(() => {
    if (isSignedIn) return;

    const handleStorage = (e) => {
      if (e.key === GUEST_CART_KEY) {
        setCart(e.newValue ? JSON.parse(e.newValue) : []);
      }
      if (e.key === GUEST_FAV_KEY) {
        setFavorites(e.newValue ? JSON.parse(e.newValue) : []);
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [isSignedIn]);

  // ── Persist cart for guests ──
  // Only react to cart changes, NOT to isSignedIn flipping, so we never
  // snapshot the old logged-in cart into localStorage during logout.
  useEffect(() => {
    if (!hydrated || isSignedIn) return;
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
  }, [cart, hydrated]);

  // ── Persist favorites for guests ──
  useEffect(() => {
    if (!hydrated || isSignedIn) return;
    localStorage.setItem(GUEST_FAV_KEY, JSON.stringify(favorites));
  }, [favorites, hydrated]);

  // ── Persist applied coupon for guests ──
  useEffect(() => {
    if (!hydrated || isSignedIn) return;
    if (appliedCoupon) {
      localStorage.setItem(GUEST_COUPON_KEY, JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem(GUEST_COUPON_KEY);
    }
  }, [appliedCoupon, hydrated, isSignedIn]);

  // ── Cart actions ──
  const addToCart = useCallback(
    async (product, quantity = 1) => {
      setCart((prev) => {
        const existing = prev.find((item) => item.productId === product.id);
        if (existing) {
          return prev.map((item) =>
            item.productId === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [...prev, { productId: product.id, quantity }];
      });

      if (isSignedIn && user?.id) {
        try {
          await addCartItem(user.id, product.id, quantity);
        } catch (e) {
          console.error("Failed to add cart item to DB", e);
        }
      }
    },
    [isSignedIn, user?.id]
  );

  const updateCartQuantity = useCallback(
    async (productId, quantity) => {
      if (quantity <= 0) {
        setCart((prev) => prev.filter((item) => item.productId !== productId));
        if (isSignedIn && user?.id) {
          try {
            await removeCartItem(user.id, productId);
          } catch (e) {
            console.error("Failed to remove cart item from DB", e);
          }
        }
      } else {
        setCart((prev) =>
          prev.map((item) =>
            item.productId === productId ? { ...item, quantity } : item
          )
        );
        if (isSignedIn && user?.id) {
          try {
            await updateCartItemQuantity(user.id, productId, quantity);
          } catch (e) {
            console.error("Failed to update cart item in DB", e);
          }
        }
      }
    },
    [isSignedIn, user?.id]
  );

  const removeFromCart = useCallback(
    async (productId) => {
      setCart((prev) => prev.filter((item) => item.productId !== productId));
      if (isSignedIn && user?.id) {
        try {
          await removeCartItem(user.id, productId);
        } catch (e) {
          console.error("Failed to remove cart item from DB", e);
        }
      }
    },
    [isSignedIn, user?.id]
  );

  const clearCart = useCallback(() => {
    setCart([]);
    if (isSignedIn && user?.id) {
      clearCartDB(user.id).catch((e) =>
        console.error("Failed to clear cart in DB", e)
      );
    }
  }, [isSignedIn, user?.id]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // ── Coupon actions ──
  const applyCoupon = useCallback((coupon, discount) => {
    setAppliedCoupon({ coupon, discount });
  }, []);

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
  }, []);

  // ── Favorites actions ──
  const addToFavorites = useCallback(
    async (productId) => {
      setFavorites((prev) =>
        prev.includes(productId) ? prev : [...prev, productId]
      );
      if (isSignedIn && user?.id) {
        try {
          await addFavorite(user.id, productId);
        } catch (e) {
          console.error("Failed to add favorite to DB", e);
        }
      }
    },
    [isSignedIn, user?.id]
  );

  const removeFromFavorites = useCallback(
    async (productId) => {
      setFavorites((prev) => prev.filter((id) => id !== productId));
      if (isSignedIn && user?.id) {
        try {
          await removeFavorite(user.id, productId);
        } catch (e) {
          console.error("Failed to remove favorite from DB", e);
        }
      }
    },
    [isSignedIn, user?.id]
  );

  const toggleFavorite = useCallback(
    async (productId) => {
      const isFav = favorites.includes(productId);
      setFavorites((prev) =>
        prev.includes(productId)
          ? prev.filter((id) => id !== productId)
          : [...prev, productId]
      );
      if (isSignedIn && user?.id) {
        try {
          if (isFav) {
            await removeFavorite(user.id, productId);
          } else {
            await addFavorite(user.id, productId);
          }
        } catch (e) {
          console.error("Failed to toggle favorite in DB", e);
        }
      }
    },
    [isSignedIn, user?.id, favorites]
  );

  const isFavorite = useCallback(
    (productId) => favorites.includes(productId),
    [favorites]
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        favorites,
        addToFavorites,
        removeFromFavorites,
        toggleFavorite,
        isFavorite,
        hydrated,
        isSyncing,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
