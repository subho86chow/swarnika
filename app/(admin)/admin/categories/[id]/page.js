export const dynamic = "force-dynamic";

import { prisma } from "../../../../lib/prisma";
import CategoryForm from "../../components/CategoryForm";
import { notFound } from "next/navigation";

export default async function EditCategoryPage({ params }) {
  const { id } = await params;

  const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category) {
    notFound();
  }

  return <CategoryForm category={category} />;
}
