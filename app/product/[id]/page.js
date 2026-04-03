import { prisma } from "../../lib/prisma";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ProductClient from "./ProductClient";
import Link from "next/link";

export const revalidate = 0; // Disable static rendering for fresh DB data

export default async function ProductDetailPage({ params }) {
  const { id } = await params;

  const initialProduct = await prisma.product.findUnique({
    where: { id },
    include: { images: true, details: true, tags: true }
  });

  if (!initialProduct) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen flex items-center justify-center bg-background pt-[136px]">
          <div className="text-center space-y-6">
            <div className="w-12 h-[1px] bg-outline-var mx-auto" />
            <h1 className="font-headline text-3xl text-navy font-light italic">Piece Not Found</h1>
            <p className="font-body text-outline text-[13px]">This treasure may have been moved or is no longer available.</p>
            <Link href="/collections" className="btn-primary inline-flex mt-4">Browse The Archive</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Find related products in the same collection
  const initialRelated = await prisma.product.findMany({
    where: { 
      collection: initialProduct.collection,
      id: { not: initialProduct.id }
    },
    include: { images: true, tags: true },
    take: 4
  });

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
    <>
      <Navbar />
      <ProductClient product={product} relatedProducts={relatedProducts} />
      <Footer />
    </>
  );
}
