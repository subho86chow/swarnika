"use client";

import { useTransition } from "react";
import { deleteHeroImage } from "../../../../lib/heroActions";
import { useRouter } from "next/navigation";

export default function DeleteHeroImageButton({ id }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm("Are you sure you want to delete this hero slide?")) return;
    startTransition(async () => {
      await deleteHeroImage(id);
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
