"use client";

import "./canddy.css";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

type ProductId = "sleep" | "gastro";

type CartProduct = {
  id: ProductId;
  name: string;
  subtitle: string;
  image: string;
  tone: "gold" | "blue";
};

const products: CartProduct[] = [
  {
    id: "sleep",
    name: "Whole Sleep 睡眠含片",
    subtitle: "褪黑素 · 柑橘风味 · 无添加糖",
    image: "/canddy/whole-sleep.jpg",
    tone: "gold",
  },
  {
    id: "gastro",
    name: "Whole Gastro 餐后含片",
    subtitle: "钙镁配方 · 薄荷风味 · 无添加糖",
    image: "/canddy/whole-gastro.png",
    tone: "blue",
  },
];

const otherProducts = [
  {
    label: "VITAMINCANDY",
    title: "维生素糖果",
    copy: "维生素 C、多种维生素与天然抗氧化配方，覆盖莓果、芒果、柑橘等多种风味。",
    image: "/canddy/jake-candy.jpg",
    color: "orange",
  },
  {
    label: "JAKE MINTS",
    title: "无糖薄荷含片",
    copy: "清新口气，轻巧便携。留兰香与薄荷两种经典风味，适合日常随身携带。",
    image: "/canddy/jake-mints.jpg",
    color: "mint",
  },
  {
    label: "JAKE INFINITY",
    title: "持久清新系列",
    copy: "独立纸包设计，带来更持久、更鲜明的清新体验。",
    image: "/canddy/jake-mints.jpg",
    color: "violet",
  },
];

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

