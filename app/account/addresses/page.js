"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";

const emptyAddress = {
  label: "",
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  zip: "",
  country: "India",
  isDefault: false,
};

export default function AddressesPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [addresses, setAddresses] = useState([]);
  const [editIndex, setEditIndex] = useState(null); // null = not editing, -1 = adding new
  const [form, setForm] = useState({ ...emptyAddress });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isLoaded && user) {
      const meta = user.unsafeMetadata || {};
      setAddresses(meta.addresses || []);
    }
  }, [isLoaded, user]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const persistAddresses = async (updated) => {
    setSaving(true);
    try {
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          addresses: updated,
        },
      });
      setAddresses(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Failed to save addresses:", err);
    } finally {
      setSaving(false);
    }
  };

  const startAdd = () => {
    setForm({ ...emptyAddress });
    setEditIndex(-1);
  };

  const startEdit = (index) => {
    setForm({ ...addresses[index] });
    setEditIndex(index);
  };

  const cancelEdit = () => {
    setEditIndex(null);
    setForm({ ...emptyAddress });
  };

  const handleSave = async () => {
    const updated = [...addresses];
    if (form.isDefault) {
      updated.forEach((a) => (a.isDefault = false));
    }
    if (editIndex === -1) {
      updated.push({ ...form });
    } else {
      updated[editIndex] = { ...form };
    }
    await persistAddresses(updated);
    setEditIndex(null);
  };

  const handleDelete = async (index) => {
    const updated = addresses.filter((_, i) => i !== index);
    await persistAddresses(updated);
  };

  const setDefault = async (index) => {
    const updated = addresses.map((a, i) => ({ ...a, isDefault: i === index }));
    await persistAddresses(updated);
  };

  if (!isLoaded) {
    return <div className="py-12 text-center text-outline text-sm">Loading...</div>;
  }
  if (!isSignedIn) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="section-eyebrow">Delivery Addresses</span>
          <h2 className="font-headline text-[28px] md:text-[34px] text-navy font-light italic leading-tight mt-1">
            Addresses
          </h2>
        </div>
        {editIndex === null && (
          <button onClick={startAdd} className="btn-secondary hero py-3 px-6 text-[11px]">
            <span className="material-symbols-outlined text-[14px] mr-1">add</span>
            Add Address
          </button>
        )}
      </div>

      {/* Success toast */}
      {saved && (
        <div className="flex items-center gap-3 border border-gold-light bg-gold-lighter/20 px-5 py-3 animate-fade-in">
          <span className="material-symbols-outlined text-gold text-[18px]">check_circle</span>
          <p className="font-label text-[11px] text-navy tracking-wide">Addresses updated.</p>
        </div>
      )}

      {/* Address form */}
      {editIndex !== null && (
        <div className="border border-surface-dim bg-white p-6 md:p-8 space-y-5 animate-fade-in-up">
          <p className="font-label text-xs tracking-[0.2em] uppercase text-navy font-semibold">
            {editIndex === -1 ? "New Address" : "Edit Address"}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="font-label text-[11px] tracking-[0.25em] uppercase text-outline font-semibold">
                Label <span className="text-outline italic font-normal">(e.g. Home, Office)</span>
              </label>
              <input
                type="text"
                value={form.label}
                onChange={(e) => handleChange("label", e.target.value)}
                className="field-input"
                placeholder="Home"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-label text-[11px] tracking-[0.25em] uppercase text-outline font-semibold">Full Name *</label>
              <input type="text" value={form.fullName} onChange={(e) => handleChange("fullName", e.target.value)} className="field-input" placeholder="Recipient name" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-label text-[11px] tracking-[0.25em] uppercase text-outline font-semibold">Phone *</label>
            <input type="tel" value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} className="field-input" placeholder="+91 98xxx xxxxx" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-label text-[11px] tracking-[0.25em] uppercase text-outline font-semibold">Address Line 1 *</label>
            <input type="text" value={form.line1} onChange={(e) => handleChange("line1", e.target.value)} className="field-input" placeholder="House/flat number, street" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-label text-[11px] tracking-[0.25em] uppercase text-outline font-semibold">Address Line 2</label>
            <input type="text" value={form.line2} onChange={(e) => handleChange("line2", e.target.value)} className="field-input" placeholder="Landmark, area (optional)" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="font-label text-[11px] tracking-[0.25em] uppercase text-outline font-semibold">City *</label>
              <input type="text" value={form.city} onChange={(e) => handleChange("city", e.target.value)} className="field-input" placeholder="City" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-label text-[11px] tracking-[0.25em] uppercase text-outline font-semibold">State *</label>
              <input type="text" value={form.state} onChange={(e) => handleChange("state", e.target.value)} className="field-input" placeholder="State" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-label text-[11px] tracking-[0.25em] uppercase text-outline font-semibold">PIN Code *</label>
              <input type="text" value={form.zip} onChange={(e) => handleChange("zip", e.target.value)} className="field-input" placeholder="110001" />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer mt-2">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => handleChange("isDefault", e.target.checked)}
              className="accent-gold-light w-4 h-4"
            />
            <span className="font-label text-xs tracking-[0.12em] uppercase text-navy">Set as default address</span>
          </label>

          <div className="flex gap-3 pt-4 border-t border-surface-dim">
            <button onClick={cancelEdit} className="btn-secondary hero py-3 px-6 text-[11px]">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary py-3 px-6 text-[11px]">
              {saving ? "Saving..." : "Save Address"}
            </button>
          </div>
        </div>
      )}

      {/* Address list */}
      {addresses.length === 0 && editIndex === null && (
        <div className="border border-surface-dim bg-white p-10 text-center space-y-4">
          <span className="material-symbols-outlined text-outline-var text-[40px]">location_off</span>
          <p className="text-outline text-sm">No addresses saved yet.</p>
          <button onClick={startAdd} className="btn-primary py-3 px-6 text-[11px]">Add Your First Address</button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {addresses.map((addr, i) => (
          <div
            key={i}
            className={`border bg-white p-6 relative transition-colors ${
              addr.isDefault ? "border-gold-light" : "border-surface-dim"
            }`}
          >
            {addr.isDefault && (
              <span className="absolute top-3 right-3 badge-gold text-[7px] px-2 py-0.5">Default</span>
            )}

            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-[16px] text-outline">location_on</span>
              <p className="font-label text-xs tracking-[0.18em] uppercase text-navy font-bold">
                {addr.label || "Address"}
              </p>
            </div>

            <div className="text-sm text-slate-subtle leading-relaxed space-y-0.5">
              <p className="font-medium text-navy">{addr.fullName}</p>
              <p>{addr.line1}</p>
              {addr.line2 && <p>{addr.line2}</p>}
              <p>{addr.city}, {addr.state} {addr.zip}</p>
              <p className="text-outline text-xs">{addr.country}</p>
              {addr.phone && <p className="text-gold mt-1">{addr.phone}</p>}
            </div>

            <div className="flex gap-4 mt-4 pt-3 border-t border-surface-dim">
              <button
                onClick={() => startEdit(i)}
                className="font-label text-[11px] tracking-[0.15em] uppercase text-navy hover:text-gold transition-colors"
              >
                Edit
              </button>
              {!addr.isDefault && (
                <button
                  onClick={() => setDefault(i)}
                  className="font-label text-[11px] tracking-[0.15em] uppercase text-outline hover:text-navy transition-colors"
                >
                  Set Default
                </button>
              )}
              <button
                onClick={() => handleDelete(i)}
                className="font-label text-[11px] tracking-[0.15em] uppercase text-error hover:text-red-700 transition-colors ml-auto"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
