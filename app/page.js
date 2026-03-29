"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProductCard from "./components/ProductCard";
import { products, formatPrice } from "./lib/data";

const PAD = "px-6 md:px-14 lg:px-20";
const MAX = "max-w-[1440px] mx-auto";

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const heroImages = [
    "/products/product-1.jpg",
    "/products/product-3.jpg",
    "/products/product-4.jpg"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  const bestsellers = products.slice(0, 4);
  const newArrivals = products.slice(4, 8);

  return (
    <>
      <Navbar />

      <main className="pt-0 bg-[#faf8f3]">

        {/* ─── Hero ─── */}
        <section className="relative w-full h-[92vh] overflow-hidden">
          <div className="absolute inset-0 z-0 bg-[#0a0a0a]">
            {heroImages.map((src, idx) => (
              <Image 
                key={src}
                src={src} 
                alt="The Archive Background" 
                fill 
                priority={idx === 0} 
                className={`object-cover object-center transition-opacity duration-[1500ms] ${idx === currentSlide ? "opacity-100" : "opacity-0"}`} 
                sizes="100vw" 
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/30 to-black/10" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </div>
          <div className={`${PAD} relative z-10 h-full flex items-end pb-20`}>
            <div className="max-w-[700px] animate-fade-in-up">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-[40px] h-[1px] bg-[#c9a44a]" />
                <span className="font-label text-[9px] tracking-[0.4em] uppercase text-[#c9a44a] font-medium">The Signature Collection</span>
              </div>
              <h1 className="font-headline text-white font-light italic leading-[1.0] mb-6 text-5xl md:text-7xl lg:text-[88px]">
                Ancient Spirit,<br /><span className="font-normal">Modern Grace.</span>
              </h1>
              <p className="font-body text-white/70 text-[13px] leading-relaxed mb-10 delay-200 animate-fade-in max-w-[480px]">
                A curation of high-jewelry pieces that bridge the gap between ancestral craftsmanship and contemporary silhouettes. Each piece a quiet testament to eternal beauty.
              </p>
              <div className="flex flex-wrap gap-4 delay-300 animate-fade-in">
                <Link href="/collections" className="bg-white text-[#0a0a0a] py-4 px-10 font-label text-[9px] font-bold tracking-[0.28em] uppercase flex items-center transition-colors hover:bg-white/90">Explore The Archive</Link>
                <Link href="/contact" className="border border-white/50 text-white py-4 px-10 font-label text-[9px] font-medium tracking-[0.28em] uppercase flex items-center transition-colors hover:bg-white/10">Book a Private Viewing</Link>
              </div>
            </div>
          </div>
          <div className="absolute bottom-8 right-10 z-10 flex-col items-center gap-2 opacity-50 hidden md:flex">
            <span className="font-label text-[8px] tracking-[0.3em] uppercase text-white rotate-90 origin-center">Scroll</span>
          </div>
          
          {/* Slide Indicators */}
          <div className="absolute bottom-10 left-6 md:left-14 lg:left-20 z-20 flex gap-2.5">
            {heroImages.map((_, idx) => (
              <button 
                key={idx} 
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`transition-all duration-500 rounded-full ${idx === currentSlide ? "w-6 bg-white" : "w-1.5 bg-white/40 hover:bg-white/70"} h-1.5`}
              />
            ))}
          </div>
        </section>

        {/* ─── Category Rail ─── */}
        <section className={`${PAD} bg-[#0a0a0a] py-5 overflow-x-auto overflow-y-hidden no-scrollbar`}>
          <div className={`${MAX} flex gap-8 md:gap-16 justify-start md:justify-center min-w-max items-center`}>
            {[
              { name: "Earrings", url: "/collections?tag=diamond" },
              { name: "Necklaces", url: "/collections?collection=The Heritage Line" },
              { name: "Bracelets", url: "/collections?tag=gold" },
              { name: "Rings", url: "/collections?tag=new" },
              { name: "Bridal", url: "/collections?tag=bridal" },
              { name: "Bespoke", url: "/contact" },
            ].map((cat, i) => (
              <Link key={cat.name} href={cat.url} className="flex items-center gap-3 group whitespace-nowrap">
                {i > 0 && <span className="text-white/15 text-xs">◆</span>}
                <span className="font-label text-[9.5px] tracking-[0.28em] uppercase text-white/50 group-hover:text-[#c9a44a] transition-colors duration-300 font-medium">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ─── Bestsellers ─── */}
        <section className={`${PAD} py-20 bg-[#faf8f3]`}>
          <div className={MAX}>
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-4">
              <div>
                <span className="section-eyebrow">The Signature Selection</span>
                <h2 className="font-headline text-[38px] md:text-[52px] text-[#0a0a0a] font-light leading-tight">Bestsellers</h2>
              </div>
              <Link href="/collections?tag=bestseller" className="btn-ghost self-start md:self-auto mb-1">
                View All Archives <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>
            <div className="tab-strip overflow-x-auto whitespace-nowrap mb-12 flex no-scrollbar">
              {["All", "Necklaces", "Earrings", "Rings", "Bridal"].map((tab, idx) => (
                <button key={tab} className={`filter-tab${idx === 0 ? " active" : ""}`}>{tab}</button>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10">
              {bestsellers.map((product, i) => (
                <div key={product.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                  <ProductCard product={product} index={i} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Heritage Banner ─── */}
        <section className={`${PAD} py-24 bg-[#0a0a0a] relative overflow-hidden`}>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #c9a44a 0, #c9a44a 1px, transparent 0, transparent 50%)', backgroundSize: '8px 8px' }} />
          </div>
          <div className={`${MAX} relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center`}>
            <div className="animate-fade-in-up order-2 lg:order-1">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-[32px] h-[1px] bg-[#c9a44a]" />
                <span className="font-label text-[9px] tracking-[0.4em] uppercase text-[#c9a44a] font-medium">The Art of the Slow Craft</span>
              </div>
              <h2 className="font-headline text-white font-light italic leading-[1.05] mb-8 text-4xl md:text-5xl lg:text-[58px]">
                A Heritage<br /><span className="font-normal">Reborn</span>
              </h2>
              <p className="font-body text-white/55 text-[13px] leading-loose mb-4 max-w-[440px]">
                In an era of fleeting trends, SWARNIKA remains anchored in the philosophy of permanence. Our artisans dedicate hundreds of hours to a single creation.
              </p>
              <p className="font-body text-white/35 text-[12px] leading-loose mb-10 max-w-[400px]">
                From hand-selected ethically sourced gems to traditional lost-wax casting, our process is a pilgrimage toward perfection.
              </p>
              <Link href="/about" className="btn-primary-gold inline-flex">Discover Our Heritage</Link>
            </div>
            <div className="relative aspect-[4/5] overflow-hidden order-1 lg:order-2 w-full max-w-md mx-auto lg:max-w-full">
              <Image src="/products/product-7.jpg" alt="The Art of Slow Craft" fill className="object-cover opacity-80" />
              <div className="absolute inset-6 border border-[#c9a44a]/20 pointer-events-none" />
            </div>
          </div>
        </section>

        {/* ─── New Arrivals ─── */}
        <section className={`${PAD} py-20 bg-[#f4f1ea]`}>
          <div className={MAX}>
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-4">
              <div>
                <span className="section-eyebrow">Just Arrived</span>
                <h2 className="font-headline text-[38px] md:text-[52px] text-[#0a0a0a] font-light leading-tight">New Pieces</h2>
              </div>
              <Link href="/collections" className="btn-ghost self-start md:self-auto mb-1">
                View All <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10">
              {newArrivals.map((product, i) => (
                <div key={product.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                  <ProductCard product={product} index={i} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Private Viewing CTA ─── */}
        <section className={`${PAD} py-20 bg-[#faf8f3]`}>
          <div className={MAX}>
            <div className="border border-[#e8e4db] px-6 py-12 md:py-16 md:px-20 text-center relative max-w-4xl mx-auto">
              {/* Corner Accents */}
              <div className="absolute top-4 left-4 w-8 h-8 border-t border-l border-[#c9a44a]/40" />
              <div className="absolute top-4 right-4 w-8 h-8 border-t border-r border-[#c9a44a]/40" />
              <div className="absolute bottom-4 left-4 w-8 h-8 border-b border-l border-[#c9a44a]/40" />
              <div className="absolute bottom-4 right-4 w-8 h-8 border-b border-r border-[#c9a44a]/40" />
              
              <span className="section-eyebrow flex justify-center">A Private Viewing</span>
              <h2 className="font-headline text-[36px] md:text-[52px] text-[#0a0a0a] font-light italic leading-tight mt-2 mb-6">Experience the Collection</h2>
              <p className="font-body text-[#6b6b6b] text-[13px] leading-relaxed mx-auto mb-10 max-w-[512px]">
                Experience the collection in the quiet luxury of our flagship stores, or via a virtual consultation with our master curators.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="/contact" className="btn-primary">Book an Appointment</Link>
                <Link href="/collections" className="btn-secondary">View All Collections</Link>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Trust Pillars ─── */}
        <section className={`${PAD} py-12 bg-[#0a0a0a] border-t border-white/10`}>
          <div className={`${MAX} grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0`}>
            {[
              { num: "01", label: "Certified Authentic", sub: "Every piece verified" },
              { num: "02", label: "Complimentary Shipping", sub: "On all orders" },
              { num: "03", label: "30-Day Returns", sub: "No questions asked" },
              { num: "04", label: "Lifetime Warranty", sub: "Archival guarantee" },
            ].map((item, i) => (
              <div key={item.label} className={`flex flex-col items-center justify-center gap-2 px-6 py-4 text-center ${i > 0 ? 'lg:border-l lg:border-white/10' : ''}`}>
                <span className="font-headline text-[28px] font-light leading-none text-[#c9a44a]/40">{item.num}</span>
                <span className="font-label text-[9px] tracking-[0.22em] uppercase font-semibold text-white/70 mt-1">{item.label}</span>
                <span className="font-body text-[11px] text-white/30">{item.sub}</span>
              </div>
            ))}
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}
