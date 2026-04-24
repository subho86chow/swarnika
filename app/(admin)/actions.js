"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "../lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  invalidateProduct,
  invalidateProductLists,
  invalidateCategories,
  invalidateSiteContent,
} from "../lib/cache";

async function assertAdmin() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized — please sign in.");
  }

  const allowedEmails = process.env.ADMIN_EMAILS
    ? process.env.ADMIN_EMAILS.split(",").map((e) => e.trim()).filter(Boolean)
    : [];

  if (allowedEmails.length > 0) {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const email = user.emailAddresses[0]?.emailAddress;
    if (!email || !allowedEmails.includes(email)) {
      throw new Error("Forbidden — admin access required.");
    }
  }
}

export async function saveProduct(formData) {
  await assertAdmin();

  const data = Object.fromEntries(formData);
  
  const id = data.id;
  const isNew = !id;

  const productData = {
    name: data.name,
    categoryId: data.categoryId || null,
    price: parseInt(data.price),
    originalPrice: data.originalPrice ? parseInt(data.originalPrice) : null,
    description: data.description,
    inStock: data.inStock === "true",
    badge: data.badge || null,
  };

  const tags = data.tags ? data.tags.split(",").map(t => t.trim()) : [];
  
  // Upsert all tags first
  for (const tag of tags) {
    if (!tag) continue;
    await prisma.tag.upsert({
      where: { name: tag },
      update: {},
      create: { name: tag },
    });
  }

  if (isNew) {
    await prisma.product.create({
      data: {
        ...productData,
        tags: {
          connect: tags.filter(Boolean).map(t => ({ name: t }))
        }
      }
    });
  } else {
    await prisma.product.update({
      where: { id },
      data: {
        ...productData,
        tags: {
          set: [],
          connect: tags.filter(Boolean).map(t => ({ name: t }))
        }
      }
    });
  }

  await invalidateProduct(id || "new");
  revalidatePath("/admin/products");
  revalidatePath("/");
  redirect("/admin/products");
}

export async function saveSiteContent(formData) {
  await assertAdmin();

  const announcementsArray = formData.get("announcement_texts")
    ? formData.get("announcement_texts").toString().split("\n").map(s => s.trim()).filter(Boolean)
    : [];

  const updates = [
    { key: "hero_title", value: formData.get("hero_title") },
    { key: "hero_subtitle", value: formData.get("hero_subtitle") },
    { key: "announcement_texts", value: JSON.stringify(announcementsArray) },
    { key: "free_shipping_threshold", value: formData.get("free_shipping_threshold") }
  ];

  for (const update of updates) {
    if (update.value) {
      await prisma.siteContent.upsert({
        where: { key: update.key },
        update: { value: update.value },
        create: { key: update.key, value: update.value }
      });
    }
  }

  await invalidateSiteContent("hero_title");
  await invalidateSiteContent("hero_subtitle");
  await invalidateSiteContent("announcement_texts");
  await invalidateSiteContent("free_shipping_threshold");
  revalidatePath("/admin/settings");
  revalidatePath("/");
  revalidatePath("/cart");
}

export async function saveCategory(formData) {
  await assertAdmin();

  const data = Object.fromEntries(formData);
  const id = data.id;

  if (id) {
    await prisma.category.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description || null,
        image: data.image || null
      }
    });
  } else {
    await prisma.category.create({
      data: {
        name: data.name,
        description: data.description || null,
        image: data.image || null
      }
    });
  }

  await invalidateCategories();
  revalidatePath("/admin/categories");
  revalidatePath("/categories");
  revalidatePath("/");
  redirect("/admin/categories");
}

export async function deleteCategory(id) {
  await assertAdmin();

  // Unlink products first, then delete category
  await prisma.product.updateMany({
    where: { categoryId: id },
    data: { categoryId: null }
  });
  await prisma.category.delete({ where: { id } });

  await invalidateCategories();
  revalidatePath("/admin/categories");
  revalidatePath("/categories");
  revalidatePath("/");
}

export async function deleteTag(id) {
  await assertAdmin();

  await prisma.tag.delete({ where: { id } });

  await invalidateProductLists();
  revalidatePath("/admin/tags");
  revalidatePath("/categories");
  revalidatePath("/");
}

export async function deleteProduct(id) {
  await assertAdmin();

  await prisma.product.delete({ where: { id } });

  await invalidateProduct(id);
  revalidatePath("/admin/products");
  revalidatePath("/categories");
  revalidatePath("/");
}
