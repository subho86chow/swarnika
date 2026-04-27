"use client";

import { useProductCoupons } from "../lib/couponContext";

export default function ProductCoupons({ productId, price = 0, categoryId }) {
  const coupons = useProductCoupons(productId, price, categoryId);

  if (coupons.length === 0) return null;

  return (
    <div className="border-t border-surface-dim pt-5">
      <p className="section-eyebrow mb-3">Available Offers</p>
      <div className="space-y-2">
        {coupons.map(({ coupon, discount }) => (
          <div
            key={coupon.id}
            className="flex items-center gap-3 bg-surface-low p-3"
          >
            <span className="material-symbols-outlined text-gold text-[18px]">
              confirmation_number
            </span>
            <div className="flex-1">
              <span className="font-label text-[9px] tracking-wider uppercase text-gold font-semibold">
                {coupon.code}
              </span>
              <p className="text-[11px] text-outline mt-0.5">
                {coupon.name} — Save {discount > 0 ? `₹${discount.toLocaleString("en-IN")}` : `${coupon.discountValue}${coupon.discountType === "percentage" ? "%" : ""}`}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
