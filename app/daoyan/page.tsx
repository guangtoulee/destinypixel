import type { Metadata } from "next";
import DaoyanExperience from "@/components/daoyan-experience";
import { makePageMetadata, routeSeo } from "@/lib/seo";

export const maxDuration = 180;

export const metadata: Metadata = makePageMetadata(routeSeo.daoyan);

export default function DaoyanPage() {
  return <DaoyanExperience />;
}
