"use client";

import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function AccountPage() {
  return (
    <>
      <Navbar />
      <main className="pt-[72px]">
        <section className="bg-navy py-16 md:py-20 px-6 md:px-12">
          <div className="max-w-[1440px] mx-auto text-center space-y-4">
            <span className="font-body text-gold-light tracking-[0.3em] uppercase text-[10px] font-semibold block">
              Welcome Back
            </span>
            <h1 className="font-headline text-3xl md:text-4xl text-white italic">
              My Account
            </h1>
          </div>
        </section>

        <section className="py-16 md:py-24 px-6 md:px-12 bg-background">
          <div className="max-w-3xl mx-auto">
            {/* Login / Register Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Login */}
              <div className="space-y-6">
                <h2 className="font-headline text-2xl text-navy">Sign In</h2>
                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                  <div className="space-y-2">
                    <label className="text-[10px] tracking-[0.15em] uppercase text-outline font-medium block">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="w-full border border-surface-dim bg-white px-4 py-3 text-[12px] text-navy placeholder:text-outline/60 focus:outline-none focus:border-gold-light transition-colors"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] tracking-[0.15em] uppercase text-outline font-medium block">
                      Password
                    </label>
                    <input
                      type="password"
                      className="w-full border border-surface-dim bg-white px-4 py-3 text-[12px] text-navy placeholder:text-outline/60 focus:outline-none focus:border-gold-light transition-colors"
                      placeholder="Enter your password"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="accent-gold-light" />
                      <span className="text-[11px] text-outline">Remember me</span>
                    </label>
                    <a href="#" className="text-[11px] text-gold-light hover:text-gold-hover transition-colors">
                      Forgot password?
                    </a>
                  </div>
                  <button className="w-full bg-navy text-white py-4 text-[10px] tracking-[0.2em] uppercase font-medium hover:bg-navy-light transition-all duration-300">
                    Sign In
                  </button>
                </form>
              </div>

              {/* Register */}
              <div className="space-y-6">
                <h2 className="font-headline text-2xl text-navy">Create Account</h2>
                <p className="text-outline text-[13px] leading-relaxed">
                  Join the SWARNIKA family and enjoy exclusive access to new collections,
                  members-only offers, and a personalized jewelry experience.
                </p>
                <ul className="space-y-3 text-[13px] text-outline">
                  {[
                    "Early access to new collections",
                    "Exclusive member-only pricing",
                    "Personalized recommendations",
                    "Order tracking & history",
                    "Wishlist management",
                  ].map((perk) => (
                    <li key={perk} className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-gold-light text-[16px]">check_circle</span>
                      {perk}
                    </li>
                  ))}
                </ul>
                <button className="w-full border border-navy text-navy py-4 text-[10px] tracking-[0.2em] uppercase font-medium hover:bg-navy hover:text-white transition-all duration-300">
                  Create Account
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
