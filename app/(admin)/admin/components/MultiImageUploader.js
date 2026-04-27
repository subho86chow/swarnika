"use client";

import { useState, useRef } from "react";
import Image from "next/image";

export default function MultiImageUploader({ images = [], onChange, label = "Product Images", hint = "" }) {
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleUpload = async (file, index) => {
    if (!file) return;

    setUploadingIndex(index);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        console.error(data.error || "Upload failed");
        return;
      }

      const newImages = [...images];
      if (index !== null && index < newImages.length) {
        newImages[index] = data.url;
      } else {
        newImages.push(data.url);
      }
      onChange(newImages);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleDelete = async (index) => {
    const url = images[index];
    if (url) {
      try {
        await fetch("/api/upload", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });
      } catch (err) {
        console.error("Failed to delete from blob store:", err);
      }
    }

    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  const handleReorder = (fromIndex, toIndex) => {
    const newImages = [...images];
    const [moved] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, moved);
    onChange(newImages);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file, null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  return (
    <div className="space-y-4">
      <label className="font-label text-[10px] tracking-widest uppercase text-outline block">
        {label}
      </label>
      {hint && (
        <p className="font-body text-[10px] text-outline-var leading-relaxed">{hint}</p>
      )}

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((url, idx) => (
            <div key={`${url}-${idx}`} className="relative group aspect-square bg-surface-dim border border-surface-dim overflow-hidden rounded-sm">
              <Image
                src={url}
                alt={`Product image ${idx + 1}`}
                fill
                className="object-cover"
              />

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-navy/0 group-hover:bg-navy/50 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex gap-2">
                  {idx > 0 && (
                    <button
                      type="button"
                      onClick={() => handleReorder(idx, idx - 1)}
                      className="bg-white text-navy w-8 h-8 flex items-center justify-center hover:bg-ivory-dark transition-colors"
                      title="Move left"
                    >
                      <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="bg-white text-navy w-8 h-8 flex items-center justify-center hover:bg-ivory-dark transition-colors"
                    title="Replace"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                  </button>
                  {idx < images.length - 1 && (
                    <button
                      type="button"
                      onClick={() => handleReorder(idx, idx + 1)}
                      className="bg-white text-navy w-8 h-8 flex items-center justify-center hover:bg-ivory-dark transition-colors"
                      title="Move right"
                    >
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(idx)}
                    className="bg-[#991b1b] text-white w-8 h-8 flex items-center justify-center hover:bg-[#7f1d1d] transition-colors"
                    title="Remove"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              </div>

              {/* Order Badge */}
              <div className="absolute top-1.5 left-1.5 bg-navy/70 text-white text-[9px] px-1.5 py-0.5 font-label">
                {idx + 1}
              </div>

              {uploadingIndex === idx && (
                <div className="absolute inset-0 bg-navy/60 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add New Image Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-sm p-6 text-center cursor-pointer
          transition-all duration-300
          ${dragActive
            ? "border-navy bg-ivory-dark/50"
            : "border-surface-dim hover:border-outline-var hover:bg-ivory-dark/30"
          }
        `}
      >
        <div className="flex flex-col items-center gap-2">
          <span className="material-symbols-outlined text-[24px] text-outline/40">
            add_photo_alternate
          </span>
          <span className="font-label text-[10px] tracking-widest uppercase text-navy font-medium">
            Add Image
          </span>
          <span className="font-body text-[11px] text-outline">
            Drop or click to upload
          </span>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/svg+xml,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file, null);
          e.target.value = "";
        }}
      />

      {/* Hidden inputs for form submission */}
      {images.map((url, idx) => (
        <input key={idx} type="hidden" name={`images[${idx}]`} value={url} />
      ))}
    </div>
  );
}
