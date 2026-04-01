"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import { products, collections } from "../lib/data";

const PAD = "px-6 md:px-14 lg:px-20";
const MAX = "max-w-[1440px] mx-auto";

function CollectionsContent() {
  const searchParams = useSearchParams();
  const initialCollection = searchParams.get("collection") || "all";
  const initialTag = searchParams.get("tag") || "";

  const [activeCollection, setActiveCollection] = useState(initialCollection);
  const [activeTag, setActiveTag] = useState(initialTag);
  const [sortBy, setSortBy] = useState("featured");

  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (activeCollection !== "all") {
      result = result.filter((p) => p.collection === activeCollection);
    }
    if (activeTag) {
      result = result.filter((p) => p.tags.includes(activeTag));
    }
    switch (sortBy) {
      case "price-low":  result.sort((a, b) => a.price - b.price); break;
      case "price-high": result.sort((a, b) => b.price - a.price); break;
      case "name":       result.sort((a, b) => a.name.localeCompare(b.name)); break;
      default: break;
    }
    return result;
  }, [activeCollection, activeTag, sortBy]);

  const allTags = [...new Set(products.flatMap((p) => p.tags))];

  return (
    <>
      <Navbar />

      <main className="bg-background" style={{ paddingTop: '136px' }}>

        {/* ─── Collections Header ─── */}
        <section className={`${PAD} pt-10 pb-0 bg-background`}>
          <div className={MAX}>
            <div className="flex items-center gap-3 mb-8">
              <span className="font-label text-[9px] tracking-[0.3em] uppercase text-outline font-medium">The Archive</span>
              <span className="text-outline-var text-xs">→</span>
              <span className="font-label text-[9px] tracking-[0.3em] uppercase text-navy font-semibold">Masterpieces</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 items-end pb-10 border-b border-surface-dim">
              <div>
                <h1 className="font-headline text-navy font-light italic leading-[1.0] text-5xl md:text-7xl lg:text-[96px]">
                  Masterpieces
                </h1>
              </div>
              <div className="max-w-[380px]">
                <p className="font-body text-outline text-[13px] leading-relaxed">
                  An archival journey through centuries of craftsmanship. Each piece selected for its historical significance and artistic merit.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Sticky Filters ─── */}
        <section className={`${PAD} sticky top-[136px] z-30 py-0 bg-background/95 border-b border-surface-dim backdrop-blur-md`}>
          <div className={MAX}>
            <div className="tab-strip overflow-x-auto whitespace-nowrap flex no-scrollbar">
              <button
                onClick={() => { setActiveCollection("all"); setActiveTag(""); }}
                className={`filter-tab shrink-0 ${activeCollection === "all" && !activeTag ? " active" : ""}`}
              >
                All Pieces
              </button>
              {collections.map((col) => (
                <button
                  key={col.id}
                  onClick={() => { setActiveCollection(col.name); setActiveTag(""); }}
                  className={`filter-tab shrink-0 ${activeCollection === col.name ? " active" : ""}`}
                >
                  {col.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Tag pills + sort ─── */}
        <section className={`${PAD} py-5 bg-ivory-dark border-b border-surface-dim`}>
          <div className={`${MAX} flex flex-col md:flex-row flex-wrap md:items-center justify-between gap-4`}>
            <div className="flex flex-wrap gap-2">
              {activeTag && (
                <button
                  onClick={() => setActiveTag("")}
                  className="tag-pill active inline-flex items-center gap-1.5"
                >
                  {activeTag}
                  <span className="material-symbols-outlined text-[12px]">close</span>
                </button>
              )}
              {allTags.filter((t) => t !== activeTag).slice(0, 8).map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(tag)}
                  className="tag-pill"
                >
                  {tag}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
              <span className="font-body text-[11px] text-outline">
                {filteredProducts.length} piece{filteredProducts.length !== 1 ? "s" : ""}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-outline tracking-wide uppercase font-label">Sort</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price ↑</option>
                  <option value="price-high">Price ↓</option>
                  <option value="name">Name A–Z</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Product Grid ─── */}
        <section className={`${PAD} py-16 bg-background`}>
          <div className={MAX}>
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10">
                {filteredProducts.map((product, i) => (
                  <div
                    key={product.id}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${Math.min(i * 0.06, 0.5)}s` }}
                  >
                    <ProductCard product={product} index={i} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-28 space-y-6">
                <div className="w-16 h-[1px] bg-outline-var mx-auto" />
                <h3 className="font-headline text-2xl text-navy font-light italic">No pieces found</h3>
                <p className="font-body text-outline text-[13px]">Try adjusting your filters to discover more treasures.</p>
                <button onClick={() => { setActiveCollection("all"); setActiveTag(""); }} className="btn-primary mt-2">
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ─── Heritage Vault CTA ─── */}
        <section className={`${PAD} py-20 bg-navy`}>
          <div className={`${MAX} text-center`}>
            <span className="section-eyebrow flex justify-center text-gold-light">Heritage Vault</span>
            <h2 className="font-headline text-[36px] md:text-[52px] text-white font-light italic mt-2 mb-6">
              Step Inside the Sanctuary
            </h2>
            <p className="font-body text-white/50 text-[13px] leading-relaxed max-w-md mx-auto mb-10">
              These one-of-a-kind pieces are not available for public sale and require a verified invitation for viewing.
            </p>
            <a href="/contact" className="btn-primary-gold inline-flex">Request an Invitation</a>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}

export default function CollectionsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <div className="w-8 h-[1px] bg-gold-light mx-auto" />
          <span className="font-label text-[9px] tracking-[0.4em] uppercase text-navy animate-pulse">
            Loading The Archive...
          </span>
        </div>
      </div>
    }>
      <CollectionsContent />
    </Suspense>
  );
}
