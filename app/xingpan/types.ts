export type ScenePhase = "void" | "warp" | "core";

export type BirthInput = {
  birthDate: string;
  birthTime: string;
  birthplace: string;
  gender?: "male" | "female";
};

export type DestinyPalette = {
  void: string;
  blue: string;
  gold: string;
  ember: string;
};

export type ElementalSignature = {
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
};

export type DestinyCycle = {
  id: string;
  age: number;
  decade: string;
  label: string;
  stemBranch: string;
  intensity: number;
  valence: number;
  keywords: string[];
  insight: string;
  startYear?: number;
  endYear?: number;
  startDate?: string;
  endDate?: string;
  position?: [number, number, number];
  zodiacAngle?: number;
  annualCoordinates?: Array<{
    year: number;
    age: number;
    stemBranch: string;
    position: [number, number, number];
  }>;
  isCurrent?: boolean;
  kind?: "prelude" | "dayun";
};

export type DestinyProfile = {
  id: string;
  subject: string;
  birth: BirthInput;
  generatedAt: string;
  palette: DestinyPalette;
  elements: ElementalSignature;
  cycles: DestinyCycle[];
  zodiac: Array<{ glyph: string; name: string }>;
  jiazi: string[];
};
