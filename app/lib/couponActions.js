"use server";

import { prisma } from "./prisma";

/* ── Admin CRUD ── */

export async function createCoupon(data) {
  return prisma.coupon.create({ data });
}

export async function updateCoupon(id, data) {
  return prisma.coupon.update({ where: { id }, data });
}

export async function deleteCoupon(id) {
  return prisma.coupon.delete({ where: { id } });
}

export async function getCoupons() {
  return prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
}

export async function getCouponById(id) {
  return prisma.coupon.findUnique({ where: { id } });
}

/* ── Customer-facing validation ── */

export async function validateCoupon({
  code,
  userId,
  cartItems,
}) {
  const coupon = await prisma.coupon.findUnique({ where: { code } });

  if (!coupon) return { valid: false, error: "Invalid coupon code" };
  if (!coupon.isActive) return { valid: false, error: "Coupon is inactive" };

  const now = new Date();
  if (coupon.startDate && now < coupon.startDate)
    return { valid: false, error: "Coupon not yet active" };
  if (coupon.endDate && now > coupon.endDate)
    return { valid: false, error: "Coupon has expired" };
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses)
    return { valid: false, error: "Coupon usage limit reached" };

  if (coupon.userId && coupon.userId !== userId) {
    return { valid: false, error: "Coupon not available for your account" };
  }

  if (coupon.maxUsesPerUser && userId) {
    const usage = await prisma.couponUsage.findUnique({
      where: { couponId_userId: { couponId: coupon.id, userId } },
    });
    if (usage && usage.count >= coupon.maxUsesPerUser) {
      return { valid: false, error: "You have already used this coupon" };
    }
  }

  // Enrich cart items with actual DB product data
  const enrichedItems = await enrichCartItems(cartItems);
  const subtotal = enrichedItems.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );

  if (coupon.minOrderValue !== null && subtotal < coupon.minOrderValue) {
    return {
      valid: false,
      error: `Minimum order value of ₹${coupon.minOrderValue} required`,
    };
  }

  // Scope validation
  const validation = validateCouponScope(coupon, enrichedItems);
  if (!validation.valid) return validation;

  // Calculate discount
  const discount = calculateDiscount(coupon, enrichedItems);

  return { valid: true, coupon, discount };
}

export async function getApplicableCoupons({ userId, cartItems }) {
  const now = new Date();

  // Fetch all active coupons unrestricted to this user
  const coupons = await prisma.coupon.findMany({
    where: {
      isActive: true,
      OR: [{ userId: null }, { userId: userId || "" }],
    },
  });

  const enrichedItems = await enrichCartItems(cartItems);
  const subtotal = enrichedItems.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );

  // Batch-fetch per-user usage counts in ONE query instead of N+1
  const couponsWithPerUserLimit = coupons.filter((c) => c.maxUsesPerUser && userId);
  let usageMap = new Map();
  if (couponsWithPerUserLimit.length > 0) {
    const usages = await prisma.couponUsage.findMany({
      where: {
        userId,
        couponId: { in: couponsWithPerUserLimit.map((c) => c.id) },
      },
    });
    usageMap = new Map(usages.map((u) => [u.couponId, u.count]));
  }

  const applicable = [];

  for (const coupon of coupons) {
    // Date checks
    if (coupon.startDate && now < coupon.startDate) continue;
    if (coupon.endDate && now > coupon.endDate) continue;

    // Max uses
    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) continue;

    // Per-user limit (look up from batched map — zero DB calls here)
    if (coupon.maxUsesPerUser && userId) {
      const usageCount = usageMap.get(coupon.id) || 0;
      if (usageCount >= coupon.maxUsesPerUser) continue;
    }

    // Min order
    if (coupon.minOrderValue !== null && subtotal < coupon.minOrderValue) continue;

    // Scope
    const scopeCheck = validateCouponScope(coupon, enrichedItems);
    if (!scopeCheck.valid) continue;

    const discount = calculateDiscount(coupon, enrichedItems);
    applicable.push({ coupon, discount });
  }

  return applicable;
}

export async function recordCouponUsage(couponId, userId) {
  await prisma.couponUsage.upsert({
    where: { couponId_userId: { couponId, userId } },
    update: { count: { increment: 1 } },
    create: { couponId, userId, count: 1 },
  });
  await prisma.coupon.update({
    where: { id: couponId },
    data: { usedCount: { increment: 1 } },
  });
}

/* ── Public coupon list (for badges / product pages) ── */

export async function getPublicCoupons() {
  const now = new Date();
  const coupons = await prisma.coupon.findMany({
    where: { isActive: true },
    orderBy: { discountValue: "desc" },
  });

  return coupons.filter((c) => {
    if (c.startDate && now < c.startDate) return false;
    if (c.endDate && now > c.endDate) return false;
    if (c.maxUses !== null && c.usedCount >= c.maxUses) return false;
    return true;
  });
}

/* ── Helpers ── */

async function enrichCartItems(cartItems) {
  // cartItems may come from client with just { productId, quantity }
  // We look up the actual product data from the DB for reliable validation
  const productIds = cartItems.map((i) => i.productId).filter(Boolean);
  if (productIds.length === 0) return [];

  const dbProducts = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, price: true, categoryId: true },
  });

  return cartItems.map((item) => ({
    productId: item.productId,
    quantity: item.quantity || 1,
    product:
      dbProducts.find((p) => p.id === item.productId) || item.product || null,
  }));
}

function validateCouponScope(coupon, cartItems) {
  if (cartItems.length === 0) {
    return { valid: false, error: "Cart is empty" };
  }

  switch (coupon.scope) {
    case "global":
      return { valid: true };

    case "single_product_cart": {
      const uniqueProducts = new Set(cartItems.map((i) => i.productId)).size;
      if (uniqueProducts !== 1) {
        return {
          valid: false,
          error: "This coupon is only valid for a single product",
        };
      }
      return { valid: true };
    }

    case "category": {
      const hasCategory = cartItems.some(
        (item) => item.product?.categoryId === coupon.categoryId
      );
      if (!hasCategory) {
        return {
          valid: false,
          error: "Coupon not applicable to items in your cart",
        };
      }
      return { valid: true };
    }

    case "product": {
      const hasProduct = cartItems.some(
        (item) => item.productId === coupon.productId
      );
      if (!hasProduct) {
        return {
          valid: false,
          error: "Coupon not applicable to items in your cart",
        };
      }
      return { valid: true };
    }

    default:
      return { valid: false, error: "Unknown coupon scope" };
  }
}

function calculateDiscount(coupon, cartItems) {
  let applicableSubtotal = 0;

  switch (coupon.scope) {
    case "global":
    case "single_product_cart":
      applicableSubtotal = cartItems.reduce(
        (sum, item) => sum + (item.product?.price || 0) * item.quantity,
        0
      );
      break;

    case "category":
      applicableSubtotal = cartItems
        .filter((item) => item.product?.categoryId === coupon.categoryId)
        .reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
      break;

    case "product":
      applicableSubtotal = cartItems
        .filter((item) => item.productId === coupon.productId)
        .reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
      break;
  }

  if (coupon.discountType === "percentage") {
    return Math.round((applicableSubtotal * coupon.discountValue) / 100);
  }

  // fixed
  return Math.min(coupon.discountValue, applicableSubtotal);
}
