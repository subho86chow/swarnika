export const dynamic = "force-dynamic";

import { prisma } from "../../lib/prisma";
import ProductClient from "./ProductClient";
import Link from "next/link";
import { withCache, cacheKeys, CACHE_TTL } from "../../lib/cache";
import { getBestsellers } from "../../lib/salesActions";

export const revalidate = 0;

export default async function ProductDetailPage({ params }) {
  const { id } = await params;

  const initialProduct = await withCache(
    cacheKeys.product(id),
    () =>
      prisma.product.findUnique({
        where: { id },
        include: { images: true, details: true, tags: true, category: true },
      }),
    CACHE_TTL.PRODUCT_DETAIL
  );

  if (!initialProduct) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background pt-[136px]">
        <div className="text-center space-y-6">
          <div className="w-12 h-[1px] bg-outline-var mx-auto" />
          <h1 className="font-headline text-3xl text-navy font-light italic">Piece Not Found</h1>
          <p className="font-body text-outline text-sm">This treasure may have been moved or is no longer available.</p>
          <Link href="/categories" className="btn-primary inline-flex mt-4">Browse The Archive</Link>
        </div>
      </main>
    );
  }

  // Find related products in the same category (cached separately)
  const initialRelated = initialProduct.categoryId
    ? await withCache(
        `product:${id}:related`,
        () =>
          prisma.product.findMany({
            where: {
              categoryId: initialProduct.categoryId,
              id: { not: initialProduct.id },
            },
            include: { images: true, tags: true, category: true },
            take: 4,
          }),
        CACHE_TTL.PRODUCT_DETAIL
      )
    : [];

  // Format to match old data schema expectations
  // NOTE: Do NOT spread `...initialProduct` — Prisma relations are lost.
  const product = {
    id: initialProduct.id,
    name: initialProduct.name,
    price: initialProduct.price,
    originalPrice: initialProduct.originalPrice,
    description: initialProduct.description,
    inStock: initialProduct.inStock,
    badge: initialProduct.badge,
    categoryId: initialProduct.categoryId,
    category: initialProduct.category,
    tags: initialProduct.tags,
    images: initialProduct.images.length > 0 ? initialProduct.images : [{ url: "" }],
    details: initialProduct.details.map(d => d.text)
  };

  const relatedProducts = initialRelated.map(p => ({
    id: p.id,
    name: p.name,
    price: p.price,
    originalPrice: p.originalPrice,
    description: p.description,
    inStock: p.inStock,
    badge: p.badge,
    categoryId: p.categoryId,
    category: p.category,
    tags: p.tags,
    image: p.images[0]?.url || "",
    images: p.images.map(i => i.url),
  }));

  const bestsellerIds = await getBestsellers();
  const isBestseller = bestsellerIds.includes(id);

  return (
    <ProductClient product={product} relatedProducts={relatedProducts} isBestseller={isBestseller} />
  );
}
