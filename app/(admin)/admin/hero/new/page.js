import HeroImageForm from "../components/HeroImageForm";

export default async function NewHeroImagePage() {
  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="font-headline text-3xl md:text-4xl text-navy font-light italic mb-2">
          Add Hero Slide
        </h1>
        <p className="font-body text-outline text-sm">
          Upload desktop and mobile images for a new homepage carousel slide.
        </p>
      </div>
      <HeroImageForm />
    </div>
  );
}
