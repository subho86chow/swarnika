"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { getRecentlyViewed } from "../lib/viewActions";

const PAD = "px-6 md:px-14 lg:px-20";
const MAX = "max-w-[1440px] mx-auto";

export default function RecentlyViewed() {
  const { isSignedIn, user } = useUser();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSignedIn || !user?.id) {
      setLoading(false);
      return;
    }

    getRecentlyViewed(user.id, 6)
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [isSignedIn, user?.id]);

  if (!isSignedIn || loading || items.length === 0) return null;

  return (
    <section className={`${PAD} py-16 bg-ivory-dark`}>
      <div className={MAX}>
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-10 gap-4">
          <div>
            <span className="section-eyebrow">Your Journey</span>
            <h2 className="font-headline text-[32px] md:text-[44px] text-navy font-light leading-tight">Recently Viewed</h2>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6">
          {items.map((item) => {
            const product = item.product;
            const image = product.images?.[0]?.url || "";
            return (
              <Link
                key={item.id}
                href={`/product/${product.id}`}
                className="group block bg-white border border-surface-dim hover:border-gold-light/40 transition-colors duration-300"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-surface-dim">
                  {image && (
                    <Image
                      src={image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                    />
                  )}
                </div>
                <div className="p-3">
                  <p className="font-label text-[9px] tracking-[0.2em] uppercase text-gold font-semibold mb-1">
                    {product.category?.name || ""}
                  </p>
                  <h3 className="font-body text-navy text-[12px] leading-snug line-clamp-2 mb-1.5">
                    {product.name}
                  </h3>
                  <p className="font-headline text-navy text-sm font-light">
                    ₹{product.price.toLocaleString("en-IN")}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
