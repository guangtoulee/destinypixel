import Image from "next/image";
import { LoaderCircle, Sparkles } from "lucide-react";

export default function ReportLoading() {
  return (
    <main className="report-shell">
      <div className="report-backdrop" aria-hidden="true">
        <Image src="/destinypixel-deep-space.png" alt="" fill priority />
        <span />
      </div>

      <section className="report-loading page-container" aria-live="polite">
        <div className="report-loading__visual" />
        <div className="report-loading__panel">
          <p className="eyebrow">
            <Sparkles size={13} aria-hidden="true" />
            Inner Map Insight
          </p>
          <h1>Reading your inner map</h1>
          <p>
            We are aligning your birth-time energy, animal portrait, planetary
            rhythm, and seasonal timing into one coherent guidance experience.
          </p>
          <span>
            <LoaderCircle className="loading-icon" size={16} aria-hidden="true" />
            Reading the pattern
          </span>
        </div>
      </section>
    </main>
  );
}
