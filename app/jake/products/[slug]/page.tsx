import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowLeft, ArrowRight, Download, Info, Mail, PackageCheck } from "lucide-react";
import { notFound } from "next/navigation";

import { FeatureList, ProductCard, SectionHeader } from "../../components";
import { getCategory, getProduct, getProductsByCategory, products } from "../../data";

type ProductPageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  const url = `https://www.destinypixel.com/jake/products/${product.slug}`;
  return {
    title: `${product.name} ${product.englishName}`,
    description: `${product.short} 查看营养信息、配料、产品特点与保存提示。`,
    alternates: { canonical: url },
    openGraph: {
      title: `${product.name}｜Jake Vitamincandy 中文官网`,
      description: product.short,
      url,
      type: "website",
      images: [{ url: product.image, width: 1212, height: 1212, alt: `${product.name}产品包装` }],
    },
    twitter: { card: "summary_large_image", title: product.name, description: product.short, images: [product.image] },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();
  const category = getCategory(product.category);
  const related = getProductsByCategory(product.category)
    .filter((item) => item.slug !== product.slug)
    .slice(0, 3);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${product.name} ${product.englishName}`,
    image: `https://www.destinypixel.com${product.image}`,
    description: product.description,
    brand: { "@type": "Brand", name: "Jake Vitamincandy" },
    manufacturer: { "@type": "Organization", name: "Packom International" },
    category: category?.name,
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <section className="jake-product-hero" style={{ "--detail-accent": product.accent } as CSSProperties}>
        <div className="jake-container">
          <div className="jake-breadcrumb">
            <Link href="/jake/products"><ArrowLeft aria-hidden="true" size={15} /> 全部产品</Link>
            <span>/</span>
            <Link href={`/jake/products#${product.category}`}>{category?.name}</Link>
          </div>
          <div className="jake-product-hero__grid">
            <div className="jake-product-hero__image">
              <Image
                src={product.image}
                alt={`${product.name} ${product.englishName} 产品包装`}
                width={1212}
                height={1212}
                priority
                sizes="(max-width: 800px) 100vw, 50vw"
              />
              <span>包装图为品牌当前官网版本</span>
            </div>
            <div className="jake-product-hero__copy">
              <span className="jake-kicker">{product.eyebrow}</span>
              <p className="jake-product-hero__english">{product.englishName}</p>
              <h1>{product.name}</h1>
              <p className="jake-product-hero__lead">{product.description}</p>
              <FeatureList items={product.highlights} />
              <div className="jake-product-hero__actions">
                <Link className="jake-button jake-button--primary" href="/jake/contact">
                  <Mail aria-hidden="true" size={17} /> 商务与经销咨询
                </Link>
                <a className="jake-button jake-button--ghost" href="/jake/jake-vitamincandy-cn-catalog.pdf" download>
                  <Download aria-hidden="true" size={17} /> 下载目录
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="jake-section jake-product-information">
        <div className="jake-container jake-product-information__grid">
          <div>
            <SectionHeader kicker="NUTRITION FACTS" title="营养信息" copy={product.nutritionBasis} />
            <dl className="jake-nutrition-table">
              {product.nutrition.map(([label, value]) => (
                <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
              ))}
            </dl>
            <p className="jake-data-note">* 每日参考值来自原英文产品目录，仅用于翻译说明。</p>
          </div>
          <div className="jake-ingredient-card">
            <div className="jake-ingredient-card__icon"><PackageCheck aria-hidden="true" /></div>
            <span className="jake-kicker">INGREDIENTS</span>
            <h2>配料</h2>
            <p>{product.ingredients}</p>
            <div className="jake-safety-note">
              <Info aria-hidden="true" size={18} />
              <p>{product.safety}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="jake-section jake-related-products">
        <div className="jake-container">
          <div className="jake-heading-row">
            <SectionHeader kicker="MORE TO EXPLORE" title={`继续探索${category?.name ?? "本系列"}`} />
            <Link className="jake-text-link" href={`/jake/products#${product.category}`}>
              查看本系列全部产品 <ArrowRight aria-hidden="true" size={16} />
            </Link>
          </div>
          <div className="jake-product-grid jake-product-grid--three">
            {related.map((item) => <ProductCard product={item} key={item.slug} />)}
          </div>
        </div>
      </section>
    </main>
  );
}
