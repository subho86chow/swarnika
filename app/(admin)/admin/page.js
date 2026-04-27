export const dynamic = "force-dynamic";

import { prisma } from "../../lib/prisma";
import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="font-headline text-3xl md:text-4xl text-navy font-light italic mb-2">Overview</h1>
        <p className="font-body text-outline text-sm">Welcome to the Swarnika control panel.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <DashboardCard title="Total Products" model="product" href="/admin/products" />
        <DashboardCard title="Categories" model="category" href="/admin/categories" />
        <DashboardCard title="Tags" model="tag" href="/admin/tags" />
        <DashboardCard title="Hero Slides" model="heroImage" href="/admin/hero" />
        <DashboardCard title="Site Sections" model="siteContent" href="/admin/settings" />
      </div>

      <div className="bg-white border border-surface-dim p-6">
        <h3 className="font-headline text-xl text-navy mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-4">
          <Link href="/admin/products/new" className="btn-primary">Add New Product</Link>
          <Link href="/admin/categories" className="btn-secondary hero">Manage Categories</Link>
          <Link href="/admin/tags" className="btn-secondary hero">Manage Tags</Link>
          <Link href="/admin/hero" className="btn-secondary hero">Manage Hero Slides</Link>
        </div>
      </div>
    </div>
  );
}

async function DashboardCard({ title, model, href }) {
  let count = 0;
  try {
    if (model === "product") count = await prisma.product.count();
    else if (model === "category") count = await prisma.category.count();
    else if (model === "tag") count = await prisma.tag.count();
    else if (model === "heroImage") count = await prisma.heroImage.count();
    else if (model === "siteContent") count = await prisma.siteContent.count();
  } catch (e) {
    console.error("Failed to load metrics for", model);
  }

  return (
    <Link href={href} className="block group">
      <div className="bg-white border border-surface-dim p-6 hover:shadow-lg transition-shadow duration-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-label text-[10px] tracking-widest uppercase text-outline group-hover:text-navy transition-colors">{title}</h3>
          <span className="material-symbols-outlined text-outline group-hover:text-gold transition-colors">trending_flat</span>
        </div>
        <p className="font-headline text-4xl text-navy font-light">{count}</p>
      </div>
    </Link>
  );
}
