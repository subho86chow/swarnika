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

import { auth } from "@clerk/nextjs/server";
import { cancelShipment } from "./delhivery";
import { revalidatePath } from "next/cache";

export async function cancelCustomerOrder(orderId) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) throw new Error("Order not found");
  if (order.userId !== userId) throw new Error("Unauthorized");

  if (order.status === "shipped" || order.status === "delivered") {
    throw new Error("Order cannot be cancelled at this stage");
  }

  if (order.status === "cancelled") {
    throw new Error("Order is already cancelled");
  }

  if (order.delhiveryWaybill) {
    const result = await cancelShipment(order.delhiveryWaybill);
    if (!result.success) throw new Error(result.error);
  }

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "cancelled",
      cancelledAt: new Date(),
    },
  });

  revalidatePath("/account/orders");
  revalidatePath("/admin/orders");
  return { success: true };
}
