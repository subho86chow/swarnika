"use client";

import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function AccountPage() {
  return (
    <>
      <Navbar />
      <main className="pt-[72px]">
        <section className="bg-[#0a0a0a] py-16 md:py-20 px-6 md:px-12">
          <div className="max-w-[1440px] mx-auto text-center space-y-4">
            <span className="font-body text-[#c9a44a] tracking-[0.3em] uppercase text-[10px] font-semibold block">
              Welcome Back
            </span>
            <h1 className="font-headline text-3xl md:text-4xl text-white italic">
              My Account
            </h1>
          </div>
        </section>

        <section className="py-16 md:py-24 px-6 md:px-12 bg-[#faf8f3]">
          <div className="max-w-3xl mx-auto">
            {/* Login / Register Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Login */}
              <div className="space-y-6">
                <h2 className="font-headline text-2xl text-[#0a0a0a]">Sign In</h2>
                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                  <div className="space-y-2">
                    <label className="text-[10px] tracking-[0.15em] uppercase text-[#6b6b6b] font-medium block">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="w-full border border-[#e8e4db] bg-white px-4 py-3 text-[12px] text-[#0a0a0a] placeholder:text-[#6b6b6b]/60 focus:outline-none focus:border-[#c9a44a] transition-colors"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] tracking-[0.15em] uppercase text-[#6b6b6b] font-medium block">
                      Password
                    </label>
                    <input
                      type="password"
                      className="w-full border border-[#e8e4db] bg-white px-4 py-3 text-[12px] text-[#0a0a0a] placeholder:text-[#6b6b6b]/60 focus:outline-none focus:border-[#c9a44a] transition-colors"
                      placeholder="Enter your password"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="accent-[#c9a44a]" />
                      <span className="text-[11px] text-[#6b6b6b]">Remember me</span>
                    </label>
                    <a href="#" className="text-[11px] text-[#c9a44a] hover:text-[#b8923d] transition-colors">
                      Forgot password?
                    </a>
                  </div>
                  <button className="w-full bg-[#0a0a0a] text-white py-4 text-[10px] tracking-[0.2em] uppercase font-medium hover:bg-[#1a1a1a] transition-all duration-300">
                    Sign In
                  </button>
                </form>
              </div>

              {/* Register */}
              <div className="space-y-6">
                <h2 className="font-headline text-2xl text-[#0a0a0a]">Create Account</h2>
                <p className="text-[#6b6b6b] text-[13px] leading-relaxed">
                  Join the SWARNIKA family and enjoy exclusive access to new collections,
                  members-only offers, and a personalized jewelry experience.
                </p>
                <ul className="space-y-3 text-[13px] text-[#6b6b6b]">
                  {[
                    "Early access to new collections",
                    "Exclusive member-only pricing",
                    "Personalized recommendations",
                    "Order tracking & history",
                    "Wishlist management",
                  ].map((perk) => (
                    <li key={perk} className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#c9a44a] text-[16px]">check_circle</span>
                      {perk}
                    </li>
                  ))}
                </ul>
                <button className="w-full border border-[#0a0a0a] text-[#0a0a0a] py-4 text-[10px] tracking-[0.2em] uppercase font-medium hover:bg-[#0a0a0a] hover:text-white transition-all duration-300">
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
