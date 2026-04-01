"use client";

import Link from "next/link";

const PAD = "px-6 md:px-14 lg:px-20";
const MAX = "max-w-[1440px] mx-auto";

export default function Footer() {
  return (
    <footer className="w-full bg-navy text-white">

      {/* ── Newsletter Strip ── */}
      <div className="border-b border-white/10">
        <div className={`${PAD} py-16 ${MAX}`}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-center">
            <div>
              <span className="section-eyebrow text-gold-light">The Inner Circle</span>
              <h4 className="font-headline text-3xl md:text-4xl text-white font-light italic leading-tight mt-1">
                Join The Archive
              </h4>
              <p className="font-body text-[13px] text-white/50 mt-4 leading-relaxed max-w-sm">
                Receive early access to limited editions, private events, and
                invitations to bespoke consultations.
              </p>
            </div>
            <form
              className="flex flex-col sm:flex-row items-stretch gap-0 w-full"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="Your email address"
                className="subscribe-input w-full sm:flex-1 bg-white/5 border border-white/20 text-white px-5 py-4 font-body text-[13px] placeholder:text-white/40 focus:outline-none focus:border-gold-light transition-colors"
                required
              />
              <button
                type="submit"
                className="subscribe-btn bg-white text-navy font-label text-[9px] tracking-[0.2em] uppercase font-bold px-8 py-4 sm:py-0 hover:bg-white/80 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ── Main Footer Grid ── */}
      <div className={`${PAD} py-16 ${MAX}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">

          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-6">
            <div>
              <span className="text-[9px] tracking-[0.4em] uppercase text-gold-light font-label font-medium block mb-1">
                The Archive
              </span>
              <span className="font-headline text-2xl tracking-[0.2em] uppercase text-white font-light block">
                SWARNIKA
              </span>
              <span className="font-label text-[8px] tracking-[0.35em] uppercase text-white/40 font-medium">
                House of Jewelry
              </span>
            </div>
            <p className="font-body text-[13px] text-white/50 leading-relaxed max-w-xs">
              Bridging ancestral craftsmanship and contemporary silhouettes. Each
              piece a quiet testament to eternal beauty.
            </p>
            {/* Social */}
            <div className="flex gap-3 pt-2">
              {[
                { label: "Instagram", icon: "photo_camera" },
                { label: "Pinterest", icon: "interests" },
                { label: "Facebook", icon: "public" },
              ].map(({ label, icon }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="social-btn w-10 h-10 border border-white/20 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:border-white/50 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">{icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Spacer */}
          <div className="hidden lg:block lg:col-span-1" />

          {/* Collections */}
          <div className="lg:col-span-2 space-y-5">
            <h5 className="font-label text-[9px] font-bold tracking-[0.28em] uppercase text-white/80">
              Collections
            </h5>
            <ul className="space-y-3.5">
              {[
                { href: "/collections?tag=new", label: "New Arrivals" },
                { href: "/collections?tag=bestseller", label: "Best Sellers" },
                { href: "/collections", label: "All Jewelry" },
                { href: "/collections?tag=bridal", label: "Bridal Suite" },
                { href: "/collections?collection=The Heritage Line", label: "Heritage Line" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover-underline font-body text-[12px] text-white/40 hover:text-white/80 transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Care */}
          <div className="lg:col-span-2 space-y-5">
            <h5 className="font-label text-[9px] font-bold tracking-[0.28em] uppercase text-white/80">
              Client Services
            </h5>
            <ul className="space-y-3.5">
              {[
                { href: "/contact", label: "Contact Us" },
                { href: "/shipping", label: "Shipping & Returns" },
                { href: "/care-guide", label: "Jewelry Care" },
                { href: "/faq", label: "FAQs" },
                { href: "#", label: "Book Appointment" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover-underline font-body text-[12px] text-white/40 hover:text-white/80 transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* The House */}
          <div className="lg:col-span-2 space-y-5">
            <h5 className="font-label text-[9px] font-bold tracking-[0.28em] uppercase text-white/80">
              The House
            </h5>
            <ul className="space-y-3.5">
              {[
                { href: "/about", label: "Our Story" },
                { href: "/about", label: "The Artisans" },
                { href: "/contact", label: "Store Locator" },
                { href: "#", label: "Careers" },
              ].map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover-underline font-body text-[12px] text-white/40 hover:text-white/80 transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Flagship Addresses */}
          <div className="lg:col-span-1 hidden lg:block" />
        </div>

        {/* Global Flagships */}
        <div className="mt-14 pt-10 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <span className="section-eyebrow text-gold-light">Global Flagships</span>
          </div>
          {[
            {
              city: "London",
              address: "42 New Bond Street, Mayfair, W1S 2ST",
              phone: "+44 20 7946 0123",
            },
            {
              city: "Paris",
              address: "12 Place Vendôme, 75001 Paris",
              phone: "+33 1 42 61 58 58",
            },
          ].map((store) => (
            <div key={store.city} className="space-y-1.5">
              <p className="font-label text-[10px] tracking-[0.2em] uppercase text-white/80 font-semibold">
                {store.city}
              </p>
              <p className="font-body text-[12px] text-white/40 leading-relaxed">
                {store.address}
              </p>
              <p className="font-body text-[12px] text-white/30">
                {store.phone}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <div className="border-t border-white/10">
        <div className={`${PAD} py-5 ${MAX} flex flex-col md:flex-row items-center justify-between gap-4`}>
          <p className="font-label text-white/25 text-[9px] tracking-[0.22em] uppercase font-medium text-center md:text-left">
            © {new Date().getFullYear()} SWARNIKA House of Jewelry. All Rights Reserved.
          </p>
          <div className="flex gap-4 md:gap-8 flex-wrap justify-center">
            {["Privacy Policy", "Terms of Service", "Contact Us"].map((text) => (
              <a
                key={text}
                href="#"
                className="font-label text-white/25 hover:text-white/60 transition-colors text-[9px] tracking-[0.22em] uppercase font-medium"
              >
                {text}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
