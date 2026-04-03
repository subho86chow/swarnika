import { prisma } from "../../../../lib/prisma";
import ProductForm from "../../components/ProductForm";
import { notFound } from "next/navigation";

export default async function EditProductPage({ params }) {
  const { id } = params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: { tags: true }
  });

  if (!product) {
    notFound();
  }

  return (
    <>
      <ProductForm product={product} />
    </>
  );
}
