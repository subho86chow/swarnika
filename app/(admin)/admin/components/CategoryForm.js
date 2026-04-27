"use client";

import { useState, useTransition } from "react";
import { saveCategory } from "../../actions";
import Link from "next/link";
import ImageUploader from "./ImageUploader";

export default function CategoryForm({ category }) {
  const [isPending, startTransition] = useTransition();
  const [imageUrl, setImageUrl] = useState(category?.image || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    startTransition(() => {
      saveCategory(formData);
    });
  };

  const isEditor = !!category;

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-surface-dim p-8 max-w-3xl space-y-8 animate-fade-in-up">
      <div className="flex items-center justify-between border-b border-surface-dim pb-4">
        <h2 className="font-headline text-2xl text-navy italic">{isEditor ? "Edit Category" : "Add New Category"}</h2>
        <Link href="/admin/categories" className="text-outline text-xs uppercase tracking-widest font-label hover:text-navy">Cancel</Link>
      </div>

      <input type="hidden" name="id" value={category?.id || ""} />

      <div className="space-y-2">
        <label className="font-label text-[10px] tracking-widest uppercase text-outline">Name</label>
        <input required type="text" name="name" defaultValue={category?.name || ""} className="w-full border border-surface-dim p-3 font-body text-sm text-navy focus:outline-none focus:border-navy" />
      </div>

      <ImageUploader
        value={imageUrl}
        onChange={setImageUrl}
        label="Category Banner Image"
        hint="Recommended: 1200 × 400 px (3:1 ratio). Formats: JPEG, PNG, WebP."
      />

      <div className="space-y-2">
        <label className="font-label text-[10px] tracking-widest uppercase text-outline">Description (Optional)</label>
        <textarea name="description" defaultValue={category?.description || ""} rows={4} className="w-full border border-surface-dim p-3 font-body text-sm text-navy focus:outline-none focus:border-navy resize-none"></textarea>
      </div>

      <div className="pt-6 border-t border-surface-dim">
        <button type="submit" disabled={isPending} className="btn-primary w-full max-w-[200px] flex items-center justify-center gap-2">
          {isPending ? "Saving..." : (isEditor ? "Update Category" : "Save Category")}
        </button>
      </div>
    </form>
  );
}
