import { birthInputArticle } from "@/lib/journal-birth-input";
import type { Metadata } from "next";
import { tarotEducationArticles } from "@/lib/journal-tarot-editorial";
import { tarotMethodArticles } from "@/lib/journal-tarot-methods";
import { tarotSuitArticle } from "@/lib/journal-tarot-suits";
import { absoluteUrl, siteName } from "@/lib/seo";
import { editorialModifiedAt } from "@/lib/editorial-updates";
import { dayPillarIntroduction } from "@/lib/journal-day-pillar";
import { jiaZiArticle } from "@/lib/journal-jia-zi";
import { crystalCareArticle } from "@/lib/journal-crystal-care";
import { journalRussian } from "@/lib/journal-ru";
import { searchGrowthArticles, searchGrowthRussian } from "@/lib/journal-search-growth";
import { loveFortuneArticle, loveFortuneRussian } from "@/lib/journal-love-fortune";
import { fiveElementsArticle, fiveElementsRussian } from "@/lib/journal-five-elements";
import { threeCardTarotArticle, threeCardTarotRussian } from "@/lib/journal-three-card-tarot";
import { pamelaColmanSmithArticle, pamelaColmanSmithRussian } from "@/lib/journal-pamela-colman-smith";
import { pillarProfileArticles, pillarProfileRussian } from "@/lib/journal-pillar-profiles";
import { taiSuiArticle } from "@/lib/journal-tai-sui";
import { getPillarImagePath } from "@/lib/archetype-assets";
import { withDayPillarPeople, type DayPillarPerson } from "@/lib/day-pillar-people";
import { pillarLibraryHref, pillarLibraryCopy } from "@/lib/day-pillar-library";
import { journalLocales, journalLanguageTags, journalOgLocales, journalUi, journalHomeHref, toTraditional, type JournalLocale } from "@/lib/journal-locales";
export { journalLocales, journalLanguageTags, journalUi } from "@/lib/journal-locales";
export type { JournalLocale } from "@/lib/journal-locales";

export type JournalSection = {
  id: string;
  title: string;
  paragraphs: string[];
  /** Complete authored Markdown; never a summary of the section. */
  bodyMarkdown?: string;
  steps?: string[];
  table?: { headings: string[]; rows: string[][] };
  sources?: { label: string; href: string }[];
  figures?: { src: string; width: number; height: number; alt: string; caption: string; afterParagraph: number }[];
  links?: { text: string; href: string }[];
  /** Sourced public birth dates; no birth-time or complete-chart inference. */
  people?: DayPillarPerson[];
};
export type JournalTranslation = {
  title: string;
  /** Optional narrative subtitle shown under the H1. */
  subtitle?: string;
  /** Optional short direct answer shown under the H1. */
  answer?: string;
  description: string;
  topic: string;
  introduction: string;
  openingParagraphs?: string[];
  takeaway?: string;
  sections: JournalSection[];
  action: { label: string; href: string };
};
export type JournalArticle = {
  slug: string;
  /** Advertise only authored editions; older articles retain their four locales. */
  availableLocales?: readonly JournalLocale[];
  pillar?: string;
  kind?: "portrait" | "education";
  portraitDepth?: "full";
  relatedSlug?: string;
  /** Article-specific Traditional Chinese wording fixes applied after automatic conversion. */
  zhTwReplacements?: [string, string][];
  /** Dedicated social/schema image. */
  image?: { src: string; width: number; height: number };
  /** schema.org entity the article is about. */
  about?: { "@type": "Person"; name: string; birthDate: string; deathDate: string; image?: string; sameAs: string[] };
  publishedAt: string;
  updatedAt: string;
  translations: Record<JournalLocale, JournalTranslation>;
};
export type JournalSourceArticle = Omit<JournalArticle, "translations"> & { translations: Record<"en" | "zh", JournalTranslation>; traditionalTranslation?: JournalTranslation };

