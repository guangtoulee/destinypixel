"use client";

import "./candy.css";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

type ProductId = "sleep" | "gastro";
type Language = "zh" | "en";
type LocalizedText = Record<Language, string>;

type CartProduct = {
  id: ProductId;
  name: string;
  subtitle: string;
  image: string;
  tone: "gold" | "blue";
};

type ProductDefinition = Omit<CartProduct, "name" | "subtitle"> & {
  name: LocalizedText;
  subtitle: LocalizedText;
};

const products: ProductDefinition[] = [
  {
    id: "sleep",
    name: { zh: "Whole Sleep 睡眠含片", en: "Whole Sleep Melatonin Pastilles" },
    subtitle: { zh: "褪黑素 · 柑橘风味 · 无添加糖", en: "Melatonin · Tangerine flavour · Sugar-free" },
    image: "/candy/whole-sleep.jpg",
    tone: "gold",
  },
  {
    id: "gastro",
    name: { zh: "Whole Gastro 餐后含片", en: "Whole Gastro After-meal Pastilles" },
    subtitle: { zh: "钙镁配方 · 薄荷风味 · 无添加糖", en: "Calcium & magnesium · Peppermint · Sugar-free" },
    image: "/candy/whole-gastro.png",
    tone: "blue",
  },
];

const otherProducts = [
  {
    label: "VITAMINCANDY",
    title: { zh: "维生素糖果", en: "Vitamin Candy" },
    copy: { zh: "维生素 C、多种维生素与天然抗氧化配方，覆盖莓果、芒果、柑橘等多种风味。", en: "Vitamin C, multivitamin and natural antioxidant formulas in berry, mango, citrus and more." },
    image: "/candy/jake-candy.jpg",
    color: "orange",
  },
  {
    label: "JAKE MINTS",
    title: { zh: "无糖薄荷含片", en: "Sugar-free Mints" },
    copy: { zh: "清新口气，轻巧便携。留兰香与薄荷两种经典风味，适合日常随身携带。", en: "Fresh breath in a pocket-friendly format, with classic spearmint and peppermint flavours." },
    image: "/candy/jake-mints.jpg",
    color: "mint",
  },
  {
    label: "JAKE INFINITY",
    title: { zh: "持久清新系列", en: "Long-lasting Freshness" },
    copy: { zh: "独立纸包设计，带来更持久、更鲜明的清新体验。", en: "Individually wrapped mints created for a more intense, long-lasting fresh experience." },
    image: "/candy/jake-mints.jpg",
    color: "violet",
  },
];

