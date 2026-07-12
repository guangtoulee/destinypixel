import type { Metadata } from "next";
import PromptExperience from "@/components/prompt-experience";
import { absoluteUrl, makePageMetadata, routeSeo, siteName } from "@/lib/seo";
import { promptCategoryProfiles, promptSnapshotItems } from "@/lib/prompt-library";

export const maxDuration = 60;

export const metadata: Metadata = {
  ...makePageMetadata(routeSeo.prompt),
  alternates: { canonical: routeSeo.prompt.path },
};

export default function PromptPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "DestinyPixel Prompt 雷达",
        url: absoluteUrl("/prompt"),
        applicationCategory: "DesignApplication",
        operatingSystem: "Web",
        inLanguage: "zh-CN",
        description: routeSeo.prompt.description,
        offers: { "@type": "Offer", price: "0", priceCurrency: "CNY" },
        featureList: ["中文 Prompt 智能扩写", "图片反推 Prompt", "AI 图片与视频案例索引", "完整 Prompt 一键复制"],
      },
      {
        "@type": "CollectionPage",
        name: "AI 图片与视频 Prompt 案例库",
        url: absoluteUrl("/prompt"),
        isPartOf: { "@type": "WebSite", name: siteName, url: absoluteUrl("/") },
        about: promptCategoryProfiles.map((profile) => profile.name),
        numberOfItems: promptSnapshotItems.length,
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
      <PromptExperience />
    </>
  );
}
