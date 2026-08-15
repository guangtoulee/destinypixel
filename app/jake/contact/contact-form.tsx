"use client";

import type { FormEvent } from "react";
import { Send } from "lucide-react";

export function ContactForm() {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const subject = encodeURIComponent(`Jake 中国市场合作咨询 - ${String(data.get("company") || data.get("name") || "新咨询")}`);
    const body = encodeURIComponent(
      [
        `姓名：${String(data.get("name") || "")}`,
        `邮箱：${String(data.get("email") || "")}`,
        `公司：${String(data.get("company") || "")}`,
        `目标市场：${String(data.get("market") || "")}`,
        "",
        "咨询内容：",
        String(data.get("message") || ""),
      ].join("\n"),
    );
    window.location.href = `mailto:info@vitamincandy.com?subject=${subject}&body=${body}`;
  }

  return (
    <form className="jake-contact-form" onSubmit={submit}>
      <div className="jake-form-grid">
        <label>
          <span>姓名 *</span>
          <input name="name" required autoComplete="name" placeholder="如何称呼你" />
        </label>
        <label>
          <span>工作邮箱 *</span>
          <input name="email" type="email" required autoComplete="email" placeholder="name@company.com" />
        </label>
        <label>
          <span>公司 / 机构</span>
          <input name="company" autoComplete="organization" placeholder="公司名称" />
        </label>
        <label>
          <span>目标市场</span>
          <input name="market" placeholder="例如：中国华东 / 东南亚" />
        </label>
      </div>
      <label>
        <span>咨询内容 *</span>
        <textarea name="message" required rows={6} placeholder="请介绍渠道、产品兴趣、预计采购量或合作需求" />
      </label>
      <button className="jake-button jake-button--primary" type="submit">
        生成咨询邮件 <Send aria-hidden="true" size={17} />
      </button>
      <p>提交后会打开你的系统邮件客户端，由你确认发送；本网页不会保存表单内容。</p>
    </form>
  );
}
