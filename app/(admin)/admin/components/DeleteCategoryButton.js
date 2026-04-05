"use client";

import { useTransition } from "react";
import { deleteCategory } from "../../actions";

export default function DeleteCategoryButton({ id, name }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm(`Delete category "${name}"? Products in this category will become uncategorized.`)) return;
    startTransition(async () => {
      await deleteCategory(id);
    });
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="text-outline hover:text-[#991b1b] transition-colors inline-block p-2"
      title="Delete category"
    >
      <span className="material-symbols-outlined text-[18px]">{isPending ? "hourglass_empty" : "delete"}</span>
    </button>
  );
}
