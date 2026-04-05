import { prisma } from "../../lib/prisma";
import ProductClient from "./ProductClient";
import Link from "next/link";

export const revalidate = 0;

export default async function ProductDetailPage({ params }) {
  const { id } = await params;

  const initialProduct = await prisma.product.findUnique({
    where: { id },
    include: { images: true, details: true, tags: true, category: true }
  });

  if (!initialProduct) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background pt-[136px]">
        <div className="text-center space-y-6">
          <div className="w-12 h-[1px] bg-outline-var mx-auto" />
          <h1 className="font-headline text-3xl text-navy font-light italic">Piece Not Found</h1>
          <p className="font-body text-outline text-[13px]">This treasure may have been moved or is no longer available.</p>
          <Link href="/categories" className="btn-primary inline-flex mt-4">Browse The Archive</Link>
        </div>
      </main>
    );
  }

  // Find related products in the same category
  const initialRelated = initialProduct.categoryId
    ? await prisma.product.findMany({
        where: { 
          categoryId: initialProduct.categoryId,
          id: { not: initialProduct.id }
        },
        include: { images: true, tags: true, category: true },
        take: 4
      })
    : [];

  // Format to match old data schema expectations
  const product = {
    ...initialProduct,
    images: initialProduct.images.length > 0 ? initialProduct.images : [{ url: "" }],
    details: initialProduct.details.map(d => d.text)
  };

  const relatedProducts = initialRelated.map(p => ({
    ...p,
    image: p.images[0]?.url || "",
  }));

  return (
    <ProductClient product={product} relatedProducts={relatedProducts} />
  );
}
