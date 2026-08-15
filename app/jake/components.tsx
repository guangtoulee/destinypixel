import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import {
  ArrowRight,
  Check,
  Download,
  ExternalLink,
  Globe2,
  Leaf,
  Mail,
  Menu,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import type { Product } from "./data";
import { categories } from "./data";

const navigation = [
  ["产品系列", "/jake/products"],
  ["品牌故事", "/jake/about"],
  ["常见问题", "/jake/faq"],
  ["联系我们", "/jake/contact"],
] as const;

export function SiteHeader() {
  return (
    <>
      <div className="jake-notice">
        <div className="jake-container jake-notice__inner">
          <span>源自塞尔维亚 · 中文品牌与产品信息站</span>
          <a href="https://www.vitamincandy.com" target="_blank" rel="noreferrer">
            全球官网 <ExternalLink aria-hidden="true" size={13} />
          </a>
        </div>
      </div>
      <header className="jake-header">
        <div className="jake-container jake-header__inner">
          <Link className="jake-logo" href="/jake" aria-label="Jake Vitamincandy 中文官网首页">
            <Image src="/jake/jake-logo.png" alt="Jake Vitamincandy" width={640} height={118} priority />
            <span>中文</span>
          </Link>
          <nav className="jake-nav" aria-label="主导航">
            {navigation.map(([label, href]) => (
              <Link href={href} key={href}>
                {label}
              </Link>
            ))}
          </nav>
          <div className="jake-header__actions">
            <a className="jake-header__download" href="/jake/jake-vitamincandy-cn-catalog.pdf" download>
              <Download aria-hidden="true" size={15} />
              下载中文目录
            </a>
            <details className="jake-mobile-menu">
              <summary aria-label="打开导航菜单">
                <Menu aria-hidden="true" size={22} />
              </summary>
              <div className="jake-mobile-menu__panel">
                {navigation.map(([label, href]) => (
                  <Link href={href} key={href}>
                    {label}
                    <ArrowRight aria-hidden="true" size={15} />
                  </Link>
                ))}
                <a href="/jake/jake-vitamincandy-cn-catalog.pdf" download>
                  下载中文目录
                  <Download aria-hidden="true" size={15} />
                </a>
              </div>
            </details>
          </div>
        </div>
      </header>
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="jake-footer">
      <div className="jake-container">
        <div className="jake-footer__cta">
          <div>
            <span className="jake-kicker jake-kicker--light">CHINA · DISTRIBUTION · PRIVATE LABEL</span>
            <h2>把更好的糖果选择，带到中国。</h2>
          </div>
          <Link className="jake-button jake-button--light" href="/jake/contact">
            商务合作咨询 <ArrowRight aria-hidden="true" size={17} />
          </Link>
        </div>
        <div className="jake-footer__grid">
          <div className="jake-footer__brand">
            <Image src="/jake/jake-logo.png" alt="Jake Vitamincandy" width={640} height={118} />
            <p>无糖维生素糖果、清新薄荷糖与 Infinity 长效薄荷糖。</p>
          </div>
          <div>
            <h3>浏览</h3>
            {navigation.map(([label, href]) => (
              <Link href={href} key={href}>{label}</Link>
            ))}
          </div>
          <div>
            <h3>产品</h3>
            {categories.map((category) => (
              <Link href={`/jake/products#${category.id}`} key={category.id}>{category.name}</Link>
            ))}
          </div>
          <div>
            <h3>联系</h3>
            <a href="mailto:info@vitamincandy.com"><Mail aria-hidden="true" size={14} /> info@vitamincandy.com</a>
            <a href="https://www.vitamincandy.com" target="_blank" rel="noreferrer"><Globe2 aria-hidden="true" size={14} /> 全球官网</a>
          </div>
        </div>
        <div className="jake-footer__bottom">
          <p>本中文站用于品牌与产品介绍。进口、配料、标签、营养声称及销售规格以中国正式上市版本为准。</p>
          <p>© {new Date().getFullYear()} Packom International · Chinese edition</p>
        </div>
      </div>
    </footer>
  );
}

export function SectionHeader({
  kicker,
  title,
  copy,
  align = "left",
}: {
  kicker: string;
  title: string;
  copy?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={`jake-section-header jake-section-header--${align}`}>
      <span className="jake-kicker">{kicker}</span>
      <h2>{title}</h2>
      {copy ? <p>{copy}</p> : null}
    </div>
  );
}

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  return (
    <article className="jake-product-card" style={{ "--product-accent": product.accent } as CSSProperties}>
      <Link className="jake-product-card__image" href={`/jake/products/${product.slug}`}>
        <Image
          src={product.image}
          alt={`${product.name} Jake ${product.englishName} 产品包装`}
          width={1212}
          height={1212}
          priority={priority}
          sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw"
        />
        <span>{product.eyebrow}</span>
      </Link>
      <div className="jake-product-card__body">
        <p>{product.englishName}</p>
        <h3>{product.name}</h3>
        <div className="jake-product-card__copy">{product.short}</div>
        <Link href={`/jake/products/${product.slug}`}>
          查看产品 <ArrowRight aria-hidden="true" size={16} />
        </Link>
      </div>
    </article>
  );
}

export function TrustStrip() {
  const items = [
    [<Leaf key="leaf" />, "无糖", "全线产品"],
    [<Sparkles key="sparkles" />, "每颗约 3 千卡", "官网产品表述"],
    [<ShieldCheck key="shield" />, "GMP · HACCP · IFS", "质量体系"],
    [<Globe2 key="globe" />, "40+", "出口市场"],
  ];
  return (
    <div className="jake-trust-strip">
      {items.map(([icon, value, label]) => (
        <div key={String(value)}>
          <span>{icon}</span>
          <strong>{value}</strong>
          <small>{label}</small>
        </div>
      ))}
    </div>
  );
}

export function FeatureList({ items }: { items: string[] }) {
  return (
    <ul className="jake-feature-list">
      {items.map((item) => (
        <li key={item}><Check aria-hidden="true" size={15} />{item}</li>
      ))}
    </ul>
  );
}
