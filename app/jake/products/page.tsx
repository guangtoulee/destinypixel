import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";

import { ProductCard, SectionHeader } from "../components";
import { categories, getProductsByCategory } from "../data";

export const metadata: Metadata = {
  title: "全部产品",
  description: "浏览 Jake Vitamincandy、Jake Mints 与 Jake Infinity 当前官网在售的 16 款无糖糖果与薄荷糖。",
  alternates: { canonical: "https://www.destinypixel.com/jake/products" },
};

export default function ProductsPage() {
  return (
    <main>
      <section className="jake-page-hero jake-page-hero--products">
        <div className="jake-container">
          <span className="jake-kicker">ALL PRODUCTS · 16 ITEMS</span>
          <h1>三大系列，<br /><span>十六种清新选择。</span></h1>
          <p>按当前品牌官网在售产品整理。点击任一产品，可查看中文风味说明、营养信息、配料和保存提示。</p>
          <div className="jake-anchor-nav" aria-label="产品系列快捷导航">
            {categories.map((category) => (
              <Link href={`#${category.id}`} key={category.id}>
                {category.name} <ArrowDown aria-hidden="true" size={14} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {categories.map((category, categoryIndex) => {
        const items = getProductsByCategory(category.id);
        return (
          <section
            className={`jake-section jake-collection jake-collection--${category.id}`}
            id={category.id}
            key={category.id}
          >
            <div className="jake-container">
              <div className="jake-collection__heading">
                <SectionHeader
                  kicker={`${category.englishName} · ${items.length} PRODUCTS`}
                  title={category.headline}
                  copy={category.description}
                />
                <div className="jake-collection__index">0{categoryIndex + 1}</div>
              </div>
              <div className="jake-product-grid">
                {items.map((product, index) => (
                  <ProductCard product={product} key={product.slug} priority={categoryIndex === 0 && index < 3} />
                ))}
              </div>
            </div>
          </section>
        );
      })}

      <section className="jake-mini-cta">
        <div className="jake-container jake-mini-cta__inner">
          <div>
            <span className="jake-kicker jake-kicker--light">WHOLESALE & DISTRIBUTION</span>
            <h2>需要规格、报价或经销资料？</h2>
          </div>
          <Link className="jake-button jake-button--light" href="/jake/contact">
            联系我们 <ArrowRight aria-hidden="true" size={17} />
          </Link>
        </div>
      </section>
    </main>
  );
}
