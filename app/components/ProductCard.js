"use client";

import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "../lib/data";
import { useCart } from "../lib/cartStore";
import ProductCouponBadge from "./ProductCouponBadge";

export default function ProductCard({ product, index = 0 }) {
  const imgSrc = product.image || (product.images && product.images[0]?.url) || (product.images && product.images[0]) || "/products/product-1.jpg";
  const { toggleFavorite, isFavorite } = useCart();
  const wishlisted = isFavorite(product.id);

  const handleToggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product.id);
  };

  return (
    <Link href={`/product/${product.id}`} className="group block">
      {/* Image Container */}
      <div style={{ position: 'relative', aspectRatio: '3/4', marginBottom: '1rem', overflow: 'hidden', background: '#f3ede4' }}>
        <Image
          src={imgSrc}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          className="object-cover object-top transition-transform duration-[1200ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] will-change-transform group-hover:scale-[1.06]"
        />

        {/* Product Badge */}
        {product.badge && (
          <div style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 10 }}>
            <span className="badge">{product.badge}</span>
          </div>
        )}

        {/* Coupon Discount Badge */}
        <ProductCouponBadge productId={product.id} price={product.price} categoryId={product.categoryId} />

        {/* Hover Overlay */}
        <div
          style={{ position: 'absolute', inset: 0, background: 'rgba(10,10,10,0)', zIndex: 10, transition: 'background 0.5s' }}
          className="group-hover:bg-navy/10"
        />

        {/* Favourites Button */}
        <button
          onClick={handleToggleFavorite}
          className="absolute top-3 right-3 z-20 w-9 h-9 bg-white/90 flex items-center justify-center opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white"
        >
          <span className={`material-symbols-outlined text-[18px] transition-colors duration-200 ${wishlisted ? "text-gold-light" : "text-outline hover:text-gold-light"}`}>favorite</span>
        </button>
      </div>

      {/* Info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <span style={{
          fontFamily: 'var(--font-label)', color: '#755629',
          fontSize: '8.5px', letterSpacing: '0.22em', textTransform: 'uppercase', display: 'block'
        }}>
          {product.category?.name || product.collection}
        </span>
        <h3 style={{
          fontFamily: 'var(--font-headline)', fontSize: '18px',
          color: '#1d1b16', lineHeight: 1.25, fontWeight: 300,
          transition: 'color 0.3s',
        }} className="group-hover:text-gold">
          {product.name}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingTop: '0.125rem' }}>
          <span style={{
            fontFamily: 'var(--font-body)', color: '#1d1b16',
            fontSize: '12px', fontWeight: 500, letterSpacing: '0.03em'
          }}>
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span style={{
              fontFamily: 'var(--font-body)', color: '#807569',
              fontSize: '11px', textDecoration: 'line-through'
            }}>
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
