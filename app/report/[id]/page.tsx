import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Languages,
  MapPin,
  Orbit,
  Sparkles,
  Gem,
  LockKeyhole,
  ArrowRight,
  UserRound,
} from "lucide-react";
import PillarImageLightbox from "@/components/pillar-image-lightbox";
import ReportExperience from "@/components/report-experience";
import {
  type Gender,
  type NatalBookSections,
} from "@/lib/ai/report";
import {
  fallbackNatalText,
  fallbackTransitText,
} from "@/lib/ai/streaming";
import { getPillarImagePath } from "@/lib/archetype-assets";
import { getPillarDisplay, pillarOrder } from "@/lib/bazi-totems";
import { pillarsDB, type PillarProfile } from "@/lib/pillars";
import type { BaziData } from "@/lib/engines/bazi";
import {
  contentLocale,
  elementLabels,
  normalizeReportLocale,
  planetLabels,
  reportCopy,
  reportLanguageOptions,
  zodiacLabels,
  type ReportLocale,
} from "@/lib/report-i18n";

import { getReportAccess } from "@/lib/commerce/access";
import { buildReportGenerationContext, calculateReportBazi } from "@/lib/commerce/report-context";
import { elementStyle, getGemstonesForElement, targetElement } from "@/lib/energy-style";
import ReportUnlock from "@/components/report-unlock";
import unlockStyles from "@/components/report-unlock.module.css";

export const maxDuration = 60;

