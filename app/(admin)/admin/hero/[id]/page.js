import { notFound } from "next/navigation";
import { prisma } from "../../../../lib/prisma";
import HeroImageForm from "../components/HeroImageForm";

export default async function EditHeroImagePage({ params }) {
  const { id } = await params;
  const heroImage = await prisma.heroImage.findUnique({ where: { id } });

  if (!heroImage) notFound();

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="font-headline text-3xl md:text-4xl text-navy font-light italic mb-2">
          Edit Hero Slide
        </h1>
        <p className="font-body text-outline text-sm">
          Update the images, alt text, or visibility of this slide.
        </p>
      </div>
      <HeroImageForm heroImage={heroImage} />
    </div>
  );
}