const copy = {
  zh: {
    languageName: "中文",
    switchLanguage: "Switch to English",
    notice: "源自塞尔维亚 · 中国市场筹备中",
    noticeLegal: "产品上市信息以中国备案及包装标签为准",
    homeLabel: "Whole 中国首页",
    china: "中国",
    nav: { products: "主推产品", collections: "全线产品", story: "品牌故事", quality: "品质标准", shop: "在线选购" },
    bag: "选购袋",
    openBag: "打开选购袋",
    items: "件商品",
    menuOpen: "打开菜单",
    menuClose: "关闭菜单",
    hero: {
      line1: "把功能，", line2: "做成一颗", line3: "好吃的糖。",
      description: "来自欧洲的含片制造经验，将精准配方、便携包装与愉悦风味装进每一颗。现在，为中国消费者而来。",
      cta: "探索两款主推产品", story: "了解品牌故事", aria: "Whole Sleep 与 Whole Gastro 产品展示",
      sleepAlt: "Whole Sleep 睡眠含片欧洲版包装", sleepLine: "让夜晚回到自己的节奏",
      gastroAlt: "Whole Gastro 餐后含片欧洲版包装", gastroLine: "给餐后时刻多一点轻松",
      imageNote: "包装图为欧洲版本示意", scroll: "向下探索",
    },
    benefits: ["无添加糖", "无麸质", "便携泡罩包装", "欧洲制造经验", "缓慢含化体验"],
    productsAria: "产品特点",
    featured: {
      title1: "两颗糖，", title2: "照顾一天的两个时刻。",
      intro: "不是传统糖果，也不是冰冷的药片。Whole 将功能成分与含片体验结合，提供轻巧、清晰、易坚持的日常选择。",
      sleepKicker: "WHOLE SLEEP · 夜间节奏", sleepTitle1: "睡前一颗，", sleepTitle2: "把喧嚣留在夜外。",
      sleepCopy: "柑橘风味褪黑素含片。睡前在口中缓慢含化，为偶发的入睡困难与作息变化提供一种轻巧的补充选择。",
      melatonin: "褪黑素 / 片*", piecesEu: "片 / 欧洲版示意", addedSugar: "添加糖",
      tangerine: "柑橘风味", adults: "成人使用", bedtime: "睡前含化",
      add: "加入选购袋", usage: "查看使用说明",
      sleepLegal: "* 海外公开版本配方信息；中国上市版本以最终备案、标签与说明为准。",
      gastroKicker: "WHOLE GASTRO · 餐后时刻", gastroTitle1: "餐后含化，", gastroTitle2: "清新，也更从容。",
      gastroCopy: "薄荷风味钙镁含片，以碳酸钙和氢氧化镁为主要成分。为餐后容易感到反酸、烧心或消化不适的成年人提供方便的含片形式。",
      calcium: "钙 / 片*", magnesium: "镁 / 片*", pieces: "片 / 欧洲版", peppermint: "薄荷风味", sugarFree: "无添加糖", afterMeal: "餐后含化",
      gastroLegal: "* 根据海外公开产品资料换算；本产品不用于诊断、治疗或预防疾病。",
    },
    moments: {
      nightTitle1: "夜深了，", nightTitle2: "让身体慢慢关机。", nightCopy: "减少蓝光、保持规律作息，再给自己一颗缓慢含化的睡前仪式。",
      mealTitle1: "吃完了，", mealTitle2: "把清爽留在口中。", mealCopy: "便携泡罩装，放进口袋或手袋，适合工作、差旅与外出就餐。",
    },
    collections: { title1: "不止两款。", title2: "每一种日常，都有好味道。", global: "访问全球官网" },
    story: {
      imageAlt: "Packom International 品牌与产品展示", markets: "出口市场",
      title1: "一个塞尔维亚家庭，", title2: "二十余年的糖果新想法。",
      p1: "Packom International 创立于 2002 年。这个家族企业希望给传统糖果加入更多功能价值，于是把配方、风味、独特三角形含片与“Fresh and Protect”包装方式结合起来。",
      p2: "今天，Packom 在贝尔格莱德设有现代化生产基地，自有 Jake Vitamincandy 与 Whole Supplements 品牌，也为全球客户提供定制配方与品牌合作。",
      founded: "家族事业启程", capacity: "泡罩包日产能力*", shelf: "海外版本保质期*",
      legal: "* 数据来自品牌全球官网，中国版本以实际生产与备案信息为准。",
    },
    quality: {
      title1: "从欧洲经验，", title2: "到中国制造。",
      intro: "项目计划将成熟配方与产品经验引入中国，并与符合要求的国内工厂合作生产。原料、配方、标签和宣传均将在中国法规框架下重新确认。",
      steps: [
        ["配方与技术转移", "基于 Packom 的含片工艺与海外成熟产品经验。"],
        ["中国工厂合作", "选择具备相应生产许可、质量体系与追溯能力的合作伙伴。"],
        ["本地合规验证", "完成原料适用性、产品分类、标签及宣称审查后再上市。"],
        ["批次追溯", "二维码连接产品信息、使用提示与官方购买渠道。"],
      ],
      legal: "以上为 Packom 海外公开资质信息，具体范围与有效期以证书原件为准；不等同于中国合作工厂资质。",
    },
    shop: {
      title1: "把日常需要，", title2: "装进口袋。",
      intro: "中国市场价格与支付通道将在相关备案及供应准备完成后开放。现在可先加入选购袋，登记首发购买意向。",
      sleepMoment: "睡前时刻", mealMoment: "餐后时刻", price: "首发价格待公布", addAria: "加入选购袋",
    },
    faq: {
      title1: "认真了解，", title2: "再安心选择。",
      questions: [
        ["Whole Sleep 怎么使用？", "海外公开版本建议成年人睡前将 1 片在口中缓慢含化。服用后可能产生困倦，不建议驾驶或操作机器；请勿与酒精同用。中国上市版本以最终标签和说明为准。"],
        ["Whole Gastro 怎么使用？", "海外公开资料建议成年人餐后含化，具体次数与最大用量因版本不同而有差异。中国上市前将根据产品分类与监管要求确认最终用法用量。"],
        ["儿童、孕期或哺乳期能使用吗？", "不建议自行使用。褪黑素海外版本明确不适用于未成年人、孕妇及哺乳期人群；有基础疾病、正在用药或对成分敏感者，应先咨询医生或药师。"],
        ["这是药品吗？", "海外版本以食品补充剂形式销售。中国市场的产品属性、准入路径与可用宣称尚待最终确认；网站不提供诊断或治疗建议，持续或严重不适请及时就医。"],
      ],
    },
    compliance: { title: "中国市场信息说明", copy: "本网站当前为品牌与产品筹备展示页，包装、规格、配方、价格、购买渠道及使用说明均可能在上市前调整。涉及“睡眠”“反酸”“烧心”等内容仅用于介绍海外公开产品定位，不构成疾病治疗、预防或医疗建议。" },
    footer: {
      title1: "好吃，是开始。", title2: "更好的日常，是答案。", explore: "探索", brand: "品牌", contact: "联系", global: "全球官网",
      inquiry: "中国合作与经销咨询", note: "产品筹备展示页。",
    },
    drawer: {
      title: "选购袋", close: "关闭选购袋", empty: "选购袋还是空的", emptyCopy: "挑选你感兴趣的产品，我们会在中国首发时通知你。", continue: "继续探索",
      decrease: "减少数量", increase: "增加数量", price: "价格", priceNote: "中国首发前公布", register: "登记购买意向", noObligation: "登记不产生付款或购买义务。",
    },
    modal: {
      close: "关闭登记窗口", title: "登记首发购买意向", intro: "提交后将打开你的邮件客户端，由你确认发送。我们不会在当前网页保存个人信息。",
      name: "姓名", namePlaceholder: "如何称呼你", phone: "手机", phonePlaceholder: "用于首发联系", city: "所在城市", cityPlaceholder: "例如：上海", note: "备注", notePlaceholder: "数量、合作或其他需求（选填）",
      submit: "生成购买意向邮件", ready: "邮件已经为你准备好", readyCopy: "请在系统邮件客户端中确认并发送。我们会根据中国市场进度与你联系。", done: "完成", none: "暂未选择产品",
      emailSubject: "Whole 中国市场购买意向", emailName: "姓名", emailPhone: "手机", emailCity: "城市", emailItems: "意向产品", emailNote: "备注", noNote: "无",
    },
  },
  en: {
    languageName: "English",
    switchLanguage: "切换到中文",
    notice: "FROM SERBIA · PREPARING FOR CHINA",
    noticeLegal: "China launch details are subject to local filing and final packaging labels",
    homeLabel: "Whole China home",
    china: "CHINA",
    nav: { products: "Featured", collections: "Collections", story: "Our Story", quality: "Quality", shop: "Shop" },
    bag: "Bag",
    openBag: "Open shopping bag",
    items: "items",
    menuOpen: "Open menu",
    menuClose: "Close menu",
    hero: {
      line1: "Function,", line2: "made", line3: "delicious.",
      description: "European pastille-making expertise brings precise formulas, portable packaging and enjoyable flavour into every piece. Now, created for China.",
      cta: "Explore our two heroes", story: "Discover our story", aria: "Whole Sleep and Whole Gastro product showcase",
      sleepAlt: "Whole Sleep European packaging", sleepLine: "Let the night return to its rhythm",
      gastroAlt: "Whole Gastro European packaging", gastroLine: "A lighter moment after every meal",
      imageNote: "European packaging shown for reference", scroll: "SCROLL TO EXPLORE",
    },
    benefits: ["SUGAR-FREE", "GLUTEN-FREE", "PORTABLE BLISTER PACK", "EUROPEAN EXPERTISE", "SLOW-DISSOLVE EXPERIENCE"],
    productsAria: "Product benefits",
    featured: {
      title1: "Two pastilles.", title2: "Two moments in your day.",
      intro: "Not conventional candy, and not a clinical-looking tablet. Whole combines functional ingredients with an enjoyable pastille experience that is simple, clear and easy to keep up.",
      sleepKicker: "WHOLE SLEEP · NIGHT RHYTHM", sleepTitle1: "One before bed.", sleepTitle2: "Leave the noise outside.",
      sleepCopy: "A tangerine-flavoured melatonin pastille designed to dissolve slowly before bedtime—a convenient supplement choice for occasional difficulty falling asleep or changes in routine.",
      melatonin: "MELATONIN / PIECE*", piecesEu: "PIECES / EU VERSION", addedSugar: "ADDED SUGAR",
      tangerine: "TANGERINE", adults: "FOR ADULTS", bedtime: "BEFORE BED",
      add: "Add to bag", usage: "Usage information",
      sleepLegal: "* Formula information from publicly available overseas versions. The China version is subject to final filing, labelling and instructions.",
      gastroKicker: "WHOLE GASTRO · AFTER-MEAL MOMENT", gastroTitle1: "Dissolve after meals.", gastroTitle2: "Fresh, calm, convenient.",
      gastroCopy: "A peppermint-flavoured calcium and magnesium pastille with calcium carbonate and magnesium hydroxide. A convenient format for adults who occasionally experience acid reflux, heartburn or indigestion after meals.",
      calcium: "CALCIUM / PIECE*", magnesium: "MAGNESIUM / PIECE*", pieces: "PIECES / EU VERSION", peppermint: "PEPPERMINT", sugarFree: "SUGAR-FREE", afterMeal: "AFTER MEALS",
      gastroLegal: "* Calculated from publicly available overseas product information. This product is not intended to diagnose, treat, cure or prevent disease.",
    },
    moments: {
      nightTitle1: "The day is done.", nightTitle2: "Let your body power down.", nightCopy: "Reduce blue light, keep a regular routine, and add a slow-dissolving bedtime ritual.",
      mealTitle1: "The meal is over.", mealTitle2: "Keep the freshness with you.", mealCopy: "Pocket-friendly blister packaging for work, travel and meals away from home.",
    },
    collections: { title1: "More than two.", title2: "Good taste for every day.", global: "Visit global website" },
    story: {
      imageAlt: "Packom International brand and product display", markets: "EXPORT MARKETS",
      title1: "One Serbian family.", title2: "More than two decades of new ideas.",
      p1: "Packom International was founded in 2002. The family business set out to bring greater functional value to traditional candy, combining formulas, flavour, a distinctive triangular pastille and its Fresh and Protect packaging method.",
      p2: "Today, Packom operates a modern production facility in Belgrade, owns Jake Vitamincandy and Whole Supplements, and develops custom formulas and private-label partnerships for customers worldwide.",
      founded: "FAMILY BUSINESS BEGAN", capacity: "BLISTER PACKS / DAY*", shelf: "OVERSEAS SHELF LIFE*",
      legal: "* Data from the brand's global website. China versions are subject to actual manufacturing and filing information.",
    },
    quality: {
      title1: "European experience.", title2: "Made for China.",
      intro: "The project plans to bring proven formulas and product expertise to China through qualified domestic manufacturing partners. Ingredients, formulas, labels and communications will be reviewed under the applicable Chinese regulatory framework.",
      steps: [
        ["Formula & technology transfer", "Built on Packom's pastille process and established overseas product experience."],
        ["China manufacturing partner", "Selecting partners with relevant licences, quality systems and traceability."],
        ["Local compliance review", "Confirming ingredient suitability, product classification, labelling and claims before launch."],
        ["Batch traceability", "QR codes connect product information, usage guidance and official purchase channels."],
      ],
      legal: "These are publicly stated Packom overseas certifications. Scope and validity are subject to the original certificates and do not represent the qualifications of a future China manufacturing partner.",
    },
    shop: {
      title1: "Everyday support,", title2: "ready for your pocket.",
      intro: "China pricing and payment channels will open after the relevant filings and supply preparations are complete. Add products to your bag now to register your launch interest.",
      sleepMoment: "BEDTIME", mealMoment: "AFTER MEALS", price: "LAUNCH PRICE TO BE ANNOUNCED", addAria: "Add to bag",
    },
    faq: {
      title1: "Know the details.", title2: "Choose with confidence.",
      questions: [
        ["How should Whole Sleep be used?", "Public overseas versions advise adults to let one pastille dissolve slowly in the mouth before bed. It may cause drowsiness; do not drive or operate machinery after use, and do not combine it with alcohol. Follow the final China label and instructions when launched."],
        ["How should Whole Gastro be used?", "Public overseas information recommends dissolving the pastilles after meals. Frequency and maximum daily intake vary by version. Final directions for China will be confirmed according to product classification and regulatory requirements."],
        ["Can children, pregnant or breastfeeding people use it?", "Do not self-administer. Overseas melatonin versions are not intended for minors, pregnant or breastfeeding people. Consult a doctor or pharmacist if you have a medical condition, take medication or are sensitive to any ingredient."],
        ["Is this a medicine?", "Overseas versions are sold as food supplements. Product classification, market access and permitted claims for China are still subject to final confirmation. This website does not provide diagnosis or treatment advice; seek medical care for persistent or severe symptoms."],
      ],
    },
    compliance: { title: "CHINA MARKET INFORMATION", copy: "This website is currently a brand and product preparation page. Packaging, specifications, formulas, pricing, purchase channels and directions may change before launch. References to sleep, acid reflux or heartburn describe publicly available overseas positioning only and do not constitute medical advice or claims to treat or prevent disease." },
    footer: {
      title1: "Good taste is the beginning.", title2: "A better routine is the answer.", explore: "EXPLORE", brand: "BRAND", contact: "CONTACT", global: "Global website",
      inquiry: "China partnership & distribution", note: "Pre-launch product showcase.",
    },
    drawer: {
      title: "Your bag", close: "Close shopping bag", empty: "Your bag is empty", emptyCopy: "Choose the products you are interested in and we will keep you informed about the China launch.", continue: "Keep exploring",
      decrease: "Decrease quantity", increase: "Increase quantity", price: "Price", priceNote: "ANNOUNCED BEFORE CHINA LAUNCH", register: "Register purchase interest", noObligation: "Registration creates no payment or purchase obligation.",
    },
    modal: {
      close: "Close registration", title: "Register for the China launch", intro: "Submitting opens your email app for you to review and send. This webpage does not store your personal information.",
      name: "Name", namePlaceholder: "How should we address you?", phone: "Phone", phonePlaceholder: "For launch updates", city: "City", cityPlaceholder: "e.g. Shanghai", note: "Message", notePlaceholder: "Quantity, partnership or other needs (optional)",
      submit: "Create purchase-interest email", ready: "Your email is ready", readyCopy: "Please review and send it in your email app. We will contact you as the China launch progresses.", done: "Done", none: "No product selected",
      emailSubject: "Whole China purchase interest", emailName: "Name", emailPhone: "Phone", emailCity: "City", emailItems: "Products", emailNote: "Message", noNote: "None",
    },
  },
} as const;

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

