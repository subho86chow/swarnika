"use client";

import { useState, useTransition } from "react";
import { saveProduct } from "../../actions";
import Link from "next/link";
import MultiImageUploader from "./MultiImageUploader";

export default function ProductForm({ product, categories = [] }) {
  const [isPending, startTransition] = useTransition();
  const [images, setImages] = useState(
    product?.images?.map((i) => (typeof i === "string" ? i : i.url)) || []
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    // Append images array to formData
    images.forEach((url, idx) => {
      formData.set(`images[${idx}]`, url);
    });
    startTransition(() => {
      saveProduct(formData);
    });
  };

  const isEditor = !!product;

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-surface-dim p-8 max-w-3xl space-y-8 animate-fade-in-up">
      <div className="flex items-center justify-between border-b border-surface-dim pb-4">
        <h2 className="font-headline text-2xl text-navy italic">{isEditor ? "Edit Piece" : "Add New Piece"}</h2>
        <Link href="/admin/products" className="text-outline text-xs uppercase tracking-widest font-label hover:text-navy">Cancel</Link>
      </div>

      <input type="hidden" name="id" value={product?.id || ""} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="font-label text-[10px] tracking-widest uppercase text-outline">Name</label>
          <input required type="text" name="name" defaultValue={product?.name || ""} className="w-full border border-surface-dim p-3 font-body text-sm text-navy focus:outline-none focus:border-navy" />
        </div>
        <div className="space-y-2">
          <label className="font-label text-[10px] tracking-widest uppercase text-outline">Category</label>
          <select
            name="categoryId"
            defaultValue={product?.categoryId || ""}
            className="w-full border border-surface-dim p-3 font-body text-sm text-navy focus:outline-none focus:border-navy bg-white"
          >
            <option value="">— No Category —</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="font-label text-[10px] tracking-widest uppercase text-outline">Price (₹)</label>
          <input required type="number" name="price" defaultValue={product?.price || ""} className="w-full border border-surface-dim p-3 font-body text-sm text-navy focus:outline-none focus:border-navy" />
        </div>
        <div className="space-y-2">
          <label className="font-label text-[10px] tracking-widest uppercase text-outline">Original Price (₹) - Optional</label>
          <input type="number" name="originalPrice" defaultValue={product?.originalPrice || ""} className="w-full border border-surface-dim p-3 font-body text-sm text-navy focus:outline-none focus:border-navy" />
        </div>
      </div>

      <div className="space-y-2">
        <label className="font-label text-[10px] tracking-widest uppercase text-outline">Description</label>
        <textarea required name="description" defaultValue={product?.description || ""} rows={4} className="w-full border border-surface-dim p-3 font-body text-sm text-navy focus:outline-none focus:border-navy resize-none"></textarea>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="font-label text-[10px] tracking-widest uppercase text-outline">Tags (comma separated)</label>
          <input type="text" name="tags" defaultValue={product?.tags?.map(t => t.name).join(", ") || ""} placeholder="diamond, bridal, premium" className="w-full border border-surface-dim p-3 font-body text-sm text-navy focus:outline-none focus:border-navy" />
        </div>
        <div className="space-y-2">
          <label className="font-label text-[10px] tracking-widest uppercase text-outline">Badge (e.g. Bestseller, Sale) - Optional</label>
          <input type="text" name="badge" defaultValue={product?.badge || ""} className="w-full border border-surface-dim p-3 font-body text-sm text-navy focus:outline-none focus:border-navy" />
        </div>
      </div>

      <div className="space-y-2 flex flex-col justify-center">
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" name="inStock" value="true" defaultChecked={product ? product.inStock : true} className="w-4 h-4 accent-navy" />
          <span className="font-label text-[10px] tracking-widest uppercase text-navy font-semibold">In Stock</span>
        </label>
      </div>

      <div className="pt-6 border-t border-surface-dim">
        <MultiImageUploader
          images={images}
          onChange={setImages}
          hint="Recommended: 800 × 1066 px (3:4 ratio) per image. Upload multiple for carousel. Formats: JPEG, PNG, WebP."
        />
      </div>

      <div className="pt-6 border-t border-surface-dim">
        <button type="submit" disabled={isPending} className="btn-primary w-full max-w-[200px] flex items-center justify-center gap-2">
          {isPending ? "Saving..." : (isEditor ? "Update Piece" : "Save Piece")}
        </button>
      </div>
    </form>
  );
}
