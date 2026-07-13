"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, useUser } from "@clerk/nextjs";
import { useCart } from "../lib/cartStore";
import { formatPrice } from "../lib/data";
import Image from "next/image";

const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_Sniov1AvjJXyED";
const PLACEHOLDER_IMAGE = "/placeholder-product.svg";

export default function PaymentPage() {
  return <PaymentContent />;
}

function PaymentContent() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const { clearCart } = useCart();

  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("RAZORPAY");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("swarnika_checkout_draft");
      if (!stored) {
        router.replace("/cart");
        return;
      }
      const parsed = JSON.parse(stored);
      setDraft(parsed);
    } catch {
      router.replace("/cart");
    } finally {
      setLoading(false);
    }
  }, [router]);

  const loadRazorpayScript = () => {
    return new Promise((resolve, reject) => {
      if (document.getElementById("razorpay-script")) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.id = "razorpay-script";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => reject(new Error("Failed to load Razorpay checkout"));
      document.body.appendChild(script);
    });
  };

  const createRazorpayOrder = async () => {
    const res = await fetch("/api/razorpay/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: draft.breakdown.total * 100, // paise
        currency: "INR",
        receipt: `rcpt_${Date.now()}`,
        notes: {
          userId: user?.id,
          source: draft.source,
        },
      }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to create payment order");
    return data;
  };

  const verifyAndCreateOrder = async (razorpayOrderId, razorpayPaymentId, signature) => {
    // Verify payment
    const verifyRes = await fetch("/api/razorpay/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ razorpayOrderId, razorpayPaymentId, signature }),
    });
    const verifyData = await verifyRes.json();
    if (!verifyData.success) throw new Error("Payment verification failed");

    // Create order in DB
    const orderRes = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        items: draft.items,
        address: draft.address,
        breakdown: draft.breakdown,
        couponCode: draft.couponCode,
        couponDiscount: draft.couponDiscount,
        razorpayOrderId,
        razorpayPaymentId,
        shippingMode: draft.breakdown.shippingMode || "Surface",
      }),
    });
    const orderData = await orderRes.json();
    if (!orderData.success) throw new Error("Failed to save order");

    return orderData.order;
  };

  const handlePayment = useCallback(async () => {
    if (!draft || !user?.id) return;
    setProcessing(true);
    setError("");

    try {
      if (paymentMethod === "COD") {
        const orderRes = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            items: draft.items,
            address: draft.address,
            breakdown: draft.breakdown,
            couponCode: draft.couponCode,
            couponDiscount: draft.couponDiscount,
            shippingMode: draft.breakdown.shippingMode || "Surface",
            paymentMethod: "COD",
          }),
        });
        const orderData = await orderRes.json();
        if (!orderData.success) throw new Error(orderData.error || "Failed to place COD order");

        localStorage.removeItem("swarnika_checkout_draft");
        if (draft.source === "cart") {
          clearCart();
        }
        router.push("/account/orders");
        return;
      }

      await loadRazorpayScript();
      const razorpayData = await createRazorpayOrder();

      const options = {
        key: razorpayData.key_id || RAZORPAY_KEY_ID,
        amount: draft.breakdown.total * 100,
        currency: "INR",
        name: "SWARNIKA | House of Jewelry",
        description: `Order — ${draft.items.length} item(s)`,
        order_id: razorpayData.order.id,
        prefill: {
          name: draft.address.fullName,
          email: user?.primaryEmailAddress?.emailAddress || "",
          contact: draft.address.phone,
        },
        theme: {
          color: "#C9A44A",
        },
        handler: async function (response) {
          try {
            const order = await verifyAndCreateOrder(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature
            );
            localStorage.removeItem("swarnika_checkout_draft");
            if (draft.source === "cart") {
              clearCart();
            }
            router.push("/account/orders");
          } catch (err) {
            setError(err.message || "Payment was successful but we couldn't save your order. Please contact support.");
            setProcessing(false);
          }
        },
        modal: {
          ondismiss: function () {
            setProcessing(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err.message || "Failed to initiate payment. Please try again.");
      setProcessing(false);
    }
  }, [draft, user, router, clearCart, paymentMethod]);

  if (loading) {
    return (
      <main className="pt-[72px] bg-background min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-outline text-sm">Preparing your payment...</p>
        </div>
      </main>
    );
  }

  if (!draft) return null;

  return (
    <main className="pt-[72px] bg-background min-h-screen">
      <section className="pt-8 md:pt-10 pb-6 md:pb-8 px-6 md:px-14 lg:px-20">
        <div className="max-w-[600px] mx-auto">
          <h1 className="font-headline text-3xl md:text-4xl text-navy italic text-center">Secure Payment</h1>
          <p className="font-body text-outline text-sm mt-2 text-center">
            Complete your purchase securely via Razorpay.
          </p>
        </div>
      </section>

      <section className="pb-16 md:pb-24 px-6 md:px-14 lg:px-20">
        <div className="max-w-[600px] mx-auto space-y-8">
          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 p-4 text-error text-sm">
              <span className="material-symbols-outlined text-[20px]">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Order Summary */}
          <div className="bg-white border border-surface-dim p-6 md:p-8 space-y-6">
            <h3 className="font-headline text-xl text-navy text-center">Order Summary</h3>

            {/* Items */}
            <div className="space-y-3">
              {draft.items.map((item) => (
                <div key={item.productId} className="flex gap-3 border-b border-surface-dim pb-3 last:border-0">
                  <div className="relative w-16 h-20 bg-surface-low flex-shrink-0 overflow-hidden">
                    <Image src={item.productImage || PLACEHOLDER_IMAGE} alt={item.productName} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-headline text-sm text-navy leading-tight">{item.productName}</p>
                    <p className="text-outline text-xs">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-headline text-navy text-sm">{formatPrice(item.totalPrice)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Address */}
            <div className="border-t border-surface-dim pt-4 space-y-1">
              <p className="section-eyebrow">Delivering to</p>
              <div className="text-sm text-slate-subtle leading-relaxed">
                <p className="font-medium text-navy">{draft.address.fullName}</p>
                <p>{draft.address.line1}</p>
                {draft.address.line2 && <p>{draft.address.line2}</p>}
                <p>{draft.address.city}, {draft.address.state} {draft.address.zip}</p>
                <p className="text-gold">{draft.address.phone}</p>
              </div>
            </div>

            {/* Breakdown */}
            <div className="space-y-2 text-sm border-t border-surface-dim pt-4">
              <div className="flex justify-between">
                <span className="text-outline">Subtotal</span>
                <span className="text-navy font-medium">{formatPrice(draft.breakdown.subtotal)}</span>
              </div>
              {draft.breakdown.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-outline">Discount</span>
                  <span className="text-gold font-medium">−{formatPrice(draft.breakdown.discount)}</span>
                </div>
              )}
              {draft.breakdown.expressSurcharge > 0 && (
                <div className="flex justify-between">
                  <span className="text-outline">Express Delivery</span>
                  <span className="text-gold font-medium">+{formatPrice(draft.breakdown.expressSurcharge)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-outline">
                  Shipping
                  {draft.breakdown.shipping > 0 && draft.breakdown.chargeableWeightGrams ? ` (${(draft.breakdown.chargeableWeightGrams / 1000).toFixed(1)} kg)` : ""}
                </span>
                <span className="text-navy font-medium">
                  {draft.breakdown.shipping === 0 ? <span className="text-gold">Free</span> : formatPrice(draft.breakdown.shipping)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-outline">Tax ({draft.breakdown.taxRate}% GST)</span>
                <span className="text-navy font-medium">{formatPrice(draft.breakdown.taxAmount)}</span>
              </div>
              {draft.breakdown.shippingMode && (
                <div className="flex justify-between text-[11px]">
                  <span className="text-outline">Delivery Mode</span>
                  <span className="text-navy font-medium">{draft.breakdown.shippingMode}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-baseline border-t border-surface-dim pt-4">
              <span className="font-headline text-lg text-navy">Total</span>
              <span className="font-headline text-2xl text-navy font-medium">{formatPrice(draft.breakdown.total)}</span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white border border-surface-dim p-6 md:p-8 space-y-4">
            <h3 className="font-headline text-xl text-navy text-center">Payment Method</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 border border-surface-dim cursor-pointer hover:bg-surface-low transition-colors">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="RAZORPAY"
                  checked={paymentMethod === "RAZORPAY"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-4 h-4 text-navy focus:ring-navy"
                />
                <span className="font-body text-sm text-navy">Pay Online (Credit Card, UPI, NetBanking)</span>
              </label>
              <label className="flex items-center gap-3 p-4 border border-surface-dim cursor-pointer hover:bg-surface-low transition-colors">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={paymentMethod === "COD"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-4 h-4 text-navy focus:ring-navy"
                />
                <span className="font-body text-sm text-navy">Cash on Delivery (COD)</span>
              </label>
            </div>
          </div>

          {/* Pay Button */}
          <button
            onClick={handlePayment}
            disabled={processing}
            className="btn-primary w-full py-5 text-[11px] tracking-[0.3em] disabled:opacity-50"
          >
            {processing ? "Processing..." : paymentMethod === "COD" ? "PLACE ORDER" : "PAY NOW"}
          </button>

          <p className="text-center text-outline text-[11px]">
            By proceeding, you agree to our{" "}
            <Link href="/shipping" className="text-gold hover:underline">Shipping</Link>{" "}
            &{" "}
            <Link href="/faq" className="text-gold hover:underline">FAQ</Link> terms.
          </p>
        </div>
      </section>
    </main>
  );
}
