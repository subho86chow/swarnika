"use client";

import { useProductCoupons } from "../lib/couponContext";

export default function ProductCouponBadge({ productId, price = 0, categoryId }) {
  const coupons = useProductCoupons(productId, price, categoryId);

  if (coupons.length === 0) return null;

  const best = coupons[0]; // highest discount first (server already sorts by value)

  return (
    <div className="absolute bottom-4 left-4 z-10">
      <span className="inline-block px-2.5 py-1 font-label text-[8px] tracking-[0.15em] uppercase font-bold bg-gold text-white">
        {best.coupon.discountType === "percentage"
          ? `${best.coupon.discountValue}% OFF`
          : `SAVE ₹${best.coupon.discountValue}`}
      </span>
    </div>
  );
}
