"use server";

import { prisma } from "./prisma";

export async function getOrders(userId) {
  if (!userId) return [];
  return prisma.order.findMany({
    where: { userId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
}
