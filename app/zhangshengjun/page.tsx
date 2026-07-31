import ZhangShengJunExperience from "@/components/zhangshengjun-experience";
import { createSiteMetadata } from "@/lib/site-metadata";

export const metadata = createSiteMetadata("zh-cn");

export default function ZhangShengJunMirrorPage() {
  return <ZhangShengJunExperience locale="zh-cn" />;
}
