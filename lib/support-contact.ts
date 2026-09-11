// Public contact information only. NEXT_PUBLIC_ values are included in browser bundles.
const defaultSupportEmail = "liyu321@gmail.com";
const configuredSupportEmail = process.env.NEXT_PUBLIC_DESTINY_SUPPORT_EMAIL?.trim();

// Accept one plain mailbox, never display names, URL parameters or injected headers.
export const destinySupportEmail = configuredSupportEmail
  && configuredSupportEmail.length <= 254
  && /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(configuredSupportEmail)
  ? configuredSupportEmail
  : defaultSupportEmail;
export const destinySupportHref = `mailto:${destinySupportEmail}`;

// Public support channel requested by the site owner. A phone-number Telegram
// link works only when the account's privacy settings allow phone discovery.
export const destinyTelegramHref = "https://t.me/+19402374906";
