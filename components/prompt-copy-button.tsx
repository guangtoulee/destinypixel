"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export default function PromptCopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button onClick={() => void copy()} type="button">
      {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
      {copied ? "已复制完整 Prompt" : "复制完整 Prompt"}
    </button>
  );
}
