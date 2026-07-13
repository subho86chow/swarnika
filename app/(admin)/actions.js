"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "../lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdminUser } from "../lib/adminAuth";
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
  if (!(await isAdminUser(userId))) {
    throw new Error("Forbidden — admin access required.");
  }
}

export async function saveProduct(formData) {
  await assertAdmin();

  const data = Object.fromEntries(formData);

  const id = data.id;
  const isNew = !id;

  // Extract images array from formData (images[0], images[1], ...)
  const images = [];
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("images[") && value) {
      images.push(value);
    }
  }

  const productData = {
    name: data.name,
    categoryId: data.categoryId || null,
    price: parseInt(data.price),
    originalPrice: data.originalPrice ? parseInt(data.originalPrice) : null,
    description: data.description,
    inStock: data.inStock === "true",
    badge: data.badge || null,
    // Packaging dimensions for shipping cost calculation
    weightGrams: parseInt(data.weightGrams) || 50,
    lengthCm: parseInt(data.lengthCm) || 10,
    widthCm: parseInt(data.widthCm) || 5,
    heightCm: parseInt(data.heightCm) || 10,
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

  let productId = id;

  if (isNew) {
    const created = await prisma.product.create({
      data: {
        ...productData,
        tags: {
          connect: tags.filter(Boolean).map(t => ({ name: t })),
        },
        images: {
          create: images.map((url) => ({ url })),
        },
      },
    });
    productId = created.id;
  } else {
    await prisma.product.update({
      where: { id },
      data: {
        ...productData,
        tags: {
          set: [],
          connect: tags.filter(Boolean).map((t) => ({ name: t })),
        },
      },
    });

    // Replace images: delete old, create new
    await prisma.productImage.deleteMany({ where: { productId: id } });
    if (images.length > 0) {
      await prisma.productImage.createMany({
        data: images.map((url) => ({ url, productId: id })),
      });
    }
  }

  await invalidateProduct(productId);
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
    { key: "free_shipping_threshold", value: formData.get("free_shipping_threshold") },
    { key: "tax_rate", value: formData.get("tax_rate") },
    { key: "auth_image", value: formData.get("auth_image") },
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
  await invalidateSiteContent("tax_rate");
  await invalidateSiteContent("auth_image");
  revalidatePath("/admin/settings");
  revalidatePath("/");
  revalidatePath("/cart");
  revalidatePath("/sign-in");
  revalidatePath("/sign-up");
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

// ── Order Shipping Actions ──

import {
  createShipment,
  createPickupRequest,
  getPackingSlip,
  getTrackingStatus,
  cancelShipment,
} from "../lib/delhivery";

function normalizePhone(phone) {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length >= 10) return digits;
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

function buildShipmentPayload(order, items, address, productsMap) {
  const warehouse = process.env.DELHIVERY_WAREHOUSE;
  if (!warehouse) return null;

  const productDesc = items
    .map((item) => `${item.productName} x${item.quantity}`)
    .join(", ");

  const orderId = order.id.slice(-30);

  // Calculate total weight and max dimensions from actual product data
  let totalWeight = 0;
  let maxLength = 10;
  let maxWidth = 5;
  let maxHeight = 10;

  for (const item of items) {
    const p = productsMap?.get(item.productId);
    const itemWeight = (p?.weightGrams || 50) * item.quantity;
    totalWeight += itemWeight;
    if (p) {
      maxLength = Math.max(maxLength, p.lengthCm || 10);
      maxWidth = Math.max(maxWidth, p.widthCm || 5);
      maxHeight = Math.max(maxHeight, p.heightCm || 10);
    }
  }

  // Add 20% packaging buffer to weight, minimum 50g
  const weight = Math.max(Math.round(totalWeight * 1.2), 50);

  const fullAddress = [address.line1, address.line2].filter(Boolean).join(", ");
  const normalizedPhone = normalizePhone(address.phone);
  const phoneArray = normalizedPhone ? [normalizedPhone] : [];

  const delhiveryShippingMode = order.shippingMode === "Express" ? "Express" : "Surface";

  return {
    pickup_location: { name: warehouse },
    shipments: [
      {
        name: address.fullName,
        order: orderId,
        phone: phoneArray,
        add: fullAddress,
        pin: parseInt(address.zip, 10),
        city: address.city,
        state: address.state,
        country: address.country || "India",
        payment_mode: "Prepaid",
        total_amount: order.totalAmount,
        products_desc: productDesc.slice(0, 200),
        weight,
        shipment_width: maxWidth,
        shipment_height: maxHeight,
        shipment_length: maxLength,
        cod_amount: 0,
        quantity: String(items.reduce((sum, item) => sum + item.quantity, 0)),
        fragile_shipment: true,
        shipping_mode: delhiveryShippingMode,
        return_phone: [],
      },
    ],
  };
}

function getTodayDate() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export async function retryShipment(orderId) {
  await assertAdmin();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) throw new Error("Order not found");
  if (order.delhiveryWaybill) throw new Error("Shipment already exists");

  const address = {
    fullName: order.shippingName,
    phone: order.shippingPhone,
    line1: order.shippingLine1,
    line2: order.shippingLine2,
    city: order.shippingCity,
    state: order.shippingState,
    zip: order.shippingZip,
    country: order.shippingCountry,
  };

  const items = order.items.map((item) => ({
    productId: item.productId,
    productName: item.productName,
    productImage: item.productImage,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    totalPrice: item.totalPrice,
  }));

  // Fetch product dimensions for accurate shipping payload
  const productIds = items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: {
      id: true,
      weightGrams: true,
      lengthCm: true,
      widthCm: true,
      heightCm: true,
    },
  });
  const productsMap = new Map(products.map((p) => [p.id, p]));

  const payload = buildShipmentPayload(order, items, address, productsMap);
  if (!payload) throw new Error("DELHIVERY_WAREHOUSE not configured");

  const result = await createShipment(payload);
  if (!result.success) throw new Error(result.error);

  const waybill = result.waybill;
  const trackingUrl = `https://www.delhivery.com/track/package/${waybill}`;

  // Create PUR
  let pickupRequestId = null;
  try {
    const purResult = await createPickupRequest({
      pickup_location: process.env.DELHIVERY_WAREHOUSE,
      pickup_date: getTodayDate(),
      pickup_time: "14:00:00",
      consolidated_count: 1,
    });
    if (purResult.success) pickupRequestId = purResult.pickup_request_id;
  } catch (e) {
    console.error("PUR retry failed:", e);
  }

  // Generate label
  let labelUrl = null;
  try {
    const slipResult = await getPackingSlip([waybill], true);
    if (slipResult.success) labelUrl = slipResult.url;
  } catch (e) {
    console.error("Label retry failed:", e);
  }

  await prisma.order.update({
    where: { id: orderId },
    data: {
      delhiveryWaybill: waybill,
      delhiveryStatus: "manifested",
      delhiveryTrackingUrl: trackingUrl,
      delhiveryLabelUrl: labelUrl,
      pickupRequestId,
      shipmentError: null,
      shipmentErrorAt: null,
    },
  });

  revalidatePath("/admin/orders");
  revalidatePath("/account/orders");
  return { success: true, waybill };
}

