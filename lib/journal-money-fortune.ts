import type { JournalSourceArticle, JournalTranslation } from "./journal";

const editions: Record<"en" | "zh" | "ru", JournalTranslation> = {
  en: {
    title: "Chinese fortune sticks for money: how to read the meaning",
    description: "What does a money fortune stick mean? Read the imagery and source, work through an everyday expense example, and separate a symbolic reading from facts to verify.",
    topic: "Money questions & fortune sticks",
    answer: "A money fortune stick offers a symbolic reading of a money-related question. Its meaning depends on the actual text and collection. A number or a ‘Good’ label cannot establish how much money will arrive, when it will arrive, or whether a purchase will work out.",
    introduction: "An unexpected repair bill lands just as you were hoping to put some money aside. You draw a fortune stick and see an image of a guarded storehouse. Does that mean spend nothing, pay for the repair, or wait for a better offer? Start with the words on the result and the question you brought to it. This guide follows one everyday expense from an evocative image to a clearer question, without asking the image to supply a missing price or promise a result.",
    takeaway: "Keep four things separate: your question, the displayed text, your interpretation, and the facts still to check. A useful reading can help you notice the last of these.",
    sections: [
      {
        id: "money-meaning", title: "What does a fortune stick say about money?",
        paragraphs: [
          "‘Money’ is a broad topic. Waiting for a payment, deciding on an expense and wondering about a small business all involve money, but they need different information. A reading about patience may bring an overdue reply to mind; a storehouse image may make you think about what you already have. Those connections come from reading the text alongside your situation. They are not a universal code in which a boat means a transfer or a full granary means a particular amount.",
          "Read the whole entry, including its explanation and source note, before relying on the short fortune label. On DestinyPixel, Money is a question category, not a calculation of your finances. Choosing it does not supply the tool with your income, costs or account records. The tool does not use a BaZi or Chinese astrology birth chart to select your stick."
        ]
      },
      {
        id: "text-and-source", title: "Identify the text before interpreting the number",
        paragraphs: [
          "A Guanyin number and a Wealth Gods number do not identify the same entry. Even within a named tradition, check the actual wording. The Chinese Temples Committee describes its published versions as reference supplements, rather than a single text intended to replace all other versions. Its archive is a source for checking its own published text, not evidence that DestinyPixel reproduces it. Our guide to checking a fortune-stick number and edition walks through text matching.",
          "For the exercise below, we deliberately choose DestinyPixel’s Wealth Gods No. 33, titled ‘Guard The Storehouse’ in English and ‘守库生财’ in Chinese. Its source note identifies it as an internal wealth-oracle text. We use its idea of tending existing resources as a modern reading prompt. This is not a traditional temple quotation, a real person’s draw, or a report of a prediction coming true. The language editions are adaptations; they should not be treated as literal translations of an ancient original."
        ],
        sources: [{ label: "Chinese Temples Committee: edition and lookup notes (Chinese)", href: "https://www.ctc.org.hk/chim-search/" }],
        links: [{ text: "checking a fortune-stick number and edition", href: "/journal/fortune-stick-number-and-edition" }]
      },
      {
        id: "narrow-the-question", title: "Give the money question one clear object",
        paragraphs: [
          "‘Will I become rich?’ leaves almost every later event available as an answer. Name the particular situation, the part you are unsure about and the next point at which you need to act. You can keep amounts private. The purpose is to make the interpretation relevant to one question, not to increase a claimed prediction rate. These are original question-writing examples. The question-writing guide also covers love, work and family situations."
        ],
        table: {
          headings: ["Situation", "A question you can explore"],
          rows: [
            ["A payment has not arrived", "What am I assuming about this payment, and what still needs confirmation?"],
            ["An unexpected household expense", "What am I overlooking while comparing the repair and replacement options?"],
            ["A possible side project", "Which part of the proposed work or cost is still unclear to me?"]
          ]
        },
        links: [{ text: "question-writing guide", href: "/journal/how-to-ask-fortune-sticks" }]
      },
      {
        id: "repair-example", title: "A worked example: the repair quote and the storehouse",
        paragraphs: [
          "Imagine a broken washing machine. The repair estimate says 300; a replacement advertisement says 520, in the same currency. Neither figure has been confirmed as the total price. You are drawn to the lower number, but you are also tired of arranging repairs. This is an invented example, not a recommended budget or an actual customer’s situation.",
          "The question is: ‘What am I overlooking while comparing these two options?’ Reading our chosen storehouse entry, you might write: ‘I want to look after what I have, and I may be confusing the first quoted price with the complete cost.’ That is your interpretation. Someone else might notice their fear of letting go of an old appliance. Neither interpretation establishes whether the machine can be repaired reliably.",
          "Now give the reflection a practical destination. Ask the repairer what the estimate includes, whether inspection, parts and labour are included, and what happens if the identified repair does not resolve the fault. Ask the seller which delivery, installation or removal charges apply to the advertised replacement. These questions seek information from the people who can confirm it. The reading cannot answer them on their behalf.",
          "Suppose the repairer later clarifies the scope, or the seller confirms an extra charge. Record that new information beside the original question. It may change your comparison; it does not show that the stick predicted the charge. You still choose between the actual options in light of your circumstances. The completed exercise is a clearer comparison, not an instruction to buy or repair."
        ],
        table: {
          headings: ["Keep in your note", "In this example"],
          rows: [
            ["Question", "What have I overlooked in comparing repair and replacement?"],
            ["Text and source", "DestinyPixel Wealth Gods No. 33; a modern internal text, deliberately selected for this exercise."],
            ["My interpretation", "The storehouse makes me think about caring for existing resources and checking the whole cost."],
            ["Still unknown", "The scope of each price, extra charges and the repairer’s assessment of the fault."]
          ]
        }
      },
      {
        id: "good-or-bad", title: "What if the result sounds very lucky—or worrying?",
        paragraphs: [
          "An encouraging label can feel like permission to stop asking questions. Return to the specific words: which image is encouraging, and what are you adding to it? In our example, even an optimistic reading cannot turn an unconfirmed quote into a fixed total. If the text sounds cautionary, identify the uncertainty it brought to mind rather than treating it as proof of an approaching loss.",
          "A lot number is not a lottery number, and its grade is not a probability of profit. This reading cannot choose an investment, establish a loan’s suitability or guarantee a refund. For a consequential money decision, use the relevant records and suitably qualified advice. You can keep the ritual’s personal or religious significance without asking it to certify a transaction.",
          "If you want to draw again only because the wording felt uncomfortable, first write down what you hoped to hear. Then ask whether anything in the real situation has changed. A second random entry supplies a different text; it does not, by itself, supply a new fact about the expense."
        ]
      },
      {
        id: "use-the-tool", title: "Try the exercise in the fortune-stick tool",
        paragraphs: [
          "The Five Wealth Gods collection on DestinyPixel supports numbers 1–60 and defaults to the Money topic. This describes the site’s collection, not a universal temple numbering system. You can explore its entry without a birthday, an account or an AI request."
        ],
        steps: [
          "Open the Wealth Gods collection using the link below. Check that the selected topic is Money.",
          "For this reading exercise, use ‘Already drew offline?’ / ‘Find this stick’ to look up 33. You are intentionally choosing the example, not taking a random draw.",
          "Read the entry, explanation and Source note. Keep their wording distinct from the thoughts they bring up for you.",
          "For a fresh question, use the draw button instead. If you already hold a temple slip, first match its collection and text with its own source; the same number here does not authenticate it."
        ],
        links: [{ text: "Wealth Gods collection", href: "/sticks?type=wealth" }]
      },
      {
        id: "ai-and-review", title: "Use AI for context, then return to your original question",
        paragraphs: [
          "AI interpretation is optional. It receives the displayed entry, chosen topic and question, and can relate the image to the context you provide. It does not inspect your bills, contact the seller or verify the promise of a payment. You could write: ‘I am comparing repair and replacement. The quoted totals are not yet confirmed. Help me distinguish the image, my assumptions and the questions I should ask.’ Avoid account details, names and private documents. More relevant context may make the explanation more specific; it does not establish predictive accuracy.",
          "Return to your note when the missing information arrives, or at the time you set to review the issue. Write down what you learned and what remains undecided, including anything that did not fit the reading. This guide’s examples and method are original DestinyPixel editorial work with AI assistance. The official archive supports the edition distinction; the worked example interprets our own modern entry. Neither source provides evidence of a financial outcome. See Product facts and interpretation limits for the tool’s input requirements and scope."
        ],
        links: [{ text: "Product facts and interpretation limits", href: "/product-facts" }]
      }
    ],
    action: { label: "Explore the money fortune-stick collection", href: "/sticks?type=wealth" }
  },
  zh: {
    title: "财运签怎么看？从求财签意到需要核实的现实信息",
    description: "求财签里的吉凶、守财和等待该怎么理解？用一笔家电维修支出的完整例子，分清签文来源、自己的理解与仍需核实的信息。",
    topic: "财运签与日常用钱",
    answer: "财运签是围绕钱财问题的象征性解读，要结合实际签文和签系来读。单看签号或“吉”的标签，不能确定会收到多少钱、何时到账，或一笔支出是否合适。",
    introduction: "刚想留下一点积蓄，家电却突然坏了。抽到一支签，读见“守库”的意象，你可能会想：是先别花钱、把旧的修好，还是等等更好的报价？先回到结果上的文字，以及自己带来的问题。下面用一笔日常支出，把触动你的意象整理成一个更清楚的问题，让缺少的报价和承诺仍然由现实中的人来确认。",
    takeaway: "把所问的事、显示的签文、自己的理解和待核实的事实分别记下来。读签可以帮助你看见最后一项，但不能代替核实。",
    sections: [
      {
        id: "money-meaning", title: "财运签到底在说钱的哪一面？",
        paragraphs: [
          "“财运”包含很多不同的事：等一笔款、决定一项支出、考虑一个小生意。它们都和钱有关，需要的信息却不同。读到等待，你可能想到迟迟没回的消息；读到仓库，你可能想到手里已经有的东西。这些联系来自签文与你当下处境的相遇，并没有一套通用密码，规定看见船就是转账、看见满仓就等于某个金额。",
          "先把整条签文、解意和来源说明读完，再看简短的吉凶标签。在 DestinyPixel，“财运”是提问的主题分类，不是对个人财务的计算。选了这个主题，工具也不会自动知道你的收入、成本或账户记录；抽哪一支签，也不通过八字或出生星盘决定。"
        ]
      },
      {
        id: "text-and-source", title: "先认清这段文字，再解释这个号码",
        paragraphs: [
          "观音签和财神签的同一个号码，不代表同一条内容。即使签系同名，也要对照实际文字。华人庙宇委员会说明，其刊出的版本作为参考和补充，并不追求统一所有版本；该档案可以核对其公布的文本，不能由此推定本站用了相同版本。可以按核对签号与签文版本的步骤，先确认手里的文字。",
          "下文主动选读本站五路财神第 33 签：中文题为“守库生财”，英文题为 Guard The Storehouse。它的来源说明明确写着是本站财运签库的内部文本。我们借其中照看已有资源的意思做一次现代阅读练习。这不是传统庙本引文，不是谁真实抽中的记录，也不是预测应验的故事。各语言版本含改编，不能当作某篇古籍的逐字译文。"
        ],
        sources: [{ label: "华人庙宇委员会：签文版本与查询说明", href: "https://www.ctc.org.hk/chim-search/" }],
        links: [{ text: "核对签号与签文版本", href: "/journal/fortune-stick-number-and-edition?locale=zh" }]
      },
      {
        id: "narrow-the-question", title: "让钱财问题落在一件具体事情上",
        paragraphs: [
          "“我会不会发财？”太宽，之后很多事都能被装进答案。写清楚是哪件事、哪里不确定，以及下一次需要行动的节点，解读才有具体对象。金额可以不写；这样做是让解释贴近问题，并不意味着预测准确率提高。下面都是本站原创提问示例。更多感情、工作与家庭情境可读求签怎么问问题。"
        ],
        table: {
          headings: ["面对的事", "可以探索的问题"],
          rows: [
            ["一笔款还没到账", "关于这笔款，我有哪些想当然的判断，还有什么需要确认？"],
            ["突然增加的家庭支出", "比较维修和换新时，我忽略了哪些信息？"],
            ["考虑一个副业项目", "对方提出的工作范围或成本，还有哪部分没说清楚？"]
          ]
        },
        links: [{ text: "求签怎么问问题", href: "/journal/how-to-ask-fortune-sticks?locale=zh" }]
      },
      {
        id: "repair-example", title: "完整例子：一张维修报价，怎样读“守库”？",
        paragraphs: [
          "假设洗衣机坏了，维修初步报价 300 元，换新广告标价 520 元，但两边都还没有确认最终总价。你被较低的数字吸引，又不想总为维修跑来跑去。这是虚构练习，不是推荐预算，也不是某位用户的真实情况。",
          "你问的是：“比较这两个方案时，我忽略了哪些信息？”读完主动选取的“守库生财”，可以记下：“我想照顾好已有的东西，也可能把第一眼的报价当成了全部费用。”这是你自己的理解。另一个读者也许先想到自己舍不得旧物；两种联想都不能证明这台机器一定能修好。",
          "把反思落到一句能问出口的话：向维修人员确认报价包含哪些项目，上门检查、零件和人工是否包含在内；如果所判断的维修没有解决故障，接下来怎么处理。向卖家确认广告价格之外是否还有送货、安装或旧机处理费用。这些信息需要能作出确认的人回答，签文不能替他们承诺。",
          "假设后来维修人员补清了范围，或者卖家说明了额外费用，把新信息记在原问题旁边。它可能改变你的比较，却不能证明签预知了这笔费用。最后仍要结合自己的实际情况选择；这次练习完成的是一次更清楚的比较，不是替你下达修理或购买的指令。"
        ],
        table: {
          headings: ["分开记录", "这个例子里是什么"],
          rows: [
            ["所问的事", "比较维修与换新，我遗漏了什么？"],
            ["文字与来源", "本站五路财神第 33 签，现代内部文本；本练习主动选读。"],
            ["我的理解", "“守库”让我想到照看已有资源，以及核对全部费用。"],
            ["仍然未知", "两边报价的范围、额外费用，以及维修人员对故障的判断。"]
          ]
        }
      },
      {
        id: "good-or-bad", title: "读到很吉利，或让人担心的内容怎么办？",
        paragraphs: [
          "令人振奋的标签，容易让人觉得不用再问了。回到具体文字：哪一个意象给了你信心，哪一层意思是自己加上去的？在维修例子里，即使签意很乐观，未经确认的报价也不会因此成为固定总价。如果读到提醒谨慎的内容，先指出它让你想到的具体疑问，不必把它当成即将破财的证据。",
          "签号不是彩票号码，吉凶等级也不是获利概率。这种解读不能替你选投资、判断贷款是否适合，或保证退款到账。涉及重要的钱财决定，应核对相应资料，并在需要时寻求具备相应资质的意见。你可以保留仪式对自己的情感或信仰意义，同时让交易条件由真实资料来确认。",
          "如果只是因为读着不舒服，就想马上再抽一次，可以先写下自己最希望听见什么，再看看现实有没有变化。另一次随机抽签给出的是另一条文字，并不会自动带来这笔支出的新事实。"
        ]
      },
      {
        id: "use-the-tool", title: "在抽签工具里试一次这个练习",
        paragraphs: [
          "本站五路财神签支持 1—60 号，选择这个签系后，默认问题类型是“财运”。这是本站产品范围，不代表各地庙宇都采用同样的编号。查看条目不需要生日、账户或 AI 请求。"
        ],
        steps: [
          "从下方链接打开五路财神签，确认问题类型是“财运”。",
          "做本文的选读练习时，在“线下已经抽到签？”的查号区输入 33，再点“查这支签”。这是主动选择例文，不是一次随机抽签。",
          "读签文、白话解意和“签文来源”，把显示的内容与自己联想到的事情分开。",
          "如果想为新问题抽签，再使用抽签按钮。若手里已有庙宇签纸，先向其原始来源核对签系和文字；本站同号条目不能鉴定那张签纸。"
        ],
        links: [{ text: "五路财神签", href: "/sticks?type=wealth&locale=zh" }]
      },
      {
        id: "ai-and-review", title: "AI 可以帮忙联系情境，最后仍回到原问题",
        paragraphs: [
          "AI 解读是可选的。它会收到当前条目、所选主题和你填写的问题，可以把意象与具体处境联系起来；它不会查看你的账单、联系卖家或核实对方的付款承诺。例如可以写：“我在比较维修和换新，两边总价都没确认。请帮我分清意象、自己的假设和要问的问题。”不必提供账户资料、姓名或私人单据。相关背景更多，解释可以更具体，但不能据此宣称预测更准。",
          "等缺少的信息得到回复，或到了你约定的回顾时间，再翻开笔记，写下学到了什么、还有什么没决定，也保留与解读不符的部分。本文的情境与读法是本站在 AI 辅助下完成的原创编辑内容；官方档案支持版本辨认，完整例子解读的是本站现代文本。这些来源都不是财务结果的效果证据。工具的输入要求和解释范围见产品事实与解读范围。"
        ],
        links: [{ text: "产品事实与解读范围", href: "/product-facts?locale=zh" }]
      }
    ],
    action: { label: "看看五路财神签", href: "/sticks?type=wealth&locale=zh" }
  },
  ru: {
    title: "Китайские гадательные палочки на деньги: как понять смысл",
    description: "Как читать денежный жребий? Разберите образ и источник, пройдите пример с бытовой покупкой и отделите символическое толкование от сведений, которые нужно проверить.",
    topic: "Денежные вопросы и гадательные палочки",
    answer: "Денежный жребий предлагает символическое прочтение вопроса о деньгах. Смысл зависит от текста и коллекции. Номер или отметка «Хорошо» не устанавливают сумму будущего дохода, дату поступления денег или удачность покупки.",
    introduction: "Вы собирались немного отложить, но внезапно потребовался ремонт. Вытянутая палочка напоминает о кладовой, которую нужно беречь. Значит ли это ничего не тратить, починить старую вещь или ждать другого предложения? Начните с текста и вопроса, который вы к нему принесли. На примере одного бытового расхода мы пройдём путь от запомнившегося образа к ясному вопросу, оставляя неизвестные цены и обещания для проверки в реальности.",
    takeaway: "Запишите отдельно вопрос, показанный текст, своё толкование и недостающие факты. Чтение может помочь заметить последние, но не заменяет их проверку.",
    sections: [
      {
        id: "money-meaning", title: "О какой стороне денежных дел говорит жребий?",
        paragraphs: [
          "Деньги — широкая тема. Ожидание оплаты, выбор покупки и небольшой бизнес требуют разных сведений. Образ ожидания может напомнить о запоздавшем ответе, а кладовая — об уже имеющихся ресурсах. Эти связи возникают при чтении текста в контексте своей ситуации. Нет общего шифра, по которому лодка обязательно означает перевод, а полный амбар — определённую сумму.",
          "Прочитайте запись целиком, включая пояснение и источник, прежде чем опираться на короткую оценку удачи. На DestinyPixel «Деньги» — категория вопроса, а не расчёт личных финансов. Её выбор не сообщает инструменту ваш доход, расходы или состояние счёта. Карта бацзы или китайской астрологии также не используется для выбора палочки."
        ]
      },
      {
        id: "text-and-source", title: "Сначала определите текст, затем толкуйте номер",
        paragraphs: [
          "Одинаковый номер в коллекциях Гуаньинь и богов богатства не обозначает одну запись. Даже внутри одной традиции сверяйте слова. Комитет китайских храмов поясняет, что его издания дополняют другие версии и служат справочным материалом, не стремясь их унифицировать. Архив позволяет проверить опубликованный им текст, но не подтверждает, что DestinyPixel воспроизводит эту версию. В руководстве по проверке номера и версии текста объясняется, как сопоставить слова.",
          "Для упражнения ниже мы намеренно выбираем № 33 из коллекции богов богатства DestinyPixel — «Охранять кладовую», по-китайски «守库生财». Примечание об источнике относит его к внутреннему тексту сайта. Мы используем мысль о внимании к имеющимся ресурсам как современную подсказку для размышления. Это не цитата из храмового сборника, не чей-то настоящий жребий и не рассказ о сбывшемся предсказании. Языковые версии содержат адаптации, а не дословный перевод древнего оригинала."
        ],
        sources: [{ label: "Комитет китайских храмов: версии текстов и поиск (на китайском)", href: "https://www.ctc.org.hk/chim-search/" }],
        links: [{ text: "проверке номера и версии текста", href: "/journal/fortune-stick-number-and-edition?locale=ru" }]
      },
      {
        id: "narrow-the-question", title: "Выберите один конкретный денежный вопрос",
        paragraphs: [
          "«Стану ли я богатым?» — настолько широкий вопрос, что почти любое последующее событие можно принять за ответ. Назовите ситуацию, свою неопределённость и момент следующего действия. Суммы можно оставить при себе. Это помогает связать толкование с одним вопросом, но не повышает доказанную точность предсказания. Ниже — наши авторские примеры формулировок. О других ситуациях читайте в руководстве «как сформулировать вопрос оракулу»."
        ],
        table: {
          headings: ["Ситуация", "Вопрос для размышления"],
          rows: [
            ["Оплата ещё не пришла", "Что я предполагаю об этой оплате и что пока требует подтверждения?"],
            ["Неожиданный бытовой расход", "Что я упускаю, сравнивая ремонт и замену?"],
            ["Возможная подработка", "Какая часть предложенной работы или её стоимости мне ещё не ясна?"]
          ]
        },
        links: [{ text: "как сформулировать вопрос оракулу", href: "/journal/how-to-ask-fortune-sticks?locale=ru" }]
      },
      {
        id: "repair-example", title: "Подробный пример: цена ремонта и образ кладовой",
        paragraphs: [
          "Представьте сломанную стиральную машину. Предварительная стоимость ремонта — 300, цена замены в объявлении — 520 в той же валюте. Ни одна сумма ещё не подтверждена как итоговая. Меньшее число привлекает, но заниматься ремонтом снова уже надоело. Это вымышленное упражнение, не рекомендуемый бюджет и не история клиента.",
          "Вопрос звучит так: «Что я упускаю при сравнении двух вариантов?» После чтения выбранной записи можно написать: «Мне хочется беречь то, что у меня есть, и, возможно, я принимаю первую названную цену за полную стоимость». Это ваше толкование. Другой читатель может заметить страх расстаться со старой вещью. Ни один вывод не устанавливает, удастся ли надёжно починить машину.",
          "Теперь превратите размышление в вопрос человеку, который может ответить. Уточните у мастера состав сметы: входят ли осмотр, детали и работа, а также что произойдёт, если намеченный ремонт не устранит неисправность. У продавца спросите, оплачиваются ли отдельно доставка, установка и вывоз старой машины. Это сведения, которые должны подтвердить соответствующие стороны; текст жребия не отвечает за них.",
          "Допустим, мастер затем уточнил объём работ или продавец сообщил о дополнительной плате. Запишите это рядом с исходным вопросом. Новая информация может изменить сравнение, но не доказывает, что палочка предсказала доплату. Выбор остаётся за вами с учётом реальных вариантов и обстоятельств. Результат упражнения — более ясное сравнение, а не предписание купить или отремонтировать."
        ],
        table: {
          headings: ["Отдельная запись", "В этом примере"],
          rows: [
            ["Вопрос", "Что я упускаю при сравнении ремонта и замены?"],
            ["Текст и источник", "№ 33 богов богатства DestinyPixel; современный внутренний текст, намеренно выбранный для упражнения."],
            ["Моё толкование", "Кладовая напоминает о заботе об имеющихся ресурсах и проверке полной стоимости."],
            ["Неизвестные факты", "Состав обеих цен, дополнительные расходы и оценка неисправности мастером."]
          ]
        }
      },
      {
        id: "good-or-bad", title: "А если текст очень обнадёживает или тревожит?",
        paragraphs: [
          "Хорошая оценка может восприниматься как разрешение больше не задавать вопросов. Вернитесь к словам: какой образ обнадёживает, а что вы добавили от себя? В нашем примере даже оптимистичное чтение не превращает неподтверждённую цену в окончательную. Если текст призывает к осторожности, назовите конкретную неопределённость, о которой он напомнил, вместо вывода о неизбежном убытке.",
          "Номер жребия не является лотерейным числом, а оценка — вероятностью прибыли. Такое чтение не выбирает инвестицию, не устанавливает подходящие условия кредита и не гарантирует возврат денег. Для существенного денежного решения нужны соответствующие документы и, при необходимости, квалифицированная консультация. Личное или религиозное значение ритуала можно сохранить, не превращая его в подтверждение сделки.",
          "Если хочется тянуть снова только из-за неприятного впечатления, сначала запишите, какой ответ вы надеялись услышать. Затем проверьте, изменилось ли что-нибудь в самой ситуации. Ещё одна случайная запись даёт другой текст, но сама по себе не добавляет нового факта о расходе."
        ]
      },
      {
        id: "use-the-tool", title: "Как попробовать упражнение в инструменте",
        paragraphs: [
          "Коллекция пяти богов богатства DestinyPixel поддерживает номера 1–60 и по умолчанию выбирает тему «Деньги». Это диапазон сайта, не единая нумерация всех храмов. Для чтения записи не нужны дата рождения, аккаунт или запрос к ИИ."
        ],
        steps: [
          "Откройте коллекцию богов богатства по ссылке ниже. Проверьте выбранную тему «Деньги».",
          "Для этого упражнения используйте поиск уже известного номера: введите 33 и нажмите «Найти жребий». Вы намеренно выбираете пример, а не получаете случайный жребий.",
          "Прочитайте текст, пояснение и примечание «Источник». Отделите показанные слова от своих ассоциаций.",
          "Для нового вопроса можно воспользоваться кнопкой вытягивания. Если у вас есть храмовый листок, сначала сверьте коллекцию и текст с его собственным источником: тот же номер на сайте не удостоверяет листок."
        ],
        links: [{ text: "Коллекция пяти богов богатства", href: "/sticks?type=wealth&locale=ru" }]
      },
      {
        id: "ai-and-review", title: "ИИ помогает с контекстом; затем вернитесь к вопросу",
        paragraphs: [
          "Интерпретация ИИ необязательна. Он получает показанную запись, тему и ваш вопрос и может связать образ с описанными обстоятельствами. Он не проверяет счета, не связывается с продавцом и не подтверждает обещание оплаты. Можно написать: «Я сравниваю ремонт и замену. Итоговые цены пока не подтверждены. Помоги отделить образ, мои предположения и вопросы, которые нужно задать». Не вводите данные счетов, имена и частные документы. Полезный контекст может сделать объяснение конкретнее, но не доказывает точность предсказания.",
          "Вернитесь к заметке, когда получите недостающие сведения или наступит выбранный момент пересмотра. Запишите, что узнали и что ещё не решено, в том числе наблюдения, которые не совпали с толкованием. Примеры и метод этой статьи — авторская редакционная работа DestinyPixel с помощью ИИ. Официальный архив подтверждает различие версий; подробный пример относится к нашему современному тексту. Эти источники не доказывают финансовый результат. Требования к вводимым данным описаны на странице «факты о продукте и границы толкования»."
        ],
        links: [{ text: "факты о продукте и границы толкования", href: "/product-facts?locale=ru" }]
      }
    ],
    action: { label: "Открыть денежный оракул", href: "/sticks?type=wealth&locale=ru" }
  }
};

export const moneyFortuneArticle: JournalSourceArticle = {
  slug: "chinese-fortune-sticks-money-meaning",
  relatedSlug: "fortune-stick-number-and-edition",
  publishedAt: "2026-11-17",
  updatedAt: "2026-11-17",
  zhTwReplacements: [["信息", "資訊"], ["默認", "預設"], ["賬戶", "帳戶"], ["鏈接", "連結"]],
  translations: { en: editions.en, zh: editions.zh }
};
export const moneyFortuneRussian = editions.ru;
