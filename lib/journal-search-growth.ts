import { baziCompatibilityArticle, baziCompatibilityRussian } from "./journal-bazi-compatibility";
import { sunMoonRisingArticle, sunMoonRisingRussian } from "./journal-sun-moon-rising";
import { fortuneStickEditionsArticle, fortuneStickEditionsRussian } from "./journal-fortune-stick-editions";
import { birthTimeArticle, birthTimeSectionIds } from "./compatibility/birth-time-article";
import type { JournalSourceArticle, JournalTranslation } from "./journal";

type Edition = {
  title: string; description: string; topic: string; introduction: string; takeaway: string;
  sections: [string, string, ...string[]][]; action: { label: string; href: string };
};
type Entry = { slug: string; relatedSlug: string; sources: { label: string; href: string }[]; en: Edition; zh: Edition; ru: Edition };

// Original, task-focused guides. Section order is shared across complete editions.
const entries: Entry[] = [
  {
    slug: "compatibility-without-birth-time", relatedSlug: "bazi-vs-chinese-zodiac-compatibility",
    sources: [{ label: "IANA · Time Zone Database / 时区资料 / База часовых поясов", href: "https://www.iana.org/time-zones" }, { label: "DestinyPixel · Birth details / 出生资料 / Данные рождения", href: "/journal/prepare-birth-date-time-place" }, { label: "DestinyPixel product facts", href: "/product-facts" }],
    ...birthTimeArticle,
  },
  {
    slug: "how-to-ask-fortune-sticks", relatedSlug: "fortune-stick-number-and-edition",
    sources: [{ label: "DestinyPixel · Fortune sticks / 抽签使用说明 / Оракул палочек", href: "/sticks" }, { label: "DestinyPixel · Guanyin collection guide / 观音签指南 / Коллекция Гуаньинь", href: "/learn/guanyin-fortune-sticks" }],
    en: {
      title: "How to ask fortune sticks: love, family and work examples",
      description: "How do you read Chinese fortune sticks for work? Follow a job-offer example from question to next step, with love and family prompts and clear source checks.",
      topic: "A question worth bringing", introduction: "You open the oracle and suddenly cannot decide what to ask. Will everything work out? Do they love me? Is this the right path? Those questions carry real feelings, but they give a symbolic reading very little context. You do not need special words or a perfect ritual. Start with the situation in front of you, one uncertainty and something you can actually notice or do after reading.",
      takeaway: "A useful question names one situation and one next step. The result can prompt reflection; it cannot supply facts about another person or guarantee an outcome.",
      sections: [
        ["Start with one situation, not your whole future", "Write down what has happened in a plain sentence before you draw: we keep postponing a conversation about moving, or I have an offer but have not clarified the working hours. Then ask what deserves your attention next. This gives you a way to read the imagery without stretching every line to fit everything in your life. It also helps you notice when an interpretation has wandered away from the question. You can keep identifying details out of the text; names, addresses and private messages are usually unnecessary for this kind of reflection. Specific does not have to mean personally revealing."],
        ["For love: move from mind-reading to conversation", "Instead of asking whether someone secretly loves you, try: what do I need to clarify before asking where this relationship is going? Or: how can I explain my need for reassurance without speaking for my partner? These versions do not promise a hidden answer. They return attention to what you can say, ask and observe. For example, write the sentence you have been avoiding, then check whether it invites an honest response or already contains an accusation. A reading cannot establish someone else’s feelings, loyalty or intentions. Their own words and consistent actions remain the evidence you need in the relationship."],
        ["For work: read a fortune stick through a job-offer example",
          "What does a Chinese fortune stick mean for your career? Begin with the actual text and the work question you brought, rather than treating its grade as a yes or no. In this fictional example, a person has an offer with a more senior title and must reply by Friday. The interview described a flexible schedule, but weekend availability and the first month’s responsibilities remain unclear. The appealing title and the unresolved conditions are both part of the situation.",
          "The first question is ‘Will this job be good for me?’ A more useful version is ‘Before I reply on Friday, what should I clarify about the work I would actually be taking on?’ Write that down before drawing. It gives you a reference point when a hopeful or unsettling image catches your attention. You do not need the company’s name, a salary figure or a private offer letter to describe this uncertainty.",
          "For a sourced reading exercise, open the Chinese Temples Committee’s Guanyin No. 1. Its opening presents a world opening into favourable conditions. That is a brief paraphrase of one published version, not a universal career meaning or a full translation. For this exercise we choose the text deliberately; nobody is claimed to have drawn it. The source identifies a poem, not the quality of an employer, and DestinyPixel’s entry with the same number need not reproduce it.",
          "Now separate image, interpretation and fact. The opening imagery might help the reader name their hope: ‘I want room to begin something new.’ A second question follows: ‘What would actually be new in the first month?’ Neither sentence appears in the poem as a promise about this job. Write both the hoped-for opportunity and the unresolved schedule beside the reading. This prevents an encouraging image from making the less attractive details disappear. With a different text, start again from its own words rather than transplanting this meaning.",
          "A concrete next message could be: ‘Thank you for the offer. Before I reply on Friday, could you clarify the usual working pattern, whether weekend availability is expected, and the main responsibilities for my first month?’ Compare the response with what was said at interview and keep a written note. If the answer stays vague, mark that condition as unresolved; another draw cannot supply the missing information. The decision still depends on the actual terms and your circumstances.",
          "Before the reply deadline, review what changed: which question received an answer, which assumption you corrected and what remains unknown. Record why you accepted, declined or asked for more time, rather than whether the sign ‘came true’. On DestinyPixel, you can choose Career in the fortune-stick tool, draw, read the source note and then request an optional AI explanation of the entry actually shown. A short question might be: ‘I have an offer, but the schedule is unclear. What should I clarify before replying?’ Keep identifying details out. If you already have a temple slip, use the collection-and-edition guide to check its words first."],
        ["For change: make the next step small enough to see", "When everything feels unsettled, a question about the rest of your life invites an answer too large to use. Narrow it to a near-term action: what am I overlooking before I make this move, or what could help me test this new routine for a week? A useful outcome might be a conversation, a practical check or a small experiment. It need not be a dramatic revelation. Write down what you expect to learn and when you will review it. The point is to reduce the distance between reflection and action, while leaving room for new information to change your view."],
        ["Draw once, then read the source note", "On DestinyPixel, select a collection and topic, keep one question in mind and let the draw finish. You can then request an optional AI interpretation for the question. First read the numbered text and its source note: the site combines selected traditional material with modern symbolic readings rather than reproducing every temple edition. A traditional verse, a translation, a modern adaptation and an AI explanation are different layers. If you already hold a temple slip, check its named collection and wording before matching the number online. The next guide explains why the number alone is not enough to identify the text."],
        ["What if you dislike the answer?", "Pause before drawing again just to obtain a more comfortable line. Notice what bothered you and separate the image in the text from a fact about your situation. Write three short notes: the question I brought, the phrase that caught my attention and one thing I can check or discuss. You may decide that the reading is not useful; there is no need to force it to fit. Revisit the situation when circumstances change, rather than treating repeated draws as a way to make reality agree. This question-writing routine is DestinyPixel’s practical suggestion, not a claim about a universal temple ritual."],
        ["For family: turn a shared worry into a clear question",
          "A family question for Chinese fortune sticks can focus on a shared responsibility, a difficult conversation or a boundary. Start with one recent situation rather than asking whether the whole household will be lucky. The following fictional example is a question-writing exercise, not a traditional verse or a prediction.",
          "Two adult siblings help a parent with shopping and visits. Plans keep changing at the last minute, and one sibling feels responsible for filling every gap. ‘Will my family be all right?’ expresses the worry but leaves the disagreement undefined. A more focused question is: ‘Before we agree on next week’s visits, what do I need to clarify about the tasks I can take on?’ This asks about the speaker’s preparation without deciding that the other sibling is uncaring.",
          "Separate three things before reading: what happened, what you inferred and what remains to ask. ‘Two visits changed at short notice’ is an observation. ‘They do not care’ is an interpretation. ‘Which days can each of us actually manage?’ is a question for the people involved. Keep the parent’s preferences in the conversation too; a fair arrangement is not simply a timetable made on their behalf.",
          "A useful next sentence might be: ‘I can do Tuesday’s shopping, but I cannot cover every last-minute change. What can each of us commit to, and how will we flag a change?’ If the issue is privacy rather than tasks, ask what boundary you need to explain before sharing family news. Keep that as a separate question instead of combining every household concern into one draw."],
        ["How to read a family answer without turning it into a verdict",
          "There is no single family meaning that applies to every fortune stick. Read the actual wording, collection and source note, then relate the image to your original question. If a reading brings patience to mind, that might prompt you to choose a calmer moment for the conversation; it does not require you to absorb an unfair workload. If it brings cooperation to mind, ask for a specific agreement rather than assuming that someone will help. These are modern examples of reflection, not quotations from a numbered lot. A reading cannot establish a relative’s motives or tell you how a health problem will turn out.",
          "On DestinyPixel, choose a collection, then select Family. The Guanyin collection is described on this site as a starting point for family and care questions; this is a guide to the site, not a rule for every temple. You may keep the question in mind for the draw. To use ‘Interpret with my question’ afterward, write a brief situation and the question you want the AI to address. For example: ‘We share visits to a parent, but plans keep changing. What should I clarify before agreeing to next week’s tasks?’ Omit names, addresses, diagnoses and private messages. More context can make an explanation more relevant; it does not make a prediction more accurate.",
          "Before leaving the reading, note one action and a time to review it: ‘Ask about everyone’s availability tonight; review the arrangement next Sunday.’ Check whether the agreement became clearer or needs another conversation, rather than searching for proof that the sign came true. If you are matching a paper slip from a temple, use the collection-and-edition guide below before treating an online number as the same text."],
      ], action: { label: "Bring one question to the oracle", href: "/sticks" },
    },
    zh: {
      title: "求签怎么问问题？感情、家庭与工作提问实例",
      description: "事业签怎么看、工作邀请该怎么问？用完整虚构实例区分签文意象、自己的理解和待核实条件，附感情与家宅提问示例、读签步骤及来源核对。",
      topic: "把问题说清楚", introduction: "打开签堂，反而不知道问什么：一切会好吗？他爱我吗？这条路对不对？这些问题背后有真实的情绪，却很难给象征性解读一个清楚的落点。不需要特别的措辞，先说清眼前的处境、一件不确定的事，以及看完以后能观察或做的一小步。",
      takeaway: "一次只问一个处境中的一个问题。签文可以引发思考，不能替你查明别人的想法，也不能保证结果。",
      sections: [
        ["先说一个处境，不问整个未来", "抽之前，用普通话写一句发生了什么，例如：我们一直拖着没谈搬家的事；我收到了工作邀请，但还不清楚工作时间。然后再问接下来该留意什么。这样读签时就不必把每一句硬套到整个人生，也更容易发现解释有没有偏离问题。描述具体，不代表要提交姓名、地址和私人聊天记录；通常不需要这些信息。"],
        ["问感情：从猜心转向沟通", "与其问“对方是不是偷偷爱我”，可以问：“谈关系下一步之前，我还需要说清什么？”或者：“我怎样表达需要被回应，而不替对方下结论？”这类问法把关注点放回能说、能问、能观察的事情。试着写下你一直没说出口的那句话，看看它是在邀请回答，还是已经包含指责。签文无法证实一个人的感情、忠诚和意图，这些仍需要对方自己的表达与持续行动。"],
        ["事业签怎么看：从一份工作邀请读到下一步",
          "问事业抽到一支签，先把实际签文与带来的工作问题放在一起，不急着把吉凶等级当成“接受”或“拒绝”。下面是一个虚构练习：有人收到职位更高的工作邀请，需要在周五前回复。面试时说工作时间灵活，但周末是否需要随时响应、入职首月具体负责什么，都还没讲清楚。职位的吸引力和条件的不确定性，需要同时保留在眼前。",
          "最初的问题是“这份工作对我好吗？”可以改成：“周五回复之前，我还需要核实即将承担的哪些工作？”抽签前先记下来。这样遇到令人期待或担心的意象时，能回头对照自己原来问的是什么。说明这个处境不需要公司名称、具体薪资，也不用上传私人录用文件。",
          "为了示范有出处的读法，可以打开华人庙宇委员会的观音第一签。开篇借天地展开呈现良好契机；这里只概述这一公开版本的意象，不把它当成所有事业签的通用答案或完整译文。本练习是主动选文阅读，不声称某个人实际抽中了它。来源能帮助确认是哪首诗，不能替你确认雇主好坏；本站相同号码的条目也未必复制这个版本。",
          "接着分开意象、理解与事实。“天地展开”的画面，可以让读者说出自己的期待：“我想有机会做些新的事情。”然后追问：“入职第一个月，具体会有什么不同？”这两句是结合处境后的思考，不是诗里对这份工作的承诺。把期待的机会和未弄清的作息写在一起，避免因一句吉意就忽略不太好看的条件。换了一首签文，就重新从那首的实际文字开始，不能套用此例的意思。",
          "下一步可以这样问：“谢谢这次邀请。我想在周五回复前确认一下：通常的工作安排是怎样的，周末是否需要响应，以及入职第一个月的主要职责是什么？”把答复与面试时的说法对照，自己留一份文字记录。如果对方仍说得含糊，就把这一项标为未确认；重抽一签也补不出缺少的信息。最后的选择仍需依据真实条件和自己的处境。",
          "在回复期限前回看：哪一项得到了答复，哪个原先的理解被纠正，还有什么没弄清。记下自己接受、拒绝或请求更多考虑时间的理由，不必把复盘写成“签灵不灵”。在本站的抽签工具中，可以把问题类型选为“事业”，抽签后先读来源说明，再按需请AI解释当前实际显示的条目。问题可以简写为：“我收到工作邀请，但作息还不清楚。回复前需要核实什么？”不写可识别个人的信息。如果手里已经有寺庙纸签，先用签系与版本指南核对原文。"],
        ["问变化：把下一步缩小到看得见", "生活一团乱时，问一辈子往哪里走，很容易得到大到无法使用的回答。不如改成：“搬家前，我可能忽略了什么？”或“接下来一周，我怎样试行这个新习惯？”有用的结果可能只是一次谈话、一次核查或一个小实验，不必是惊天启示。写清想了解什么，以及什么时候回顾，让反思与行动接起来，也允许新信息改变自己的看法。"],
        ["抽一签，再看来源说明", "在本站选择签系与主题，带着一个问题完成抽签，再按需请求AI解释。先读签文旁的来源说明：本站包含部分传统资料和现代象征解读，不是每座庙本的完整复制。传统原文、译文、现代改写、AI解释是不同层次。如果手里已有寺庙签纸，应先确认签系与文字，再按号码查找。下一篇指南会说明为什么签号相同，内容也可能不同。"],
        ["不喜欢答案时，先不要急着重抽", "留意到底是哪句话让你不舒服，把象征画面与现实事实分开。记三件事：我带来的问题、吸引我注意的句子、接下来能核实或讨论的一件事。觉得没帮助，也可以承认不适合，不必强行对号入座。等处境有变化再回看，比反复抽到满意为止更容易看清自己在意什么。这套提问练习是本站的实用建议，不代表所有寺庙都采用同一种仪式。"],
        ["问家庭：把共同的担忧说成一个清楚的问题",
          "求家宅、家庭签时，可以围绕共同责任、一次难开口的谈话，或需要说清的界限来问。先选最近发生的一件事，不必一下问整个家庭的吉凶。下面是虚构的提问练习，不是传统签文，也不是对某个家庭的预言。",
          "例如，成年兄妹轮流帮父母买东西、安排探望，但时间总在临时变动，其中一人觉得每个空缺都得自己补。“我们家以后会好吗？”说出了担忧，却没有指出分歧。不妨改成：“商量下周探望安排前，我需要先说清自己能承担哪些事？”这样问的是自己的准备，不会先认定另一个人不关心父母。",
          "读签前，先分开三件事：发生了什么、自己怎样理解、还有什么需要问。“两次探望临时改了时间”是观察；“对方根本不在乎”是推测；“大家各自哪几天确实有空？”才是需要向当事人确认的问题。也要听父母自己的意愿，不能只替他们排好时间表。",
          "下一步可以这样开口：“周二的采购我能负责，但临时变动我不一定都能补上。我们各自能确定哪几项，改时间时怎么提前说？”如果真正困扰你的是隐私，可以另问：“告诉亲戚这件事前，我需要先说明什么界限？”不要把分工、隐私和所有家事混进同一签。"],
        ["家宅签怎样读，才不会变成给家人下判词",
          "“问家宅”并不意味着每支签都有同一个答案。先读实际文字、签系和来源，再联系最初的问题。如果读后想到“耐心”，可以考虑换个平静的时机沟通，而不是要求自己一直承担不公平的分工；如果想到“合作”，就具体谈谁做哪件事，而不是默认别人一定会帮忙。这些是本站的现代思考示例，不对应某个签号，也不是引用庙本。签文不能查明亲人的真实动机，更不能据此判断疾病会如何发展。",
          "在 DestinyPixel 选择签系后，可把问题类型选为“家宅”。本站观音签入口包含家庭与照护主题，这是本站的使用说明，不代表所有寺庙都有相同分类。抽签时可以只在心中想好问题；想用“结合问题解读”，再写下简短处境和要问的事，例如：“我们轮流探望父母，但安排总在临时变动。答应下周的分工前，我需要先说清什么？”不必写姓名、地址、病情或私人聊天记录。补充处境能帮助解释更贴近问题，不代表预言会更准。",
          "读完记下一项行动和回顾时间，例如：“今晚问清大家的空闲时间，下周日再看看分工是否需要调整。”回顾的是约定有没有变清楚、是否还需要沟通，不是努力寻找签意应验的证据。如果你拿的是寺庙纸签，先用下方的签系与版本指南核对文字，不能仅凭相同号码认定网上就是同一支签。"],
      ], action: { label: "带着一个问题进入签堂", href: "/sticks?locale=zh" },
    },
    ru: {
      title: "Как задать вопрос оракулу палочек: семья, любовь и работа",
      description: "Как читать китайский жребий о работе? Пример предложения о работе: вопрос, образ в стихе и проверка условий. Также вопросы о любви и семье и сверка источника.",
      topic: "Сформулировать свой вопрос", introduction: "Вы открыли оракул и растерялись: всё ли получится, любит ли он меня, верно ли я иду? За этими словами стоят настоящие чувства, но символическому чтению не хватает контекста. Начните с одной ситуации, одной неопределённости и небольшого действия, которое возможно после чтения. Особые слова и идеальный ритуал не нужны.",
      takeaway: "Полезный вопрос описывает одну ситуацию и ближайший шаг. Чтение может помочь размышлению, но не раскрывает чужие мысли и не гарантирует результат.",
      sections: [
        ["Одна ситуация вместо всего будущего", "Сначала запишите, что произошло: вы откладываете разговор о переезде или получили предложение работы без ясного графика. Затем спросите, на что обратить внимание дальше. Так меньше соблазна подгонять каждую строку под всю жизнь и легче заметить, что интерпретация ушла в сторону. Конкретность не требует раскрывать личное: имена, адреса и переписка для такого размышления обычно не нужны."],
        ["В любви: от чтения мыслей к разговору", "Вместо вопроса о тайных чувствах попробуйте: что стоит прояснить перед разговором о будущем отношений? Или: как объяснить потребность в поддержке, не отвечая за партнёра? Запишите избегаемую фразу и проверьте, приглашает ли она ответить или уже обвиняет. Чтение не устанавливает верность, чувства или намерения другого человека. Его слова и последовательные поступки остаются необходимыми свидетельствами."],
        ["О работе: от чтения жребия к проверке предложения",
          "Что означает китайский жребий для карьеры? Начните с самого текста и своего вопроса о работе, а не превращайте оценку удачи в «да» или «нет». В этом вымышленном примере человек получил предложение более высокой должности и должен ответить до пятницы. На собеседовании говорили о гибком графике, но не уточнили, нужно ли быть на связи по выходным и что предстоит делать в первый месяц. Привлекательное название должности и неясные условия — две части одной ситуации.",
          "Первый вопрос звучит так: «Подойдёт ли мне эта работа?» Более конкретный вариант: «Что мне нужно уточнить о будущей работе, прежде чем ответить в пятницу?» Запишите его до вытягивания. Это поможет вернуться к исходной теме, если образ в тексте обнадёжит или встревожит. Для описания этой неопределённости не нужны название компании, сумма зарплаты или личное письмо с предложением.",
          "Для упражнения с проверяемым источником откройте жребий Гуаньинь № 1 Комитета китайских храмов. В его начале образ раскрывающегося мира связан с благоприятными условиями. Это краткий пересказ образа одной опубликованной версии, а не универсальное значение для карьеры или полный перевод. Текст выбран для упражнения намеренно: мы не утверждаем, что кто-то его вытянул. Источник устанавливает стих, но не качество работодателя; запись с тем же номером на DestinyPixel не обязательно воспроизводит эту версию.",
          "Теперь разделите образ, интерпретацию и факт. Образ начала может помочь назвать надежду: «Мне хочется заняться чем-то новым». Следующий вопрос: «Что именно изменится в первый месяц?» Это размышления о ситуации, а не обещания о конкретной работе, содержащиеся в стихе. Запишите рядом желаемую возможность и неясность с графиком, чтобы обнадёживающий образ не вытеснил неудобные детали. Для другого текста начните с его собственных слов, не переносите на него значение этого примера.",
          "Следующее сообщение может быть таким: «Спасибо за предложение. Прежде чем я отвечу в пятницу, уточните, пожалуйста, обычный рабочий график, необходимость быть на связи по выходным и основные обязанности в первый месяц». Сравните ответ с тем, что обсуждалось на собеседовании, и сохраните письменную заметку. Если ответ расплывчатый, отметьте этот пункт как невыясненный: новый жребий не восполнит недостающие сведения. Решение по-прежнему зависит от реальных условий и ваших обстоятельств.",
          "До срока ответа подведите итог: какой вопрос прояснился, какое предположение пришлось исправить и что осталось неизвестным. Запишите, почему вы согласились, отказались или попросили больше времени, а не «сбылся ли знак». На DestinyPixel в инструменте жребиев можно выбрать тему «Карьера», вытянуть палочку, прочитать примечание об источнике и затем запросить необязательное объяснение ИИ именно показанной записи. Краткий вопрос: «Мне предложили работу, но график неясен. Что уточнить перед ответом?» Не добавляйте личные данные. Если у вас уже есть храмовый листок, сначала сверьте его текст по руководству о коллекциях и изданиях."],
        ["В переменах: достаточно маленький шаг", "Когда всё неопределённо, вопрос обо всей жизни даёт слишком большой ответ. Лучше спросить, что вы упускаете перед переездом или как попробовать новый распорядок в течение недели. Результатом может стать разговор, проверка или небольшой эксперимент. Запишите, что хотите узнать и когда вернётесь к оценке. Это связывает размышление с действием и оставляет возможность изменить мнение после новых сведений."],
        ["Вытяните палочку и прочитайте источник", "На DestinyPixel выберите коллекцию и тему, сосредоточьтесь на одном вопросе и дождитесь окончания. Затем при желании запросите объяснение ИИ. Сначала прочитайте пометку об источнике: библиотека сочетает отдельные традиционные материалы с современными символическими текстами. Оригинал, перевод, адаптация и объяснение ИИ — разные слои. Если у вас храмовый листок, сверяйте название коллекции и слова, а не только номер."],
        ["Если ответ не понравился", "Не спешите тянуть снова ради приятной строки. Отметьте, что задело, и отделите образ от факта. Запишите исходный вопрос, привлёкшую внимание фразу и одно дело для проверки или обсуждения. Можно признать, что чтение вам не помогло: подгонять его не требуется. Возвращайтесь, когда ситуация изменится. Это практическое упражнение DestinyPixel, а не утверждение о едином ритуале всех храмов."],
        ["О семье: от общей тревоги к ясному вопросу",
          "Вопрос китайскому оракулу палочек о семье может касаться общей обязанности, трудного разговора или личной границы. Начните с одной недавней ситуации, а не с судьбы всей семьи. Следующий вымышленный пример — упражнение в постановке вопроса, а не традиционный стих или предсказание.",
          "Взрослые брат и сестра помогают родителю с покупками и договариваются о визитах. Планы постоянно меняются в последний момент, и одному из них приходится закрывать все пробелы. «Всё ли будет хорошо в нашей семье?» выражает тревогу, но не уточняет разногласие. Более конкретный вопрос: «Что мне нужно прояснить о своих возможностях, прежде чем мы распределим визиты на следующую неделю?» Здесь речь о подготовке самого человека, без вывода, что другому безразличен родитель.",
          "Перед чтением отделите наблюдение, предположение и вопрос к участникам. «Время двух визитов изменилось в последний момент» — наблюдение. «Ему всё равно» — предположение. «В какие дни каждый из нас действительно свободен?» — вопрос, который нужно обсудить. Учитывайте и желания родителя: справедливое распределение помощи не сводится к расписанию, составленному за него.",
          "Начать разговор можно так: «Я могу купить продукты во вторник, но не смогу подстраиваться под каждое изменение. Что каждый из нас готов взять на себя и как мы будем предупреждать об изменениях?» Если проблема касается личных границ, задайте отдельный вопрос: «Что мне нужно оговорить, прежде чем делиться семейными новостями с родственниками?» Не объединяйте обязанности, приватность и все остальные семейные тревоги в одно вытягивание."],
        ["Как прочитать ответ о семье, не вынося приговор близким",
          "Единого семейного значения для всех палочек нет. Сначала прочитайте сам текст, название коллекции и пометку об источнике, затем соотнесите образ с исходным вопросом. Если чтение напомнило о терпении, это может побудить выбрать спокойное время для разговора, но не обязывает терпеть несправедливое распределение забот. Если возникла тема сотрудничества, обсудите конкретную договорённость, а не предполагайте, что помощь появится сама. Это современные примеры размышления, не цитаты из определённого жребия. Чтение не устанавливает мотивы родственника и не показывает, как будет развиваться заболевание.",
          "На DestinyPixel выберите коллекцию, затем тему «Семья». Раздел Гуаньинь на этом сайте включает вопросы семьи и заботы о близких; это описание сайта, а не общее правило всех храмов. При вытягивании можно держать вопрос в уме. Если затем хотите воспользоваться кнопкой «Толковать мой вопрос», кратко опишите ситуацию и вопрос для ИИ. Например: «Мы по очереди навещаем родителя, но планы постоянно меняются. Что мне нужно уточнить, прежде чем согласиться на обязанности следующей недели?» Не указывайте имена, адреса, диагнозы и личную переписку. Контекст помогает сделать объяснение уместнее, но не повышает точность предсказания.",
          "В конце запишите одно действие и срок пересмотра: «Сегодня вечером уточнить, кто когда свободен; в следующее воскресенье обсудить, подходит ли договорённость». Проверяйте, стало ли распределение понятнее и нужен ли ещё разговор, а не ищите подтверждение исполнения знака. Если у вас бумажный храмовый жребий, сначала сверьте текст по руководству о коллекциях и изданиях ниже: одинаковый номер ещё не означает одинаковый текст."],
      ], action: { label: "Перейти к оракулу палочек", href: "/sticks?locale=ru" },
    },
  },

];

