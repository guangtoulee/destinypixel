import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { normalizeReportLocale } from "@/lib/report-i18n";
import { validRecordId } from "@/lib/celestial/records";
import { SavedCelestialRecord } from "@/components/celestial/saved-record";
import "@/components/celestial/celestial.css";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title:{absolute:"Your saved reading | DestinyPixel"}, robots:{index:false,follow:false}, referrer:"no-referrer" };
export default async function SavedReadingPage({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{locale?:string}>}) {
  const {id}=await params;if(!validRecordId(id))notFound();
  return <SavedCelestialRecord id={id} locale={normalizeReportLocale((await searchParams).locale||"en")}/>;
}
