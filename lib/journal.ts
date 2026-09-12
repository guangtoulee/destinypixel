import type { Metadata } from "next";
import { absoluteUrl, siteName } from "@/lib/seo";
import { dayPillarIntroduction } from "@/lib/journal-day-pillar";

export type JournalLocale = "en" | "zh";
export type JournalSection = {
  id: string;
  title: string;
  paragraphs: string[];
  steps?: string[];
  table?: { headings: string[]; rows: string[][] };
  sources?: { label: string; href: string }[];
};
export type JournalTranslation = {
  title: string;
  description: string;
  topic: string;
  introduction: string;
  takeaway: string;
  sections: JournalSection[];
  action: { label: string; href: string };
};
export type JournalArticle = {
  slug: string;
  publishedAt: string;
  updatedAt: string;
  translations: Record<JournalLocale, JournalTranslation>;
};

export const journalArticles: JournalArticle[] = [
  dayPillarIntroduction,
  {
    slug: "prepare-birth-date-time-place",
    publishedAt: "2026-09-11",
    updatedAt: "2026-09-11",
    translations: {
      en: {
        title: "Before your birth chart: prepare the date, time and place",
        description: "A practical birth-chart checklist: recorded local time, birthplace, daylight-saving uncertainty and what DestinyPixel currently does with your input.",
        topic: "Birth map essentials",
        introduction: "A useful first birth chart starts with a clear record. If the date is ambiguous, the time is a family estimate, or the city belongs to a different time zone, a beautifully written interpretation cannot resolve those uncertainties. This guide helps you prepare one consistent set of birth details for DestinyPixel, understand the current time calculation, and keep the result in proportion to the information you actually have.",
        takeaway: "Keep the original local date and time, select the actual birthplace, and record uncertainty. Date-specific time-zone rules are applied automatically; repeated or skipped clock times need further verification.",
        sections: [
          {
            id: "original-record",
            title: "1. Start with the original record",
            paragraphs: ["Look for a birth certificate or a contemporaneous hospital record if one is available to you. Write down the time exactly as recorded, including whether it uses a 12-hour or 24-hour clock. A remembered “around breakfast” is still useful family history, but it should not quietly become an exact 08:00 in your notes.", "Separate what the record says from your interpretation of it. Keep a note such as “07:40, copied from certificate” or “between 07:00 and 08:00, family recollection.” You do not need to upload the document to use the birth form. The aim is an accurate input record, not a collection of private paperwork."],
            table: {
              headings: ["Detail", "What to check"],
              rows: [["Date", "Year, month and day; confirm which calendar the record uses."], ["Time", "Hours and minutes, AM/PM if relevant, and whether it is estimated."], ["Place", "Birth city and country, rather than your current home."], ["Time uncertainty", "Any known daylight-saving or clock-change issue at that date."]],
            },
          },
          {
            id: "local-clock",
            title: "2. Keep the clock time attached to its place",
            paragraphs: ["For this form, start from the recorded local civil date and time in the birthplace. Do not convert a New York birth into Beijing time because you now live in China, or change a London birth into the time on your present phone. Do not pre-adjust it to solar time either: DestinyPixel applies its own correction after submission.", "If a record uses a lunar calendar date, first obtain a verified Gregorian equivalent and retain both versions in your notes. The current form expects a Gregorian calendar date; it has no lunar-calendar toggle. If an AM/PM conversion crosses midnight, check the date as well as the hour instead of treating them as unrelated fields."],
          },
          {
            id: "time-limits",
            title: "3. Separate civil time, solar time and the sky",
            paragraphs: ["Civil time and solar time answer different questions. Civil time follows a place’s clock rules. A solar-time correction accounts for longitude and the changing relationship between the Sun and a uniform clock. NOAA’s solar equations separate these terms; a longitude correction alone cannot resolve the civil-time offset.", "DestinyPixel uses the selected city’s IANA time zone and birth date to obtain the UTC instant, including historical offsets and daylight saving. Its Bazi model separately applies longitude and an approximate equation of time to produce a solar clock. Planetary longitudes use the UTC instant and Astronomy Engine’s geocentric calculations; they do not use that solar-clock label as UTC. Year and month change at precise LiChun/Jie instants; the solar-clock day changes at midnight. These calculations do not validate the symbolic interpretation. The supported calculation range is 1800–2100.", "If clocks jumped forward or repeated an hour, the form rejects a nonexistent or ambiguous time. It cannot yet choose between the two occurrences of a repeated time. Keep the original record, investigate the ambiguity and contact us before continuing. Do not silently subtract an hour or alter a valid record to bypass the check. Historical records and time-zone data can still contain uncertainty, so unusual cases deserve an independent check."],
            sources: [{ label: "IANA: what the Time Zone Database records", href: "https://www.iana.org/time-zones" }, { label: "NOAA: general solar-position equations (PDF)", href: "https://gml.noaa.gov/grad/solcalc/solareqns.PDF" }, { label: "Astronomy Engine: time and geocentric coordinates", href: "https://github.com/cosinekitty/astronomy/tree/master/source/js" }, { label: "Lunar library: Four Pillars boundary conventions", href: "https://6tail.cn/calendar/lunar.ganzhi.html" }],
          },
          {
            id: "city-choice",
            title: "4. Select a supported birthplace deliberately",
            paragraphs: ["Choose the full matching city from the suggestions, including its country. The current list is limited. Typing an unlisted town does not create a new location with verified coordinates, and selecting a familiar city in another country changes the assumptions behind the result.", "If your birthplace is absent, stop short of calling a nearby-city result precise. Keep a note of the actual place and the substitute if you make an exploratory comparison. Requesting support for the missing location is more useful than disguising a substitute as the original record."],
          },
          {
            id: "unknown-time",
            title: "5. Keep uncertainty visible when you read",
            paragraphs: ["The birth map asks for a time, and this version does not offer an unknown-time calculation. If you do not know it, the Question Oracle or bracelet atelier lets you explore without inventing a birth hour. A noon placeholder is a placeholder, not a recovered fact.", "With a documented time range, comparing the endpoints can reveal whether the displayed structure changes. Label the comparison as a sensitivity exercise. It cannot determine which birth time is correct, and identical output does not prove that all intermediate assumptions are accurate."],
          },
          {
            id: "first-reading",
            title: "6. Make one reproducible first reading",
            paragraphs: ["Before generating, review the complete date, time, selected city and the form’s gender option. Keep those choices consistent if you compare the birth map with Birth Totem; changing several fields at once makes differences difficult to understand.", "Begin your review with the input details and displayed calculation, then move to the symbolic interpretation. Pick one theme and compare it with a specific experience rather than accepting the whole description as a verdict. DestinyPixel’s animal archetypes and Birth Totem are interpretive visual systems. Clear inputs make an experiment easier to reproduce; they do not turn a symbolic reading into evidence about your abilities or future."],
          },
        ],
        action: { label: "Prepare a birth map", href: "/#report" },
      },
      zh: {
        title: "排盘之前：把出生日期、时间和地点准备清楚",
        description: "出生资料核对指南：当地钟表时间、出生地、夏令时的不确定性，以及 DestinyPixel 当前时间换算的实际边界。",
        topic: "出生图谱入门",
        introduction: "第一次排盘，先把资料弄清楚，比先读一段漂亮的解释更有帮助。日期是否换过历法、几点是家人口述还是原始记录、选择的城市是否就是出生地，都会影响后续判断。这篇指南帮助你建立一份能够复核的输入资料，并理解 DestinyPixel 当前时间计算能做什么、还有哪些限制。",
        takeaway: "保留出生地当时记录的日期和钟表时间，选择真实出生城市，并注明不确定之处。工具会按出生日期应用时区规则，重复或不存在的钟表时间则需要额外核实。",
        sections: [
          {
            id: "original-record",
            title: "1. 先找原始记录，再写自己的判断",
            paragraphs: ["如果手边有出生证明或当年的医院记录，先逐字核对年月日、时分，以及记录采用十二小时制还是二十四小时制。家人记得“早饭前后”也是有价值的信息，但不要在没有依据时把它变成精确的 08:00。", "把记录和推断分开保存，例如“07:40，来自出生证明”或“07:00—08:00，家人口述”。使用出生表单不需要上传证明文件；你需要的是一份准确的输入笔记，而不是把私人证件交给工具。"],
            table: { headings: ["资料", "核对内容"], rows: [["日期", "完整年月日，以及原始记录采用的历法。"], ["时间", "时、分、上午或下午，是否只是估计。"], ["地点", "出生城市和国家，而不是现在居住的城市。"], ["时间疑问", "该日期是否可能涉及夏令时或历史调钟。"]] },
          },
          {
            id: "local-clock",
            title: "2. 时间应当跟着出生地走",
            paragraphs: ["填写时，以出生地当时记录的当地民用日期和钟表时间为起点。不要因为现在住在中国，就把纽约出生时间换成北京时间；也不要把伦敦的记录改成当前手机显示的时区。无需先做太阳时校正，工具会在提交后执行自己的换算。", "原始资料如果写的是农历，先核实对应的公历日期，并把两种日期都保留在笔记里。当前表单接收公历日期，没有农历切换选项。处理上午、下午或跨过午夜的时间时，日期也必须一起检查，不能只改小时。"],
          },
          {
            id: "time-limits",
            title: "3. 区分民用时间、太阳时与实际星空",
            paragraphs: ["民用时间遵循当地钟表制度；太阳时修正则涉及经度，以及太阳运行与均匀钟表时间之间的差异。NOAA 的太阳位置计算将这些因素分开处理。仅凭经度修正，无法确定出生地当时采用的民用时差。", "DestinyPixel 按所选城市的 IANA 时区和出生日期换算 UTC 时刻，包含历史时差与夏令时。八字模型另外应用经度修正和近似均时差，得到太阳时钟。行星黄经则使用 UTC 时刻与 Astronomy Engine 的地心计算，不会把校正后的太阳时标签当作 UTC。年柱、月柱分别在立春和十二节的准确时刻切换；日柱采用当地太阳时午夜换日。这些计算不会为象征性解读提供科学证明。目前支持的计算年份为 1800—2100 年。", "如果记录落在调钟跳过或重复的时段，表单会拒绝这个不存在或含糊的时间。目前暂不能在重复时段的两个实际时刻之间选择。请保留原始记录，核实歧义并联系我们，再继续尝试；不要悄悄减去一小时，也不要为了通过校验改掉有效记录。历史记录和时区数据仍可能存在不确定性，特殊情况值得另行核对。"],
            sources: [{ label: "IANA：时区数据库记录哪些规则", href: "https://www.iana.org/time-zones" }, { label: "NOAA：太阳位置计算公式（PDF）", href: "https://gml.noaa.gov/grad/solcalc/solareqns.PDF" }, { label: "Astronomy Engine：时间与地心坐标", href: "https://github.com/cosinekitty/astronomy/tree/master/source/js" }, { label: "Lunar 历法库：四柱交界约定", href: "https://6tail.cn/calendar/lunar.ganzhi.html" }],
          },
          {
            id: "city-choice",
            title: "4. 从建议列表中选对出生城市",
            paragraphs: ["选择带有国家信息的完整城市名称。当前支持的城市有限，输入一个没有收录的县镇，不会自动建立经过核实的新坐标。选择另一个国家里熟悉的城市，也会改变结果的前提。", "如果真实出生地不在列表里，不要把邻近城市的试算说成精确排盘。确实要做探索性比较时，在自己的笔记中写明实际出生地和替代城市。反馈需要支持的地点，比把替代信息当成原始记录更有帮助。"],
          },
          {
            id: "unknown-time",
            title: "5. 不知道几点，就保留这个“不知道”",
            paragraphs: ["出生图谱要求填写时间，当前没有“不知道出生时刻”的计算模式。可以先用问事专区或手串工坊，不必为了进入页面编一个出生小时。填写中午十二点只是设定了一个占位值，不是找回了事实。", "若原始资料给出了可信的时间范围，可以比较范围两端的展示结构是否变化，并注明这只是敏感性比较。它不能反向证明哪个时刻正确；两个结果相同，也不代表中间所有时间假设都已经准确。"],
          },
          {
            id: "first-reading",
            title: "6. 完成一次可以复核的体验",
            paragraphs: ["生成前，把日期、时间、所选城市和表单中的性别选项一起检查。比较出生图谱与本命灵构时，保持这组资料一致，避免同时改动多个字段后不知道差异从哪里来。", "先查看输入资料和显示的计算，再读象征性解释。选出一个主题，用自己的一段具体经历去对照，而不是接受整篇文字作为定论。DestinyPixel 的动物原型和本命灵构是解释与视觉表达系统。清楚的输入让体验更容易复现，并不会让象征性解读变成对能力或未来的证明。"],
          },
        ],
        action: { label: "准备我的出生图谱", href: "/?locale=zh#report" },
      },
    },
  },
  {
    slug: "five-element-bracelet-design",
    publishedAt: "2026-09-11",
    updatedAt: "2026-09-11",
    translations: {
      en: {
        title: "Design a five-element bracelet: a practical color-and-bead walkthrough",
        description: "Build an 18-bead bracelet in DestinyPixel: choose a palette, arrange a repeat, understand element percentages and prepare a useful maker reference.",
        topic: "Five elements & design",
        introduction: "A bracelet becomes easier to design when you separate three choices: the feeling you want the colors to express, the pattern of beads, and the physical fit. DestinyPixel’s atelier gives you a board for the first two and preset counts to explore the third. You can use it without a birth report. Here is a complete example, from a simple color intention to an image you can discuss with a maker.",
        takeaway: "Use the five elements as a symbolic palette. The balance percentages count your selected beads; they do not measure personal energy or establish a physical wrist size.",
        sections: [
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
        title: "五行手串怎么配：从配色到十八颗珠子的完整练习",
        description: "在 DestinyPixel 手串工坊完成十八颗珠子的配色练习：选择材质、建立重复节奏、读懂五行比例，再整理给制作者的参考资料。",
        topic: "五行与设计",
        introduction: "把手串设计拆成三件事，会容易得多：希望颜色表达什么、珠子怎样排列、实物戴起来是否合适。DestinyPixel 手串工坊提供配色与排列画板，也提供可探索的颗数预设。你不需要先生成出生报告。下面用一个完整例子，从一句配色意图走到可以与制作者沟通的设计参考。",
        takeaway: "把五行当作象征性配色语言。画面的比例统计的是已选珠子，不是个人能量，也不能直接确定实物腕围。",
        sections: [
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
  return value === "zh" ? "zh" : "en";
}

export function journalHref(locale: JournalLocale, slug?: string) {
  const path = slug ? `/journal/${slug}` : "/journal";
  return locale === "zh" ? `${path}?locale=zh` : path;
}

export function getJournalArticle(slug: string) {
  return journalArticles.find((article) => article.slug === slug);
}

export function journalMetadata(locale: JournalLocale, article?: JournalArticle): Metadata {
  const copy = article?.translations[locale];
  const title = copy?.title ?? (locale === "zh" ? "玄学与日常：出生图谱、五行与手串指南" : "Journal: Birth Charts, Five Elements & Everyday Practice");
  const description = copy?.description ?? (locale === "zh" ? "阅读 DestinyPixel 原创中英文指南，核对出生资料、理解工具边界，把五行象征转化为可以动手尝试的设计。" : "Original DestinyPixel guides to preparing birth details, understanding symbolic tools and exploring five-element bracelet design.");
  const canonical = journalHref(locale, article?.slug);
  return {
    title: { absolute: `${title} | ${siteName}` },
    description,
    alternates: { canonical, languages: { en: journalHref("en", article?.slug), "zh-Hans": journalHref("zh", article?.slug), "x-default": journalHref("en", article?.slug) } },
    openGraph: { type: article ? "article" : "website", title, description, url: canonical, siteName, images: ["/opengraph-image"], locale: locale === "zh" ? "zh_CN" : "en_US", ...(article ? { publishedTime: article.publishedAt, modifiedTime: article.updatedAt } : {}) },
    twitter: { card: "summary_large_image", title, description, images: ["/opengraph-image"] },
    robots: { index: true, follow: true },
  };
}

export function journalArticleSchema(article: JournalArticle, locale: JournalLocale) {
  const copy = article.translations[locale];
  const url = absoluteUrl(journalHref(locale, article.slug));
  const home = absoluteUrl(locale === "zh" ? "/?locale=zh" : "/");
  return [
    { "@context": "https://schema.org", "@type": "Article", "@id": `${url}#article`, headline: copy.title, description: copy.description, mainEntityOfPage: url, inLanguage: locale === "zh" ? "zh-Hans" : "en", datePublished: article.publishedAt, dateModified: article.updatedAt, author: { "@type": "Organization", name: siteName, url: absoluteUrl("/") }, publisher: { "@type": "Organization", name: siteName, url: absoluteUrl("/") }, citation: copy.sections.flatMap((section) => section.sources?.map((source) => source.href) ?? []), isAccessibleForFree: true },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: locale === "zh" ? "首页" : "Home", item: home }, { "@type": "ListItem", position: 2, name: locale === "zh" ? "文章" : "Journal", item: absoluteUrl(journalHref(locale)) }, { "@type": "ListItem", position: 3, name: copy.title, item: url }] },
  ];
}
