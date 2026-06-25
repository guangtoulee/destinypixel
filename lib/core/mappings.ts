export const heavenlyStemPlanetMap = {
  甲: "Jupiter",
  乙: "Moon",
  丙: "Sun",
  丁: "Mars",
  戊: "Saturn",
  己: "Venus",
  庚: "Uranus",
  辛: "Mercury",
  壬: "Neptune",
  癸: "Pluto",
} as const;

export const heavenlyStemPlanetMapCn = {
  甲: "木星",
  乙: "月亮",
  丙: "太阳",
  丁: "火星",
  戊: "土星",
  己: "金星",
  庚: "天王星",
  辛: "水星",
  壬: "海王星",
  癸: "冥王星",
} as const;

export const stemElements = {
  甲: "Wood",
  乙: "Wood",
  丙: "Fire",
  丁: "Fire",
  戊: "Earth",
  己: "Earth",
  庚: "Metal",
  辛: "Metal",
  壬: "Water",
  癸: "Water",
} as const;

export const stemPolarity = {
  甲: "Yang",
  乙: "Yin",
  丙: "Yang",
  丁: "Yin",
  戊: "Yang",
  己: "Yin",
  庚: "Yang",
  辛: "Yin",
  壬: "Yang",
  癸: "Yin",
} as const;

export const branchElements = {
  子: "Water",
  丑: "Earth",
  寅: "Wood",
  卯: "Wood",
  辰: "Earth",
  巳: "Fire",
  午: "Fire",
  未: "Earth",
  申: "Metal",
  酉: "Metal",
  戌: "Earth",
  亥: "Water",
} as const;

export const branchHiddenStems = {
  子: ["癸"],
  丑: ["己", "癸", "辛"],
  寅: ["甲", "丙", "戊"],
  卯: ["乙"],
  辰: ["戊", "乙", "癸"],
  巳: ["丙", "戊", "庚"],
  午: ["丁", "己"],
  未: ["己", "丁", "乙"],
  申: ["庚", "壬", "戊"],
  酉: ["辛"],
  戌: ["戊", "辛", "丁"],
  亥: ["壬", "甲"],
} as const;

export const elementLabelsCn = {
  Wood: "木",
  Fire: "火",
  Earth: "土",
  Metal: "金",
  Water: "水",
} as const;

export type HeavenlyStem = keyof typeof heavenlyStemPlanetMap;
export type ElementName = keyof typeof elementLabelsCn;
export type EarthlyBranch = keyof typeof branchElements;
export type StemPolarity = (typeof stemPolarity)[HeavenlyStem];