export const metadata: Metadata = {
  title: "Private DestinyPixel Report",
  description: "A private generated DestinyPixel report.",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

function BaziChart({
  pillars,
  locale,
}: {
  pillars: BaziData["pillars"];
  locale: ReportLocale;
}) {
  const copy = reportCopy[contentLocale(locale)];

  return (
    <div className="pillar-chart">
      {pillarOrder.map((key) => {
        const pillar = pillars[key];
        const role = copy.pillarRoles[key];
        const display = getPillarDisplay(pillar, locale);

        return (
          <article className="pillar-chart-card" key={key}>
            <div className="pillar-card-main">
              <PillarImageLightbox
                src={display.imageSrc}
                alt={display.totemName}
              />
              <header>
                <span>{role.title}</span>
                <strong>{display.pillarLabel}</strong>
                <p>{display.totemName}</p>
              </header>
            </div>
            <div className="pillar-symbol-row">
              <div>
                <span>{copy.bazi.heavenlyStem}</span>
                <b>{display.stemLabel}</b>
                <small>{display.stemMeaning}</small>
              </div>
              <div>
                <span>{copy.bazi.earthlyBranch}</span>
                <b>{display.branchLabel}</b>
                <small>{display.branchMeaning}</small>
              </div>
            </div>
            <div className="pillar-totem">
              <div>
                <strong>{copy.bazi.elementalSignature}</strong>
                <small>{display.stemMeaning} · {display.branchMeaning}</small>
              </div>
            </div>
            <em>{role.microBadge}</em>
          </article>
        );
      })}
    </div>
  );
}

function ReportLanguageLinks({
  reportId,
  locale,
}: {
  reportId: string;
  locale: ReportLocale;
}) {
  return (
    <div className="language-switch report-language-switch" aria-label="Language selector">
      <Languages size={15} aria-hidden="true" />
      {reportLanguageOptions.map((option) => (
        <Link
          key={option.value}
          href={`/report/${encodeURIComponent(reportId)}?locale=${option.value}`}
          data-active={locale === option.value}
        >
          {option.value === "zh"
            ? "简"
            : option.value === "zh-TW"
              ? "繁"
              : option.value === "ru"
                ? "RU"
                : "EN"}
        </Link>
      ))}
    </div>
  );
}

function buildInitialNatalShell({
  locale,
  profile,
  bazi,
  dayDisplay,
  sunSign,
  mappedPlanetName,
}: {
  locale: ReportLocale;
  profile: PillarProfile;
  bazi: BaziData;
  dayDisplay: ReturnType<typeof getPillarDisplay>;
  sunSign: string;
  mappedPlanetName: string;
}): NatalBookSections {
  const pillarNames = pillarOrder
    .map((key) => getPillarDisplay(bazi.pillars[key], locale).pillarLabel)
    .join(contentLocale(locale) === "zh" ? "、" : ", ");
  const branchNames = pillarOrder
    .map((key) => getPillarDisplay(bazi.pillars[key], locale).branchLabel)
    .join(contentLocale(locale) === "zh" ? "、" : ", ");

  if (contentLocale(locale) === "zh") {
    return {
      dayMaster: `${profile.name.cn} 是这份内在地图的核心动物画像。它先判断你的底层反应方式：你如何吸收环境、如何保护自己、压力大时会变得更清醒还是更逃避。太阳节律落在 ${sunSign}，完整指引会继续流式生成。`,
      outerPersona: `外在层从四重出生坐标展开：${pillarNames}。对应行星为 ${mappedPlanetName}，它描述别人第一眼感受到的气场、压力感和行动速度，也会指出你容易被误读的地方。`,
      deepSelf: `深层自我来自动物场域：${branchNames}。这些图腾描述本能、记忆、依恋模式和压力反应，不会把你包装成完美人格。`,
      career: `事业模块会基于 ${mappedPlanetName}、五行分布和现实行为，判断职业发力点、赚钱方式和容易消耗的坑。`,
      love: "感情模块会单独分析吸引模式、亲密边界、投射风险与关系里的重复课题。",
      growth: `成长模块会围绕 ${dayDisplay.stemMeaning} 的优势与短板，给出可执行的训练方向。`,
      health: "健康模块只提供作息、恢复力与身心节律建议，不替代医学诊断。",
    };
  }

  if (locale === "ru") {
    return {
      dayMaster: `${dayDisplay.totemName} является главным животным портретом этой внутренней карты. Система определяет ключевую координату как ${dayDisplay.pillarLabel}, верхний сигнал как ${dayDisplay.stemMeaning}, а солнечный ритм находится в знаке ${sunSign}. Полная книга ориентира загружается потоково после открытия страницы.`,
      outerPersona: `Внешний слой начинается с четырех координат рождения: ${pillarNames}. Резонансная планета — ${mappedPlanetName}; она описывает первое впечатление, социальную маску и стиль видимости.`,
      deepSelf: `Глубинный слой раскрывается через животное поле: ${branchNames}. Эти тотемы показывают инстинкты, память, привязанность и внутренний психологический двигатель.`,
      career: `Карьера будет разобрана отдельно через ${mappedPlanetName}, структуру энергии и стиль практической реализации.`,
      love:
        "Любовь будет отдельным модулем: притяжение, границы и повторяющиеся сценарии близости.",
      growth: `Рост будет строиться вокруг дара и слепых зон качества ${dayDisplay.stemMeaning}.`,
      health:
        "Здоровье будет описано как ритм восстановления и забота о теле, без медицинских диагнозов.",
    };
  }

  return {
    dayMaster: `${profile.name.en} is the core animal portrait behind this inner map. It starts with a direct verdict on how you absorb pressure, protect yourself, and respond when life becomes noisy. The sky layer places the Sun in ${sunSign}; the full guidance book streams after first paint.`,
    outerPersona: `Your social layer begins with four birth coordinates: ${pillarNames}. The resonant planet is ${mappedPlanetName}. This module reads first impression, public pressure, and where people may misread you.`,
    deepSelf: `Your deeper layer begins with the animal fields: ${branchNames}. These totems describe instinct, memory, attachment, and pressure responses without turning you into a perfect personality type.`,
    career: `Career will be read through ${mappedPlanetName}, five-element distribution, and practical behavior: leverage, money pattern, and energy leaks.`,
    love:
      "Love will be its own module: attraction pattern, emotional boundary, projection risk, and repeated intimacy script.",
    growth: `Growth will focus on the gift and weak spot of ${dayDisplay.stemMeaning}.`,
    health:
      "Health will stay in the lane of rhythm, recovery, and body awareness, without medical diagnosis.",
  };
}

export default async function ReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ locale?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const access = await getReportAccess(id);
  const requestedLocale = normalizeReportLocale(query?.locale ?? "en");
  if (!access.canRead) {
    const isChinese = contentLocale(requestedLocale) === "zh";
    const destination = `/report/${encodeURIComponent(id)}?locale=${requestedLocale}`;
    const accountLink = `/account?${isChinese ? "locale=zh&" : ""}returnTo=${encodeURIComponent(destination)}`;
    return <main className={unlockStyles.privatePage} lang={isChinese ? "zh-Hans" : "en"}>
      <section className={unlockStyles.privateCard}>
        <LockKeyhole size={28} aria-hidden="true" />
        <h1>{isChinese ? "这是一份私人报告。" : "This is a private report."}</h1>
        <p>{isChinese ? "请登录创建或保存这份报告的账号。报告内容只向具有访问权限的账号或原浏览器开放。" : "Log in with the account that created or saved this report. Its contents are available only to an authorized account or the original browser."}</p>
        <div className={unlockStyles.actions}><Link className={unlockStyles.primary} href={accountLink}>{isChinese ? "登录或注册" : "Log in or create an account"}<ArrowRight size={15} aria-hidden="true" /></Link><Link className={unlockStyles.textLink} href={isChinese ? "/?locale=zh" : "/"}>{isChinese ? "返回首页" : "Back home"}</Link></div>
      </section>
    </main>;
  }
  const report = access.report;
  if (!report) notFound();
  const baziData = calculateReportBazi(report);
  const dayPillar = baziData.pillars.day;
  const profile = (pillarsDB as Record<string, PillarProfile>)[dayPillar];
  const sun = report.astro_data.placements.find(
    (placement) => placement.body === "Sun",
  );
  const mappedPlanet = report.astro_data.placements.find(
    (placement) => placement.body === baziData.mappedPlanet,
  );
  const elements = Object.entries(baziData.elementBalance);
  const locale = normalizeReportLocale(
    query?.locale ?? report.birth_record.locale ?? report.ai_content.meta?.locale ?? "en",
  );
  const copyLocale = contentLocale(locale);
  const copy = reportCopy[copyLocale];
  const gender: Gender =
    report.birth_record.gender ??
    report.ai_content.meta?.gender ??
    "female";
  const dayDisplay = getPillarDisplay(dayPillar, locale);
  const sunSign =
    zodiacLabels[copyLocale][report.astro_data.sunSign] ?? report.astro_data.sunSign;
  const solarSecondary =
    copyLocale === "zh" || locale === "en" ? report.astro_data.sunSign : sunSign;
  const mappedPlanetName =
    planetLabels[copyLocale][baziData.mappedPlanet] ?? baziData.mappedPlanet;
  const profileName =
    copyLocale === "zh"
      ? profile.name.cn
      : locale === "ru"
        ? dayDisplay.totemName
        : profile.name.en;
  const headline =
    copyLocale === "zh"
      ? `${profileName} × ${sunSign}`
      : `${profileName} × ${sunSign}`;
  const fullReport = access.isFull ? {
    context: buildReportGenerationContext(report, locale),
    initialNatal: access.commerceEnabled ? null : buildInitialNatalShell({ locale, profile, bazi: baziData, dayDisplay, sunSign, mappedPlanetName }),
  } : null;
  const elementFocus = targetElement(baziData.elementBalance, baziData.missingElements);
  const colorGuide = elementStyle[elementFocus];
  const braceletStones = getGemstonesForElement(elementFocus).slice(0, 3);
  const basicText = copyLocale === "zh" ? {
    kicker: "免费基础报告", title: "你的出生图谱，一眼看懂。",
    summary: `你的日柱意象是${profileName}，日干对应${dayDisplay.stemMeaning}，太阳星座落在${sunSign}。左侧四柱与五行分布来自你填写的出生资料，可用作观察自己的起点。`,
    reflection: "先选一个与你日常经验有关的特点，想想它最近在什么情境下出现。把这份图谱当作象征性的自我观察，而不是确定的命运判断。",
    colors: "从五行配色，到日常手串", focus: `配色可以从「${colorGuide.label[copyLocale]}」的意象出发：`,
    stones: "可参考的宝石：", atelier: "打开灵石手串工坊", totem: "探索本命灵构",
    note: "配色与宝石建议用于审美和象征表达，不代表健康或运势效果。",
  } : locale === "ru" ? {
    kicker: "БЕСПЛАТНЫЙ БАЗОВЫЙ ОТЧЕТ", title: "Ваша карта рождения с первого взгляда.",
    summary: `Образ вашего столпа дня — ${profileName}; качество небесного ствола — ${dayDisplay.stemMeaning}, а Солнце находится в знаке ${sunSign}. Четыре столпа и баланс стихий рассчитаны по вашим данным рождения.`,
    reflection: "Выберите одну тему, связанную с вашим опытом, и вспомните конкретную ситуацию. Это символический повод для размышления, а не определение вашей судьбы.",
    colors: "Цвета стихий и браслет", focus: `Начните с цветового образа стихии ${colorGuide.label[copyLocale]}:`,
    stones: "Камни для вдохновения: ", atelier: "Открыть мастерскую браслетов", totem: "Изучить тотем рождения",
    note: "Цвета и камни служат эстетике и символике, а не обещают влияние на здоровье или удачу.",
  } : {
    kicker: "FREE BASIC REPORT", title: "Your birth map at a glance.",
    summary: `Your day-pillar image is ${profileName}, the stem expresses ${dayDisplay.stemMeaning}, and your Sun is in ${sunSign}. The Four Pillars and element balance beside this reading are calculated from the birth details you entered.`,
    reflection: "Choose one theme that connects to your experience and recall a specific recent situation. Use the map as a symbolic starting point for self-observation, rather than a prediction of your future.",
    colors: "From five-element colors to your bracelet", focus: `Begin with the color symbolism of ${colorGuide.label[copyLocale]}:`,
    stones: "Gemstones to explore: ", atelier: "Open the bracelet workshop", totem: "Explore Birth Totem",
    note: "Color and gemstone suggestions are aesthetic and symbolic; they do not promise health or luck effects.",
  };

  return (
    <main
      className="report-shell"
      lang={locale === "zh-TW" ? "zh-Hant" : locale === "zh" ? "zh-Hans" : locale}
      data-report-export
      data-report-title={headline}
    >
      <div className="report-backdrop" aria-hidden="true">
        <Image
          src="/destinypixel-deep-space.png"
          alt=""
          fill
          priority
          sizes="100vw"
        />
        <span />
      </div>

      <header className="report-header page-container">
        <Link href={`/?locale=${locale}`} className="report-back-link">
          <ArrowLeft size={15} aria-hidden="true" />
          {copy.back}
        </Link>
        <div className="report-header-actions">
          <div className="brand">
            <span className="brand-mark" aria-hidden="true">
              <span className="brand-mark__core" />
              <span className="brand-mark__orbit" />
            </span>
            <span>DestinyPixel</span>
          </div>
          <Link href={copyLocale === "zh" ? "/account?locale=zh" : "/account"} className="report-back-link">{copyLocale === "zh" ? "我的账号" : locale === "ru" ? "Аккаунт" : "Your account"}</Link>
          <ReportLanguageLinks
            reportId={report.id}
            locale={locale}
          />
        </div>
      </header>

      <section className="report-hero page-container">
        <div className="report-card-visual">
          <Image
            src={getPillarImagePath(dayPillar)}
            alt={profileName}
            width={896}
            height={1200}
            priority
          />
        </div>

        <div className="report-summary">
          <p className="eyebrow">
            <Sparkles size={13} aria-hidden="true" />
            {copy.heroEyebrow}
          </p>
          <h1>{headline}</h1>
          <p className="report-lede">{copy.heroLede}</p>

          <div className="report-identity-grid">
            <div>
              <span>{copy.identity.dayPillar}</span>
              <strong>
                {dayDisplay.pillarLabel} · {profileName}
              </strong>
              <p>{dayDisplay.totemName}</p>
            </div>
            <div>
              <span>{copy.identity.solar}</span>
              <strong>
                {sunSign}
                {sun ? ` · ${sun.degreeInSign}°` : ""}
              </strong>
              <p>{solarSecondary}</p>
            </div>
            <div>
              <span>{copy.identity.mapping}</span>
              <strong>
                {dayDisplay.stemLabel} = {mappedPlanetName}
              </strong>
              <p>
                {dayDisplay.stemMeaning}
                {mappedPlanet
                  ? ` · ${zodiacLabels[copyLocale][mappedPlanet.sign] ?? mappedPlanet.sign}`
                  : ""}
              </p>
            </div>
          </div>

          <div className="report-meta-row">
            <span>
              <CalendarDays size={14} aria-hidden="true" />
              {report.birth_record.birth_date} {report.birth_record.birth_time}
            </span>
            <span>
              <MapPin size={14} aria-hidden="true" />
              {report.birth_record.birth_place}
            </span>
            <span>
              <Orbit size={14} aria-hidden="true" />
              {copy.meta.trueSolar} {baziData.trueSolarTime.time}
            </span>
            <span>
              <UserRound size={14} aria-hidden="true" />
              {gender === "male" ? copy.meta.male : copy.meta.female}
            </span>
          </div>
        </div>
      </section>

      <section className="report-body page-container">
        <aside className="report-side-panel">
          <div className="report-side-panel__heading">
            <span>{copy.bazi.eyebrow}</span>
            <h2>{copy.bazi.title}</h2>
            <p>{copy.bazi.description}</p>
          </div>

          <BaziChart pillars={baziData.pillars} locale={locale} />

          <div className="element-bars">
            <h3>{copy.bazi.elementBalance}</h3>
            {elements.map(([element, value]) => (
              <div key={element}>
                <span>{elementLabels[copyLocale][element] ?? element}</span>
                <i>
                  <b style={{ width: `${Math.max(8, Number(value) * 12)}%` }} />
                </i>
                <em>{value}</em>
              </div>
            ))}
          </div>
        </aside>

        {fullReport ? <ReportExperience
          key={`${report.id}:${locale}`}
          context={fullReport.context}
          initialNatal={fullReport.initialNatal}
          fallbackNatalRaw={access.commerceEnabled ? "" : fallbackNatalText(fullReport.context)}
          fallbackTransitRaw={access.commerceEnabled ? "" : fallbackTransitText(fullReport.context)}
          requireGeneratedContent={access.commerceEnabled}
          initialMember={access.member ? { id: access.member.id, email: access.member.email, name: access.member.name, plan: access.member.plan } : null}
          initiallySaved={Boolean(access.member && !access.claimable)}
        /> : <div className="report-workspace">
          <section className={unlockStyles.basic}>
            <p className={unlockStyles.eyebrow}><Sparkles size={14} aria-hidden="true" />{basicText.kicker}</p>
            <h2>{basicText.title}</h2><p>{basicText.summary}</p><p>{basicText.reflection}</p>
            <h3>{basicText.colors}</h3><p>{basicText.focus}</p>
            <div className={unlockStyles.colors}>{colorGuide.colors[copyLocale].map((color, index) => <span key={color}><i style={{ background: colorGuide.swatches[index] }} />{color}</span>)}</div>
            <p>{colorGuide.wardrobe[copyLocale]}</p>
            <p>{basicText.stones}{braceletStones.map((stone) => stone.name[copyLocale]).join(copyLocale === "zh" ? "、" : ", ")}</p>
            <p className={unlockStyles.small}>{basicText.note}</p>
            <div className={unlockStyles.basicActions}><Link className={unlockStyles.textLink} href={`/atelier?locale=${locale}&focus=${elementFocus}`}><Gem size={15} aria-hidden="true" />{basicText.atelier}<ArrowRight size={14} aria-hidden="true" /></Link><Link className={unlockStyles.textLink} href={`/tuteng?locale=${locale}`}>{basicText.totem}<ArrowRight size={14} aria-hidden="true" /></Link></div>
          </section>
          <ReportUnlock key={`${report.id}:${locale}`} reportId={report.id} locale={locale} isMember={Boolean(access.member)} claimable={access.claimable} offer={access.offer} />
        </div>}
      </section>
    </main>
  );
}
