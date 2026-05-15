"use server";

import { prisma } from "./prisma";

export async function getAddresses(userId) {
  if (!userId) return [];
  return prisma.address.findMany({
    where: { userId },
    orderBy: [
      { isDefault: "desc" },
      { createdAt: "desc" },
    ],
  });
}

export async function createAddress(userId, data) {
  if (!userId) throw new Error("User ID required");

  // If this is the first address or marked as default, unset other defaults
  if (data.isDefault) {
    await prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });
  }

  // If this is the first address ever for this user, force it as default
  const existingCount = await prisma.address.count({ where: { userId } });
  const isDefault = existingCount === 0 ? true : !!data.isDefault;

  return prisma.address.create({
    data: {
      userId,
      label: data.label || "Address",
      fullName: data.fullName,
      phone: data.phone,
      line1: data.line1,
      line2: data.line2 || null,
      city: data.city,
      state: data.state,
      zip: data.zip,
      country: data.country || "India",
      isDefault,
    },
  });
}

export async function updateAddress(addressId, userId, data) {
  if (!addressId || !userId) throw new Error("Address ID and User ID required");

  // If setting as default, unset others first
  if (data.isDefault) {
    await prisma.address.updateMany({
      where: { userId, isDefault: true, id: { not: addressId } },
      data: { isDefault: false },
    });
  }

  return prisma.address.update({
    where: { id: addressId, userId },
    data: {
      label: data.label,
      fullName: data.fullName,
      phone: data.phone,
      line1: data.line1,
      line2: data.line2 || null,
      city: data.city,
      state: data.state,
      zip: data.zip,
      country: data.country || "India",
      isDefault: data.isDefault,
    },
  });
}

export async function deleteAddress(addressId, userId) {
  if (!addressId || !userId) throw new Error("Address ID and User ID required");

  const deleted = await prisma.address.delete({
    where: { id: addressId, userId },
  });

  // If the deleted address was the default, set the most recent remaining as default
  if (deleted.isDefault) {
    const remaining = await prisma.address.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    if (remaining) {
      await prisma.address.update({
        where: { id: remaining.id },
        data: { isDefault: true },
      });
    }
  }

  return deleted;
}

export async function setDefaultAddress(addressId, userId) {
  if (!addressId || !userId) throw new Error("Address ID and User ID required");

  await prisma.address.updateMany({
    where: { userId },
    data: { isDefault: false },
  });

  return prisma.address.update({
    where: { id: addressId, userId },
    data: { isDefault: true },
  });
}
