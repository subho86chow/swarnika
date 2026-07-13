"use server";

import { prisma } from "./prisma";
import { withCache } from "./cache";

const BESTSELLER_CACHE_KEY = "bestsellers:30d";
const BESTSELLER_CACHE_TTL = 7200; // 2 hours
const BESTSELLER_MAX = 8;
const BESTSELLER_DAYS = 30;

/**
 * Get the top-selling product IDs from the last N days.
 * Max 3 products. Cached in KV for 2 hours.
 * @returns {Promise<string[]>} Array of product IDs (max 3)
 */
export async function getBestsellers() {
  return withCache(
    BESTSELLER_CACHE_KEY,
    async () => {
      const since = new Date(Date.now() - BESTSELLER_DAYS * 24 * 60 * 60 * 1000);

      const topSellers = await prisma.orderItem.groupBy({
        by: ["productId"],
        where: {
          order: {
            status: { in: ["paid", "shipped", "delivered"] },
            createdAt: { gte: since },
          },
        },
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: BESTSELLER_MAX,
      });

      return topSellers.map((r) => r.productId);
    },
    BESTSELLER_CACHE_TTL
  );
}

/**
 * Check if a specific product is in the current bestsellers list.
 * @param {string} productId
 * @returns {Promise<boolean>}
 */
export async function isBestseller(productId) {
  if (!productId) return false;
  const ids = await getBestsellers();
  return ids.includes(productId);
}
