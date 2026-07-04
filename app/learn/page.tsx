import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Hand,
  MessageCircle,
  ScanFace,
  Sparkles,
  SunMoon,
} from "lucide-react";
import { makePageMetadata, routeSeo } from "@/lib/seo";

export const metadata: Metadata = makePageMetadata(routeSeo.learn);

const searchClusters = [
  {
    title: "Birth Chart + Bazi",
    body: "People often start with a birth chart, natal chart, Bazi calculator, day pillar, five elements, or 2026 forecast. DestinyPixel turns those hard-to-read systems into an approachable inner map.",
    terms: ["birth chart", "natal chart", "Bazi calculator", "day pillar", "2026 forecast"],
  },
  {
    title: "Tarot + One Question",
    body: "When the need is immediate, users search for yes/no tarot, love tarot, career tarot, Liuyao oracle, or question divination. The Question Oracle keeps it to one issue and one next step.",
    terms: ["tarot reading", "yes no tarot", "career tarot", "love tarot", "六爻起卦"],
  },
  {
    title: "Palm + Face Reading",
    body: "Palmistry and face reading searches are usually practical: work rhythm, relationship style, pressure, resilience, and visible patterns. DestinyPixel keeps the tone direct rather than fatalistic.",
    terms: ["palm reading", "AI palmistry", "face reading", "physiognomy", "手相 面相"],
  },
];

const paths = [
  {
    href: "/",
    icon: SunMoon,
    title: "Start with your birth map",
    body: "A full report blends symbolic animals, five-element patterns, planetary rhythm, and annual timing.",
  },
  {
    href: "/palm",
    icon: Hand,
    title: "Read your palm",
    body: "Upload a hand photo and receive a grounded reflection on rhythm, work, relationships, and stress patterns.",
  },
  {
    href: "/face",
    icon: ScanFace,
    title: "Read your face",
    body: "Use expression and facial zones as symbolic cues for social energy, pressure response, and self-presentation.",
  },
  {
    href: "/oracle",
    icon: MessageCircle,
    title: "Ask one question",
    body: "A visual Tarot and hexagram-style spread for decisions, love, career, timing, and emotional clarity.",
  },
];

export default function LearnPage() {
  return (
    <main className="seo-learn-page">
      <section className="seo-learn-hero">
        <div className="seo-learn-ambient" aria-hidden="true" />
        <Link href="/" className="seo-learn-brand">
          <span aria-hidden="true" />
          DestinyPixel
        </Link>
        <div className="seo-learn-hero__copy">
          <p>
            <Sparkles size={15} aria-hidden="true" />
            Search guide for symbolic self-understanding
          </p>
          <h1>From astrology searches to a clearer inner map.</h1>
          <span>
            People search for birth charts, Bazi, Tarot, palm reading, face
            reading, yearly luck, compatibility, and life timing because they
            want one thing: a more useful way to understand the moment they are
            in. DestinyPixel translates those systems into simple psychological
            language and practical guidance.
          </span>
        </div>
      </section>

      <section className="seo-learn-section">
        <div className="seo-learn-grid">
          {searchClusters.map((cluster) => (
            <article key={cluster.title}>
              <h2>{cluster.title}</h2>
              <p>{cluster.body}</p>
              <div>
                {cluster.terms.map((term) => (
                  <em key={term}>{term}</em>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="seo-learn-section seo-learn-section--paths">
        <div className="seo-learn-heading">
          <p>Choose the mirror that matches your question.</p>
          <h2>Four public entry points</h2>
        </div>
        <div className="seo-path-grid">
          {paths.map((path) => {
            const Icon = path.icon;

            return (
              <Link href={path.href} key={path.href}>
                <span>
                  <Icon size={21} aria-hidden="true" />
                </span>
                <strong>{path.title}</strong>
                <p>{path.body}</p>
                <em>
                  Open
                  <ArrowRight size={14} aria-hidden="true" />
                </em>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="seo-learn-section seo-learn-faq">
        <h2>What DestinyPixel is and is not</h2>
        <p>
          It is a symbolic reflection product: useful for language, timing,
          self-observation, and choosing a calmer next step. It is not a
          substitute for medical, legal, financial, psychological, or emergency
          advice.
        </p>
        <p>
          The best readings are specific, concrete, and sometimes uncomfortable.
          DestinyPixel is being tuned away from vague horoscope language and
          toward direct patterns: what tends to work for you, where you waste
          energy, what to protect, and what to try next.
        </p>
      </section>
    </main>
  );
}

