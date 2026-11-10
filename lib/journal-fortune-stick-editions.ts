import type { JournalSourceArticle, JournalTranslation } from "./journal";

const committee = "https://www.ctc.org.hk/chim-search/";
const guanyinOne = "https://www.ctc.org.hk/chim/%E8%A7%80%E9%9F%B3%E7%B1%A4-%E7%AC%AC%E4%B8%80%E7%B1%A4/";
const wongOne = "https://taonet.siksikyuen.org.hk/StickEnquiry/1/zh-TW";

// Existing article, substantively revised from observed search questions on 2026-11-10.
// Official pages identify the examples; the lookup method and explanations are our own.
export const fortuneStickEditionsArticle: JournalSourceArticle = {
  slug: "fortune-stick-number-and-edition",
  relatedSlug: "how-to-ask-fortune-sticks",
  publishedAt: "2026-09-20",
  updatedAt: "2026-11-10",
  zhTwReplacements: [["簽", "籤"], ["鐘離", "鍾離"]],
  translations: {
    en: {
      title: "Guanyin Fortune Stick Versions: Find the Poem Behind Your Number",
      description: "Match your Guanyin fortune-stick number to its poem and edition. Learn how a temple-text lookup differs from an online draw or a temple visit.",
      topic: "Find your fortune-stick text",
      introduction: "You bring home a fortune slip, search its number and find three different answers. One mentions an ancient scholar; another promises a reunion; a third gives a poem that is not on your paper. Before choosing the answer you like best, identify the text. The useful question is: which collection and edition does this number belong to? If you have not drawn a stick yet, start by choosing the experience you want. Looking up a temple slip, taking a new online draw and participating in a temple ritual call for different steps; section 6 helps you choose.",
      takeaway: "A number is an address inside a collection, not a universal meaning. Match the source, collection, number and actual words before reading an explanation.",
      sections: [
        {
          id: "step-1", title: "1. Keep four details from your temple slip",
          paragraphs: ["A search for “fortune stick 33” leaves out the information most likely to identify your result. Record the following details while you still have the paper. A private note is enough; you do not need to publish a photograph or your personal question."],
          table: { headings: ["Detail", "What to keep"], rows: [
            ["Source", "Temple name, city, booklet or publisher printed on the slip."],
            ["Collection", "The named tradition: for example Guanyin, Guandi or Wong Tai Sin."],
            ["Number", "The number exactly as printed; keep any additional characters beside it."],
            ["Text", "The opening line, followed by the full verse if available; also note its story title."],
          ] },
        },
        {
          id: "step-2", title: "2. Why are there different Guanyin fortune-stick versions?",
          paragraphs: ["Hong Kong’s Chinese Temples Committee explicitly describes differences among circulating Guanyin texts. Its editorial introduction presents its revisions as a reference that supplements existing versions, rather than a replacement for every local edition.", "That distinction matters when searching for a reading of 100 Chinese fortune sticks: “100” tells you a collection’s size, not which text you hold. Even the same deity’s name does not establish an identical edition. Check the actual wording and named source. A spelling change, a different story heading and an entirely different poem are different kinds of mismatch; do not treat them all as either proof of fraud or harmless translation."],
          sources: [{ label: "Chinese Temples Committee: editorial note on versions (Chinese)", href: committee }],
        },
        {
          id: "step-3", title: "3. A real example: two collections, both numbered one",
          paragraphs: ["Compare the official pages below. The Chinese Temples Committee’s Guanyin No. 1 names Zhongli’s attainment of the Dao; Sik Sik Yuen’s Wong Tai Sin No. 1 names Lord Jiang’s appointment. Their number matches, but their collection, story heading and verse do not. These are two collections, not two translations of a single poem.", "This comparison is an identification exercise, not a ranking of temples or an interpretation of your own draw. Open the source pages to compare the complete wording. If your slip says Guanyin, a search result for Wong Tai Sin No. 1 cannot establish its meaning merely because it has the same number."],
          table: { headings: ["Published collection", "No. 1 story heading"], rows: [
            ["Chinese Temples Committee · Guanyin", "鍾離成道 · Zhongli attains the Dao"],
            ["Sik Sik Yuen · Wong Tai Sin", "姜公封相 · Lord Jiang is appointed"],
          ] },
          sources: [{ label: "Official Guanyin No. 1 (Chinese)", href: guanyinOne }, { label: "Official Wong Tai Sin No. 1 (Chinese)", href: wongOne }],
        },
        {
          id: "step-4", title: "4. What to do when the online poem does not match",
          paragraphs: ["Search the temple or collection name together with the number and an exact phrase from your paper. If you cannot type Chinese, ask someone to transcribe a short line; keep the original image so a mistaken character can be checked. Image-to-text software may help with transcription, but its output still needs comparison with the paper."],
          steps: [
            "Same verse, different explanation: you may have found different interpretations. Read the full text and compare how each explanation uses it.",
            "Similar verse, a few changed characters: note the differences and check each edition’s source. Do not quietly merge them into a new original.",
            "Different verse, same number: check the collection and edition again. Do not substitute one poem for the other.",
            "Only the number survives: ask the issuing temple or consult its booklet if possible. Without more details, the original text remains unidentified.",
          ],
        },
        {
          id: "step-5", title: "5. Once it matches, how do you read the fortune-stick poem?",
          paragraphs: ["Read the whole verse before jumping to its fortune grade or a modern headline. First describe what happens in its imagery. Then look for a change, a condition or an action: does the scene turn, does someone wait, does help arrive? Next read the accompanying story or commentary from that edition. A title can point to cultural context that a literal translation misses.", "Only then connect it with your question. For a job decision, for example, separate what the text actually says from what you need to check with an employer. Write three short notes: the image in the poem, your possible interpretation, and one fact still unknown. This is our reading exercise, not a temple’s prescribed ritual. An auspicious label is not a percentage chance of success, and a difficult image does not establish that something bad will happen."],
        },
        {
          "id": "step-6",
          "title": "6. Is an online draw the same as a temple draw?",
          "paragraphs": [
            "An online lookup retrieves a text; an online draw selects a new result; a temple visit lets you participate in that place’s practice. The Chinese Temples Committee’s number-search archive, for example, lets you consult its published texts. Opening an archived poem does not perform a new draw. Decide which task you need before choosing a website or interpreting a number.",
            "For a new draw on DestinyPixel, choose a collection and topic in the fortune-stick tool, then use the draw button. The browser randomly selects a number from that collection’s range and displays its existing entry. Your question is not used to choose the number, and AI does not draw it. The optional AI button comes afterward: it connects the displayed entry with the topic and question you supply. You can read the entry and source note without requesting AI. More context can make the explanation more relevant, but does not establish greater predictive accuracy.",
            "If you already have a temple slip, keep it as your reference. Suppose it says Guanyin No. 33 and an online page shows different words. Drawing another online number will not identify the original poem. Use the text-matching checklist, then the number-lookup steps if you want to compare DestinyPixel’s entry. The first task is to establish which text you have, not to get a more reassuring answer. This is a hypothetical lookup example, not a quotation from a particular No. 33 or a report of a reader’s result.",
            "For an in-person ritual, consult the chosen temple’s own visitor guidance or ask its staff about its procedure. This guide does not prescribe a universal sequence, confirmation method or number of repetitions. DestinyPixel is an independent symbolic experience, not that temple’s remote service or a complete temple edition. These practical distinctions do not decide what religious meaning someone gives to a draw; they tell you what each activity and source can actually establish."
          ],
          "table": {
            "headings": [
              "What you want",
              "Where to start"
            ],
            "rows": [
              [
                "Read a slip you already hold",
                "Use the issuing temple’s archive or booklet. Match collection, number and wording; keep any mismatch unresolved until you can check the source."
              ],
              [
                "Take a new online draw",
                "Choose a tool that identifies its collection and text sources. On DestinyPixel, draw first, read the source note, then optionally request a contextual AI explanation."
              ],
              [
                "Participate at a temple",
                "Follow that temple’s current guidance. Keep the issued slip and source details if you later want to look up or discuss its text."
              ]
            ]
          },
          "links": [
            {
              "text": "fortune-stick tool",
              "href": "/sticks"
            },
            {
              "text": "text-matching checklist",
              "href": "#step-4"
            },
            {
              "text": "number-lookup steps",
              "href": "#step-7"
            }
          ],
          "sources": [
            {
              "label": "Chinese Temples Committee: published-text lookup (Chinese)",
              "href": "https://www.ctc.org.hk/chim-search/"
            }
          ]
        },
        {
          id: "step-7", title: "7. How to look up a number on DestinyPixel",
          paragraphs: ["Open the fortune-stick tool. Its ranges are 1–100 for Guanyin, Guandi and Wong Tai Sin, and 1–60 for Yuelao and the Wealth Gods. These are product ranges, not a claim about every temple. The library includes selected traditional material and original modern reflections; it is not a complete edition of 100 traditional Guanyin poems.", "Checking an existing number does not require a new draw or an AI request. A translated interface also does not guarantee a line-by-line translation: some language views use a modern adaptation where the Chinese view contains a traditional text. If an exact temple translation is your aim, compare the source before treating the language switch as one."],
          links: [{ text: "fortune-stick tool", href: "/sticks" }],
          steps: [
            "Choose the named collection before entering the number.",
            "Expand “Already drew offline?” and enter a whole number within the displayed range.",
            "Select “Find this stick”, then read the entry and its “Source note”.",
            "Compare the displayed text with your slip. A matching number retrieves our entry; it does not authenticate your paper.",
          ],
        },
        {
          id: "step-8", title: "8. What can the optional AI explanation add?",
          paragraphs: ["The AI button relates the displayed entry to the topic and question you supply. It does not retrieve an unseen temple booklet or inspect the slip in your hand. If the entry is a modern reflection, the explanation remains an interpretation of that reflection. When two texts differ, AI fluency cannot close the source gap.", "After identifying your text, keep a note of its source, the question and one thing to examine in real life. If you are preparing a fresh question, our question-writing guide offers examples. Product facts explains the scope of the tools. This guide’s checklist and reading method are original DestinyPixel editorial work with AI assistance; the official links support the named source examples, not an endorsement of this website."],
          links: [{ text: "question-writing guide", href: "/journal/how-to-ask-fortune-sticks" }, { text: "Product facts", href: "/product-facts" }],
          sources: [{ label: "DestinyPixel: collections and source notes", href: "/sticks" }, { label: "Guanyin tool overview and lookup limits", href: "/learn/guanyin-fortune-sticks" }],
        },
      ],
      action: { label: "Choose a collection and look up your number", href: "/sticks" },
    },
    zh: {
      title: "观音灵签版本为什么不同？按签号查签前，先认准手里这首诗",
      description: "同一个观音签号为什么有不同签诗？用官方实例核对签系与版本，再区分网上抽签、查寺庙签文和现场求签，选对下一步。",
      topic: "找到手里这首签",
      introduction: "带回一张签纸，按号码一搜，却找到三种答案：一页说古人求学，一页说感情重逢，另一页连诗句都和纸上不同。先别挑最顺耳的解释，先认准文字。真正需要问的是：这个号码属于哪个签系、哪个版本？ 如果还没抽签，可以先想清楚自己要做什么。查手里的寺庙签纸、在线新抽一支签、到寺庙参与仪式，所需步骤并不相同；第6节提供了选择路线。",
      takeaway: "签号是某套签中的位置，不是通用答案。先核对来源、签系、号码和实际诗句，再读解释。",
      sections: [
        {
          id: "step-1", title: "1. 从签纸上留下四项信息",
          paragraphs: ["只搜“第33签”，会漏掉最能辨认原签的信息。趁纸签还在手里，记下这四项。自己保留笔记就够了，不需要公开照片，也不用把私人问题发到网上。"],
          table: { headings: ["信息", "应该保留什么"], rows: [
            ["来源", "寺庙名称、所在城市，或签纸印着的书名、出版者。"],
            ["签系", "例如观音、关帝、黄大仙；照原纸记录。"],
            ["号码", "完整签号，以及旁边附带的其他文字。"],
            ["原文", "至少留下开头原句；能保留全诗更好，也记下典故题名。"],
          ] },
        },
        {
          id: "step-2", title: "2. 为什么观音灵签会有不同版本？",
          paragraphs: ["香港华人庙宇委员会在编订说明中明确提到，流传的观音签文字存在差异。其修订本是供参考、补充现有版本，并非用一个版本替代所有地方传本。", "因此，搜索“观音一百签”时，“一百”只是数量，不能独自证明是哪套文字。即使神明名称相同，也要比较诗句和标注来源。一个字的异文、典故题名不同、整首诗都不同，是三种不同的问题，不能一概认定是抄错，也不能都当成无关紧要的翻译差别。"],
          sources: [{ label: "华人庙宇委员会：签文版本编订说明", href: committee }],
        },
        {
          id: "step-3", title: "3. 一个真实对照：都叫第一签，内容却不同",
          paragraphs: ["下面两张官方页面可以直接对照：华人庙宇委员会的观音第一签题作“钟离成道”，啬色园的黄大仙第一签题作“姜公封相”。号码相同，但签系、典故题名和诗句都不同。这是两个签系，不是同一首诗的两种翻译。", "这个例子只示范如何辨认文字，不比较寺庙高下，也不是替你解读抽到的签。打开来源可以核对完整原文。如果纸上写的是观音签，不能因为搜索结果也是第一签，就用黄大仙那首诗来确定它的意思。"],
          table: { headings: ["发布方与签系", "第一签的典故题名"], rows: [
            ["华人庙宇委员会 · 观音签", "钟离成道"],
            ["啬色园 · 黄大仙签", "姜公封相"],
          ] },
          sources: [{ label: "官方观音第一签", href: guanyinOne }, { label: "官方黄大仙第一签", href: wongOne }],
        },
        {
          id: "step-4", title: "4. 网上找到的诗不一样，该怎么办？",
          paragraphs: ["搜索时把寺庙或签系名称、号码和一小段准确原句放在一起。不方便输入原字时，可以请人帮忙转录，并保留原图核对。识图取字也可能认错字，转换出的文字仍要与纸签比较。"],
          steps: [
            "诗句相同，解释不同：可能是不同人的解法。回到全诗，比较各自怎样从文字推到结论。",
            "诗句相近，少数字不同：记下异文，核对各自底本；不要悄悄拼出一首新的“原文”。",
            "号码相同，诗句完全不同：重新检查签系和版本，不要互相替代。",
            "只剩号码，其他信息都没有：尽可能询问发签的寺庙或查其签本；补不齐信息，就保留“原文尚未确定”。",
          ],
        },
        {
          id: "step-5", title: "5. 核对之后，签诗应该怎么读？",
          paragraphs: ["先读完整诗句，再看吉凶等级和现代标题。第一步描述意象里发生了什么；第二步找变化、条件和动作：局面是否转折，有人等待，还是有人来帮忙？然后读这个版本附带的典故、解曰。题名可能指向文化背景，只做逐字翻译容易漏掉这一层。", "最后才把它与问题联系起来。例如问一份工作，就区分“诗里写了什么”和“还需要向雇主核实什么”。分别记下诗中意象、自己的可能理解、一个仍然未知的事实。这是本站提供的阅读练习，不是声称所有寺庙都规定这样解签。上签不代表成功概率，下签的困难意象也不能证明坏事一定发生。"],
        },
        {
          "id": "step-6",
          "title": "6. 网上抽签和庙里求签，是一回事吗？",
          "paragraphs": [
            "按号查签是在找一段文字，在线抽签是在取得一个新结果，到庙里求签则是在参与当地的实践。例如，华人庙宇委员会的签号查询可以查阅其公布的签文；打开一篇签诗，并不等于重新抽了一支签。先分清自己想做哪件事，再选网站、读号码。",
            "想在DestinyPixel新抽一支签，可以打开抽签工具，选择签系与主题，再点击抽签。浏览器会在该签系的号段中随机选出一个号码，显示已有的对应条目。问题内容不参与选号，也不是AI替你挑签。可选AI按钮在这之后才使用：把当前条目与你提供的主题、问题联系起来。不请求AI，也能读条目和“签文来源”。补充处境可以让解释更贴近问题，不等于提高预测的准确性。",
            "如果已经拿到寺庙签纸，就把它留作核对依据。假设纸上写着观音第33签，但网上显示的文字不同，重新在网上抽一个号码，并不能帮你认出原诗。先看文字核对清单；想比较本站条目，再按查号步骤操作。此时要解决的是“我手里究竟是哪篇文字”，不用急着寻找更顺耳的答案。这是假设的查找情景，不引用某个版本第33签的内容，也不是用户应验故事。",
            "想参与现场仪式，就查看所选寺庙自己的访客指引，或向工作人员询问流程。本指南不规定通用的求签顺序、确认方式或重抽次数。DestinyPixel提供独立的象征体验，不是该庙的远程服务，也不收录每座庙的完整签本。这些实际区别不替读者判断求签的宗教意义，而是帮助确认自己正在做什么、所用资料能说明什么。"
          ],
          "table": {
            "headings": [
              "你想做什么",
              "从哪里开始"
            ],
            "rows": [
              [
                "读懂手里已有的签纸",
                "先找发签寺庙的资料库或签本，核对签系、号码和文字；有差异就保留疑问，继续查来源。"
              ],
              [
                "在线新抽一支签",
                "选择会说明签系与文字来源的工具。在本站先抽签、读来源说明，再按需请求结合问题的AI解释。"
              ],
              [
                "到寺庙参与求签",
                "按该庙当前指引操作。保留签纸与来源信息，方便之后查阅或请教原文。"
              ]
            ]
          },
          "links": [
            {
              "text": "抽签工具",
              "href": "/sticks?locale=zh"
            },
            {
              "text": "文字核对清单",
              "href": "#step-4"
            },
            {
              "text": "查号步骤",
              "href": "#step-7"
            }
          ],
          "sources": [
            {
              "label": "华人庙宇委员会：签文查询",
              "href": "https://www.ctc.org.hk/chim-search/"
            }
          ]
        },
        {
          id: "step-7", title: "7. 在本站怎样按号码查签？",
          paragraphs: ["打开抽签工具，观音、关帝、黄大仙可查1—100号，月老与财神可查1—60号。这些是本站产品的编号范围，不代表每座庙的安排。资料库包含部分传统材料和本站原创的现代签意，并不是完整的一百首传统观音签诗底本。", "查已有号码不必重新抽签，也不用先请求AI。切换语言不必然得到逐句翻译：部分条目的中文版显示传统文字，其他语言显示现代改写。若需要原纸签的准确译文，先对来源，不要把切换语言自动等同于翻译原文。"],
          links: [{ text: "抽签工具", href: "/sticks?locale=zh" }],
          steps: [
            "先选签系，再输入号码。",
            "展开“线下已经抽到签？”，在页面显示的范围内输入整数。",
            "点击“查这支签”，读结果和下方的“签文来源”。",
            "将显示文字与手中签纸比较。号码相同只表示找到了本站条目，不能认证原纸签。",
          ],
        },
        {
          id: "step-8", title: "8. 可选AI解读能补充什么？",
          paragraphs: ["AI按钮将当前显示的条目与你提供的主题、问题联系起来。它不会检索你未提供的寺庙签本，也不会查看你手里的纸。如果条目是现代签意，得到的仍是对这段现代文字的解读。两份文字不一致时，回答再流畅也不能补上来源缺口。", "认准文字后，保留来源、问题，以及准备在现实中核实的一件事。要开始新提问，可以看抽签提问指南；工具的实际范围见产品事实页。本篇核对表与阅读方法为DestinyPixel借助AI编写并编辑的原创内容；官方链接用于核对所举实例，不代表相关机构为本站背书。"],
          links: [{ text: "抽签提问指南", href: "/journal/how-to-ask-fortune-sticks?locale=zh" }, { text: "产品事实页", href: "/product-facts?locale=zh" }],
          sources: [{ label: "本站签系与来源说明", href: "/sticks?locale=zh" }, { label: "观音工具与查签范围（英文）", href: "/learn/guanyin-fortune-sticks" }],
        },
      ],
      action: { label: "选择签系，查阅对应号码", href: "/sticks?locale=zh" },
    },
  },
};

