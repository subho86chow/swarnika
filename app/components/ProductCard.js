import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "../lib/data";

export default function ProductCard({ product, index = 0 }) {
  return (
    <Link href={`/product/${product.id}`} className="group block">
      {/* Image Container */}
      <div style={{ position: 'relative', aspectRatio: '3/4', marginBottom: '1rem', overflow: 'hidden', background: '#f4f1ea' }}>
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          className="object-cover object-center"
          style={{ transitionProperty: 'transform', transitionDuration: '1.2s', transitionTimingFunction: 'cubic-bezier(0.25,0.46,0.45,0.94)' }}
        />

        {/* Badge */}
        {product.badge && (
          <div style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 10 }}>
            <span className="badge">{product.badge}</span>
          </div>
        )}

        {/* Hover Overlay */}
        <div
          style={{ position: 'absolute', inset: 0, background: 'rgba(10,10,10,0)', zIndex: 10, transition: 'background 0.5s' }}
          className="group-hover:bg-[#0a0a0a]/10"
        />

        {/* Slide-up action bar */}
        <div
          style={{
            position: 'absolute', inset: '0 0 0 0', bottom: 0, top: 'auto',
            transform: 'translateY(100%)', zIndex: 20,
            transition: 'transform 0.4s cubic-bezier(0.16,1,0.3,1)',
          }}
          className="group-hover:translate-y-0"
        >
          <div style={{ display: 'flex', background: 'rgba(250,248,243,0.97)', backdropFilter: 'blur(4px)', borderTop: '1px solid #e8e4db' }}>
            <button className="card-action-btn" style={{ borderRight: '1px solid #e8e4db' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>favorite</span>
              Wishlist
            </button>
            <button className="card-action-btn">
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>visibility</span>
              View
            </button>
          </div>
        </div>
      </div>

      {/* Info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <span style={{
          fontFamily: 'var(--font-label)', color: '#7a6130',
          fontSize: '8.5px', letterSpacing: '0.22em', textTransform: 'uppercase', display: 'block'
        }}>
          {product.collection}
        </span>
        <h3 style={{
          fontFamily: 'var(--font-headline)', fontSize: '18px',
          color: '#0a0a0a', lineHeight: 1.25, fontWeight: 300,
          transition: 'color 0.3s',
        }} className="group-hover:text-[#7a6130]">
          {product.name}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingTop: '0.125rem' }}>
          <span style={{
            fontFamily: 'var(--font-body)', color: '#0a0a0a',
            fontSize: '12px', fontWeight: 500, letterSpacing: '0.03em'
          }}>
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span style={{
              fontFamily: 'var(--font-body)', color: '#6b6b6b',
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
