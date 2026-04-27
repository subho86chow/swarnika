"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Show } from "@clerk/nextjs";
import { useAuthModal } from "../lib/authModalContext";
import { useCart } from "../lib/cartStore";

export default function Navbar({ categories = [] }) {
  const pathname = usePathname();
  const { openSignIn } = useAuthModal();
  const { cartCount } = useCart();
  const isHome = pathname === "/";

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [heroVisible, setHeroVisible] = useState(true);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10);
      setHeroVisible(window.scrollY < 80);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { href: "/categories", label: "Categories" },
    { href: "/categories?tag=bridal", label: "Bespoke" },
    { href: "/about", label: "Heritage" },
    { href: "/contact", label: "Stores" },
  ];

  const useDarkText = !isHome || scrolled || menuOpen;

  return (
    <>
      {/* Clickaway Overlay */}
      {menuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden transition-opacity duration-300"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}
      <nav
        className={`fixed top-9 w-full z-50 transition-all duration-700 ${scrolled || menuOpen
          ? "bg-background/96 backdrop-blur-md shadow-[0_4px_32px_rgba(10,10,10,0.06)] border-b border-surface-dim"
          : "bg-background/0 backdrop-blur-[2px]"
          }`}
      >
        <div className="flex justify-between items-center w-full py-4 md:py-5 px-5 md:px-14 max-w-[1440px] mx-auto">

          {/* Left: Desktop Nav Links */}
          <div className="flex-1 hidden md:flex gap-8 lg:gap-12 items-center">
            {navLinks.map((link, i) => (
              <Link
                key={link.href}
                href={link.href}
                className={`hover-underline font-label text-[11px] tracking-[0.28em] uppercase leading-relaxed transition-colors duration-300 ${useDarkText
                  ? (i === 0 ? "text-navy font-semibold" : "text-outline hover:text-navy font-medium")
                  : (i === 0 ? "text-white font-semibold" : "text-white/80 hover:text-white font-medium")
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile: Hamburger */}
          <div className="flex-1 flex md:hidden justify-start items-center">
            <button
              className="flex flex-col gap-[5px] p-1 mr-4"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <span className={`block w-5 h-[1px] transition-all duration-300 ${useDarkText ? 'bg-navy' : 'bg-white'} ${menuOpen ? "rotate-45 translate-y-[6px]" : ""}`} />
              <span className={`block w-5 h-[1px] transition-all duration-300 ${useDarkText ? 'bg-navy' : 'bg-white'} ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`block w-5 h-[1px] transition-all duration-300 ${useDarkText ? 'bg-navy' : 'bg-white'} ${menuOpen ? "-rotate-45 -translate-y-[6px]" : ""}`} />
          </button>
        </div>

        {/* Center: Logo */}
        <div className="flex-1 flex justify-center">
          <Link href="/" className="flex flex-col items-center">
            <Image
              src="/products/logo.svg"
              alt="Swarnika Logo"
              width={80}
              height={42}
              priority
              className="w-[80px] sm:w-[100px] md:w-[120px] lg:w-[100px] h-auto object-contain transition-all duration-300"
            />
          </Link>
        </div>

        {/* Right: Icons */}
        <div className="flex-1 flex justify-end items-center gap-5 md:gap-7">
          <button
            aria-label="Search"
            className={`hidden md:flex items-center transition-colors duration-300 ${useDarkText ? "text-outline hover:text-navy" : "text-white/80 hover:text-white"}`}
          >
            <span className="material-symbols-outlined text-[20px]">search</span>
          </button>

          <Link
            href="/favorites"
            aria-label="Wishlist"
            className={`hidden md:flex items-center transition-colors duration-300 ${useDarkText ? "text-outline hover:text-navy" : "text-white/80 hover:text-white"}`}
          >
            <span className="material-symbols-outlined text-[20px]">favorite</span>
          </Link>

          {/* Account icon — sign-in page when signed out, link to /account when signed in */}
          <Show when="signed-out">
            <button
              aria-label="Account"
              onClick={openSignIn}
              className={`hidden md:flex items-center transition-colors duration-300 ${useDarkText ? "text-outline hover:text-navy" : "text-white/80 hover:text-white"}`}
            >
              <span className="material-symbols-outlined text-[20px]">person</span>
            </button>
          </Show>
          <Show when="signed-in">
            <Link
              href="/account"
              aria-label="My Account"
              className={`hidden md:flex items-center transition-colors duration-300 ${useDarkText ? "text-outline hover:text-navy" : "text-white/80 hover:text-white"}`}
            >
              <span className="material-symbols-outlined text-[20px]">person</span>
            </Link>
          </Show>

          <Link
            href="/cart"
            aria-label="Shopping bag"
            className={`flex items-center transition-colors duration-300 relative ${useDarkText ? "text-navy hover:text-gold" : "text-white hover:text-white/80"}`}
          >
            <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-gold-light text-white text-[8px] font-bold w-[14px] h-[14px] flex items-center justify-center" style={{ borderRadius: "50%" }}>
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile Dropdown */}
      <div
        className={`md:hidden absolute top-full left-0 w-full bg-background transition-all duration-400 overflow-hidden ${menuOpen ? "max-h-[520px] shadow-xl border-t border-surface-dim" : "max-h-0 border-t-0 border-transparent"
          }`}
      >
        <div className="flex flex-col px-8 py-10 gap-7">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
            <input
              type="text"
              placeholder="Search the archive..."
              className="w-full bg-transparent border-b border-outline-var px-0 pl-7 py-2.5 text-base text-navy placeholder:text-outline placeholder:tracking-[0.1em] placeholder:uppercase placeholder:text-[10px] focus:outline-none focus:border-navy transition-colors"
            />
          </div>

          <div className="flex flex-col gap-0 divide-y divide-ivory-dark">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-navy font-label text-[11px] tracking-[0.28em] uppercase py-4 hover:text-gold transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Show when="signed-out">
              <button
                className="flex items-center gap-3 text-outline font-label text-[11px] tracking-[0.28em] uppercase py-4"
                onClick={() => { setMenuOpen(false); openSignIn(); }}
              >
                <span className="material-symbols-outlined text-[16px]">person</span>
                Sign In
              </button>
            </Show>
            <Show when="signed-in">
              <Link
                href="/account"
                  className="flex items-center gap-3 text-outline font-label text-[11px] tracking-[0.28em] uppercase py-4 hover:text-navy transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                <span className="material-symbols-outlined text-[16px]">person</span>
                My Account
              </Link>
            </Show>
          </div>
        </div>
      </div>
    </nav>
    </>
  );
}
