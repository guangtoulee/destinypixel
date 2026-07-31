import ZhangShengJunExperience from "@/components/zhangshengjun-experience";
import { createSiteMetadata } from "@/lib/site-metadata";

export const metadata = createSiteMetadata("zh-hant");

export default function ZhangShengJunTraditionalMirrorPage() {
  return <ZhangShengJunExperience locale="zh-hant" />;
}
