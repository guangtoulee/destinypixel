"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Orbit, Sparkles } from "lucide-react";
import { cities } from "@/lib/geo/cities";
import {
  planetSymbols,
  signSymbols,
  type NatalChart,
} from "@/lib/celestial/astrology";
import type { CelestialCopy } from "@/lib/celestial/copy";
import type { CelestialReading } from "@/lib/celestial/ai";
import type { ReportLocale } from "@/lib/report-i18n";
import { trackToolEvent } from "@/lib/analytics";
import { ChartWheel } from "./chart-wheel";
import { ReadingPanel } from "./reading-panel";
export default function AstrologyExperience({
  locale,
  copy: c,
  demo,
}: {
  locale: ReportLocale;
  copy: CelestialCopy;
  demo: NatalChart;
}) {
  const [chart, setChart] = useState(demo),
    [isDemo, setDemo] = useState(true),
    [city, setCity] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [selected, setSelected] = useState("Sun"),
    [tab, setTab] = useState("planets"),
    [house, setHouse] = useState(0),
    [aspect, setAspect] = useState(0),
    [reading, setReading] = useState<CelestialReading | null>(null),
    [aiBusy, setAiBusy] = useState(false),
    [aiStatus, setAiStatus] = useState("");
  const input = useRef<Record<string, unknown> | null>(null),
    controller = useRef<AbortController | null>(null),
    formController = useRef<AbortController | null>(null),
    revision = useRef(0),
    results = useRef<HTMLElement>(null);
  useEffect(
    () => () => {
      controller.current?.abort();
      formController.current?.abort();
    },
    [],
  );
  const position = (n: number) =>
    `${c.signs[Math.floor(n / 30)]} ${(n % 30).toFixed(2)}°`;
  async function calculate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const payload = {
      birthDate: data.get("date"),
      birthTime: data.get("time"),
      cityId: city,
      latitude: Number(data.get("latitude")),
      longitude: Number(data.get("longitude")),
      timezone: data.get("timezone"),
      locale,
    };
    controller.current?.abort();
    formController.current?.abort();
    const abort = new AbortController();
    formController.current = abort;
    revision.current++;
    setBusy(true);
    setAiBusy(false);
    setError("");
    setReading(null);
    setAiStatus("");
    trackToolEvent("tool_start", "astrology");
    try {
      const response = await fetch("/api/astrology", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.any([abort.signal, AbortSignal.timeout(25000)]),
      });
      const body = await response.json();
      if (!response.ok) {
        throw new Error(String(body.code || "INVALID_INPUT"));
      }
      setChart(body.chart);
      setDemo(false);
      input.current = payload;
      setSelected("Sun");
      setAspect(0);
      trackToolEvent("tool_success", "astrology");
      results.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (e) {
      if (abort.signal.aborted) return;
      const code = e instanceof Error ? e.message : "";
      setError(
        /ambiguous|nonexistent/i.test(code) ? c.astroFaqs[2].a : c.error,
      );
      trackToolEvent("tool_error", "astrology");
    } finally {
      if (!abort.signal.aborted) setBusy(false);
    }
  }
  async function interpret() {
    if (!input.current) return;
    controller.current?.abort();
    const abort = new AbortController();
    controller.current = abort;
    const rev = revision.current;
    setAiBusy(true);
    setAiStatus("");
    try {
      const r = await fetch("/api/astrology", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...input.current, mode: "interpret" }),
        signal: AbortSignal.any([abort.signal, AbortSignal.timeout(50000)]),
      });
      const b = await r.json();
      if (rev !== revision.current) return;
      if (b.reading) {
        setReading(b.reading);
      } else {
        setAiStatus(b.status || "unavailable");
        trackToolEvent("tool_fallback", "astrology");
      }
    } catch {
      if (!abort.signal.aborted) setAiStatus("unavailable");
    } finally {
      if (rev === revision.current) setAiBusy(false);
    }
  }
  const p = chart.placements.find((p) => p.body === selected)!,
    pi = chart.placements.indexOf(p),
    a = chart.aspects[aspect];
  const planetName = (body: string) =>
    c.planetNames[chart.placements.findIndex((p) => p.body === body)];
  return (
    <>
      <div className="cel-astro-layout" id="create">
        <form
          className="cel-form"
          data-analytics-form="astrology"
          onSubmit={calculate}
        >
          <div className="cel-form-icon">
            <Orbit size={26} />
          </div>
          <h2>{c.formTitle}</h2>
          <div className="cel-field-pair">
            <label>
              {c.date}
              <input
                type="date"
                name="date"
                required
                min="1800-01-01"
                max="2100-12-31"
              />
            </label>
            <label>
              {c.time}
              <input type="time" name="time" required />
            </label>
          </div>
          <label>
            {c.city}
            <select
              value={city}
              required
              onChange={(e) => setCity(e.target.value)}
            >
              <option value="">{c.chooseCity}</option>
              {cities.map((c) => (
                <option value={c.id} key={c.id}>
                  {locale.startsWith("zh") ? c.aliases[0] : c.label}
                </option>
              ))}
              <option value="custom">{c.custom}</option>
            </select>
          </label>
          {city === "custom" && (
            <div className="cel-custom-location">
              <div className="cel-field-pair">
                <label>
                  {c.latitude}
                  <input
                    name="latitude"
                    type="number"
                    step="any"
                    min="-89.9"
                    max="89.9"
                    required
                  />
                </label>
                <label>
                  {c.longitude}
                  <input
                    name="longitude"
                    type="number"
                    step="any"
                    min="-180"
                    max="180"
                    required
                  />
                </label>
              </div>
              <label>
                {c.timezone}
                <input
                  name="timezone"
                  placeholder="Europe/London"
                  maxLength={80}
                  required
                />
              </label>
              <p className="cel-small cel-muted">{c.timezoneHelp}</p>
            </div>
          )}
          <p className="cel-small cel-muted">{c.exactTime}</p>
          <button className="cel-button" disabled={busy}>
            {busy ? c.loading : c.calculate}
            <ArrowUpRight size={18} />
          </button>
          {error && (
            <p role="alert" className="cel-error">
              {error}
            </p>
          )}
          <p className="cel-small cel-muted">{c.privacy}</p>
        </form>
        <section ref={results} className="cel-chart-stage" aria-busy={busy}>
          <div className="cel-stage-label">
            <span className="cel-status-dot" />
            {isDemo ? c.example : c.result}
          </div>
          <ChartWheel
            chart={chart}
            copy={c}
            selected={selected}
            onSelect={(body) => {
              setSelected(body);
              setTab("planets");
            }}
            selectedAspect={tab === "aspects" ? aspect : undefined}
          />
          <div className="cel-big-three">
            {[
              [c.sun, chart.placements[0].longitude, "☉"],
              [c.moon, chart.placements[1].longitude, "☽"],
              [c.rising, chart.ascendant, "↗"],
            ].map(([label, lon, symbol]) => (
              <div key={label}>
                <span>
                  {symbol} {label}
                </span>
                <strong>{c.signs[Math.floor(Number(lon) / 30)]}</strong>
                <small>{(Number(lon) % 30).toFixed(2)}°</small>
              </div>
            ))}
          </div>
        </section>
      </div>
      <section className="cel-chart-detail">
        <div className="cel-tabs" role="tablist" aria-label={c.astrology}>
          {["planets", "houses", "aspects"].map((t) => (
            <button
              role="tab"
              id={`tab-${t}`}
              aria-controls="chart-panel"
              aria-selected={tab === t}
              key={t}
              onClick={() => setTab(t)}
            >
              {c[t as "planets"]}
            </button>
          ))}
        </div>
        <div
          id="chart-panel"
          role="tabpanel"
          aria-labelledby={`tab-${tab}`}
          className="cel-detail-layout"
        >
          <div className="cel-detail-list">
            {tab === "planets" &&
              chart.placements.map((p, i) => (
                <button
                  key={p.body}
                  onClick={() => setSelected(p.body)}
                  className={p.body === selected ? "is-active" : ""}
                >
                  <span className="cel-glyph">{planetSymbols[p.body]}</span>
                  <strong>{c.planetNames[i]}</strong>
                  <span>
                    {signSymbols[Math.floor(p.longitude / 30)]}{" "}
                    {position(p.longitude)}
                  </span>
                  <small>
                    {c.house} {p.house}
                    {p.retrograde ? " · R" : ""}
                  </small>
                </button>
              ))}
            {tab === "houses" &&
              chart.houses.map((lon, i) => (
                <button
                  key={i}
                  onClick={() => setHouse(i)}
                  className={i === house ? "is-active" : ""}
                >
                  <span className="cel-glyph">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <strong>{c.houseNames[i]}</strong>
                  <span>{c.signs[Math.floor(lon / 30)]}</span>
                </button>
              ))}
            {tab === "aspects" &&
              (chart.aspects.length ? (
                chart.aspects.map((a, i) => (
                  <button
                    key={i}
                    onClick={() => setAspect(i)}
                    className={i === aspect ? "is-active" : ""}
                  >
                    <span className="cel-glyph">
                      {planetSymbols[a.bodies[0]]}
                    </span>
                    <strong>
                      {planetName(a.bodies[0])} · {planetName(a.bodies[1])}
                    </strong>
                    <span>{c.aspectNames[a.type]}</span>
                    <small>{a.orb.toFixed(2)}°</small>
                  </button>
                ))
              ) : (
                <p>{c.noAspects}</p>
              ))}
          </div>
          <aside className="cel-detail-story">
            {tab === "planets" && (
              <>
                <span className="cel-story-symbol">
                  {planetSymbols[p.body]}
                </span>
                <p className="cel-kicker">
                  {c.planetNames[pi]} · {c.house} {p.house}
                </p>
                <h2>{c.signs[Math.floor(p.longitude / 30)]}</h2>
                <p>{c.planetRoles[pi]}</p>
                <p>{c.signStyles[Math.floor(p.longitude / 30)]}</p>
                <div className="cel-story-note">
                  {c.houseNames[p.house - 1]}
                  <br />
                  {p.retrograde ? c.retrograde : c.direct} ·{" "}
                  {p.degreeInSign.toFixed(2)}°
                </div>
              </>
            )}
            {tab === "houses" && (
              <>
                <span className="cel-story-symbol">
                  {signSymbols[Math.floor(chart.houses[house] / 30)]}
                </span>
                <p className="cel-kicker">
                  {c.house} {house + 1}
                </p>
                <h2>{c.houseNames[house]}</h2>
                <p>{c.signs[Math.floor(chart.houses[house] / 30)]} · 0°</p>
                <p>{c.houseHint}</p>
                <div className="cel-story-note">
                  {chart.placements
                    .filter((p) => p.house === house + 1)
                    .map((p) => planetName(p.body))
                    .join(" · ") || "—"}
                </div>
              </>
            )}
            {tab === "aspects" && a && (
              <>
                <span className="cel-story-symbol">
                  {planetSymbols[a.bodies[0]]} {planetSymbols[a.bodies[1]]}
                </span>
                <p className="cel-kicker">
                  {c.orb} · {a.orb.toFixed(2)}°
                </p>
                <h2>{c.aspectNames[a.type]}</h2>
                <p>
                  {planetName(a.bodies[0])} · {planetName(a.bodies[1])}
                </p>
                <p>{c.aspectMeanings[a.type]}</p>
                <div className="cel-story-note">{c.aspectHint}</div>
              </>
            )}
          </aside>
        </div>
      </section>
      <section className="cel-elements">
        <div>
          <p className="cel-kicker">FIRE · EARTH · AIR · WATER</p>
          <h2>{c.elementTitle}</h2>
        </div>
        <div className="cel-element-bars">
          {chart.elements.map((v, i) => (
            <div key={i}>
              <span>{c.elements[i]}</span>
              <i
                style={
                  {
                    "--element-color": [
                      "#c77865",
                      "#769981",
                      "#8c84b6",
                      "#659fae",
                    ][i],
                  } as React.CSSProperties
                }
              >
                <b style={{ width: `${v * 10}%` }} />
              </i>
              <strong>{v}/10</strong>
            </div>
          ))}
        </div>
        <div className="cel-mc">
          <Sparkles size={20} />
          <span>
            {c.mc}
            <strong>{position(chart.midheaven)}</strong>
          </span>
        </div>
      </section>
      {!isDemo && (
        <ReadingPanel
          copy={c}
          reading={reading}
          busy={aiBusy}
          status={aiStatus}
          onRead={interpret}
          disabled={busy}
        />
      )}
    </>
  );
}
