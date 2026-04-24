import Link from "next/link";
import { prisma } from "../../../lib/prisma";
import DeleteCouponButton from "./components/DeleteCouponButton";

export default async function CouponsPage() {
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl md:text-4xl text-navy font-light italic mb-2">
            Coupons
          </h1>
          <p className="font-body text-outline text-sm">
            Manage discount codes, offers, and promotions.
          </p>
        </div>
        <Link
          href="/admin/coupons/new"
          className="btn-primary flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          Create Coupon
        </Link>
      </div>

      <div className="bg-white border border-surface-dim overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-surface-dim bg-surface-low">
                <th className="px-5 py-3 font-label text-[9px] tracking-[0.2em] uppercase text-outline font-semibold">
                  Code
                </th>
                <th className="px-5 py-3 font-label text-[9px] tracking-[0.2em] uppercase text-outline font-semibold">
                  Name
                </th>
                <th className="px-5 py-3 font-label text-[9px] tracking-[0.2em] uppercase text-outline font-semibold">
                  Discount
                </th>
                <th className="px-5 py-3 font-label text-[9px] tracking-[0.2em] uppercase text-outline font-semibold">
                  Scope
                </th>
                <th className="px-5 py-3 font-label text-[9px] tracking-[0.2em] uppercase text-outline font-semibold">
                  Usage
                </th>
                <th className="px-5 py-3 font-label text-[9px] tracking-[0.2em] uppercase text-outline font-semibold">
                  Status
                </th>
                <th className="px-5 py-3 font-label text-[9px] tracking-[0.2em] uppercase text-outline font-semibold text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {coupons.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center text-outline text-sm"
                  >
                    No coupons created yet.
                  </td>
                </tr>
              )}
              {coupons.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-surface-dim hover:bg-surface-low/50 transition-colors"
                >
                  <td className="px-5 py-4 font-body text-navy text-sm font-semibold">
                    {c.code}
                  </td>
                  <td className="px-5 py-4 font-body text-navy text-sm">
                    {c.name}
                  </td>
                  <td className="px-5 py-4 font-body text-navy text-sm">
                    {c.discountType === "percentage"
                      ? `${c.discountValue}%`
                      : `₹${c.discountValue}`}
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-block px-2 py-0.5 bg-surface-low font-label text-[9px] tracking-wider uppercase text-outline">
                      {c.scope.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-body text-navy text-sm">
                    {c.usedCount}
                    {c.maxUses ? ` / ${c.maxUses}` : ""}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-block w-2 h-2 ${c.isActive ? "bg-green-600" : "bg-slate-400"}`}
                    />
                    <span className="font-body text-[11px] text-outline ml-2">
                      {c.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/admin/coupons/${c.id}`}
                        className="text-outline hover:text-navy transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          edit
                        </span>
                      </Link>
                      <DeleteCouponButton id={c.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
