"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";

const GENDER_OPTIONS = ["Female", "Male", "Non-binary", "Prefer not to say"];

export default function ProfilePage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    birthday: "",
    anniversary: "",
    gender: "",
    specialDates: [],
  });

  // Sync Clerk user data into form
  useEffect(() => {
    if (isLoaded && user) {
      const meta = user.unsafeMetadata || {};
      setForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        birthday: meta.birthday || "",
        anniversary: meta.anniversary || "",
        gender: meta.gender || "",
        specialDates: meta.specialDates || [],
      });
    }
  }, [isLoaded, user]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const addSpecialDate = () => {
    setForm((prev) => ({
      ...prev,
      specialDates: [...prev.specialDates, { label: "", date: "" }],
    }));
  };

  const updateSpecialDate = (index, key, value) => {
    setForm((prev) => {
      const updated = [...prev.specialDates];
      updated[index] = { ...updated[index], [key]: value };
      return { ...prev, specialDates: updated };
    });
  };

  const removeSpecialDate = (index) => {
    setForm((prev) => ({
      ...prev,
      specialDates: prev.specialDates.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await user.update({
        firstName: form.firstName,
        lastName: form.lastName,
        unsafeMetadata: {
          ...user.unsafeMetadata,
          birthday: form.birthday,
          anniversary: form.anniversary,
          gender: form.gender,
          specialDates: form.specialDates,
        },
      });
      setSaved(true);
      setEditMode(false);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Failed to save profile:", err);
    } finally {
      setSaving(false);
    }
  };

  if (!isLoaded) {
    return <div className="py-12 text-center text-outline text-sm">Loading...</div>;
  }
  if (!isSignedIn) return null;

  const email = user?.primaryEmailAddress?.emailAddress || "—";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="section-eyebrow">Personal Information</span>
          <h2 className="font-headline text-[28px] md:text-[34px] text-navy font-light italic leading-tight mt-1">
            My Profile
          </h2>
        </div>
        {!editMode ? (
          <button onClick={() => setEditMode(true)} className="btn-secondary py-3 px-6 text-[11px]">
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => { setEditMode(false); }}
              className="btn-secondary hero py-3 px-6 text-[11px]"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary py-3 px-6 text-[11px]"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </div>

      {/* Success toast */}
      {saved && (
        <div className="flex items-center gap-3 border border-gold-light bg-gold-lighter/20 px-5 py-3 animate-fade-in">
          <span className="material-symbols-outlined text-gold text-[18px]">check_circle</span>
          <p className="font-label text-[11px] text-navy tracking-wide">Profile updated successfully.</p>
        </div>
      )}

      {/* Form */}
      <div className="border border-surface-dim bg-white p-6 md:p-8 space-y-6">
        {/* Name row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FieldGroup label="First Name" required>
            {editMode ? (
              <input
                type="text"
                value={form.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                className="field-input"
                placeholder="First name"
              />
            ) : (
              <p className="field-value">{form.firstName || "—"}</p>
            )}
          </FieldGroup>
          <FieldGroup label="Last Name" required>
            {editMode ? (
              <input
                type="text"
                value={form.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                className="field-input"
                placeholder="Last name"
              />
            ) : (
              <p className="field-value">{form.lastName || "—"}</p>
            )}
          </FieldGroup>
        </div>

        {/* Email — read-only (managed by Clerk) */}
        <FieldGroup label="Email Address" hint="Managed by your sign-in provider">
          <p className="field-value">{email}</p>
        </FieldGroup>

        {/* Gender */}
        <FieldGroup label="Gender">
          {editMode ? (
            <div className="flex flex-wrap gap-2">
              {GENDER_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleChange("gender", opt)}
                  className={`inquiry-btn ${form.gender === opt ? "active" : ""}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          ) : (
            <p className="field-value">{form.gender || "—"}</p>
          )}
        </FieldGroup>

        {/* Date fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FieldGroup label="Birthday">
            {editMode ? (
              <input
                type="date"
                value={form.birthday}
                onChange={(e) => handleChange("birthday", e.target.value)}
                className="field-input"
              />
            ) : (
              <p className="field-value">
                {form.birthday ? new Date(form.birthday).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" }) : "—"}
              </p>
            )}
          </FieldGroup>
          <FieldGroup label="Anniversary">
            {editMode ? (
              <input
                type="date"
                value={form.anniversary}
                onChange={(e) => handleChange("anniversary", e.target.value)}
                className="field-input"
              />
            ) : (
              <p className="field-value">
                {form.anniversary ? new Date(form.anniversary).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" }) : "—"}
              </p>
            )}
          </FieldGroup>
        </div>

        {/* Special dates */}
        <div className="border-t border-surface-dim pt-6">
          <div className="flex items-center justify-between mb-4">
            <p className="font-label text-[11px] tracking-[0.25em] uppercase text-outline font-semibold">
              Special Dates
            </p>
            {editMode && (
              <button
                type="button"
                onClick={addSpecialDate}
                className="flex items-center gap-1 font-label text-[11px] tracking-[0.15em] uppercase text-gold hover:text-navy transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                Add Date
              </button>
            )}
          </div>

          {form.specialDates.length === 0 && (
            <p className="text-outline text-xs italic">No special dates added yet.</p>
          )}

          <div className="flex flex-col gap-3">
            {form.specialDates.map((sd, i) => (
              <div key={i} className="flex items-center gap-3">
                {editMode ? (
                  <>
                    <input
                      type="text"
                      value={sd.label}
                      onChange={(e) => updateSpecialDate(i, "label", e.target.value)}
                      className="field-input flex-1"
                      placeholder="e.g. Mother's Birthday"
                    />
                    <input
                      type="date"
                      value={sd.date}
                      onChange={(e) => updateSpecialDate(i, "date", e.target.value)}
                      className="field-input w-[160px]"
                    />
                    <button
                      type="button"
                      onClick={() => removeSpecialDate(i)}
                      className="text-error hover:text-red-700 transition-colors shrink-0"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </>
                ) : (
                  <div className="flex items-center justify-between w-full border-b border-surface-dim pb-2">
                    <span className="text-navy text-sm font-medium">{sd.label || "Untitled"}</span>
                    <span className="text-outline text-xs">
                      {sd.date ? new Date(sd.date).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" }) : "—"}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FieldGroup({ label, required, hint, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-label text-[11px] tracking-[0.25em] uppercase text-outline font-semibold">
        {label} {required && <span className="text-error">*</span>}
      </label>
      {children}
      {hint && <span className="text-outline text-xs italic">{hint}</span>}
    </div>
  );
}
