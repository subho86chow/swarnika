"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ProductCard from "../../components/ProductCard";
import { formatPrice } from "../../lib/data";

const PAD = "px-6 md:px-14 lg:px-20";
const MAX = "max-w-[1440px] mx-auto";

export default function ProductClient({ product, relatedProducts }) {
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [openAccordion, setOpenAccordion] = useState("artistry");
  const [wishlisted, setWishlisted] = useState(false);

  const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  const accordionSections = [
    { id: "artistry", title: "Technical Artistry", content: product.details?.join(" — ") || "Our proprietary alloy is tempered to achieve a unique finish, balancing the richness of high-karat gold with the structural integrity required for archival-grade jewelry." },
    { id: "provenance", title: "Provenance & Setting", content: "Every stone is set under a microscope by master craftsmen with over 30 years of experience. Each piece comes with a digital certificate of authenticity and ethical sourcing." },
    { id: "care", title: "Care & Preservation", content: "Store in the provided archival box when not wearing. Avoid contact with perfumes and harsh chemicals. Clean gently with a soft, dry cloth. Remove before swimming." },
    { id: "shipping", title: "Shipping & Returns", content: "Complimentary insured shipping on all orders. Standard delivery 5–7 business days. 30-day return policy. All pieces ship in signature SWARNIKA archival packaging." },
  ];

  const images = product.images?.length > 0 ? product.images.map(i => i.url) : [""];

  return (
    <>
      <main className="bg-background" style={{ paddingTop: '136px' }}>

        {/* ─── Breadcrumb ─── */}
        <div className={`${PAD} py-5 bg-ivory-dark border-b border-surface-dim`}>
          <div className={`${MAX} flex flex-wrap items-center gap-2 md:gap-3 font-label text-[9px] tracking-[0.2em] uppercase`}>
            <Link href="/" className="text-outline hover:text-navy transition-colors">The Archive</Link>
            <span className="text-outline-var">→</span>
            <Link href="/collections" className="text-outline hover:text-navy transition-colors">Collections</Link>
            <span className="text-outline-var">→</span>
            <span className="text-navy font-semibold overflow-hidden text-ellipsis whitespace-nowrap max-w-[150px] md:max-w-[300px]">
              {product.name}
            </span>
          </div>
        </div>

        {/* ─── Product Section ─── */}
        <section className={`${PAD} py-12 md:py-16 bg-background`}>
          <div className={`${MAX} grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16`}>

            {/* LEFT — Image Gallery */}
            <div className="lg:border-r lg:border-surface-dim lg:pr-10 animate-scale-in">
              <div className="relative aspect-[3/4] bg-ivory-dark overflow-hidden mb-4">
                {images[activeImage] && (
                  <Image src={images[activeImage]} alt={product.name} fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover transition-opacity duration-500" />
                )}
                {product.badge && (
                  <div className="absolute top-4 md:top-5 left-4 md:left-5 z-10">
                    <span className="inline-block px-3 py-1.5 font-label text-[8px] tracking-[0.2em] uppercase font-semibold bg-navy text-white">
                      {product.badge}
                    </span>
                  </div>
                )}
                <button onClick={() => setWishlisted(!wishlisted)} className="absolute top-4 md:top-5 right-4 md:right-5 z-10 w-10 h-10 bg-white/90 flex items-center justify-center">
                  <span className={`material-symbols-outlined text-[20px] ${wishlisted ? "text-gold-light" : "text-outline"}`}>favorite</span>
                </button>
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                  {images.map((img, idx) => (
                     <button key={idx} onClick={() => setActiveImage(idx)} className={`relative flex-shrink-0 w-16 h-20 border-2 transition-opacity ${activeImage === idx ? 'border-navy opacity-100' : 'border-transparent opacity-60'}`}>
                      {img && <Image src={img} alt="" fill className="object-cover" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT — Product Info */}
            <div className="flex flex-col gap-8 animate-fade-in-up delay-200">
              <div>
                <span className="font-label text-[9px] tracking-[0.3em] uppercase text-gold font-semibold block mb-2">{product.collection}</span>
                <h1 className="font-headline text-navy font-light italic leading-[1.05] text-3xl md:text-5xl">{product.name}</h1>
              </div>

              <div className="flex items-baseline gap-4 border-t border-surface-dim pt-6 md:pt-8">
                <span className="font-headline text-[28px] text-navy font-light">{formatPrice(product.price)}</span>
                {product.originalPrice && (
                  <>
                    <span className="font-body text-outline text-[15px] line-through">{formatPrice(product.originalPrice)}</span>
                    <span className="font-label text-[8px] tracking-[0.15em] uppercase text-gold-light border border-gold-light/40 px-2 py-1">{discount}% Off</span>
                  </>
                )}
              </div>

              <p className="font-body text-slate-subtle text-[13px] leading-loose">{product.description}</p>

              <div className="flex items-center gap-6">
                <span className="font-label text-[9px] tracking-[0.22em] uppercase text-outline font-semibold">Quantity</span>
                <div className="flex items-center border border-surface-dim">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="qty-btn w-10 h-11 flex items-center justify-center text-lg hover:bg-ivory-dark transition-colors">−</button>
                  <span className="w-10 h-11 inline-flex items-center justify-center text-[13px] font-medium text-navy border-x border-surface-dim">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="qty-btn w-10 h-11 flex items-center justify-center text-lg hover:bg-ivory-dark transition-colors">+</button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button className="btn-primary w-full py-5 text-[10px] flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">shopping_bag</span> Add to Cart
                </button>
                <button onClick={() => setWishlisted(!wishlisted)} className={`btn-secondary w-full py-5 text-[10px] flex items-center justify-center gap-2 ${wishlisted ? "border-gold-light text-gold" : ""}`}>
                  <span className="material-symbols-outlined text-[16px]">favorite</span>
                  {wishlisted ? "Saved" : "Add to Wishlist"}
                </button>
              </div>

              <div className="flex flex-wrap gap-3 border-t border-surface-dim pt-6">
                {["Certified Authentic", "Free Shipping", "30-Day Returns", "Gift Packaged"].map((t) => (
                  <span key={t} className="trust-tag">{t}</span>
                ))}
              </div>

              <div className="border-t border-surface-dim pt-6">
                <p className="section-eyebrow mb-4">Technical Artistry</p>
                {accordionSections.map((section) => (
                  <div key={section.id} className="border-b border-surface-dim">
                     <button onClick={() => setOpenAccordion(openAccordion === section.id ? null : section.id)} className="w-full flex items-center justify-between py-5 text-left group">
                      <span className="accordion-label group-hover:text-navy transition-colors">{section.title}</span>
                      <span className="material-symbols-outlined text-outline transition-transform duration-300" style={{ transform: openAccordion === section.id ? 'rotate(45deg)' : 'rotate(0deg)', fontSize: '18px' }}>add</span>
                    </button>
                    <div className="overflow-hidden transition-all duration-400 ease-in-out" style={{ maxHeight: openAccordion === section.id ? '20rem' : '0', paddingBottom: openAccordion === section.id ? '1.25rem' : '0' }}>
                      <p className="font-body text-outline text-[12px] leading-[1.8]">{section.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* ─── Complete the Look ─── */}
        {relatedProducts.length > 0 && (
          <section className={`${PAD} py-20 bg-ivory-dark`}>
            <div className={MAX}>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
                <div>
                  <span className="section-eyebrow">Complete the Look</span>
                  <h2 className="font-headline text-3xl md:text-[46px] text-navy font-light italic leading-tight mt-1">View Full Set</h2>
                </div>
                <Link href="/collections" className="btn-ghost self-start md:self-auto">
                  View All Archives <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10">
                {relatedProducts.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
              </div>
            </div>
          </section>
        )}

      </main>
    </>
  );
}
