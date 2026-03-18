import { redirect } from "next/navigation";

export default async function DojoLegacyDetailRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/dojo/${slug}`);
}

