"use client";

import { useTransition } from "react";
import { deleteProduct } from "../../actions";

export default function DeleteProductButton({ id, name }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm(`Delete product "${name}"? This cannot be undone.`)) return;
    startTransition(async () => {
      await deleteProduct(id);
    });
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="text-outline hover:text-[#991b1b] transition-colors inline-block p-2"
      title="Delete product"
    >
      <span className="material-symbols-outlined text-[18px]">{isPending ? "hourglass_empty" : "delete"}</span>
    </button>
  );
}
