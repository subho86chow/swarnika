import { prisma } from "../../../../lib/prisma";
import ProductForm from "../../components/ProductForm";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <>
      <ProductForm product={null} categories={categories} />
    </>
  );
}
