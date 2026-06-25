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
            DeepSeek Insight
          </p>
          <h1>Generating your fusion report</h1>
          <p>
            We are combining true solar time, Four Pillars, ten gods, planetary
            placements, and major aspects into one coherent reading.
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
