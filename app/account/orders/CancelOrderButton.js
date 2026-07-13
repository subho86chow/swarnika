"use client";

import { useTransition } from "react";
import { cancelCustomerOrder } from "../../lib/orderActions";

export default function CancelOrderButton({ orderId, onSuccess }) {
  const [isPending, startTransition] = useTransition();

  const handleCancel = () => {
    if (!confirm("Are you sure you want to cancel this order? This action cannot be undone.")) return;
    
    startTransition(async () => {
      try {
        await cancelCustomerOrder(orderId);
        if (onSuccess) onSuccess();
      } catch (err) {
        alert(err.message || "Failed to cancel order");
      }
    });
  };

  return (
    <button
      onClick={handleCancel}
      disabled={isPending}
      className="btn-secondary py-2 px-4 text-[10px] tracking-wider uppercase text-error hover:bg-red-50 hover:border-red-200 transition-colors disabled:opacity-50"
    >
      {isPending ? "Cancelling..." : "Cancel Order"}
    </button>
  );
}
