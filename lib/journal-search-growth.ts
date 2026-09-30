import { birthTimeArticle } from "./compatibility/birth-time-article";
import type { JournalSourceArticle, JournalTranslation } from "./journal";

type Edition = {
  title: string; description: string; topic: string; introduction: string; takeaway: string;
  sections: [string, string][]; action: { label: string; href: string };
};
type Entry = { slug: string; relatedSlug: string; sources: { label: string; href: string }[]; en: Edition; zh: Edition; ru: Edition };

// Original, task-focused guides. Section order is shared across complete editions.
const entries: Entry[] = [
  {
    slug: "bazi-vs-chinese-zodiac-compatibility", relatedSlug: "compatibility-without-birth-time",
    sources: [{ label: "Hong Kong Observatory · 干支与八字 · Небесные стволы и земные ветви", href: "https://www.hko.gov.hk/en/gts/time/stemsandbranches.htm" }, { label: "DestinyPixel · Compatibility method / 配对方法 / Метод сравнения", href: "/compatibility" }],
    en: {
      title: "BaZi vs Chinese zodiac compatibility: beyond your birth-year animal",
      description: "Same zodiac animal, different relationship styles? Compare year-sign matching with Four Pillars, five elements and DestinyPixel’s free compatibility tool.",
      topic: "Love & the five elements",
      introduction: "You look up two Chinese zodiac animals and find a perfect match. Yet one of you wants to settle every disagreement immediately, while the other needs a quiet evening first. Did you read the wrong table? A year-animal pairing describes a very small part of the system. This guide separates the calendar, the symbolic interpretation and the conversation you can actually have together, without asking a score to decide your relationship.",
      takeaway: "A year animal is one calendar label. BaZi uses year, month, day and hour. More detail makes a comparison more specific, but does not make it a proven measure of love.",
      sections: [
        ["What does a Chinese zodiac compatibility table compare?", "A familiar zodiac chart starts with the animal associated with a birth year and compares it with another animal. It is easy to remember and easy to share, which makes it a useful cultural introduction. But two people assigned the same animal can have different birth months, days and hours. A year-based table cannot distinguish those inputs. Near a calendar boundary, also check which convention the calculator follows rather than choosing a year from a generic poster. DestinyPixel’s full birth calculation uses the start of spring, LiChun, for its year boundary; that should not be silently confused with Lunar New Year."],
        ["What does BaZi add?", "BaZi means eight characters: a stem and a branch for each of four calendar pillars. The Hong Kong Observatory describes how these pairs are used for years, months, days and hours, and how they form a sixty-pair cycle. That is evidence for the calendar structure, not for predictions about a couple. In a reading, the day stem becomes a reference point for discussing the five elements. Looking at both complete sets can reveal different symbolic patterns despite identical year animals. It still cannot tell you whether someone keeps promises, listens during conflict or shares your plans for the future."],
        ["How to read supporting and controlling elements", "Wood, fire, earth, metal and water form a traditional vocabulary of relationships. A supporting relationship can become a prompt about giving and receiving; a controlling relationship can become a prompt about boundaries or friction. Avoid translating these straight into good partner and bad partner. For example, one person may experience frequent advice as care while the other hears constant correction. The useful next question is what each person actually needs: encouragement, practical help or room to decide. This is a way to explore a metaphor together, not a claim that an element caused either person’s behavior or that conflict is inevitable."],
        ["Where do the sixty animal cards fit?", "DestinyPixel’s sixty animal portraits give the calendar combinations memorable visual identities. The names, artwork and character stories are an original presentation, not sixty ancient personality diagnoses. Read your own card first and choose one description that fits a real incident, then one that does not. Invite your partner to do the same instead of announcing what their card means about them. Two people can identify with similar images while expressing affection very differently. The cards work best as an opening to that discussion; they are not additional evidence that a relationship is destined, and their illustrations do not add hidden points to the score."],
        ["What the free comparison actually calculates", "The current tool combines a BaZi element comparison with selected planetary comparisons. Its overall index uses thirty percent BaZi and seventy percent planetary comparisons, then presents the result on an editorial scale from sixty to one hundred. That number is not a measured probability of staying together. The page also compares personality, communication, affection and everyday rhythm, and shows the two animal portraits. AI can explain the supplied result but does not choose the score. This is not a complete traditional marriage assessment or a full Western synastry reading: it does not calculate houses, rising signs or a marriage date."],
        ["Turn the reading into one useful conversation", "Both people should check their recorded date, time and selected birthplace before comparing. Then pick one small, observable question rather than trying to settle your entire future: after a difficult workday, do you want questions, company or quiet first? Each person answers before looking back at the reading. Agree on one action to try, such as saying when you will return to a paused conversation. A week later, discuss whether that helped. If the result does not fit, say so and keep the real experience. The value of this exercise is a clearer conversation, not persuading either person to accept a label."],
      ], action: { label: "Compare your two birth charts free", href: "/compatibility" },
    },
    zh: {
      title: "生肖配对和八字合婚有什么区别？从属相看到五行与相处方式",
      description: "同样的生肖，为什么相处模式不同？讲清生肖配对、四柱八字、五行关系与60动物卡的区别，并了解免费情感匹配的实际计算范围。",
      topic: "感情与五行", introduction: "查生肖时明明写着“很般配”，真正相处却是一个人想立刻讲清楚，另一个人想先安静一晚。是配对表错了，还是你们不够了解彼此？年生肖只提供很小的一部分信息。这篇指南把历法、象征解读和两个人真正能讨论的事情分开，让配对结果成为交流的起点。",
      takeaway: "生肖配对通常只看出生年的动物；八字使用年、月、日、时四柱。信息更具体，不等于已经科学验证了感情好坏。",
      sections: [
        ["生肖配对表到底在比较什么？", "常见配对表从出生年的动物出发，与另一个动物作比较。它好记、好分享，适合作为文化入口，却区分不了同属一个生肖、但出生月份、日期和时辰不同的人。处在换年边界附近时，还要先确认采用什么历法规则，不能只照一张年份海报选属相。本站完整出生计算以立春作为年柱边界，不应与农历正月初一混用。"],
        ["八字比生肖多看了什么？", "四柱中的每一柱都有一个天干和一个地支，年、月、日、时合起来就是八个字。香港天文台介绍了这些干支如何用于纪年、纪月、纪日和纪时，以及六十组合的循环；这支持历法结构的说明，不是对感情预测的验证。解读时，日干可以作为理解五行关系的参照。同生肖的人可能有不同的组合，但这些组合不能替你确认一个人是否守信、是否愿意倾听、是否与你有一致的生活计划。"],
        ["五行相生相克，怎样读成相处问题？", "木、火、土、金、水之间的关系，是传统象征语言。“相生”可以引出给予与接受的话题，“相克”可以引出边界与摩擦，但不能直接翻译成好伴侣与坏伴侣。比如，一个人不断提建议，自己觉得是在关心，对方却觉得总被纠正。这时真正有用的问题是：你此刻需要鼓励、实际帮助，还是自己决定的空间？这是借助比喻讨论具体体验，并不是说某种元素造成了这些行为。"],
        ["60动物卡在这里起什么作用？", "本站把六十种历法组合设计成具有记忆点的动物意象。名字、画面和角色故事属于原创呈现，不是六十种古代人格诊断。可以先各自选出卡片里一条符合真实经历的描述，再选一条不符合的，让对方自己表达，不要替对方宣布“你就是这样的人”。卡片帮助打开话题，不能证明命定关系，图画也不会在分数里额外加上看不见的权重。"],
        ["免费匹配现在怎么算？", "当前工具把八字元素比较与部分行星关系结合，总体指标中八字占30%，行星比较占70%，再呈现为60—100的编辑尺度。它不是维持关系的成功概率。结果还提供性格、沟通、感情表达与日常节奏的比较，以及双方动物意象。AI解释已经算出的结果，不决定分数。它不等于完整传统合婚或完整西方合盘，也不计算宫位、上升星座和婚期。"],
        ["把结果变成一次有用的对话", "先由双方核对出生日期、记录时间与出生城市，再选一个可以观察的小问题：工作不顺回家时，你更希望有人问、有人陪，还是先安静？各自先回答，再回看结果。约定一件可以试行的事，例如暂停争论时明确什么时候回来继续说。一周后讨论有没有帮助。描述不符合就保留不同意见；重点是让沟通更清楚，而不是让任何一方服从标签。"],
      ], action: { label: "免费比较两个人的出生图谱", href: "/compatibility?locale=zh" },
    },
    ru: {
      title: "Совместимость по бацзы и китайскому зодиаку: что меняется кроме животного года",
      description: "Почему одинаковые знаки не означают одинаковые отношения: четыре столпа, пять элементов, 60 животных и границы бесплатного сравнения DestinyPixel.",
      topic: "Отношения и пять элементов", introduction: "Таблица обещает прекрасное сочетание знаков, но после ссоры одному хочется немедленно поговорить, а другому нужен тихий вечер. Ошибка ли это? Животное года описывает лишь небольшую часть символической системы. Разберём отдельно календарь, интерпретацию и разговор, который действительно можно провести вдвоём, не поручая оценке решать судьбу отношений.",
      takeaway: "Животное года — одна календарная метка. Бацзы использует год, месяц, день и час. Более подробное сравнение не становится от этого доказанным измерением любви.",
      sections: [
        ["Что сравнивает таблица животных года?", "Обычная таблица сопоставляет животных двух лет рождения. Её легко запомнить, но она не различает людей одного знака с разными месяцами, днями и часами рождения. Вблизи смены года важно уточнять календарное правило, а не брать знак с общего плаката. В полном расчёте DestinyPixel границей годового столпа служит начало весны Личунь; это не то же самое, что первый день лунного нового года."],
        ["Что добавляют четыре столпа?", "Каждый столп содержит небесный ствол и земную ветвь: вместе год, месяц, день и час дают восемь знаков. Гонконгская обсерватория описывает эти календарные пары и цикл из шестидесяти сочетаний. Это источник о календаре, а не доказательство предсказаний. Ствол дня служит ориентиром в символическом чтении пяти элементов. Но даже разные сочетания не показывают, держит ли человек слово, умеет ли слушать и совпадают ли ваши жизненные планы."],
        ["Как понимать поддержку и сдерживание элементов?", "Дерево, огонь, земля, металл и вода образуют традиционный язык отношений. Поддержка может предложить тему отдачи и принятия, сдерживание — тему границ. Это не деление на хороших и плохих партнёров. Один даёт советы из заботы, другой слышит постоянные исправления. Спросите, что сейчас нужно: поддержка, конкретная помощь или свобода решения. Здесь метафора помогает обсудить опыт; она не доказывает, что элемент вызвал поведение или сделал конфликт неизбежным."],
        ["Зачем нужны шестьдесят животных?", "Названия, изображения и характеры карт DestinyPixel — авторское оформление календарных сочетаний, а не древняя диагностика личности. Каждый может выбрать одно описание, совпадающее с реальным случаем, и одно неподходящее. Не назначайте партнёру характер за него. Даже похожие образы не означают одинаковый способ проявлять нежность. Карты открывают разговор, не доказывают предопределённость союза и не добавляют тайных баллов к оценке."],
        ["Что вычисляет бесплатный инструмент?", "Общий показатель сочетает сравнение элементов бацзы с отдельными планетными отношениями: тридцать процентов и семьдесят процентов соответственно. Шкала от шестидесяти до ста — редакционный индекс, не вероятность успешного брака. Есть сравнения характера, общения, проявления чувств и повседневного ритма. ИИ объясняет готовый результат, но не выставляет балл. Это не полная традиционная оценка брака и не полная западная синастрия: дома, асценденты и дата свадьбы не рассчитываются."],
        ["Как перейти от чтения к разговору?", "Сначала оба проверьте дату, записанное время и город рождения. Затем независимо ответьте на небольшой вопрос: после тяжёлого рабочего дня вам нужны вопросы, компания или тишина? Сравните ответы с чтением и договоритесь об одном действии, например заранее говорить, когда вернётесь к прерванному разговору. Через неделю обсудите результат. Если описание не подходит, сохраните своё несогласие. Цель — яснее понимать друг друга, а не подчиняться ярлыку."],
      ], action: { label: "Бесплатно сравнить две карты", href: "/compatibility?locale=ru" },
    },
  },
  {
    slug: "compatibility-without-birth-time", relatedSlug: "bazi-vs-chinese-zodiac-compatibility",
    sources: [{ label: "IANA · Time Zone Database / 时区资料 / База часовых поясов", href: "https://www.iana.org/time-zones" }, { label: "DestinyPixel · Birth details / 出生资料 / Данные рождения", href: "/journal/prepare-birth-date-time-place" }],
    ...birthTimeArticle,
  },
  {
    slug: "how-to-ask-fortune-sticks", relatedSlug: "fortune-stick-number-and-edition",
    sources: [{ label: "DestinyPixel · Fortune sticks / 抽签使用说明 / Оракул палочек", href: "/sticks" }, { label: "DestinyPixel · Guanyin collection guide / 观音签指南 / Коллекция Гуаньинь", href: "/learn/guanyin-fortune-sticks" }],
    en: {
      title: "How to ask a fortune-stick question: love, work and change",
      description: "Turn a vague fortune-stick question into a useful one. Practical love and career examples, a simple draw routine, and how to turn a reading into a next step.",
      topic: "A question worth bringing", introduction: "You open the oracle and suddenly cannot decide what to ask. Will everything work out? Do they love me? Is this the right path? Those questions carry real feelings, but they give a symbolic reading very little context. You do not need special words or a perfect ritual. Start with the situation in front of you, one uncertainty and something you can actually notice or do after reading.",
      takeaway: "A useful question names one situation and one next step. The result can prompt reflection; it cannot supply facts about another person or guarantee an outcome.",
      sections: [
        ["Start with one situation, not your whole future", "Write down what has happened in a plain sentence before you draw: we keep postponing a conversation about moving, or I have an offer but have not clarified the working hours. Then ask what deserves your attention next. This gives you a way to read the imagery without stretching every line to fit everything in your life. It also helps you notice when an interpretation has wandered away from the question. You can keep identifying details out of the text; names, addresses and private messages are usually unnecessary for this kind of reflection. Specific does not have to mean personally revealing."],
        ["For love: move from mind-reading to conversation", "Instead of asking whether someone secretly loves you, try: what do I need to clarify before asking where this relationship is going? Or: how can I explain my need for reassurance without speaking for my partner? These versions do not promise a hidden answer. They return attention to what you can say, ask and observe. For example, write the sentence you have been avoiding, then check whether it invites an honest response or already contains an accusation. A reading cannot establish someone else’s feelings, loyalty or intentions. Their own words and consistent actions remain the evidence you need in the relationship."],
        ["For work: identify the missing fact", "A question such as should I accept this role can feel impossible because several questions are bundled together. Try asking what you need to clarify before deciding. After the reading, list the concrete facts still missing: expected hours, responsibilities, reporting arrangements or how success will be assessed. Choose one fact to obtain from the relevant person or document. The symbolic text may help you articulate a concern, but it cannot verify an employer’s promises or calculate whether an offer is financially suitable. Keep the actual decision attached to real terms and your own circumstances rather than treating an encouraging phrase as a recommendation."],
        ["For change: make the next step small enough to see", "When everything feels unsettled, a question about the rest of your life invites an answer too large to use. Narrow it to a near-term action: what am I overlooking before I make this move, or what could help me test this new routine for a week? A useful outcome might be a conversation, a practical check or a small experiment. It need not be a dramatic revelation. Write down what you expect to learn and when you will review it. The point is to reduce the distance between reflection and action, while leaving room for new information to change your view."],
        ["Draw once, then read the source note", "On DestinyPixel, select a collection and topic, keep one question in mind and let the draw finish. You can then request an optional AI interpretation for the question. First read the numbered text and its source note: the site combines selected traditional material with modern symbolic readings rather than reproducing every temple edition. A traditional verse, a translation, a modern adaptation and an AI explanation are different layers. If you already hold a temple slip, check its named collection and wording before matching the number online. The next guide explains why the number alone is not enough to identify the text."],
        ["What if you dislike the answer?", "Pause before drawing again just to obtain a more comfortable line. Notice what bothered you and separate the image in the text from a fact about your situation. Write three short notes: the question I brought, the phrase that caught my attention and one thing I can check or discuss. You may decide that the reading is not useful; there is no need to force it to fit. Revisit the situation when circumstances change, rather than treating repeated draws as a way to make reality agree. This question-writing routine is DestinyPixel’s practical suggestion, not a claim about a universal temple ritual."],
      ], action: { label: "Bring one question to the oracle", href: "/sticks" },
    },
    zh: {
      title: "求签怎么问问题？感情、事业与人生变化的六个实用步骤",
      description: "不知道抽签时该问什么？用感情与工作实例，把模糊问题改成可沟通、可核实的问题，再把签文转成一个实际行动。",
      topic: "把问题说清楚", introduction: "打开签堂，反而不知道问什么：一切会好吗？他爱我吗？这条路对不对？这些问题背后有真实的情绪，却很难给象征性解读一个清楚的落点。不需要特别的措辞，先说清眼前的处境、一件不确定的事，以及看完以后能观察或做的一小步。",
      takeaway: "一次只问一个处境中的一个问题。签文可以引发思考，不能替你查明别人的想法，也不能保证结果。",
      sections: [
        ["先说一个处境，不问整个未来", "抽之前，用普通话写一句发生了什么，例如：我们一直拖着没谈搬家的事；我收到了工作邀请，但还不清楚工作时间。然后再问接下来该留意什么。这样读签时就不必把每一句硬套到整个人生，也更容易发现解释有没有偏离问题。描述具体，不代表要提交姓名、地址和私人聊天记录；通常不需要这些信息。"],
        ["问感情：从猜心转向沟通", "与其问“对方是不是偷偷爱我”，可以问：“谈关系下一步之前，我还需要说清什么？”或者：“我怎样表达需要被回应，而不替对方下结论？”这类问法把关注点放回能说、能问、能观察的事情。试着写下你一直没说出口的那句话，看看它是在邀请回答，还是已经包含指责。签文无法证实一个人的感情、忠诚和意图，这些仍需要对方自己的表达与持续行动。"],
        ["问事业：找出缺的那条信息", "“我该不该接受这份工作”常常把很多问题挤在一起。可以先问：“作决定前，我还需要核实什么？”看完后列出缺的信息：工作时间、职责、汇报关系，或评价表现的方式，再挑一项去向相关人员或文件求证。象征文字可以帮你说清担忧，但不能核实雇主承诺，也不能替你判断收入安排是否适合自己。实际选择还是要回到真实条件。"],
        ["问变化：把下一步缩小到看得见", "生活一团乱时，问一辈子往哪里走，很容易得到大到无法使用的回答。不如改成：“搬家前，我可能忽略了什么？”或“接下来一周，我怎样试行这个新习惯？”有用的结果可能只是一次谈话、一次核查或一个小实验，不必是惊天启示。写清想了解什么，以及什么时候回顾，让反思与行动接起来，也允许新信息改变自己的看法。"],
        ["抽一签，再看来源说明", "在本站选择签系与主题，带着一个问题完成抽签，再按需请求AI解释。先读签文旁的来源说明：本站包含部分传统资料和现代象征解读，不是每座庙本的完整复制。传统原文、译文、现代改写、AI解释是不同层次。如果手里已有寺庙签纸，应先确认签系与文字，再按号码查找。下一篇指南会说明为什么签号相同，内容也可能不同。"],
        ["不喜欢答案时，先不要急着重抽", "留意到底是哪句话让你不舒服，把象征画面与现实事实分开。记三件事：我带来的问题、吸引我注意的句子、接下来能核实或讨论的一件事。觉得没帮助，也可以承认不适合，不必强行对号入座。等处境有变化再回看，比反复抽到满意为止更容易看清自己在意什么。这套提问练习是本站的实用建议，不代表所有寺庙都采用同一种仪式。"],
      ], action: { label: "带着一个问题进入签堂", href: "/sticks?locale=zh" },
    },
    ru: {
      title: "Как задать вопрос оракулу палочек: любовь, работа и перемены",
      description: "Практические примеры вопросов об отношениях и работе: как уточнить ситуацию, прочитать источник текста и выбрать небольшой следующий шаг.",
      topic: "Сформулировать свой вопрос", introduction: "Вы открыли оракул и растерялись: всё ли получится, любит ли он меня, верно ли я иду? За этими словами стоят настоящие чувства, но символическому чтению не хватает контекста. Начните с одной ситуации, одной неопределённости и небольшого действия, которое возможно после чтения. Особые слова и идеальный ритуал не нужны.",
      takeaway: "Полезный вопрос описывает одну ситуацию и ближайший шаг. Чтение может помочь размышлению, но не раскрывает чужие мысли и не гарантирует результат.",
      sections: [
        ["Одна ситуация вместо всего будущего", "Сначала запишите, что произошло: вы откладываете разговор о переезде или получили предложение работы без ясного графика. Затем спросите, на что обратить внимание дальше. Так меньше соблазна подгонять каждую строку под всю жизнь и легче заметить, что интерпретация ушла в сторону. Конкретность не требует раскрывать личное: имена, адреса и переписка для такого размышления обычно не нужны."],
        ["В любви: от чтения мыслей к разговору", "Вместо вопроса о тайных чувствах попробуйте: что стоит прояснить перед разговором о будущем отношений? Или: как объяснить потребность в поддержке, не отвечая за партнёра? Запишите избегаемую фразу и проверьте, приглашает ли она ответить или уже обвиняет. Чтение не устанавливает верность, чувства или намерения другого человека. Его слова и последовательные поступки остаются необходимыми свидетельствами."],
        ["В работе: найдите недостающий факт", "Вопрос о принятии предложения часто объединяет сразу несколько неизвестных. Спросите, что нужно уточнить до решения. После чтения перечислите реальные пробелы: график, обязанности, кому подчиняться, как оценивается работа. Выберите один пункт и получите ответ у соответствующего человека или в документе. Символический текст помогает сформулировать тревогу, но не проверяет обещания работодателя и не определяет финансовую пригодность предложения."],
        ["В переменах: достаточно маленький шаг", "Когда всё неопределённо, вопрос обо всей жизни даёт слишком большой ответ. Лучше спросить, что вы упускаете перед переездом или как попробовать новый распорядок в течение недели. Результатом может стать разговор, проверка или небольшой эксперимент. Запишите, что хотите узнать и когда вернётесь к оценке. Это связывает размышление с действием и оставляет возможность изменить мнение после новых сведений."],
        ["Вытяните палочку и прочитайте источник", "На DestinyPixel выберите коллекцию и тему, сосредоточьтесь на одном вопросе и дождитесь окончания. Затем при желании запросите объяснение ИИ. Сначала прочитайте пометку об источнике: библиотека сочетает отдельные традиционные материалы с современными символическими текстами. Оригинал, перевод, адаптация и объяснение ИИ — разные слои. Если у вас храмовый листок, сверяйте название коллекции и слова, а не только номер."],
        ["Если ответ не понравился", "Не спешите тянуть снова ради приятной строки. Отметьте, что задело, и отделите образ от факта. Запишите исходный вопрос, привлёкшую внимание фразу и одно дело для проверки или обсуждения. Можно признать, что чтение вам не помогло: подгонять его не требуется. Возвращайтесь, когда ситуация изменится. Это практическое упражнение DestinyPixel, а не утверждение о едином ритуале всех храмов."],
      ], action: { label: "Перейти к оракулу палочек", href: "/sticks?locale=ru" },
    },
  },
  {
    slug: "fortune-stick-number-and-edition", relatedSlug: "how-to-ask-fortune-sticks",
    sources: [{ label: "DestinyPixel · Collection and source notes / 签系与来源说明 / Коллекции и источники", href: "/sticks" }, { label: "DestinyPixel · Guanyin lookup scope / 观音查签范围 / Поиск Гуаньинь", href: "/learn/guanyin-fortune-sticks" }],
    en: {
      title: "Why the same fortune-stick number can have different meanings",
      description: "Looking up a Guanyin or temple fortune-stick number? Check the collection, original wording and edition before trusting an online meaning or AI explanation.",
      topic: "Reading the source", introduction: "You leave a temple with a numbered slip, search the number online and find a poem that looks nothing like yours. A second page gives another meaning. Before worrying that you have received contradictory predictions, check whether the pages are even discussing the same text. A number identifies a position within a collection; by itself it does not establish the collection, the edition or the wording you are trying to understand.",
      takeaway: "Match the named collection and the actual verse before matching an interpretation. A familiar number is not enough to identify your temple slip.",
      sections: [
        ["Start with the name above the number", "Keep a note of the temple or publisher, the collection name and the number exactly as shown on your slip. A Guanyin collection and a Guandi collection should not be treated as interchangeable search results just because both contain a number thirty-three. If the slip has no clear collection name, keep the opening line and ask the place that issued it when possible. You can record this privately without uploading a photograph. The first task is identifying the text, not deciding whether the online interpretation sounds comforting. A page with a confident title can still belong to the wrong collection."],
        ["Compare words before comparing meanings", "Place the opening lines side by side. Are they the same verse, a translation of it or a completely different text? Check any title, accompanying story and source note as well. A modern paraphrase may intentionally use different words, but it should make clear what it is paraphrasing. If the opening lines do not match and the page supplies no edition information, stop short of claiming you have found the meaning of your exact slip. You can still read it as a separate symbolic text. Keeping those two uses distinct prevents a search result from silently replacing the document you actually received."],
        ["Separate four layers of a reading", "The original verse is the text being discussed. A translation carries it into another language and may need to explain images or wordplay. An adaptation can reshape the imagery for a contemporary audience. An interpretation then connects the text with a situation or question. These layers can all be useful, but they do different jobs. A newly written English reflection is not automatically a line-by-line translation of a Chinese poem. An AI response based on that reflection is another interpretive layer, not a newly discovered historical source. Look for clear labels before treating any of these versions as interchangeable evidence."],
        ["What DestinyPixel’s number lookup provides", "The site offers five collections, with one hundred entries each for Guanyin, Guandi and Wong Tai Sin, and sixty each for Yuelao and the Wealth Gods. These are the ranges in this product, not a statement that every temple uses these same collections. The library combines selected traditional material with modern symbolic texts. Its source notes distinguish the kind of material shown, and language editions may contain adaptations rather than matching translations. When you enter a number, you retrieve the corresponding entry in this library. That does not certify that the entry reproduces the exact paper slip you obtained elsewhere."],
        ["Can AI explain the slip anyway?", "An AI explanation is useful only within the material and context supplied to it. On this site the optional reading explains the displayed library entry in relation to your question. It does not authenticate your temple slip, consult an unseen original or inspect a photograph of the paper you are holding. If the displayed entry differs from your slip, its explanation belongs to that displayed entry. Avoid filling the gap by assuming that all versions must mean the same thing. For a specific temple edition, consult its own published explanation or ask the issuing temple about the actual wording when that is possible."],
        ["A simple lookup checklist", "Before searching, collect four details: collection name, number, opening line and named source if one is printed. In a search query, include the collection and an exact opening phrase rather than only the number. Once you find a candidate page, compare its wording and source label, then decide whether you want a translation, cultural context or a personal reflection. Those are different requests and may need different resources. If you cannot identify the edition, keep that uncertainty in your notes. You can still use a modern reading as a conversation prompt, while being honest that you have not established the meaning of the original temple document."],
      ], action: { label: "Explore the collections and source notes", href: "/sticks" },
    },
    zh: {
      title: "同一个签号，为什么签文不同？查观音灵签前先核对这四件事",
      description: "寺庙求到的签和网上解签不一样？先查签系、签号、原文与版本，区分传统签文、翻译、现代改写和AI解释。",
      topic: "读签也读来源", introduction: "从庙里带回一张签纸，按号码一搜，诗句却完全不同；再打开另一页，解释又变了。先别急着理解成互相矛盾的预言，要确认大家谈的是不是同一篇文字。签号标记的是某个签系内部的位置，单靠数字不能确定签系、版本和你手中那段文字。",
      takeaway: "先对签系和实际诗句，再对解释。号码一样，不足以证明网上找到的就是手里的那支签。",
      sections: [
        ["先看号码上方写的是什么", "记下寺庙或出版者、签系名称，以及签纸上的号码。观音签和关帝签即使都出现第三十三签，也不能当成同一个搜索结果。签系不清楚时，保留开头原句，条件允许就向发签处询问。可以自己记录，不必上传签纸照片。第一步是辨认文字，不是挑一个听起来舒服的解释；标题再肯定，也可能来自不同签系。"],
        ["先比较文字，再比较意思", "把签诗开头并排看：是同一首、翻译，还是完全不同的文字？也看看题名、典故和来源注记。现代转述可以换措辞，但应说明依据什么改写。如果开头不同，页面又没有版本信息，就不要声称已经找到了手中签纸的准确解释。它仍可以作为另一段象征文字来阅读，只是不能悄悄替换原来得到的那张签。"],
        ["把四个层次分清楚", "原文是被讨论的文字；翻译把它转成另一种语言，可能需要解释意象和双关；改写为现代读者重新组织表达；解读则把文字与具体问题联系起来。四者都可能有用，但作用不同。新写的一段英文反思不自动等于中文签诗的逐句翻译，AI再解释它，也不是发现了新的古籍来源。把标签读清楚，再决定如何使用。"],
        ["本站按签号查到的是什么？", "本站观音、关帝、黄大仙各收录100个条目，月老和财神各60个，这是产品里的编号范围，并不代表每座庙都用这套排列。资料库包含部分传统材料与现代象征文字，来源说明标记材料类型，不同语言也可能采用改写而非逐句对应。输入号码查到的是本站资料库中的对应条目，并不能认证它就是你在别处领到的纸签。"],
        ["AI能不能直接解释手里的签？", "本站可选AI解读依据当前显示的资料库条目和你提交的问题，不会认证寺庙签纸，不会读到未提供的原文，也不会查看你手里拿着的纸张照片。如果显示条目与手中签纸不同，解释针对的就是显示条目。不要自行假设所有版本意思都一样。想核实某一庙本，应寻找该版本公开说明，或在条件允许时询问发签处的原文含义。"],
        ["查签前的一张小清单", "保留四项：签系、号码、开头原句、印刷来源。搜索时带上签系和一段准确原句，不只输入数字。找到候选页面后核对文字与来源，再明确自己要的是翻译、文化背景，还是个人反思，这可能需要不同资料。版本无法确认，就保留这个不确定性；可以用现代解读打开话题，同时诚实地承认还没有核实原签的解释。"],
      ], action: { label: "查看签系、签文与来源说明", href: "/sticks?locale=zh" },
    },
    ru: {
      title: "Почему один номер палочки может означать разные тексты?",
      description: "Как сверить храмовый листок с онлайн-оракулом: название коллекции, первые строки, издание и различия между переводом, адаптацией и ответом ИИ.",
      topic: "Текст и его источник", introduction: "Вы принесли из храма пронумерованный листок, нашли номер в интернете, а стих оказался другим. Следующая страница объясняет его иначе. Прежде чем видеть противоречивые предсказания, проверьте, о том ли тексте речь. Номер обозначает место внутри коллекции; сам по себе он не устанавливает коллекцию, издание или слова вашего листка.",
      takeaway: "Сначала сопоставьте коллекцию и сам стих, затем объяснение. Одинакового номера недостаточно, чтобы опознать храмовый текст.",
      sections: [
        ["Посмотрите на название над номером", "Сохраните название храма или издателя, коллекцию и номер в исходном виде. Коллекции Гуаньинь и Гуаньди не взаимозаменяемы, даже если обе содержат номер тридцать три. Если название неясно, запишите первую строку и по возможности спросите там, где получили листок. Загружать фотографию необязательно. Сначала нужно установить текст, а не выбрать самое утешительное объяснение."],
        ["Сравните слова раньше значений", "Сопоставьте первые строки: это тот же стих, перевод или совсем другой текст? Проверьте заголовок, сопровождающую историю и указание источника. Современный пересказ может менять слова, но должен обозначать основу. Если строки не совпадают, а издание не названо, нельзя уверенно считать страницу толкованием именно вашего листка. Читать её отдельно можно, незаметно подменять ею исходный документ — не стоит."],
        ["Различайте четыре слоя", "Оригинал — обсуждаемый текст. Перевод переносит его в другой язык и иногда объясняет образы. Адаптация меняет подачу для современной аудитории. Интерпретация связывает текст с вопросом человека. Это разные задачи. Новый английский текст не обязательно является построчным переводом китайского стиха, а объяснение ИИ не превращается в найденный исторический источник. Сначала прочитайте обозначения этих слоёв."],
        ["Что выдаёт поиск номера на DestinyPixel?", "В продукте по сто записей для Гуаньинь, Гуаньди и Вонг Тай Сина и по шестьдесят для Юэлао и богов богатства. Это диапазоны сайта, не утверждение об устройстве всех храмовых изданий. Библиотека объединяет отдельные традиционные материалы и современные символические тексты, а языковые версии могут быть адаптациями. Поиск возвращает запись этой библиотеки, но не удостоверяет её совпадение с полученной в другом месте бумажной палочкой или листком."],
        ["Что в таком случае объясняет ИИ?", "Дополнительное чтение на сайте использует отображаемую запись и ваш вопрос. Оно не удостоверяет храмовый листок, не читает невидимый оригинал и не рассматривает фотографию бумаги у вас в руках. Если запись отличается от листка, объяснение относится к записи. Не предполагайте автоматически одинаковый смысл всех версий. Для конкретного издания ищите его опубликованное объяснение или спрашивайте выдавший документ храм, когда это возможно."],
        ["Короткая проверка перед поиском", "Запишите коллекцию, номер, первую строку и указанный источник. В запрос добавьте название и точную фразу, а не только цифру. На найденной странице сопоставьте текст и источник, затем решите, что вам нужно: перевод, культурный контекст или личное размышление. Если издание не удалось установить, сохраните эту неопределённость. Современное чтение можно использовать как начало разговора, не объявляя его проверенным объяснением исходного документа."],
      ], action: { label: "Открыть коллекции и пояснения источников", href: "/sticks?locale=ru" },
    },
  },
];

