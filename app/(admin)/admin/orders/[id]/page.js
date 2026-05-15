export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "../../../../lib/prisma";
import { formatPrice } from "../../../../lib/data";
import {
  RetryShipmentButton,
  RefreshTrackingButton,
  CancelShipmentButton,
  UpdateStatusButton,
} from "./OrderActions";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  shipped: "bg-blue-100 text-blue-800",
  delivered: "bg-green-800 text-white",
  cancelled: "bg-red-100 text-red-800",
};

/**
 * Map Delhivery error messages to admin-friendly messages.
 */
function getFriendlyShipmentError(error) {
  if (!error) return null;
  const e = String(error).toLowerCase();

  if (e.includes("insufficient balance") || e.includes("wallet") || e.includes("recharge")) {
    return "Delhivery wallet insufficient. Add funds at one.delhivery.com → Billing → Wallet, then click Retry.";
  }
  if (e.includes("clientwarehouse") || e.includes("warehouse")) {
    return "Warehouse name mismatch. Verify 'SWARNIKA OFFICE' is registered in Delhivery One Panel.";
  }
  if (e.includes("pin") || e.includes("serviceable")) {
    return "Destination pincode is not serviceable by Delhivery.";
  }
  if (e.includes("phone") || e.includes("mobile")) {
    return "Invalid phone number format. Ensure it's a valid 10-digit Indian number.";
  }
  if (e.includes("duplicate")) {
    return "Duplicate order ID. This order may have already been manifested.";
  }
  if (e.includes("suspicious")) {
    return "Consignee flagged by Delhivery. Contact your Business POC for resolution.";
  }
  if (e.includes("volume exceeded") || e.includes("capacity")) {
    return "Daily pickup capacity exceeded. Schedule for next day.";
  }

  return error; // Return original if no mapping found
}

