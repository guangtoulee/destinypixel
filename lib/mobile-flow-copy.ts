import type { ReportLocale } from "./report-i18n";
const en = {
  enlarge: "View full card", close: "Close card", cardHint: "Tap the artwork to view it larger.",
  cardNote: "Original symbolic artwork. Read the interpretation below the card; the image is not a prediction.",
  continueNote: "Continue with this birthday in this tab. You can check or change it in the form.",
  carried: "Your birthday is filled in from your free card. Check it, then add your local birth time and city.",
  cityHelp: "Type a city name or choose a suggestion. This report currently recognizes the listed cities and their aliases; it does not search every city worldwide.",
  cityError: "This city is not recognized yet. Choose a matching suggestion; do not substitute a different birthplace.",
  cityMatched: "Recognized birthplace:",
  moreArt: "Explore animated artwork", morePractices: "More practices and symbolic rituals", tools: "All tools",
};
export const mobileFlowCopy: Record<ReportLocale, typeof en> = {
  en,
  zh: {
    enlarge: "放大看卡片", close: "关闭卡片", cardHint: "轻点画面，放大欣赏完整卡片。",
    cardNote: "原创象征画作。具体解读在卡片下方，画面不是对未来的预言。",
    continueNote: "在当前标签页沿用这个生日，进入表单后仍可核对或修改。",
    carried: "已带入免费意象卡使用的生日。请核对，再补充当地出生时间与城市。",
    cityHelp: "可以输入城市名或选择建议。目前这份报告只识别列表中的城市及其别名，并非全球城市搜索。",
    cityError: "暂未识别这个城市。请选择匹配的建议，不要用其他出生地代替。",
    cityMatched: "已识别出生地：", moreArt: "欣赏动态意象画作", morePractices: "更多探索与象征仪式", tools: "全部工具",
  },
  "zh-TW": {
    enlarge: "放大看卡片", close: "關閉卡片", cardHint: "輕點畫面，放大欣賞完整卡片。",
    cardNote: "原創象徵畫作。具體解讀在卡片下方，畫面不是對未來的預言。",
    continueNote: "在目前分頁沿用這個生日，進入表單後仍可核對或修改。",
    carried: "已帶入免費意象卡使用的生日。請核對，再補充當地出生時間與城市。",
    cityHelp: "可以輸入城市名或選擇建議。目前這份報告只識別列表中的城市及其別名，並非全球城市搜尋。",
    cityError: "暫未識別這個城市。請選擇符合的建議，不要用其他出生地代替。",
    cityMatched: "已識別出生地：", moreArt: "欣賞動態意象畫作", morePractices: "更多探索與象徵儀式", tools: "全部工具",
  },
  ru: {
    enlarge: "Открыть карточку крупнее", close: "Закрыть карточку", cardHint: "Нажмите на изображение, чтобы рассмотреть карточку.",
    cardNote: "Авторский символический образ. Толкование находится под карточкой; изображение не предсказывает будущее.",
    continueNote: "Дата перейдёт в форму в этой вкладке. Её можно проверить или изменить.",
    carried: "Дата перенесена из бесплатной карточки. Проверьте её и добавьте местное время и город рождения.",
    cityHelp: "Введите название или выберите подсказку. Пока отчёт распознаёт только города из списка и их варианты названий, а не любой город мира.",
    cityError: "Этот город пока не распознан. Выберите подходящую подсказку; не заменяйте место рождения другим городом.",
    cityMatched: "Распознано место рождения:", moreArt: "Посмотреть анимированные образы", morePractices: "Другие практики и символические ритуалы", tools: "Все инструменты",
  },
};
