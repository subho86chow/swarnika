"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";

export default function PasswordPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [showPasswords, setShowPasswords] = useState(false);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (form.newPassword.length < 8) {
      setMessage({ type: "error", text: "Password must be at least 8 characters." });
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match." });
      return;
    }

    setSaving(true);
    try {
      if (hasPassword) {
        // Changing existing password — currentPassword required
        await user.updatePassword({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        });
      } else {
        // Setting a password for the first time (social-only account)
        await user.updatePassword({
          newPassword: form.newPassword,
        });
      }
      setMessage({ type: "success", text: hasPassword ? "Password changed successfully." : "Password created successfully. You can now sign in with email & password." });
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      const errMsg = err?.errors?.[0]?.longMessage || err?.message || "Failed to update password.";
      setMessage({ type: "error", text: errMsg });
    } finally {
      setSaving(false);
    }
  };

  if (!isLoaded) {
    return <div className="py-12 text-center text-outline text-sm">Loading...</div>;
  }
  if (!isSignedIn) return null;

  const hasPassword = user?.passwordEnabled;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <span className="section-eyebrow">Security</span>
        <h2 className="font-headline text-[28px] md:text-[34px] text-navy font-light italic leading-tight mt-1">
          {hasPassword ? "Change Password" : "Set a Password"}
        </h2>
        {!hasPassword && (
          <p className="text-outline text-sm leading-relaxed mt-2">
            Your account uses social login. Add a password to also sign in with email &amp; password.
          </p>
        )}
      </div>

      {/* Message */}
      {message && (
        <div
          className={`flex items-center gap-3 px-5 py-3 animate-fade-in border ${
            message.type === "success"
              ? "border-gold-light bg-gold-lighter/20"
              : "border-error/30 bg-error/5"
          }`}
        >
          <span
            className={`material-symbols-outlined text-[18px] ${
              message.type === "success" ? "text-gold" : "text-error"
            }`}
          >
            {message.type === "success" ? "check_circle" : "error"}
          </span>
          <p className="font-label text-[11px] text-navy tracking-wide">{message.text}</p>
        </div>
      )}

      {/* Password form */}
      <form onSubmit={handleSubmit} className="border border-surface-dim bg-white p-6 md:p-8 space-y-6">
        {/* Current password — only shown if user already has one */}
        {hasPassword && (
          <div className="flex flex-col gap-1.5">
            <label className="font-label text-[11px] tracking-[0.25em] uppercase text-outline font-semibold">
              Current Password *
            </label>
            <input
              type={showPasswords ? "text" : "password"}
              value={form.currentPassword}
              onChange={(e) => handleChange("currentPassword", e.target.value)}
              className="field-input"
              required
              placeholder="Enter current password"
            />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex flex-col gap-1.5">
            <label className="font-label text-[11px] tracking-[0.25em] uppercase text-outline font-semibold">
              {hasPassword ? "New Password *" : "Password *"}
            </label>
            <input
              type={showPasswords ? "text" : "password"}
              value={form.newPassword}
              onChange={(e) => handleChange("newPassword", e.target.value)}
              className="field-input"
              required
              minLength={8}
              placeholder="Min. 8 characters"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-label text-[11px] tracking-[0.25em] uppercase text-outline font-semibold">
              Confirm Password *
            </label>
            <input
              type={showPasswords ? "text" : "password"}
              value={form.confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              className="field-input"
              required
              minLength={8}
              placeholder="Repeat password"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showPasswords}
            onChange={(e) => setShowPasswords(e.target.checked)}
            className="accent-gold-light w-4 h-4"
          />
          <span className="font-label text-xs tracking-[0.12em] uppercase text-outline">
            Show passwords
          </span>
        </label>

        <div className="pt-4 border-t border-surface-dim">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary py-3 px-8 text-[11px]"
          >
            {saving ? "Saving..." : hasPassword ? "Update Password" : "Create Password"}
          </button>
        </div>
      </form>
    </div>
  );
}
