import { ArrowUpRight } from "lucide-react";
import type { JournalLocale } from "@/lib/journal";
import { isSafeBirthdaySource, type DayPillarPerson } from "@/lib/day-pillar-people";
import styles from "./day-pillar-people.module.css";

export default function DayPillarPeople({ people, locale, additional }: { people: DayPillarPerson[]; locale: JournalLocale; additional?: boolean }) {
  if (locale !== "en" && locale !== "zh") return null;
  const copy = locale === "zh" ? {
    more: "更多有出处的生日对照", field: "领域", date: "来源所列公历生日", result: "日期日柱", source: "生日来源",
    method: "以下采用直接来源公开的公历生日，按当地民用日期、零点日界与本站日期查询器对照。未采集出生时刻，也不做时区换算或太阳时校准，因此不代表完整八字。",
    limit: "同一个日期日柱可以对应非常不同的人生。人物的工作、成就或婚恋不是命理解读的证据。古历记载或有争议的生日需要另行核查，这里不擅自转换或补齐。",
  } : {
    more: "More sourced birthday matches", field: "Field", date: "Published Gregorian birthday", result: "Date-based Day Pillar", source: "Birthday source",
    method: "These use the public Gregorian birthday stated by each direct source, treated as a local civil date with a midnight boundary in our date finder. No birth time is supplied, and no time-zone conversion or solar-time correction is applied. This is not a complete BaZi chart.",
    limit: "People with the same date-based Day Pillar can have very different lives. Their work, achievements or relationships are not evidence for a BaZi interpretation. Historical calendar records and disputed birthdays require separate review; they are not silently converted or filled in here.",
  };
  const sourced = people.filter(person => person.sources.some(source => isSafeBirthdaySource(source.url)));
  if (!sourced.length) return null;
  return <div className={styles.panel} data-day-pillar-people>
    {additional && <h3 className={styles.more}>{copy.more}</h3>}
    <div className={styles.method}><p>{copy.method}</p><p>{copy.limit}</p></div>
    <ul className={styles.list}>
      {sourced.map(person => <li className={styles.person} key={person.id} data-person-id={person.id}>
        <h3>{person.name[locale]}</h3>
        <dl>
          <div><dt>{copy.field}</dt><dd>{person.field[locale]}</dd></div>
          <div><dt>{copy.date}</dt><dd><time dateTime={person.birthDate}>{person.birthDate}</time></dd></div>
          <div><dt>{copy.result}</dt><dd>{person.dayPillar}</dd></div>
        </dl>
        {person.displayNote && <p className={styles.note}>{person.displayNote[locale]}</p>}
        <div className={styles.sources}>{person.sources.filter(source => isSafeBirthdaySource(source.url)).map(source =>
          <a key={source.url} href={`${source.url}${source.pageNumber ? `#page=${source.pageNumber}` : ""}`} target="_blank" rel="noopener noreferrer" data-birthday-source>
            <span>{copy.source} · {source.publisher}{source.locator && <small>{source.locator}</small>}</span><ArrowUpRight size={15} aria-hidden="true" />
          </a>
        )}</div>
      </li>)}
    </ul>
  </div>;
}
