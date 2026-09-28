"use client";
import { Sparkles } from "lucide-react";
import type { CelestialReading } from "@/lib/celestial/ai";
import type { CelestialCopy } from "@/lib/celestial/copy";
export function ReadingPanel({
  copy,
  reading,
  busy,
  status,
  disabled,
  onRead,
}: {
  copy: CelestialCopy;
  reading: CelestialReading | null;
  busy: boolean;
  status: string;
  disabled?: boolean;
  onRead: () => void;
}) {
  return (
    <section className="cel-reading" aria-busy={busy}>
      <div className="cel-reading-head">
        <span className="cel-orb">
          <Sparkles size={25} />
        </span>
        <div>
          <p className="cel-kicker">DEEPSEEK · AI</p>
          <h2>{copy.ai}</h2>
        </div>
        <button
          type="button"
          className="cel-button"
          disabled={busy || disabled || Boolean(reading)}
          onClick={onRead}
        >
          {busy
            ? copy.aiBusy
            : reading
              ? copy.aiReady
              : status
                ? copy.retry
                : copy.ai}{" "}
          <Sparkles size={16} />
        </button>
      </div>
      <p className="cel-muted cel-small">{copy.aiNote}</p>
      <div aria-live="polite">
        {busy && (
          <div className="cel-skeleton">
            <i />
            <i />
            <i />
          </div>
        )}
        {status && (
          <p className="cel-notice">
            {status === "limited" ? copy.aiLimited : copy.aiUnavailable}
          </p>
        )}
        {reading && (
          <div className="cel-reading-content">
            <p className="cel-reading-summary">{reading.summary}</p>
            <div className="cel-reading-grid">
              {reading.sections.map((s, i) => (
                <article key={i}>
                  <span className="cel-kicker">0{i + 1}</span>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </article>
              ))}
            </div>
            <blockquote>{reading.reflection}</blockquote>
          </div>
        )}
      </div>
      <p className="cel-muted cel-small">{copy.reflection}</p>
    </section>
  );
}
