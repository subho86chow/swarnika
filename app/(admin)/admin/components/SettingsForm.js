"use client";

import { useTransition, useState } from "react";
import { saveSiteContent } from "../../actions";

export default function SettingsForm({ settings }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    setMessage("");
    startTransition(() => {
      saveSiteContent(formData).then(() => {
         setMessage("Settings saved successfully.");
      });
    });
  };

  let currentAnnouncements = [];
  try {
    currentAnnouncements = settings.announcement_texts 
      ? JSON.parse(settings.announcement_texts) 
      : [];
    if (!Array.isArray(currentAnnouncements)) {
      currentAnnouncements = typeof settings.announcement_texts === "string" ? settings.announcement_texts.split("\n") : [];
    }
  } catch (e) {
    currentAnnouncements = settings.announcement_texts ? settings.announcement_texts.split("\n") : [];
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-surface-dim p-8 max-w-3xl space-y-8 animate-fade-in-up">
      
      {message && (
        <div className="p-4 bg-[#ecfdf5] text-[#065f46] font-body text-sm rounded">
          {message}
        </div>
      )}

      <div>
        <h3 className="font-headline text-2xl text-navy italic mb-4">Hero Section</h3>
        <div className="space-y-6">
          <div className="space-y-2">
             <label className="font-label text-[10px] tracking-widest uppercase text-outline">Hero Title</label>
             <textarea rows={2} required name="hero_title" defaultValue={settings.hero_title || ""} className="w-full border border-surface-dim p-3 font-body text-sm text-navy focus:outline-none focus:border-navy resize-none"></textarea>
          </div>
          <div className="space-y-2">
             <label className="font-label text-[10px] tracking-widest uppercase text-outline">Hero Subtitle</label>
             <textarea rows={3} required name="hero_subtitle" defaultValue={settings.hero_subtitle || ""} className="w-full border border-surface-dim p-3 font-body text-sm text-navy focus:outline-none focus:border-navy resize-none"></textarea>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-surface-dim">
        <h3 className="font-headline text-2xl text-navy italic mb-4">Announcement Bar</h3>
        <p className="font-body text-outline text-xs mb-4">Enter each announcement separated by a newline.</p>
        <div className="space-y-2">
          <textarea required name="announcement_texts" defaultValue={currentAnnouncements.join("\n")} rows={6} className="w-full border border-surface-dim p-3 font-body text-sm text-navy focus:outline-none focus:border-navy"></textarea>
        </div>
      </div>

      <div className="pt-6 border-t border-surface-dim">
        <h3 className="font-headline text-2xl text-navy italic mb-4">Shipping</h3>
        <div className="space-y-2">
          <label className="font-label text-[10px] tracking-widest uppercase text-outline">Free Shipping Threshold (₹)</label>
          <input
            type="number"
            min="0"
            step="1"
            required
            name="free_shipping_threshold"
            defaultValue={settings.free_shipping_threshold || "50000"}
            className="w-full border border-surface-dim p-3 font-body text-sm text-navy focus:outline-none focus:border-navy"
          />
          <p className="font-body text-outline text-xs">Orders above this amount qualify for free shipping.</p>
        </div>
      </div>

      <div className="pt-6 border-t border-surface-dim">
        <button type="submit" disabled={isPending} className="btn-primary w-full max-w-[200px] flex items-center justify-center gap-2">
          {isPending ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </form>
  );
}
