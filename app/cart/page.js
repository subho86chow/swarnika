"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth, useUser } from "@clerk/nextjs";
import { useCart } from "../lib/cartStore";
import { useAuthModal } from "../lib/authModalContext";
import { usePageLoading } from "../lib/loadingContext";
import { formatPrice } from "../lib/data";
import { getCartProducts, getFreeShippingThreshold } from "../lib/cartActions";
import {
  validateCoupon,
  getApplicableCoupons,
} from "../lib/couponActions";
import RecentlyViewed from "../components/RecentlyViewed";

export default function CartPage() {
  return <CartContent />;
}

function CartContent() {
  const {
    cart,
    updateCartQuantity,
    removeFromCart,
    addToCart,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    hydrated,
  } = useCart();
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const { openSignIn } = useAuthModal();
  const { startLoading, stopLoading } = usePageLoading();

  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [applicableCoupons, setApplicableCoupons] = useState([]);
  const [couponsFetching, setCouponsFetching] = useState(false);
  const [giftMessages, setGiftMessages] = useState({});
  const [showGiftInput, setShowGiftInput] = useState({});
  const [dbProducts, setDbProducts] = useState([]);
  const [crossSellProducts, setCrossSellProducts] = useState([]);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(50000);
  const [productsLoading, setProductsLoading] = useState(true);

  // Immediately signal loading so the page loader stays visible while we hydrate + fetch
  useEffect(() => {
    startLoading();
  }, [startLoading]);

  // Resolve product data from DB
  const cartItems = cart.map((item) => ({
    product: dbProducts.find((p) => p.id === item.productId),
    quantity: item.quantity,
    productId: item.productId,
  }));

  const couponCartItems = useMemo(
    () =>
      cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    [cart]
  );

  const validCartItems = cartItems.filter((item) => item.product);

  const subtotal = validCartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const shipping = subtotal >= freeShippingThreshold ? 0 : 999;
  const discount = appliedCoupon?.discount || 0;
  const total = subtotal + shipping - discount;

  const shippingProgress = Math.min(
    (subtotal / freeShippingThreshold) * 100,
    100
  );
  const shippingRemaining = Math.max(freeShippingThreshold - subtotal, 0);

  const completeTheLook = crossSellProducts;

  // Fetch actual product data from DB + coupons IN PARALLEL whenever cart changes
  useEffect(() => {
    if (!hydrated) return;
    if (cart.length === 0) {
      setDbProducts([]);
      setCrossSellProducts([]);
      setApplicableCoupons([]);
      setProductsLoading(false);
      stopLoading();
      return;
    }
    setProductsLoading(true);
    setCouponsFetching(true);
    startLoading();

    const productIds = cart.map((item) => item.productId);

    // Fire all async requests in parallel
    const couponPayload = cart.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }));

    getCartProducts(productIds).then((fetched) => {
      setDbProducts(fetched);

      // Cross-sell from same categories
      const categoryIds = [
        ...new Set(fetched.map((p) => p.categoryId).filter(Boolean)),
      ];
      const cartIds = fetched.map((p) => p.id);
      if (categoryIds.length > 0) {
        import("../lib/cartActions").then((mod) =>
          mod.getProductsByCategoryIds(categoryIds, cartIds).then((crossSell) => {
            setCrossSellProducts(crossSell);
            setProductsLoading(false);
            stopLoading();
          })
        );
      } else {
        setProductsLoading(false);
        stopLoading();
      }
    });

    getApplicableCoupons({
      userId: user?.id,
      cartItems: couponPayload,
    })
      .then((coupons) => {
        setApplicableCoupons(coupons);
      })
      .catch((e) => {
        console.error("Failed to fetch applicable coupons", e);
        setApplicableCoupons([]);
      })
      .finally(() => {
        setCouponsFetching(false);
      });
  }, [cart, hydrated, user?.id, startLoading, stopLoading]);

  // Fetch dynamic free shipping threshold
  useEffect(() => {
    getFreeShippingThreshold().then(setFreeShippingThreshold).catch(() => {
      // fallback already set in initial state
    });
  }, []);

  const handleApplyCoupon = useCallback(async (codeOverride) => {
    const code = (codeOverride || couponCode).trim();
    if (!code) return;
    setCouponError("");
    setCouponLoading(true);
    const result = await validateCoupon({
      code: code.toUpperCase(),
      userId: user?.id,
      cartItems: couponCartItems,
    });
    setCouponLoading(false);
    if (result.valid) {
      applyCoupon(result.coupon, result.discount);
      setCouponCode("");
    } else {
      setCouponError(result.error || "Invalid coupon");
    }
  }, [couponCode, user?.id, couponCartItems, applyCoupon]);

  const toggleGift = (productId) => {
    setShowGiftInput((prev) => ({ ...prev, [productId]: !prev[productId] }));
  };

  const handleGiftMessage = (productId, message) => {
    setGiftMessages((prev) => ({ ...prev, [productId]: message }));
  };

  const handleCheckout = () => {
    if (!isSignedIn) {
      openSignIn();
      return;
    }
  };

  if (productsLoading) {
    return (
      <main className="pt-[72px] bg-background min-h-screen">
        {/* Empty shell while loader covers the page */}
      </main>
    );
  }

  if (validCartItems.length === 0) {
    return (
      <main className="pt-[72px] bg-background min-h-screen">
        <section className="py-20 md:py-32 px-6 md:px-14 lg:px-20">
          <div className="max-w-[1440px] mx-auto text-center space-y-6">
            <span className="material-symbols-outlined text-outline-var text-6xl">
              shopping_bag
            </span>
            <h1 className="font-headline text-3xl md:text-5xl text-navy italic">
              Your Shopping Bag
            </h1>
            <p className="font-body text-outline text-sm max-w-sm mx-auto">
              Your bag is empty. Discover our collections and add your favorite pieces.
            </p>
            <Link href="/categories" className="btn-primary inline-flex mt-6">
              Browse Collections
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="pt-[72px] bg-background min-h-screen">
      {/* Header */}
      <section className="pt-8 md:pt-10 pb-6 md:pb-8 px-6 md:px-14 lg:px-20">
        <div className="max-w-[1440px] mx-auto">
          <h1 className="font-headline text-3xl md:text-5xl text-navy italic">
            Your Shopping Bag
          </h1>
          <p className="font-body text-outline text-sm mt-2">
            {validCartItems.length}{" "}
            {validCartItems.length === 1 ? "item" : "items"} in your bag
          </p>
        </div>
      </section>

      <section className="pb-16 md:pb-24 px-6 md:px-14 lg:px-20">
        <div className="max-w-[1440px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 lg:items-start">
            {/* Left Column — Cart Items */}
            <div className="lg:col-span-7 space-y-0">
              {/* Column Headers */}
              <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-surface-dim">
                <span className="col-span-6 font-label text-[11px] tracking-[0.2em] uppercase text-outline font-medium">
                  Product
                </span>
                <span className="col-span-3 font-label text-[11px] tracking-[0.2em] uppercase text-outline font-medium text-center">
                  Quantity
                </span>
                <span className="col-span-3 font-label text-[11px] tracking-[0.2em] uppercase text-outline font-medium text-right">
                  Price
                </span>
              </div>

              {/* Cart Items */}
              {validCartItems.map((item) => (
                <div
                  key={item.product.id}
                  className="py-8 border-b border-surface-dim"
                >
                  <div className="flex md:grid md:grid-cols-12 gap-4 md:gap-6 items-start">
                    {/* Product Image */}
                    <div className="w-24 flex-shrink-0 md:w-auto md:col-span-3">
                      <Link
                        href={`/product/${item.product.id}`}
                        className="relative block aspect-[3/4] bg-surface-low overflow-hidden"
                      >
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.name}
                          fill
                          sizes="200px"
                          className="object-cover"
                        />
                      </Link>
                    </div>

                    {/* Right side */}
                    <div className="flex-1 min-w-0 md:col-span-9">
                      <div className="flex flex-col md:grid md:grid-cols-9 gap-3 md:gap-6 items-start">
                        {/* Product Info */}
                        <div className="md:col-span-5 space-y-1">
                          <span className="font-label text-[11px] tracking-[0.2em] uppercase text-gold font-medium">
                            {item.product.collection}
                          </span>
                          <div className="flex justify-between items-start gap-2 md:block">
                            <Link
                              href={`/product/${item.product.id}`}
                              className="font-headline text-lg md:text-2xl text-navy hover:text-gold transition-colors block leading-tight"
                            >
                              {item.product.name}
                            </Link>
                            <button
                              onClick={() => removeFromCart(item.product.id)}
                              className="md:hidden text-outline hover:text-error flex-shrink-0 -mt-0.5"
                            >
                              <span className="material-symbols-outlined text-[20px]">
                                close
                              </span>
                            </button>
                          </div>
                          <p className="font-body text-outline text-xs leading-relaxed line-clamp-2">
                            {item.product.description}
                          </p>
                        </div>

                        {/* Quantity */}
                        <div className="md:col-span-2 flex items-center justify-start md:justify-center">
                          <div className="flex items-center border border-surface-dim">
                            <button
                              onClick={() =>
                                updateCartQuantity(item.product.id, item.quantity - 1)
                              }
                              className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-outline hover:text-navy hover:bg-surface-low transition-colors text-lg"
                            >
                              −
                            </button>
                            <span className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-sm font-medium text-navy border-x border-surface-dim">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateCartQuantity(item.product.id, item.quantity + 1)
                              }
                              className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-outline hover:text-navy hover:bg-surface-low transition-colors text-lg"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Price + Remove */}
                        <div className="md:col-span-2 md:text-right space-y-2">
                          <p className="font-headline text-lg md:text-xl text-navy font-light">
                            {formatPrice(item.product.price * item.quantity)}
                          </p>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="hidden md:inline-flex text-outline hover:text-error transition-colors items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              delete
                            </span>
                            <span className="font-label text-[11px] tracking-wider uppercase">
                              Remove
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Gift Message Toggle */}
                  <div className="mt-5 pl-0 md:pl-[25%]">
                    <button
                      onClick={() => toggleGift(item.product.id)}
                      className="flex items-center gap-3 group"
                    >
                      <div
                        className={`w-9 h-5 flex items-center transition-colors ${
                          showGiftInput[item.product.id]
                            ? "bg-gold"
                            : "bg-surface-dim"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 bg-white transition-transform ${
                            showGiftInput[item.product.id]
                              ? "translate-x-[18px]"
                              : "translate-x-0.5"
                          }`}
                        />
                      </div>
                      <span className="font-label text-xs tracking-[0.15em] uppercase text-outline group-hover:text-navy transition-colors">
                        Add a Gift Message
                      </span>
                    </button>

                    {showGiftInput[item.product.id] && (
                      <div className="mt-3 max-w-md">
                        <input
                          type="text"
                          value={giftMessages[item.product.id] || ""}
                          onChange={(e) =>
                            handleGiftMessage(item.product.id, e.target.value)
                          }
                          placeholder="Enter your message here"
                          className="field-input w-full py-3"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Complete the Look */}
              {completeTheLook.length > 0 && (
                <div className="pt-12 pb-4">
                  <h2 className="font-headline text-2xl md:text-3xl text-navy italic mb-8">
                    Complete the Look
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                    {completeTheLook.map((product) => (
                      <div
                        key={product.id}
                        className="bg-white border border-surface-dim p-4 group hover:border-gold-light/40 transition-colors"
                      >
                        <Link
                          href={`/product/${product.id}`}
                          className="relative block aspect-[3/4] bg-surface-low overflow-hidden mb-4"
                        >
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            sizes="200px"
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        </Link>
                        <h3 className="font-headline text-sm text-navy leading-tight mb-1">
                          {product.name}
                        </h3>
                        <p className="font-body text-outline text-sm mb-4">
                          {formatPrice(product.price)}
                        </p>
                        <button
                          onClick={() => addToCart(product, 1)}
                          className="btn-primary w-full py-3 text-[10px]"
                        >
                          ADD TO BAG
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column — Order Summary */}
            <div className="lg:col-span-5">
              <div className="sticky top-24">
                <div className="bg-white border border-surface-dim p-6 md:p-8 space-y-6">
                  <h3 className="font-headline text-2xl text-navy text-center">
                    Order Summary
                  </h3>

                  {/* Shipping Progress */}
                  <div className="space-y-3">
                    <p className="font-label text-[11px] tracking-[0.2em] uppercase text-gold text-center font-medium">
                      {shipping === 0
                        ? "FREE PREMIUM SHIPPING UNLOCKED"
                        : "FREE PREMIUM SHIPPING"}
                    </p>
                    <div className="relative h-1.5 bg-surface-dim">
                      <div
                        className="absolute top-0 left-0 h-full bg-gold-light transition-all duration-500"
                        style={{ width: `${shippingProgress}%` }}
                      />
                    </div>
                    <p className="text-center text-outline text-[11px]">
                      {shipping === 0 ? (
                        <span className="text-gold">
                          You unlocked free premium shipping
                        </span>
                      ) : (
                        <>
                          {formatPrice(subtotal)} of{" "}
                          {formatPrice(freeShippingThreshold)}
                          <br />
                          Add {formatPrice(shippingRemaining)} more for free
                          premium shipping
                        </>
                      )}
                    </p>
                  </div>

                  <div className="border-t border-surface-dim pt-5 space-y-4">
                    {/* Coupon Input */}
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          placeholder="Promo code"
                          className="flex-1 field-input py-3"
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleApplyCoupon()
                          }
                        />
                        <button
                          onClick={handleApplyCoupon}
                          disabled={couponLoading || !couponCode.trim()}
                          className="btn-secondary hero py-3 px-6 text-[11px]"
                        >
                          {couponLoading ? "..." : "APPLY"}
                        </button>
                      </div>
                      {couponError && (
                        <p className="text-error text-[11px]">{couponError}</p>
                      )}
                      {appliedCoupon && (
                        <div className="flex items-center gap-3 bg-surface-low p-3 border border-gold-light/20">
                          <span className="material-symbols-outlined text-gold text-[18px]">
                            confirmation_number
                          </span>
                          <div className="flex-1">
                            <span className="font-label text-[9px] tracking-wider uppercase text-gold font-semibold">
                              {appliedCoupon.coupon.code}
                            </span>
                            <p className="text-[11px] text-outline mt-0.5">
                              −{formatPrice(appliedCoupon.discount)}
                            </p>
                          </div>
                          <button
                            onClick={removeCoupon}
                            className="text-outline hover:text-error transition-colors"
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              close
                            </span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Applicable Coupons */}
                    {!appliedCoupon && (
                      <div className="border-t border-surface-dim pt-5">
                        <p className="section-eyebrow mb-3">Available Offers</p>
                        {couponsFetching ? (
                          <div className="space-y-2">
                            <div className="w-full h-12 bg-surface-dim animate-pulse" />
                            <div className="w-full h-12 bg-surface-dim animate-pulse" />
                          </div>
                        ) : applicableCoupons.length > 0 ? (
                          <div className="space-y-2">
                            {applicableCoupons.map(({ coupon, discount }) => (
                              <button
                                key={coupon.id}
                                onClick={() => handleApplyCoupon(coupon.code)}
                                className="w-full text-left flex items-center gap-3 bg-surface-low p-3 border border-surface-dim hover:border-gold-light/40 transition-colors"
                              >
                                <span className="material-symbols-outlined text-gold text-[18px]">
                                  confirmation_number
                                </span>
                                <div className="flex-1">
                                  <span className="font-label text-[9px] tracking-wider uppercase text-gold font-semibold">
                                    {coupon.code}
                                  </span>
                                  <p className="text-[11px] text-outline mt-0.5">
                                    {coupon.name} — Save {formatPrice(discount)}
                                  </p>
                                </div>
                              </button>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    )}

                    {/* Totals */}
                    <div className="space-y-3 text-sm border-t border-surface-dim pt-5">
                      <div className="flex justify-between">
                        <span className="text-outline">Subtotal</span>
                        <span className="text-navy font-medium">
                          {formatPrice(subtotal)}
                        </span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-outline">Discount</span>
                          <span className="text-gold font-medium">
                            −{formatPrice(discount)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-outline">Shipping</span>
                        <span className="text-navy font-medium">
                          {shipping === 0 ? (
                            <span className="text-gold">Free</span>
                          ) : (
                            formatPrice(shipping)
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-baseline border-t border-surface-dim pt-4">
                      <span className="font-headline text-lg text-navy">
                        Total
                      </span>
                      <span className="font-headline text-2xl text-navy font-medium">
                        {formatPrice(total)}
                      </span>
                    </div>

                    <button
                      onClick={handleCheckout}
                      className="btn-primary w-full py-4 text-[11px] tracking-[0.3em]"
                    >
                      PROCEED TO CHECKOUT
                    </button>

                    {/* Trust Badges */}
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-surface-dim">
                      {[
                        {
                          icon: "lock",
                          title: "Secure SSL",
                          subtitle: "checkout",
                        },
                        {
                          icon: "verified_user",
                          title: "Authenticity",
                          subtitle: "guaranteed",
                        },
                        {
                          icon: "redeem",
                          title: "Luxury gift",
                          subtitle: "packaging",
                        },
                      ].map((item) => (
                        <div
                          key={item.title}
                          className="flex flex-col items-center text-center gap-1.5"
                        >
                          <span className="material-symbols-outlined text-gold text-[20px]">
                            {item.icon}
                          </span>
                          <span className="font-label text-[10px] tracking-wider uppercase text-outline leading-tight">
                            {item.title}
                          </span>
                          <span className="font-label text-[10px] tracking-wider uppercase text-outline-var leading-tight">
                            {item.subtitle}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <RecentlyViewed />
    </main>
  );
}
