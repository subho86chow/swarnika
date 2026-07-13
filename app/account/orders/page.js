"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { getOrders } from "../../lib/orderActions";
import { formatPrice } from "../../lib/data";
import CancelOrderButton from "./CancelOrderButton";

const PLACEHOLDER_IMAGE = "/placeholder-product.svg";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  paid: "bg-green-100 text-green-800",
  shipped: "bg-blue-100 text-blue-800",
  delivered: "bg-green-800 text-white",
  cancelled: "bg-red-100 text-red-800",
};

export default function OrdersPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && user?.id) {
      loadOrders();
    }
  }, [isLoaded, user?.id]);

  async function loadOrders() {
    setLoading(true);
    try {
      const data = await getOrders(user.id);
      setOrders(data);
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setLoading(false);
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className="space-y-8">
        <div>
          <span className="section-eyebrow">Purchase History</span>
          <h2 className="font-headline text-[28px] md:text-[34px] text-navy font-light italic leading-tight mt-1">Order History</h2>
        </div>
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-outline text-sm mt-4">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <span className="section-eyebrow">Purchase History</span>
        <h2 className="font-headline text-[28px] md:text-[34px] text-navy font-light italic leading-tight mt-1">
          Order History
        </h2>
        <p className="text-outline text-sm leading-relaxed mt-2">
          Track and review your past purchases.
        </p>
      </div>

      {/* Empty state */}
      {orders.length === 0 && (
        <div className="border border-surface-dim bg-white p-12 text-center space-y-4">
          <span className="material-symbols-outlined text-outline-var text-[48px]">shopping_bag</span>
          <h3 className="font-headline text-xl text-navy italic">No orders yet</h3>
          <p className="text-outline text-sm leading-relaxed max-w-sm mx-auto">
            When you place an order, it will appear here with its status and details.
          </p>
          <Link href="/categories" className="btn-primary inline-flex py-3 px-6 text-xs">
            Explore Collections
          </Link>
        </div>
      )}

      {/* Order cards */}
      {orders.length > 0 && (
        <div className="flex flex-col gap-6">
          {orders.map((order) => (
            <div key={order.id} className="border border-surface-dim bg-white overflow-hidden">
              {/* Order header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 sm:p-6 border-b border-surface-dim bg-surface-low/30">
                <div>
                  <p className="font-label text-xs tracking-[0.2em] uppercase text-navy font-bold">
                    Order #{order.id.slice(-8).toUpperCase()}
                  </p>
                  <p className="text-outline text-xs mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  {order.delhiveryWaybill && (
                    <p className="text-gold text-[10px] font-mono mt-0.5">
                      AWB: {order.delhiveryWaybill}
                    </p>
                  )}
                  {order.shipmentError && (
                    <p className="text-error text-[10px] mt-0.5">
                      Shipment failed: {order.shipmentError}
                    </p>
                  )}
                </div>
                <div className="flex flex-col sm:items-end gap-2">
                  <div className="flex items-center gap-3 flex-wrap justify-end">
                    {order.razorpayPaymentId && (
                      <span className="text-outline text-[10px] font-mono">{order.razorpayPaymentId}</span>
                    )}
                    {order.delhiveryTrackingUrl && (
                      <a
                        href={order.delhiveryTrackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-gold text-[10px] font-medium hover:underline"
                      >
                        <span className="material-symbols-outlined text-[14px]">local_shipping</span>
                        Track
                      </a>
                    )}
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-medium uppercase tracking-wider ${statusColors[order.status === "pending" && order.paymentMethod === "COD" ? "processing" : order.status] || "bg-gray-100 text-gray-800"}`}>
                      {order.status === "pending" && order.paymentMethod === "COD" ? "processing" : order.status}
                    </span>
                  </div>
                  {order.paymentMethod === "COD" && (
                    <p className="text-[10px] text-outline font-semibold">Payment to be collected on delivery</p>
                  )}
                </div>
              </div>

              {/* Items */}
              <div className="flex flex-col gap-3 p-5 sm:p-6">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="relative w-16 h-20 bg-surface-low flex-shrink-0 overflow-hidden">
                      <Image src={item.productImage || PLACEHOLDER_IMAGE} alt={item.productName} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-navy text-sm font-medium">{item.productName}</p>
                      <p className="text-outline text-xs">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-navy text-sm font-semibold">{formatPrice(item.totalPrice)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Shipping address */}
              <div className="px-5 sm:px-6 pb-5 sm:pb-6">
                <div className="border-t border-surface-dim pt-4">
                  <p className="font-label text-[10px] tracking-[0.2em] uppercase text-outline font-semibold mb-2">Shipping Address</p>
                  <div className="text-sm text-slate-subtle leading-relaxed">
                    <p className="font-medium text-navy">{order.shippingName}</p>
                    <p>{order.shippingLine1}</p>
                    {order.shippingLine2 && <p>{order.shippingLine2}</p>}
                    <p>{order.shippingCity}, {order.shippingState} {order.shippingZip}</p>
                    <p className="text-gold text-xs mt-1">{order.shippingPhone}</p>
                  </div>
                </div>
              </div>

              {/* Tracking Timeline */}
              {order.delhiveryWaybill && (
                <div className="px-5 sm:px-6 py-4 border-t border-surface-dim bg-white">
                  <p className="font-label text-[10px] tracking-[0.2em] uppercase text-outline font-semibold mb-3">Shipment Timeline</p>
                  <div className="flex items-center gap-2 text-[11px]">
                    <div className={`w-2 h-2 rounded-full ${order.status !== "pending" || order.paymentMethod === "COD" ? "bg-gold" : "bg-surface-dim"}`} />
                    <span className={order.status !== "pending" || order.paymentMethod === "COD" ? "text-navy" : "text-outline"}>
                      {order.paymentMethod === "COD" ? "Confirmed" : "Paid"}
                    </span>
                    <span className="text-surface-dim">→</span>
                    <div className={`w-2 h-2 rounded-full ${order.status === "shipped" || order.status === "delivered" ? "bg-gold" : "bg-surface-dim"}`} />
                    <span className={order.status === "shipped" || order.status === "delivered" ? "text-navy" : "text-outline"}>Shipped</span>
                    <span className="text-surface-dim">→</span>
                    <div className={`w-2 h-2 rounded-full ${order.status === "delivered" ? "bg-gold" : "bg-surface-dim"}`} />
                    <span className={order.status === "delivered" ? "text-navy" : "text-outline"}>Delivered</span>
                  </div>
                  {order.delhiveryTrackingUrl && (
                    <div className="mt-2 flex items-center gap-3">
                      <a
                        href={order.delhiveryTrackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-gold text-[11px] font-medium hover:underline"
                      >
                        <span className="material-symbols-outlined text-[14px]">local_shipping</span>
                        Track on Delhivery
                      </a>
                      <Link
                        href={`/track/${order.delhiveryWaybill}`}
                        className="text-navy text-[11px] hover:text-gold transition-colors"
                      >
                        View full tracking
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Total & Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 sm:px-6 py-4 border-t border-surface-dim bg-surface-low/20">
                <div className="flex gap-4 text-[11px] text-outline">
                  <span>Subtotal: {formatPrice(order.subtotal)}</span>
                  {order.discountAmount > 0 && <span className="text-gold">Discount: −{formatPrice(order.discountAmount)}</span>}
                  <span>Tax: {formatPrice(order.taxAmount)}</span>
                  <span>Shipping: {order.shippingAmount === 0 ? "Free" : formatPrice(order.shippingAmount)}</span>
                </div>
                <div className="flex items-center gap-6">
                  {order.status !== "shipped" && order.status !== "delivered" && order.status !== "cancelled" && (
                    <CancelOrderButton orderId={order.id} onSuccess={loadOrders} />
                  )}
                  <div className="flex items-center gap-3">
                    <span className="font-label text-xs tracking-[0.2em] uppercase text-outline font-semibold">Total</span>
                    <span className="text-navy font-semibold text-[15px]">{formatPrice(order.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