export async function updateOrderStatus(orderId, status) {
  await assertAdmin();

  const validStatuses = ["pending", "paid", "shipped", "delivered", "cancelled"];
  if (!validStatuses.includes(status)) {
    throw new Error("Invalid status");
  }

  const updateData = { status };
  if (status === "shipped") updateData.shippedAt = new Date();
  if (status === "delivered") updateData.deliveredAt = new Date();
  if (status === "cancelled") updateData.cancelledAt = new Date();

  await prisma.order.update({
    where: { id: orderId },
    data: updateData,
  });

  revalidatePath("/admin/orders");
  revalidatePath("/account/orders");
  return { success: true };
}

export async function cancelOrderShipment(orderId) {
  await assertAdmin();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) throw new Error("Order not found");
  if (!order.delhiveryWaybill) throw new Error("No shipment to cancel");

  const result = await cancelShipment(order.delhiveryWaybill);
  if (!result.success) throw new Error(result.error);

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "cancelled",
      cancelledAt: new Date(),
    },
  });

  revalidatePath("/admin/orders");
  revalidatePath("/account/orders");
  return { success: true };
}

export async function refreshTracking(orderId) {
  await assertAdmin();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) throw new Error("Order not found");
  if (!order.delhiveryWaybill) throw new Error("No waybill");

  const result = await getTrackingStatus([order.delhiveryWaybill]);
  if (!result.success) throw new Error(result.error);

  const shipment = result.shipments?.[0];
  if (!shipment) throw new Error("No shipment data found for waybill");

  // Delhivery returns both a top-level Status on each shipment AND a Scans array.
  // The top-level Status reflects the current state (e.g. "Cancelled") while
  // Scans may be empty or have a different status string.
  // Prefer the top-level Status; fall back to the latest scan.
  const topLevelStatus = shipment.Status?.Status || shipment.Status?.status;
  const topLevelStatusCode = shipment.Status?.StatusCode || "";
  const scans = shipment.Scans || shipment.scans || [];
  const latestScan = scans[0];

  const scanStatus = latestScan?.ScanDetail?.Scan || latestScan?.Status || "";
  const scanStatusCode = latestScan?.ScanDetail?.StatusCode || "";
  const statusString = (topLevelStatus || scanStatus).toString().toLowerCase().trim();
  const statusCodeString = (topLevelStatusCode || scanStatusCode).toString().toLowerCase().trim();

  if (!statusString) {
    return { success: true, note: "No status data yet" };
  }

  let newStatus = null;
  if (statusString.includes("manifested") || statusString.includes("in transit") || statusString.includes("bagging") || statusString.includes("arrived at") || statusString.includes("out for delivery") || statusString.includes("dispatched") || statusString.includes("picked up") || statusString.includes("shipped")) {
    newStatus = "shipped";
  } else if (statusString.includes("delivered")) {
    newStatus = "delivered";
  } else if (statusString.includes("rto") || statusString.includes("returned") || statusString.includes("cancelled") || statusString.includes("undelivered") || statusString.includes("not picked") || statusCodeString.includes("x-pnp") || statusCodeString.includes("x-can")) {
    newStatus = "cancelled";
  }

  if (newStatus) {
    const statusHierarchy = { pending: 0, paid: 1, shipped: 2, delivered: 3, cancelled: 4 };
    const currentLevel = statusHierarchy[order.status] || 0;
    const newLevel = statusHierarchy[newStatus] || 0;

    if (newLevel >= currentLevel || newStatus === "cancelled") {
      const updateData = { status: newStatus };
      if (newStatus === "shipped" && !order.shippedAt) updateData.shippedAt = new Date();
      if (newStatus === "delivered" && !order.deliveredAt) updateData.deliveredAt = new Date();
      if (newStatus === "cancelled" && !order.cancelledAt) updateData.cancelledAt = new Date();

      await prisma.order.update({ where: { id: orderId }, data: updateData });
    }
  }

  revalidatePath("/admin/orders");
  revalidatePath("/account/orders");
  return {
    success: true,
    newStatus: newStatus || order.status,
    topLevelStatus: topLevelStatus || null,
    latestScan: latestScan?.ScanDetail?.Scan || latestScan?.Status || null,
    scanTime: latestScan?.ScanDetail?.ScanDateTime || latestScan?.ScanDateTime || null,
    scans: scans.slice(0, 10),
  };
}
