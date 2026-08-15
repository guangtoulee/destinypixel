export type ProductCategory = "vitamincandy" | "mints" | "infinity";

export type Product = {
  slug: string;
  name: string;
  englishName: string;
  category: ProductCategory;
  image: string;
  accent: string;
  eyebrow: string;
  short: string;
  description: string;
  highlights: string[];
  nutritionBasis: string;
  nutrition: Array<[string, string]>;
  ingredients: string;
  safety: string;
};

export const categories: Array<{
  id: ProductCategory;
  name: string;
  englishName: string;
  headline: string;
  description: string;
  accent: string;
}> = [
  {
    id: "vitamincandy",
    name: "Jake 维生素糖果",
    englishName: "JAKE VITAMINCANDY®",
    headline: "果味清新，也有维生素加持",
    description:
      "无糖果味清新糖，覆盖维生素 C、多种维生素与绿茶提取物配方，共 10 款当前官网在售风味。",
    accent: "#e4434a",
  },
  {
    id: "mints",
    name: "Jake 清新薄荷糖",
    englishName: "JAKE MINTS®",
    headline: "经典薄荷，轻巧随行",
    description:
      "胡椒薄荷与留兰香两种无糖风味，使用便携泡罩包装，适合工作、通勤与旅行。",
    accent: "#1487c8",
  },
  {
    id: "infinity",
    name: "Jake Infinity 长效系列",
    englishName: "JAKE INFINITY®",
    headline: "更强烈、更持久的清新体验",
    description:
      "胡椒薄荷与留兰香均提供条装和独立纸包版本，为不同随身场景提供清晰选择。",
    accent: "#2da66a",
  },
];

const vitaminNutrition: Array<[string, string]> = [
  ["每份", "1 板（18g）"],
  ["能量", "45 千卡"],
  ["脂肪 / 钠", "0g / 0mg"],
  ["糖", "0g"],
  ["多元醇", "16g"],
  ["维生素 C", "每日参考值 50%*"],
];

const multiNutrition: Array<[string, string]> = [
  ...vitaminNutrition.slice(0, 5),
  ["维生素 C / E / B2 / B1", "各为每日参考值 50%*"],
];

const mintNutrition: Array<[string, string]> = [
  ["每份", "1 板（14.4g）"],
  ["能量", "36 千卡"],
  ["脂肪 / 钠", "0g / 0mg"],
  ["糖", "0g"],
  ["多元醇", "14.2g"],
  ["蛋白质", "0.023g"],
];

const infinityNutrition: Array<[string, string]> = [
  ["能量", "249 千卡 / 1038 kJ"],
  ["脂肪", "0.37g"],
  ["其中饱和脂肪", "0.24g"],
  ["碳水化合物", "98.5g"],
  ["糖 / 多元醇", "0g / 98.5g"],
  ["蛋白质 / 钠", "0.16g / <0.0025g"],
];

const commonVitaminIngredients =
  "甜味剂：山梨糖醇、甘露糖醇、麦芽糖醇；酸度调节剂：苹果酸、酒石酸、柠檬酸；抗坏血酸（维生素 C）、E470b、E955";

const safety =
  "过量食用含多元醇产品可能产生轻泻作用。请置于室温干燥处保存。中国上市版本以最终中文标签和说明为准。";

