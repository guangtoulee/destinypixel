import { defaultTarotDeck } from "./tarot-decks";
import { tarotDeck } from "@/lib/oracle/cast";
import { toTraditional } from "@/lib/journal-locales";
import type { ReportLocale } from "@/lib/report-i18n";
// Original concise editorial readings; never presented as a quotation from Waite.
// Each row follows the canonical deck order. Upright / reversed are distinct.
const rows = `
A fresh start;Fear of beginning|新的起点，带着好奇探索;鲁莽或害怕开始，先确认脚下|Новое начало и открытость;Страх начать или беспечность
Turn skill into action;Scattered effort or manipulation|把已有能力付诸行动;精力分散，或用技巧掩盖真实|Превратить умение в действие;Распыление сил или манипуляция
Listen and observe;Ignoring your inner response|静观线索，听见内在感受;忽略直觉，或过度保密|Слушать и наблюдать;Игнорировать внутренний отклик
Nurture something growing;Giving until you feel depleted|滋养关系与创造力;付出过度，忘了照顾自己|Забота и созидание;Забота до истощения
Build a clear structure;Control becoming inflexible|建立秩序和清楚的边界;控制过强，缺少弹性|Ясная структура и границы;Негибкий контроль
Learn through shared practice;Question an inherited rule|在传统或共同实践中学习;检视习惯继承的规则|Учиться у традиции;Пересмотреть привычное правило
Choose in line with your values;Avoiding an honest choice|让选择与真实价值一致;回避坦诚选择，彼此失去对齐|Выбор в согласии с ценностями;Уход от честного выбора
Commit to a direction;Pushing without steering|明确方向，协调不同力量;只顾推进，却失去方向|Держать выбранный курс;Давить без ясного направления
Steady courage and gentle influence;Doubt or exhausted patience|温柔而坚定，安顿本能;自我怀疑，耐心被消耗|Спокойная смелость;Сомнения или истощение терпения
Step back to hear yourself;Solitude turning into isolation|暂退一步，听清自己的想法;独处变成隔绝，拒绝有用帮助|Уединение для понимания;Изоляция вместо размышления
Adapt to a changing cycle;Holding onto an old pattern|顺应周期变化，调整节奏;抓住旧模式，不愿改变|Принять меняющийся цикл;Держаться за старый шаблон
Weigh facts and take responsibility;Bias or avoiding consequences|衡量事实，承担选择的责任;偏见或逃避后果|Факты и ответственность;Предвзятость или уход от последствий
Pause and try another angle;Waiting without learning|暂停，用另一个角度理解;无意义拖延，拒绝换个视角|Пауза и новый взгляд;Ожидание без переосмысления
Let an old chapter end;Clinging to what has finished|允许旧阶段结束，给新事物空间;抓住已结束的部分不放|Завершить старую главу;Цепляться за завершённое
Find a workable blend;Extremes pulling you apart|慢慢调和，寻找可持续的比例;走向极端，难以协调|Найти рабочее сочетание;Крайности и разлад
Notice what keeps you attached;A chance to loosen a binding habit|看见让你难以脱身的依附;尝试松开惯性，也留意否认|Увидеть связывающую привычку;Возможность ослабить привязанность
An unstable assumption is exposed;Postponing a necessary rebuild|旧有假设受到冲击，需要重整;拖延必要调整，维持不稳结构|Обнаружить шаткую основу;Откладывать перестройку
Restore hope through small steps;Losing touch with realistic hope|用诚实和小行动恢复希望;理想化或失望，让希望失焦|Возвращать надежду малыми шагами;Разочарование или идеализация
Move carefully with incomplete information;Confusion beginning to clear|信息尚不完整，放慢判断;迷雾渐散，也需核实猜想|Осторожность при нехватке сведений;Постепенное прояснение
Clarity and shared warmth;Joy obscured by expectations|清晰、温暖，愿意分享成果;期待过高，遮住已有快乐|Ясность и тепло;Завышенные ожидания мешают радости
Answer an honest call to change;Harsh self-judgment or avoidance|诚实回顾，回应改变的契机;自我苛责，或回避该面对的事|Честно ответить на зов перемен;Самоосуждение или уклонение
Bring a cycle to completion;One final step still needed|整合经验，为一个阶段画上句号;尚欠最后一步，需要收尾|Завершение и целостность;Незавершённый последний шаг
A creative spark wants action;A promising idea needs time|新灵感正在点燃，试着行动;灵感暂缓，先找回动力|Творческий импульс;Идее нужно время
Plan beyond familiar ground;Fear of leaving the familiar|规划下一步，把视野放远;担心离开熟悉范围|План за пределами привычного;Страх выйти из знакомого
Let early efforts reach further;Expansion needs a revised plan|前期投入开始延伸，耐心等回应;扩展受阻，需要调整计划|Расширять начатое;Пересмотреть план расширения
Celebrate a stable foundation;Shared belonging needs attention|庆祝稳定基础和共同归属;关系或家庭中的归属需照顾|Праздновать общую основу;Уделить внимание чувству дома
Test ideas through differing views;Rivalry is draining the purpose|在差异中磨合想法;争执耗尽精力，忘了原本目的|Проверять идеи в споре;Соперничество истощает
Recognize earned progress;Depending too much on applause|看见努力带来的进展;太依赖外部认可|Признать заслуженный прогресс;Зависеть от одобрения
Protect a position that matters;Defensiveness is exhausting you|守住真正重要的立场;过度防御，让自己疲惫|Защитить важную позицию;Изматывающая оборона
Momentum and timely communication;Rushing creates mixed messages|节奏加快，及时沟通;太急，导致信息混乱|Темп и своевременная связь;Спешка путает сообщения
Persist with sensible boundaries;Fatigue asks for support|保有韧性，也照顾边界;疲劳提醒你寻求支持|Стойкость с границами;Усталость требует поддержки
Carry responsibility with limits;Share a burden you cannot sustain|承担责任，也承认负荷上限;分担已难持续的重担|Ответственность с пределами;Разделить чрезмерную ношу
Follow a new creative curiosity;Enthusiasm needs a practical step|跟随新鲜的创造欲;热情需要具体行动落地|Творческое любопытство;Энтузиазму нужен первый шаг
Pursue boldly with direction;Impulsiveness burns through energy|大胆追求，记得方向;冲动消耗能量，行动断续|Смелое движение к цели;Импульсивность сжигает силы
Warm confidence draws others in;Comparison dims your confidence|温暖自信，鼓励他人;比较或嫉妒消耗自信|Тёплая уверенность;Сравнение подрывает уверенность
Lead through a clear vision;Force is replacing inspiration|用清楚愿景引领行动;以强硬代替启发|Вести ясным видением;Давление вместо вдохновения
Make room for emotional openness;Refill your own emotional reserves|为新的情感体验留空间;先照顾自己的情绪容量|Открыться чувствам;Восстановить эмоциональные силы
Meet through mutual respect;Repair an unequal exchange|在尊重与回应中连接;不对等的交流需要修复|Взаимное уважение;Восстановить равный обмен
Friendship and shared celebration;Group expectations blur boundaries|友谊与共同庆祝;群体期待模糊了个人边界|Дружба и общий праздник;Ожидания группы стирают границы
Pause before dismissing an opening;Interest returns after withdrawal|暂缓反应，也别错过邀请;走出冷淡，重新发现兴趣|Не отвергать возможность поспешно;Возвращение интереса
Acknowledge loss and remaining support;Making room for recovery|承认失落，也看见仍在的支持;慢慢接纳，为恢复留空间|Признать потерю и поддержку;Место для восстановления
Kindness and familiar memories;Nostalgia may hold you back|善意与熟悉记忆带来慰藉;怀旧让人难以前行|Доброта и тёплые воспоминания;Прошлое удерживает
Separate a wish from a workable choice;Clarity emerges as options narrow|分清愿望与可行选择;缩小选项，逐渐看清方向|Отличить мечту от выбора;Ясность при сужении вариантов
Leave what no longer nourishes you;Fear makes departure difficult|离开已不再滋养你的处境;害怕离开，反复犹豫|Уйти от того, что не питает;Страх расставания с привычным
Notice what already feels enough;Satisfaction cannot be borrowed|感受已有满足，承认愿望;满足感难以只靠外物获得|Заметить достаточность;Внешнее не даёт удовлетворения
Shared belonging and emotional warmth;An ideal image hides real needs|共同归属和情感温暖;完美图景遮住真实需要|Общность и душевное тепло;Идеальная картинка скрывает нужды
Approach feelings with curiosity;Sensitivity needs a safe outlet|用好奇心接近感受;敏感需要安全的表达出口|Любопытство к чувствам;Чувствительности нужен выход
Offer a sincere emotional gesture;An idealized promise lacks follow-through|真诚表达心意;理想化承诺缺少后续行动|Искренний эмоциональный жест;Обещание без действий
Listen deeply without losing yourself;Overgiving blurs your boundaries|深深倾听，也保留自我;过度照顾模糊自身边界|Глубоко слушать, сохраняя себя;Забота стирает границы
Hold emotion with steady care;Feelings controlled instead of understood|稳定容纳情绪，温和表达;压抑或操控代替了理解|Устойчивая эмоциональная забота;Контроль вместо понимания
Name a clear insight;Check a conclusion before acting|看清关键，把想法说清楚;结论还需核实再行动|Ясная мысль;Проверить вывод перед действием
Face a decision you have paused;Avoidance is adding pressure|面对暂时搁置的决定;回避让压力增加|Принять отложенное решение;Избегание усиливает давление
Acknowledge painful truth;Begin mending without rushing|承认令人难过的事实;允许修复，不急着装作无事|Признать болезненную правду;Восстановление без спешки
Rest before re-engaging;Recovery cannot be postponed forever|先休整，再回到事情中;过劳提醒你不能一直拖延休息|Отдых перед возвращением;Восстановление нельзя откладывать
Ask what winning would cost;A chance to step out of conflict|想清赢下争执的代价;走出冲突，或面对遗留问题|Цена победы в споре;Возможность выйти из конфликта
Move toward a calmer setting;A transition needs unfinished work|向更平静的环境过渡;过渡仍有未处理的牵绊|Переход к спокойствию;Незавершённость тормозит переход
Use discretion without evading truth;Reconsider a hidden strategy|谨慎安排，也别逃避真相;重新审视隐瞒的策略|Осмотрительность без обмана;Пересмотр скрытой стратегии
Question a limiting assumption;A small choice restores agency|检视限制自己的假设;小小选择帮助找回自主|Проверить ограничивающее убеждение;Малый выбор возвращает свободу
Put worry into words;Reach for support instead of spiraling|把忧虑说出来，核实担心;寻求支持，停止反复内耗|Дать тревоге слова;Поддержка вместо накручивания
Let an exhausted cycle finish;Recovery after a difficult ending|允许消耗的阶段结束;艰难结束之后慢慢恢复|Завершить истощающий цикл;Восстановление после завершения
Ask precise questions;Curiosity becomes suspicion|保持好奇，问清细节;猜疑或消息未经核实|Точные вопросы;Любопытство становится подозрением
Act on a clear argument;Speed outruns listening|想清楚后果再果断推进;速度太快，来不及倾听|Решительность после обдумывания;Скорость опережает слушание
Speak clearly with fair boundaries;Sharpness hides hurt|清楚表达，公平设立边界;尖锐言辞背后有未处理的受伤|Ясность и справедливые границы;Резкость скрывает боль
Reason with accountability;Authority without openness|理性判断，愿意承担责任;权威缺少倾听和开放|Разум с ответственностью;Власть без открытости
A practical opportunity needs tending;An opening needs firmer planning|可落实的机会需要经营;机会仍需扎实规划|Практическая возможность;Возможности нужен план
Balance competing demands;Too much juggling needs simplification|协调多项需求，灵活调整;兼顾太多，需要做减法|Баланс разных задач;Упростить чрезмерную нагрузку
Build skill through collaboration;Roles and standards need alignment|协作中打磨技能;角色和标准需要对齐|Мастерство через сотрудничество;Согласовать роли и стандарты
Protect resources without closing down;Loosen fear-driven control|守护资源，也保留流动;松开源于不安的控制|Беречь ресурсы без замыкания;Ослабить контроль из страха
Ask for support in a difficult stretch;Notice available routes back to stability|困难时允许自己求助;看见重回稳定的支持途径|Просить помощь в трудности;Замечать пути к устойчивости
Give and receive with clear terms;Unequal help creates obligations|清楚地给予和接受帮助;不对等帮助变成负担|Ясные условия обмена;Неравная помощь обязывает
Review what your effort is growing;Reconsider an unproductive investment|审视长期投入的进展;重新评估无效投入|Оценить плоды усилий;Пересмотреть бесплодное вложение
Practice the craft with attention;Perfectionism or disengaged repetition|专注练习，积累手艺;完美主义或机械重复|Внимательно оттачивать мастерство;Перфекционизм или механичность
Enjoy hard-earned independence;Worth is not only material|欣赏努力换来的独立;价值不只取决于物质|Наслаждаться самостоятельностью;Ценность не только в достатке
Build something that can be shared;Inherited expectations need examination|建设可以共同延续的基础;审视继承而来的期待|Создать общую опору;Проверить унаследованные ожидания
Learn a skill through small steps;A plan needs consistent practice|小步学习，把计划落地;缺乏持续练习，想法停在纸上|Учиться малыми шагами;Плану нужна регулярная практика
Progress through a reliable routine;Routine has become inflexible|靠可靠节奏稳步前进;惯例变得僵化，失去动力|Продвигаться надёжным ритмом;Рутина стала негибкой
Care in practical, grounded ways;Care for yourself as well as others|用务实方式照顾生活;照顾他人，也别忽略自己|Практическая забота;Позаботиться и о себе
Steward resources responsibly;Security becomes possessiveness|负责任地经营资源;安全感变成占有和固守|Ответственно управлять ресурсами;Безопасность превращается в обладание
`
  .trim()
  .split("\n")
  .map((row) => row.split("|"));
export type CardInfo = {
  id: string;
  name: string;
  number: string;
  upright: string;
  reversed: string;
  image: string;
};
export function tarotCards(locale: ReportLocale, artwork = defaultTarotDeck): CardInfo[] {
  if (rows.length !== 78) throw new Error("TAROT_CONTENT_INCOMPLETE");
  const index = locale === "en" ? 0 : locale === "ru" ? 2 : 1;
  return tarotDeck.map((card, i) => {
    const [upright, reversed] = rows[i][index].split(";");
    const content = {
      id: card.id,
      name: locale === "en" ? card.en : locale === "ru" ? card.ru : card.zh,
      number: card.number,
      upright,
      reversed,
      image: artwork.faces[card.id] || defaultTarotDeck.faces[card.id],
    };
    return locale === "zh-TW"
      ? {
          ...content,
          name: toTraditional(content.name),
          upright: toTraditional(upright),
          reversed: toTraditional(reversed),
        }
      : content;
  });
}
