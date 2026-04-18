"use client";

import Link from "next/link";
import Image from "next/image";
import { FaInstagram, FaFacebookF, FaTwitter } from "react-icons/fa";
import NewsletterForm from "./NewsletterForm";

const PAD = "px-6 md:px-14 lg:px-20";
const MAX = "max-w-[1440px] mx-auto";

export default function Footer({ categories = [] }) {
  const topCategories = categories.slice(0, 5);

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
            <NewsletterForm />
          </div>
        </div>
      </div>

      {/* ── Main Footer Grid ── */}
      <div className={`${PAD} py-16 ${MAX}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">

          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-6">
            <div>
              <Link href="/">
                <Image
                  src="/products/logo.svg"
                  alt="Swarnika Logo"
                  width={140}
                  height={48}
                  className="w-[120px] h-auto opacity-90 hover:opacity-100 transition-opacity"
                />
              </Link>
            </div>
            <p className="font-body text-[13px] text-white/50 leading-relaxed max-w-xs">
              Bridging ancestral craftsmanship and contemporary silhouettes. Each
              piece a quiet testament to eternal beauty.
            </p>
            {/* Social */}
            <div className="flex gap-3 pt-2">
              {[
                { label: "Facebook", Icon: FaFacebookF, link: "https://www.facebook.com/share/1bwQTZUsb1/" },
                { label: "Instagram", Icon: FaInstagram, link: "https://www.instagram.com/swar_nikaofficial?igsh=MWtzc2szazJoZjc4ZA==" },
                { label: "Twitter", Icon: FaTwitter, link: "https://x.com/SwarnikaJewels" },
              ].map(({ label, Icon, link }) => (
                <a
                  key={label}
                  href={link}
                  aria-label={label}
                  className="social-btn w-10 h-10 border border-white/20 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:border-white/50 transition-colors"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Spacer */}
          <div className="hidden lg:block lg:col-span-1" />

          {/* Categories */}
          <div className="lg:col-span-2 space-y-5">
            <h5 className="font-label text-[9px] font-bold tracking-[0.28em] uppercase text-white/80">
              Categories
            </h5>
            <ul className="space-y-3.5">
              {topCategories.map((cat) => (
                <li key={cat.id}>
                  <Link href={`/categories?category=${encodeURIComponent(cat.name)}`} className="hover-underline font-body text-[12px] text-white/40 hover:text-white/80 transition-colors duration-200">
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/categories" className="hover-underline font-body text-[12px] text-white/40 hover:text-white/80 transition-colors duration-200 font-semibold italic">
                  View All Collection
                </Link>
              </li>
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
              city: "Lucknow",
              address: "262, Sushila Sadan\nKaushalpuri Khargapur\nGomtinagar Lucknow\nUttar Pradesh\n226010",
              phone: "",
            },
          ].map((store) => (
            <div key={store.city} className="space-y-1.5 md:col-start-3">
              <p className="font-label text-[10px] tracking-[0.2em] uppercase text-white/80 font-semibold">
                {store.city}
              </p>
              <p className="font-body text-[12px] text-white/40 leading-relaxed whitespace-pre-line">
                {store.address}
              </p>
              {store.phone && (
                <p className="font-body text-[12px] text-white/30">
                  {store.phone}
                </p>
              )}
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
