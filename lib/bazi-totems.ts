import type { BaziData } from "@/lib/engines/bazi";

export type PillarKey = keyof BaziData["pillars"];

export const pillarRoleLabels: Record<
  PillarKey,
  { title: string; microBadge: string }
> = {
  year: {
    title: "Year Pillar",
    microBadge: "Ancestral & Early Life",
  },
  month: {
    title: "Month Pillar",
    microBadge: "Career & Social Persona",
  },
  day: {
    title: "Day Pillar",
    microBadge: "Core Self & Inner Ego",
  },
  hour: {
    title: "Hour Pillar",
    microBadge: "Legacy & Late Life",
  },
};

export const branchTotems: Record<
  string,
  { animal: string; emoji: string; elementField: string }
> = {
  子: { animal: "Rat", emoji: "🐀", elementField: "Water instinct" },
  丑: { animal: "Ox", emoji: "🐂", elementField: "Earth endurance" },
  寅: { animal: "Tiger", emoji: "🐅", elementField: "Wood courage" },
  卯: { animal: "Rabbit", emoji: "🐇", elementField: "Wood sensitivity" },
  辰: { animal: "Dragon", emoji: "🐉", elementField: "Earth reservoir" },
  巳: { animal: "Snake", emoji: "🐍", elementField: "Fire perception" },
  午: { animal: "Horse", emoji: "🐎", elementField: "Fire momentum" },
  未: { animal: "Goat", emoji: "🐐", elementField: "Earth cultivation" },
  申: { animal: "Monkey", emoji: "🐒", elementField: "Metal strategy" },
  酉: { animal: "Rooster", emoji: "🐓", elementField: "Metal refinement" },
  戌: { animal: "Dog", emoji: "🐕", elementField: "Earth loyalty" },
  亥: { animal: "Pig", emoji: "🐖", elementField: "Water depth" },
};

export const pillarOrder: PillarKey[] = ["year", "month", "day", "hour"];
