"use client";

import dynamic from "next/dynamic";
import { SpatialLoadingIntro } from "@/components/spatial-loading-intro";

const XingpanExperience = dynamic(() => import("./components/XingpanExperience"), {
  ssr: false,
  loading: () => <SpatialLoadingIntro variant="xingpan" />,
});

export function ClientEntry() {
  return <XingpanExperience />;
}
