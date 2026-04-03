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
    collection: data.collection,
    price: parseInt(data.price),
    originalPrice: data.originalPrice ? parseInt(data.originalPrice) : null,
    description: data.description,
    category: data.category,
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

  let productId;

  if (isNew) {
    const created = await prisma.product.create({
      data: {
        ...productData,
        tags: {
          connect: tags.filter(Boolean).map(t => ({ name: t }))
        }
      }
    });
    productId = created.id;
  } else {
    // For update, reset tags first then connect
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
    productId = id;
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

export async function saveCollection(formData) {
  const data = Object.fromEntries(formData);
  const id = data.id;

  if (id) {
    await prisma.collection.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        image: data.image
      }
    });
  } else {
    await prisma.collection.create({
      data: {
        name: data.name,
        description: data.description,
        image: data.image
      }
    });
  }

  revalidatePath("/admin/collections");
  revalidatePath("/");
  redirect("/admin/collections");
}