function ProductVisual({ product, compact = false }: { product: CartProduct; compact?: boolean }) {
  return (
    <div className={`product-visual ${product.tone} ${compact ? "compact" : ""}`}>
      <div className="product-glow" />
      <img src={product.image} alt={`${product.name} 欧洲版产品包装示意`} />
      <span className="product-orbit orbit-one" />
      <span className="product-orbit orbit-two" />
    </div>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cart, setCart] = useState<Record<ProductId, number>>({ sleep: 0, gastro: 0 });
  const [cartOpen, setCartOpen] = useState(false);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const cartCount = cart.sleep + cart.gastro;
  const selectedProducts = useMemo(
    () => products.filter((product) => cart[product.id] > 0),
    [cart],
  );

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
      ? selectedProducts.map((product) => `${product.name} × ${cart[product.id]}`).join("、")
      : "暂未选择产品";
    const subject = encodeURIComponent("Whole 中国市场购买意向");
    const body = encodeURIComponent(
      `姓名：${data.get("name")}\n手机：${data.get("phone")}\n城市：${data.get("city")}\n意向产品：${items}\n备注：${data.get("message") || "无"}`,
    );
    window.location.href = `mailto:info@vitamincandy.com?subject=${subject}&body=${body}`;
    setSubmitted(true);
  };

  return (
    <main className="canddy-page">
      <div className="notice-bar">
        <span>源自塞尔维亚 · 中国市场筹备中</span>
        <a href="#compliance">产品上市信息以中国备案及包装标签为准</a>
      </div>

      <header className="site-header">
        <a className="brand" href="#top" aria-label="Whole 中国首页">
          <span className="brand-whole">wh<span>o</span>le</span>
          <span className="brand-divider" />
          <span className="brand-china">中国</span>
        </a>

        <nav className="desktop-nav" aria-label="主导航">
          <a href="#products">主推产品</a>
          <a href="#collections">全线产品</a>
          <a href="#story">品牌故事</a>
          <a href="#quality">品质标准</a>
        </nav>

        <div className="header-actions">
          <button className="cart-button" onClick={() => setCartOpen(true)} aria-label={`打开选购袋，${cartCount} 件商品`}>
            选购袋 <span>{cartCount}</span>
          </button>
          <button className="menu-button" onClick={() => setMenuOpen(true)} aria-label="打开菜单">
            <i />
            <i />
          </button>
        </div>
      </header>

      <div className={`mobile-menu ${menuOpen ? "open" : ""}`} aria-hidden={!menuOpen}>
        <button className="close-button" onClick={() => setMenuOpen(false)} aria-label="关闭菜单">×</button>
        <a href="#products" onClick={() => setMenuOpen(false)}>主推产品</a>
        <a href="#collections" onClick={() => setMenuOpen(false)}>全线产品</a>
        <a href="#story" onClick={() => setMenuOpen(false)}>品牌故事</a>
        <a href="#quality" onClick={() => setMenuOpen(false)}>品质标准</a>
        <a href="#shop" onClick={() => setMenuOpen(false)}>在线选购</a>
      </div>

      <section className="hero" id="top">
        <div className="hero-grid" />
        <div className="hero-copy reveal">
          <p className="eyebrow"><span /> FUNCTIONAL CANDY · SINCE 2002</p>
          <h1>把功能，<br />做成一颗<br /><em>好吃的糖。</em></h1>
          <p className="hero-description">来自欧洲的含片制造经验，将精准配方、便携包装与愉悦风味装进每一颗。现在，为中国消费者而来。</p>
          <div className="hero-cta">
            <a className="primary-button" href="#products">探索两款主推产品 <Arrow /></a>
            <a className="text-link" href="#story">了解品牌故事 <span>→</span></a>
          </div>
        </div>

        <div className="hero-products" aria-label="Whole Sleep 与 Whole Gastro 产品展示">
          <div className="hero-moon" />
          <div className="hero-card sleep-card">
            <span className="hero-card-label">01 / NIGHT</span>
            <img src="/canddy/whole-sleep.jpg" alt="Whole Sleep 睡眠含片欧洲版包装" />
            <strong>SLEEP</strong>
            <small>让夜晚回到自己的节奏</small>
          </div>
          <div className="hero-card gastro-card">
            <span className="hero-card-label">02 / AFTER MEAL</span>
            <img src="/canddy/whole-gastro.png" alt="Whole Gastro 餐后含片欧洲版包装" />
            <strong>GASTRO</strong>
            <small>给餐后时刻多一点轻松</small>
          </div>
          <span className="hero-note">包装图为欧洲版本示意</span>
        </div>

        <div className="scroll-cue"><span />向下探索</div>
      </section>

      <section className="benefit-strip" aria-label="产品特点">
        <div className="marquee-track">
          <span>无添加糖 <i>✦</i></span><span>无麸质 <i>✦</i></span><span>便携泡罩包装 <i>✦</i></span><span>欧洲制造经验 <i>✦</i></span><span>缓慢含化体验 <i>✦</i></span>
          <span aria-hidden="true">无添加糖 <i>✦</i></span><span aria-hidden="true">无麸质 <i>✦</i></span><span aria-hidden="true">便携泡罩包装 <i>✦</i></span><span aria-hidden="true">欧洲制造经验 <i>✦</i></span><span aria-hidden="true">缓慢含化体验 <i>✦</i></span>
        </div>
      </section>

      <section className="products-section" id="products">
        <div className="section-heading">
          <div>
            <p className="eyebrow dark"><span /> HERO PRODUCTS</p>
            <h2>两颗糖，<br />照顾一天的两个时刻。</h2>
          </div>
          <p>不是传统糖果，也不是冰冷的药片。Whole 将功能成分与含片体验结合，提供轻巧、清晰、易坚持的日常选择。</p>
        </div>

        <article className="feature-product feature-sleep">
          <div className="feature-visual-wrap">
            <ProductVisual product={products[0]} />
            <div className="feature-number">01</div>
          </div>
          <div className="feature-copy">
            <span className="feature-kicker">WHOLE SLEEP · 夜间节奏</span>
            <h3>睡前一颗，<br />把喧嚣留在夜外。</h3>
            <p>柑橘风味褪黑素含片。睡前在口中缓慢含化，为偶发的入睡困难与作息变化提供一种轻巧的补充选择。</p>
            <div className="ingredient-row">
              <div><strong>1 mg</strong><span>褪黑素 / 片*</span></div>
              <div><strong>15</strong><span>片 / 欧洲版示意</span></div>
              <div><strong>0</strong><span>添加糖</span></div>
            </div>
            <div className="product-notes">
              <span>柑橘风味</span><span>成人使用</span><span>睡前含化</span>
            </div>
            <div className="feature-actions">
              <button className="primary-button light" onClick={() => addToCart("sleep")}>加入选购袋 <Arrow /></button>
              <a href="#sleep-info">查看使用说明</a>
            </div>
            <small className="legal-line">* 海外公开版本配方信息；中国上市版本以最终备案、标签与说明为准。</small>
          </div>
        </article>

        <article className="feature-product feature-gastro">
          <div className="feature-copy">
            <span className="feature-kicker">WHOLE GASTRO · 餐后时刻</span>
            <h3>餐后含化，<br />清新，也更从容。</h3>
            <p>薄荷风味钙镁含片，以碳酸钙和氢氧化镁为主要成分。为餐后容易感到反酸、烧心或消化不适的成年人提供方便的含片形式。</p>
            <div className="ingredient-row">
              <div><strong>72 mg</strong><span>钙 / 片*</span></div>
              <div><strong>20 mg</strong><span>镁 / 片*</span></div>
              <div><strong>12</strong><span>片 / 欧洲版</span></div>
            </div>
            <div className="product-notes">
              <span>薄荷风味</span><span>无添加糖</span><span>餐后含化</span>
            </div>
            <div className="feature-actions">
              <button className="primary-button dark-button" onClick={() => addToCart("gastro")}>加入选购袋 <Arrow /></button>
              <a href="#gastro-info">查看使用说明</a>
            </div>
            <small className="legal-line">* 根据海外公开产品资料换算；本产品不用于诊断、治疗或预防疾病。</small>
          </div>
          <div className="feature-visual-wrap">
            <ProductVisual product={products[1]} />
            <div className="feature-number">02</div>
          </div>
        </article>
      </section>

      <section className="moments-section">
        <div className="moment-card night">
          <span>22:30</span>
          <h3>夜深了，<br />让身体慢慢关机。</h3>
          <p>减少蓝光、保持规律作息，再给自己一颗缓慢含化的睡前仪式。</p>
        </div>
        <div className="moment-card aftermeal">
          <span>13:10</span>
          <h3>吃完了，<br />把清爽留在口中。</h3>
          <p>便携泡罩装，放进口袋或手袋，适合工作、差旅与外出就餐。</p>
        </div>
      </section>

      <section className="collections-section" id="collections">
        <div className="section-heading compact-heading">
          <div>
            <p className="eyebrow dark"><span /> MORE FROM JAKE</p>
            <h2>不止两款。<br />每一种日常，都有好味道。</h2>
          </div>
          <img src="/canddy/jake-logo.png" alt="Jake Vitamincandy" className="jake-logo" />
        </div>
        <div className="collection-grid">
          {otherProducts.map((item, index) => (
            <article className={`collection-card ${item.color}`} key={item.title}>
              <div className="collection-image"><img src={item.image} alt={item.title} /></div>
              <span>{String(index + 1).padStart(2, "0")} / {item.label}</span>
              <h3>{item.title}</h3>
              <p>{item.copy}</p>
              <a href="https://www.vitamincandy.com" target="_blank" rel="noreferrer">访问全球官网 <Arrow /></a>
            </article>
          ))}
        </div>
      </section>

      <section className="story-section" id="story">
        <div className="story-media">
          <img src="/canddy/packom-family.jpg" alt="Packom International 品牌与产品展示" />
          <div className="story-stat"><strong>40+</strong><span>出口市场</span></div>
        </div>
        <div className="story-copy">
          <p className="eyebrow light-text"><span /> THE PACKOM STORY</p>
          <h2>一个塞尔维亚家庭，<br />二十余年的糖果新想法。</h2>
          <p>Packom International 创立于 2002 年。这个家族企业希望给传统糖果加入更多功能价值，于是把配方、风味、独特三角形含片与“Fresh and Protect”包装方式结合起来。</p>
          <p>今天，Packom 在贝尔格莱德设有现代化生产基地，自有 Jake Vitamincandy 与 Whole Supplements 品牌，也为全球客户提供定制配方与品牌合作。</p>
          <div className="story-metrics">
            <div><strong>2002</strong><span>家族事业启程</span></div>
            <div><strong>250K</strong><span>泡罩包日产能力*</span></div>
            <div><strong>24M</strong><span>海外版本保质期*</span></div>
          </div>
          <small>* 数据来自品牌全球官网，中国版本以实际生产与备案信息为准。</small>
        </div>
      </section>

      <section className="quality-section" id="quality">
        <div className="quality-intro">
          <p className="eyebrow dark"><span /> QUALITY FIRST</p>
          <h2>从欧洲经验，<br />到中国制造。</h2>
          <p>项目计划将成熟配方与产品经验引入中国，并与符合要求的国内工厂合作生产。原料、配方、标签和宣传均将在中国法规框架下重新确认。</p>
        </div>
        <div className="quality-path">
          <div className="quality-step">
            <span>01</span><strong>配方与技术转移</strong><p>基于 Packom 的含片工艺与海外成熟产品经验。</p>
          </div>
          <div className="quality-step">
            <span>02</span><strong>中国工厂合作</strong><p>选择具备相应生产许可、质量体系与追溯能力的合作伙伴。</p>
          </div>
          <div className="quality-step">
            <span>03</span><strong>本地合规验证</strong><p>完成原料适用性、产品分类、标签及宣称审查后再上市。</p>
          </div>
          <div className="quality-step">
            <span>04</span><strong>批次追溯</strong><p>二维码连接产品信息、使用提示与官方购买渠道。</p>
          </div>
        </div>
        <div className="cert-row">
          <span>GMP</span><span>HACCP</span><span>IFS FOOD</span><span>GS1</span><span>HALAL</span><span>KOSHER</span>
          <small>以上为 Packom 海外公开资质信息，具体范围与有效期以证书原件为准；不等同于中国合作工厂资质。</small>
        </div>
      </section>

      <section className="shop-section" id="shop">
        <div className="shop-heading">
          <p className="eyebrow"><span /> ONLINE STORE</p>
          <h2>把日常需要，<br />装进口袋。</h2>
          <p>中国市场价格与支付通道将在相关备案及供应准备完成后开放。现在可先加入选购袋，登记首发购买意向。</p>
        </div>
        <div className="shop-grid">
          {products.map((product) => (
            <article className={`shop-card ${product.tone}`} key={product.id}>
              <ProductVisual product={product} compact />
              <div className="shop-card-copy">
                <span>{product.id === "sleep" ? "睡前时刻" : "餐后时刻"}</span>
                <h3>{product.name}</h3>
                <p>{product.subtitle}</p>
                <div className="shop-card-bottom">
                  <strong>首发价格待公布</strong>
                  <button onClick={() => addToCart(product.id)} aria-label={`将 ${product.name} 加入选购袋`}>＋</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="use-section" id="sleep-info">
        <div className="use-heading">
          <p className="eyebrow dark"><span /> GOOD TO KNOW</p>
          <h2>认真了解，<br />再安心选择。</h2>
        </div>
        <div className="use-grid">
          <details open>
            <summary>Whole Sleep 怎么使用？<span>＋</span></summary>
            <p>海外公开版本建议成年人睡前将 1 片在口中缓慢含化。服用后可能产生困倦，不建议驾驶或操作机器；请勿与酒精同用。中国上市版本以最终标签和说明为准。</p>
          </details>
          <details id="gastro-info">
            <summary>Whole Gastro 怎么使用？<span>＋</span></summary>
            <p>海外公开资料建议成年人餐后含化，具体次数与最大用量因版本不同而有差异。中国上市前将根据产品分类与监管要求确认最终用法用量。</p>
          </details>
          <details>
            <summary>儿童、孕期或哺乳期能使用吗？<span>＋</span></summary>
            <p>不建议自行使用。褪黑素海外版本明确不适用于未成年人、孕妇及哺乳期人群；有基础疾病、正在用药或对成分敏感者，应先咨询医生或药师。</p>
          </details>
          <details>
            <summary>这是药品吗？<span>＋</span></summary>
            <p>海外版本以食品补充剂形式销售。中国市场的产品属性、准入路径与可用宣称尚待最终确认；网站不提供诊断或治疗建议，持续或严重不适请及时就医。</p>
          </details>
        </div>
      </section>

      <section className="compliance-section" id="compliance">
        <div className="compliance-mark">!</div>
        <div>
          <strong>中国市场信息说明</strong>
          <p>本网站当前为品牌与产品筹备展示页，包装、规格、配方、价格、购买渠道及使用说明均可能在上市前调整。涉及“睡眠”“反酸”“烧心”等内容仅用于介绍海外公开产品定位，不构成疾病治疗、预防或医疗建议。</p>
        </div>
      </section>

      <footer>
        <div className="footer-top">
          <div>
            <a className="brand footer-brand" href="#top"><span className="brand-whole">wh<span>o</span>le</span><span className="brand-divider" /><span className="brand-china">中国</span></a>
            <h2>好吃，是开始。<br />更好的日常，是答案。</h2>
          </div>
          <div className="footer-links">
            <div><strong>探索</strong><a href="#products">主推产品</a><a href="#collections">全线产品</a><a href="#shop">在线选购</a></div>
            <div><strong>品牌</strong><a href="#story">品牌故事</a><a href="#quality">品质标准</a><a href="https://www.vitamincandy.com" target="_blank" rel="noreferrer">全球官网</a></div>
            <div><strong>联系</strong><a href="mailto:info@vitamincandy.com">info@vitamincandy.com</a><span>中国合作与经销咨询</span></div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Whole China. 产品筹备展示页。</span>
          <span>Packom International · Belgrade, Serbia</span>
        </div>
      </footer>

      <div className={`drawer-backdrop ${cartOpen ? "visible" : ""}`} onClick={() => setCartOpen(false)} />
      <aside className={`cart-drawer ${cartOpen ? "open" : ""}`} aria-hidden={!cartOpen} aria-label="选购袋">
        <div className="drawer-header"><div><span>YOUR SELECTION</span><h2>选购袋</h2></div><button onClick={() => setCartOpen(false)} aria-label="关闭选购袋">×</button></div>
        <div className="drawer-body">
          {selectedProducts.length === 0 ? (
            <div className="empty-cart"><span>○</span><h3>选购袋还是空的</h3><p>挑选你感兴趣的产品，我们会在中国首发时通知你。</p><button onClick={() => setCartOpen(false)}>继续探索</button></div>
          ) : (
            selectedProducts.map((product) => (
              <div className="cart-item" key={product.id}>
                <img src={product.image} alt="" />
                <div><strong>{product.name}</strong><span>{product.subtitle}</span><div className="quantity"><button onClick={() => updateQuantity(product.id, -1)} aria-label="减少数量">−</button><b>{cart[product.id]}</b><button onClick={() => updateQuantity(product.id, 1)} aria-label="增加数量">＋</button></div></div>
              </div>
            ))
          )}
        </div>
        {selectedProducts.length > 0 && <div className="drawer-footer"><p><span>价格</span><strong>中国首发前公布</strong></p><button className="primary-button light full" onClick={openInquiry}>登记购买意向 <Arrow /></button><small>登记不产生付款或购买义务。</small></div>}
      </aside>

      <div className={`modal-backdrop ${inquiryOpen ? "visible" : ""}`}>
        <div className="inquiry-modal" role="dialog" aria-modal="true" aria-labelledby="inquiry-title">
          <button className="close-button modal-close" onClick={() => setInquiryOpen(false)} aria-label="关闭登记窗口">×</button>
          {!submitted ? (
            <>
              <span className="modal-kicker">FIRST RELEASE · CHINA</span>
              <h2 id="inquiry-title">登记首发购买意向</h2>
              <p>提交后将打开你的邮件客户端，由你确认发送。我们不会在当前网页保存个人信息。</p>
              <form onSubmit={submitInquiry}>
                <label>姓名<input name="name" required autoComplete="name" placeholder="如何称呼你" /></label>
                <label>手机<input name="phone" required inputMode="tel" autoComplete="tel" placeholder="用于首发联系" /></label>
                <label>所在城市<input name="city" required autoComplete="address-level2" placeholder="例如：上海" /></label>
                <label>备注<textarea name="message" rows={3} placeholder="数量、合作或其他需求（选填）" /></label>
                <button className="primary-button dark-button full" type="submit">生成购买意向邮件 <Arrow /></button>
              </form>
            </>
          ) : (
            <div className="submitted-state"><span>✓</span><h2>邮件已经为你准备好</h2><p>请在系统邮件客户端中确认并发送。我们会根据中国市场进度与你联系。</p><button onClick={() => setInquiryOpen(false)}>完成</button></div>
          )}
        </div>
      </div>
    </main>
  );
}
