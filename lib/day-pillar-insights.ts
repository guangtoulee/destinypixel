import type { ContentLocale } from "./report-i18n";

export type DayPillarInsight = { headline: string; personality: string; career: string; love: string };
type Reading = [headline: string, personality: string, career: string, love: string];
type Entry = { zh: Reading; en: Reading; ru: Reading };

/** Public editorial readings adapted from 日柱.xlsx, B2:F61 (2026-09-14).
 * Symbolic archetypes, not generated or purchased report content. The workbook's
 * health claims, guaranteed wealth, diagnoses and insulting labels are excluded.
 * Keys follow the actual stem-branch pair; existing public artwork names stay intact.
 */
const insights: Record<string, Entry> = {
  甲子: {
    zh: ["脑海里已经远航，第一步还在岸上。", "你喜欢想透再行动，也容易替别人多想一步。点子很丰富，真正的挑战是选一个开始。", "把复杂问题讲明白，是值得打磨的能力。教育、策划与咨询中的作品和口碑，比不断换方向更能积累信任。", "你容易被聪明、有深度的交流吸引。独处能让你充电，但提前说一句需要空间，比突然安静更让人安心。"],
    en: ["Your mind has sailed ahead. Your first step is still on shore.", "You see possibilities and think things through. Choosing one idea to start can be harder than imagining ten.", "Explaining complex ideas is a skill to develop. Teaching, strategy and consulting reward a body of work people can trust.", "A great conversation can spark attraction. Solitude restores you; explaining that need keeps it from feeling like distance."],
    ru: ["Мысли уже в пути, а первый шаг еще впереди.", "Вы видите много возможностей и любите все обдумать. Выбрать одну идею бывает сложнее, чем придумать десять.", "Развивайте умение объяснять сложное. В обучении, стратегии и консалтинге доверие растет через конкретные работы.", "Вас привлекает содержательный разговор. Уединение восстанавливает силы; объясняйте эту потребность, чтобы она не казалась отчуждением."],
  },
  乙丑: {
    zh: ["安静的外表，藏着不肯将就的目标。", "你习惯先观察，再默默把事情做成。耐心是优势，但不必把所有压力都自己吞下。", "你能把琐碎资源整理得井井有条。财务、运营与幕后统筹，可以成为练习稳健执行的方向。", "稳定和实际行动很能打动你。遇到分歧时，别只讨论怎么解决事情，也说说自己为什么难受。"],
    en: ["A quiet presence. An ambition that refuses to settle.", "You watch, prepare and follow through. Patience helps you; carrying every pressure alone does not.", "You can bring order to scattered resources. Finance operations, coordination and behind-the-scenes work offer room to develop that skill.", "Consistency means more to you than grand gestures. In a disagreement, explain the feeling as well as the practical problem."],
    ru: ["За спокойствием скрывается серьезная цель.", "Вы наблюдаете, готовитесь и доводите дело до конца. Терпение помогает, но не требует справляться со всем в одиночку.", "Вам близко упорядочивание ресурсов. Финансовые процессы, координация и организация работы дают пространство для этого навыка.", "Постоянство важнее громких жестов. В споре говорите не только о решении, но и о своих чувствах."],
  },
  丙寅: {
    zh: ["你的出现，让房间里的气氛亮起来。", "热情、乐于带头，也很想把经验分享出去。你的感染力很强，记得给别人自己发现答案的空间。", "表达与动员是可以培养的优势。教学、演讲、内容创作与销售，都需要把热情变成清晰、有用的信息。", "你通过照顾与鼓励表达爱。对方有时需要的只是被理解，先问要不要建议，再开启指导模式。"],
    en: ["You bring the spark that gets a room moving.", "Warmth and initiative come naturally in this portrait. Share your experience while leaving others room to find their own answers.", "Practice turning enthusiasm into useful communication. Teaching, speaking, content creation and sales all draw on that ability.", "You show love through encouragement. Ask whether your partner wants advice or simply someone to listen."],
    ru: ["Вы приносите искру, которая оживляет разговор.", "Этому образу близки тепло и инициатива. Делитесь опытом, оставляя другим возможность найти собственный ответ.", "Учитесь превращать энтузиазм в ясную речь. Это полезно в обучении, выступлениях, создании контента и продажах.", "Вы выражаете любовь поддержкой. Спросите, нужен ли совет или сейчас важнее просто выслушать."],
  },
  丁卯: {
    zh: ["你听见的，常常是话语之外的那一句。", "你对气氛和细节很敏锐，温柔里有丰富的内心活动。直觉可以提供线索，答案仍需要确认。", "把观察写成文字、画面或作品。写作、艺术与文化内容，能给你的细腻感受一个具体出口。", "你期待精神上的理解。对方一个眼神就可能让你想很久，把猜测变成温和的提问，会省去许多内耗。"],
    en: ["You notice the sentence nobody actually said.", "You pick up on atmosphere and small details. Intuition can offer a clue; a conversation helps check it.", "Give observations a tangible form through writing, art or cultural projects. Sensitivity becomes useful when others can experience the work.", "You want to feel deeply understood. When a look troubles you, a gentle question works better than filling in the story alone."],
    ru: ["Вы замечаете то, что осталось между словами.", "Вы чувствительны к атмосфере и деталям. Интуиция подсказывает, но разговор помогает проверить догадку.", "Придавайте наблюдениям форму текста, искусства или культурного проекта. Чуткость становится понятнее через конкретную работу.", "Вам важно глубокое понимание. Если взгляд вызывает тревогу, мягкий вопрос полезнее самостоятельного придумывания ответа."],
  },
  戊辰: {
    zh: ["别人还在讨论，你已经开始搭起支撑。", "你重视稳定与掌控，愿意为重要的事承担责任。力量感来自可靠，也需要给不同意见留位置。", "你能把人、流程和资源放进同一张计划。项目管理、工程与运营，可以磨练你的统筹能力。", "你想成为对方的靠山。支持与替人做主只有一步之遥，重大决定里要给伴侣真正的选择权。"],
    en: ["While others discuss the plan, you build its foundations.", "You value stability and take responsibility seriously. Reliability becomes stronger when it makes room for other perspectives.", "Connecting people, processes and resources can be your craft. Project management, engineering and operations are places to practice it.", "You want to be someone others can lean on. Support includes giving your partner a real say in major decisions."],
    ru: ["Пока другие обсуждают план, вы создаете опору.", "Вы цените устойчивость и ответственность. Надежность становится сильнее, когда допускает другие точки зрения.", "Вам близко соединять людей, процессы и ресурсы. Этот навык пригодится в управлении проектами, инженерии и операционной работе.", "Вы хотите быть опорой. Поддержка предполагает реальное участие партнера в важных решениях."],
  },
  己巳: {
    zh: ["你很会让场面舒服，却未必让自己放松。", "你读得懂社交气氛，懂分寸，也在意呈现。得体是能力，偶尔不完美也不会让你的价值减少。", "关系维护、品牌沟通与客户服务值得探索。让合作建立在持续兑现承诺上，而不只是一场漂亮的见面。", "你欣赏体面、有吸引力的伴侣。亲密关系也需要真实的疲惫和脆弱，不必每次见面都像正式登场。"],
    en: ["You make everyone comfortable. Can you relax too?", "You read a room and present yourself thoughtfully. Being polished is a skill, not a requirement for being valued.", "Explore relationship management, brand communication or client service. Lasting connections depend on keeping promises after the first impression.", "You appreciate confidence and presence. Intimacy also needs room for tired days and honest vulnerability."],
    ru: ["Вы создаете комфорт другим. А себе?", "Вы чувствуете ситуацию и умеете держаться. Безупречная подача — навык, а не условие вашей ценности.", "Попробуйте работу с клиентами, коммуникациями бренда или партнерствами. Доверие держится на выполненных обещаниях.", "Вас привлекают уверенность и выразительность. Близости также нужны усталые дни и искренняя уязвимость."],
  },
  庚午: {
    zh: ["你的认真，是安全感，也可能变成压力。", "你看重原则、自律和责任，答应了就想做好。标准能保护品质，但人不可能时刻处于满分状态。", "规则清晰、责任明确的工作更便于发挥。合规、管理与流程执行，需要你把原则用在具体问题上。", "你用可靠表达爱。把对自己的高要求直接套给伴侣之前，先确认那是不是双方共同认可的约定。"],
    en: ["Your standards create safety. Leave room to breathe.", "Principle, discipline and responsibility matter to you. High standards protect quality, but people cannot perform perfectly every day.", "Clear responsibilities help you focus. Compliance, management and process delivery let you turn principles into practical decisions.", "You show care by being dependable. Make expectations a shared agreement rather than an unspoken test."],
    ru: ["Ваши стандарты дают опору. Оставьте место отдыху.", "Вы цените принципы, дисциплину и ответственность. Стандарты берегут качество, но люди не могут всегда быть безупречными.", "Ясные обязанности помогают сосредоточиться. Управление, соблюдение правил и организация процессов позволяют применять принципы на практике.", "Вы заботитесь через надежность. Пусть ожидания будут общей договоренностью, а не негласным экзаменом."],
  },
  辛未: {
    zh: ["柔和的样子，藏着很硬的主心骨。", "你有自己的审美与判断，压力下也不轻易放弃。坚持很珍贵，表达立场不一定需要锋利的话。", "设计、手艺与独立项目能容纳你的个人标准。先把一项技能做扎实，再逐步争取自主空间。", "你会坚定维护在乎的人。情绪升高时先停一下，把真正想保护的东西说出来，比说狠话更有力量。"],
    en: ["A soft manner with a backbone of steel.", "You have your own taste and convictions. Persistence matters; a firm position does not need a sharp delivery.", "Design, craft and independent projects can make space for your standards. Build depth in one skill before expanding your independence.", "You fiercely support people you love. When upset, name what you want to protect before choosing your words."],
    ru: ["Мягкая манера и твердый внутренний стержень.", "У вас собственный вкус и убеждения. Настойчивость ценна, а твердой позиции не обязательно нужны резкие слова.", "Дизайн, ремесло и самостоятельные проекты дают место вашим стандартам. Начните с глубины одного навыка.", "Вы защищаете близких. В раздражении сначала назовите то, что хотите сохранить, и только затем подбирайте слова."],
  },
  壬申: {
    zh: ["你总能找到解法，未必先接住情绪。", "你偏爱逻辑、知识与长期积累。看得清问题是优势，感受有时也需要被认真对待。", "研究、技术和分析工作适合练习你的推理能力。可复用的方法与扎实的作品，比急着证明聪明更有价值。", "你会用解决问题表达关心。对方诉苦时，先问一句想被安慰还是一起想办法，沟通会轻松很多。"],
    en: ["You have the solution. Start with the feeling.", "Logic, knowledge and long-term learning appeal to you. Seeing a problem clearly also means noticing how it feels.", "Research, technology and analysis offer room to practice your reasoning. Repeatable methods matter more than looking clever.", "Fixing things is one way you care. Ask whether your partner wants comfort or a plan before offering solutions."],
    ru: ["Решение у вас уже есть. Начните с чувства.", "Вам близки логика, знания и постепенное обучение. Ясность включает внимание к тому, что человек чувствует.", "Исследования, технологии и аналитика развивают ваше мышление. Повторяемый метод полезнее демонстрации ума.", "Решать проблемы — ваш способ заботиться. Сначала спросите, нужны ли сейчас утешение или план действий."],
  },
  癸酉: {
    zh: ["你看得出微小裂缝，也值得看见完整的美。", "你观察细致，对品质和真诚很敏感。识别问题很快，别让挑错遮住已经做得好的部分。", "精细分析、鉴赏与质量检查能用到你的眼力。让反馈有依据、有改进路径，细节才会创造价值。", "你既期待深度，也渴望温暖。旧事再次浮现时，说明当下需要怎样的回应，比重开一次审判更有效。"],
    en: ["You spot the tiny crack. Remember the whole picture.", "You notice quality and sincerity in the details. Finding flaws quickly can make it harder to see what already works.", "Detailed analysis, appraisal and quality review can use your eye. Make feedback specific and actionable.", "You want depth as well as warmth. If an old hurt returns, explain what would help now rather than retrying the past."],
    ru: ["Вы видите тонкую трещину. Помните о целой картине.", "Вы замечаете качество и искренность в деталях. Быстро находя недостатки, легко упустить то, что уже хорошо.", "Аналитика, экспертиза и контроль качества используют вашу наблюдательность. Делайте обратную связь конкретной и полезной.", "Вам нужны глубина и тепло. Если возвращается старая обида, объясните, что поможет сейчас."],
  },
  甲戌: {
    zh: ["你总替别人守夜，也该有人替你留灯。", "你重承诺，愿意为值得的事长期付出。责任感是力量，把所有人的困难都扛过来却会耗尽自己。", "需要长期信任的管理、公益与社区项目值得探索。建立边界与协作，才能让投入持续下去。", "你认真、忠诚，也容易把付出当作责任清单。先表达自己的需要，别等对方主动读懂你的辛苦。"],
    en: ["You keep watch for others. Let someone leave a light for you.", "You value commitment and meaningful effort. Taking on everyone's burdens can drain the strength you want to offer.", "Management, community projects and mission-led work can use your persistence. Boundaries make long-term contribution possible.", "You take love seriously. Express what you need instead of hoping your sacrifices will speak for themselves."],
    ru: ["Вы бережете других. Позвольте позаботиться и о вас.", "Вы цените обязательства и осмысленные усилия. Чужие заботы могут истощить силы, которыми вы хотите делиться.", "Управление, общественные проекты и работа ради значимой цели используют вашу настойчивость. Границы помогают продолжать.", "Вы серьезно относитесь к любви. Говорите о потребностях, не ожидая, что ваши жертвы объяснят их сами."],
  },
  乙亥: {
    zh: ["想象力很辽阔，生活需要一个靠岸点。", "你温柔、有灵感，容易沉浸在可能性里。给梦想一个小小的期限，会比等待完美时机更有帮助。", "写作、艺术与创意内容可以承接你的想象。固定完成小作品，让灵感逐渐变成稳定的创作节奏。", "你向往不用多说就懂的默契。现实矛盾出现时，约定重新沟通的时间，比暂时消失更能保护关系。"],
    en: ["Your imagination is an ocean. Give it a place to land.", "Gentleness and imagination shape this portrait. A small deadline can help a dream more than waiting for perfect conditions.", "Writing, art and creative content give your ideas a form. Finish small pieces regularly to build a sustainable practice.", "You long for wordless understanding. When conflict feels overwhelming, agree on a time to return to the conversation."],
    ru: ["Воображение — океан. Найдите для него берег.", "Этому образу близки мягкость и фантазия. Небольшой срок помогает мечте больше, чем ожидание идеального момента.", "Письмо, искусство и творческий контент придают идеям форму. Регулярно завершайте небольшие работы.", "Вы мечтаете о понимании без слов. Если спор перегружает, договоритесь, когда вернетесь к разговору."],
  },
  丙子: {
    zh: ["大家都觉得你热情，真正走近却需要时间。", "你擅长与人互动，也保留着冷静的内在观察。外向不等于毫无保留，学会说明自己的节奏。", "传播、创意展示与面向客户的工作能练习你的表现力。吸引注意之后，用内容和交付留下信任。", "你容易被气质和吸引力打动。热情之后需要独处时，解释一下变化，别让对方猜自己哪里做错了。"],
    en: ["Everyone feels your warmth. Getting close takes longer.", "You can be socially expressive while keeping a private inner world. Being outgoing does not mean being constantly available.", "Communication, creative presentation and client-facing work can develop your presence. Follow attention with substance and delivery.", "Chemistry draws you in. When you need space after an intense start, explain the shift instead of leaving someone guessing."],
    ru: ["Ваше тепло чувствуют все. Для близости нужно время.", "Вы можете легко общаться и сохранять личный внутренний мир. Общительность не означает постоянной доступности.", "Коммуникации, презентации и работа с клиентами развивают выразительность. Подкрепляйте впечатление содержанием и результатом.", "Вас привлекает химия общения. Если после яркого начала нужно пространство, объясните перемену."],
  },
  丁丑: {
    zh: ["心里有一团火，嘴上却常说没事。", "你习惯把才能和情绪收在里面，默默准备很久。让别人看见阶段成果，不会削弱你的深度。", "数据分析、研究与幕后设计能容纳专注。别只埋头打磨，也练习清楚展示自己的贡献。", "你会记得细节、做实事。不满最好趁它还小就说出来，等待对方猜中，会让两个人都疲惫。"],
    en: ["A fire inside. An easy 'I'm fine' outside.", "You tend to keep talent and feelings private while preparing carefully. Sharing work in progress does not diminish its depth.", "Analysis, research and behind-the-scenes design reward focus. Practice making your contribution visible as well as refining it.", "You care through thoughtful details. Voice small frustrations early instead of waiting for someone to guess them."],
    ru: ["Внутри огонь. Снаружи привычное «все нормально».", "Вы бережете чувства и способности внутри, тщательно готовясь. Показывать промежуточный результат не значит терять глубину.", "Аналитика, исследования и проектирование требуют сосредоточенности. Учитесь также показывать свой вклад.", "Вы заботитесь через детали. Говорите о небольшом недовольстве сразу, не ожидая, что его угадают."],
  },
  戊寅: {
    zh: ["你擅长扛事，却不习惯被照顾。", "面对难题，你往往先想自己怎么解决。独立和韧性是你的底气，但求助不等于失去力量。", "开拓项目、复杂执行与解决棘手问题，能用到你的行动力。别把持续高压误当成唯一的成长方式。", "你愿意保护自己人，却容易把外面的压力一起带回家。说一句今天很累，比沉着脸让对方猜更亲近。"],
    en: ["You know how to carry the weight. Let someone care for you.", "Your first response to a challenge may be to handle it yourself. Independence is a strength; asking for help does not undo it.", "New ventures and difficult delivery problems can use your resolve. Constant pressure is not the only way to grow.", "You protect your people but may bring outside stress home. Saying 'today was hard' opens a door that silence closes."],
    ru: ["Вы умеете нести груз. Разрешите заботиться о вас.", "Столкнувшись с трудностью, вы стараетесь справиться сами. Самостоятельность — сила, которую просьба о помощи не отменяет.", "Новые проекты и сложные задачи требуют вашей решимости. Постоянное напряжение — не единственный путь роста.", "Вы защищаете близких, но можете приносить домой рабочий стресс. Слова «день был тяжелым» понятнее молчания."],
  },
  己卯: {
    zh: ["你把话说得温柔，心里其实很有判断。", "你重视氛围、审美与人际分寸。圆融能推动事情，也别让真实立场一直藏在客气后面。", "设计、传播与合作协调能用到你的品味。把好的呈现与实际价值连接起来，而不只停在包装上。", "你擅长营造舒服的相处。遇到不满时直接说出请求，比暗示或绕着讲更容易获得你想要的回应。"],
    en: ["A gentle delivery. A very clear private opinion.", "You care about atmosphere, taste and social nuance. Diplomacy helps, but your real position deserves a voice too.", "Design, communication and partnership coordination can use your taste. Connect a beautiful presentation to something genuinely useful.", "You create comfortable moments together. A direct request is kinder and clearer than a hint when something bothers you."],
    ru: ["Мягкая речь и вполне определенное мнение.", "Вы цените атмосферу, вкус и такт. Дипломатия помогает, но вашей настоящей позиции тоже нужен голос.", "Дизайн, коммуникации и координация партнерств используют ваш вкус. Связывайте красивую подачу с реальной пользой.", "Вы создаете уютное общение. Если что-то не нравится, прямой запрос понятнее намека."],
  },
  庚辰: {
    zh: ["你的决断能破局，也需要听见不同的声音。", "你行动果断，习惯承担决策角色。真正稳固的影响力，来自让别人也能坦然提出异议。", "管理、复杂项目和流程重建值得探索。把目标、权限与反馈讲清楚，比事事亲自决定更能带动团队。", "你倾向用安排和保护表达爱。家不是另一个会议室，先听完伴侣想要什么，再提供你的方案。"],
    en: ["You make the call. Make space for another voice.", "Decisiveness helps you move through uncertainty. Strong leadership also makes disagreement feel safe.", "Management, complex projects and process redesign can use your drive. Clarify goals and ownership instead of deciding every detail.", "Planning and protection can be your love language. Hear your partner's wishes before presenting the solution."],
    ru: ["Вы принимаете решение. Дайте место другому голосу.", "Решительность помогает проходить неопределенность. Сильное руководство также делает несогласие безопасным.", "Управление, сложные проекты и перестройка процессов используют вашу энергию. Проясняйте цели и ответственность.", "Вы заботитесь через планы и защиту. Прежде чем предложить решение, выслушайте желания партнера."],
  },
  辛巳: {
    zh: ["你很会向上生长，别把真实的自己留在身后。", "你善于观察机会，也愿意调整自己。适应力是优势，但外界认可不必成为唯一的评判标准。", "品牌、商务合作与资源协调能练习你的判断力。长期关系需要透明、互惠与可靠的交付。", "你欣赏有目标、有能力的人。关系若只剩共同形象，会少了温度；说说尚未成功的事，也能拉近距离。"],
    en: ["You know how to rise. Bring your real self along.", "You read opportunities and adapt deliberately. Recognition can motivate you without becoming your only measure of worth.", "Brand work, business partnerships and coordination can develop your judgment. Sustainable connections need transparency and follow-through.", "Ambition attracts you. Let a partner see unfinished hopes as well as accomplishments, so intimacy has room beyond the image."],
    ru: ["Вы умеете расти. Возьмите с собой настоящего себя.", "Вы замечаете возможности и умеете меняться. Признание может вдохновлять, не становясь единственной мерой ценности.", "Работа с брендами, партнерствами и ресурсами развивает суждение. Долгие связи требуют прозрачности и выполнения обещаний.", "Вас привлекает целеустремленность. Делитесь незавершенными надеждами, а не только достижениями."],
  },
  壬午: {
    zh: ["想得快、跑得快，心也需要跟上。", "你思路活跃，在理智与冲动之间切换。速度让你看见机会，也可能让你忘记自己已经很累。", "传播、数字产品与快速迭代的项目可以练习你的反应力。先做小规模验证，再决定是否加速。", "你喜欢有火花的互动。对方反应慢一点不代表不在意，给彼此留出解释和消化的时间。"],
    en: ["Your mind moves fast. Let the rest of you catch up.", "You switch quickly between analysis and impulse. Speed reveals possibilities but can hide your need to pause.", "Communication, digital products and iterative projects can use your responsiveness. Test on a small scale before accelerating.", "You enjoy a lively connection. A slower reply is not necessarily a lack of care; allow time to process."],
    ru: ["Мысли бегут быстро. Дайте себе их догнать.", "Вы быстро переходите от анализа к импульсу. Скорость открывает возможности, но может скрывать потребность в паузе.", "Коммуникации, цифровые продукты и итерационные проекты используют вашу реакцию. Проверяйте идею в малом масштабе.", "Вам нравится живое общение. Медленный ответ не обязательно означает равнодушие; оставьте время подумать."],
  },
  癸未: {
    zh: ["你接得住别人的心情，也要留一点空间给自己。", "你善于倾听，容易感受到他人的需要。共情是能力，别人的情绪却不都需要由你负责。", "服务设计、人事协调与细致的客户工作值得探索。建立清楚的工作边界，才能持续提供温度。", "你很在意回应与陪伴。把需要具体说出来，也保留自己的生活节奏，会比不断试探更安心。"],
    en: ["You make room for others' feelings. Save some for your own.", "You listen closely and notice what people need. Empathy does not make you responsible for every emotion around you.", "Service design, people coordination and attentive client work can use your care. Clear boundaries help it last.", "Reassurance and company matter to you. Name a specific need while keeping space for your own routines."],
    ru: ["Вы вмещаете чужие чувства. Оставьте место своим.", "Вы внимательно слушаете и замечаете потребности. Сочувствие не делает вас ответственными за все эмоции вокруг.", "Дизайн сервиса, работа с людьми и внимательная поддержка клиентов используют вашу заботу. Нужны ясные границы.", "Вам важны отклик и присутствие. Называйте конкретную потребность, сохраняя собственный ритм жизни."],
  },
  甲申: {
    zh: ["越是难题，你越想证明自己能行。", "你有韧性，也不喜欢被强行安排。挑战能激发斗志，但平静的日子同样值得认真经营。", "危机协调、问题排查与变化中的项目能锻炼你。把压力下的经验沉淀成方法，别每次都靠硬撑。", "你欣赏有力量的人，也容易在争论里进入战斗状态。提醒自己：眼前是伙伴，不是要赢过的对手。"],
    en: ["A hard problem makes you want to prove you can.", "You are resilient and resist being pushed around. Challenge can energize you, but calm deserves a place in your life too.", "Troubleshooting and projects in transition can develop your resolve. Turn hard-won experience into methods instead of relying on endurance.", "You respect strength. In an argument, remember that the person beside you is a partner, not an opponent."],
    ru: ["Сложная задача вызывает желание доказать, что вы можете.", "Вы стойки и не любите давление. Вызов заряжает, но спокойствие тоже заслуживает места в жизни.", "Решение неполадок и проекты в переходный период развивают выдержку. Превращайте опыт в метод.", "Вы уважаете силу. В споре помните, что рядом партнер, а не противник."],
  },
  乙酉: {
    zh: ["你把细节做到漂亮，也别忘了给人留余地。", "你对品质敏感，愿意反复打磨。高标准能成就作品，但并不是每件小事都需要做到极致。", "质量检查、精细设计与审阅工作能用到你的观察力。先约定什么叫完成，避免无限修改。", "你欣赏用心与整洁。反馈之前先看见对方的努力，把偏好当作讨论，而不是对人的评分。"],
    en: ["Beautiful details. A little room for imperfection.", "You notice quality and enjoy refining things. Not every small decision needs your highest level of precision.", "Quality review, detailed design and editing can use your eye. Define 'finished' before revision becomes endless.", "You appreciate care and thoughtfulness. Notice effort before offering feedback, and discuss preferences without grading the person."],
    ru: ["Красивые детали и немного места несовершенству.", "Вы замечаете качество и любите дорабатывать. Не каждому мелкому решению нужна максимальная точность.", "Проверка качества, детальный дизайн и редактура используют вашу наблюдательность. Заранее определяйте, что значит «готово».", "Вы цените внимание. Замечайте старания до замечаний и обсуждайте предпочтения, не оценивая человека."],
  },
  丙戌: {
    zh: ["你能温暖一群人，却还在寻找真正懂你的人。", "你热心，也喜欢思考意义。热闹之后需要独处很正常，不必把暂时的孤单解释成永远不被理解。", "文化、教育与长期内容项目可以容纳你的思考。用持续的作品建立信任，不必急着得到所有人的认可。", "你期待能聊到内心深处的关系。分享一个具体感受，比用对人生的失望概括全部心情更容易被接住。"],
    en: ["You warm the room while looking for someone who understands.", "You are generous with others and thoughtful about meaning. Needing solitude after company does not mean you are destined to be alone.", "Culture, education and long-form creative work can hold your questions. Build trust through consistent work, not universal approval.", "You want depth. Sharing one specific feeling gives a partner somewhere to meet you."],
    ru: ["Вы согреваете компанию и ищете того, кто поймет.", "Вы щедры к людям и думаете о смысле. Потребность в уединении после общения не означает обреченности на одиночество.", "Культура, образование и вдумчивое творчество дают место вашим вопросам. Доверие растет через последовательную работу.", "Вам нужна глубина. Одно конкретное чувство дает партнеру возможность откликнуться."],
  },
  丁亥: {
    zh: ["白天的理性，遇上夜晚丰富的想象。", "你容易同时看见不同可能，感受也很细腻。把事实、猜测与心情分开，会让内心更有秩序。", "写作、艺术与创意研究值得探索。把灵感记录下来，再用具体步骤筛选可以完成的部分。", "你在意关系里的特殊连接。强烈的感觉可以珍惜，信任仍要靠日常沟通和一致的行动慢慢建立。"],
    en: ["A thoughtful mind with an imagination that stays awake.", "You see competing possibilities and feel subtle shifts. Separating facts, guesses and feelings can bring clarity.", "Writing, art and creative research give your imagination a task. Record inspiration, then choose a workable next step.", "A special connection matters to you. Enjoy the feeling while letting trust grow through ordinary, consistent actions."],
    ru: ["Вдумчивый ум и воображение, которое не засыпает.", "Вы видите разные возможности и чувствуете нюансы. Разделение фактов, догадок и чувств добавляет ясности.", "Письмо, искусство и творческие исследования дают задачу воображению. Записывайте идеи и выбирайте выполнимый шаг.", "Вам важна особенная связь. Цените чувство, позволяя доверию расти через последовательные поступки."],
  },
  戊子: {
    zh: ["你很会算长远，也别漏算眼前的温度。", "你务实、谨慎，习惯给自己留余地。安排得周全是优势，有些体验也值得不带着得失去感受。", "预算、资源规划和运营分析能用到你的耐心。把判断建立在信息与验证上，而不是把直觉当作收益保证。", "你重视一起过日子的可靠感。聊完计划和支出，也问问对方今天过得怎样，让关系保留温情。"],
    en: ["You plan for the future. Include warmth in the present.", "You are practical and like a margin of safety. Thoughtful planning helps, but some experiences need no calculation.", "Budgeting, resource planning and operations analysis can use your patience. Ground decisions in evidence rather than promised outcomes.", "You value a dependable shared life. After discussing the plan, ask how your partner's day actually felt."],
    ru: ["Вы планируете будущее. Включите тепло в настоящее.", "Вы практичны и оставляете запас прочности. Продуманность полезна, но не каждому переживанию нужен расчет.", "Бюджетирование, планирование ресурсов и операционная аналитика используют терпение. Опирайтесь на проверяемые данные.", "Вы цените надежный общий быт. После обсуждения планов спросите, как партнер чувствовал себя сегодня."],
  },
  己丑: {
    zh: ["你的进度不喧哗，但每一步都算数。", "你耐得住重复，也愿意慢慢积累。沉默不代表没有想法，把进展讲出来能让别人更好地配合。", "研究、技术与需要细致维护的项目值得探索。稳定的方法和阶段复盘，比一味熬时间更能帮助成长。", "你用长期行动表达感情。受委屈时及时说出来，别让原本温和的相处变成猜不透的沉默。"],
    en: ["Your progress is quiet. Every step still counts.", "You can stay with repeated effort and gradual learning. Sharing progress helps others support what you are building.", "Research, technical work and careful maintenance can use your persistence. Review the method instead of simply adding more hours.", "You express love through consistency. Speak about a hurt before quiet endurance becomes distance."],
    ru: ["Ваш прогресс тихий. Каждый шаг имеет значение.", "Вы способны на повторяющиеся усилия и постепенное обучение. Рассказ о прогрессе помогает другим поддержать вас.", "Исследования, техническая работа и внимательное сопровождение требуют настойчивости. Пересматривайте метод, а не только увеличивайте часы.", "Вы любите через постоянство. Говорите об обиде до того, как терпение станет дистанцией."],
  },
  庚寅: {
    zh: ["你敢打破僵局，也要给冲劲一个方向。", "看到不合理的规则，你很难只是旁观。行动力能推动改变，停下来判断代价也同样重要。", "开拓业务、解决难题和竞争性项目能锻炼你。用准备和策略支持勇气，别把冒险本身当成价值。", "你喜欢直接、鲜明的互动。分歧出现时先降温，再说需求，让坚定不必通过压过对方来表达。"],
    en: ["You break the deadlock. Give that drive a direction.", "You struggle to ignore a rule that makes no sense. Action can change things; considering the cost matters too.", "Business development and difficult projects can exercise your initiative. Back courage with preparation instead of chasing risk itself.", "You appreciate directness. Cool down before explaining a disagreement, so conviction does not become pressure."],
    ru: ["Вы выходите из тупика. Дайте напору направление.", "Вам трудно игнорировать бессмысленное правило. Действие меняет ситуацию, а оценка последствий помогает выбрать путь.", "Развитие проектов и сложные задачи тренируют инициативу. Подкрепляйте смелость подготовкой, а не поиском риска.", "Вы цените прямоту. Сначала снизьте накал спора, чтобы убежденность не превратилась в давление."],
  },
  辛卯: {
    zh: ["你很会优化事情，人却不需要被改造成方案。", "你注重效率，能快速发现多余的环节。精准是优势，也要允许不同的人有不同的生活方式。", "流程优化、设计与供应链协调能练习你的判断。衡量效率时，把使用者的感受也算进去。", "你喜欢帮助对方变得更好。先问是否需要建议，尊重伴侣保留自己选择的权利。"],
    en: ["You improve systems. People are not projects.", "You notice wasted effort and prefer clear outcomes. Precision helps, while different people may still need different ways of living.", "Process improvement, design and supply coordination can use your judgment. Include people's experience when measuring efficiency.", "You want to help a partner grow. Ask before advising, and leave their choices in their hands."],
    ru: ["Вы улучшаете системы. Люди — не проекты.", "Вы замечаете лишние усилия и любите ясный результат. Точность полезна, но людям подходят разные способы жить.", "Улучшение процессов, дизайн и координация поставок развивают ваше суждение. Учитывайте человеческий опыт вместе с эффективностью.", "Вы хотите помочь партнеру расти. Спрашивайте перед советом и оставляйте выбор за ним."],
  },
  壬辰: {
    zh: ["表面风平浪静，心里正在布局全局。", "你看问题长远，倾向先观察再掌握节奏。保持沉着很好，让别人理解你的想法也能减少阻力。", "大型项目协调、资源规划与系统管理值得探索。把复杂目标拆成明确责任，才能让更多人一起推进。", "你倾向通过安排未来提供安全感。共同生活需要共同决定，解释你的考虑，也认真听取不同意见。"],
    en: ["A calm surface. A whole strategy underneath.", "You watch the bigger picture and prefer to set a steady pace. Explaining your thinking can make cooperation easier.", "Large-project coordination, resource planning and systems work can use your perspective. Break ambitious goals into clear responsibilities.", "Planning a future is one way you offer security. A shared life needs shared decisions, including genuine disagreement."],
    ru: ["Спокойная поверхность, а под ней — целая стратегия.", "Вы видите общую картину и предпочитаете ровный темп. Объяснение своих мыслей облегчает сотрудничество.", "Координация крупных проектов, ресурсов и систем использует ваш взгляд. Делите большие цели на ясные обязанности.", "Планируя будущее, вы даете опору. Общая жизнь требует общих решений и права не соглашаться."],
  },
  癸巳: {
    zh: ["你能适应不同场合，也值得被清楚地理解。", "你灵活、敏锐，懂得顺着气氛调整表达。变化带来魅力，一致的立场则能让关系更稳。", "公关、创意合作与信息整合可以练习你的联结能力。把信息分享和合作边界讲清楚，信任才会积累。", "你享受互动中的张力与新鲜感。想靠近或需要空间，都可以直接表达，别让忽冷忽热替你说话。"],
    en: ["You adapt to any room. Let someone know where you stand.", "You are responsive and socially observant. Flexibility draws people in; consistency helps them trust the connection.", "Public relations, creative partnerships and information gathering can use your connective skills. Be clear about boundaries and commitments.", "You enjoy chemistry and a little mystery. Say when you want closeness or space instead of making someone decode the change."],
    ru: ["Вы вписываетесь в любую компанию. Обозначьте свою позицию.", "Вы гибки и наблюдательны в общении. Переменчивость привлекает, а последовательность укрепляет доверие.", "Коммуникации, творческие партнерства и сбор информации используют ваше умение связывать людей. Проясняйте границы и обязательства.", "Вам нравятся искра и новизна. Говорите прямо о желании близости или пространства."],
  },
  甲午: {
    zh: ["灵感像烟花，值得留下一束能持续的光。", "你想得快、起步快，容易被新鲜挑战点燃。真正的练习是热度下降后，仍给一个好点子持续的时间。", "创意、广告、技术与内容项目能承接你的灵感。用小实验检验方向，再把有效的部分做完整。", "你容易被瞬间的吸引打动。新鲜感之外，试着一起建立小习惯，让热情有机会变成了解。"],
    en: ["Ideas arrive like fireworks. Keep one light burning.", "Novelty gets you moving quickly. The practice is staying with a good idea after the first excitement fades.", "Creative, advertising, technology and content projects can use your imagination. Test small, then finish what proves useful.", "A spark can draw you in fast. Shared routines give excitement a chance to become real understanding."],
    ru: ["Идеи вспыхивают как фейерверк. Сохраните один огонь.", "Новизна быстро приводит вас в движение. Практика — оставаться с хорошей идеей после первого восторга.", "Творчество, реклама, технологии и контент дают место фантазии. Проверяйте в малом и завершайте полезное.", "Искра быстро привлекает вас. Общие привычки помогают восторгу перерасти в понимание."],
  },
  乙未: {
    zh: ["你总想把一切照顾好，自己却排在最后。", "你细致、勤勉，也容易担心哪里还不够好。认真不等于事事都管，分清责任会让努力更有效。", "手艺、技术与精细服务能用到你的耐心。把时间留给真正影响质量的细节，而不是所有细节。", "你通过照顾表达在意。亲密关系里也要允许对方按自己的方式完成事情，让关心带着信任。"],
    en: ["You take care of every detail. Include yourself.", "You are diligent and attentive, sometimes worried about what is still missing. Clear responsibilities make effort more effective.", "Craft, technical work and detailed service can use your patience. Focus on the details that actually affect quality.", "Care is how you show attachment. Trust includes allowing a partner to do things in their own way."],
    ru: ["Вы заботитесь о каждой детали. Включите в список себя.", "Вы старательны и внимательны, порой тревожитесь о недочетах. Ясное разделение обязанностей делает усилия полезнее.", "Ремесло, техническая работа и точный сервис используют терпение. Выбирайте детали, действительно влияющие на качество.", "Вы проявляете привязанность заботой. Доверие позволяет партнеру делать что-то своим способом."],
  },
  丙申: {
    zh: ["你会发现生活的好，也想把它分享出去。", "你重视品味、体验和有趣的表达。享受生活是能力，别让不断追求新鲜挤掉了深度。", "策展、品牌、贸易与美食内容能练习你的眼光。把喜欢的东西研究透，比只会推荐更有说服力。", "你擅长制造浪漫与仪式感。平凡日子里的关心同样重要，关系不必每一刻都像精彩片段。"],
    en: ["You find the good in life and want to share it.", "Taste, experience and expressive ideas matter to you. Enjoying novelty works best alongside a little depth.", "Curation, branding, trade and food content can develop your eye. Study what you recommend, not just how it looks.", "You bring romance and memorable moments. Ordinary care matters too; a relationship need not be a highlight reel."],
    ru: ["Вы находите в жизни хорошее и хотите им делиться.", "Вам важны вкус, впечатления и выразительность. Новизна приносит больше, когда рядом есть глубина.", "Кураторство, брендинг, торговля и контент о еде развивают ваш взгляд. Изучайте то, что рекомендуете.", "Вы создаете романтику и яркие моменты. Обычная повседневная забота не менее важна."],
  },
  丁酉: {
    zh: ["你能看见怎样更好，也要说出哪里已经很好。", "你标准高、反应敏锐，对专业和品质很认真。对自己温和一点，并不会降低作品的质量。", "审阅、精细设计与专业服务能用到你的判断。给出清晰依据和修改重点，让标准成为帮助。", "你欣赏能力与对等的交流。指出问题之前先确认彼此站在同一边，批评具体行为，不否定整个人。"],
    en: ["You see how it could improve. Say what already works.", "You care about expertise and quality. Treating yourself kindly does not make your work less rigorous.", "Review, detailed design and specialist services can use your judgment. Explain the reasoning and prioritize useful changes.", "You value ability and equal footing. Critique a specific behavior without turning it into a verdict on the person."],
    ru: ["Вы видите, что улучшить. Назовите и то, что удалось.", "Вы серьезно относитесь к мастерству и качеству. Доброта к себе не уменьшает строгости работы.", "Рецензирование, точный дизайн и специализированные услуги используют ваше суждение. Объясняйте основания и приоритеты правок.", "Вы цените способности и равенство. Обсуждайте конкретное действие, не вынося приговор человеку."],
  },
  戊戌: {
    zh: ["承诺落在你身上，往往就有了重量。", "你重义气、有耐力，认定的事情不轻易放手。坚持能守住重要的东西，调整也不意味着背弃原则。", "工程、长期运营与需要可靠执行的项目值得探索。让经验与新方法一起工作，别只靠意志推进。", "你倾向默默守护。争论时试着复述对方的意思，再表达自己的立场，让坚定也能被靠近。"],
    en: ["When you give your word, it carries weight.", "Loyalty and endurance define this portrait. Adjusting your approach does not have to mean abandoning your principles.", "Engineering, long-term operations and reliable delivery can use your persistence. Let new methods support experience.", "You tend to protect quietly. In a disagreement, reflect your partner's view before explaining your own."],
    ru: ["Ваше обещание имеет вес.", "Этому образу близки верность и выносливость. Изменить подход не значит отказаться от принципов.", "Инженерия, длительные процессы и надежное исполнение используют вашу настойчивость. Дополняйте опыт новыми методами.", "Вы защищаете молча. В споре сначала перескажите позицию партнера, а затем объясните свою."],
  },
  己亥: {
    zh: ["你能与很多人相处，也可以明确地选择。", "你温和、适应力强，不愿轻易让人难堪。好相处不需要事事答应，清晰的边界能减少后来的为难。", "服务、协调、物流与合作项目能练习你的适应力。机会出现时，也要核对自己真正能承担的部分。", "你容易给人温暖的感觉。对所有人友好和对伴侣的承诺，需要用清楚的边界区分开。"],
    en: ["You get along with many people. You can still choose clearly.", "Warmth and adaptability help you fit in. Being considerate does not require saying yes to everything.", "Service, coordination, logistics and collaborative projects can use your flexibility. Check capacity before accepting an opportunity.", "People may find you reassuring. Clear boundaries help distinguish friendliness from the commitment you share with a partner."],
    ru: ["Вы ладите со многими. И все же можете выбирать ясно.", "Теплота и гибкость помогают находить общий язык. Внимательность не требует соглашаться со всем.", "Сервис, координация, логистика и совместные проекты используют вашу адаптивность. Проверяйте свои возможности до согласия.", "Рядом с вами людям спокойно. Границы отличают дружелюбие от обязательств перед партнером."],
  },
  庚子: {
    zh: ["你很容易赢下道理，更值得赢得理解。", "你逻辑清晰，善于发现论点里的漏洞。犀利能照亮问题，也要留意别人是否有继续说下去的空间。", "分析、写作、评论与问题诊断可以练习你的思辨。让观点有证据，也有帮助他人推进的下一步。", "你欣赏聪明的对话。感情不是辩论赛，先回应对方的感受，再讨论谁的判断更准确。"],
    en: ["You can win the argument. Aim for understanding too.", "You spot weak reasoning quickly. A sharp observation helps most when it leaves the conversation open.", "Analysis, writing, criticism and troubleshooting can develop your thinking. Pair a strong argument with evidence and a useful next step.", "You enjoy an intelligent exchange. In love, acknowledge the feeling before debating the conclusion."],
    ru: ["Вы можете выиграть спор. Стремитесь и к пониманию.", "Вы быстро замечаете слабую логику. Точное замечание полезнее, когда оставляет разговор открытым.", "Аналитика, письмо, критика и поиск причин развивают мышление. Соединяйте аргумент с доказательством и полезным шагом.", "Вам нравится умный разговор. В близости сначала признайте чувство, а потом обсуждайте вывод."],
  },
  辛丑: {
    zh: ["你的价值藏得很深，信任也打开得很慢。", "你谨慎、细致，习惯先确认安全再展示自己。保护隐私很重要，但不必把每个未知都理解成威胁。", "研究、修复、档案与专业分析能用到你的专注。让耐心成为有成果的深入，而不是无限等待。", "你需要时间建立信任。担心时提出具体问题，比反复试探或自己推演更有助于确认彼此。"],
    en: ["Your value runs deep. Trust opens slowly.", "You are careful and private until you feel secure. Protecting yourself need not mean treating every unknown as a threat.", "Research, restoration, archives and specialist analysis can use your focus. Give patience a concrete output.", "Trust takes time for you. Ask a specific question when worried instead of testing someone without explaining why."],
    ru: ["Ваша ценность глубока. Доверие раскрывается медленно.", "Вы осторожны и сдержанны, пока не почувствуете безопасность. Не всякая неизвестность означает угрозу.", "Исследования, реставрация, архивы и экспертный анализ используют сосредоточенность. Придавайте терпению конкретный результат.", "Доверие требует времени. При тревоге задайте определенный вопрос вместо необъяснимых проверок."],
  },
  壬寅: {
    zh: ["行动让你鲜活，稳定让别人敢靠近。", "你好奇、精力活跃，喜欢在变化中寻找可能。给情绪和行动之间留一点空隙，方向会更清楚。", "外联、传播、物流与不断接触新环境的项目值得探索。把跑动带来的信息整理成可执行的计划。", "你喜欢有追逐感和活力的关系。兴奋之外，也练习稳定回应，让伴侣不用猜测今天的你。"],
    en: ["Movement makes you feel alive. Consistency invites closeness.", "You are curious and energized by change. A little space between feeling and action can clarify your direction.", "Outreach, communication, logistics and new environments can use your energy. Turn the information you gather into a practical plan.", "You enjoy a lively connection. Consistent responses help a partner feel secure beyond the excitement."],
    ru: ["Движение оживляет вас. Постоянство приглашает к близости.", "Вы любознательны и оживаете от перемен. Пауза между чувством и действием проясняет направление.", "Внешние связи, коммуникации, логистика и новые среды используют вашу энергию. Превращайте информацию в план.", "Вам нравится живое притяжение. Последовательный отклик дает партнеру опору за пределами восторга."],
  },
  癸卯: {
    zh: ["你很懂温柔，难的是把不舒服说出来。", "你细腻、有想象力，能察觉别人忽略的气氛变化。敏感可以成为创作力，也需要现实中的小小行动。", "设计、写作与艺术表达能容纳你的观察。把感受做成可分享的作品，让别人看见你的独特视角。", "你期待被懂得，冲突时却可能先退开。说清楚需要缓一缓、何时回来聊，比不回消息更能守住温柔。"],
    en: ["Gentleness comes easily. Saying what hurts takes practice.", "You notice subtle changes and have a rich imagination. Sensitivity can feed creativity when paired with small, concrete actions.", "Design, writing and artistic work give your observations a form. Make something shareable from the way you see the world.", "You want to feel understood but may retreat from conflict. Say when you will return to the conversation instead of going quiet."],
    ru: ["Нежность дается легко. Говорить о боли нужно учиться.", "Вы замечаете тонкие перемены и обладаете воображением. Чуткость питает творчество вместе с небольшими действиями.", "Дизайн, письмо и искусство придают наблюдениям форму. Создайте работу, через которую виден ваш взгляд.", "Вы хотите понимания, но можете отступать от спора. Скажите, когда вернетесь к разговору, вместо молчания."],
  },
  甲辰: {
    zh: ["你话不多，心里却早有长期打算。", "你稳重、重实际，倾向用结果证明自己。耐心能带来积累，适时说明想法也会让合作更顺。", "资源管理、项目规划与长期维护能练习你的统筹。把目标拆成阶段，避免只顾守成而错过调整。", "你重视承诺，也愿意提供实际支持。生气时别只留下一堵沉默的墙，告诉对方你需要怎样的沟通。"],
    en: ["Few words. A long-term plan already taking shape.", "You are steady and prefer results to declarations. Explaining your intentions helps others work alongside your patience.", "Resource management, planning and long-term maintenance can develop your coordination. Review milestones so stability does not become stagnation.", "Commitment and practical support matter to you. When upset, explain what conversation you need rather than closing down."],
    ru: ["Немного слов, но уже складывается долгий план.", "Вы устойчивы и предпочитаете результат заявлениям. Объяснение намерений помогает другим сотрудничать с вами.", "Управление ресурсами, планирование и сопровождение развивают координацию. Пересматривайте этапы, чтобы устойчивость не стала застоем.", "Вам важны обязательства и помощь делом. В обиде объясняйте, какой разговор нужен, вместо замыкания."],
  },
  乙巳: {
    zh: ["你值得被看见，也值得在安静时被喜欢。", "你有表现力，容易被热烈的氛围点燃。表达的欲望是动力，持续打磨能让亮眼变成长久。", "演示、时尚、内容与公共传播能练习你的感染力。把被注意的时刻接到真实的作品和能力上。", "你享受浪漫、新鲜与强烈回应。尝试在普通日子里创造连接，而不只靠戏剧性的高低起伏。"],
    en: ["You deserve to be seen, and liked when the room is quiet.", "You are expressive and respond to lively energy. Practice turns a bright impression into something that lasts.", "Presentation, fashion, content and public communication can develop your presence. Connect attention to real work and skill.", "You enjoy romance and a strong response. Build connection on ordinary days as well as exciting ones."],
    ru: ["Вы достойны внимания и тепла даже в тишине.", "Вы выразительны и откликаетесь на яркую атмосферу. Практика превращает впечатление в устойчивое мастерство.", "Презентации, мода, контент и публичные коммуникации развивают вашу подачу. Соединяйте внимание с работой и навыком.", "Вам нравятся романтика и сильный отклик. Создавайте связь и в обычные дни."],
  },
  丙午: {
    zh: ["你的热情能点燃全场，节奏决定能走多远。", "你自信、行动快，容易把全部能量投入目标。停下来恢复，不会抹去你的斗志，反而让它更持久。", "竞技、舞台表达与需要快速带动团队的项目能用到你。给冲劲配上准备、反馈与可持续的节奏。", "你表达爱很直接、热烈。关系也需要空间与协商，情绪升高时先暂停，别让强度盖过倾听。"],
    en: ["Your fire fills the room. Pace decides how far it goes.", "Confidence and fast action shape this portrait. Recovery does not cancel your drive; it gives that drive somewhere to return.", "Competition, performance and fast-moving teamwork can use your energy. Support intensity with preparation, feedback and pacing.", "You love with visible enthusiasm. Make room for space and negotiation, and pause when intensity starts to replace listening."],
    ru: ["Ваш огонь заполняет комнату. Темп определяет дальность.", "Этому образу близки уверенность и быстрые действия. Восстановление не отменяет напор, а поддерживает его.", "Соревнования, выступления и динамичная командная работа используют энергию. Дополняйте интенсивность подготовкой и обратной связью.", "Вы ярко выражаете любовь. Оставляйте место пространству и договоренностям; делайте паузу, когда напор мешает слушать."],
  },
  丁未: {
    zh: ["你把爱放进细节，也希望有人认真看见。", "你细致、耐心，柔和之中有自己的坚持。付出之前确认边界，会让照顾少一些委屈。", "精细制作、设计与服务流程能容纳你的用心。把经验整理成标准，让品质不只靠你一直盯着。", "你会照顾很多日常小事。想要被感谢或分担，可以直接说，不必用生闷气等待对方领会。"],
    en: ["You put love into details and hope someone notices.", "You are patient and attentive, with convictions beneath the softness. Clear limits make care less likely to become resentment.", "Detailed making, design and service processes can use your care. Turn experience into standards others can share.", "You look after daily needs. Ask directly for appreciation or help instead of hoping disappointment will communicate it."],
    ru: ["Вы вкладываете любовь в детали и ждете, что их заметят.", "Вы терпеливы и внимательны, за мягкостью стоят убеждения. Ясные пределы берегут заботу от обиды.", "Точное изготовление, дизайн и сервисные процессы используют вашу внимательность. Делитесь опытом через понятные стандарты.", "Вы заботитесь о быте. Просите признания или помощи прямо, не рассчитывая на молчаливое недовольство."],
  },
  戊申: {
    zh: ["你很会让生活有趣，也能让快乐更有分量。", "你有才气，喜欢社交和丰富的体验。享受是动力，愿意承担后续责任，会让别人更放心与你同行。", "创意、餐饮、公关与体验策划能用到你的活力。把好点子变成可持续交付的作品或服务。", "你喜欢一起玩、一起发现新鲜事。安静听完伴侣不开心的部分，也是共同生活里重要的体验。"],
    en: ["You make life interesting. Give the good times some depth.", "You enjoy talent, company and rich experiences. Following through on responsibilities makes you easier to build with.", "Creative work, hospitality, communications and experience design can use your energy. Turn good ideas into dependable delivery.", "You like exploring together. Staying present for a partner's difficult day is part of sharing a life too."],
    ru: ["Вы делаете жизнь интересной. Добавьте радости глубины.", "Вам нравятся способности, компания и впечатления. Выполненные обязательства делают совместные планы надежнее.", "Творчество, гостеприимство, коммуникации и проектирование впечатлений используют вашу энергию. Доводите идеи до устойчивого результата.", "Вы любите открывать новое вместе. Быть рядом в трудный день партнера — тоже часть общей жизни."],
  },
  己酉: {
    zh: ["你知道怎么过得舒服，也可以主动选择下一步。", "你随和，能发现日常的小满足。松弛是珍贵的能力，别让舒适替你决定所有未来的方向。", "餐饮、生活方式与细致服务能用到你的体验感。把品味和稳定执行结合起来，作品才更完整。", "你重视相处舒服、没有太多消耗。也要谈清楚双方对成长与生活的期待，别把不同步留到最后。"],
    en: ["You know how to feel at ease. Choose your next step too.", "You appreciate small pleasures and an unforced pace. Comfort is valuable without needing to decide your whole future.", "Food, lifestyle and attentive service can use your sense of experience. Pair taste with consistent execution.", "You want a relationship that feels easy. Discuss ambitions and expectations so a relaxed pace remains a shared choice."],
    ru: ["Вы умеете жить удобно. Выбирайте и следующий шаг.", "Вы цените маленькие радости и естественный темп. Комфорт важен, но не обязан определять все будущее.", "Еда, образ жизни и внимательный сервис используют ваше чувство впечатления. Соединяйте вкус с исполнением.", "Вам нужны легкие отношения. Обсуждайте ожидания и стремления, чтобы спокойный темп оставался общим выбором."],
  },
  庚戌: {
    zh: ["你守得住原则，也可以打开一扇协商的门。", "你忠诚、正直，喜欢明确的规则。原则让人信任，理解不同处境会让你的判断更完整。", "审阅、质量保障与需要长期可靠性的工作值得探索。把守标准与解决实际问题放在一起。", "你重视忠诚与责任。表达不同意见时，少一点应该怎样，多问一句对方为什么这样想。"],
    en: ["You hold the line. Leave a door open for discussion.", "Loyalty and clear principles matter to you. Understanding different circumstances makes judgment more useful, not less firm.", "Review, quality assurance and work built on reliability can suit this theme. Use standards to solve real problems.", "You value commitment. Ask why a partner sees things differently before explaining what they should do."],
    ru: ["Вы держите границу. Оставьте дверь для обсуждения.", "Вы цените верность и ясные принципы. Понимание разных обстоятельств делает суждение полезнее, а не слабее.", "Проверка, обеспечение качества и надежное сопровождение соответствуют этой теме. Применяйте стандарты к реальным задачам.", "Вам важны обязательства. Спросите, почему партнер думает иначе, прежде чем объяснять, как надо поступить."],
  },
  辛亥: {
    zh: ["你有自己的世界，也可以为别人留一条小路。", "你审美独立，内心有丰富的想象。独处能滋养创作，适度分享也能让才华与现实相遇。", "设计、文学、影像与小众创作值得探索。让独特视角变成完整作品，而不只停留在脑海中的理想。", "你向往精神上的共鸣。日常问题也属于亲密的一部分，一起解决琐事并不会破坏浪漫。"],
    en: ["You have a world of your own. Leave a path into it.", "Independent taste and imagination shape this portrait. Solitude can nourish your work; sharing lets it meet the world.", "Design, literature, film and niche creative work can hold your perspective. Finish something real beyond the ideal in your mind.", "You seek a meeting of minds. Solving ordinary problems together does not make a relationship less romantic."],
    ru: ["У вас свой мир. Оставьте в него тропинку.", "Этому образу близки самостоятельный вкус и фантазия. Уединение питает работу, а открытость связывает ее с миром.", "Дизайн, литература, кино и авторское творчество дают место вашему взгляду. Завершайте реальные работы.", "Вы ищете духовное созвучие. Совместное решение бытовых задач не делает отношения менее романтичными."],
  },
  壬子: {
    zh: ["你看见很多可能，选择才能让可能落地。", "你好奇、适应力强，容易同时被多个方向吸引。空间越大，越需要明确自己此刻最在乎什么。", "信息整合、跨团队沟通与流动性强的项目能练习你的视野。减少同时开启的任务，让判断有后续。", "你喜欢鲜活的互动与自由。提前讲清关系里的承诺和边界，会比不断寻找下一种可能更能建立信任。"],
    en: ["You see every possibility. Choice makes one of them real.", "Curiosity and adaptability pull you toward many directions. More freedom makes a clear priority even more useful.", "Information gathering, cross-team communication and changing projects can use your breadth. Start fewer things and follow them through.", "You value aliveness and freedom. Clear agreements about commitment help that freedom coexist with trust."],
    ru: ["Вы видите все возможности. Выбор делает одну реальной.", "Любознательность и гибкость тянут в разные стороны. Чем больше свободы, тем полезнее ясный приоритет.", "Сбор информации, межкомандные связи и меняющиеся проекты используют широту взгляда. Начинайте меньше и доводите до конца.", "Вы цените живость и свободу. Ясные договоренности позволяют ей сочетаться с доверием."],
  },
  癸丑: {
    zh: ["你习惯把心事收好，也值得被温柔地读懂。", "你有耐性，擅长在观察中积累判断。保留不是问题，但别让重要的人只能靠猜测了解你。", "研究、策划与需要保密和专注的工作能用到你的沉着。用清楚的阶段成果连接独立思考与合作。", "你认真投入后很重感情。旧委屈需要被处理，而不是收藏；选一个具体问题，约定一次坦诚的沟通。"],
    en: ["You keep your feelings carefully. They deserve to be understood.", "Patience and observation help you form judgments. Privacy is healthy, but important people need a way to know you.", "Research, planning and confidential, focused work can use your steadiness. Share clear milestones to connect private thought with teamwork.", "You invest deeply once you trust. Address an old hurt through one honest conversation instead of storing it for the next argument."],
    ru: ["Вы бережно храните чувства. Они заслуживают понимания.", "Терпение и наблюдение помогают судить. Личное пространство важно, но близким нужен способ узнать вас.", "Исследования, планирование и сосредоточенная конфиденциальная работа используют спокойствие. Делитесь понятными этапами результата.", "Доверившись, вы вкладываетесь глубоко. Обсудите старую обиду честно, не откладывая ее до следующего спора."],
  },
  甲寅: {
    zh: ["你愿意成为顶梁柱，也要允许别人与你并肩。", "你独立、有主见，遇到挑战不轻易服输。强大可以包含合作，不必每次都亲自站在最前面。", "开拓项目、团队带领与自主性强的工作值得探索。学会授权，让你的行动力带动更多人的能力。", "你会主动保护伴侣。支持不是替对方决定，让两个人都能说了算，关系才更像并肩同行。"],
    en: ["You want to be the pillar. Let others stand beside you.", "Independence and conviction help you face challenges. Strength can include cooperation rather than always taking the lead.", "New projects, team leadership and autonomous work can use your initiative. Delegation lets that initiative grow beyond you.", "You protect proactively. Support means giving your partner a real voice, not deciding on their behalf."],
    ru: ["Вы хотите быть опорой. Пусть другие встанут рядом.", "Независимость и убежденность помогают встречать вызовы. Сила включает сотрудничество, а не только лидерство.", "Новые проекты, руководство и самостоятельная работа используют инициативу. Делегирование позволяет ей расти.", "Вы активно защищаете. Поддержка дает партнеру настоящий голос, а не решает за него."],
  },
  乙卯: {
    zh: ["你很会连接别人，也别丢掉自己的方向。", "你柔韧、善于沟通，能在不同关系里找到共同点。适应别人之前，先保留自己的真实偏好。", "公关、营销、设计合作与社群工作能练习你的联结能力。让人情建立在互相尊重和清楚的约定上。", "你重视浪漫与陪伴。温柔不需要对所有请求都点头，边界越清楚，亲密越容易安心。"],
    en: ["You connect people easily. Keep your own direction too.", "You are flexible and find common ground. Before adapting to someone else, stay in touch with your own preferences.", "Communications, marketing, design partnerships and community work can use your social skills. Clear agreements support goodwill.", "You appreciate romance and company. Warmth does not require saying yes to everyone; boundaries make closeness safer."],
    ru: ["Вы легко соединяете людей. Сохраняйте свое направление.", "Вы гибки и находите общее. Прежде чем подстроиться, вспомните собственные предпочтения.", "Коммуникации, маркетинг, творческие партнерства и сообщества используют социальные навыки. Ясные договоренности поддерживают доброжелательность.", "Вы цените романтику и присутствие. Тепло не требует соглашаться со всеми; границы укрепляют близость."],
  },
  丙辰: {
    zh: ["你想照亮更多人，也别忘了最近的那一位。", "你热心、有感染力，愿意把人聚到共同目标周围。宏大的愿景很好，近处的小需要也值得看见。", "教育、传播与跨团队项目能用到你的动员力。把热情变成分工与持续支持，让共同目标真正推进。", "你大方，也愿意为关系付出。给伴侣留一段不被工作和社交打断的时间，关注比安排更能传达在乎。"],
    en: ["You want to light up the world. Notice who is closest.", "You bring warmth and gather people around a shared purpose. A big vision still needs attention to nearby needs.", "Education, communication and cross-team projects can use your ability to rally people. Turn enthusiasm into roles and sustained support.", "You are generous with care. Protect some undistracted time together instead of giving a partner only what remains of your day."],
    ru: ["Вы хотите осветить мир. Заметьте того, кто ближе всего.", "Вы несете тепло и объединяете вокруг цели. Большому замыслу нужно внимание к ближайшим потребностям.", "Образование, коммуникации и межкомандные проекты используют вашу способность объединять. Превращайте энтузиазм в поддержку и роли.", "Вы щедры на заботу. Оставляйте время вдвоем без рабочих и социальных отвлечений."],
  },
  丁巳: {
    zh: ["你投入得很深，信任却不能靠掌控获得。", "你敏锐、专注，对想做的事有很强的推动力。把猜测与事实分开，能让判断更稳。", "策略、技术与需要快速识别问题的项目值得探索。让洞察接受验证，再投入更多时间和资源。", "你渴望强烈而专注的连接。安全感来自明确约定与尊重隐私，不是不断确认对方的一举一动。"],
    en: ["You feel things intensely. Trust cannot be managed into existence.", "You are perceptive and focused on what matters to you. Separating evidence from suspicion keeps judgment steady.", "Strategy, technology and rapid problem identification can use your focus. Validate an insight before committing more resources.", "You want a deep, concentrated connection. Build security through agreements and respect for privacy, not constant checking."],
    ru: ["Вы чувствуете сильно. Доверие нельзя создать контролем.", "Вы проницательны и сосредоточены на важном. Разделение фактов и подозрений делает суждение устойчивее.", "Стратегия, технологии и быстрое выявление проблем используют внимание. Проверяйте догадку до вложения ресурсов.", "Вам нужна глубокая связь. Стройте безопасность через договоренности и уважение к личному пространству."],
  },
  戊午: {
    zh: ["看起来很稳，心里的发动机却一直在转。", "你能承担压力，也有强烈的行动欲望。别等忍到极限才表达，及时调整比突然爆发更有效。", "项目推进、工程协调与需要快速落实的工作能用到你。给大目标配上小检查点，减少一口气硬冲。", "你愿意为在乎的人出力。疲惫和不满趁早说，让伴侣了解你的状态，而不是只看到最后的脾气。"],
    en: ["You look steady. The engine inside is still running.", "You can carry pressure and act with force. Express limits early instead of waiting until endurance runs out.", "Project delivery, engineering coordination and implementation can use your drive. Give big goals small checkpoints.", "You show up for people you love. Explain tiredness and frustration early so a partner sees more than the final reaction."],
    ru: ["Снаружи устойчивость. Внутренний двигатель не останавливается.", "Вы выдерживаете давление и действуете решительно. Обозначайте пределы до того, как закончится терпение.", "Реализация проектов, инженерная координация и внедрение используют ваш напор. Делите большие цели на контрольные точки.", "Вы помогаете близким делом. Говорите об усталости заранее, чтобы партнер видел не только последнюю реакцию."],
  },
  己未: {
    zh: ["你能把难日子过下去，也可以把好日子过轻松。", "你独立、能坚持，习惯相信自己的努力。韧性不必一直通过吃苦证明，也可以用来创造更好的条件。", "工程、手艺与复杂问题处理能锻炼你的耐心。建立工具和协作，让可靠不再等于一个人承担全部。", "你偏爱实际、踏实的支持。给关系加一点不带任务的小乐趣，生活不必只有责任和要求。"],
    en: ["You can survive hard days. Let good days feel easier.", "You are independent and persistent. Resilience can improve your conditions rather than always proving how much you can endure.", "Engineering, craft and complex problem-solving can use your patience. Tools and teamwork make reliability less exhausting.", "You value practical support. Add something enjoyable with no task attached; a relationship needs more than duties."],
    ru: ["Вы выдерживаете трудные дни. Пусть хорошие будут легче.", "Вы самостоятельны и настойчивы. Стойкость может улучшать условия, а не постоянно доказывать выносливость.", "Инженерия, ремесло и сложные задачи используют терпение. Инструменты и команда уменьшают нагрузку надежности.", "Вы цените помощь делом. Добавляйте удовольствие без задачи: отношениям нужно больше, чем обязанности."],
  },
  庚申: {
    zh: ["你能把事情解决，也能让人感觉被接住。", "你直接、执行力强，愿意在关键时刻顶上。效率很好，表达方式也会影响别人是否愿意与你合作。", "技术执行、工程与问题排查能用到你的果断。把复杂问题拆清楚，再带着团队一起完成。", "你通过行动表达可靠。伴侣难过时先陪一会儿，再谈解决方案，关心不一定要立刻变成指导。"],
    en: ["You get things done. Help people feel supported too.", "You are direct and ready to act when needed. Delivery matters, and so does how people experience working with you.", "Technical execution, engineering and troubleshooting can use your decisiveness. Break the problem down and bring others with you.", "You show reliability through action. Stay with a partner's feelings before turning care into instructions."],
    ru: ["Вы решаете задачи. Помогайте людям чувствовать поддержку.", "Вы прямы и готовы действовать. Результат важен вместе с тем, как людям работается рядом с вами.", "Техническое исполнение, инженерия и поиск неполадок используют решительность. Разбирайте проблему и вовлекайте других.", "Вы надежны в поступках. Побудьте рядом с чувствами партнера до того, как давать инструкции."],
  },
  辛酉: {
    zh: ["你追求无可挑剔，也值得不被挑剔地喜欢。", "你审美鲜明，对质量有自己的坚持。精致可以是乐趣，不必成为每天必须通过的考试。", "设计、鉴赏、审阅与专业服务能练习你的标准。把细节优势做成让人看得懂的品质，而不是难以接近的门槛。", "你欣赏能力与用心。多说具体的欣赏，少把亲密相处变成评审，让对方能安心做真实的自己。"],
    en: ["You aim for flawless. You deserve affection without an audit.", "You have a distinct eye and care about quality. Refinement can be a pleasure rather than a daily test you must pass.", "Design, appraisal, review and specialist services can use your standards. Make quality understandable, not intimidating.", "You appreciate capability and care. Offer specific appreciation so a partner feels safe being real, not constantly reviewed."],
    ru: ["Вы стремитесь к безупречности. Любовь не требует проверки.", "У вас ясный вкус и внимание к качеству. Изысканность может радовать, не становясь ежедневным экзаменом.", "Дизайн, экспертиза, рецензирование и специальные услуги используют ваши стандарты. Делайте качество понятным.", "Вы цените способности и заботу. Говорите о конкретном хорошем, чтобы партнер не чувствовал себя на проверке."],
  },
  壬戌: {
    zh: ["你把未来想得很远，也要让同行的人参与。", "你沉着、能忍耐，喜欢从长线看问题。规划是优势，别把所有不确定都变成必须控制的细节。", "资源规划、运营与长期项目管理值得探索。定期重新核对假设，让耐心和调整同时存在。", "你想替在乎的人安排好未来。把为你好换成一起商量，让关心包含对方自己的愿望。"],
    en: ["You think far ahead. Let your companion help shape the route.", "You are measured and patient, with a long view. Planning helps without needing to control every uncertainty.", "Resource planning, operations and long-term projects can use your perspective. Revisit assumptions so patience stays responsive.", "You want to provide a secure future. Invite your partner's wishes into the plan instead of deciding what is best for them."],
    ru: ["Вы смотрите далеко вперед. Стройте маршрут вместе.", "Вы сдержанны, терпеливы и мыслите на перспективу. Планирование не требует контроля каждой неизвестности.", "Ресурсы, операционная работа и длительные проекты используют ваш взгляд. Регулярно проверяйте исходные предположения.", "Вы хотите обеспечить будущее. Включайте желания партнера в план, не решая за него, что лучше."],
  },
  癸亥: {
    zh: ["你感受得到很多，也可以选择不全部接住。", "你想象丰富，容易沉浸在内在世界。理解别人是天赋般的体验，落回自己的日常也同样重要。", "艺术、写作与关注人的创意项目能承接你的感受。给灵感一个固定出口，别只等待状态到来。", "你渴望接纳与共鸣。照顾关系之前先确认自己还有多少余力，温柔也需要休息和清楚的边界。"],
    en: ["You feel a great deal. You do not have to hold it all.", "You have a rich inner world and notice others' moods. Returning to your own daily life matters as much as understanding someone else's.", "Art, writing and people-centered creative projects can give feelings a form. Make a regular outlet instead of waiting for the right mood.", "You want acceptance and resonance. Check your capacity before offering care; gentleness needs rest and boundaries too."],
    ru: ["Вы многое чувствуете. Не обязательно все удерживать.", "У вас богатый внутренний мир и чуткость к настроениям. Возвращаться к своей жизни так же важно, как понимать чужую.", "Искусство, письмо и творчество о людях придают чувствам форму. Создайте регулярный выход для вдохновения.", "Вам нужны принятие и созвучие. Проверяйте запас сил перед заботой: нежности тоже нужны отдых и границы."],
  },
};

export function getDayPillarInsight(pillar: string, locale: ContentLocale): DayPillarInsight | null {
  const reading = insights[pillar]?.[locale];
  if (!reading) return null;
  const [headline, personality, career, love] = reading;
  return { headline, personality, career, love };
}
