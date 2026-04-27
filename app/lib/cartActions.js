"use server";

import { prisma } from "./prisma";

/* ── Cart ── */

export async function getCartItems(userId) {
  const items = await prisma.cartItem.findMany({
    where: { userId },
    select: { productId: true, quantity: true },
  });
  return items;
}

export async function addCartItem(userId, productId, quantity) {
  return prisma.cartItem.upsert({
    where: { userId_productId: { userId, productId } },
    update: { quantity: { increment: quantity } },
    create: { userId, productId, quantity },
  });
}

export async function updateCartItemQuantity(userId, productId, quantity) {
  return prisma.cartItem.update({
    where: { userId_productId: { userId, productId } },
    data: { quantity },
  });
}

export async function removeCartItem(userId, productId) {
  return prisma.cartItem.delete({
    where: { userId_productId: { userId, productId } },
  });
}

export async function clearCart(userId) {
  return prisma.cartItem.deleteMany({ where: { userId } });
}

export async function mergeGuestCart(userId, guestCart) {
  for (const item of guestCart) {
    await prisma.cartItem.upsert({
      where: { userId_productId: { userId, productId: item.productId } },
      update: { quantity: { increment: item.quantity } },
      create: { userId, productId: item.productId, quantity: item.quantity },
    });
  }
}

/* ── Product lookup for cart ── */

export async function getCartProducts(productIds) {
  if (!productIds || productIds.length === 0) return [];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: { images: true, category: true },
  });
  return products.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    originalPrice: p.originalPrice,
    description: p.description,
    inStock: p.inStock,
    badge: p.badge,
    images: p.images.map((img) => img.url),
    categoryId: p.categoryId,
    categoryName: p.category?.name || "",
    collection: p.category?.name || "",
  }));
}

/* ── Cross-sell / related products ── */

export async function getProductsByCategoryIds(categoryIds, excludeProductIds = []) {
  if (!categoryIds || categoryIds.length === 0) return [];
  const products = await prisma.product.findMany({
    where: {
      categoryId: { in: categoryIds },
      id: { notIn: excludeProductIds },
    },
    include: { images: true, category: true },
    take: 6,
  });
  return products.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    originalPrice: p.originalPrice,
    description: p.description,
    images: p.images.map((img) => img.url),
    categoryId: p.categoryId,
    categoryName: p.category?.name || "",
  }));
}

/* ── Favorites ── */

export async function getFavorites(userId) {
  const favs = await prisma.favorite.findMany({
    where: { userId },
    select: { productId: true },
  });
  return favs.map((f) => f.productId);
}

export async function addFavorite(userId, productId) {
  return prisma.favorite.upsert({
    where: { userId_productId: { userId, productId } },
    update: {},
    create: { userId, productId },
  });
}

export async function removeFavorite(userId, productId) {
  return prisma.favorite.delete({
    where: { userId_productId: { userId, productId } },
  });
}

export async function mergeGuestFavorites(userId, guestFavorites) {
  for (const productId of guestFavorites) {
    await prisma.favorite.upsert({
      where: { userId_productId: { userId, productId } },
      update: {},
      create: { userId, productId },
    });
  }
}

/* ── Shipping threshold ── */

export async function getFreeShippingThreshold() {
  const config = await prisma.siteContent.findUnique({
    where: { key: "free_shipping_threshold" },
  });
  const value = parseInt(config?.value, 10);
  return Number.isFinite(value) && value > 0 ? value : 50000;
}
