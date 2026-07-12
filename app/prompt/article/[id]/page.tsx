import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PromptDetailPage from "@/components/prompt-detail-page";
import {
  buildPromptEditorial,
  getIndexablePromptItems,
  getPromptItem,
  getPromptSeoTitle,
  isIndexablePromptItem,
  isPromptArticle,
  promptItemHref,
} from "@/lib/prompt-library";
import { absoluteUrl, siteName } from "@/lib/seo";

type PageProps = { params: Promise<{ id: string }> };

export const revalidate = 21600;
export const dynamicParams = true;

export function generateStaticParams() {
  return getIndexablePromptItems()
    .filter(isPromptArticle)
    .map((item) => ({ id: item.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const item = getPromptItem((await params).id);
  if (!item || !isPromptArticle(item)) return {};
  const title = getPromptSeoTitle(item);
  const description = buildPromptEditorial(item).summary.slice(0, 155);
  const path = promptItemHref(item);
  const index = isIndexablePromptItem(item);

  return {
    title,
    description,
    keywords: [...item.tags, ...item.modelHints, item.category, "AI 视觉趋势", "Prompt 工作流"],
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      url: path,
      title,
      description,
      siteName,
      publishedTime: item.createdAt,
      modifiedTime: item.importedAt,
      authors: [item.authorName || item.authorHandle || siteName],
      images: ["/opengraph-image"],
    },
    twitter: { card: "summary_large_image", title, description, images: ["/opengraph-image"] },
    robots: { index, follow: true, googleBot: { index, follow: true, "max-snippet": -1 } },
  };
}

export default async function PromptArticlePage({ params }: PageProps) {
  const item = getPromptItem((await params).id);
  if (!item || !isPromptArticle(item)) notFound();
  const path = promptItemHref(item);
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: getPromptSeoTitle(item),
    description: buildPromptEditorial(item).summary,
    datePublished: item.createdAt,
    dateModified: item.importedAt,
    author: { "@type": "Person", name: item.authorName || item.authorHandle || "公开社区创作者", url: item.sourceUrl },
    publisher: { "@type": "Organization", name: siteName, url: absoluteUrl("/") },
    mainEntityOfPage: absoluteUrl(path),
    isBasedOn: item.sourceUrl,
    inLanguage: item.language === "zh" ? "zh-CN" : "en",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
      <PromptDetailPage item={item} />
    </>
  );
}