const careerReadingTables: Record<"en" | "zh" | "ru", NonNullable<JournalTranslation["sections"][number]["table"]>> = {
  en: { headings: ["Keep separate", "In this fictional example"], rows: [
    ["Known situation", "An offer with a more senior title; a reply is due on Friday."],
    ["Personal interpretation", "A wish for a fresh start. This describes the reader’s hope, not an employer’s commitment."],
    ["Missing facts", "Weekend availability and first-month responsibilities. Ask the hiring contact for clarification."],
    ["Review", "Compare the answer with the interview, note remaining gaps and record the reasons for your decision."],
  ] },
  zh: { headings: ["分开记录", "这个虚构例子里是什么"], rows: [
    ["已知处境", "收到职位更高的邀请，需要在周五前回复。"],
    ["个人理解", "期待一个新的开始。这是在说自己的愿望，不是雇主作出的承诺。"],
    ["缺少的事实", "周末响应要求和首月职责；向招聘联系人询问清楚。"],
    ["回顾", "把答复与面试说法对照，记下剩余疑问和自己作决定的理由。"],
  ] },
  ru: { headings: ["Разделите записи", "В этом вымышленном примере"], rows: [
    ["Известная ситуация", "Предложена более высокая должность; ответ нужен до пятницы."],
    ["Личная интерпретация", "Желание начать новое. Это надежда читателя, не обязательство работодателя."],
    ["Недостающие факты", "Доступность по выходным и обязанности в первый месяц. Уточните их у представителя работодателя."],
    ["Итог", "Сравните ответ с собеседованием, отметьте оставшиеся пробелы и причины своего решения."],
  ] },
};

