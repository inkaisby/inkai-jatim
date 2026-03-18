import { redirect } from "next/navigation";

export default async function BeritaLegacyDetailRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/berita/${slug}`);
}

