export const stemSlugs: Record<string, string> = {
  甲: "jia",
  乙: "yi",
  丙: "bing",
  丁: "ding",
  戊: "wu",
  己: "ji",
  庚: "geng",
  辛: "xin",
  壬: "ren",
  癸: "gui",
};

export const branchSlugs: Record<string, string> = {
  子: "zi",
  丑: "chou",
  寅: "yin",
  卯: "mao",
  辰: "chen",
  巳: "si",
  午: "wu",
  未: "wei",
  申: "shen",
  酉: "you",
  戌: "xu",
  亥: "hai",
};

export function getPillarImagePath(pillar: string) {
  return `/archetype-cards/${stemSlugs[pillar[0]]}_${branchSlugs[pillar[1]]}.jpg`;
}
