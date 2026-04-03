"use client";

import { useTransition } from "react";
import { saveCollection } from "../../actions";
import Link from "next/link";

export default function CollectionForm({ collection }) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    startTransition(() => {
      saveCollection(formData);
    });
  };

  const isEditor = !!collection;

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-surface-dim p-8 max-w-3xl space-y-8 animate-fade-in-up">
      <div className="flex items-center justify-between border-b border-surface-dim pb-4">
        <h2 className="font-headline text-2xl text-navy italic">{isEditor ? "Edit Collection" : "Add New Collection"}</h2>
        <Link href="/admin/collections" className="text-outline text-xs uppercase tracking-widest font-label hover:text-navy">Cancel</Link>
      </div>

      <input type="hidden" name="id" value={collection?.id || ""} />

      <div className="space-y-2">
        <label className="font-label text-[10px] tracking-widest uppercase text-outline">Name</label>
        <input required type="text" name="name" defaultValue={collection?.name || ""} className="w-full border border-surface-dim p-3 font-body text-sm text-navy focus:outline-none focus:border-navy" />
      </div>

      <div className="space-y-2">
        <label className="font-label text-[10px] tracking-widest uppercase text-outline">Banner Image URL</label>
        <input required type="text" name="image" defaultValue={collection?.image || ""} className="w-full border border-surface-dim p-3 font-body text-sm text-navy focus:outline-none focus:border-navy" />
      </div>

      <div className="space-y-2">
        <label className="font-label text-[10px] tracking-widest uppercase text-outline">Description</label>
        <textarea required name="description" defaultValue={collection?.description || ""} rows={4} className="w-full border border-surface-dim p-3 font-body text-sm text-navy focus:outline-none focus:border-navy resize-none"></textarea>
      </div>

      <div className="pt-6 border-t border-surface-dim">
        <button type="submit" disabled={isPending} className="btn-primary w-full max-w-[200px] flex items-center justify-center gap-2">
          {isPending ? "Saving..." : (isEditor ? "Update Collection" : "Save Collection")}
        </button>
      </div>
    </form>
  );
}
