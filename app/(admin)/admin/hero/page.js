import Link from "next/link";
import { prisma } from "../../../lib/prisma";
import DeleteHeroImageButton from "./components/DeleteHeroImageButton";

export default async function HeroImagesPage() {
  const heroImages = await prisma.heroImage.findMany({
    orderBy: { order: "asc" },
  });

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl md:text-4xl text-navy font-light italic mb-2">
            Hero Slides
          </h1>
          <p className="font-body text-outline text-sm">
            Manage the homepage carousel images. Add desktop and mobile versions for each slide.
          </p>
        </div>
        <Link
          href="/admin/hero/new"
          className="btn-primary flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          Add Slide
        </Link>
      </div>

      {heroImages.length === 0 ? (
        <div className="bg-white border border-surface-dim p-12 text-center space-y-4">
          <span className="material-symbols-outlined text-outline-var text-5xl">
            image
          </span>
          <h2 className="font-headline text-xl text-navy">No hero slides yet</h2>
          <p className="font-body text-outline text-sm max-w-sm mx-auto">
            Add slides to show a carousel on the homepage. Each slide needs a desktop and mobile image.
          </p>
          <Link href="/admin/hero/new" className="btn-primary inline-flex mt-2">
            Add First Slide
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-surface-dim overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-surface-dim bg-surface-low">
                  <th className="px-5 py-3 font-label text-[9px] tracking-[0.2em] uppercase text-outline font-semibold">
                    Preview
                  </th>
                  <th className="px-5 py-3 font-label text-[9px] tracking-[0.2em] uppercase text-outline font-semibold">
                    Alt Text
                  </th>
                  <th className="px-5 py-3 font-label text-[9px] tracking-[0.2em] uppercase text-outline font-semibold">
                    Order
                  </th>
                  <th className="px-5 py-3 font-label text-[9px] tracking-[0.2em] uppercase text-outline font-semibold">
                    Status
                  </th>
                  <th className="px-5 py-3 font-label text-[9px] tracking-[0.2em] uppercase text-outline font-semibold text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {heroImages.map((slide) => (
                  <tr
                    key={slide.id}
                    className="border-b border-surface-dim hover:bg-surface-low/50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex gap-3">
                        <div className="relative w-24 h-14 bg-surface-dim overflow-hidden rounded-sm">
                          <img
                            src={slide.desktop}
                            alt="Desktop"
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-0 left-0 bg-navy/70 text-white text-[8px] px-1 font-label">
                            D
                          </span>
                        </div>
                        <div className="relative w-8 h-14 bg-surface-dim overflow-hidden rounded-sm">
                          <img
                            src={slide.mobile}
                            alt="Mobile"
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-0 left-0 bg-navy/70 text-white text-[8px] px-1 font-label">
                            M
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-body text-navy text-sm">
                      {slide.alt}
                    </td>
                    <td className="px-5 py-4 font-body text-navy text-sm">
                      {slide.order}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-block w-2 h-2 ${slide.isActive ? "bg-green-600" : "bg-slate-400"}`}
                      />
                      <span className="font-body text-[11px] text-outline ml-2">
                        {slide.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/admin/hero/${slide.id}`}
                          className="text-outline hover:text-navy transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            edit
                          </span>
                        </Link>
                        <DeleteHeroImageButton id={slide.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
