"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function Navbar() {
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
    { href: "/collections", label: "Collections" },
    { href: "/collections?tag=bridal", label: "Bespoke" },
    { href: "/about", label: "Heritage" },
    { href: "/contact", label: "Stores" },
  ];

  return (
    <nav
      className={`fixed top-9 w-full z-50 transition-all duration-700 ${
        scrolled
          ? "bg-[#faf8f3]/96 backdrop-blur-md shadow-[0_4px_32px_rgba(10,10,10,0.06)] border-b border-[#e8e4db]"
          : "bg-[#faf8f3]/0 backdrop-blur-[2px]"
      }`}
    >
      <div className="flex justify-between items-center w-full py-5" style={{ paddingLeft: '3.5rem', paddingRight: '3.5rem', maxWidth: '1440px', margin: '0 auto' }}>

        {/* Left: Desktop Nav Links */}
        <div className="flex-1 hidden md:flex gap-8 lg:gap-12 items-center">
          {navLinks.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              className={`hover-underline font-label text-[9.5px] tracking-[0.28em] uppercase leading-relaxed transition-colors duration-300 ${
                scrolled
                  ? (i === 0 ? "text-[#0a0a0a] font-semibold" : "text-[#6b6b6b] hover:text-[#0a0a0a] font-medium")
                  : (i === 0 ? "text-white font-semibold" : "text-white/80 hover:text-white font-medium")
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile: Hamburger */}
        <button
          className="md:hidden flex flex-col gap-[5px] p-1 mr-4"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`block w-5 h-[1px] transition-all duration-300 ${scrolled || menuOpen ? 'bg-[#0a0a0a]' : 'bg-white'} ${menuOpen ? "rotate-45 translate-y-[6px]" : ""}`} />
          <span className={`block w-5 h-[1px] transition-all duration-300 ${scrolled || menuOpen ? 'bg-[#0a0a0a]' : 'bg-white'} ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block w-5 h-[1px] transition-all duration-300 ${scrolled || menuOpen ? 'bg-[#0a0a0a]' : 'bg-white'} ${menuOpen ? "-rotate-45 -translate-y-[6px]" : ""}`} />
        </button>

        {/* Center: Logo */}
        <div className="flex-1 flex justify-center">
          <Link href="/" className="flex flex-col items-center">
            <Image 
              src="/logo.png" 
              alt="Swarnika Logo" 
              width={150} 
              height={82} 
              priority 
              quality={100}
              className="w-[100px] sm:w-[120px] md:w-[140px] lg:w-[150px] h-auto object-contain transition-all duration-300" 
            />
          </Link>
        </div>

        {/* Right: Icons */}
        <div className="flex-1 flex justify-end items-center gap-5 md:gap-7">
          <button
            aria-label="Search"
            className={`hidden md:flex items-center transition-colors duration-300 ${scrolled ? "text-[#6b6b6b] hover:text-[#0a0a0a]" : "text-white/80 hover:text-white"}`}
          >
            <span className="material-symbols-outlined text-[20px]">search</span>
          </button>

          <button
            aria-label="Wishlist"
            className={`hidden md:flex items-center transition-colors duration-300 ${scrolled ? "text-[#6b6b6b] hover:text-[#0a0a0a]" : "text-white/80 hover:text-white"}`}
          >
            <span className="material-symbols-outlined text-[20px]">favorite</span>
          </button>

          <Link
            href="/account"
            aria-label="Account"
            className={`hidden md:flex items-center transition-colors duration-300 ${scrolled ? "text-[#6b6b6b] hover:text-[#0a0a0a]" : "text-white/80 hover:text-white"}`}
          >
            <span className="material-symbols-outlined text-[20px]">person</span>
          </Link>

          <Link
            href="/cart"
            aria-label="Shopping bag"
            className={`flex items-center transition-colors duration-300 relative ${scrolled ? "text-[#0a0a0a] hover:text-[#7a6130]" : "text-white hover:text-white/80"}`}
          >
            <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
            <span className="absolute -top-1.5 -right-1.5 bg-[#c9a44a] text-white text-[8px] font-bold w-[14px] h-[14px] flex items-center justify-center" style={{borderRadius:"50%"}}>
              0
            </span>
          </Link>
        </div>
      </div>

      {/* Mobile Dropdown */}
      <div
        className={`md:hidden absolute top-full left-0 w-full bg-[#faf8f3] transition-all duration-400 overflow-hidden border-t border-[#e8e4db] ${
          menuOpen ? "max-h-[520px] shadow-xl" : "max-h-0"
        }`}
      >
        <div className="flex flex-col px-8 py-10 gap-7">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-[#6b6b6b] text-[18px]">search</span>
            <input
              type="text"
              placeholder="Search the archive..."
              className="w-full bg-transparent border-b border-[#c8c4bb] px-0 pl-7 py-2.5 text-[12px] text-[#0a0a0a] placeholder:text-[#6b6b6b] placeholder:tracking-[0.1em] placeholder:uppercase placeholder:text-[10px] focus:outline-none focus:border-[#0a0a0a] transition-colors"
            />
          </div>

          <div className="flex flex-col gap-0 divide-y divide-[#f4f1ea]">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[#0a0a0a] font-label text-[10px] tracking-[0.28em] uppercase py-4 hover:text-[#7a6130] transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/account"
              className="flex items-center gap-3 text-[#6b6b6b] font-label text-[10px] tracking-[0.28em] uppercase py-4"
              onClick={() => setMenuOpen(false)}
            >
              <span className="material-symbols-outlined text-[16px]">person</span>
              My Account
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
