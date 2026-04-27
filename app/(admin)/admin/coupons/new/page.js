export const dynamic = "force-dynamic";

import { prisma } from "../../../../lib/prisma";
import CouponForm from "../components/CouponForm";

export default async function NewCouponPage() {
  const [categories, products] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="font-headline text-3xl md:text-4xl text-navy font-light italic mb-2">
          Create Coupon
        </h1>
        <p className="font-body text-outline text-sm">
          Set up a new discount code.
        </p>
      </div>
      <CouponForm categories={categories} products={products} />
    </div>
  );
}
