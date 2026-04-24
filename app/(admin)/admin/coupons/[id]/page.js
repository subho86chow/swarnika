import { notFound } from "next/navigation";
import { prisma } from "../../../../lib/prisma";
import { getCouponById } from "../../../../lib/couponActions";
import CouponForm from "../components/CouponForm";

export default async function EditCouponPage({ params }) {
  const { id } = await params;
  const coupon = await getCouponById(id);

  if (!coupon) return notFound();

  const [categories, products] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="font-headline text-3xl md:text-4xl text-navy font-light italic mb-2">
          Edit Coupon
        </h1>
        <p className="font-body text-outline text-sm">
          Update coupon details.
        </p>
      </div>
      <CouponForm coupon={coupon} categories={categories} products={products} />
    </div>
  );
}
