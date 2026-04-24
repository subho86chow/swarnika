"use server";

import { prisma } from "./prisma";
import { withCache, cacheKeys, CACHE_TTL } from "./cache";
import { kvDel } from "./kv";

export async function recordProductView(userId, productId, durationSeconds) {
  if (!userId || !productId) return;

  try {
    await prisma.recentlyViewed.create({
      data: {
        userId,
        productId,
        durationSeconds: Math.max(0, Math.round(durationSeconds)),
      },
    });
    // Bust the recently viewed cache for this user so next load is fresh
    await kvDel(cacheKeys.recentlyViewed(userId));
  } catch (e) {
    console.error("Failed to record product view", e);
  }
}

export async function getRecentlyViewed(userId, limit = 8) {
  if (!userId) return [];

  return withCache(
    cacheKeys.recentlyViewed(userId),
    async () => {
      const items = await prisma.recentlyViewed.findMany({
        where: { userId },
        orderBy: { viewedAt: "desc" },
        take: limit,
        include: {
          product: {
            include: {
              images: { take: 1 },
              category: true,
            },
          },
        },
      });
      return items;
    },
    CACHE_TTL.RECENTLY_VIEWED
  );
}
