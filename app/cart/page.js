"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { products, formatPrice } from "../lib/data";

const initialCartItems = [
  { product: products[0], quantity: 1 },
  { product: products[3], quantity: 1 },
];

export default function CartPage() {
  const [cartItems, setCartItems] = useState(initialCartItems);

  const updateQuantity = (index, delta) => {
    setCartItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const removeItem = (index) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const shipping = subtotal >= 50000 ? 0 : 999;
  const total = subtotal + shipping;

  return (
    <>
      <Navbar />

      <main className="pt-[72px]">
        {/* Header */}
        <section className="bg-navy py-16 md:py-20 px-6 md:px-12">
          <div className="max-w-[1440px] mx-auto text-center space-y-4">
            <h1 className="font-headline text-3xl md:text-4xl text-white italic">
              Your Shopping Bag
            </h1>
            <p className="font-body text-slate-400 text-sm">
              {cartItems.length} {cartItems.length === 1 ? "item" : "items"} in your bag
            </p>
          </div>
        </section>

        <section className="py-12 md:py-16 px-6 md:px-12 bg-ivory">
          <div className="max-w-[1440px] mx-auto">
            {cartItems.length === 0 ? (
              <div className="text-center py-20 space-y-5">
                <span className="material-symbols-outlined text-slate-300 text-6xl">
                  shopping_bag
                </span>
                <h2 className="font-headline text-2xl text-navy">Your bag is empty</h2>
                <p className="text-slate-subtle text-sm">
                  Discover our collections and add your favorite pieces.
                </p>
                <Link
                  href="/collections"
                  className="inline-block bg-navy text-white px-10 py-4 text-[10px] tracking-[0.2em] uppercase font-medium mt-4"
                >
                  Browse Collections
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-0">
                  {/* Header Row */}
                  <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-outline-light/30 mb-6">
                    <span className="col-span-6 text-[10px] tracking-[0.15em] uppercase text-slate-500 font-medium">
                      Product
                    </span>
                    <span className="col-span-2 text-[10px] tracking-[0.15em] uppercase text-slate-500 font-medium text-center">
                      Quantity
                    </span>
                    <span className="col-span-3 text-[10px] tracking-[0.15em] uppercase text-slate-500 font-medium text-right">
                      Subtotal
                    </span>
                    <span className="col-span-1" />
                  </div>

                  {cartItems.map((item, index) => (
                    <div
                      key={item.product.id}
                      className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 items-center py-6 border-b border-outline-light/20"
                    >
                      {/* Product Info */}
                      <div className="md:col-span-6 flex gap-4">
                        <Link
                          href={`/product/${item.product.id}`}
                          className="relative w-20 h-24 md:w-24 md:h-32 flex-shrink-0 bg-ivory-dark"
                        >
                          <Image
                            src={item.product.images[0]}
                            alt={item.product.name}
                            fill
                            sizes="96px"
                            className="object-cover"
                          />
                        </Link>
                        <div className="space-y-1.5 pt-1">
                          <span className="font-body text-slate-400 text-[9px] tracking-[0.15em] uppercase block">
                            {item.product.collection}
                          </span>
                          <Link
                            href={`/product/${item.product.id}`}
                            className="font-headline text-base text-navy hover:text-gold transition-colors block"
                          >
                            {item.product.name}
                          </Link>
                          <span className="font-body text-sm text-navy font-medium md:hidden block">
                            {formatPrice(item.product.price)}
                          </span>
                        </div>
                      </div>

                      {/* Quantity */}
                      <div className="md:col-span-2 flex items-center justify-start md:justify-center">
                        <div className="flex items-center border border-outline-light/50">
                          <button
                            onClick={() => updateQuantity(index, -1)}
                            className="w-8 h-8 flex items-center justify-center text-navy hover:bg-ivory-dark transition-colors text-sm"
                          >
                            −
                          </button>
                          <span className="w-10 h-8 flex items-center justify-center text-xs font-medium text-navy border-x border-outline-light/50">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(index, 1)}
                            className="w-8 h-8 flex items-center justify-center text-navy hover:bg-ivory-dark transition-colors text-sm"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Subtotal */}
                      <div className="md:col-span-3 hidden md:flex justify-end">
                        <span className="font-body text-navy text-sm font-semibold">
                          {formatPrice(item.product.price * item.quantity)}
                        </span>
                      </div>

                      {/* Remove */}
                      <div className="md:col-span-1 flex justify-end">
                        <button
                          onClick={() => removeItem(index)}
                          className="text-slate-400 hover:text-error transition-colors"
                          aria-label="Remove item"
                        >
                          <span className="material-symbols-outlined text-lg">close</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                  <div className="bg-white border border-outline-light/30 p-6 md:p-8 space-y-6 sticky top-24">
                    <h3 className="font-headline text-lg text-navy">Order Summary</h3>

                    <div className="space-y-3 text-sm border-b border-outline-light/20 pb-5">
                      <div className="flex justify-between">
                        <span className="text-slate-subtle">Subtotal</span>
                        <span className="text-navy font-medium">{formatPrice(subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-subtle">Shipping</span>
                        <span className="text-navy font-medium">
                          {shipping === 0 ? (
                            <span className="text-green-700">Free</span>
                          ) : (
                            formatPrice(shipping)
                          )}
                        </span>
                      </div>
                      {shipping > 0 && (
                        <p className="text-[10px] text-slate-400">
                          Free shipping on orders above ₹50,000
                        </p>
                      )}
                    </div>

                    <div className="flex justify-between items-baseline">
                      <span className="font-headline text-base text-navy">Total</span>
                      <span className="font-headline text-xl text-navy font-medium">
                        {formatPrice(total)}
                      </span>
                    </div>

                    <button className="w-full bg-navy text-white py-4 text-[10px] tracking-[0.2em] uppercase font-medium hover:bg-navy-light transition-all duration-300">
                      Proceed to Checkout
                    </button>

                    <div className="space-y-2 pt-2">
                      {[
                        { icon: "lock", text: "Secure SSL checkout" },
                        { icon: "verified", text: "Authenticity guaranteed" },
                        { icon: "redeem", text: "Luxury gift packaging" },
                      ].map((item) => (
                        <div key={item.text} className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-gold text-sm">
                            {item.icon}
                          </span>
                          <span className="text-slate-subtle text-[11px]">{item.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
