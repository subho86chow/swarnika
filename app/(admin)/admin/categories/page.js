import { prisma } from "../../../lib/prisma";
import Link from "next/link";
import Image from "next/image";
import DeleteCategoryButton from "../components/DeleteCategoryButton";

export default async function CategoriesManagementPage() {
  const categories = await prisma.category.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { products: true } } }
  });

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl md:text-4xl text-navy font-light italic mb-2">Category Management</h1>
          <p className="font-body text-outline text-sm">Organize products into categories.</p>
        </div>
        <Link href="/admin/categories/new" className="btn-primary flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">add</span> New Category
        </Link>
      </div>

      <div className="bg-white border border-surface-dim overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-body text-sm">
            <thead className="bg-ivory-dark border-b border-surface-dim uppercase text-[10px] tracking-wider text-outline font-label">
              <tr>
                <th className="p-4 font-semibold w-16">Image</th>
                <th className="p-4 font-semibold">Name</th>
                <th className="p-4 font-semibold">Description</th>
                <th className="p-4 font-semibold text-center">Products</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-dim text-navy">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-outline italic">No categories found.</td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.id} className="hover:bg-ivory-dark/30 transition-colors">
                    <td className="p-4">
                      <div className="bg-surface-dim relative w-16 h-16 overflow-hidden border border-surface-dim rounded-sm">
                        {category.image ? (
                          <Image src={category.image} alt={category.name} fill className="object-cover" />
                        ) : (
                          <span className="material-symbols-outlined text-outline/50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">image</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-semibold">{category.name}</td>
                    <td className="p-4 text-[13px] text-outline truncate max-w-[300px]">
                      {category.description || "—"}
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase tracking-wide font-medium bg-[#f0f4ff] text-[#1e40af]">
                        {category._count.products}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/admin/categories/${category.id}`} className="text-outline hover:text-navy transition-colors inline-block p-2">
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </Link>
                        <DeleteCategoryButton id={category.id} name={category.name} />
                      </div>
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
