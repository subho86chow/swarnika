"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "../lib/prisma";
import { revalidatePath } from "next/cache";
import { isAdminUser, getAdminEmail } from "../lib/adminAuth";

async function assertAdmin() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized — please sign in.");
  }
  if (!(await isAdminUser(userId))) {
    throw new Error("Forbidden — admin access required.");
  }
}

export async function getAdminEmails() {
  await assertAdmin();
  return prisma.adminEmail.findMany({ orderBy: { createdAt: "asc" } });
}

export async function addAdminEmail(formData) {
  await assertAdmin();

  const email = formData.get("email")?.toString().trim().toLowerCase();
  if (!email) {
    throw new Error("Email is required.");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Invalid email address.");
  }

  // Prevent removing the last admin
  const currentUserEmail = await getAdminEmail((await auth()).userId);
  const existing = await prisma.adminEmail.findUnique({ where: { email } });
  if (existing) {
    throw new Error("This email is already an admin.");
  }

  await prisma.adminEmail.create({ data: { email } });
  revalidatePath("/admin/admins");
  return { success: true };
}

export async function deleteAdminEmail(formData) {
  await assertAdmin();

  const id = formData.get("id")?.toString();
  if (!id) {
    throw new Error("ID is required.");
  }

  const record = await prisma.adminEmail.findUnique({ where: { id } });
  if (!record) {
    throw new Error("Admin email not found.");
  }

  // Prevent removing yourself if you're the last admin
  const count = await prisma.adminEmail.count();
  if (count <= 1) {
    throw new Error("You cannot remove the last admin.");
  }

  const currentUserEmail = await getAdminEmail((await auth()).userId);
  if (record.email === currentUserEmail) {
    throw new Error("You cannot remove yourself. Ask another admin to do it.");
  }

  await prisma.adminEmail.delete({ where: { id } });
  revalidatePath("/admin/admins");
  return { success: true };
}
