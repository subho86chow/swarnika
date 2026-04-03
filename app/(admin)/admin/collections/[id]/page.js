import { prisma } from "../../../../lib/prisma";
import CollectionForm from "../../components/CollectionForm";
import { notFound } from "next/navigation";

export default async function EditCollectionPage({ params }) {
  const { id } = params;

  const collection = await prisma.collection.findUnique({
    where: { id },
  });

  if (!collection) {
    notFound();
  }

  return <CollectionForm collection={collection} />;
}
