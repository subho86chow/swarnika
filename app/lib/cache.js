import { cacheOrFetch, kvDel, kvDelPattern } from "./kv";

export const CACHE_TTL = {
  PRODUCTS_LIST: 300,      // 5 min
  PRODUCT_DETAIL: 600,     // 10 min
  CATEGORIES: 600,         // 10 min
  SITE_CONTENT: 1800,      // 30 min
  RECENTLY_VIEWED: 120,    // 2 min
  COUPONS: 86400,          // 24 hours
};

/** Cache key generators */
export const cacheKeys = {
  product: (id) => `product:${id}`,
  productList: (filter = "all", page = 1) => `products:list:${filter}:${page}`,
  categories: () => `categories:all`,
  siteContent: (key) => `sitecontent:${key}`,
  recentlyViewed: (userId) => `recentlyviewed:${userId}`,
  coupons: () => `coupons:all`,
  publicCoupons: () => `coupons:public`,
};

/** Wrap a fetch with caching */
export async function withCache(key, fetchFn, ttl) {
  return cacheOrFetch(key, fetchFn, ttl);
}

/** Invalidate product-related caches */
export async function invalidateProduct(productId) {
  await Promise.all([
    kvDel(cacheKeys.product(productId)),
    kvDelPattern("products:list:*"),
    kvDelPattern("categories:all"),
  ]);
}

/** Invalidate all product lists and categories */
export async function invalidateProductLists() {
  await Promise.all([
    kvDelPattern("products:list:*"),
    kvDelPattern("categories:all"),
  ]);
}

/** Invalidate categories cache */
export async function invalidateCategories() {
  await Promise.all([
    kvDelPattern("categories:all"),
    kvDelPattern("products:list:*"),
  ]);
}

/** Invalidate site content cache */
export async function invalidateSiteContent(key) {
  await kvDel(cacheKeys.siteContent(key));
}

/** Invalidate coupon caches */
export async function invalidateCoupons() {
  await Promise.all([
    kvDel(cacheKeys.coupons()),
    kvDel(cacheKeys.publicCoupons()),
  ]);
}
