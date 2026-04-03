import { prisma } from "../../../lib/prisma";
import Link from "next/link";
import Image from "next/image";

export default async function CollectionsManagementPage() {
  const collections = await prisma.collection.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl md:text-4xl text-navy font-light italic mb-2">Collections Management</h1>
          <p className="font-body text-outline text-sm">Organize products into curated thematic sets.</p>
        </div>
        <Link href="/admin/collections/new" className="btn-primary flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">add</span> New Collection
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
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-dim text-navy">
              {collections.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-outline italic">No collections found.</td>
                </tr>
              ) : (
                collections.map((collection) => (
                  <tr key={collection.id} className="hover:bg-ivory-dark/30 transition-colors">
                    <td className="p-4">
                      <div className="bg-surface-dim relative w-16 h-16 overflow-hidden border border-surface-dim rounded-sm">
                        {collection.image ? (
                          <Image src={collection.image} alt={collection.name} fill className="object-cover" />
                        ) : (
                          <span className="material-symbols-outlined text-outline/50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">image</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-semibold">{collection.name}</td>
                    <td className="p-4 text-[13px] text-outline truncate max-w-[300px]">
                      {collection.description}
                    </td>
                    <td className="p-4 text-right">
                       <Link href={`/admin/collections/${collection.id}`} className="text-outline hover:text-navy transition-colors inline-block p-2">
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
