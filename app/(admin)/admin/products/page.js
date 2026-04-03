import { prisma } from "../../../lib/prisma";
import Link from "next/link";
import Image from "next/image";

export default async function ProductsManagementPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { images: true }
  });

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl md:text-4xl text-navy font-light italic mb-2">Products Management</h1>
          <p className="font-body text-outline text-sm">Manage your jewelry pieces, stock, and details.</p>
        </div>
        <Link href="/admin/products/new" className="btn-primary flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">add</span> New Piece
        </Link>
      </div>

      <div className="bg-white border border-surface-dim overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-body text-sm">
            <thead className="bg-ivory-dark border-b border-surface-dim uppercase text-[10px] tracking-wider text-outline font-label">
              <tr>
                <th className="p-4 font-semibold">Product</th>
                <th className="p-4 font-semibold">Collection</th>
                <th className="p-4 font-semibold">Price</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-dim text-navy">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-outline italic">No products found. Add one to get started.</td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-ivory-dark/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="bg-surface-dim relative w-12 h-12 overflow-hidden border border-surface-dim rounded-sm">
                          {product.images[0]?.url ? (
                            <Image src={product.images[0].url} alt={product.name} fill className="object-cover" />
                          ) : (
                            <span className="material-symbols-outlined text-outline/50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">image</span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-navy truncate max-w-[200px]">{product.name}</p>
                          <p className="text-[11px] text-outline mt-0.5">{product.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-[13px]">{product.collection}</td>
                    <td className="p-4 text-[13px]">
                      ₹{product.price.toLocaleString("en-IN")}
                    </td>
                    <td className="p-4">
                      {product.inStock ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase tracking-wide font-medium bg-[#ecfdf5] text-[#065f46]">In Stock</span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase tracking-wide font-medium bg-[#fef2f2] text-[#991b1b]">Out of Stock</span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-2">
                       <Link href={`/admin/products/${product.id}`} className="text-outline hover:text-navy transition-colors inline-block p-2">
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
