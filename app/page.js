import Link from "next/link";
import Image from "next/image";
import ProductCard from "./components/ProductCard";
import HeroSlider from "./components/HeroSlider";
import CampaignCarousel from "./components/CampaignCarousel";
import { prisma } from "./lib/prisma";

const PAD = "px-6 md:px-14 lg:px-20";
const MAX = "max-w-[1440px] mx-auto";

export const revalidate = 0; // Disable static rendering for now to ensure we see fresh DB data

export default async function HomePage() {
  // Fetch Hero Configuration
  const [heroTitleConfig, heroSubtitleConfig] = await Promise.all([
    prisma.siteContent.findUnique({ where: { key: "hero_title" } }),
    prisma.siteContent.findUnique({ where: { key: "hero_subtitle" } })
  ]);

  // Default values
  const rawHeroTitle = heroTitleConfig?.value || "Ancient Spirit,\nModern Grace.";
  const heroSubtitle = heroSubtitleConfig?.value || "A curation of high-jewelry pieces that bridge the gap between ancestral craftsmanship and contemporary silhouettes. Each piece a quiet testament to eternal beauty.";

  // Format Hero Title (e.g. replace \n with <br /> and wrapped texts)
  // Let's assume the first part until the newline is normal, the second part is wrapped in span.
  const parts = rawHeroTitle.split("\n");
  const formattedHeroTitle = parts.length > 1
    ? `${parts[0]}<br /><span class="font-normal">${parts[1]}</span>`
    : rawHeroTitle;

  const heroImages = [
    "/products/product-1.jpg",
    "/products/product-3.jpg",
    "/products/product-4.jpg"
  ];

  // Fetch Categories
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" }
  });

  // Fetch Products (assume bestsellers = first 4, new arrivals = next 4)
  const products = await prisma.product.findMany({
    include: { images: true, category: true },
    orderBy: { createdAt: "asc" },
    take: 8
  });

  const bestsellers = products.slice(0, 4).map(p => ({
    ...p,
    image: p.images[0]?.url || "",
  }));
  const newArrivals = products.slice(4, 8).map(p => ({
    ...p,
    image: p.images[0]?.url || "",
  }));

  return (
    <>


      <main className="pt-0 bg-background">
        <HeroSlider
          heroTitle={formattedHeroTitle}
          heroSubtitle={heroSubtitle}
          heroImages={heroImages}
        />

        {/* ─── Everyday Demifine Jewellery ─── */}
        <section className="bg-background py-10 md:py-16">
          <div className="max-w-[1440px] mx-auto px-6 md:px-14 lg:px-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-4">
              <div>
                <span className="section-eyebrow">Shop By Category</span>
                <h2 className="font-headline text-[38px] md:text-[52px] text-navy font-light leading-tight">Everyday Demifine Jewellery</h2>
              </div>
            </div>
          </div>
          <div className={`${MAX} ${PAD}`}>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 md:gap-4">
              {categories.map((cat) => (
                <Link key={cat.id} href={`/categories?category=${encodeURIComponent(cat.name)}`} className="group relative block aspect-[4/5] overflow-hidden bg-surface-dim">
                  <Image
                    src={cat.image || "/products/rings_cat.png"}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 16vw"
                    className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-[1.08]"
                  />
                  {/* Subtle bottom gradient to ensure text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-80" />

                  <div className="absolute bottom-4 md:bottom-5 left-0 w-full flex items-center justify-center gap-1.5 z-10 transition-transform duration-500 ease-out group-hover:-translate-y-1">
                    <span className="font-label text-[9px] md:text-[10px] tracking-[0.15em] font-semibold uppercase text-white drop-shadow-md">
                      {cat.name}
                    </span>
                    <div className="w-3.5 h-3.5 md:w-4 md:h-4 rounded-full bg-white flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-110">
                      <svg width="6" height="8" viewBox="0 0 6 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1.5 1L4.5 4L1.5 7" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Promotion Banner ─── */}
        <section className={`${PAD} pb-10 pt-4 bg-background`}>
          <div className={`${MAX} relative w-full overflow-hidden bg-surface-dim group cursor-pointer`}>
            <Link href="/categories">
              <Image
                src="/products/discount_banner.png"
                alt="Discount Promotional Banner"
                width={1440}
                height={400}
                className="w-full h-auto transition-transform duration-700 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500" />
            </Link>
          </div>
        </section>

        {/* ─── Bestsellers ─── */}
        <section className={`${PAD} py-20 bg-background`}>
          <div className={MAX}>
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-4">
              <div>
                <span className="section-eyebrow">The Signature Selection</span>
                <h2 className="font-headline text-[38px] md:text-[52px] text-navy font-light leading-tight">Bestsellers</h2>
              </div>
              <Link href="/categories?tag=bestseller" className="btn-ghost self-start md:self-auto mb-1">
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

        <CampaignCarousel />

        {/* ─── Heritage Banner ─── */}
        <section className={`${PAD} py-24 bg-navy relative overflow-hidden`}>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #c9a44a 0, #c9a44a 1px, transparent 0, transparent 50%)', backgroundSize: '8px 8px' }} />
          </div>
          <div className={`${MAX} relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center`}>
            <div className="animate-fade-in-up order-2 lg:order-1">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-[32px] h-[1px] bg-gold-light" />
                <span className="font-label text-[9px] tracking-[0.4em] uppercase text-gold-light font-medium">The Art of the Slow Craft</span>
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
              <div className="absolute inset-6 border border-gold-light/20 pointer-events-none" />
            </div>
          </div>
        </section>

        {/* ─── New Arrivals ─── */}
        <section className={`${PAD} py-20 bg-background`}>
          <div className={MAX}>
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-4">
              <div>
                <span className="section-eyebrow">Just Arrived</span>
                <h2 className="font-headline text-[38px] md:text-[52px] text-navy font-light leading-tight">New Pieces</h2>
              </div>
              <Link href="/categories" className="btn-ghost self-start md:self-auto mb-1">
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
        <section className={`${PAD} py-20 bg-background`}>
          <div className={MAX}>
            <div className="border border-surface-dim px-6 py-12 md:py-16 md:px-20 text-center relative max-w-4xl mx-auto">
              {/* Corner Accents */}
              <div className="absolute top-4 left-4 w-8 h-8 border-t border-l border-gold-light/40" />
              <div className="absolute top-4 right-4 w-8 h-8 border-t border-r border-gold-light/40" />
              <div className="absolute bottom-4 left-4 w-8 h-8 border-b border-l border-gold-light/40" />
              <div className="absolute bottom-4 right-4 w-8 h-8 border-b border-r border-gold-light/40" />

              <span className="section-eyebrow flex justify-center">A Private Viewing</span>
              <h2 className="font-headline text-[36px] md:text-[52px] text-navy font-light italic leading-tight mt-2 mb-6">Experience the Collection</h2>
              <p className="font-body text-outline text-[13px] leading-relaxed mx-auto mb-10 max-w-[512px]">
                Experience the collection in the quiet luxury of our flagship stores, or via a virtual consultation with our master curators.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="/contact" className="btn-primary">Book an Appointment</Link>
                <Link href="/categories" className="btn-secondary">View All Categories</Link>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Trust Pillars ─── */}
      <section className={`${PAD} py-12 bg-navy border-t border-white/10`}>
          <div className={`${MAX} grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0`}>
            {[
              { num: "01", label: "Certified Authentic", sub: "Every piece verified" },
              { num: "02", label: "Complimentary Shipping", sub: "On all orders" },
              { num: "03", label: "30-Day Returns", sub: "No questions asked" },
              { num: "04", label: "Lifetime Warranty", sub: "Archival guarantee" },
            ].map((item, i) => (
              <div key={item.label} className={`flex flex-col items-center justify-center gap-2 px-6 py-4 text-center ${i > 0 ? 'lg:border-l lg:border-white/10' : ''}`}>
                <span className="font-headline text-[28px] font-light leading-none text-gold-light/40">{item.num}</span>
                <span className="font-label text-[9px] tracking-[0.22em] uppercase font-semibold text-white/70 mt-1">{item.label}</span>
                <span className="font-body text-[11px] text-white/30">{item.sub}</span>
              </div>
            ))}
          </div>
        </section>

      </main>
    </>
  );
}
