export const dynamic = "force-dynamic";

import { prisma } from "../../../lib/prisma";
import DeleteTagButton from "../components/DeleteTagButton";

export default async function TagsManagementPage() {
  const tags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } }
  });

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl md:text-4xl text-navy font-light italic mb-2">Tag Management</h1>
          <p className="font-body text-outline text-sm">Tags are automatically created when you add them to a product. Here you can view and delete existing tags.</p>
        </div>
      </div>

      <div className="bg-white border border-surface-dim overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-body text-sm">
            <thead className="bg-ivory-dark border-b border-surface-dim uppercase text-[10px] tracking-wider text-outline font-label">
              <tr>
                <th className="p-4 font-semibold">Tag Name</th>
                <th className="p-4 font-semibold text-center">Products Using</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-dim text-navy">
              {tags.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-outline italic">No tags found. Tags are created when you add them to products.</td>
                </tr>
              ) : (
                tags.map((tag) => (
                  <tr key={tag.id} className="hover:bg-ivory-dark/30 transition-colors">
                    <td className="p-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-medium bg-ivory-dark text-navy border border-surface-dim">
                        {tag.name}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase tracking-wide font-medium bg-[#f0f4ff] text-[#1e40af]">
                        {tag._count.products}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <DeleteTagButton id={tag.id} name={tag.name} productCount={tag._count.products} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {tags.length > 0 && (
        <p className="font-body text-outline text-[11px] italic">
          Tip: Deleting a tag will remove it from all products that use it. The products themselves will not be deleted.
        </p>
      )}
    </div>
  );
}
