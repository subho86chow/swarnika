"use client";

import { useState, useEffect, useMemo, useCallback, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth, useUser } from "@clerk/nextjs";
import { useCart } from "../lib/cartStore";
import { useAuthModal } from "../lib/authModalContext";
import { formatPrice } from "../lib/data";
import { getAddresses } from "../lib/addressActions";
import { getCartProducts, getFreeShippingThreshold } from "../lib/cartActions";
import { validateCoupon, getApplicableCoupons } from "../lib/couponActions";

const MAX = "max-w-[1440px] mx-auto";
const PLACEHOLDER_IMAGE = "/placeholder-product.svg";

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <main className="pt-[72px] bg-background min-h-screen">
        <section className="py-20 px-6 md:px-14 lg:px-20">
          <div className={`${MAX} text-center`}>
            <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-outline text-sm mt-4">Loading checkout...</p>
          </div>
        </section>
      </main>
    }>
      <CheckoutContent />
    </Suspense>
  );
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const { openSignIn } = useAuthModal();
  const { cart, appliedCoupon, applyCoupon, removeCoupon } = useCart();

  const buyNowProductId = searchParams.get("buyNow");
  const buyNowQty = parseInt(searchParams.get("qty") || "1", 10);

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [products, setProducts] = useState([]);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(50000);
  const [taxRate, setTaxRate] = useState(18);
  const [loading, setLoading] = useState(true);

  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [applicableCoupons, setApplicableCoupons] = useState([]);
  const [shippingMode, setShippingMode] = useState("Surface"); // Surface | Express

  const hasLoadedRef = useRef(false);
  const prevCartKeyRef = useRef("");

  // Build a stable cart key for comparison (avoid re-fetching on every cart reference change)
  const cartKey = useMemo(() => {
    if (buyNowProductId) return `buyNow:${buyNowProductId}:${buyNowQty}`;
    return cart.map((c) => `${c.productId}x${c.quantity}`).join(",");
  }, [buyNowProductId, buyNowQty, cart]);

  // Resolve checkout items
  const checkoutItems = useMemo(() => {
    if (buyNowProductId) {
      const product = products.find((p) => p.id === buyNowProductId);
      if (!product) return [];
      return [{ product, quantity: buyNowQty }];
    }
    return cart
      .map((item) => {
        const product = products.find((p) => p.id === item.productId);
        return product ? { product, quantity: item.quantity } : null;
      })
      .filter(Boolean);
  }, [buyNowProductId, buyNowQty, cart, products]);

  const subtotal = checkoutItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  // ── Weight-based shipping calculation ──
  // Actual weight: sum of each product's weight × quantity
  const totalWeightGrams = checkoutItems.reduce(
    (sum, item) => sum + (item.product.weightGrams || 50) * item.quantity,
    0
  );
  // Volumetric weight: (L × W × H) / 5000 per unit, in grams
  const totalVolumetricGrams = checkoutItems.reduce((sum, item) => {
    const l = item.product.lengthCm || 10;
    const w = item.product.widthCm || 5;
    const h = item.product.heightCm || 10;
    const volKg = (l * w * h) / 5000;
    return sum + volKg * 1000 * item.quantity;
  }, 0);
  // Delhivery charges on whichever is higher
  const chargeableWeightGrams = Math.max(totalWeightGrams, totalVolumetricGrams);

  // Rate slab: ₹49 base for first 500g, ₹24 per additional 500g
  const BASE_RATE = 49;
  const PER_EXTRA_500G = 24;
  const BASE_WEIGHT = 500;

  let baseShipping;
  if (subtotal >= freeShippingThreshold) {
    baseShipping = 0;
  } else {
    const extraGrams = Math.max(0, chargeableWeightGrams - BASE_WEIGHT);
    const extraSlabs = Math.ceil(extraGrams / 500);
    baseShipping = BASE_RATE + extraSlabs * PER_EXTRA_500G;
  }
  const expressSurcharge = shippingMode === "Express" ? 499 : 0;
  const shipping = baseShipping + expressSurcharge;
  const discount = appliedCoupon?.discount || 0;
  const taxableAmount = Math.max(subtotal - discount, 0);
  const taxAmount = Math.round(taxableAmount * (taxRate / 100));
  const total = taxableAmount + taxAmount + shipping;

  // One-time load for addresses + config
  useEffect(() => {
    if (!isSignedIn || hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    async function loadConfig() {
      try {
        const [addrList, threshold, taxConfig] = await Promise.all([
          getAddresses(user.id),
          getFreeShippingThreshold(),
          fetch("/api/site-content?key=tax_rate")
            .then((r) => (r.ok ? r.json() : null))
            .catch(() => null),
        ]);

        setAddresses(addrList);
        const defaultAddr = addrList.find((a) => a.isDefault);
        if (defaultAddr) setSelectedAddressId(defaultAddr.id);

        if (threshold) setFreeShippingThreshold(threshold);
        if (taxConfig?.value) {
          const parsed = parseInt(taxConfig.value, 10);
          if (!isNaN(parsed)) setTaxRate(parsed);
        }
      } catch (e) {
        console.error("Checkout config load error:", e);
      }
    }

    loadConfig();
  }, [isSignedIn, user?.id]);

  // Load products + coupons when cart content actually changes
  useEffect(() => {
    if (!isSignedIn) {
      setLoading(false);
      return;
    }
    if (cartKey === prevCartKeyRef.current && products.length > 0) {
      setLoading(false);
      return;
    }
    prevCartKeyRef.current = cartKey;

    async function loadProducts() {
      setLoading(true);
      try {
        const productIds = buyNowProductId
          ? [buyNowProductId]
          : cart.map((item) => item.productId);

        let fetched = [];
        if (productIds.length > 0) {
          fetched = await getCartProducts(productIds);
          setProducts(fetched);
        } else {
          setProducts([]);
        }

        // Build coupon payload from resolved items
        const itemsForCoupon = buyNowProductId
          ? fetched.filter((p) => p.id === buyNowProductId).map((p) => ({
              productId: p.id,
              quantity: buyNowQty,
            }))
          : cart.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
            }));

        if (itemsForCoupon.length > 0 && user?.id) {
          const coupons = await getApplicableCoupons({
            userId: user.id,
            cartItems: itemsForCoupon,
          });
          setApplicableCoupons(coupons);
        } else {
          setApplicableCoupons([]);
        }
      } catch (e) {
        console.error("Checkout product load error:", e);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, [isSignedIn, user?.id, cartKey]); // cartKey is stable string, not array reference

  const handleApplyCoupon = useCallback(async () => {
    if (!couponCode.trim()) return;
    setCouponError("");
    setCouponLoading(true);

    const couponPayload = checkoutItems.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
    }));

    const result = await validateCoupon({
      code: couponCode.toUpperCase(),
      userId: user?.id,
      cartItems: couponPayload,
    });

    setCouponLoading(false);
    if (result.valid) {
      applyCoupon(result.coupon, result.discount);
      setCouponCode("");
    } else {
      setCouponError(result.error || "Invalid coupon");
    }
  }, [couponCode, user?.id, checkoutItems, applyCoupon]);

  const handleProceedToPayment = () => {
    if (!isSignedIn) {
      openSignIn();
      return;
    }
    if (!selectedAddressId) {
      alert("Please select a delivery address.");
      return;
    }
    if (checkoutItems.length === 0) {
      alert("Your order is empty.");
      return;
    }
    if (subtotal > 50000) {
      alert("Maximum order value is ₹50,000. Please remove some items to continue.");
      return;
    }

    const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

    const checkoutDraft = {
      source: buyNowProductId ? "buyNow" : "cart",
      items: checkoutItems.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        productImage: item.product.images?.[0] || "",
        quantity: item.quantity,
        unitPrice: item.product.price,
        totalPrice: item.product.price * item.quantity,
      })),
      address: selectedAddress,
      breakdown: {
        subtotal,
        taxRate,
        taxAmount,
        shipping,
        discount,
        total,
        shippingMode,
        expressSurcharge,
        chargeableWeightGrams,
      },
      couponCode: appliedCoupon?.coupon?.code || null,
      couponDiscount: appliedCoupon?.discount || 0,
    };

    localStorage.setItem("swarnika_checkout_draft", JSON.stringify(checkoutDraft));
    router.push("/payment");
  };

  if (!isSignedIn) {
    return (
      <main className="pt-[72px] bg-background min-h-screen">
        <section className="py-20 md:py-32 px-6 md:px-14 lg:px-20">
          <div className={`${MAX} text-center space-y-6`}>
            <span className="material-symbols-outlined text-outline-var text-6xl">lock</span>
            <h1 className="font-headline text-3xl md:text-5xl text-navy italic">Sign In Required</h1>
            <p className="font-body text-outline text-sm max-w-sm mx-auto">Please sign in to proceed with checkout.</p>
            <button onClick={openSignIn} className="btn-primary inline-flex mt-6">Sign In to Continue</button>
          </div>
        </section>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="pt-[72px] bg-background min-h-screen">
        <section className="py-20 px-6 md:px-14 lg:px-20">
          <div className={`${MAX} text-center`}>
            <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-outline text-sm mt-4">Loading checkout...</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="pt-[72px] bg-background min-h-screen">
      <section className="pt-8 md:pt-10 pb-6 md:pb-8 px-6 md:px-14 lg:px-20">
        <div className={MAX}>
          <h1 className="font-headline text-3xl md:text-5xl text-navy italic">
            {buyNowProductId ? "Complete Your Purchase" : "Checkout"}
          </h1>
          <p className="font-body text-outline text-sm mt-2">Review your order and select a delivery address.</p>
        </div>
      </section>

      <section className="pb-16 md:pb-24 px-6 md:px-14 lg:px-20">
        <div className={MAX}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 lg:items-start">
            {/* Left Column */}
            <div className="lg:col-span-7 space-y-10">
              {/* Address Selection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-headline text-xl text-navy">Delivery Address</h2>
                  <Link href="/account/addresses" className="font-label text-[11px] tracking-wider uppercase text-gold hover:underline">Manage Addresses</Link>
                </div>

                {addresses.length === 0 ? (
                  <div className="border border-surface-dim bg-white p-8 text-center space-y-4">
                    <span className="material-symbols-outlined text-outline-var text-[40px]">location_off</span>
                    <p className="text-outline text-sm">No addresses saved yet.</p>
                    <Link href="/account/addresses" className="btn-primary py-3 px-6 text-[11px] inline-flex">Add Address</Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <button
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`text-left border bg-white p-5 relative transition-colors ${
                          selectedAddressId === addr.id
                            ? "border-gold-light ring-1 ring-gold-light"
                            : "border-surface-dim hover:border-outline-var"
                        }`}
                      >
                        {addr.isDefault && <span className="absolute top-3 right-3 badge-gold text-[7px] px-2 py-0.5">Default</span>}
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedAddressId === addr.id ? "border-gold" : "border-outline"}`}>
                            {selectedAddressId === addr.id && <div className="w-2 h-2 rounded-full bg-gold" />}
                          </div>
                          <p className="font-label text-xs tracking-[0.18em] uppercase text-navy font-bold">{addr.label || "Address"}</p>
                        </div>
                        <div className="text-sm text-slate-subtle leading-relaxed space-y-0.5 pl-6">
                          <p className="font-medium text-navy">{addr.fullName}</p>
                          <p>{addr.line1}</p>
                          {addr.line2 && <p>{addr.line2}</p>}
                          <p>{addr.city}, {addr.state} {addr.zip}</p>
                          <p className="text-gold">{addr.phone}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Max Value Warning */}
              {subtotal > 50000 && (
                <div className="bg-red-50 border border-red-200 p-4 flex items-center gap-3 text-error text-sm">
                  <span className="material-symbols-outlined text-[20px]">warning</span>
                  <span>Maximum order value is ₹50,000. Please remove some items to continue.</span>
                </div>
              )}

              {/* Delivery Speed */}
              <div className="space-y-4">
                <h2 className="font-headline text-xl text-navy">Delivery Speed</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => setShippingMode("Surface")}
                    className={`text-left border bg-white p-5 relative transition-colors ${
                      shippingMode === "Surface"
                        ? "border-gold-light ring-1 ring-gold-light"
                        : "border-surface-dim hover:border-outline-var"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${shippingMode === "Surface" ? "border-gold" : "border-outline"}`}>
                        {shippingMode === "Surface" && <div className="w-2 h-2 rounded-full bg-gold" />}
                      </div>
                      <p className="font-label text-xs tracking-[0.18em] uppercase text-navy font-bold">Standard</p>
                    </div>
                    <div className="pl-6 space-y-1">
                      <p className="text-sm text-slate-subtle">5–7 business days</p>
                      <p className="text-gold text-xs font-medium">
                        {subtotal >= freeShippingThreshold ? "Free" : formatPrice(baseShipping)}
                      </p>
                      {baseShipping > 0 && (
                        <p className="text-outline text-[10px]">{(chargeableWeightGrams / 1000).toFixed(1)} kg</p>
                      )}
                    </div>
                  </button>
                  <button
                    onClick={() => setShippingMode("Express")}
                    className={`text-left border bg-white p-5 relative transition-colors ${
                      shippingMode === "Express"
                        ? "border-gold-light ring-1 ring-gold-light"
                        : "border-surface-dim hover:border-outline-var"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${shippingMode === "Express" ? "border-gold" : "border-outline"}`}>
                        {shippingMode === "Express" && <div className="w-2 h-2 rounded-full bg-gold" />}
                      </div>
                      <p className="font-label text-xs tracking-[0.18em] uppercase text-navy font-bold">Express</p>
                    </div>
                    <div className="pl-6 space-y-1">
                      <p className="text-sm text-slate-subtle">2–3 business days</p>
                      <p className="text-gold text-xs font-medium">+{formatPrice(499)}</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-4">
                <h2 className="font-headline text-xl text-navy">Order Items</h2>
                <div className="space-y-4">
                  {checkoutItems.map((item) => (
                    <div key={item.product.id} className="flex gap-4 border border-surface-dim bg-white p-4">
                      <div className="relative w-20 h-24 bg-surface-low flex-shrink-0 overflow-hidden">
                        <Image src={item.product.images?.[0] || PLACEHOLDER_IMAGE} alt={item.product.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-label text-[10px] tracking-[0.2em] uppercase text-gold font-medium">{item.product.category?.name}</p>
                        <p className="font-headline text-navy leading-tight">{item.product.name}</p>
                        <p className="text-outline text-xs mt-1">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-headline text-navy">{formatPrice(item.product.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Coupon */}
              <div className="space-y-3">
                <h2 className="font-headline text-xl text-navy">Promo Code</h2>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Enter promo code"
                      className="flex-1 field-input py-3"
                      onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                    />
                    <button onClick={handleApplyCoupon} disabled={couponLoading || !couponCode.trim()} className="btn-secondary hero py-3 px-6 text-[11px]">
                      {couponLoading ? "..." : "APPLY"}
                    </button>
                  </div>
                  {couponError && <p className="text-error text-[11px]">{couponError}</p>}
                  {appliedCoupon && (
                    <div className="flex items-center gap-3 bg-surface-low p-3 border border-gold-light/20">
                      <span className="material-symbols-outlined text-gold text-[18px]">confirmation_number</span>
                      <div className="flex-1">
                        <span className="font-label text-[9px] tracking-wider uppercase text-gold font-semibold">{appliedCoupon.coupon.code}</span>
                        <p className="text-[11px] text-outline mt-0.5">−{formatPrice(appliedCoupon.discount)}</p>
                      </div>
                      <button onClick={removeCoupon} className="text-outline hover:text-error transition-colors">
                        <span className="material-symbols-outlined text-[16px]">close</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column — Order Summary */}
            <div className="lg:col-span-5">
              <div className="sticky top-24">
                <div className="bg-white border border-surface-dim p-6 md:p-8 space-y-6">
                  <h3 className="font-headline text-2xl text-navy text-center">Order Summary</h3>

                  <div className="space-y-3">
                    <p className="font-label text-[11px] tracking-[0.2em] uppercase text-gold text-center font-medium">
                      {shipping === 0 ? "FREE PREMIUM SHIPPING UNLOCKED" : "FREE PREMIUM SHIPPING"}
                    </p>
                    <div className="relative h-1.5 bg-surface-dim">
                      <div className="absolute top-0 left-0 h-full bg-gold-light transition-all duration-500" style={{ width: `${Math.min((subtotal / freeShippingThreshold) * 100, 100)}%` }} />
                    </div>
                    <p className="text-center text-outline text-[11px]">
                      {shipping === 0 ? (
                        <span className="text-gold">You unlocked free premium shipping</span>
                      ) : (
                        <>
                          {formatPrice(subtotal)} of {formatPrice(freeShippingThreshold)}<br />
                          Add {formatPrice(Math.max(freeShippingThreshold - subtotal, 0))} more for free shipping
                        </>
                      )}
                    </p>
                  </div>

                  <div className="space-y-2 text-sm border-t border-surface-dim pt-5">
                    <div className="flex justify-between"><span className="text-outline">Subtotal</span><span className="text-navy font-medium">{formatPrice(subtotal)}</span></div>
                    {discount > 0 && <div className="flex justify-between"><span className="text-outline">Discount</span><span className="text-gold font-medium">−{formatPrice(discount)}</span></div>}
                    {expressSurcharge > 0 && (
                      <div className="flex justify-between">
                        <span className="text-outline">Express Delivery</span>
                        <span className="text-gold font-medium">+{formatPrice(expressSurcharge)}</span>
                      </div>
                    )}
                    <div className="flex justify-between"><span className="text-outline">Shipping{baseShipping > 0 ? ` (${(chargeableWeightGrams / 1000).toFixed(1)} kg)` : ""}</span><span className="text-navy font-medium">{baseShipping === 0 ? <span className="text-gold">Free</span> : formatPrice(baseShipping)}</span></div>
                    <div className="flex justify-between"><span className="text-outline">Tax ({taxRate}% GST)</span><span className="text-navy font-medium">{formatPrice(taxAmount)}</span></div>
                  </div>

                  <div className="flex justify-between items-baseline border-t border-surface-dim pt-4">
                    <span className="font-headline text-lg text-navy">Total</span>
                    <span className="font-headline text-2xl text-navy font-medium">{formatPrice(total)}</span>
                  </div>

                  <button onClick={handleProceedToPayment} disabled={!selectedAddressId || checkoutItems.length === 0 || subtotal > 50000} className="btn-primary w-full py-4 text-[11px] tracking-[0.3em] disabled:opacity-50 disabled:cursor-not-allowed">
                    PROCEED TO PAYMENT
                  </button>

                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-surface-dim">
                    {[{ icon: "lock", title: "Secure SSL" }, { icon: "verified_user", title: "Authenticity" }, { icon: "redeem", title: "Luxury gift" }].map((item) => (
                      <div key={item.title} className="flex flex-col items-center text-center gap-1.5">
                        <span className="material-symbols-outlined text-gold text-[20px]">{item.icon}</span>
                        <span className="font-label text-[10px] tracking-wider uppercase text-outline leading-tight">{item.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
