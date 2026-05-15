"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import ProductCard from "./ProductCard";

const TABS = ["All", "Necklaces", "Earrings", "Rings", "Bridal"];

export default function BestsellersSection({ products }) {
  const [activeTab, setActiveTab] = useState("All");

  const filtered = useMemo(() => {
    if (activeTab === "All") return products;
    return products.filter((p) => p.category?.name === activeTab);
  }, [products, activeTab]);

  return (
    <section className="px-6 md:px-14 lg:px-20 py-20 bg-background">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-4">
          <div>
            <span className="section-eyebrow">The Signature Selection</span>
            <h2 className="font-headline text-[38px] md:text-[52px] text-navy font-light leading-tight">
              Bestsellers
            </h2>
            <p className="text-outline text-sm mt-2 max-w-md">
              Our most sold products of this month.
            </p>
          </div>
          <Link
            href="/categories?tag=bestseller"
            className="btn-ghost self-start md:self-auto mb-1"
          >
            View All Archives{" "}
            <span className="material-symbols-outlined text-[16px]">
              arrow_forward
            </span>
          </Link>
        </div>

        <div className="tab-strip overflow-x-auto whitespace-nowrap mb-12 flex no-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`filter-tab shrink-0 ${activeTab === tab ? "active" : ""}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {products.length === 0 ? (
          <p className="text-center text-outline text-sm py-16">No products.</p>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10">
            {filtered.map((product, i) => (
              <div
                key={product.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <ProductCard product={product} index={i} showBestsellerBadge />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-outline text-sm py-16">No products.</p>
        )}
      </div>
    </section>
  );
}
