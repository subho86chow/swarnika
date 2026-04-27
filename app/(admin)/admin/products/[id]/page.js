export const dynamic = "force-dynamic";

import { prisma } from "../../../../lib/prisma";
import ProductForm from "../../components/ProductForm";
import { notFound } from "next/navigation";

export default async function EditProductPage({ params }) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { tags: true, images: true }
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } })
  ]);

  if (!product) {
    notFound();
  }

  return (
    <>
      <ProductForm product={product} categories={categories} />
    </>
  );
}
