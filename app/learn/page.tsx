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
    id: "prompt", number: "05", title: "Move from an idea to production text", tool: "Prompt Radar", href: "/prompt",
    intro: "The creative tools have Chinese interfaces. Begin with Prompt Radar for examples; choose the script or director workspace for narrative development.",
    prepare: "For a prompt, bring an idea or reference image. For a story, prepare the premise or source text, intended audience, episode count, duration and format.",
    steps: ["In Prompt Radar, find a relevant example and inspect its prompt. Adjust subject, action and composition for your project before copying it.", "In the script studio, paste or import source material, review the extracted text and set the episode requirements before generating.", "In the director workspace, build the project, review and lock asset descriptions, then develop individual episodes. Inspect continuity and dialogue before exporting the production text."],
    result: "Prompts, episode material, scene descriptions and production plans that you can copy or export for further work.",
    limit: "These outputs are drafts. Check facts, source permissions and story continuity. A script or video prompt is not a rendered video; run and review it in your chosen generation tool.",
    related: { href: "/juben", label: "Open the script studio", key: "juben" },
    extra: { href: "/daoyan", label: "Open the director workspace", key: "daoyan" },
  },
  {
    id: "english", number: "06", title: "Choose a small English practice session", tool: "Bright Steps English", href: "/english",
    intro: "Bright Steps offers an initial assessment and textbook practice. Recall Base focuses on middle-school vocabulary. Both use Chinese instructions.",
    prepare: "Choose a textbook level or begin the initial assessment. For listening practice, turn on sound and select an available English voice if needed.",
    steps: ["Begin with a level you can attempt independently. Use the starting assessment to find a practice entry point, or choose your current textbook and unit.", "Try to recall the word or spelling before revealing the answer. Read the correction and try again when you miss it.", "Return to review previously practiced words. In Bright Steps, use the learning settings to export your learning record before moving to another browser."],
    result: "Practice feedback, vocabulary review and a learning record. Bright Steps saves its practice record in the current browser and offers export and import.",
    limit: "A successful same-session answer is not proof of long-term recall. Browser records can be lost if site data is cleared, and the starting assessment is not a formal proficiency diagnosis.",
    related: { href: "/danci", label: "Open Recall Base", key: "danci" },
  },
];

export default function LearnPage() {
  return (
    <main className={styles.page} lang="en">
      <header className={styles.header}>
        <Link className={styles.brand} href="/"><span aria-hidden="true" />DestinyPixel</Link>
        <nav aria-label="Main navigation"><Link href="/">Home</Link><Link href="/tools">All tools</Link><Link href="/learn" aria-current="page">Getting started</Link></nav>
      </header>
      <section className={styles.hero}>
        <p className={styles.eyebrow}><BookOpen size={15} aria-hidden="true" />The beginner guide</p>
        <h1>A useful first visit starts with one thing.</h1>
        <p className={styles.intro}>Choose a task, prepare the right input and know what to expect from the result. Here is how to get started with DestinyPixel.</p>
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
                {guide.extra && <Link href={guide.extra.href} data-analytics-tool={guide.extra.key} data-analytics-location="learn">{guide.extra.label}<ArrowRight size={15} aria-hidden="true" /></Link>}
              </div>
            </section>
          ))}
          <section className={styles.help} aria-labelledby="need-help-title">
            <h2 id="need-help-title">If a result does not appear</h2>
            <p>Check that the required fields are filled and look for an error near the form. AI-powered text and image analysis need a working online service. If generation fails, keep a copy of your input and retry later; an error message is not a completed result.</p>
            <p>For a page problem, <a href="mailto:anyulee@foxmail.com">contact DestinyPixel</a> with the tool name and the error you saw. Avoid sending private birth details, photographs or source material unless they are needed to explain the issue.</p>
          </section>
        </div>
      </div>
      <footer className={styles.footer}><strong>DestinyPixel</strong><nav aria-label="Footer navigation"><Link href="/">Home</Link><Link href="/tools">Tool directory</Link><a href="mailto:anyulee@foxmail.com">Contact</a></nav></footer>
    </main>
  );
}
