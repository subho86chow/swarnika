export const dynamic = "force-dynamic";

import CategoriesClient from "./CategoriesClient";
import RecentlyViewed from "../components/RecentlyViewed";
import { prisma } from "../lib/prisma";
import { withCache, cacheKeys, CACHE_TTL } from "../lib/cache";
import { getBestsellers } from "../lib/salesActions";

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
    images: p.images.map(i => i.url),
    image: p.images[0]?.url || "",
  }));

  const initialCategories = await withCache(
    cacheKeys.categories(),
    () => prisma.category.findMany(),
    CACHE_TTL.CATEGORIES
  );

  const bestsellerIds = await getBestsellers();

  return (
    <main className="bg-background pt-[72px]">

        <CategoriesClient initialProducts={formattedProducts} initialCategories={initialCategories} bestsellerIds={bestsellerIds} />

        <RecentlyViewed />

      </main>
    );
  }
