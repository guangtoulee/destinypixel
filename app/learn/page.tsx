import { destinySupportHref } from "@/lib/support-contact";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Check, Compass } from "lucide-react";
import { makePageMetadata, routeSeo } from "@/lib/seo";
import styles from "./learn.module.css";

export const metadata: Metadata = makePageMetadata(routeSeo.learn);

const guides = [
  {
    id: "birth-map", number: "01", title: "Start with your birth details", tool: "Birth map", href: "/#report",
    intro: "Use the birth map for a broad symbolic reading. Choose Birth Totem when you would rather explore those patterns visually.",
    prepare: "For the birth map, have a name, birth date, local birth time and birth city ready. Both tools also ask for a gender option. Birth Totem makes the name optional and requires a city from its list.",
    steps: ["Check the date, time and city before generating. A guessed birth time changes the assumptions behind the result.", "Read the report as a set of themes to consider. Compare each theme with concrete examples from your own life.", "For a visual version, open Birth Totem with the same birth details. Select its layers to inspect the pillars, elements and explanations. Export the design as PNG or SVG if you want to keep it."],
    result: "The birth map produces a personal reading. Birth Totem produces an interactive geometric design derived from your input; it is an original visualization system.",
    limit: "Birth charts and totems are symbolic tools. They do not measure ability or establish what will happen. If you do not know your birth time, begin with a question-based tool instead of treating a guessed chart as precise.",
    related: { href: "/tuteng", label: "Explore Birth Totem", key: "tuteng" },
  },
  {
    id: "oracle", number: "02", title: "Bring one question into focus", tool: "Question Oracle", href: "/oracle",
    intro: "Choose this when you have one situation in mind and want a prompt for reflection without preparing a full birth chart.",
    prepare: "One specific question, the time of the question and its topic. Birth date and birth time are optional in this form.",
    steps: ["Describe the situation and the choice you are considering. For example: “What should I clarify before accepting this new role?”", "Check the question time, select the relevant topic and generate the reading.", "Read the Tarot and hexagram-inspired interpretation, then write down one practical question to ask or fact to check."],
    result: "A visual symbolic spread and a written interpretation focused on the submitted question.",
    limit: "The symbols are not evidence about another person or a forecast you can rely on. Use actual information when making a consequential decision.",
  },
  {
    id: "palm", number: "03", title: "Explore palm and face symbols", tool: "Palm studio", href: "/palm",
    intro: "These studios use the details you select. An optional photo stays in the page as a reference to help you describe what you see.",
    prepare: "For palm reading, choose the hand side, dominant hand and line details. For face reading, select the visible details and expression. A photo is optional.",
    steps: ["If you add a photo, use a clear palm image or a front-facing portrait in even light. Keep the relevant area visible.", "Review the selected descriptions instead of submitting the defaults unchanged. Add notes about what you want to reflect on.", "Generate the text reading. Consider which observations resonate and which do not; the text does not validate them."],
    result: "A written symbolic interpretation of your selected details and notes. The photo is a local preview; this reading does not send it to the model for visual analysis.",
    limit: "Appearance does not establish a person's character, intelligence, health or future. These readings are not diagnoses or validated personality assessments. Only upload photos you have permission to use.",
    related: { href: "/face", label: "Open Face studio", key: "face" },
  },
  {
    id: "sticks", number: "04", title: "Draw a stick, or look one up", tool: "Temple sticks", href: "/sticks",
    intro: "Draw within the page, or enter a number from a stick you already have.",
    prepare: "Choose the tradition that matches your stick. If you already drew one, have its number ready. You may also enter a specific question.",
    steps: ["Select a tradition before drawing or searching. A number belongs to a particular collection; the same number in another collection can have different text.", "Draw a stick, or enter your existing number in the lookup field and search.", "Read the displayed stick text. For a question-specific interpretation, enter your question and use the separate AI interpretation action."],
    result: "A stick number and text, with an optional AI interpretation of your question.",
    limit: "Printed temple editions can differ. Check against the edition you received if the wording differs. A symbolic draw cannot confirm outcomes or replace practical judgment.",
  },
  {
    id: "atelier", number: "05", title: "Design a five-element bracelet", tool: "Crystal bracelet atelier", href: "/atelier",
    intro: "Translate a five-element color preference into a bracelet you arrange bead by bead. You can explore the workshop without generating a birth report first.",
    prepare: "Choose an element focus or browse all stones. Decide on a bead size and wrist style, then select one of the suggested bead counts.",
    steps: ["Set the bead size, wrist style and target count before arranging the bracelet. The available counts change with the size and style.", "Choose gemstones from the library. Each selection adds one bead to the preview; select a placed bead to remove it. When the bracelet is full, remove a bead before adding another.", "Review the colors, selected bead sequence and symbolic balance summary. Use Download image to keep a visual reference for your design."],
    result: "An on-screen bead arrangement, a symbolic color analysis and a downloadable PNG design image.",
    limit: "The workshop produces a design reference. Gemstone colors and five-element associations are aesthetic and symbolic; they do not establish health effects. Confirm actual bead dimensions and wrist fit with the maker if you use the design for a physical bracelet.",
  },
];

