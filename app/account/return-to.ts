/** Only known account/report destinations may be used after authentication. */
export function safeAccountReturnTo(value: string | undefined, locale: "en" | "zh" = "en") {
  const fallback = locale === "zh" ? "/account?locale=zh" : "/account";
  if (!value || !value.startsWith("/") || value.startsWith("//") || /[\\\u0000-\u0020]/.test(value)) return fallback;
  try {
    const url = new URL(value, "https://destinypixel.invalid");
    if (url.origin !== "https://destinypixel.invalid") return fallback;
    if (url.pathname !== "/account" && !/^\/report\/[a-zA-Z0-9_-]{1,128}$/.test(url.pathname)) return fallback;
    const language = url.searchParams.get("locale");
    const query = language && ["en", "zh", "zh-TW", "ru"].includes(language) ? `?locale=${language}` : "";
    return `${url.pathname}${query}`;
  } catch {
    return fallback;
  }
}