const journalSources: JournalSourceArticle[] = [
  pamelaColmanSmithArticle,
  threeCardTarotArticle,
  fiveElementsArticle,
  loveFortuneArticle,
  ...searchGrowthArticles,
  crystalCareArticle,
  jiaZiArticle,
  ...pillarProfileArticles,
  dayPillarIntroduction,
  birthInputArticle,
  {
    slug: "five-element-bracelet-design",
    relatedSlug: "crystal-bracelet-care",
    publishedAt: "2026-09-11",
    updatedAt: "2026-10-30",
    translations: {
      en: {
        title: "Five-element bracelet order: how to arrange your beads",
        description: "Does a five-element bracelet need a fixed bead order? Compare the traditional generating cycle with two 20-bead layouts, then try the existing 18-bead design walkthrough.",
        topic: "Five elements & design",
        introduction: "A bracelet becomes easier to design when you separate three choices: the feeling you want the colors to express, the pattern of beads, and the physical fit. DestinyPixel’s atelier gives you a board for the first two and preset counts to explore the third. You can use it without a birth report. Here is a complete example, from a simple color intention to an image you can discuss with a maker.",
        takeaway: "Use the five elements as a symbolic palette. The balance percentages count your selected beads; they do not measure personal energy or establish a physical wrist size.",
        answer: "DestinyPixel does not require a fixed five-element bead order. You can borrow the generating cycle as a symbolic pattern or arrange colors in blocks. Changing the order alone leaves the workshop percentages unchanged: they count beads, not the effect of a sequence.",
        sections: [
          {
            "id": "bead-order",
            "title": "Is there a correct five-element bracelet order?",
            "paragraphs": [
              "First distinguish a list of names from a relationship. Metal, Wood, Water, Fire and Earth names the five elements; it is not the generating cycle. The Five Elements chapter of Bai Hu Tong describes the cycle Wood → Fire → Earth → Metal → Water → Wood. The arrow here means “generates” within that traditional framework, not a measured flow through gemstones.",
              "The cited passage discusses relations between the five elements. It does not specify which gemstone starts a bracelet, whether to string it clockwise or which wrist to use. Turning that cycle into a bead repeat is a modern design choice in this guide. If a teacher or a particular practice gives you an arrangement, describe it as that practice’s rule rather than treating this color exercise as its authority.",
              "On a circular bracelet, the first bead also depends on where you start counting. Mark a starting point in the making brief if the order matters to your design. Reversing a planned sequence changes its direction, but the atelier does not score one direction as luckier or reject neighboring categories as a harmful combination.",
              "A BaZi or Chinese astrology chart is a separate interpretive framework. An empty category in the bead chart only means you have not selected a bead assigned to it; it is not a diagnosis that your birth chart needs that element. The workshop does not calculate a personal bead order from your birth data."
            ],
            "sources": [
              {
                "label": "Bai Hu Tong · Five Elements (Chinese primary text, Shidian Guji)",
                "href": "https://www.shidianguji.com/zh/book/SBCK092/chapter/SBCK092_13"
              }
            ]
          },
          {
            "id": "compare-orders",
            "title": "Same 20 beads, two different rhythms",
            "paragraphs": [
              "For a short comparison before the 18-bead walkthrough below, open the bracelet atelier and choose 8 mm, Soft fit and 20 beads, then select All. Use four each of Jade, Red Agate, Tiger’s Eye, Clear Quartz and Lapis Lazuli. In this workshop they are assigned to Wood, Fire, Earth, Metal and Water respectively. These are the site’s palette labels, not a universal classification of minerals.",
              "Read each sequence from your chosen starting point. For A, add one of each material in the order below, then repeat that five-bead group four times in total. For B, add four of the first material, then four of the next, continuing until all twenty are placed. The names and quantities stay the same; only neighboring beads change.",
              "Both designs show 4 of 20 beads in each category, or 20% each. This equal split makes the comparison easy to check; it is not a recommended personal balance or a requirement to include all five elements. Choose A if you like frequent color changes, B if you prefer larger patches of color. Compare the preview against the clothes you actually wear.",
              "The current atelier adds a bead to the end of the list and lets you remove individual beads; it does not offer drag-to-reorder. To compare these full layouts, download A first, note its sequence, then use Clear board and rebuild B. Save B separately and label both versions. Confirm the real bead dimensions and fit with the maker: 20 beads at a nominal 8 mm is a preview setting, not a measured inner circumference."
            ],
            "table": {
              "headings": [
                "Layout",
                "Sequence to enter",
                "Visible rhythm"
              ],
              "rows": [
                [
                  "A · Repeated cycle",
                  "Jade → Red Agate → Tiger’s Eye → Clear Quartz → Lapis Lazuli; repeat the group 4 times.",
                  "Five colors alternate around the bracelet."
                ],
                [
                  "B · Color blocks",
                  "Jade × 4 → Red Agate × 4 → Tiger’s Eye × 4 → Clear Quartz × 4 → Lapis Lazuli × 4.",
                  "Five longer patches of color."
                ]
              ]
            },
            "links": [
              {
                "text": "bracelet atelier",
                "href": "/atelier"
              }
            ]
          },
          {
            id: "design-intention",
            title: "1. Give the design one clear job",
            paragraphs: ["Start with an ordinary design sentence: “I want a mostly blue bracelet, with light breaks and two warm accents.” That is specific enough to guide a choice. “I need a stone that guarantees success” is not a design instruction the workshop can fulfil.", "The five-element labels offer a vocabulary for personal symbolism. You might associate a dark blue palette with a reminder to pause before responding, for example. The reminder is yours; the stone does not establish a psychological effect. A chart’s element display also does not require you to buy a particular material or distribute your bracelet equally across all five labels."],
          },
          {
            id: "palette",
            title: "2. Treat the element labels as this workshop’s palette",
            paragraphs: ["In the atelier, every listed stone belongs to one element category. These are product design associations, not a mineral classification or a universal rule about all traditions. Start with the colors on screen, then choose stones whose appearance supports your design sentence. The exact shade of a physical bead will vary from the digital preview."],
            table: { headings: ["Workshop category", "Palette direction"], rows: [["Wood", "Green, sage, jade and olive."], ["Fire", "Coral, warm red and orange."], ["Earth", "Sand, camel and warm brown."], ["Metal", "White, silver and cool gray."], ["Water", "Ink blue, navy, black and cool blue."]] },
          },
          {
            id: "size-first",
            title: "3. Set the size before adding the beads",
            paragraphs: ["Choose 10 mm, Soft fit, and a target of 18 beads. Soft fit and Structured fit select different suggested counts; they do not measure your wrist. Use them to explore proportions, then confirm physical dimensions separately.", "Set these choices before you arrange the pattern. Reducing the target count later trims beads from the end of the current arrangement. If you want to compare a smaller design, download the first version beforehand. Switching the element filter changes the tray you are browsing; it does not recolor the beads already on the board."],
          },
          {
            id: "worked-example",
            title: "4. Build one repeat, then repeat it once",
            paragraphs: ["Choose All in the element filter so the three materials are available together. Our example uses Lapis Lazuli, Clear Quartz and Tiger’s Eye. In this workshop they are assigned to Water, Metal and Earth respectively. The blue is the base, the pale beads create breaks, and the brown beads provide two warm reference points.", "Add this nine-bead sequence twice: lapis, lapis, lapis, clear quartz, lapis, lapis, lapis, clear quartz, tiger’s eye. Every tap adds one bead. Check the sequence list as you go rather than relying only on the circular preview. At 18 beads the board is full; remove a placed bead before adding a replacement. This is an example to adapt, not a prescribed lucky formula."],
            table: { headings: ["Material", "Count", "Workshop share"], rows: [["Lapis Lazuli / Water", "12", "67%"], ["Clear Quartz / Metal", "4", "22%"], ["Tiger’s Eye / Earth", "2", "11%"]] },
          },
          {
            id: "read-percentages",
            title: "5. Read the numbers as a bead count",
            paragraphs: ["The element balance is calculated from the beads currently placed. Twelve of our eighteen beads belong to Water, so 12 divided by 18 gives about 66.7%, displayed as 67%. Each category is rounded independently. A different combination may show percentages that do not sum to exactly 100 because of rounding.", "An unfinished board reports the balance of the beads you have added, not the empty slots. Bead size does not weight one category more heavily. The result is neither a chemical composition nor a measurement of your body, wellbeing or fortune. Changing the order can transform the visual rhythm while leaving the percentages exactly the same."],
          },
          {
            id: "export-and-fit",
            title: "6. Turn the preview into a useful making brief",
            paragraphs: ["Use Download image to save a PNG of the design board. Before leaving the page, also note the bead names, sequence, intended bead diameter and target count. The image is a visual reference; it does not place an order or confirm that a seller has the materials.", "For a physical bracelet, give the maker your measured wrist circumference and preferred looseness. Ask them to verify the finished internal fit, cord, knot, bead-hole compatibility and any spacers. Eighteen nominal 10 mm beads do not by themselves specify the finished internal circumference. Agree on a sample or measurement before treating the digital count as a purchase specification."],
          },
          {
            id: "material-care",
            title: "7. Check the actual materials before caring for them",
            paragraphs: ["Ask the seller what each bead is and whether it has been treated. GIA explains that heat, chemicals and some cleaning methods can affect gemstones and their treatments; its guidance specifically includes lapis lazuli among materials unsuitable for ultrasonic cleaning. A mixed bracelet therefore needs care instructions for the actual combination, including its cord.", "Keep material-care advice separate from the symbolic story you chose for the design. The workshop’s labels can help you describe an intention, while the maker’s confirmed specifications and care guidance help you look after the object. A successful result is a bracelet whose appearance, fit and personal meaning you can explain clearly."],
            sources: [{ label: "GIA: tips on caring for jewelry", href: "https://www.gia.edu/gia-news-research-tips-caring-jewelry" }],
          },
        ],
        action: { label: "Open the bracelet atelier", href: "/atelier" },
      },
      zh: {
        title: "五行珠有固定顺序吗？手串排列与配色指南",
        description: "五行珠一定要按相生顺序串吗？区分传统相生关系与首饰排列，用同样二十颗珠子比较循环和色块，再完成十八颗手串配色练习。",
        topic: "五行与设计",
        introduction: "把手串设计拆成三件事，会容易得多：希望颜色表达什么、珠子怎样排列、实物戴起来是否合适。DestinyPixel 手串工坊提供配色与排列画板，也提供可探索的颗数预设。你不需要先生成出生报告。下面用一个完整例子，从一句配色意图走到可以与制作者沟通的设计参考。",
        takeaway: "把五行当作象征性配色语言。画面的比例统计的是已选珠子，不是个人能量，也不能直接确定实物腕围。",
        answer: "DestinyPixel 手串工坊没有规定唯一的五行珠顺序。可以把相生次序作为象征性排列，也可以按颜色分组。只换珠序、不换珠子的种类和颗数，工坊显示的五行比例不会改变；它统计的是珠子，不是排列的效果。",
        sections: [
          {
            "id": "bead-order",
            "title": "五行珠到底有没有一个正确顺序？",
            "paragraphs": [
              "先分清“五个名字”和“五种关系”。“金木水火土”是五行名称的列举，并不是相生次序。《白虎通》的“五行”篇写到的相生循环是：木→火→土→金→水→木。这里的箭头表示传统框架中的“生”，不是测量出的宝石能量流动方向。",
              "这里引用的古籍段落讨论五行之间的关系，没有规定手串第一颗必须是什么宝石、应该顺时针串，或一定戴在哪只手。把相生循环转成珠子重复单元，是本指南提供的现代设计做法。如果你遵循某位老师或某种仪式的具体排法，应说明它属于那套实践，不能拿这份配色练习当成其权威依据。",
              "手串是一个圆，“第一颗”还取决于你从哪里开始数。如果设计需要固定珠序，可以在给制作者的说明里标出起点。把既定顺序反过来会改变方向，但工坊不会据此判定哪个方向更吉利，也不会把相邻的某两类珠子判为有害组合。",
              "八字与出生图谱属于另一套解释问题。配珠图里某类为零，只说明没有选入归到这一类的珠子，不能推导成你的八字需要补这一行。工坊也不会根据出生资料计算个人必须采用的珠序。"
            ],
            "sources": [
              {
                "label": "《白虎通德论》五行篇原文（识典古籍）",
                "href": "https://www.shidianguji.com/zh/book/SBCK092/chapter/SBCK092_13"
              }
            ]
          },
          {
            "id": "compare-orders",
            "title": "同样二十颗珠子，比较两种排列",
            "paragraphs": [
              "先做一个短对比，再看下文原有的十八颗完整练习。打开手串工坊，选择 8 mm、“女款”（英文为 Soft fit）和 20 颗，五行筛选选“全部”。取翡翠、南红玛瑙、虎眼石、白水晶、青金石各四颗；它们在当前工坊中依次归为木、火、土、金、水。这是本站的配色标签，不是对所有矿物通用的五行分类。",
              "从自己标定的起点读珠序。A 方案按下表顺序各加一颗，五颗为一组，总共放四组；B 方案先连续放四颗翡翠，再放四颗南红玛瑙，依次完成二十颗。材质和总颗数完全相同，改变的是哪颗珠子挨着哪颗珠子。",
              "两个方案每类都是 4÷20，也就是 20%。这里平均分配只是为了方便核对，不是在推荐个人的最佳比例，也不要求手串必须凑齐五行。喜欢频繁换色可以选 A，喜欢大块颜色可以选 B，再用日常衣服作参照来比较。",
              "当前工坊每次加珠都会放在顺序列表末尾，也可以单颗删除，并不支持拖动换序。对比这两个完整方案时，先下载 A 的图片并记好珠序，再点“清空重排”搭建 B。分别保存、标注版本，再与制作者确认实际珠径和佩戴尺寸。20 颗标称 8 mm 是预览设置，不能直接当成成品内围。"
            ],
            "table": {
              "headings": [
                "方案",
                "按此顺序放入",
                "视觉节奏"
              ],
              "rows": [
                [
                  "A · 循环排列",
                  "翡翠→南红玛瑙→虎眼石→白水晶→青金石；整组重复四次。",
                  "五种颜色不断交替。"
                ],
                [
                  "B · 色块排列",
                  "翡翠×4→南红玛瑙×4→虎眼石×4→白水晶×4→青金石×4。",
                  "形成五段较长的色块。"
                ]
              ]
            },
            "links": [
              {
                "text": "手串工坊",
                "href": "/atelier?locale=zh"
              }
            ]
          },
          {
            id: "design-intention",
            title: "1. 先给这条手串一个清楚的设计任务",
            paragraphs: ["可以先写：“我想做一条以蓝色为主的手串，中间用浅色留出停顿，再放两个暖色点。”这句话能够帮助你做取舍。“我要一种保证成功的石头”，则不是工坊能够完成的设计要求。", "五行标签提供的是个人象征的表达词汇。例如，你可以把深蓝色理解为提醒自己回应前先停一下。提醒来自你的使用方式，石头本身并没有因此被证明具有心理作用。出生图谱里的元素显示，也不意味着必须购买某种材质，或把五行平均分成五份。"],
          },
          {
            id: "palette",
            title: "2. 先看颜色，再理解工坊里的元素分类",
            paragraphs: ["工坊给每种收录材质分配了一个元素类别。这是产品中的设计对应关系，并不是矿物学分类，也不是对所有文化传统通用的唯一规则。先选择符合设计意图的颜色，再寻找合适的材质；实物珠子的准确色泽仍需要单独确认。"],
            table: { headings: ["工坊分类", "配色方向"], rows: [["木", "绿色、鼠尾草绿、翡翠绿与橄榄绿。"], ["火", "珊瑚色、暖红与橘色。"], ["土", "沙色、驼色与暖棕。"], ["金", "白色、银色与冷灰。"], ["水", "墨蓝、海军蓝、黑色与冷蓝。"]] },
          },
          {
            id: "size-first",
            title: "3. 配珠前先定珠径和目标颗数",
            paragraphs: ["这个例子选择 10 mm、“女款”（英文界面为 Soft fit），并把目标颗数设为 18。这些都是当前工坊中可以选择的设置。款式选项只是改变建议颗数，并没有测量你的手腕，适合先比较比例，再单独确认实物尺寸。", "排列之前先确定设置。如果后来减少目标颗数，当前排列末尾多出的珠子会被裁掉。想比较更小的版本，先把原版本下载保存。切换元素筛选只会改变正在浏览的珠子列表，不会把画板里已经放好的珠子重新染色。"],
          },
          {
            id: "worked-example",
            title: "4. 做一个九颗单元，再重复一次",
            paragraphs: ["把元素筛选切换到“全部”，使用青金石、白水晶和虎眼石。它们在当前工坊中分别归入水、金、土。蓝色作为底色，浅色制造间隔，棕色提供两个暖色参照点。", "按下面的九颗顺序放两遍：青金石、青金石、青金石、白水晶、青金石、青金石、青金石、白水晶、虎眼石。每点击一次只加入一颗。边放边核对珠子顺序列表，不要只看环形预览。达到 18 颗后画板已满，要替换时先移除已放入的珠子。这是一份可改写的配色练习，不是规定吉凶的配方。"],
            table: { headings: ["材质", "颗数", "工坊比例"], rows: [["青金石／水", "12", "67%"], ["白水晶／金", "4", "22%"], ["虎眼石／土", "2", "11%"]] },
          },
          {
            id: "read-percentages",
            title: "5. 把比例读成珠子统计",
            paragraphs: ["这条手串已有 18 颗珠子，其中 12 颗在工坊中归为水，所以 12÷18 约为 66.7%，显示为 67%。每个类别分别四舍五入，其他搭配的显示比例可能不会刚好加总成 100%。", "未完成的画板只统计已经放入的珠子，不把空位计算在内；珠径也不会让某一类的权重变大。它不是化学成分，更不是身体、健康或运势的测量。即使比例完全不变，仅仅调整排列顺序，也可能让视觉节奏明显不同。"],
          },
          {
            id: "export-and-fit",
            title: "6. 把预览整理成能够沟通的制作参考",
            paragraphs: ["点击下载图片，保存设计画板的 PNG。离开页面前，再记录材质名称、排列顺序、预期珠径和目标颗数。图片是一份视觉参考，并不会替你下单，也不能确认某个商家有对应库存。", "制作实物时，把实际量得的腕围和希望的松紧程度告诉制作者，请对方核实成品内围、线材、打结方式、珠孔和隔珠。18 颗标称 10 mm 的珠子，不能直接确定成品内部周长。购买前先对样品或尺寸达成一致，再把数字设计转成制作规格。"],
          },
          {
            id: "material-care",
            title: "7. 养护方法要跟着真实材质走",
            paragraphs: ["向卖家确认每种珠子的实际材质，以及是否经过处理。GIA 的养护说明指出，热、化学物质和某些清洗方法可能影响宝石与处理状态，并把青金石列入不适合超声波清洗的材料。混合材质手串需要针对实际组合和线材确认养护方法。", "把材质养护和你赋予手串的象征故事分开：元素标签帮助你描述意图，经过确认的制作规格与养护方法帮助你照顾物品。一个好的结果，是你能够清楚解释它的颜色、佩戴感受，以及它对自己的意义。"],
            sources: [{ label: "GIA：珠宝养护建议", href: "https://www.gia.edu/gia-news-research-tips-caring-jewelry" }],
          },
        ],
        action: { label: "打开五行手串工坊", href: "/atelier?locale=zh" },
      },
    },
  },
];

