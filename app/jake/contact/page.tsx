import type { Metadata } from "next";
import { ExternalLink, Mail, MapPin, Phone } from "lucide-react";

import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "联系我们",
  description: "联系 Packom International，咨询 Jake Vitamincandy 产品、批发、经销、自有品牌与中国市场合作。",
  alternates: { canonical: "https://www.destinypixel.com/jake/contact" },
};

export default function ContactPage() {
  return (
    <main>
      <section className="jake-page-hero jake-page-hero--simple jake-page-hero--contact">
        <div className="jake-container">
          <span className="jake-kicker">LET&apos;S TALK</span>
          <h1>从一封邮件开始，<br /><span>把合作谈清楚。</span></h1>
          <p>产品规格、经销、进口、生产合作或自有品牌需求，都可以直接联系 Packom International 团队。</p>
        </div>
      </section>

      <section className="jake-section jake-contact">
        <div className="jake-container jake-contact__grid">
          <div className="jake-contact__details">
            <span className="jake-kicker">CONTACT DETAILS</span>
            <h2>塞尔维亚贝尔格莱德</h2>
            <p>品牌官网公开联系方式如下。中国项目具体商务联系人可在合作推进后另行确认。</p>
            <div className="jake-contact-card-list">
              <a href="tel:+381114242703">
                <span><Phone aria-hidden="true" /></span>
                <div><small>电话</small><strong>+381 11 4242703</strong></div>
              </a>
              <a href="mailto:info@vitamincandy.com">
                <span><Mail aria-hidden="true" /></span>
                <div><small>邮箱</small><strong>info@vitamincandy.com</strong></div>
              </a>
              <a href="https://maps.app.goo.gl/CBMF4ervEDNa2MbJ7" target="_blank" rel="noreferrer">
                <span><MapPin aria-hidden="true" /></span>
                <div><small>地址</small><strong>Marshal Tito Street 1v, Leštane, 11309 Serbia</strong></div>
                <ExternalLink aria-hidden="true" size={16} />
              </a>
            </div>
            <div className="jake-contact__hours">
              <strong>建议在邮件中提供</strong>
              <ul>
                <li>公司名称、市场与销售渠道</li>
                <li>感兴趣的产品与预计采购量</li>
                <li>进口、经销或自有品牌合作方向</li>
                <li>期望上市时间与所需资料</li>
              </ul>
            </div>
          </div>
          <div className="jake-contact__form-wrap">
            <span className="jake-kicker">SEND A MESSAGE</span>
            <h2>填写合作需求</h2>
            <p>信息会整理成一封发往品牌官方邮箱的邮件。</p>
            <ContactForm />
          </div>
        </div>
      </section>
    </main>
  );
}
