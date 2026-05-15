"use client";

import { useState } from "react";

const PAD = "px-6 md:px-14 lg:px-20";
const MAX = "max-w-[1440px] mx-auto";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="bg-background pt-[72px]">

      {/* ─── Header ─── */}
      <section className={`${PAD} pt-10 pb-6 bg-background`}>
        <div className={MAX}>
          <div className="flex items-center gap-3 mb-6">
            <span className="font-label text-[9px] tracking-[0.3em] uppercase text-outline font-medium">The Archive</span>
            <span className="text-outline-var text-xs">→</span>
            <span className="font-label text-[9px] tracking-[0.3em] uppercase text-navy font-semibold">Contact</span>
          </div>
          <h1 className="font-headline text-navy font-light italic leading-[1.0] text-4xl md:text-5xl lg:text-[56px] mb-4">
            Get in Touch
          </h1>
          <p className="font-body text-outline text-sm leading-relaxed max-w-xl">
            Whether you seek a bespoke masterpiece or have a question about an order, our specialists are at your disposal.
          </p>
          <div className="mt-8 h-[1px] bg-surface-dim" />
        </div>
      </section>

      {/* ─── Form + Contact Info ─── */}
      <section className={`${PAD} py-12 md:py-16 bg-background`}>
        <div className={`${MAX} grid grid-cols-1 lg:grid-cols-[1fr_1px_1fr] gap-10 lg:gap-16 items-start`}>

          {/* LEFT — Form */}
          <div className="animate-fade-in-up">
            {submitted ? (
              <div className="border border-surface-dim p-12 text-center space-y-4 bg-white">
                <div className="w-12 h-12 border border-gold-light flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-gold-light text-2xl">check</span>
                </div>
                <h3 className="font-headline text-2xl text-navy font-light italic">Thank you</h3>
                <p className="font-body text-outline text-sm leading-relaxed">Your message has been received. A member of our team will be in touch within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 p-3 text-error text-xs">
                    {error}
                  </div>
                )}
                <div className="flex flex-col gap-5">
                  {[
                    { label: "Full Name *", type: "text", key: "name", placeholder: "Your name", required: true },
                    { label: "Email Address *", type: "email", key: "email", placeholder: "you@example.com", required: true },
                    { label: "Phone Number", type: "tel", key: "phone", placeholder: "+91 98xxx xxxxx", required: false },
                  ].map((field) => (
                    <div key={field.key} className="flex flex-col gap-1">
                      <label className="font-label text-[9px] tracking-[0.25em] uppercase text-outline font-semibold">{field.label}</label>
                      <input
                        type={field.type}
                        required={field.required}
                        value={formData[field.key]}
                        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                        className="border border-surface-dim bg-white px-4 py-3 text-xs text-navy focus:outline-none focus:border-gold-light w-full"
                        placeholder={field.placeholder}
                      />
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-1 mt-2">
                  <label className="font-label text-[9px] tracking-[0.25em] uppercase text-outline font-semibold">Your Message *</label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="border border-surface-dim bg-white px-4 py-3 text-xs text-navy focus:outline-none focus:border-gold-light w-full resize-none"
                    placeholder="Describe your inquiry..."
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary w-full sm:w-auto inline-flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? "Submitting..." : "Submit Inquiry"}
                    {!submitting && <span className="material-symbols-outlined text-[16px]">arrow_forward</span>}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Divider */}
          <div className="hidden lg:block bg-surface-dim self-stretch" />

          {/* RIGHT — Contact Info */}
          <div className="animate-fade-in-up delay-200 flex flex-col gap-10">
            <div>
              <span className="section-eyebrow">Flagship Store</span>
              <h3 className="font-headline text-[24px] text-navy font-light italic mt-1 mb-6">Visit the Archive</h3>
              <div className="border border-surface-dim p-6 bg-white">
                <div className="flex flex-col gap-1">
                  <p className="font-label text-[10px] tracking-[0.22em] uppercase text-navy font-bold">Lucknow</p>
                  <p className="font-body text-sm text-slate-subtle leading-relaxed">
                    262, Sushila Sadan<br />
                    Kaushalpuri Khargapur<br />
                    Gomtinagar<br />
                    Uttar Pradesh<br />
                    <span className="text-outline text-xs">India</span>
                  </p>
                  <p className="font-label text-[9px] tracking-[0.15em] uppercase text-outline mt-2">Mon–Sat: 10am – 7pm</p>
                </div>
              </div>
            </div>

            <div className="border-t border-surface-dim pt-8 flex flex-col gap-4">
              <div>
                <p className="font-label text-[9px] tracking-[0.25em] uppercase text-outline font-semibold mb-2">Email</p>
                <a href="mailto:ajay20132013@gmail.com" className="hover-underline font-body text-sm text-navy block">ajay20132013@gmail.com</a>
              </div>
              <div>
                <p className="font-label text-[9px] tracking-[0.25em] uppercase text-outline font-semibold mb-2">Phone</p>
                <a href="tel:+918574955947" className="hover-underline font-body text-sm text-navy block">+91 85749 55947</a>
              </div>
            </div>
          </div>

        </div>
      </section>

    </main>
  );
}