export function normalizeJournalLocale(value?: string): JournalLocale {
  if (value === "zh-TW" || value === "zh-Hant") return "zh-TW";
  if (value === "zh" || value === "zh-Hans" || value === "cn") return "zh";
  return value === "ru" ? "ru" : "en";
}

export function journalHref(locale: JournalLocale, slug?: string) {
  const path = slug ? `/journal/${slug}` : "/journal";
  return locale === "en" ? path : `${path}?locale=${locale}`;
}

function traditionalTranslation(copy: JournalTranslation): JournalTranslation {
  const text = toTraditional;
  return {
    title: text(copy.title), description: text(copy.description), topic: text(copy.topic),
    ...(copy.subtitle ? { subtitle: text(copy.subtitle) } : {}), ...(copy.answer ? { answer: text(copy.answer) } : {}),
    introduction: text(copy.introduction), ...(copy.takeaway ? { takeaway: text(copy.takeaway) } : {}),
    sections: copy.sections.map((section) => ({
      ...section, title: text(section.title), paragraphs: section.paragraphs.map(text),
      ...(section.steps ? { steps: section.steps.map(text) } : {}),
      ...(section.table ? { table: { headings: section.table.headings.map(text), rows: section.table.rows.map((row) => row.map(text)) } } : {}),
      ...(section.figures ? { figures: section.figures.map((figure) => ({ ...figure, alt: text(figure.alt), caption: text(figure.caption) })) } : {}),
      ...(section.links ? { links: section.links.map((link) => ({ text: text(link.text), href: link.href.replace("locale=zh", "locale=zh-TW") })) } : {}),
      ...(section.sources ? { sources: section.sources.map((source) => ({ ...source, label: text(source.label), href: source.href.startsWith("/") ? source.href.replace("locale=zh", "locale=zh-TW") : source.href })) } : {}),
    })),
    action: copy.action.href.startsWith("/day-pillar")
      ? { label: `${text(copy.action.label)}（簡體中文）`, href: copy.action.href }
      : { label: text(copy.action.label), href: copy.action.href.replace("locale=zh", "locale=zh-TW") },
  };
}