export const fortuneStickEditionsRussian: JournalTranslation = {
  title: "Версии жребиев Гуаньинь: как найти текст по номеру",
  description: "Как найти стих Гуаньинь по номеру и версии? Сверьте источник и узнайте, чем поиск храмового текста отличается от нового онлайн-жребия и посещения храма.",
  topic: "Как найти текст своего жребия",
  introduction: "Вы принесли из храма листок, ввели его номер в поиск и получили три разных ответа. На одной странице — древний учёный, на другой — обещание встречи, а на третьей даже стих не похож на ваш. Прежде чем выбирать приятное толкование, установите текст: к какому сборнику и изданию относится этот номер? Если вы ещё не тянули жребий, сначала выберите, что хотите сделать. Найти текст уже полученного листка, вытянуть новый жребий онлайн и принять участие в храмовом ритуале — разные задачи. Раздел 6 поможет выбрать следующий шаг.",
  takeaway: "Номер указывает место внутри сборника, а не универсальный смысл. Сначала сверьте источник, название сборника, номер и слова, затем читайте объяснение.",
  sections: [
    {
      id: "step-1", title: "1. Сохраните четыре детали с храмового листка",
      paragraphs: ["Запрос «жребий 33» не содержит самого важного для поиска исходного текста. Пока листок у вас, запишите четыре детали. Достаточно личной заметки: публиковать фотографию и свой вопрос не нужно."],
      table: { headings: ["Деталь", "Что сохранить"], rows: [
        ["Источник", "Название храма, город, книгу или издателя, указанных на листке."],
        ["Сборник", "Название традиции, например Гуаньинь, Гуаньди или Вонг Тай Син."],
        ["Номер", "Номер в исходном виде и дополнительные знаки рядом с ним."],
        ["Текст", "Первую строку, по возможности весь стих, а также название истории."],
      ] },
    },
    {
      id: "step-2", title: "2. Почему существуют разные версии жребиев Гуаньинь?",
      paragraphs: ["Комитет китайских храмов Гонконга прямо отмечает различия между распространёнными текстами Гуаньинь. Его редакционное предисловие представляет исправления как справочное дополнение к существующим версиям, а не замену всем местным изданиям.", "Поэтому «100 китайских палочек для гадания» обозначает размер сборника, но не устанавливает текст вашего листка. Даже одинаковое имя божества не подтверждает совпадение изданий. Сравните слова и указанный источник. Изменённый иероглиф, другое название истории и совершенно иной стих — разные случаи. Не стоит автоматически считать их ни обманом, ни несущественной особенностью перевода."],
      sources: [{ label: "Комитет китайских храмов: о версиях текста (на китайском)", href: committee }],
    },
    {
      id: "step-3", title: "3. Реальный пример: два сборника, один номер",
      paragraphs: ["Сравните официальные страницы ниже. Первый жребий Гуаньинь у Комитета китайских храмов связан с обретением Дао Чжунли; первый жребий Вонг Тай Сина на сайте Сик Сик Юэнь — с назначением Цзян-гуна. Номер одинаков, но сборник, название истории и стих различаются. Перед нами два сборника, а не два перевода одного стихотворения.", "Это пример установления источника, а не оценка храмов и не толкование вашего жребия. Полный текст доступен по ссылкам. Если на листке указан Гуаньинь, страница первого жребия Вонг Тай Сина не объясняет его только потому, что номер совпал."],
      table: { headings: ["Издатель и сборник", "История жребия № 1"], rows: [
        ["Комитет китайских храмов · Гуаньинь", "鍾離成道 · Чжунли обретает Дао"],
        ["Сик Сик Юэнь · Вонг Тай Син", "姜公封相 · Цзян-гун получает назначение"],
      ] },
      sources: [{ label: "Официальный жребий Гуаньинь № 1 (китайский)", href: guanyinOne }, { label: "Официальный жребий Вонг Тай Сина № 1 (китайский)", href: wongOne }],
    },
    {
      id: "step-4", title: "4. Что делать, если найденный стих не совпадает?",
      paragraphs: ["Ищите название храма или сборника вместе с номером и точной фразой с листка. Если не получается ввести китайские знаки, попросите помочь с короткой строкой и сохраните изображение для проверки. Программа распознавания текста тоже может ошибиться: её результат нужно сверить с бумагой."],
      steps: [
        "Один стих, разные объяснения: возможно, это разные интерпретации. Проверьте, как каждая опирается на полный текст.",
        "Похожие строки с отдельными отличиями: запишите различия и проверьте источники. Не соединяйте их незаметно в новый «оригинал».",
        "Один номер, совершенно разные стихи: снова проверьте сборник и издание. Не подменяйте один текст другим.",
        "Сохранился только номер: по возможности обратитесь в выдавший листок храм или к его книге. Без дополнительных сведений исходный текст остаётся неустановленным.",
      ],
    },
    {
      id: "step-5", title: "5. Как читать стих после проверки?",
      paragraphs: ["Прочитайте стих целиком, прежде чем переходить к оценке удачи или современному заголовку. Сначала опишите происходящее в его образах. Затем найдите изменение, условие или действие: поворачивается ли ситуация, кто-то ждёт или приходит помощь? После этого прочитайте историю и комментарий именно этого издания. Название может указывать на культурный контекст, который теряется при буквальном переводе.", "Лишь затем свяжите текст со своим вопросом. Например, при выборе работы отделите содержание стиха от сведений, которые ещё нужно получить у работодателя. Запишите образ, возможное прочтение и один неизвестный факт. Это наше упражнение для чтения, а не обязательный храмовый ритуал. Благоприятная оценка не означает численную вероятность успеха, а трудный образ не доказывает, что случится беда."],
    },
    {
      "id": "step-6",
      "title": "6. Онлайн-жребий и храмовый ритуал — одно и то же?",
      "paragraphs": [
        "Поиск по номеру позволяет найти текст, онлайн-жребий даёт новый результат, а посещение храма позволяет участвовать в его практике. Например, архив Комитета китайских храмов предоставляет доступ к опубликованным текстам по номеру. Открыть такой стих — не значит вытянуть новый жребий. Сначала определите свою задачу, затем выбирайте сайт и читайте результат.",
        "Чтобы вытянуть новый жребий на DestinyPixel, откройте инструмент жребиев, выберите сборник и тему, затем нажмите кнопку вытягивания. Браузер случайно выбирает номер в диапазоне этого сборника и показывает существующую запись. Текст вопроса не участвует в выборе номера, и ИИ его не выбирает. Необязательная кнопка ИИ используется после этого: объяснение связывает показанную запись с вашей темой и вопросом. Читать запись и примечание об источнике можно без ИИ. Дополнительные сведения помогают сделать объяснение уместнее, но не доказывают большей точности предсказания.",
        "Если у вас уже есть храмовый листок, сохраните его для сверки. Допустим, на нём указан жребий Гуаньинь № 33, а на сайте написаны другие слова. Новый онлайн-жребий не поможет установить исходный стих. Сначала используйте список проверки текста, а затем инструкцию поиска по номеру, если хотите сравнить запись DestinyPixel. Сейчас задача — установить текст, а не найти более приятный ответ. Это условный пример поиска, а не цитата из конкретной версии жребия № 33 и не история читателя.",
        "Для участия в ритуале на месте обратитесь к указаниям выбранного храма или спросите его сотрудников о порядке действий. Это руководство не задаёт единую для всех храмов последовательность, способ подтверждения или число повторений. DestinyPixel — независимый символический опыт, а не дистанционная услуга этого храма и не полное храмовое издание. Эти практические различия не определяют религиозный смысл жребия для читателя; они помогают понять, что именно вы делаете и что можно установить по источнику."
      ],
      "table": {
        "headings": [
          "Ваша задача",
          "С чего начать"
        ],
        "rows": [
          [
            "Прочитать уже полученный листок",
            "Найдите архив или книгу выдавшего его храма. Сверьте сборник, номер и слова; при расхождении сохраните вопрос открытым до проверки источника."
          ],
          [
            "Вытянуть новый жребий онлайн",
            "Выберите инструмент, который указывает сборник и источники. На DestinyPixel сначала вытяните жребий и прочитайте примечание, затем при желании запросите объяснение ИИ с учётом вопроса."
          ],
          [
            "Принять участие в храме",
            "Следуйте актуальным указаниям этого храма. Сохраните листок и сведения об источнике для дальнейшего поиска или обсуждения текста."
          ]
        ]
      },
      "links": [
        {
          "text": "инструмент жребиев",
          "href": "/sticks?locale=ru"
        },
        {
          "text": "список проверки текста",
          "href": "#step-4"
        },
        {
          "text": "инструкцию поиска по номеру",
          "href": "#step-7"
        }
      ],
      "sources": [
        {
          "label": "Комитет китайских храмов: поиск опубликованных текстов (китайский)",
          "href": "https://www.ctc.org.hk/chim-search/"
        }
      ]
    },
    {
      id: "step-7", title: "7. Как найти номер на DestinyPixel?",
      paragraphs: ["Откройте инструмент жребиев. Диапазоны сайта — 1–100 для Гуаньинь, Гуаньди и Вонг Тай Сина, 1–60 для Юэлао и богов богатства. Это устройство продукта, а не всех храмовых сборников. Библиотека содержит отдельные традиционные материалы и оригинальные современные размышления; она не является полным изданием ста традиционных стихов Гуаньинь.", "Для проверки номера не нужно тянуть новый жребий или обращаться к ИИ. Смена языка также не гарантирует построчный перевод: некоторые языковые версии используют современную адаптацию там, где китайская показывает традиционный текст. Если нужен точный перевод вашего листка, сначала сравните источники."],
      links: [{ text: "инструмент жребиев", href: "/sticks?locale=ru" }],
      steps: [
        "Сначала выберите сборник, затем вводите номер.",
        "Раскройте «Уже вытянули офлайн?» и введите целое число в указанном диапазоне.",
        "Нажмите «Найти жребий», прочитайте результат и примечание «Источник».",
        "Сверьте слова с листком. Одинаковый номер открывает нашу запись, но не подтверждает её тождество вашему документу.",
      ],
    },
    {
      id: "step-8", title: "8. Что добавляет необязательное объяснение ИИ?",
      paragraphs: ["Кнопка ИИ связывает показанную запись с указанными вами темой и вопросом. Она не находит невидимую храмовую книгу и не рассматривает листок у вас в руках. Если запись — современное размышление, ответ остаётся интерпретацией этого размышления. Уверенный язык ИИ не устраняет различия между исходными текстами.", "Установив текст, сохраните его источник, вопрос и один пункт для проверки в жизни. Для нового вопроса пригодится руководство по формулировке; факты о продукте описывают возможности инструментов. Этот список проверки и метод чтения — оригинальный редакционный материал DestinyPixel, подготовленный с помощью ИИ. Официальные ссылки подтверждают приведённые примеры источников, а не одобрение нашего сайта этими организациями."],
      links: [{ text: "руководство по формулировке", href: "/journal/how-to-ask-fortune-sticks?locale=ru" }, { text: "факты о продукте", href: "/product-facts?locale=ru" }],
      sources: [{ label: "DestinyPixel: сборники и примечания об источниках", href: "/sticks?locale=ru" }, { label: "Инструмент Гуаньинь и границы поиска (английский)", href: "/learn/guanyin-fortune-sticks" }],
    },
  ],
  action: { label: "Выбрать сборник и найти номер", href: "/sticks?locale=ru" },
};
