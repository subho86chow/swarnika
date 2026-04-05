"use client";

import { useState } from "react";
import Image from "next/image";

const PAD = "px-6 md:px-14 lg:px-20";
const MAX = "max-w-[1440px] mx-auto";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", inquiry: "private-viewing", message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const inquiryTypes = [
    { value: "private-viewing", label: "Private Viewing" },
    { value: "bespoke", label: "Bespoke Commission" },
    { value: "general", label: "General Inquiry" },
    { value: "order", label: "Order Support" },
    { value: "wholesale", label: "Wholesale" },
  ];

  const flagships = [
    { city: "Mayfair Residence", address: "42 New Bond Street", city2: "London, W1S 2ST", country: "United Kingdom", phone: "+44 20 7946 0123", hours: "Mon–Sat: 10am – 7pm" },
    { city: "Place Vendôme Atelier", address: "12 Place Vendôme", city2: "Paris, 75001", country: "France", phone: "+33 1 42 61 58 58", hours: "Mon–Sat: 10am – 7pm" },
  ];

  return (
    <main className="bg-background pt-0">

        {/* ─── Editorial Header ─── */}
        <section className="relative overflow-hidden h-[52vh]">
          <Image src="/products/product-5.jpg" alt="Contact The Archive" fill priority className="object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/50 to-black/50" />
          <div className={`${PAD} absolute inset-0 flex flex-col justify-end pb-16`}>
            <div className={`${MAX} animate-fade-in-up w-full`}>
              <span className="section-eyebrow text-gold-light">THE ARCHIVE</span>
              <h1 className="font-headline text-white font-light italic leading-[1.0] mt-1 text-5xl md:text-7xl lg:text-[88px]">
                Personalized<br /><span className="font-normal">Expertise.</span>
              </h1>
            </div>
          </div>
        </section>

        {/* ─── Intro Strip ─── */}
        <section className={`${PAD} py-8 bg-navy`}>
          <div className={MAX}>
            <p className="font-body text-white/50 text-[13px] tracking-wide leading-relaxed max-w-[42rem]">
              Whether you seek a bespoke masterpiece or a private viewing of our heritage collection, our specialists are at your disposal.
            </p>
          </div>
        </section>

        {/* ─── Main Content: Split Layout ─── */}
        <section className={`${PAD} py-20 bg-background`}>
          <div className={`${MAX} grid grid-cols-1 lg:grid-cols-[1fr_1px_1fr] gap-10 lg:gap-16 items-start`}>

            {/* LEFT — Inquiry Form */}
            <div className="animate-fade-in-up">
              <div className="mb-10">
                <span className="section-eyebrow">Inquiry Form</span>
                <h2 className="font-headline text-[34px] md:text-[44px] text-navy font-light italic leading-tight mt-1">Begin a Conversation</h2>
              </div>

              {submitted ? (
                <div className="border border-surface-dim p-12 text-center space-y-4">
                  <div className="w-12 h-12 border border-gold-light flex items-center justify-center mx-auto">
                    <span className="material-symbols-outlined text-gold-light text-2xl">check</span>
                  </div>
                  <h3 className="font-headline text-2xl text-navy font-light italic">Thank you</h3>
                  <p className="font-body text-outline text-[13px] leading-relaxed">Your message has been received. A member of our team will be in touch within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                  <div>
                    <label className="font-label text-[9px] tracking-[0.25em] uppercase text-outline font-semibold block mb-4">Nature of Inquiry</label>
                    <div className="flex flex-wrap gap-2">
                      {inquiryTypes.map((type) => (
                        <button key={type.value} type="button" onClick={() => setFormData({ ...formData, inquiry: type.value })}
                          className={`inquiry-btn${formData.inquiry === type.value ? " active" : ""}`}>
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-5">
                    {[
                      { label: "Full Name *", type: "text", key: "name", placeholder: "Your name", required: true },
                      { label: "Email Address *", type: "email", key: "email", placeholder: "you@example.com", required: true },
                      { label: "Phone Number", type: "tel", key: "phone", placeholder: "+91 98xxx xxxxx", required: false },
                    ].map((field) => (
                      <div key={field.key} className="flex flex-col gap-1">
                        <label className="font-label text-[9px] tracking-[0.25em] uppercase text-outline font-semibold">{field.label}</label>
                        <input type={field.type} required={field.required} value={formData[field.key]} onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })} className="border border-surface-dim bg-white px-4 py-3 text-[12px] text-navy focus:outline-none focus:border-gold-light w-full" placeholder={field.placeholder} />
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col gap-1 mt-2">
                    <label className="font-label text-[9px] tracking-[0.25em] uppercase text-outline font-semibold">Your Message *</label>
                    <textarea required rows={5} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className="border border-surface-dim bg-white px-4 py-3 text-[12px] text-navy focus:outline-none focus:border-gold-light w-full resize-none" placeholder="Describe your inquiry..." />
                  </div>

                  <div className="pt-4">
                    <button type="submit" className="btn-primary w-full sm:w-auto inline-flex items-center justify-center gap-2">
                      Submit Inquiry <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Vertical Divider */}
            <div className="hidden lg:block bg-surface-dim self-stretch" />

            {/* RIGHT — Flagships */}
            <div className="animate-fade-in-up delay-200 flex flex-col gap-12">
              <div className="bg-navy p-10 relative">
                <div className="absolute top-4 right-4 w-6 h-6 border-t border-r border-gold-light/30" />
                <div className="absolute bottom-4 left-4 w-6 h-6 border-b border-l border-gold-light/30" />
                <span className="section-eyebrow text-gold-light">Private Viewing</span>
                <h3 className="font-headline text-[26px] text-white font-light italic leading-tight mt-2 mb-4">Experience our most exclusive high-jewelry pieces in the comfort of our private salons.</h3>
                <p className="font-body text-white/40 text-[12px] leading-relaxed mb-7">Our specialists curate a bespoke selection tailored to your style and occasion.</p>
                <button className="btn-primary-gold inline-flex">Book Appointment</button>
              </div>

              <div>
                <span className="section-eyebrow">Global Flagships</span>
                <h3 className="font-headline text-[24px] text-navy font-light italic mt-1 mb-8">Visit the Archive</h3>
                <div className="flex flex-col gap-8">
                  {flagships.map((store) => (
                    <div key={store.city} className="border border-surface-dim p-6 bg-white shrink-0">
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col gap-1">
                          <p className="font-label text-[10px] tracking-[0.22em] uppercase text-navy font-bold">{store.city}</p>
                          <p className="font-body text-[13px] text-slate-subtle leading-relaxed">{store.address}<br />{store.city2}<br /><span className="text-outline text-[11px]">{store.country}</span></p>
                          <p className="font-body text-[12px] text-gold mt-2">{store.phone}</p>
                          <p className="font-label text-[9px] tracking-[0.15em] uppercase text-outline mt-1">{store.hours}</p>
                        </div>
                        <span className="material-symbols-outlined text-outline-var text-[20px] mt-1">location_on</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-surface-dim pt-8 flex flex-col gap-3">
                <p className="font-label text-[9px] tracking-[0.25em] uppercase text-outline font-semibold">Direct Contact</p>
                <a href="mailto:archive@swarnika.com" className="hover-underline font-body text-[13px] text-navy block">archive@swarnika.com</a>
                <a href="tel:+912233490123" className="hover-underline font-body text-[13px] text-navy block">+91 22 3349 0123</a>
              </div>
            </div>

          </div>
        </section>

      </main>
    );
  }