function applyReplacements(copy: JournalTranslation, replacements?: [string, string][]): JournalTranslation {
  if (!replacements?.length) return copy;
  return JSON.parse(replacements.reduce((json, [from, to]) => json.replaceAll(from, to), JSON.stringify(copy)));
}

export const journalArticles: JournalArticle[] = [{
  ...taiSuiArticle,
  availableLocales: ["en", "zh"],
  // Internal fallbacks are never listed as additional authored editions.
  translations: { ...taiSuiArticle.translations, "zh-TW": taiSuiArticle.translations.zh, ru: taiSuiArticle.translations.en },
}, tarotSuitArticle, ...tarotMethodArticles, ...tarotEducationArticles, ...journalSources.map((article) => {
  const ru = pillarProfileRussian[article.slug] ?? (article.slug === pamelaColmanSmithArticle.slug ? pamelaColmanSmithRussian : article.slug === threeCardTarotArticle.slug ? threeCardTarotRussian : article.slug === fiveElementsArticle.slug ? fiveElementsRussian : article.slug === loveFortuneArticle.slug ? loveFortuneRussian : searchGrowthRussian[article.slug] ?? journalRussian[article.slug]);
  if (!ru) throw new Error(`Missing Russian article: ${article.slug}`);
  const translations = { ...article.translations, "zh-TW": article.traditionalTranslation ?? applyReplacements(traditionalTranslation(article.translations.zh), article.zhTwReplacements), ru };
  return { ...article, updatedAt: article.updatedAt > "2026-09-14" ? article.updatedAt : "2026-09-14", translations: article.pillar ? { ...translations, en: withDayPillarPeople(translations.en, article.pillar, "en"), zh: withDayPillarPeople(translations.zh, article.pillar, "zh") } : translations };
})];

