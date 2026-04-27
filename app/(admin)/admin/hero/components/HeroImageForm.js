"use client";

import { useState } from "react";
import Image from "next/image";
import { createHeroImage, updateHeroImage } from "../../../../lib/heroActions";
import { useRouter } from "next/navigation";
import ImageUploader from "../../components/ImageUploader";

export default function HeroImageForm({ heroImage }) {
  const router = useRouter();
  const isEditing = !!heroImage;

  const [desktop, setDesktop] = useState(heroImage?.desktop || "");
  const [mobile, setMobile] = useState(heroImage?.mobile || "");
  const [alt, setAlt] = useState(heroImage?.alt || "");
  const [isActive, setIsActive] = useState(heroImage?.isActive ?? true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!desktop.trim()) {
      setError("Desktop image is required.");
      return;
    }
    if (!mobile.trim()) {
      setError("Mobile image is required.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        desktop: desktop.trim(),
        mobile: mobile.trim(),
        alt: alt.trim() || "Hero Image",
        isActive,
      };

      if (isEditing) {
        await updateHeroImage(heroImage.id, payload);
      } else {
        await createHeroImage(payload);
      }

      router.push("/admin/hero");
      router.refresh();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-surface-dim p-6 md:p-8 space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ImageUploader
          value={desktop}
          onChange={setDesktop}
          label="Desktop Image"
          hint="Recommended: 1920 × 994 px (wide landscape). Formats: JPEG, PNG, WebP."
        />
        <ImageUploader
          value={mobile}
          onChange={setMobile}
          label="Mobile Image"
          hint="Recommended: 375 × 747 px (tall portrait). Formats: JPEG, PNG, WebP."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="font-label text-[10px] tracking-widest uppercase text-outline block">
            Alt Text
          </label>
          <input
            type="text"
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            placeholder="Hero Image"
            className="w-full border border-surface-dim px-4 py-3 text-sm font-body text-navy focus:outline-none focus:border-navy transition-colors"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsActive(!isActive)}
            className={`w-11 h-6 flex items-center transition-colors ${isActive ? "bg-navy" : "bg-surface-dim"}`}
          >
            <div
              className={`w-5 h-5 bg-white transition-transform ${isActive ? "translate-x-[22px]" : "translate-x-0.5"}`}
            />
          </button>
          <span className="font-label text-[10px] tracking-widest uppercase text-outline">
            {isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4 pt-4 border-t border-surface-dim">
        <button
          type="submit"
          disabled={submitting}
          className="btn-primary flex items-center gap-2 disabled:opacity-50"
        >
          {submitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[16px]">save</span>
              {isEditing ? "Update Slide" : "Add Slide"}
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/hero")}
          className="btn-secondary hero"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
