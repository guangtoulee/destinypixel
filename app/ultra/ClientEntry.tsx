"use client";

import dynamic from "next/dynamic";
import { SpatialLoadingIntro } from "@/components/spatial-loading-intro";

const UltraExperience = dynamic(() => import("./components/UltraExperience"), {
  ssr: false,
  loading: () => <SpatialLoadingIntro variant="ultra" />,
});

export function ClientEntry() {
  return <UltraExperience />;
}
