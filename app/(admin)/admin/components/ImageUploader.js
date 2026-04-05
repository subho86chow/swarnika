"use client";

import { useState, useRef } from "react";
import Image from "next/image";

export default function ImageUploader({ value, onChange, label = "Image" }) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const handleUpload = async (file) => {
    if (!file) return;

    setError("");
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Upload failed");
        return;
      }

      onChange(data.url);
    } catch (err) {
      setError("Upload failed. Please try again.");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!value) return;

    try {
      await fetch("/api/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: value }),
      });
    } catch (err) {
      console.error("Failed to delete from blob store:", err);
    }

    onChange("");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  return (
    <div className="space-y-2">
      <label className="font-label text-[10px] tracking-widest uppercase text-outline">
        {label}
      </label>

      {value ? (
        /* ─── Preview ─── */
        <div className="relative group">
          <div className="relative w-full aspect-[16/9] bg-surface-dim border border-surface-dim overflow-hidden rounded-sm">
            <Image
              src={value}
              alt="Uploaded image"
              fill
              className="object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-navy/0 group-hover:bg-navy/50 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="bg-white text-navy px-4 py-2 text-[10px] uppercase tracking-widest font-label font-medium hover:bg-ivory-dark transition-colors"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="bg-[#991b1b] text-white px-4 py-2 text-[10px] uppercase tracking-widest font-label font-medium hover:bg-[#7f1d1d] transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
          <p className="text-[10px] text-outline mt-1.5 truncate font-body">{value}</p>
        </div>
      ) : (
        /* ─── Drop Zone ─── */
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !uploading && inputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-sm p-8 text-center cursor-pointer
            transition-all duration-300
            ${dragActive
              ? "border-navy bg-ivory-dark/50"
              : "border-surface-dim hover:border-outline-var hover:bg-ivory-dark/30"
            }
            ${uploading ? "pointer-events-none opacity-60" : ""}
          `}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-navy border-t-transparent rounded-full animate-spin" />
              <span className="font-label text-[10px] tracking-widest uppercase text-navy">
                Uploading...
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <span className="material-symbols-outlined text-[32px] text-outline/40">
                cloud_upload
              </span>
              <div>
                <span className="font-label text-[10px] tracking-widest uppercase text-navy font-medium block">
                  Drop image here or click to browse
                </span>
                <span className="font-body text-[11px] text-outline mt-1 block">
                  JPEG, PNG, WebP, SVG, GIF — Max 4MB
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-[11px] text-[#991b1b] font-body mt-1">{error}</p>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/svg+xml,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
          e.target.value = "";
        }}
      />

      {/* Hidden input to pass URL to FormData */}
      <input type="hidden" name="image" value={value || ""} />
    </div>
  );
}