export function journalAlternates(slug?: string): Record<string, string> {
  return Object.fromEntries([
    ...journalArticleLocales(getJournalArticle(slug ?? "")).map((locale) => [journalLanguageTags[locale], journalHref(locale, slug)]),
    ["x-default", journalHref("en", slug)],
  ]);
}

export function getJournalArticle(slug: string) {
  return journalArticles.find((article) => article.slug === slug);
}

export function journalArticleLocales(article?: { availableLocales?: readonly JournalLocale[]; slug?: string }): readonly JournalLocale[] {
  return article?.availableLocales ?? journalLocales;
}

export function journalArticleLocale(locale: JournalLocale, article?: JournalArticle): JournalLocale {
  return journalArticleLocales(article).includes(locale) ? locale : "en";
}

export function journalMetadata(locale: JournalLocale, article?: JournalArticle): Metadata {
  locale = journalArticleLocale(locale, article);
  const copy = article?.translations[locale];
  const title = copy?.title ?? journalUi[locale].title;
  const description = copy?.description ?? journalUi[locale].description;
  const canonical = journalHref(locale, article?.slug);
  const images = [article?.image ? { url: article.image.src, width: article.image.width, height: article.image.height, alt: title } : article?.pillar ? getPillarImagePath(article.pillar) : "/opengraph-image"];
  return {
    title: { absolute: `${title} | ${siteName}` },
    description,
    alternates: { canonical, languages: journalAlternates(article?.slug) },
    openGraph: { type: article ? "article" : "website", title, description, url: canonical, siteName, images, locale: journalOgLocales[locale], alternateLocale: journalArticleLocales(article).filter((other) => other !== locale).map((other) => journalOgLocales[other]), ...(article ? { publishedTime: article.publishedAt, modifiedTime: editorialModifiedAt(article.slug, locale, article.updatedAt) } : {}) },
    twitter: { card: "summary_large_image", title, description, images },
    robots: { index: true, follow: true },
  };
}

