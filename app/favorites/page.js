"use client";

import { useState } from "react";
import Link from "next/link";
import { products } from "../lib/data";
import ProductCard from "../components/ProductCard";

const initialFavorites = [
  products[1],
  products[4],
  products[6],
];

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState(initialFavorites);

  const removeFavorite = (id) => {
    setFavorites(favorites.filter((p) => p.id !== id));
  };

  return (
    <main className="pt-[72px] bg-background min-h-screen">
      {/* Header */}
      <section className="bg-navy py-16 md:py-20 px-6 md:px-12">
        <div className="max-w-[1440px] mx-auto text-center space-y-4">
          <h1 className="font-headline text-3xl md:text-4xl text-white italic">
            Your Wishlist
          </h1>
          <p className="font-body text-white/50 text-[13px]">
            {favorites.length} {favorites.length === 1 ? "item" : "items"} saved for later
          </p>
        </div>
      </section>

      <section className="py-12 md:py-20 px-6 md:px-14 lg:px-20 bg-background">
        <div className="max-w-[1440px] mx-auto">
          {favorites.length === 0 ? (
            <div className="text-center py-24 space-y-5 animate-fade-in-up">
              <span className="material-symbols-outlined text-outline-var text-6xl">
                favorite
              </span>
              <h2 className="font-headline text-2xl text-navy italic">Your wishlist is empty</h2>
              <p className="font-body text-outline text-[13px] max-w-sm mx-auto">
                Curate a collection of your favorite pieces from the archive. They will be saved here for your next visit.
              </p>
              <Link
                href="/categories"
                className="inline-block bg-navy text-white px-10 py-4 text-[10px] tracking-[0.2em] uppercase font-bold mt-6 hover:bg-navy-light transition-colors"
              >
                Explore The Archive
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10">
              {favorites.map((product, i) => (
                <div key={product.id} className="relative group animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                  <ProductCard product={product} index={i} />
                  <button
                    onClick={() => removeFavorite(product.id)}
                    className="absolute top-4 right-4 z-20 w-10 h-10 bg-white/95 flex items-center justify-center text-gold-light transition-all duration-300 shadow-sm opacity-0 group-hover:opacity-100 sm:opacity-100"
                    title="Remove from wishlist"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