function translation(entry: Entry, locale: "en" | "zh" | "ru"): JournalTranslation {
  const copy = entry[locale];
  const sourceLabels: Record<string, Record<"en" | "zh" | "ru", string>> = {
    "https://www.hko.gov.hk/en/gts/time/stemsandbranches.htm": { en: "Hong Kong Observatory: stems and branches", zh: "香港天文台：天干与地支", ru: "Гонконгская обсерватория: стволы и ветви" },
    "https://www.iana.org/time-zones": { en: "IANA: Time Zone Database", zh: "IANA：时区数据库", ru: "IANA: база часовых поясов" },
    "/compatibility": { en: "DestinyPixel: current comparison method", zh: "DestinyPixel：当前配对方法", ru: "DestinyPixel: метод сравнения" },
    "/product-facts": { en: "DestinyPixel: tool inputs, AI and saving", zh: "DestinyPixel：工具输入、AI 与保存范围", ru: "DestinyPixel: данные, ИИ и сохранение" },
    "/sticks": { en: "DestinyPixel: collections and source notes", zh: "DestinyPixel：签系与来源说明", ru: "DestinyPixel: коллекции и источники" },
    "/learn/guanyin-fortune-sticks": { en: "Guanyin collection guide", zh: "观音签资料范围（英文）", ru: "Коллекция Гуаньинь (на английском)" },
    "/journal/prepare-birth-date-time-place": { en: "Prepare your birth details", zh: "准备出生日期、时间与地点", ru: "Подготовка данных рождения" },
  };
  return { ...copy, sections: copy.sections.map(([title, ...paragraphs], index) => ({
    id: entry.slug === "compatibility-without-birth-time" ? birthTimeSectionIds[index] : `step-${index + 1}`, title, paragraphs,
    ...(entry.slug === "how-to-ask-fortune-sticks" && index === 2 ? {
      table: careerReadingTables[locale],
      links: [
        { text: { en: "fortune-stick tool", zh: "抽签工具", ru: "инструменте жребиев" }[locale], href: `/sticks${locale === "en" ? "" : `?locale=${locale}`}` },
        { text: { en: "collection-and-edition guide", zh: "签系与版本指南", ru: "руководству о коллекциях и изданиях" }[locale], href: `/journal/fortune-stick-number-and-edition${locale === "en" ? "" : `?locale=${locale}`}` },
      ],
      sources: [{ label: { en: "Chinese Temples Committee: Guanyin No. 1 (Chinese)", zh: "华人庙宇委员会：观音第一签（繁体原文）", ru: "Комитет китайских храмов: Гуаньинь № 1 (китайский)" }[locale], href: "https://www.ctc.org.hk/chim/%E8%A7%80%E9%9F%B3%E7%B1%A4-%E7%AC%AC%E4%B8%80%E7%B1%A4/" }],
    } : {}),
    ...(entry.slug === "compatibility-without-birth-time" && index === 2 ? { links: [{
      text: { en: "Reveal our connection", zh: "看看我们的相处图谱", ru: "Сравнить наши карты" }[locale],
      href: `/compatibility${locale === "en" ? "" : `?locale=${locale}`}#compare`,
    }] } : {}),
    ...(entry.slug === "compatibility-without-birth-time" && index === 7 ? { links: [{
      text: { en: "product facts page", zh: "产品事实页", ru: "странице фактов о продуктах" }[locale],
      href: `/product-facts${locale === "en" ? "" : `?locale=${locale}`}`,
    }] } : {}),
    ...(entry.slug === "how-to-ask-fortune-sticks" && index === copy.sections.length - 1 ? { links: [{
      text: { en: "collection-and-edition guide", zh: "签系与版本指南", ru: "руководству о коллекциях и изданиях" }[locale],
      href: `/journal/fortune-stick-number-and-edition${locale === "en" ? "" : `?locale=${locale}`}`,
    }] } : {}),
    ...(index === copy.sections.length - 1 ? { sources: entry.sources.map(source => ({ ...source, label: sourceLabels[source.href]?.[locale] ?? source.label, href: source.href.startsWith("/journal/") || source.href === "/compatibility" || source.href === "/sticks" || source.href === "/product-facts" ? `${source.href}${locale === "en" ? "" : `?locale=${locale}`}` : source.href })) } : {}),
  })) };
}

export const searchGrowthArticles: JournalSourceArticle[] = [...entries.map(entry => ({
  slug: entry.slug, relatedSlug: entry.relatedSlug, publishedAt: "2026-09-20", updatedAt: entry.slug === "compatibility-without-birth-time" ? "2026-11-03" : entry.slug === "how-to-ask-fortune-sticks" ? "2026-11-13" : "2026-09-20",
  translations: { en: translation(entry, "en"), zh: translation(entry, "zh") },
})), baziCompatibilityArticle, fortuneStickEditionsArticle, sunMoonRisingArticle];
export const searchGrowthRussian: Record<string, JournalTranslation> = { ...Object.fromEntries(entries.map(entry => [entry.slug, translation(entry, "ru")])), [fortuneStickEditionsArticle.slug]: fortuneStickEditionsRussian, [baziCompatibilityArticle.slug]: baziCompatibilityRussian, [sunMoonRisingArticle.slug]: sunMoonRisingRussian };
