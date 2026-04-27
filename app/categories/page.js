export const dynamic = "force-dynamic";

import CategoriesClient from "./CategoriesClient";
import { prisma } from "../lib/prisma";
import { withCache, cacheKeys, CACHE_TTL } from "../lib/cache";

const PAD = "px-6 md:px-14 lg:px-20";
const MAX = "max-w-[1440px] mx-auto";

export const revalidate = 0;

export default async function CategoriesPage() {
  const initialProducts = await withCache(
    cacheKeys.productList("categories", 1),
    () => prisma.product.findMany({
      include: { images: true, tags: true, category: true }
    }),
    CACHE_TTL.PRODUCTS_LIST
  );

  const formattedProducts = initialProducts.map(p => ({
    ...p,
    image: p.images[0]?.url || "",
    images: p.images.map(i => i.url),
  }));

  const initialCategories = await withCache(
    cacheKeys.categories(),
    () => prisma.category.findMany(),
    CACHE_TTL.CATEGORIES
  );

  return (
    <main className="bg-background pt-[72px]">

        {/* ─── Categories Header ─── */}
        <section className={`${PAD} pt-6 pb-0 bg-background`}>
          <div className={MAX}>
            <div className="flex items-center gap-3 mb-8">
              <span className="font-label text-[9px] tracking-[0.3em] uppercase text-outline font-medium">The Archive</span>
              <span className="text-outline-var text-xs">→</span>
              <span className="font-label text-[9px] tracking-[0.3em] uppercase text-navy font-semibold">Masterpieces</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 items-end pb-10 border-b border-surface-dim">
              <div>
                <h1 className="font-headline text-navy font-light italic leading-[1.0] text-4xl md:text-6xl lg:text-[64px]">
                  Masterpieces
                </h1>
              </div>
              <div className="max-w-[380px]">
                <p className="font-body text-outline text-sm leading-relaxed">
                  An archival journey through centuries of craftsmanship. Each piece selected for its historical significance and artistic merit.
                </p>
              </div>
            </div>
          </div>
        </section>

        <CategoriesClient initialProducts={formattedProducts} initialCategories={initialCategories} />

        {/* ─── Heritage Vault CTA ─── */}
        <section className={`${PAD} py-20 bg-navy`}>
          <div className={`${MAX} text-center`}>
            <span className="section-eyebrow flex justify-center text-gold-light">Heritage Vault</span>
            <h2 className="font-headline text-[36px] md:text-[52px] text-white font-light italic mt-2 mb-6">
              Step Inside the Sanctuary
            </h2>
            <p className="font-body text-white/50 text-sm leading-relaxed max-w-md mx-auto mb-10">
              These one-of-a-kind pieces are not available for public sale and require a verified invitation for viewing.
            </p>
            <a href="/contact" className="btn-primary inline-flex">Request an Invitation</a>
          </div>
        </section>

      </main>
    );
  }
