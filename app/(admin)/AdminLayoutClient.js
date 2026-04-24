"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayoutClient({ children }) {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: "dashboard" },
    { label: "Products", href: "/admin/products", icon: "inventory_2" },
    { label: "Categories", href: "/admin/categories", icon: "category" },
    { label: "Tags", href: "/admin/tags", icon: "label" },
    { label: "Coupons", href: "/admin/coupons", icon: "confirmation_number" },
    { label: "Site Content", href: "/admin/settings", icon: "format_paint" },
    { label: "Back to Store", href: "/", icon: "arrow_back" },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-surface-dim bg-background/50 backdrop-blur-md hidden md:flex flex-col">
        <div className="p-6 border-b border-surface-dim">
          <h2 className="font-headline text-navy text-2xl font-semibold italic">Admin Panel</h2>
          <p className="font-body text-[10px] uppercase tracking-widest text-outline mt-1">Swarnika</p>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href) && item.href !== "/");
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                  isActive ? "bg-navy text-white" : "text-navy hover:bg-surface-dim"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                <span className="font-label text-xs tracking-wider uppercase font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-ivory-dark/30">
        {/* Mobile Header */}
        <header className="md:hidden border-b border-surface-dim p-4 flex items-center justify-between bg-white">
          <h2 className="font-headline text-navy text-xl font-semibold italic">Admin</h2>
        </header>

        <div className="p-6 md:p-10 max-w-[1200px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
