import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Download,
  Factory,
  FlaskConical,
  PackageCheck,
  ShieldCheck,
} from "lucide-react";

import { ProductCard, SectionHeader, TrustStrip } from "./components";
import { categories, getProductsByCategory, popularProducts } from "./data";

export const metadata: Metadata = {
  alternates: { canonical: "https://www.destinypixel.com/jake" },
};

const categoryImages = {
  vitamincandy: "/jake/products/strawberry.jpg",
  mints: "/jake/products/peppermint.jpg",
  infinity: "/jake/products/inifinity-spearmint.jpg",
};

export default function JakeHomePage() {
  return (
    <main>
      <section className="jake-hero">
        <Image
          className="jake-hero__background"
          src="/jake/social-bg.png"
          alt="水果、薄荷叶与三角形糖片组成的清新画面"
          fill
          priority
          sizes="100vw"
        />
        <div className="jake-hero__shade" />
        <div className="jake-container jake-hero__inner">
          <div className="jake-hero__copy">
            <span className="jake-kicker">SUGAR FREE · VITAMIN INFUSED · MADE IN EUROPE</span>
            <h1>把维生素与清新，<br />做成一颗<span>好吃的糖。</span></h1>
            <p>
              来自塞尔维亚家族企业 Packom International。无糖果味糖、清新薄荷糖与长效系列，
              让功能、风味和便携包装在一颗糖里相遇。
            </p>
            <div className="jake-hero__actions">
              <Link className="jake-button jake-button--primary" href="/jake/products">
                探索全部 16 款产品 <ArrowRight aria-hidden="true" size={18} />
              </Link>
              <a className="jake-button jake-button--ghost" href="/jake/jake-vitamincandy-cn-catalog.pdf" download>
                <Download aria-hidden="true" size={17} /> 下载中文目录
              </a>
            </div>
            <div className="jake-hero__microcopy">
              <CheckCircle2 aria-hidden="true" size={15} />
              产品资料依据品牌官网与随附英文产品目录翻译整理
            </div>
          </div>
          <div className="jake-hero__products" aria-label="代表产品包装">
            <div className="jake-hero-product jake-hero-product--one">
              <Image src="/jake/products/strawberry.jpg" alt="草莓味 Jake 维生素糖果" width={1212} height={1212} priority />
            </div>
            <div className="jake-hero-product jake-hero-product--two">
              <Image src="/jake/products/green-tea-lime.jpg" alt="绿茶青柠味 Jake 维生素糖果" width={1212} height={1212} priority />
            </div>
            <div className="jake-hero-product jake-hero-product--three">
              <Image src="/jake/products/peppermint.jpg" alt="胡椒薄荷味 Jake Mints" width={1212} height={1212} priority />
            </div>
          </div>
        </div>
      </section>

      <div className="jake-container jake-trust-wrap">
        <TrustStrip />
      </div>

      <section className="jake-section jake-section--categories">
        <div className="jake-container">
          <SectionHeader
            kicker="THREE COLLECTIONS"
            title="不止一种清新，也不止一种好味道。"
            copy="从果味维生素糖果到经典薄荷，再到更持久的 Infinity 系列，覆盖不同口味和随身场景。"
          />
          <div className="jake-category-grid">
            {categories.map((category, index) => (
              <Link
                href={`/jake/products#${category.id}`}
                className="jake-category-card"
                key={category.id}
                style={{ "--category-accent": category.accent } as CSSProperties}
              >
                <div className="jake-category-card__image">
                  <Image
                    src={categoryImages[category.id]}
                    alt={`${category.name}代表产品`}
                    width={1212}
                    height={1212}
                    sizes="(max-width: 800px) 100vw, 33vw"
                  />
                  <span>0{index + 1}</span>
                </div>
                <div className="jake-category-card__body">
                  <small>{category.englishName}</small>
                  <h3>{category.name}</h3>
                  <p>{category.description}</p>
                  <strong>{getProductsByCategory(category.id).length} 款产品 <ArrowRight aria-hidden="true" size={16} /></strong>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="jake-section jake-section--products">
        <div className="jake-container">
          <div className="jake-heading-row">
            <SectionHeader
              kicker="POPULAR PRODUCTS"
              title="从这四款开始认识 Jake。"
              copy="鲜明果味、茶香层次与经典薄荷，构成品牌最直观的风味入口。"
            />
            <Link className="jake-text-link" href="/jake/products">
              浏览全部产品 <ArrowRight aria-hidden="true" size={16} />
            </Link>
          </div>
          <div className="jake-product-grid jake-product-grid--four">
            {popularProducts.map((product, index) => (
              <ProductCard product={product} key={product.slug} priority={index < 2} />
            ))}
          </div>
        </div>
      </section>

      <section className="jake-section jake-story-preview">
        <div className="jake-container jake-story-preview__grid">
          <div className="jake-story-preview__visual">
            <div className="jake-story-preview__image jake-story-preview__image--large">
              <Image src="/jake/products/mango.jpg" alt="Jake 芒果味多种维生素糖果包装" fill sizes="(max-width: 850px) 100vw, 50vw" />
            </div>
            <div className="jake-story-preview__image jake-story-preview__image--small">
              <Image src="/jake/products/coconut-blueberry.jpg" alt="Jake 椰香蓝莓味多种维生素糖果包装" fill sizes="260px" />
            </div>
            <div className="jake-story-preview__stat"><strong>2002</strong><span>家族事业启程</span></div>
          </div>
          <div className="jake-story-preview__copy">
            <span className="jake-kicker">FROM OUR FAMILY TO THE WORLD</span>
            <h2>一个塞尔维亚家庭，二十余年的糖果新想法。</h2>
            <p>
              Packom 从一个清晰目标出发：让糖果不仅好吃，也更实用。今天，品牌在贝尔格莱德生产并出口至 40 多个市场，
              同时为自有品牌与客户定制产品提供配方和制造支持。
            </p>
            <div className="jake-story-preview__facts">
              <div><strong>40+</strong><span>出口市场</span></div>
              <div><strong>250,000</strong><span>泡罩板日产能力</span></div>
              <div><strong>24个月</strong><span>产品保质期</span></div>
            </div>
            <Link className="jake-button jake-button--dark" href="/jake/about">
              了解品牌与制造 <ArrowRight aria-hidden="true" size={17} />
            </Link>
          </div>
        </div>
      </section>

      <section className="jake-section jake-process">
        <div className="jake-container">
          <SectionHeader
            kicker="QUALITY BY DESIGN"
            title="从配方、设备到密封方式，每一步都为稳定而设计。"
            copy="品牌将食品制造经验与接近制药行业的设备、技术和质量思维结合，关注配方完整性、便携性与新鲜度。"
            align="center"
          />
          <div className="jake-process__grid">
            {[
              [<FlaskConical key="formula" />, "干法混合与配方", "不使用湿性原料，帮助维持关键成分的稳定性。"],
              [<Factory key="factory" />, "现代化生产", "贝尔格莱德生产基地执行 GMP、HACCP 与 IFS 相关标准。"],
              [<PackageCheck key="pack" />, "Fresh and Protect", "全封闭泡罩包装，便于携带并帮助保持产品新鲜。"],
              [<ShieldCheck key="quality" />, "批次质量管理", "从供应商选择到成品包装，建立可追溯的质量控制流程。"],
            ].map(([icon, title, body], index) => (
              <article key={String(title)}>
                <span className="jake-process__number">0{index + 1}</span>
                <div className="jake-process__icon">{icon}</div>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="jake-section jake-certificates">
        <div className="jake-container">
          <SectionHeader
            kicker="CERTIFICATES & STANDARDS"
            title="用可验证的标准，支撑每一次合作。"
            copy="以下标识来自品牌全球官网，具体证书范围与有效期以证书原件为准。"
          />
          <div className="jake-certificate-grid">
            {[
              ["gmp", "GMP", "良好生产规范"],
              ["ifs-food", "IFS Food", "国际食品安全与质量标准"],
              ["gs1", "GS1", "全球识别与追溯标准"],
              ["halal", "Halal", "清真认证"],
              ["kosher", "Kosher", "犹太洁食认证"],
            ].map(([file, title, copy]) => (
              <div key={title}>
                <Image src={`/jake/certificates/${file}.png`} alt={`${title} 认证标识`} width={160} height={90} />
                <strong>{title}</strong>
                <span>{copy}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
