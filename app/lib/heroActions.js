"use server";

import { prisma } from "./prisma";
import { revalidatePath } from "next/cache";

export async function getHeroImages({ activeOnly = true } = {}) {
  const where = activeOnly ? { isActive: true } : {};
  return prisma.heroImage.findMany({
    where,
    orderBy: { order: "asc" },
  });
}

export async function getHeroImageById(id) {
  return prisma.heroImage.findUnique({ where: { id } });
}

export async function createHeroImage(data) {
  const maxOrder = await prisma.heroImage.aggregate({
    _max: { order: true },
  });
  const newOrder = (maxOrder._max.order ?? -1) + 1;

  const created = await prisma.heroImage.create({
    data: { ...data, order: newOrder },
  });

  revalidatePath("/");
  revalidatePath("/admin/hero");
  return created;
}

export async function updateHeroImage(id, data) {
  const updated = await prisma.heroImage.update({
    where: { id },
    data,
  });

  revalidatePath("/");
  revalidatePath("/admin/hero");
  return updated;
}

export async function deleteHeroImage(id) {
  await prisma.heroImage.delete({ where: { id } });

  revalidatePath("/");
  revalidatePath("/admin/hero");
}

export async function reorderHeroImages(orderedIds) {
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.heroImage.update({
        where: { id },
        data: { order: index },
      })
    )
  );

  revalidatePath("/");
  revalidatePath("/admin/hero");
}
