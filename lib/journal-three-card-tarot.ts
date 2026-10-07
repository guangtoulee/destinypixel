import type { JournalSourceArticle, JournalTranslation } from "@/lib/journal";

const editions: Record<"en" | "zh" | "ru", JournalTranslation> = {
  "en": {
    "title": "How to Read a Three-Card Tarot Spread: A Worked Example",
    "description": "Learn to connect three tarot cards with their positions and your question. Follow a relationship example, understand reversals, and try a free three-card spread.",
    "topic": "Tarot, one step at a time",
    "introduction": "You turn over three cards, look up three meanings, and still have no idea what the reading is saying. The missing piece is often the connection: what you asked, what each position means, and how one card changes the way you read the next. Let’s work through a small relationship question, then use the same method on your own spread.",
    "takeaway": "Read in this order: question → position → card and orientation → connection → one next step you can check. Three cards give you three perspectives, not three established facts about another person.",
    "sections": [
      {
        "id": "one-question",
        "title": "1. Give the three cards one question to work on",
        "paragraphs": [
          "Imagine you have enjoyed two dates, but messages have become less frequent. “What will happen to us?” leaves almost everything undefined. A more focused question is: “How can I clarify where this connection is going?” It gives the reading a situation and gives you something to do with it. This is an invented teaching example, not a visitor’s private reading.",
          "You can put the question in the title field and add a short background: “We have met twice. Replies are less frequent. We haven’t discussed whether to meet again. I want to ask without making assumptions.” Those observations are more useful than a long theory about why the other person is distant. For a work question, use the same structure: name one situation, the decision in front of you and what is within your control."
        ]
      },
      {
        "id": "positions",
        "title": "2. Read the positions before you read the cards",
        "paragraphs": [
          "A three-card spread does not have one compulsory set of labels. Past–present–future is one familiar arrangement; DestinyPixel’s guided three-card spread uses the positions below. The last position invites a possible action, so do not silently turn it into a guaranteed future. Decide what the positions mean before interpreting your cards."
        ],
        "table": {
          "headings": [
            "Position on this table",
            "What to look for",
            "Question to write beside it"
          ],
          "rows": [
            [
              "What brought you here",
              "A starting point or pattern to reflect on",
              "What did I bring into this situation?"
            ],
            [
              "What is present",
              "The concern or tension asking for attention now",
              "What do I know, and what am I still guessing?"
            ],
            [
              "A possible next step",
              "An approach you could try",
              "What small action could give me clearer information?"
            ]
          ]
        }
      },
      {
        "id": "worked-example",
        "title": "3. A worked example: The Fool, Two of Swords and Temperance",
        "paragraphs": [
          "Suppose the first card is The Fool, upright. Its theme of beginning can bring you back to the curiosity of the first meeting. In the “What brought you here” position, ask whether you have been enjoying discovery or already imagining the whole relationship. Neither answer is supplied by the card; you check it against your own experience.",
          "The second card is the Two of Swords, upright. Our short meaning points to a decision you have paused. In the present position, it might help you notice that you are waiting for clearer signals while avoiding a direct question. It does not tell you that the other person is hiding a secret. If you have already asked clearly, that interpretation may not fit: consider another relevant possibility or leave it aside.",
          "The third card is Temperance, upright. Our reading emphasizes patient adjustment. As a possible next step, it can suggest a proportionate invitation: “I enjoyed seeing you. Would you like to make a plan for next week?” A calm question gives the other person room to answer. It does not promise that they will say yes, and patience does not require waiting indefinitely."
        ]
      },
      {
        "id": "connect",
        "title": "4. Make one sentence from the spread",
        "paragraphs": [
          "Read the sequence aloud: “I started with curiosity; now I am suspended between possibilities; I can try a clear invitation without rushing the outcome.” Each part has a job. The first card names the starting point, the second brings out the current tension, and the third offers an approach. This is more usable than three disconnected labels such as “new beginning, indecision, balance.”",
          "Now test that sentence. Which part matches something you actually noticed? Which part is your interpretation? What would show that the reading was a poor fit? You might learn from the conversation that the other person was simply busy, wanted something different, or was also unsure how to ask. Leave space for those answers instead of making every outcome confirm the cards."
        ]
      },
      {
        "id": "reversals",
        "title": "5. What if one of the three cards is reversed?",
        "paragraphs": [
          "First check the orientation actually displayed. A reversed card is read with its reversed meaning; it does not automatically cancel the other cards or turn the whole spread into bad news. DestinyPixel’s short meanings are original editorial interpretations. For example, our reversed Temperance emphasizes imbalance or a rushed rhythm. In the next-step position, you could ask whether you are pushing for an immediate answer or making all the adjustments yourself.",
          "That is a possibility to examine, not evidence of a hidden problem. Keep the position and question the same, and change only the reading of the card that is reversed. On this table you choose whether to include reversals when shuffling. A card’s decorative rotation in free-table mode is separate from its upright/reversed state."
        ]
      },
      {
        "id": "try-it",
        "links": [{ "text": "Rider–Waite–Smith", "href": "/journal/pamela-colman-smith-tarot-artist" }],
        "title": "6. Try the three-card spread on the free table",
        "paragraphs": [
          "The guided mode handles the three positions for you. You do not need a birth date, a BaZi chart or an account to shuffle, choose cards and read their short meanings. The deck uses all 78 Rider–Waite–Smith cards; the example above is not a preset draw and you are unlikely to get that exact combination.",
          "On a phone, the remaining deck appears in two overlapping rows next to the playing surface; desktop uses one row. A first tap extends a card a little, then a second tap places it. You can also drag it onto a position. Cards remain hidden until you reveal them; AI does not choose them."
        ],
        "steps": [
          "Choose guided spread mode and the three-card option. Decide whether to include reversed cards, then shuffle.",
          "Select a position and choose a face-down card. Repeat until all three positions are filled.",
          "Reveal the cards in order. Tap an open card to see its name, orientation and brief meaning.",
          "Read each card with its position, then connect all three. Return or replace a card if needed, while keeping track of which layout you are interpreting."
        ]
      },
      {
        "id": "ai-context",
        "title": "7. What should you write before asking AI for a detailed reading?",
        "paragraphs": [
          "The question title is required for AI interpretation; detailed context is optional. A useful note includes what happened, what you do not know and what you want to explore. More relevant context can make the explanation more specific to the situation. It does not establish that the reading predicts events more accurately. Use roles such as “my partner” or “a colleague” instead of names and identifying details.",
          "Once every card in the guided spread is revealed, you can request an explanation. DeepSeek receives the cards, positions, orientations, question and optional background. It is asked to connect those cards, not draw replacements. In free-table mode it uses card order rather than inventing meanings for where you put cards on the screen. You can always use the local card meanings without AI; optional AI requests have usage limits."
        ],
        "steps": [
          "Question: “How can I clarify where this connection is going?”",
          "Background: “Two dates; fewer messages; no conversation yet about another meeting.”",
          "Focus: “Help me separate my assumptions from a question I can actually ask.”"
        ]
      },
      {
        "id": "keep-record",
        "title": "8. Save something you can revisit",
        "paragraphs": [
          "Before requesting a longer interpretation, write your own one-sentence reading and one next step. After the conversation or action, compare what happened with what you expected. A useful record leaves room to say “this did not fit.” Repeatedly replacing cards until the answer feels reassuring does not give you new information about the relationship.",
          "If you want to keep the layout and generated explanation on DestinyPixel, register or sign in and explicitly save it. If you saved before generating AI text, save again afterwards to update that record. Reopening a saved reading does not rerun AI. Records can be deleted from your account.",
          "The card artwork belongs to the Rider–Waite–Smith tradition; Waite’s book is linked below for historical comparison. This three-position exercise, the relationship scenario and the practical wording are DestinyPixel’s original teaching material, edited with AI assistance. They are not quotations from Waite or a promise to know another person’s thoughts. You can appreciate the symbolism and still let actual conversations shape your choices."
        ],
        "sources": [
          {
            "label": "A. E. Waite: The Pictorial Key to the Tarot (historical text)",
            "href": "https://en.wikisource.org/wiki/The_Pictorial_Key_to_the_Tarot"
          },
          {
            "label": "DestinyPixel tarot: try the spread and read the artwork credits",
            "href": "/tarot"
          },
          {
            "label": "Product facts: AI, free use and saving",
            "href": "/product-facts"
          }
        ]
      }
    ],
    "action": {
      "label": "Choose your own three cards",
      "href": "/tarot"
    }
  },
  "zh": {
    "title": "三张塔罗牌怎么解读？从牌位到完整故事的实战示例",
    "description": "抽出三张塔罗牌后，怎样把牌义连起来？用一个感情提问示例，讲清牌位、正逆位、问题背景与下一步，再体验免费三张牌阵。",
    "topic": "塔罗入门，先读懂一组牌",
    "introduction": "翻开三张牌，查到三个关键词，却还是不知道整组牌在说什么？缺的往往是中间的连接：你问了什么，每个牌位负责什么，这张牌又怎样改变下一张牌的读法。我们用一个具体的感情问题走一遍，再把这套方法放回你自己的牌阵。",
    "takeaway": "按“问题 → 牌位 → 牌与正逆位 → 三张之间的连接 → 一个可以核对的下一步”来读。三张牌提供三个观察角度，不是关于另一个人的三条已知事实。",
    "sections": [
      {
        "id": "one-question",
        "title": "1. 先给三张牌一个共同的问题",
        "paragraphs": [
          "假设你们约会过两次，相处不错，最近消息却少了。“我们以后会怎样？”范围很大。可以收拢成：“我怎样问清这段关系接下来的方向？”这样既有具体情境，也给你留下可以行动的位置。这是为讲解编写的虚构例子，不是用户的私人测算。",
          "把这句话放进问题标题，背景简单写：“见过两次，最近回复变少，还没谈过下次见面。我想问清楚，但不想先替对方下结论。”这些观察比一大段猜测对方为何冷淡更有用。问工作也一样：说清一件事、眼前的选择，以及自己能做的部分。"
        ]
      },
      {
        "id": "positions",
        "title": "2. 看牌之前，先看牌位负责什么",
        "paragraphs": [
          "三张牌没有唯一固定的排法。“过去—现在—未来”是一种常见安排；DestinyPixel 的引导式三张牌阵使用下面三个位置。最后一格说的是可能采取的下一步，不要读着读着就变成一定发生的未来。先确定牌位，再解释抽到的牌。"
        ],
        "table": {
          "headings": [
            "本站牌位",
            "观察重点",
            "可以写在旁边的问题"
          ],
          "rows": [
            [
              "走到这里的来路",
              "可以回看的起点或模式",
              "我带着什么进入了这件事？"
            ],
            [
              "当下的状态",
              "眼前最需要注意的顾虑或拉扯",
              "哪些是我知道的，哪些仍是猜测？"
            ],
            [
              "可能的下一步",
              "可以试一试的应对方式",
              "什么小行动能让我得到更清楚的信息？"
            ]
          ]
        }
      },
      {
        "id": "worked-example",
        "title": "3. 实战示例：愚者、宝剑二与节制",
        "paragraphs": [
          "假设第一张是正位愚者。它关于开始的意象，可以让你回到刚认识时的好奇。放在“走到这里的来路”，可以问：我还在享受了解对方的过程，还是已经把整段关系都想好了？牌不会替你确定答案，要用自己的经历核对。",
          "第二张是正位宝剑二。本站简明牌义提示面对暂时搁置的决定。落在当下的位置，可以看看自己是否一直等更明确的信号，却迟迟没有直接问。它并不能证明对方藏着秘密。如果你已经问得很清楚，这种读法可能就不符合情况，可以换个相关角度，或者放下不采用。",
          "第三张是正位节制。本站把它读作耐心调整、寻找合适的节奏。作为下一步，可以试一条分寸合适的邀请：“上次见面很开心，你下周还想约一次吗？”平静地问，给对方回答的空间。这不保证对方答应，而耐心也不意味着无限期等待。"
        ]
      },
      {
        "id": "connect",
        "title": "4. 把三张牌连成一句话",
        "paragraphs": [
          "试着读成：“我带着好奇开始，现在悬在几种可能之间，接下来可以发出清楚的邀请，不急着替结果下结论。”三部分各有作用：第一张说起点，第二张说眼前的拉扯，第三张给一种应对方式。这样比“新开始、犹豫、平衡”三个孤立词更容易用起来。",
          "再检查这句话：哪一部分对应你确实观察到的事？哪一部分只是解释？发生什么会说明这次解读不适合？谈过之后，可能发现对方只是忙、期待不同，或者也不知道怎么开口。给这些答案留位置，不必把每种结果都解释成牌早已说中了。"
        ]
      },
      {
        "id": "reversals",
        "title": "5. 有一张逆位，是不是整组就不好？",
        "paragraphs": [
          "先核对页面实际显示的正逆位。逆位按对应的逆位牌义阅读，不会自动抵消另外两张，也不等于整组都变成坏消息。本站简明牌义是原创编辑解读。例如逆位节制侧重失衡或节奏太急；放在下一步，可以问自己是不是催着马上得到答案，或者一直只有自己在调整。",
          "这仍是一个待核对的角度，不是存在隐患的证据。保留原来的问题与牌位，只改变这张逆位牌的读法。本站洗牌时可选择是否加入逆位；自由牌桌上为了排版转动卡片，与牌本身的正逆位状态是两回事。"
        ]
      },
      {
        "id": "try-it",
        "links": [{ "text": "韦特体系", "href": "/journal/pamela-colman-smith-tarot-artist?locale=zh" }],
        "title": "6. 在免费牌桌上自己抽一次",
        "paragraphs": [
          "排阵模式会帮你安排好三个位置。洗牌、选牌、看简明牌义不需要生日、八字资料或账号。牌堆包含完整的 78 张韦特体系牌，上面的例子不是预设抽牌结果，你不需要抽出完全一样的组合。",
          "手机端待选牌分成两排重叠，紧贴牌桌；电脑端是一排。点一下，牌会探出一部分，再点一次放上桌，也可以直接拖到牌位。翻开前牌面保持隐藏，AI 不替你选牌。"
        ],
        "steps": [
          "选择排阵模式和三张牌，决定是否加入逆位，再洗牌。",
          "选一个牌位，从背面牌堆挑牌，直到三个位置都放好。",
          "依次翻开，点已翻开的牌，查看牌名、正逆位和简明解释。",
          "把每张牌放回牌位理解，再串成整体。需要时可以归还或替换，但要记清正在解读的是哪一版牌阵。"
        ]
      },
      {
        "id": "ai-context",
        "title": "7. 点 AI 详解前，问题和背景怎样写？",
        "paragraphs": [
          "AI 详解需要问题标题，详细情况可以留空。有用的背景通常包括：发生了什么、哪里还不清楚、你想探索什么。相关细节能让解释更贴合情境，并不证明它能更准确地预测未来。用“伴侣”“同事”等称呼即可，不必提供姓名和身份信息。",
          "排阵中的牌全部翻开后，可以请求详解。DeepSeek 收到牌、牌位、正逆位、问题与可选背景，负责解释连接，不另抽一组替代。自由牌桌则按牌序处理，不会根据你把牌摆在屏幕左边还是右边就凭空赋予牌位含义。不用 AI 也能查看本地牌义；可选 AI 解读设有使用次数限制。"
        ],
        "steps": [
          "问题：“我怎样问清这段关系接下来的方向？”",
          "背景：“约会两次，最近消息减少，还没谈下次见面。”",
          "重点：“帮我区分自己的猜测，以及真正可以问出口的问题。”"
        ]
      },
      {
        "id": "keep-record",
        "title": "8. 留下一份以后能回看的记录",
        "paragraphs": [
          "生成长解读前，先写下你自己的一句话解读和一个下一步。谈过或行动之后，再对照预期与实际。记录里允许出现“这部分不符合”。反复换牌直到答案让自己安心，并不会增加你对这段关系的实际了解。",
          "想在 DestinyPixel 保留牌阵和已生成解读，可以注册或登录后主动保存。如果先保存、后生成 AI 文字，需要再保存一次来更新那条记录。重开已保存解读不会重新跑 AI，账号里也可以删除记录。",
          "卡图来自韦特—史密斯体系，下方附韦特原著供历史对照。本文的三牌位练习、关系情境与沟通示例，是本站借助 AI 辅助编辑的原创教学材料，不是韦特原文，也不承诺知道另一个人在想什么。可以欣赏象征的启发，同时让真实对话参与自己的判断。"
        ],
        "sources": [
          {
            "label": "A. E. Waite：《The Pictorial Key to the Tarot》原著（英文）",
            "href": "https://en.wikisource.org/wiki/The_Pictorial_Key_to_the_Tarot"
          },
          {
            "label": "本站塔罗牌桌：牌阵与卡图来源说明",
            "href": "/tarot?locale=zh"
          },
          {
            "label": "产品事实：AI、免费范围与保存",
            "href": "/product-facts?locale=zh"
          }
        ]
      }
    ],
    "action": {
      "label": "亲手挑选你的三张牌",
      "href": "/tarot?locale=zh"
    }
  },
  "ru": {
    "title": "Как читать расклад Таро на три карты: подробный пример",
    "description": "Как связать три карты Таро с позициями и вопросом: пример об отношениях, перевёрнутые карты, контекст для ИИ и бесплатный расклад.",
    "topic": "Таро шаг за шагом",
    "introduction": "Вы открыли три карты, нашли три значения — и всё ещё не понимаете расклад целиком. Часто не хватает связи между вопросом, задачей каждой позиции и соседними картами. Разберём конкретный вопрос об отношениях, а затем перенесём этот способ чтения на ваш расклад.",
    "takeaway": "Читайте по порядку: вопрос → позиция → карта и её ориентация → связь между картами → небольшой шаг, результат которого можно проверить. Это три точки зрения, а не три установленных факта о другом человеке.",
    "sections": [
      {
        "id": "one-question",
        "title": "1. Дайте трём картам один общий вопрос",
        "paragraphs": [
          "Представьте: два свидания прошли приятно, но сообщения стали приходить реже. «Что с нами будет?» оставляет почти всё неопределённым. Более конкретный вопрос: «Как мне прояснить, куда движется это знакомство?» Он задаёт ситуацию и оставляет вам возможность действовать. Это вымышленный учебный пример, а не личное чтение посетителя.",
          "Поместите вопрос в заголовок, а в описании напишите: «Виделись дважды. Сообщений стало меньше. Новую встречу ещё не обсуждали. Хочу спросить, не делая предположений за другого». Наблюдения полезнее длинной версии о причинах чужой отстранённости. Для рабочего вопроса принцип тот же: одна ситуация, предстоящий выбор и то, на что вы можете повлиять."
        ]
      },
      {
        "id": "positions",
        "title": "2. Сначала разберитесь с позициями",
        "paragraphs": [
          "У расклада на три карты нет единственного обязательного набора позиций. Прошлое–настоящее–будущее — один из знакомых вариантов. В режиме готового расклада DestinyPixel используются позиции ниже. Последняя предлагает возможный шаг: не превращайте её незаметно в гарантированное будущее. Определите назначение позиций до толкования карт."
        ],
        "table": {
          "headings": [
            "Позиция на этом столе",
            "На что обратить внимание",
            "Вопрос для заметки"
          ],
          "rows": [
            [
              "Что привело сюда",
              "Исходная точка или привычный подход",
              "С чем я вошёл в эту ситуацию?"
            ],
            [
              "Что происходит сейчас",
              "Нынешняя забота или напряжение",
              "Что я знаю, а что только предполагаю?"
            ],
            [
              "Возможный следующий шаг",
              "Подход, который можно попробовать",
              "Какое небольшое действие даст больше ясности?"
            ]
          ]
        }
      },
      {
        "id": "worked-example",
        "title": "3. Пример: Шут, Двойка Мечей и Умеренность",
        "paragraphs": [
          "Допустим, первая карта — прямой Шут. Тема начала возвращает к любопытству первой встречи. В позиции «Что привело сюда» спросите себя: я ещё узнаю человека или уже представляю все будущие отношения? Карта не устанавливает ответ; его нужно сопоставить со своим опытом.",
          "Вторая карта — прямая Двойка Мечей. Наше краткое значение предлагает взглянуть на отложенное решение. В позиции настоящего она может побудить заметить, что вы ждёте ясного сигнала, но избегаете прямого вопроса. Она не доказывает, что другой что-то скрывает. Если вы уже спросили ясно, это толкование может не подходить: рассмотрите другую уместную возможность или отложите его.",
          "Третья карта — прямая Умеренность. В нашем прочтении это терпеливая настройка ритма. В качестве следующего шага подойдёт спокойное приглашение: «Мне понравилось с тобой встречаться. Хочешь что-нибудь запланировать на следующую неделю?» Оно оставляет место для ответа. Оно не обещает согласия, а терпение не обязывает ждать бесконечно."
        ]
      },
      {
        "id": "connect",
        "title": "4. Соберите расклад в одно предложение",
        "paragraphs": [
          "Прочитайте последовательность вслух: «Я начал с любопытства; сейчас завис между возможностями; могу предложить конкретную встречу, не торопя исход». У каждой части своя задача: первая карта обозначает исходную точку, вторая — нынешнее напряжение, третья — подход. Это применимее трёх отдельных слов: «начало, нерешительность, баланс».",
          "Проверьте предложение. Что соответствует реальному наблюдению, а что является толкованием? Какой факт показал бы, что чтение не подходит? После разговора может выясниться, что человек был занят, хотел другого или тоже не знал, как спросить. Оставьте место этим ответам, вместо того чтобы объявлять любой исход подтверждением карт."
        ]
      },
      {
        "id": "reversals",
        "title": "5. Что меняет перевёрнутая карта?",
        "paragraphs": [
          "Сначала посмотрите на указанную ориентацию. Перевёрнутую карту читают с её соответствующим значением; она не отменяет две остальные и не делает весь расклад плохой вестью. Краткие значения DestinyPixel — наши авторские интерпретации. Например, перевёрнутая Умеренность обращает внимание на дисбаланс или спешку. В позиции следующего шага можно спросить: не требую ли я немедленного ответа и не приходится ли только мне подстраиваться?",
          "Это возможность для проверки, а не доказательство скрытой проблемы. Сохраните вопрос и позиции, меняя только прочтение перевёрнутой карты. На сайте включение перевёрнутых карт выбирается при перемешивании. Декоративный поворот карты на свободном столе не меняет её прямое или перевёрнутое состояние."
        ]
      },
      {
        "id": "try-it",
        "links": [{ "text": "Райдера–Уэйта–Смит", "href": "/journal/pamela-colman-smith-tarot-artist?locale=ru" }],
        "title": "6. Попробуйте бесплатный расклад самостоятельно",
        "paragraphs": [
          "Режим готового расклада задаёт три позиции. Для перемешивания, выбора и кратких значений не нужны дата рождения, карта Ба-цзы или аккаунт. Используются все 78 карт Райдера–Уэйта–Смит. Комбинация из примера не является заранее заданным результатом; вам не нужно вытянуть именно её.",
          "На телефоне оставшиеся карты лежат двумя перекрывающимися рядами рядом со столом, на компьютере — одним. Первое касание немного выдвигает карту, второе кладёт её на стол. Можно также перетащить её в позицию. Лица карт скрыты до открытия; ИИ не выбирает карты за вас."
        ],
        "steps": [
          "Выберите режим готового расклада и три карты. Решите, включать ли перевёрнутые карты, затем перемешайте.",
          "Выберите позицию и одну закрытую карту. Заполните все три места.",
          "Открывайте по очереди. Нажмите открытую карту, чтобы увидеть название, ориентацию и краткое значение.",
          "Свяжите каждую карту с позицией, затем прочитайте последовательность. При необходимости карту можно вернуть или заменить, помня, какой вариант расклада вы толкуете."
        ]
      },
      {
        "id": "ai-context",
        "title": "7. Что написать перед подробным разбором ИИ?",
        "paragraphs": [
          "Для ИИ нужен заголовок с вопросом; подробности необязательны. Полезное описание сообщает, что произошло, чего вы не знаете и что хотите рассмотреть. Уместный контекст делает объяснение конкретнее, но не доказывает точность предсказаний. Вместо имён и личных данных достаточно слов «партнёр» или «коллега».",
          "Когда все карты готового расклада открыты, можно запросить объяснение. DeepSeek получает карты, позиции, ориентации, вопрос и необязательный контекст. Он должен связать эти карты, а не вытянуть новые. На свободном столе используется порядок карт, без выдумывания значений их расположения на экране. Краткие значения доступны и без ИИ; на дополнительные запросы действуют лимиты."
        ],
        "steps": [
          "Вопрос: «Как мне прояснить, куда движется это знакомство?»",
          "Контекст: «Два свидания; сообщений меньше; новую встречу ещё не обсуждали».",
          "Фокус: «Помоги отделить мои предположения от вопроса, который я могу задать»."
        ]
      },
      {
        "id": "keep-record",
        "title": "8. Сохраните то, к чему можно вернуться",
        "paragraphs": [
          "Перед длинным разбором запишите собственное предложение о раскладе и один следующий шаг. После разговора или действия сравните ожидания с реальностью. Полезная запись допускает вывод «это не подошло». Замена карт до успокаивающего ответа не добавляет фактов об отношениях.",
          "Чтобы оставить расклад и созданное объяснение на DestinyPixel, зарегистрируйтесь или войдите и сохраните запись. Если вы сохранили карты до генерации текста ИИ, сохраните ещё раз после неё, чтобы обновить запись. Повторное открытие не запускает ИИ заново. Записи можно удалить из аккаунта.",
          "Изображения относятся к традиции Райдера–Уэйта–Смит; книга Уэйта ниже дана для исторического сопоставления. Эти три позиции, ситуация и примеры реплик — авторский учебный материал DestinyPixel, отредактированный с помощью ИИ. Это не цитаты Уэйта и не обещание узнать чужие мысли. Символы могут вдохновлять, а реальные разговоры — помогать делать выбор."
        ],
        "sources": [
          {
            "label": "А. Э. Уэйт: The Pictorial Key to the Tarot (исторический текст, английский)",
            "href": "https://en.wikisource.org/wiki/The_Pictorial_Key_to_the_Tarot"
          },
          {
            "label": "Стол Таро: расклады и источники изображений",
            "href": "/tarot?locale=ru"
          },
          {
            "label": "Сведения об инструментах: ИИ, бесплатные функции и сохранение",
            "href": "/product-facts?locale=ru"
          }
        ]
      }
    ],
    "action": {
      "label": "Выбрать свои три карты",
      "href": "/tarot?locale=ru"
    }
  }
};

export const threeCardTarotArticle: JournalSourceArticle = {
  slug: "how-to-read-three-card-tarot",
  relatedSlug: "how-to-ask-fortune-sticks",
  publishedAt: "2026-10-02",
  updatedAt: "2026-10-02",
  translations: { en: editions.en, zh: editions.zh },
};
export const threeCardTarotRussian = editions.ru;
