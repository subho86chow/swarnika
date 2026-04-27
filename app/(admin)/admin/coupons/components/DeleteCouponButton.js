"use client";

import { useTransition } from "react";
import { deleteCoupon } from "../../../../lib/couponActions";
import { useRouter } from "next/navigation";

export default function DeleteCouponButton({ id }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    startTransition(async () => {
      await deleteCoupon(id);
      router.refresh();
    });
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="text-outline hover:text-error transition-colors"
    >
      <span className="material-symbols-outlined text-[18px]">delete</span>
    </button>
  );
}
