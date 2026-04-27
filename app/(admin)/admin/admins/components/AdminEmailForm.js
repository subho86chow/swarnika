"use client";

import { useState } from "react";
import { addAdminEmail, deleteAdminEmail } from "../../../../lib/adminEmailActions";

export default function AdminEmailForm({ emails }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!email.trim()) return;

    setLoading(true);
    const formData = new FormData();
    formData.set("email", email.trim());

    try {
      await addAdminEmail(formData);
      setEmail("");
      window.location.reload();
    } catch (err) {
      setError(err.message || "Failed to add admin.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Are you sure you want to remove this admin?")) return;
    const formData = new FormData();
    formData.set("id", id);
    try {
      await deleteAdminEmail(formData);
      window.location.reload();
    } catch (err) {
      alert(err.message || "Failed to remove admin.");
    }
  }

  return (
    <div className="space-y-8">
      {/* Add Form */}
      <div className="bg-white border border-surface-dim p-6">
        <h3 className="font-headline text-lg text-navy italic mb-4">Add New Admin</h3>
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email address"
            className="flex-1 border border-surface-dim bg-white px-3 py-2 text-sm font-body text-navy outline-none focus:border-navy"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? "Adding..." : "Add Admin"}
          </button>
        </form>
        {error && <p className="text-error text-xs mt-2 font-body">{error}</p>}
      </div>

      {/* List */}
      <div className="bg-white border border-surface-dim">
        <div className="px-6 py-4 border-b border-surface-dim flex items-center justify-between">
          <h3 className="font-headline text-lg text-navy italic">Admin Emails</h3>
          <span className="text-outline text-xs font-label uppercase tracking-wider">
            {emails.length} total
          </span>
        </div>

        {emails.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <p className="text-outline text-sm font-body">
              No admin emails configured. Anyone signed in can access the admin panel.
            </p>
            <p className="text-outline text-xs font-body mt-1">
              Add at least one email to restrict access.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-surface-dim">
            {emails.map((item) => (
              <div
                key={item.id}
                className="px-6 py-3 flex items-center justify-between hover:bg-surface-low transition-colors"
              >
                <div>
                  <p className="font-body text-sm text-navy">{item.email}</p>
                  <p className="font-body text-[10px] text-outline mt-0.5">
                    Added {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-error text-xs font-label uppercase tracking-wider hover:underline"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