export default function LearnPage() {
  return (
    <main className={styles.page} lang="en">
      <header className={styles.header}>
        <Link className={styles.brand} href="/"><span aria-hidden="true" />DestinyPixel</Link>
        <nav aria-label="Main navigation"><Link href="/">Home</Link><Link href="/tools">All tools</Link><Link href="/learn" aria-current="page">Getting started</Link><Link href="/journal">Journal</Link></nav>
      </header>
      <section className={styles.hero}>
        <p className={styles.eyebrow}><BookOpen size={15} aria-hidden="true" />The beginner guide</p>
        <h1>Begin with your birth map, a question or a bracelet.</h1>
        <p className={styles.intro}>Explore DestinyPixel’s birth charts, symbolic readings and five-element bracelet workshop. Learn what to prepare and how to use each result for personal reflection.</p>
        <Link className={styles.directoryLink} href="/tools">Browse all tools<ArrowRight size={16} aria-hidden="true" /></Link>
      </section>
      <div className={styles.layout}>
        <aside className={styles.contents}>
          <p>Choose your task</p>
          <nav aria-label="Guide contents">{guides.map((guide) => <a href={`#${guide.id}`} key={guide.id}><span>{guide.number}</span>{guide.tool}</a>)}</nav>
          <div className={styles.sideNote}><Compass size={20} aria-hidden="true" /><p>Unsure where to begin? The <Link href="/tools">tool directory</Link> compares the input and result for each tool.</p></div>
        </aside>
        <div>
          {guides.map((guide) => (
            <section className={styles.guide} id={guide.id} key={guide.id} aria-labelledby={`${guide.id}-title`}>
              <p className={styles.sectionNumber}>Guide {guide.number}</p>
              <h2 id={`${guide.id}-title`}>{guide.title}</h2>
              <p className={styles.guideIntro}>{guide.intro}</p>
              <div className={styles.prepare}><Check size={17} aria-hidden="true" /><div><h3>What to prepare</h3><p>{guide.prepare}</p></div></div>
              <h3 className={styles.stepsHeading}>How to use it</h3>
              <ol className={styles.steps}>{guide.steps.map((step) => <li key={step}>{step}</li>)}</ol>
              <dl className={styles.outcome}><div><dt>What you get</dt><dd>{guide.result}</dd></div><div><dt>Keep in mind</dt><dd>{guide.limit}</dd></div></dl>
              <div className={styles.toolLinks}>
                <Link href={guide.href} data-analytics-tool={guide.id} data-analytics-location="learn">Open {guide.tool}<ArrowRight size={15} aria-hidden="true" /></Link>
                {guide.related && <Link href={guide.related.href} data-analytics-tool={guide.related.key} data-analytics-location="learn">{guide.related.label}<ArrowRight size={15} aria-hidden="true" /></Link>}
              </div>
            </section>
          ))}
          <section className={styles.help} aria-labelledby="need-help-title">
            <h2 id="need-help-title">If a result does not appear</h2>
            <p>Check that the required fields are filled and look for an error near the form. AI-powered interpretations need a working online service. If generation fails, keep a copy of your input and retry later; an error message is not a completed result.</p>
            <p>For a page problem, <a href={destinySupportHref}>contact DestinyPixel</a> with the tool name and the error you saw. Avoid sending private birth details or photographs unless they are needed to explain the issue.</p>
          </section>
        </div>
      </div>
      <footer className={styles.footer}><strong>DestinyPixel</strong><nav aria-label="Footer navigation"><Link href="/">Home</Link><Link href="/tools">Tool directory</Link><Link href="/journal">Journal</Link><a href={destinySupportHref}>Contact</a></nav></footer>
    </main>
  );
}
