import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SeoGuideArticle } from "@/components/seo-guide-article";
import { absoluteUrl } from "@/lib/seo";
import { getSeoGuide, seoGuidesFor, seoGuidePath } from "@/lib/seo-guides";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return seoGuidesFor("learn").map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const guide = getSeoGuide("learn", (await params).slug);
  if (!guide) return { robots: { index: false, follow: false } };
  const path = seoGuidePath(guide);
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: absoluteUrl(path) },
    openGraph: {
      title: guide.title,
      description: guide.description,
      url: absoluteUrl(path),
      type: "article",
    },
  };
}

export default async function Page({ params }: PageProps) {
  const guide = getSeoGuide("learn", (await params).slug);
  if (!guide) notFound();
  return <SeoGuideArticle guide={guide} />;
}
