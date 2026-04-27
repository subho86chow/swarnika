"use client";

import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { getPublicCoupons } from "./couponActions";

const CouponContext = createContext(null);

export function CouponProvider({ children }) {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getPublicCoupons()
      .then((data) => {
        if (mounted) setCoupons(data);
      })
      .catch(() => {
        /* silent fail for badges */
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo(() => ({ coupons, loading }), [coupons, loading]);

  return (
    <CouponContext.Provider value={value}>{children}</CouponContext.Provider>
  );
}

export function useCoupons() {
  const ctx = useContext(CouponContext);
  if (!ctx) throw new Error("useCoupons must be used inside CouponProvider");
  return ctx;
}

/**
 * Check which public coupons apply to a given product.
 * This runs entirely client-side using the globally fetched coupon list.
 */
export function useProductCoupons(productId, price = 0, categoryId = null) {
  const { coupons } = useCoupons();

  return useMemo(() => {
    if (!productId || coupons.length === 0) return [];

    const now = new Date();

    return coupons
      .filter((c) => {
        // Re-validate temporal / usage limits (belt-and-suspenders)
        if (c.startDate && now < new Date(c.startDate)) return false;
        if (c.endDate && now > new Date(c.endDate)) return false;
        if (c.maxUses !== null && c.usedCount >= c.maxUses) return false;

        // Scope checks
        switch (c.scope) {
          case "global":
            return true;
          case "product":
            return c.productId === productId;
          case "category":
            return categoryId && c.categoryId === categoryId;
          case "single_product_cart":
            return true; // badge context — single-product logic is cart-time only
          default:
            return false;
        }
      })
      .map((c) => {
        let discount = 0;
        if (c.discountType === "percentage") {
          discount = Math.round((price * c.discountValue) / 100);
        } else {
          discount = Math.min(c.discountValue, price);
        }
        return { coupon: c, discount };
      })
      .filter((d) => d.discount > 0);
  }, [coupons, productId, price, categoryId]);
}