function ProductVisual({ product, compact = false }: { product: CartProduct; compact?: boolean }) {
  return (
    <div className={`product-visual ${product.tone} ${compact ? "compact" : ""}`}>
      <div className="product-glow" />
      <img src={product.image} alt={product.name} />
      <span className="product-orbit orbit-one" />
      <span className="product-orbit orbit-two" />
    </div>
  );
}

export default function Home() {
  const [language, setLanguage] = useState<Language>("zh");
  const [menuOpen, setMenuOpen] = useState(false);
  const [cart, setCart] = useState<Record<ProductId, number>>({ sleep: 0, gastro: 0 });
  const [cartOpen, setCartOpen] = useState(false);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const c = copy[language];
  const localizedProducts = useMemo<CartProduct[]>(
    () => products.map((product) => ({ ...product, name: product.name[language], subtitle: product.subtitle[language] })),
    [language],
  );
  const localizedOtherProducts = useMemo(
    () => otherProducts.map((product) => ({ ...product, title: product.title[language], copy: product.copy[language] })),
    [language],
  );

  const cartCount = cart.sleep + cart.gastro;
  const selectedProducts = useMemo(
    () => localizedProducts.filter((product) => cart[product.id] > 0),
    [cart, localizedProducts],
  );

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem("whole-language");
    if (savedLanguage === "zh" || savedLanguage === "en") {
      setLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
    window.localStorage.setItem("whole-language", language);
  }, [language]);

  useEffect(() => {
    document.body.style.overflow = cartOpen || inquiryOpen || menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [cartOpen, inquiryOpen, menuOpen]);

  const addToCart = (id: ProductId) => {
    setCart((current) => ({ ...current, [id]: current[id] + 1 }));
    setCartOpen(true);
  };

  const updateQuantity = (id: ProductId, delta: number) => {
    setCart((current) => ({ ...current, [id]: Math.max(0, current[id] + delta) }));
  };

  const openInquiry = () => {
    setCartOpen(false);
    setInquiryOpen(true);
    setSubmitted(false);
  };

  const submitInquiry = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const items = selectedProducts.length
      ? selectedProducts.map((product) => `${product.name} × ${cart[product.id]}`).join(language === "zh" ? "、" : ", ")
      : c.modal.none;
    const subject = encodeURIComponent(c.modal.emailSubject);
    const body = encodeURIComponent(
      `${c.modal.emailName}: ${data.get("name")}\n${c.modal.emailPhone}: ${data.get("phone")}\n${c.modal.emailCity}: ${data.get("city")}\n${c.modal.emailItems}: ${items}\n${c.modal.emailNote}: ${data.get("message") || c.modal.noNote}`,
    );
    window.location.href = `mailto:info@vitamincandy.com?subject=${subject}&body=${body}`;
    setSubmitted(true);
  };

  const toggleLanguage = () => setLanguage((current) => current === "zh" ? "en" : "zh");

  return (
    <main className="candy-page">
      <div className="notice-bar">
        <span>{c.notice}</span>
        <a href="#compliance">{c.noticeLegal}</a>
      </div>

      <header className="site-header">
        <a className="brand" href="#top" aria-label={c.homeLabel}>
          <span className="brand-whole">wh<span>o</span>le</span>
          <span className="brand-divider" />
          <span className="brand-china">{c.china}</span>
        </a>

        <nav className="desktop-nav" aria-label={language === "zh" ? "主导航" : "Main navigation"}>
          <a href="#products">{c.nav.products}</a>
          <a href="#collections">{c.nav.collections}</a>
          <a href="#story">{c.nav.story}</a>
          <a href="#quality">{c.nav.quality}</a>
        </nav>

        <div className="header-actions">
          <button className="language-switch" onClick={toggleLanguage} aria-label={c.switchLanguage}>
            {language === "zh" ? "EN" : "中文"}
          </button>
          <button className="cart-button" onClick={() => setCartOpen(true)} aria-label={`${c.openBag}, ${cartCount} ${c.items}`}>
            {c.bag} <span>{cartCount}</span>
          </button>
          <button className="menu-button" onClick={() => setMenuOpen(true)} aria-label={c.menuOpen}>
            <i />
            <i />
          </button>
        </div>
      </header>

      <div className={`mobile-menu ${menuOpen ? "open" : ""}`} aria-hidden={!menuOpen}>
        <button className="close-button" onClick={() => setMenuOpen(false)} aria-label={c.menuClose}>×</button>
        <a href="#products" onClick={() => setMenuOpen(false)}>{c.nav.products}</a>
        <a href="#collections" onClick={() => setMenuOpen(false)}>{c.nav.collections}</a>
        <a href="#story" onClick={() => setMenuOpen(false)}>{c.nav.story}</a>
        <a href="#quality" onClick={() => setMenuOpen(false)}>{c.nav.quality}</a>
        <a href="#shop" onClick={() => setMenuOpen(false)}>{c.nav.shop}</a>
        <button className="mobile-language-switch" onClick={toggleLanguage}>{language === "zh" ? "English" : "中文"}</button>
      </div>

      <section className="hero" id="top">
        <div className="hero-grid" />
        <div className="hero-copy reveal">
          <p className="eyebrow"><span /> FUNCTIONAL CANDY · SINCE 2002</p>
          <h1>{c.hero.line1}<br />{c.hero.line2}<br /><em>{c.hero.line3}</em></h1>
          <p className="hero-description">{c.hero.description}</p>
          <div className="hero-cta">
            <a className="primary-button" href="#products">{c.hero.cta} <Arrow /></a>
            <a className="text-link" href="#story">{c.hero.story} <span>→</span></a>
          </div>
        </div>

        <div className="hero-products" aria-label={c.hero.aria}>
          <div className="hero-moon" />
          <div className="hero-card sleep-card">
            <span className="hero-card-label">01 / NIGHT</span>
            <img src="/candy/whole-sleep.jpg" alt={c.hero.sleepAlt} />
            <strong>SLEEP</strong>
            <small>{c.hero.sleepLine}</small>
          </div>
          <div className="hero-card gastro-card">
            <span className="hero-card-label">02 / AFTER MEAL</span>
            <img src="/candy/whole-gastro.png" alt={c.hero.gastroAlt} />
            <strong>GASTRO</strong>
            <small>{c.hero.gastroLine}</small>
          </div>
          <span className="hero-note">{c.hero.imageNote}</span>
        </div>

        <div className="scroll-cue"><span />{c.hero.scroll}</div>
      </section>

      <section className="benefit-strip" aria-label={c.productsAria}>
        <div className="marquee-track">
          {c.benefits.map((benefit) => <span key={benefit}>{benefit} <i>✦</i></span>)}
          {c.benefits.map((benefit) => <span aria-hidden="true" key={`repeat-${benefit}`}>{benefit} <i>✦</i></span>)}
        </div>
      </section>

      <section className="products-section" id="products">
        <div className="section-heading">
          <div>
            <p className="eyebrow dark"><span /> HERO PRODUCTS</p>
            <h2>{c.featured.title1}<br />{c.featured.title2}</h2>
          </div>
          <p>{c.featured.intro}</p>
        </div>

        <article className="feature-product feature-sleep">
          <div className="feature-visual-wrap">
            <ProductVisual product={localizedProducts[0]} />
            <div className="feature-number">01</div>
          </div>
          <div className="feature-copy">
            <span className="feature-kicker">{c.featured.sleepKicker}</span>
            <h3>{c.featured.sleepTitle1}<br />{c.featured.sleepTitle2}</h3>
            <p>{c.featured.sleepCopy}</p>
            <div className="ingredient-row">
              <div><strong>1 mg</strong><span>{c.featured.melatonin}</span></div>
              <div><strong>15</strong><span>{c.featured.piecesEu}</span></div>
              <div><strong>0</strong><span>{c.featured.addedSugar}</span></div>
            </div>
            <div className="product-notes">
              <span>{c.featured.tangerine}</span><span>{c.featured.adults}</span><span>{c.featured.bedtime}</span>
            </div>
            <div className="feature-actions">
              <button className="primary-button light" onClick={() => addToCart("sleep")}>{c.featured.add} <Arrow /></button>
              <a href="#sleep-info">{c.featured.usage}</a>
            </div>
            <small className="legal-line">{c.featured.sleepLegal}</small>
          </div>
        </article>

        <article className="feature-product feature-gastro">
          <div className="feature-copy">
            <span className="feature-kicker">{c.featured.gastroKicker}</span>
            <h3>{c.featured.gastroTitle1}<br />{c.featured.gastroTitle2}</h3>
            <p>{c.featured.gastroCopy}</p>
            <div className="ingredient-row">
              <div><strong>72 mg</strong><span>{c.featured.calcium}</span></div>
              <div><strong>20 mg</strong><span>{c.featured.magnesium}</span></div>
              <div><strong>12</strong><span>{c.featured.pieces}</span></div>
            </div>
            <div className="product-notes">
              <span>{c.featured.peppermint}</span><span>{c.featured.sugarFree}</span><span>{c.featured.afterMeal}</span>
            </div>
            <div className="feature-actions">
              <button className="primary-button dark-button" onClick={() => addToCart("gastro")}>{c.featured.add} <Arrow /></button>
              <a href="#gastro-info">{c.featured.usage}</a>
            </div>
            <small className="legal-line">{c.featured.gastroLegal}</small>
          </div>
          <div className="feature-visual-wrap">
            <ProductVisual product={localizedProducts[1]} />
            <div className="feature-number">02</div>
          </div>
        </article>
      </section>

      <section className="moments-section">
        <div className="moment-card night">
          <span>22:30</span>
          <h3>{c.moments.nightTitle1}<br />{c.moments.nightTitle2}</h3>
          <p>{c.moments.nightCopy}</p>
        </div>
        <div className="moment-card aftermeal">
          <span>13:10</span>
          <h3>{c.moments.mealTitle1}<br />{c.moments.mealTitle2}</h3>
          <p>{c.moments.mealCopy}</p>
        </div>
      </section>

      <section className="collections-section" id="collections">
        <div className="section-heading compact-heading">
          <div>
            <p className="eyebrow dark"><span /> MORE FROM JAKE</p>
            <h2>{c.collections.title1}<br />{c.collections.title2}</h2>
          </div>
          <img src="/candy/jake-logo.png" alt="Jake Vitamincandy" className="jake-logo" />
        </div>
        <div className="collection-grid">
          {localizedOtherProducts.map((item, index) => (
            <article className={`collection-card ${item.color}`} key={item.title}>
              <div className="collection-image"><img src={item.image} alt={item.title} /></div>
              <span>{String(index + 1).padStart(2, "0")} / {item.label}</span>
              <h3>{item.title}</h3>
              <p>{item.copy}</p>
              <a href="https://www.vitamincandy.com" target="_blank" rel="noreferrer">{c.collections.global} <Arrow /></a>
            </article>
          ))}
        </div>
      </section>

      <section className="story-section" id="story">
        <div className="story-media">
          <img src="/candy/packom-family.jpg" alt={c.story.imageAlt} />
          <div className="story-stat"><strong>40+</strong><span>{c.story.markets}</span></div>
        </div>
        <div className="story-copy">
          <p className="eyebrow light-text"><span /> THE PACKOM STORY</p>
          <h2>{c.story.title1}<br />{c.story.title2}</h2>
          <p>{c.story.p1}</p>
          <p>{c.story.p2}</p>
          <div className="story-metrics">
            <div><strong>2002</strong><span>{c.story.founded}</span></div>
            <div><strong>250K</strong><span>{c.story.capacity}</span></div>
            <div><strong>24M</strong><span>{c.story.shelf}</span></div>
          </div>
          <small>{c.story.legal}</small>
        </div>
      </section>

      <section className="quality-section" id="quality">
        <div className="quality-intro">
          <p className="eyebrow dark"><span /> QUALITY FIRST</p>
          <h2>{c.quality.title1}<br />{c.quality.title2}</h2>
          <p>{c.quality.intro}</p>
        </div>
        <div className="quality-path">
          {c.quality.steps.map((step, index) => (
            <div className="quality-step" key={step[0]}>
              <span>{String(index + 1).padStart(2, "0")}</span><strong>{step[0]}</strong><p>{step[1]}</p>
            </div>
          ))}
        </div>
        <div className="cert-row">
          <span>GMP</span><span>HACCP</span><span>IFS FOOD</span><span>GS1</span><span>HALAL</span><span>KOSHER</span>
          <small>{c.quality.legal}</small>
        </div>
      </section>

      <section className="shop-section" id="shop">
        <div className="shop-heading">
          <p className="eyebrow"><span /> ONLINE STORE</p>
          <h2>{c.shop.title1}<br />{c.shop.title2}</h2>
          <p>{c.shop.intro}</p>
        </div>
        <div className="shop-grid">
          {localizedProducts.map((product) => (
            <article className={`shop-card ${product.tone}`} key={product.id}>
              <ProductVisual product={product} compact />
              <div className="shop-card-copy">
                <span>{product.id === "sleep" ? c.shop.sleepMoment : c.shop.mealMoment}</span>
                <h3>{product.name}</h3>
                <p>{product.subtitle}</p>
                <div className="shop-card-bottom">
                  <strong>{c.shop.price}</strong>
                  <button onClick={() => addToCart(product.id)} aria-label={`${c.shop.addAria}: ${product.name}`}>＋</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="use-section" id="sleep-info">
        <div className="use-heading">
          <p className="eyebrow dark"><span /> GOOD TO KNOW</p>
          <h2>{c.faq.title1}<br />{c.faq.title2}</h2>
        </div>
        <div className="use-grid">
          {c.faq.questions.map((question, index) => (
            <details key={question[0]} open={index === 0} id={index === 1 ? "gastro-info" : undefined}>
              <summary>{question[0]}<span>＋</span></summary>
              <p>{question[1]}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="compliance-section" id="compliance">
        <div className="compliance-mark">!</div>
        <div>
          <strong>{c.compliance.title}</strong>
          <p>{c.compliance.copy}</p>
        </div>
      </section>

      <footer>
        <div className="footer-top">
          <div>
            <a className="brand footer-brand" href="#top"><span className="brand-whole">wh<span>o</span>le</span><span className="brand-divider" /><span className="brand-china">{c.china}</span></a>
            <h2>{c.footer.title1}<br />{c.footer.title2}</h2>
          </div>
          <div className="footer-links">
            <div><strong>{c.footer.explore}</strong><a href="#products">{c.nav.products}</a><a href="#collections">{c.nav.collections}</a><a href="#shop">{c.nav.shop}</a></div>
            <div><strong>{c.footer.brand}</strong><a href="#story">{c.nav.story}</a><a href="#quality">{c.nav.quality}</a><a href="https://www.vitamincandy.com" target="_blank" rel="noreferrer">{c.footer.global}</a></div>
            <div><strong>{c.footer.contact}</strong><a href="mailto:info@vitamincandy.com">info@vitamincandy.com</a><span>{c.footer.inquiry}</span></div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Whole China. {c.footer.note}</span>
          <span>Packom International · Belgrade, Serbia</span>
        </div>
      </footer>

      <div className={`drawer-backdrop ${cartOpen ? "visible" : ""}`} onClick={() => setCartOpen(false)} />
      <aside className={`cart-drawer ${cartOpen ? "open" : ""}`} aria-hidden={!cartOpen} aria-label={c.drawer.title}>
        <div className="drawer-header"><div><span>YOUR SELECTION</span><h2>{c.drawer.title}</h2></div><button onClick={() => setCartOpen(false)} aria-label={c.drawer.close}>×</button></div>
        <div className="drawer-body">
          {selectedProducts.length === 0 ? (
            <div className="empty-cart"><span>○</span><h3>{c.drawer.empty}</h3><p>{c.drawer.emptyCopy}</p><button onClick={() => setCartOpen(false)}>{c.drawer.continue}</button></div>
          ) : (
            selectedProducts.map((product) => (
              <div className="cart-item" key={product.id}>
                <img src={product.image} alt="" />
                <div><strong>{product.name}</strong><span>{product.subtitle}</span><div className="quantity"><button onClick={() => updateQuantity(product.id, -1)} aria-label={c.drawer.decrease}>−</button><b>{cart[product.id]}</b><button onClick={() => updateQuantity(product.id, 1)} aria-label={c.drawer.increase}>＋</button></div></div>
              </div>
            ))
          )}
        </div>
        {selectedProducts.length > 0 && <div className="drawer-footer"><p><span>{c.drawer.price}</span><strong>{c.drawer.priceNote}</strong></p><button className="primary-button light full" onClick={openInquiry}>{c.drawer.register} <Arrow /></button><small>{c.drawer.noObligation}</small></div>}
      </aside>

      <div className={`modal-backdrop ${inquiryOpen ? "visible" : ""}`}>
        <div className="inquiry-modal" role="dialog" aria-modal="true" aria-labelledby="inquiry-title">
          <button className="close-button modal-close" onClick={() => setInquiryOpen(false)} aria-label={c.modal.close}>×</button>
          {!submitted ? (
            <>
              <span className="modal-kicker">FIRST RELEASE · CHINA</span>
              <h2 id="inquiry-title">{c.modal.title}</h2>
              <p>{c.modal.intro}</p>
              <form onSubmit={submitInquiry}>
                <label>{c.modal.name}<input name="name" required autoComplete="name" placeholder={c.modal.namePlaceholder} /></label>
                <label>{c.modal.phone}<input name="phone" required inputMode="tel" autoComplete="tel" placeholder={c.modal.phonePlaceholder} /></label>
                <label>{c.modal.city}<input name="city" required autoComplete="address-level2" placeholder={c.modal.cityPlaceholder} /></label>
                <label>{c.modal.note}<textarea name="message" rows={3} placeholder={c.modal.notePlaceholder} /></label>
                <button className="primary-button dark-button full" type="submit">{c.modal.submit} <Arrow /></button>
              </form>
            </>
          ) : (
            <div className="submitted-state"><span>✓</span><h2>{c.modal.ready}</h2><p>{c.modal.readyCopy}</p><button onClick={() => setInquiryOpen(false)}>{c.modal.done}</button></div>
          )}
        </div>
      </div>
    </main>
  );
}
