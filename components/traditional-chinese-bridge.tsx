"use client";

import { useEffect } from "react";

type Converter = (text: string) => string;

const convertibleAttributes = ["aria-label", "placeholder", "title"] as const;

function convertNode(root: Node, converter: Converter) {
  const convertTextNode = (node: Node) => {
    if (node.nodeType !== Node.TEXT_NODE || !node.nodeValue) return;

    const parent = node.parentElement?.tagName;
    if (parent === "SCRIPT" || parent === "STYLE" || parent === "NOSCRIPT") return;

    const converted = converter(node.nodeValue);
    if (converted !== node.nodeValue) node.nodeValue = converted;
  };

  convertTextNode(root);

  if (root instanceof Element) {
    for (const attribute of convertibleAttributes) {
      const value = root.getAttribute(attribute);
      if (!value) continue;

      const converted = converter(value);
      if (converted !== value) root.setAttribute(attribute, converted);
    }
  }

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let current = walker.nextNode();
  while (current) {
    convertTextNode(current);
    current = walker.nextNode();
  }

  if (root instanceof Element) {
    for (const element of root.querySelectorAll("[aria-label], [placeholder], [title]")) {
      for (const attribute of convertibleAttributes) {
        const value = element.getAttribute(attribute);
        if (!value) continue;

        const converted = converter(value);
        if (converted !== value) element.setAttribute(attribute, converted);
      }
    }
  }
}

export function TraditionalChineseBridge() {
  useEffect(() => {
    let cancelled = false;
    let converter: Converter | null = null;
    let languageVersion = 0;

    const configure = async () => {
      const language = document.documentElement.lang;
      const version = ++languageVersion;

      if (language !== "zh-TW" && language !== "zh-CN") {
        converter = null;
        return;
      }

      const opencc =
        language === "zh-TW"
          ? await import("opencc-js/cn2t")
          : await import("opencc-js/t2cn");

      if (cancelled || version !== languageVersion) return;

      converter = opencc.default.Converter({
        from: language === "zh-TW" ? "cn" : "tw",
        to: language === "zh-TW" ? "tw" : "cn",
      });
      convertNode(document.body, converter);
    };

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "attributes" && mutation.target === document.documentElement) {
          void configure();
          continue;
        }

        if (!converter) continue;

        if (mutation.type === "characterData") {
          convertNode(mutation.target, converter);
        } else {
          for (const node of mutation.addedNodes) convertNode(node, converter);
        }
      }
    });

    observer.observe(document.documentElement, {
      attributeFilter: ["lang"],
      attributes: true,
      characterData: true,
      childList: true,
      subtree: true,
    });
    void configure();

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, []);

  return null;
}
