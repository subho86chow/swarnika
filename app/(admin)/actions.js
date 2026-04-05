"use server";

import { prisma } from "../lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function saveProduct(formData) {
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

  revalidatePath("/admin/products");
  revalidatePath("/");
  redirect("/admin/products");
}

export async function saveSiteContent(formData) {
  const announcementsArray = formData.get("announcement_texts")
    ? formData.get("announcement_texts").toString().split("\n").map(s => s.trim()).filter(Boolean)
    : [];

  const updates = [
    { key: "hero_title", value: formData.get("hero_title") },
    { key: "hero_subtitle", value: formData.get("hero_subtitle") },
    { key: "announcement_texts", value: JSON.stringify(announcementsArray) } // JSON string array
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

  revalidatePath("/admin/settings");
  revalidatePath("/");
}

export async function saveCategory(formData) {
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

  revalidatePath("/admin/categories");
  revalidatePath("/categories");
  revalidatePath("/");
  redirect("/admin/categories");
}

export async function deleteCategory(id) {
  // Unlink products first, then delete category
  await prisma.product.updateMany({
    where: { categoryId: id },
    data: { categoryId: null }
  });
  await prisma.category.delete({ where: { id } });

  revalidatePath("/admin/categories");
  revalidatePath("/categories");
  revalidatePath("/");
}

export async function deleteTag(id) {
  await prisma.tag.delete({ where: { id } });

  revalidatePath("/admin/tags");
  revalidatePath("/categories");
  revalidatePath("/");
}

export async function deleteProduct(id) {
  await prisma.product.delete({ where: { id } });

  revalidatePath("/admin/products");
  revalidatePath("/categories");
  revalidatePath("/");
}