function translation(entry: Entry, locale: "en" | "zh" | "ru"): JournalTranslation {
  const copy = entry[locale];
  const sourceLabels: Record<string, Record<"en" | "zh" | "ru", string>> = {
    "https://www.hko.gov.hk/en/gts/time/stemsandbranches.htm": { en: "Hong Kong Observatory: stems and branches", zh: "香港天文台：天干与地支", ru: "Гонконгская обсерватория: стволы и ветви" },
    "https://www.iana.org/time-zones": { en: "IANA: Time Zone Database", zh: "IANA：时区数据库", ru: "IANA: база часовых поясов" },
    "/compatibility": { en: "DestinyPixel: current comparison method", zh: "DestinyPixel：当前配对方法", ru: "DestinyPixel: метод сравнения" },
    "/sticks": { en: "DestinyPixel: collections and source notes", zh: "DestinyPixel：签系与来源说明", ru: "DestinyPixel: коллекции и источники" },
    "/learn/guanyin-fortune-sticks": { en: "Guanyin collection guide", zh: "观音签资料范围（英文）", ru: "Коллекция Гуаньинь (на английском)" },
    "/journal/prepare-birth-date-time-place": { en: "Prepare your birth details", zh: "准备出生日期、时间与地点", ru: "Подготовка данных рождения" },
  };
  return { ...copy, sections: copy.sections.map(([title, paragraph], index) => ({
    id: `step-${index + 1}`, title, paragraphs: [paragraph],
    ...(index === copy.sections.length - 1 ? { sources: entry.sources.map(source => ({ ...source, label: sourceLabels[source.href]?.[locale] ?? source.label, href: source.href.startsWith("/journal/") || source.href === "/compatibility" || source.href === "/sticks" ? `${source.href}${locale === "en" ? "" : `?locale=${locale}`}` : source.href })) } : {}),
  })) };
}

export const searchGrowthArticles: JournalSourceArticle[] = entries.map(entry => ({
  slug: entry.slug, relatedSlug: entry.relatedSlug, publishedAt: "2026-09-20", updatedAt: entry.slug === "compatibility-without-birth-time" ? "2026-09-30" : "2026-09-20",
  translations: { en: translation(entry, "en"), zh: translation(entry, "zh") },
}));
export const searchGrowthRussian: Record<string, JournalTranslation> = Object.fromEntries(entries.map(entry => [entry.slug, translation(entry, "ru")]));
