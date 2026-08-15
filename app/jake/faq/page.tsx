import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "常见问题",
  description: "关于 Jake Vitamincandy 产品、无糖配方、维生素、规格、经销合作与零售陈列支持的常见问题。",
  alternates: { canonical: "https://www.destinypixel.com/jake/faq" },
};

const groups = [
  {
    title: "品牌与产品",
    questions: [
      ["Jake Vitamincandy 是什么？", "Jake Vitamincandy 是 Packom International 旗下无糖清新糖果品牌。不同产品按配方加入维生素 C、多种维生素或绿茶提取物，并以便携泡罩包装呈现。"],
      ["目前官网有多少款产品？", "当前官网在售产品共 16 款：10 款 Jake Vitamincandy、2 款 Jake Mints，以及 4 款 Jake Infinity。随附旧版目录还包含一款目前官网未列出的苹果味产品。"],
      ["所有产品都是无糖的吗？", "是。品牌官网将 Jake Vitamincandy、Jake Mints 与 Infinity 全系列均标示为无糖产品。"],
      ["糖片为什么是三角形？", "品牌将独特三角形设计与渐进含化体验结合，并以每板 15 粒的泡罩包装实现便携、分次使用和密封保存。"],
    ],
  },
  {
    title: "营养与配料",
    questions: [
      ["维生素糖果含哪些维生素？", "不同口味配方不同。维生素 C 系列主要含维生素 C；多种维生素系列含维生素 B1、B2、C 和 E；绿茶青柠款还含绿茶提取物。请以具体产品页和最终包装标签为准。"],
      ["一板维生素糖果有多重？", "Jake Vitamincandy 一板为 18g；Jake Mints 一板为 14.4g。Infinity 的官网营养信息按每 100g 标示。"],
      ["产品使用哪些甜味剂？", "维生素糖果主要使用山梨糖醇、甘露糖醇和麦芽糖醇；薄荷产品以山梨糖醇、甘露糖醇及甜味剂 E955 为主。不同口味配料有差异。"],
      ["为什么有“过量食用可能引起轻泻”的提示？", "含多元醇的无糖糖果在过量食用时可能产生轻泻作用，这是此类产品常见的标签提示。应按最终包装建议适量食用。"],
    ],
  },
  {
    title: "经销与合作",
    questions: [
      ["如何成为 Jake 的经销商？", "可通过联系页面向 Packom International 提交公司、市场、渠道和预计采购量等信息，品牌销售团队会进一步沟通合作条件。"],
      ["品牌是否提供零售陈列支持？", "是。公开资料显示，品牌可提供台面陈列盒、落地架、货架及展示架等多种终端物料，并强调可重复使用。"],
      ["最低订购量是多少？", "公开官网未给出统一最低订购量。具体 MOQ、贸易条款、交期和报价需要由销售团队根据产品与市场确认。"],
      ["中国是否已经正式销售？", "本网站目前用于中文品牌和产品资料展示。具体进口主体、中文标签、配方适用性、上市规格、价格及购买渠道应以中国项目正式公告为准。"],
    ],
  },
];

export default function FaqPage() {
  return (
    <main>
      <section className="jake-page-hero jake-page-hero--simple">
        <div className="jake-container">
          <span className="jake-kicker">FREQUENTLY ASKED QUESTIONS</span>
          <h1>关于产品与合作，<br /><span>先从这些答案开始。</span></h1>
          <p>内容依据品牌官网、联系页和随附产品目录整理；中国上市信息以最终法规审核和包装为准。</p>
        </div>
      </section>

      <section className="jake-section jake-faq-page">
        <div className="jake-container jake-faq-page__grid">
          <aside>
            <div className="jake-faq-page__icon"><HelpCircle aria-hidden="true" /></div>
            <h2>没有找到答案？</h2>
            <p>如果你需要产品规格、批发报价、经销或自有品牌合作资料，请直接联系品牌团队。</p>
            <Link className="jake-button jake-button--dark" href="/jake/contact">联系品牌团队 <ArrowRight aria-hidden="true" size={17} /></Link>
          </aside>
          <div className="jake-faq-groups">
            {groups.map((group) => (
              <section key={group.title}>
                <h2>{group.title}</h2>
                {group.questions.map(([question, answer], index) => (
                  <details key={question} open={index === 0}>
                    <summary>{question}<span>+</span></summary>
                    <p>{answer}</p>
                  </details>
                ))}
              </section>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
