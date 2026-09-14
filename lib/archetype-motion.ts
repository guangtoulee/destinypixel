/** Only these five supplied artworks have a motion edition. */
export const archetypeMotion = [
  { pillar: "癸卯", slug: "gui_mao", name: {en:"Dew Rabbit",zh:"晨露玉兔",ru:"Кролик росы"}, landscape: false },
  { pillar: "癸丑", slug: "gui_chou", name: {en:"Still Lake Ox",zh:"星河灵牛",ru:"Бык тихого озера"}, landscape: false },
  { pillar: "戊申", slug: "wu_shen", name: {en:"Lava Ape",zh:"熔岩神猿",ru:"Лавовая обезьяна"}, landscape: false },
  { pillar: "庚戌", slug: "geng_xu", name: {en:"Fortress Dog",zh:"银甲战犬",ru:"Страж крепости"}, landscape: false },
  { pillar: "辛酉", slug: "xin_you", name: {en:"Blade Rooster",zh:"铸剑神凰",ru:"Стальной феникс"}, landscape: true },
] as const;
export function archetypeVideoPath(slug:string) { return `/archetypes/motion/${slug}.mp4`; }
export function archetypePosterPath(slug:string) { return `/archetypes/motion/${slug}-poster.jpg`; }
