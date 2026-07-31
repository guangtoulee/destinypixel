import { notFound } from "next/navigation";
import ContentPage from "@/components/content-page";
import { contentSlugs, getContentPage, type ContentSlug } from "@/lib/platform-content";
import { createContentMetadata } from "@/lib/site-metadata";

export const dynamicParams = false;

export function generateStaticParams() {
  return contentSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!contentSlugs.includes(slug as ContentSlug)) return {};
  return createContentMetadata(getContentPage("zh-cn", slug as ContentSlug));
}

export default async function SimplifiedMirrorContentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!contentSlugs.includes(slug as ContentSlug)) notFound();
  return <ContentPage page={getContentPage("zh-cn", slug as ContentSlug)} />;
}