export function dayPillarLibraryMetadata(locale: JournalLocale): Metadata {
  const copy = pillarLibraryCopy(locale);
  return { title: { absolute: `${copy.title} | ${siteName}` }, description: copy.description, alternates: { canonical: pillarLibraryHref(locale), languages: journalAlternates("day-pillars") }, openGraph: { type: "website", title: copy.title, description: copy.description, url: pillarLibraryHref(locale), locale: journalOgLocales[locale], images: [getPillarImagePath("甲子")] }, twitter: { card: "summary_large_image", title: copy.title, description: copy.description, images: [getPillarImagePath("甲子")] }, robots: { index: true, follow: true } };
}

export function journalArticleSchema(article: JournalArticle, locale: JournalLocale) {
  const copy = article.translations[locale];
  const url = absoluteUrl(journalHref(locale, article.slug));
  const home = absoluteUrl(journalHomeHref(locale));
  const originalCitations = copy.sections.flatMap(section => section.sources?.map(source => source.href.startsWith("/") ? absoluteUrl(source.href) : source.href) ?? []);
  const birthdayCitations = [...new Set(copy.sections.flatMap(section => section.people?.flatMap(person => person.sources.map(source => source.url)) ?? []))].filter(href => !originalCitations.includes(href));
  return [
    { "@context": "https://schema.org", "@type": "Article", "@id": `${url}#article`, headline: copy.title, description: copy.description, mainEntityOfPage: url, inLanguage: journalLanguageTags[locale], datePublished: article.publishedAt, dateModified: editorialModifiedAt(article.slug, locale, article.updatedAt), ...(article.image ? { image: [absoluteUrl(article.image.src)] } : article.pillar ? { image: [absoluteUrl(getPillarImagePath(article.pillar))] } : {}), ...(article.about ? { about: { ...article.about, ...(article.about.image ? { image: absoluteUrl(article.about.image) } : {}) } } : {}), author: { "@type": "Organization", name: siteName, url: absoluteUrl("/") }, publisher: { "@type": "Organization", name: siteName, url: absoluteUrl("/") }, citation: [...originalCitations, ...birthdayCitations], isAccessibleForFree: true },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: journalUi[locale].home, item: home }, { "@type": "ListItem", position: 2, name: journalUi[locale].journal, item: absoluteUrl(journalHref(locale)) }, { "@type": "ListItem", position: 3, name: copy.title, item: url }] },
  ] as const;
}
