"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser, useClerk, Show } from "@clerk/nextjs";
import { useAuthModal } from "../lib/authModalContext";

const PAD = "px-6 md:px-14 lg:px-20";
const MAX = "max-w-[1440px] mx-auto";

const sidebarLinks = [
  { href: "/account", label: "Overview", icon: "dashboard" },
  { href: "/account/profile", label: "My Profile", icon: "person" },
  { href: "/account/addresses", label: "Addresses", icon: "location_on" },
  { href: "/account/orders", label: "Order History", icon: "receipt_long" },
  { href: "/account/password", label: "Change Password", icon: "lock" },
];

export default function AccountLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { openSignIn } = useAuthModal();
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <main className="pt-[72px]">
      {/* ─── Page Header ─── */}
      <section className="pt-8 md:pt-10 pb-6 md:pb-8 px-6 md:px-14 lg:px-20">
        <div className="max-w-[1440px] mx-auto">
          <h1 className="font-headline text-3xl md:text-5xl text-navy italic">
            My Account
          </h1>
          <p className="font-body text-outline text-sm mt-2">
            {isSignedIn ? `Welcome, ${user?.firstName || "Member"}` : "Sign in to manage your account"}
          </p>
        </div>
      </section>

      {/* ─── Signed-out state ─── */}
      <Show when="signed-out">
        <section className={`${PAD} py-20 bg-background`}>
          <div className={`${MAX} max-w-md mx-auto text-center space-y-6`}>
            <span className="material-symbols-outlined text-outline-var text-[48px]">lock</span>
            <h2 className="font-headline text-2xl text-navy italic">Sign in to continue</h2>
            <p className="text-outline text-sm leading-relaxed">
              Access your profile, addresses, order history, and more.
            </p>
            <button onClick={openSignIn} className="btn-primary">Sign In</button>
          </div>
        </section>
      </Show>

      {/* ─── Signed-in state ─── */}
      <Show when="signed-in">
        <section className={`${PAD} py-12 md:py-16 bg-background`}>
          <div className={`${MAX} grid grid-cols-1 md:grid-cols-[240px_1fr] lg:grid-cols-[260px_1fr] gap-10 lg:gap-14`}>

            {/* ─── Sidebar ─── */}
            <aside className="md:border-r md:border-surface-dim md:pr-10">
              {/* User info */}
              {isLoaded && user && (
                <div className="flex items-center gap-3 pb-6 border-b border-surface-dim mb-6">
                  {user.imageUrl ? (
                    <img
                      src={user.imageUrl}
                      alt={user.fullName || ""}
                      className="w-10 h-10 object-cover"
                      style={{ borderRadius: "50%" }}
                    />
                  ) : (
                    <div className="w-10 h-10 bg-navy flex items-center justify-center" style={{ borderRadius: "50%" }}>
                      <span className="text-white text-sm font-semibold">
                        {(user.firstName?.[0] || "").toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-label text-[11px] font-semibold text-navy tracking-wide">
                      {user.fullName || user.primaryEmailAddress?.emailAddress}
                    </p>
                    <p className="font-label text-[10px] text-outline tracking-wider uppercase">
                      Member
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible no-scrollbar">
                {sidebarLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-3 px-4 py-3 font-label text-[11px] tracking-[0.18em] uppercase transition-all duration-200 whitespace-nowrap ${
                        isActive
                          ? "bg-navy text-white font-semibold"
                          : "text-outline hover:text-navy hover:bg-surface-low font-medium"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">{link.icon}</span>
                      {link.label}
                    </Link>
                  );
                })}

                {/* Logout */}
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 px-4 py-3 font-label text-[11px] tracking-[0.18em] uppercase text-error hover:bg-surface-low transition-all duration-200 mt-2 md:mt-4 whitespace-nowrap font-medium w-full text-left"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  Sign Out
                </button>
              </nav>
            </aside>

            {/* ─── Content Area ─── */}
            <div className="min-w-0 animate-fade-in">
              {children}
            </div>

          </div>
        </section>
      </Show>
    </main>
  );
}
