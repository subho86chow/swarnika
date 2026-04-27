"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";

const quickLinks = [
  { href: "/account/profile", label: "My Profile", icon: "person", desc: "Manage your personal information" },
  { href: "/account/addresses", label: "Addresses", icon: "location_on", desc: "Saved delivery addresses" },
  { href: "/account/orders", label: "Order History", icon: "receipt_long", desc: "View past orders and status" },
  { href: "/account/password", label: "Security", icon: "lock", desc: "Change your password" },
];

export default function AccountOverview() {
  const { user, isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    return <div className="py-12 text-center text-outline text-sm">Loading...</div>;
  }
  if (!isSignedIn) return null;

  return (
    <div className="space-y-10">
      {/* Welcome */}
      <div>
        <span className="section-eyebrow">Account Overview</span>
        <h2 className="font-headline text-[28px] md:text-[34px] text-navy font-light italic leading-tight mt-1">
          Hello, {user?.firstName || "there"}
        </h2>
        <p className="text-outline text-sm leading-relaxed mt-2">
          Manage your profile, addresses, and view your order history.
        </p>
      </div>

      {/* Quick-link cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group border border-surface-dim p-6 bg-white hover:border-navy transition-all duration-300 flex items-start gap-4"
          >
            <div className="w-10 h-10 bg-surface-low flex items-center justify-center shrink-0 group-hover:bg-navy transition-colors duration-300">
              <span className="material-symbols-outlined text-[20px] text-outline group-hover:text-white transition-colors duration-300">
                {link.icon}
              </span>
            </div>
            <div>
              <p className="font-label text-xs tracking-[0.18em] uppercase text-navy font-semibold">
                {link.label}
              </p>
              <p className="text-outline text-xs mt-1">{link.desc}</p>
            </div>
            <span className="material-symbols-outlined text-[16px] text-outline-var ml-auto mt-1 group-hover:text-navy group-hover:translate-x-1 transition-all duration-300">
              arrow_forward
            </span>
          </Link>
        ))}
      </div>

      {/* Account info summary */}
      <div className="border-t border-surface-dim pt-8">
        <p className="font-label text-[11px] tracking-[0.25em] uppercase text-outline font-semibold mb-4">
          Account Details
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-outline text-xs uppercase tracking-widest">Name</span>
            <p className="text-navy font-medium mt-0.5">{user?.fullName || "—"}</p>
          </div>
          <div>
            <span className="text-outline text-xs uppercase tracking-widest">Email</span>
            <p className="text-navy font-medium mt-0.5">{user?.primaryEmailAddress?.emailAddress || "—"}</p>
          </div>
          <div>
            <span className="text-outline text-xs uppercase tracking-widest">Member Since</span>
            <p className="text-navy font-medium mt-0.5">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long" }) : "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