export const products: Product[] = [
  {
    slug: "mango",
    name: "芒果",
    englishName: "Mango",
    category: "vitamincandy",
    image: "/jake/products/mango.jpg",
    accent: "#f1952b",
    eyebrow: "多种维生素",
    short: "柔和而鲜明的成熟芒果风味，带你进入热带果香氛围。",
    description:
      "芒果的柔和感入口即现，风味平静却辨识度鲜明。成熟果肉般的香甜与热带气息，被装进便携的三角糖片中。",
    highlights: ["无糖", "维生素 B1、B2、C、E", "每颗约 3 千卡", "15 粒泡罩包装"],
    nutritionBasis: "每板 18g；每日参考值按 2,000 千卡膳食计算。",
    nutrition: multiNutrition,
    ingredients: `${commonVitaminIngredients}；芒果香料；天然 β-胡萝卜素、叶绿素铜复合物；醋酸生育酚（维生素 E）、核黄素（维生素 B2）、盐酸硫胺素（维生素 B1）。`,
    safety,
  },
  {
    slug: "green-tea-lime",
    name: "绿茶青柠",
    englishName: "Green Tea Lime",
    category: "vitamincandy",
    image: "/jake/products/green-tea-lime.jpg",
    accent: "#2da66a",
    eyebrow: "维生素 C · 绿茶提取物",
    short: "温和茶香与明亮青柠相遇，清新、轻盈、层次分明。",
    description:
      "经典绿茶与清亮青柠共同构成一段轻盈风味。绿茶提取物带来仿佛现泡茶饮般的自然感，青柠则补上一抹明快酸香。",
    highlights: ["无糖", "维生素 C", "绿茶提取物 3%", "天然着色成分"],
    nutritionBasis: "每板 18g；每日参考值按 2,000 千卡膳食计算。",
    nutrition: vitaminNutrition,
    ingredients: `${commonVitaminIngredients}；绿茶提取物 3%；青柠香料；叶绿素铜复合物。`,
    safety,
  },
  {
    slug: "strawberry",
    name: "草莓",
    englishName: "Strawberry",
    category: "vitamincandy",
    image: "/jake/products/strawberry.jpg",
    accent: "#e4434a",
    eyebrow: "维生素 C",
    short: "熟透草莓的甜香与鲜明酸感交织，入口新鲜、果味充沛。",
    description:
      "新鲜成熟草莓的香气先行，随后是更有张力的酸甜对比。果味饱满、清爽，像一颗小小的草莓在口中绽放。",
    highlights: ["无糖", "维生素 C", "每颗约 3 千卡", "天然着色成分"],
    nutritionBasis: "每板 18g；每日参考值按 2,000 千卡膳食计算。",
    nutrition: vitaminNutrition,
    ingredients: `${commonVitaminIngredients}；草莓香料；姜黄素、甜菜红、花青素。`,
    safety,
  },
  {
    slug: "pineapple",
    name: "菠萝",
    englishName: "Pineapple",
    category: "vitamincandy",
    image: "/jake/products/pineapple.jpg",
    accent: "#e5bd1f",
    eyebrow: "维生素 C",
    short: "甜润、多汁、明亮，呈现新鲜菠萝般的热带风味。",
    description:
      "闻起来香甜，入口多汁，果肉感和鲜明香气共同构成完整的菠萝体验。清新、活泼，很适合喜欢热带风味的人。",
    highlights: ["无糖", "维生素 C", "热带果香", "15 粒泡罩包装"],
    nutritionBasis: "每板 18g；每日参考值按 2,000 千卡膳食计算。",
    nutrition: vitaminNutrition,
    ingredients: `${commonVitaminIngredients}；菠萝香料；姜黄素、甜菜红、花青素、β-胡萝卜素。`,
    safety,
  },
  {
    slug: "grape",
    name: "葡萄",
    englishName: "Grape",
    category: "vitamincandy",
    image: "/jake/products/grape.jpg",
    accent: "#843b88",
    eyebrow: "维生素 C",
    short: "成熟葡萄般的细腻果香，带一丝柔和酸度。",
    description:
      "细腻、成熟的葡萄风味带着轻微酸感，像咬下一颗饱满的康科德葡萄。整体圆润安静，余味舒缓。",
    highlights: ["无糖", "维生素 C", "每颗约 3 千卡", "天然着色成分"],
    nutritionBasis: "每板 18g；每日参考值按 2,000 千卡膳食计算。",
    nutrition: vitaminNutrition,
    ingredients: `${commonVitaminIngredients}；葡萄香料；叶绿素铜复合物。`,
    safety,
  },
  {
    slug: "tangerine",
    name: "橘子",
    englishName: "Tangerine",
    category: "vitamincandy",
    image: "/jake/products/tangerine.jpg",
    accent: "#ed8b28",
    eyebrow: "维生素 C",
    short: "多汁柑橘气息与一点酸感平衡，清爽而持久。",
    description:
      "令人愉悦的橘子风味与轻微酸感相互平衡。果汁感鲜明，柑橘香气在口中保持得更久，清新而确定。",
    highlights: ["无糖", "维生素 C", "柑橘风味", "15 粒泡罩包装"],
    nutritionBasis: "每板 18g；每日参考值按 2,000 千卡膳食计算。",
    nutrition: vitaminNutrition,
    ingredients: `${commonVitaminIngredients}；橘子香料；天然 β-胡萝卜素。`,
    safety,
  },
  {
    slug: "apple-cinnamon",
    name: "苹果肉桂",
    englishName: "Apple & Cinnamon",
    category: "vitamincandy",
    image: "/jake/products/apple-cinnamon.jpg",
    accent: "#c64b38",
    eyebrow: "多种维生素",
    short: "明亮苹果果香与温暖肉桂气息相互包裹。",
    description:
      "苹果的明快酸甜与肉桂的温暖辛香形成舒适平衡。从入口到余味，风味完整、轻松，又带一点秋日般的温暖感。",
    highlights: ["无糖", "维生素 B1、B2、C、E", "苹果与肉桂双重风味", "15 粒泡罩包装"],
    nutritionBasis: "每板 18g；每日参考值按 2,000 千卡膳食计算。",
    nutrition: multiNutrition,
    ingredients: `${commonVitaminIngredients}；苹果、肉桂香料；姜黄素、甜菜红、花青素、叶绿素铜复合物；维生素 E、B2、B1。`,
    safety,
  },
  {
    slug: "raspberry",
    name: "覆盆子",
    englishName: "Raspberry",
    category: "vitamincandy",
    image: "/jake/products/raspberry.jpg",
    accent: "#d83c7f",
    eyebrow: "维生素 C",
    short: "入口即现饱满莓果香，轻酸之后层次逐渐增强。",
    description:
      "覆盆子风味在入口时迅速释放，先饱满、后提升，轻微酸感让果香更有张力，像刚摘下的莓果一样鲜明。",
    highlights: ["无糖", "维生素 C", "莓果酸甜", "天然着色成分"],
    nutritionBasis: "每板 18g；每日参考值按 2,000 千卡膳食计算。",
    nutrition: vitaminNutrition,
    ingredients: `${commonVitaminIngredients}；覆盆子香料；姜黄素、甜菜红、花青素。`,
    safety,
  },
  {
    slug: "peach",
    name: "桃子",
    englishName: "Peach",
    category: "vitamincandy",
    image: "/jake/products/peach.jpg",
    accent: "#f3982d",
    eyebrow: "维生素 C",
    short: "明亮桃香伴随轻微酸感，像咬下多汁鲜桃。",
    description:
      "桃子香气饱满，却保留一点轻盈酸度。甜与酸被调到恰好的位置，带来清新、有活力的多汁感。",
    highlights: ["无糖", "维生素 C", "桃子风味", "15 粒泡罩包装"],
    nutritionBasis: "每板 18g；每日参考值按 2,000 千卡膳食计算。",
    nutrition: vitaminNutrition,
    ingredients: `${commonVitaminIngredients}；桃子香料；姜黄素、甜菜红、花青素、β-胡萝卜素。`,
    safety,
  },
  {
    slug: "coconut-blueberry",
    name: "椰香蓝莓",
    englishName: "Coconut Blueberry",
    category: "vitamincandy",
    image: "/jake/products/coconut-blueberry.jpg",
    accent: "#853a88",
    eyebrow: "多种维生素",
    short: "清爽蓝莓与顺滑椰香形成独特而柔和的对比。",
    description:
      "明亮蓝莓果香与温和椰香共同出现，酸甜与柔滑感互相衬托。它既保留莓果的清新，也有更圆润的热带余味。",
    highlights: ["无糖", "维生素 B1、B2、C、E", "双重风味", "天然甜菜汁色"],
    nutritionBasis: "每板 18g；每日参考值按 2,000 千卡膳食计算。",
    nutrition: multiNutrition,
    ingredients: `${commonVitaminIngredients}；香料；天然甜菜汁色；维生素 E、B2、B1。`,
    safety,
  },
  {
    slug: "spearmint",
    name: "留兰香",
    englishName: "Spearmint",
    category: "mints",
    image: "/jake/products/spearmint.jpg",
    accent: "#2da66a",
    eyebrow: "JAKE MINTS",
    short: "更柔和、更草本的清凉感，适合日常随身携带。",
    description:
      "留兰香比经典胡椒薄荷更圆润、草本，清新感自然舒适。轻巧泡罩包装让它适合通勤、工作与旅行。",
    highlights: ["无糖", "无麸质", "每颗约 3 千卡", "15 粒泡罩包装"],
    nutritionBasis: "每板 14.4g；每日参考值按 2,000 千卡膳食计算。",
    nutrition: mintNutrition,
    ingredients: "山梨糖醇、甘露糖醇、硬脂酸镁、留兰香香料、甜味剂 E955。",
    safety,
  },
  {
    slug: "peppermint",
    name: "胡椒薄荷",
    englishName: "Peppermint",
    category: "mints",
    image: "/jake/products/peppermint.jpg",
    accent: "#1686c4",
    eyebrow: "JAKE MINTS",
    short: "经典、利落、直接的薄荷清凉感。",
    description:
      "胡椒薄荷带来更明快、更直接的清凉体验。无糖小片装进便携泡罩，随手一板即可保持日常清新。",
    highlights: ["无糖", "无麸质", "每颗约 3 千卡", "15 粒泡罩包装"],
    nutritionBasis: "每板 14.4g；每日参考值按 2,000 千卡膳食计算。",
    nutrition: mintNutrition,
    ingredients: "山梨糖醇、甘露糖醇、硬脂酸镁、胡椒薄荷香料、甜味剂 E955。",
    safety,
  },
  {
    slug: "inifinity-spearmint-character",
    name: "留兰香 · 独立纸包",
    englishName: "Spearmint Character",
    category: "infinity",
    image: "/jake/products/inifinity-spearmint-character.jpg",
    accent: "#2da66a",
    eyebrow: "JAKE INFINITY",
    short: "强劲而持久的留兰香清新感，每颗独立纸包。",
    description:
      "Infinity 留兰香独立纸包版带来更强烈、更持久的口腔清新体验。每颗单独包装，适合随身携带与分享。",
    highlights: ["无糖", "持久清新", "独立纸包", "每颗约 3 千卡"],
    nutritionBasis: "以下为每 100g 营养信息。",
    nutrition: infinityNutrition,
    ingredients: "山梨糖醇、甜味剂 E955、硬脂酸镁、留兰香香料。",
    safety,
  },
  {
    slug: "inifinity-spearmint",
    name: "留兰香 · 条装",
    englishName: "Spearmint",
    category: "infinity",
    image: "/jake/products/inifinity-spearmint.jpg",
    accent: "#2da66a",
    eyebrow: "JAKE INFINITY",
    short: "圆润草本清凉感，采用便携条装。",
    description:
      "Infinity 留兰香条装适合希望清新感更持久、口味更柔和的人群。无糖配方，放进口袋即可随时取用。",
    highlights: ["无糖", "持久清新", "便携条装", "留兰香风味"],
    nutritionBasis: "以下为每 100g 营养信息。",
    nutrition: infinityNutrition,
    ingredients: "山梨糖醇、甜味剂 E955、硬脂酸镁、留兰香香料。",
    safety,
  },
  {
    slug: "inifinity-peppermint-character",
    name: "胡椒薄荷 · 独立纸包",
    englishName: "Peppermint Character",
    category: "infinity",
    image: "/jake/products/inifinity-peppermint-character.jpg",
    accent: "#1686c4",
    eyebrow: "JAKE INFINITY",
    short: "强烈经典薄荷清凉感，每颗独立纸包。",
    description:
      "Infinity 胡椒薄荷独立纸包版强调直接、强劲和持久的清新感。单颗包装便于随身携带、分享和控制用量。",
    highlights: ["无糖", "持久清新", "独立纸包", "胡椒薄荷风味"],
    nutritionBasis: "以下为每 100g 营养信息。",
    nutrition: infinityNutrition,
    ingredients: "山梨糖醇、甜味剂 E955、硬脂酸镁、胡椒薄荷香料。",
    safety,
  },
  {
    slug: "inifinity-peppermint",
    name: "胡椒薄荷 · 条装",
    englishName: "Peppermint",
    category: "infinity",
    image: "/jake/products/inifinity-peppermint.jpg",
    accent: "#1686c4",
    eyebrow: "JAKE INFINITY",
    short: "更直接、更利落的持久薄荷体验。",
    description:
      "Infinity 胡椒薄荷条装将更强烈的经典薄荷感装进便携包装，为通勤、会议、旅行等场景提供持久清新。",
    highlights: ["无糖", "持久清新", "便携条装", "胡椒薄荷风味"],
    nutritionBasis: "以下为每 100g 营养信息。",
    nutrition: infinityNutrition,
    ingredients: "山梨糖醇、甜味剂 E955、硬脂酸镁、胡椒薄荷香料。",
    safety,
  },
];

export const popularProducts = ["strawberry", "green-tea-lime", "mango", "peppermint"]
  .map((slug) => products.find((product) => product.slug === slug))
  .filter((product): product is Product => Boolean(product));

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getCategory(id: ProductCategory) {
  return categories.find((category) => category.id === id);
}

export function getProductsByCategory(category: ProductCategory) {
  return products.filter((product) => product.category === category);
}
