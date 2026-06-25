import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const source =
  "/var/folders/dv/10lwkjsj78bc6vzk7g_yth640000gn/T/codex-clipboard-080cabe7-3b1b-4619-bb52-c0c01af46a0b.png";
const destination = path.resolve("public/archetypes");

const rows = [
  [
    "jia_zi",
    "yi_chou",
    "jia_yin",
    "yi_mao",
    "jia_chen",
    "yi_si",
    "jia_wu",
    "yi_wei",
    "jia_shen",
    "yi_you",
    "jia_xu",
    "yi_hai",
  ],
  [
    "bing_zi",
    "ding_chou",
    "bing_yin",
    "ding_mao",
    "bing_chen",
    "ding_si",
    "bing_wu",
    "ding_wei",
    "bing_shen",
    "ding_you",
    "bing_xu",
    "ding_hai",
  ],
  [
    "geng_zi",
    "xin_chou",
    "geng_yin",
    "xin_mao",
    "geng_chen",
    "xin_si",
    "geng_wu",
    "xin_wei",
    "geng_shen",
    "xin_you",
    "geng_xu",
    "xin_hai",
  ],
  [
    "ren_zi",
    "gui_chou",
    "ren_yin",
    "gui_mao",
    "ren_chen",
    "gui_si",
    "ren_wu",
    "gui_wei",
    "ren_shen",
    "gui_you",
    "ren_xu",
    "gui_hai",
  ],
  [
    "wu_zi",
    "ji_chou",
    "wu_yin",
    "ji_mao",
    "wu_chen",
    "ji_si",
    "wu_wu",
    "ji_wei",
    "wu_shen",
    "ji_you",
    "wu_xu",
    "ji_hai",
  ],
];

const xStarts = [
  24, 347, 671, 1002, 1329, 1652, 1976, 2299, 2623, 2946, 3269, 3593,
];
const yStarts = [11, 467, 914, 1350, 1786];

await fs.mkdir(destination, { recursive: true });
await fs.copyFile(source, path.join(destination, "sixty-archetypes.png"));

for (let row = 0; row < rows.length; row += 1) {
  for (let column = 0; column < rows[row].length; column += 1) {
    await sharp(source)
      .extract({
        left: xStarts[column],
        top: yStarts[row],
        width: 309,
        height: 418,
      })
      .webp({ quality: 92 })
      .toFile(path.join(destination, `${rows[row][column]}.webp`));
  }
}

console.log(`Created ${rows.flat().length} archetype cards in ${destination}`);
