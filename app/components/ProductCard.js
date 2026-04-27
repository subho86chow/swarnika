"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "../lib/data";
import { useCart } from "../lib/cartStore";
import ProductCouponBadge from "./ProductCouponBadge";

export default function ProductCard({ product, index = 0 }) {
  const allImages = product.images?.length > 0
    ? product.images
    : [product.image || "/products/product-1.jpg"];

  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const { toggleFavorite, isFavorite } = useCart();
  const wishlisted = isFavorite(product.id);

  // Auto-carousel every 5 seconds when hovered
  useEffect(() => {
    if (!isHovered || allImages.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % allImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isHovered, allImages.length]);

  const handleToggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product.id);
  };

  return (
    <Link
      href={`/product/${product.id}`}
      className="group block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setActiveIndex(0); }}
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] mb-4 overflow-hidden bg-surface-low">
        {allImages.map((src, idx) => (
          <Image
            key={idx}
            src={src}
            alt={`${product.name} ${idx + 1}`}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className={`object-cover object-top transition-all duration-700 ease-in-out ${
              idx === activeIndex
                ? "opacity-100 scale-100"
                : "opacity-0 scale-105"
            }`}
            priority={index < 4 && idx === 0}
          />
        ))}

        {/* Product Badge */}
        {product.badge && (
          <div className="absolute top-4 left-4 z-10">
            <span className="badge">{product.badge}</span>
          </div>
        )}

        {/* Coupon Discount Badge */}
        <ProductCouponBadge productId={product.id} price={product.price} categoryId={product.categoryId} />

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-navy/0 group-hover:bg-navy/10 transition-colors duration-500 z-10" />

        {/* Favourites Button */}
        <button
          onClick={handleToggleFavorite}
          className="absolute top-3 right-3 z-20 w-9 h-9 bg-white/90 flex items-center justify-center opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white"
        >
          <span className={`material-symbols-outlined text-[18px] transition-colors duration-200 ${wishlisted ? "text-gold-light" : "text-outline hover:text-gold-light"}`}>favorite</span>
        </button>

        {/* Image Dots Indicator */}
        {allImages.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
            {allImages.map((_, idx) => (
              <span
                key={idx}
                className={`block h-1 rounded-full transition-all duration-300 ${
                  idx === activeIndex
                    ? "w-4 bg-white"
                    : "w-1 bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1">
        <span className="font-label text-[10px] md:text-[11px] tracking-[0.22em] uppercase text-gold block">
          {product.category?.name || product.collection}
        </span>
        <h3 className="font-headline text-base md:text-lg text-navy leading-tight font-light transition-colors duration-300 group-hover:text-gold">
          {product.name}
        </h3>
        <div className="flex items-center gap-3 pt-0.5">
          <span className="font-body text-sm text-navy font-medium tracking-wide">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="font-body text-xs text-outline line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
