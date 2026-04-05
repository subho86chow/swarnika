"use client";

import { useTransition } from "react";
import { deleteTag } from "../../actions";

export default function DeleteTagButton({ id, name, productCount }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    const msg = productCount > 0
      ? `Delete tag "${name}"? It is used by ${productCount} product(s). The tag will be removed from those products.`
      : `Delete tag "${name}"?`;
    if (!confirm(msg)) return;
    startTransition(async () => {
      await deleteTag(id);
    });
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="text-outline hover:text-[#991b1b] transition-colors inline-block p-2"
      title="Delete tag"
    >
      <span className="material-symbols-outlined text-[18px]">{isPending ? "hourglass_empty" : "delete"}</span>
    </button>
  );
}
