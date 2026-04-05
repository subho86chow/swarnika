import { redirect } from "next/navigation";

export default function CollectionsRedirect({ searchParams }) {
  // Preserve any query params when redirecting
  const params = new URLSearchParams();
  
  // Convert old ?collection=X to ?category=X
  if (searchParams?.collection) {
    params.set("category", searchParams.collection);
  }
  if (searchParams?.tag) {
    params.set("tag", searchParams.tag);
  }

  const query = params.toString();
  redirect(`/categories${query ? `?${query}` : ""}`);
}
