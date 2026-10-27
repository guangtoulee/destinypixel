import "server-only";
import catalog from "./catalog.json";
import { tarotCardMatches } from "./search";

const suits: Record<string, string[]> = {
  wands: ["wands", "wand", "权杖", "權杖"],
  cups: ["cups", "cup", "圣杯", "聖杯"],
  swords: ["swords", "sword", "宝剑", "寶劍"],
  pentacles: ["pentacles", "pentacle", "coins", "coin", "星币", "星幣", "钱币", "錢幣"],
};
const ranks: Record<string, string[]> = {
  ace: ["ace", "one", "1", "一", "王牌"], two: ["two", "2", "二"], three: ["three", "3", "三"],
  four: ["four", "4", "四"], five: ["five", "5", "五"], six: ["six", "6", "六"],
  seven: ["seven", "7", "七"], eight: ["eight", "8", "八"], nine: ["nine", "9", "九"], ten: ["ten", "10", "十"],
  page: ["page", "侍从", "侍從"], knight: ["knight", "骑士", "騎士"],
  queen: ["queen", "王后"], king: ["king", "国王", "國王"],
};
const majorAliases: Record<string, string[]> = {
  empress: ["女皇"], "high-priestess": ["女教皇"], "hanged-man": ["吊人", "倒悬者", "倒懸者"],
  wheel: ["wheel of fortune", "命运轮", "命運輪"], judgement: ["judgment"],
};

export const tarotCardSearchEntries = catalog.en.map(card => {
  const aliases = [card.cardId.replaceAll("-", " "), ...Object.values(catalog).map(cards => cards.find(c => c.cardId === card.cardId)!.nameLocalized), ...(majorAliases[card.cardId] ?? [])];
  if (card.suit) {
    const rank = ranks[card.cardId.split("-")[0]];
    for (const suit of suits[card.suit]) {
      aliases.push(suit);
      for (const value of rank) aliases.push(value, `${value} of ${suit}`, `${value} ${suit}`, `${suit} ${value}`, `${suit}${value}`, `${value}${suit}`);
    }
  }
  return { cardId: card.cardId, aliases: [...new Set(aliases)] };
});

export const searchTarotCardIds = (query: string) => tarotCardSearchEntries.filter(card => tarotCardMatches(card.aliases, query)).map(card => card.cardId);
