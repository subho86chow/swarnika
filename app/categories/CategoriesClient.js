"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "../components/ProductCard";

function CategoriesFilterLogic({ initialProducts, initialCategories }) {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";
  const initialTag = searchParams.get("tag") || "";

  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [activeTag, setActiveTag] = useState(initialTag);
  const [sortBy, setSortBy] = useState("featured");

  const filteredProducts = useMemo(() => {
    let result = [...initialProducts];
    if (activeCategory !== "all") {
      result = result.filter((p) => p.category?.name === activeCategory);
    }
    if (activeTag) {
      result = result.filter((p) => p.tags.some(t => t.name === activeTag));
    }
    switch (sortBy) {
      case "price-low":  result.sort((a, b) => a.price - b.price); break;
      case "price-high": result.sort((a, b) => b.price - a.price); break;
      case "name":       result.sort((a, b) => a.name.localeCompare(b.name)); break;
      default: break;
    }
    return result;
  }, [initialProducts, activeCategory, activeTag, sortBy]);

  const allTags = [...new Set(initialProducts.flatMap((p) => p.tags.map(t => t.name)))];

  const PAD = "px-6 md:px-14 lg:px-20";
  const MAX = "max-w-[1440px] mx-auto";

  return (
    <>
      <section className={`${PAD} sticky top-[136px] z-30 py-0 bg-background/95 border-b border-surface-dim backdrop-blur-md`}>
        <div className={MAX}>
          <div className="tab-strip overflow-x-auto whitespace-nowrap flex no-scrollbar">
            <button
              onClick={() => { setActiveCategory("all"); setActiveTag(""); }}
              className={`filter-tab shrink-0 ${activeCategory === "all" && !activeTag ? " active" : ""}`}
            >
              All Pieces
            </button>
            {initialCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => { setActiveCategory(cat.name); setActiveTag(""); }}
                className={`filter-tab shrink-0 ${activeCategory === cat.name ? " active" : ""}`}
              >
                {cat.name}
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
              <button onClick={() => { setActiveCategory("all"); setActiveTag(""); }} className="btn-primary mt-2">
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default function CategoriesClient(props) {
  return (
    <Suspense fallback={
       <div className="text-center py-28 space-y-6">
          <div className="w-8 h-[1px] bg-gold-light mx-auto" />
          <span className="font-label text-[9px] tracking-[0.4em] uppercase text-navy animate-pulse">
            Loading...
          </span>
       </div>
    }>
      <CategoriesFilterLogic {...props} />
    </Suspense>
  );
}
