import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Factory, PackageCheck, ShieldCheck, Sparkles } from "lucide-react";

import { SectionHeader } from "../components";

export const metadata: Metadata = {
  title: "品牌故事与制造标准",
  description: "了解塞尔维亚家族企业 Packom International、Jake Vitamincandy 的制造工艺、包装设计、产能与全球质量标准。",
  alternates: { canonical: "https://www.destinypixel.com/jake/about" },
};

export default function AboutPage() {
  return (
    <main>
      <section className="jake-page-hero jake-page-hero--about">
        <div className="jake-container jake-about-hero__grid">
          <div>
            <span className="jake-kicker">FROM OUR FAMILY TO THE WORLD</span>
            <h1>一颗糖的想法，<br /><span>走向 40 多个市场。</span></h1>
            <p>
              Packom International 是一家位于塞尔维亚的家族企业。自 2002 年起，团队持续探索如何让糖果同时具备愉悦风味、便携体验与更清晰的功能价值。
            </p>
          </div>
          <div className="jake-about-hero__visual">
            <Image src="/jake/products/coconut-blueberry.jpg" alt="Jake 椰香蓝莓维生素糖果包装" width={1212} height={1212} priority />
            <div><strong>20+</strong><span>年产品与制造经验</span></div>
          </div>
        </div>
      </section>

      <section className="jake-section jake-about-story">
        <div className="jake-container jake-about-story__grid">
          <div className="jake-about-story__copy">
            <SectionHeader kicker="THE PACKOM STORY" title="健康、好吃、好玩，也实用。" />
            <p>
              这是品牌最初的四个关键词。Jake 产品由同一家族企业生产和包装，创始团队持续参与经营，并在欧洲设有生产基地。
            </p>
            <p>
              今天，Packom 不仅经营 Jake Vitamincandy 与 Whole Supplements 自有品牌，也为客户提供成熟配方、定制产品和自有品牌合作。品牌官网显示，其产品已进入 40 多个市场。
            </p>
            <div className="jake-story-timeline">
              <div><strong>2002</strong><span>家族事业启程</span></div>
              <div><strong>40+</strong><span>全球出口市场</span></div>
              <div><strong>50+</strong><span>糖果与含片配方</span></div>
            </div>
          </div>
          <div className="jake-about-story__image">
            <Image src="/jake/products/mango.jpg" alt="Jake 芒果多种维生素糖果" fill sizes="(max-width: 850px) 100vw, 45vw" />
            <span>MADE IN BELGRADE, SERBIA</span>
          </div>
        </div>
      </section>

      <section className="jake-section jake-about-process">
        <div className="jake-container">
          <SectionHeader
            kicker="PROCESS & STANDARDS"
            title="把稳定、质量和便携性写进产品结构。"
            copy="原料、工艺、独特三角形糖片与泡罩包装相互配合，形成 Jake 清晰的产品识别。"
            align="center"
          />
          <div className="jake-about-process__grid">
            {[
              [<Sparkles key="quality" />, "质量与先进技术", "使用符合品牌标准的原料、设备与专用技术。干法混合工艺避免使用湿性原料，帮助维持成分稳定。"],
              [<PackageCheck key="pack" />, "设计与包装", "独特三角形糖片，每板 15 粒。Fresh and Protect 密封方式帮助保持产品稳定与新鲜。"],
              [<Factory key="factory" />, "产能与合作", "贝尔格莱德现代化工厂的泡罩板日产能力可达 250,000 板，并支持品牌和定制产品合作。"],
              [<ShieldCheck key="standards" />, "全球标准", "品牌公开信息显示工厂符合 GMP、HACCP 与 IFS 相关要求，产品保质期可达 24 个月。"],
            ].map(([icon, title, copy]) => (
              <article key={String(title)}>
                <div>{icon}</div>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="jake-section jake-packaging-story">
        <div className="jake-container jake-packaging-story__grid">
          <div className="jake-packaging-story__visual">
            <Image src="/jake/products/green-tea-lime.jpg" alt="绿茶青柠 Jake 维生素糖果泡罩包装" fill sizes="(max-width: 850px) 100vw, 50vw" />
          </div>
          <div>
            <span className="jake-kicker">INNOVATIVE PACKAGING</span>
            <h2>三角形，不只是为了好看。</h2>
            <p>
              独特糖片形状旨在优化含化体验；15 粒泡罩包装兼顾分次使用、卫生与随身携带。品牌还提供金属、塑料和瓦楞纸等多种零售陈列方案。
            </p>
            <ul>
              <li>独特三角形糖片</li>
              <li>每板 15 粒独立泡罩</li>
              <li>Fresh and Protect 密封</li>
              <li>可重复使用的终端陈列物料</li>
            </ul>
            <Link className="jake-button jake-button--dark" href="/jake/products">
              查看全部产品 <ArrowRight aria-hidden="true" size={17} />
            </Link>
          </div>
        </div>
      </section>

      <section className="jake-source-note">
        <div className="jake-container">
          <strong>资料口径说明</strong>
          <p>
            当前品牌官网将企业历程表述为始于 2002 年；随附旧版英文目录中记载为 2006 年。本中文网站采用当前官网信息，中文目录保留原 PDF 内容并作注释。
          </p>
        </div>
      </section>
    </main>
  );
}
