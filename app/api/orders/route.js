import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";
import { createShipment, createPickupRequest, getPackingSlip } from "../../lib/delhivery";

function normalizePhone(phone) {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length >= 10) {
    return digits;
  }
  if (digits.length === 10) {
    return `91${digits}`;
  }
  return digits;
}

function buildShipmentPayload(order, items, address, productsMap) {
  const warehouse = process.env.DELHIVERY_WAREHOUSE;
  if (!warehouse) return null;

  const productDesc = items
    .map((item) => `${item.productName} x${item.quantity}`)
    .join(", ");

  const orderId = order.id.slice(-30); // keep under 50 chars

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

  const fullAddress = [address.line1, address.line2]
    .filter(Boolean)
    .join(", ");

  const normalizedPhone = normalizePhone(address.phone);
  // Delhivery requires phone as an array of strings
  const phoneArray = normalizedPhone ? [normalizedPhone] : [];

  // Use order's shipping mode (Surface or Express)
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
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDefaultPickupTime() {
  return "14:00:00";
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      userId,
      items,
      address,
      breakdown,
      couponCode,
      couponDiscount,
      razorpayOrderId,
      razorpayPaymentId,
      shippingMode,
    } = body;

    if (!userId || !items || items.length === 0 || !address || !breakdown) {
      return NextResponse.json(
        { success: false, error: "Missing required order fields" },
        { status: 400 }
      );
    }

    const order = await prisma.order.create({
      data: {
        userId,
        status: "paid",
        shippingName: address.fullName,
        shippingPhone: address.phone,
        shippingLine1: address.line1,
        shippingLine2: address.line2 || null,
        shippingCity: address.city,
        shippingState: address.state,
        shippingZip: address.zip,
        shippingCountry: address.country || "India",
        subtotal: breakdown.subtotal,
        taxRate: breakdown.taxRate,
        taxAmount: breakdown.taxAmount,
        shippingAmount: breakdown.shipping,
        discountAmount: breakdown.discount,
        totalAmount: breakdown.total,
        couponCode: couponCode || null,
        couponDiscount: couponDiscount || 0,
        razorpayOrderId: razorpayOrderId || null,
        razorpayPaymentId: razorpayPaymentId || null,
        shippingMode: shippingMode || "Surface",
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            productImage: item.productImage || null,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
          })),
        },
      },
      include: { items: true },
    });

    // Clear cart if order was from cart
    await prisma.cartItem.deleteMany({ where: { userId } });

    // ── Delhivery Forward Journey ──
    // 1. Create Shipment → 2. Create PUR → 3. Generate Packing Slip
    let shipmentError = null;

    try {
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
      if (!payload) {
        shipmentError = "DELHIVERY_WAREHOUSE not configured.";
      } else {
        const result = await createShipment(payload);

        if (result.success && result.waybill) {
          const waybill = result.waybill;
          const trackingUrl = `https://www.delhivery.com/track/package/${waybill}`;

          // Step 2: Create Pickup Request (mandatory for forward shipments)
          let pickupRequestId = null;
          try {
            const purResult = await createPickupRequest({
              pickup_location: process.env.DELHIVERY_WAREHOUSE,
              pickup_date: getTodayDate(),
              pickup_time: getDefaultPickupTime(),
              consolidated_count: 1,
            });
            if (purResult.success) {
              pickupRequestId = purResult.pickup_request_id;
            } else {
              console.warn("Delhivery PUR creation failed:", purResult.error);
            }
          } catch (purErr) {
            console.error("Delhivery PUR creation exception:", purErr);
          }

          // Step 3: Generate packing slip
          let labelUrl = null;
          try {
            const slipResult = await getPackingSlip([waybill], true);
            if (slipResult.success) {
              labelUrl = slipResult.url;
            }
          } catch (slipErr) {
            console.error("Delhivery packing slip exception:", slipErr);
          }

          // Update order with shipment details
          await prisma.order.update({
            where: { id: order.id },
            data: {
              delhiveryWaybill: waybill,
              delhiveryStatus: "manifested",
              delhiveryTrackingUrl: trackingUrl,
              delhiveryLabelUrl: labelUrl,
              pickupRequestId,
            },
          });

          order.delhiveryWaybill = waybill;
          order.delhiveryStatus = "manifested";
          order.delhiveryTrackingUrl = trackingUrl;
          order.delhiveryLabelUrl = labelUrl;
          order.pickupRequestId = pickupRequestId;
        } else {
          shipmentError = result.error || "Shipment creation failed";
          console.warn("Delhivery shipment creation failed:", result.error);
        }
      }
    } catch (shipmentErr) {
      shipmentError = shipmentErr.message || "Shipment creation exception";
      console.error("Delhivery shipment creation exception:", shipmentErr);
    }

    // If shipment failed, record error on order (do NOT fail the order)
    if (shipmentError) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          shipmentError: shipmentError,
          shipmentErrorAt: new Date(),
        },
      });
      order.shipmentError = shipmentError;
      order.shipmentErrorAt = new Date();
    }

    return NextResponse.json({ success: true, order });
  } catch (err) {
    console.error("Order creation error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to create order" },
      { status: 500 }
    );
  }
}
