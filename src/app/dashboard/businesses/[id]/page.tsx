import { redirect } from "next/navigation";

// Szczegóły organizacji są na liście „Moje organizacje” (wybór radio). Stary adres przekierowuje tam.
export default async function BusinessPage({ params }: PageProps<"/dashboard/businesses/[id]">) {
  const { id } = await params;
  redirect(`/dashboard/businesses?org=${encodeURIComponent(id)}`);
}