export default async function AdminOrderDetailPage({ params }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order) return notFound();

  const hasWaybill = !!order.delhiveryWaybill;
  const hasShipmentError = !!order.shipmentError;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/orders"
            className="text-outline text-xs hover:text-navy transition-colors"
          >
            ← Back to Orders
          </Link>
          <h1 className="font-headline text-3xl text-navy font-light italic mt-2">
            Order #{order.id.slice(-8).toUpperCase()}
          </h1>
          <p className="text-outline text-sm mt-1">
            {new Date(order.createdAt).toLocaleDateString("en-IN", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider ${statusColors[order.status] || "bg-gray-100 text-gray-800"}`}
          >
            {order.status}
          </span>
        </div>
      </div>

      {/* Shipment error banner */}
      {hasShipmentError && (
        <div className="bg-red-50 border border-red-200 p-4 text-error text-sm flex items-start gap-3">
          <span className="material-symbols-outlined text-[20px] mt-0.5">error</span>
          <div>
            <p className="font-medium">Shipment creation failed</p>
            <p className="text-xs mt-0.5">{getFriendlyShipmentError(order.shipmentError)}</p>
            <p className="text-[10px] text-outline mt-0.5">
              {order.shipmentErrorAt
                ? new Date(order.shipmentErrorAt).toLocaleString("en-IN")
                : ""}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Items */}
          <div className="bg-white border border-surface-dim overflow-hidden">
            <div className="px-6 py-4 border-b border-surface-dim bg-surface-low/30">
              <p className="font-label text-[10px] tracking-[0.2em] uppercase text-outline font-semibold">
                Order Items ({order.items.length})
              </p>
            </div>
            <div className="divide-y divide-surface-dim">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 px-6 py-4">
                  <div className="w-12 h-12 bg-surface-low flex-shrink-0 overflow-hidden">
                    {item.productImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-outline-var text-[10px]">
                        No img
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-navy text-sm font-medium">{item.productName}</p>
                    <p className="text-outline text-xs">
                      Qty: {item.quantity} × {formatPrice(item.unitPrice)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-navy text-sm font-semibold">{formatPrice(item.totalPrice)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white border border-surface-dim p-6 space-y-3">
            <p className="font-label text-[10px] tracking-[0.2em] uppercase text-outline font-semibold mb-3">
              Pricing Breakdown
            </p>
            <div className="flex justify-between text-sm">
              <span className="text-outline">Subtotal</span>
              <span className="text-navy font-medium">{formatPrice(order.subtotal)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-outline">Discount</span>
                <span className="text-gold font-medium">−{formatPrice(order.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-outline">Shipping</span>
              <span className="text-navy font-medium">
                {order.shippingAmount === 0 ? "Free" : formatPrice(order.shippingAmount)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-outline">Tax ({order.taxRate}% GST)</span>
              <span className="text-navy font-medium">{formatPrice(order.taxAmount)}</span>
            </div>
            <div className="flex justify-between items-baseline border-t border-surface-dim pt-3">
              <span className="font-label text-xs tracking-[0.2em] uppercase text-navy font-bold">
                Total
              </span>
              <span className="font-headline text-xl text-navy font-medium">
                {formatPrice(order.totalAmount)}
              </span>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white border border-surface-dim p-6 space-y-2">
            <p className="font-label text-[10px] tracking-[0.2em] uppercase text-outline font-semibold mb-3">
              Payment
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-outline text-xs">Razorpay Order ID</p>
                <p className="text-navy font-mono text-xs mt-0.5">{order.razorpayOrderId || "—"}</p>
              </div>
              <div>
                <p className="text-outline text-xs">Razorpay Payment ID</p>
                <p className="text-navy font-mono text-xs mt-0.5">{order.razorpayPaymentId || "—"}</p>
              </div>
            </div>
            {order.couponCode && (
              <div className="pt-2 border-t border-surface-dim mt-2">
                <p className="text-outline text-xs">
                  Coupon: <span className="text-gold font-medium">{order.couponCode}</span> — Saved{" "}
                  {formatPrice(order.couponDiscount)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-8">
          {/* Shipping */}
          <div className="bg-white border border-surface-dim p-6 space-y-3">
            <p className="font-label text-[10px] tracking-[0.2em] uppercase text-outline font-semibold mb-3">
              Shipping
            </p>
            <div className="text-sm text-slate-subtle leading-relaxed space-y-1">
              <p className="font-medium text-navy">{order.shippingName}</p>
              <p>{order.shippingLine1}</p>
              {order.shippingLine2 && <p>{order.shippingLine2}</p>}
              <p>
                {order.shippingCity}, {order.shippingState} {order.shippingZip}
              </p>
              <p className="text-gold text-xs mt-1">{order.shippingPhone}</p>
            </div>

            {hasWaybill && (
              <div className="pt-3 border-t border-surface-dim space-y-2">
                <p className="text-outline text-xs">
                  Waybill: <span className="text-gold font-mono font-medium">{order.delhiveryWaybill}</span>
                </p>
                {order.pickupRequestId && (
                  <p className="text-outline text-xs">PUR: {order.pickupRequestId}</p>
                )}
                {order.delhiveryTrackingUrl && (
                  <a
                    href={order.delhiveryTrackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-gold text-xs font-medium hover:underline"
                  >
                    <span className="material-symbols-outlined text-[14px]">local_shipping</span>
                    Track on Delhivery
                  </a>
                )}
                {order.delhiveryLabelUrl && (
                  <a
                    href={order.delhiveryLabelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-navy text-xs font-medium hover:underline"
                  >
                    Print Shipping Label
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="bg-white border border-surface-dim p-6 space-y-3">
            <p className="font-label text-[10px] tracking-[0.2em] uppercase text-outline font-semibold mb-3">
              Timeline
            </p>
            <div className="space-y-3">
              <TimelineItem
                label="Order Placed"
                date={order.createdAt}
                done
              />
              <TimelineItem
                label="Paid"
                date={order.status !== "pending" ? order.createdAt : null}
                done={order.status !== "pending"}
              />
              <TimelineItem
                label="Shipped"
                date={order.shippedAt}
                done={!!order.shippedAt || order.status === "shipped" || order.status === "delivered"}
              />
              <TimelineItem
                label="Delivered"
                date={order.deliveredAt}
                done={order.status === "delivered"}
              />
              {order.status === "cancelled" && (
                <TimelineItem
                  label="Cancelled"
                  date={order.cancelledAt}
                  done
                  error
                />
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white border border-surface-dim p-6 space-y-3">
            <p className="font-label text-[10px] tracking-[0.2em] uppercase text-outline font-semibold mb-3">
              Actions
            </p>
            <div className="space-y-2">
              {!hasWaybill && (
                <RetryShipmentButton orderId={order.id} disabled={false} />
              )}

              {hasWaybill && order.status !== "cancelled" && order.status !== "delivered" && (
                <>
                  <RefreshTrackingButton orderId={order.id} />
                  <CancelShipmentButton orderId={order.id} />
                </>
              )}

              {/* Manual status overrides */}
              {order.status === "paid" && (
                <UpdateStatusButton orderId={order.id} status="shipped" label="Mark as Shipped" />
              )}
              {(order.status === "paid" || order.status === "shipped") && (
                <UpdateStatusButton orderId={order.id} status="delivered" label="Mark as Delivered" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TimelineItem({ label, date, done, error }) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${
          error ? "bg-red-400" : done ? "bg-gold" : "bg-surface-dim"
        }`}
      />
      <div>
        <p className={`text-sm ${error ? "text-error" : done ? "text-navy" : "text-outline"}`}>
          {label}
        </p>
        {date && (
          <p className="text-[10px] text-outline-var">
            {new Date(date).toLocaleDateString("en-IN", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        )}
      </div>
    </div>
  );
}
