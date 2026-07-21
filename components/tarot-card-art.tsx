type TarotCardArtProps = {
  id: string;
  arcana: "major" | "minor";
  number: string;
  symbol: string;
  orientation: "upright" | "reversed";
};

type Suit = "major" | "wands" | "cups" | "swords" | "pentacles";

function getSuit(id: string, arcana: TarotCardArtProps["arcana"]): Suit {
  if (arcana === "major") return "major";
  if (id.endsWith("-of-wands")) return "wands";
  if (id.endsWith("-of-cups")) return "cups";
  if (id.endsWith("-of-swords")) return "swords";
  return "pentacles";
}

function MajorScene({ id, symbol }: Pick<TarotCardArtProps, "id" | "symbol">) {
  const lunar = ["high-priestess", "hermit", "moon", "hanged-man"].includes(id);
  const solar = ["magician", "strength", "sun", "judgement"].includes(id);
  const botanical = ["empress", "lovers", "temperance", "star", "world"].includes(id);
  const architectural = ["emperor", "hierophant", "justice", "tower", "chariot"].includes(id);

  return (
    <>
      <circle className="tarot-art__mist" cx="80" cy="74" r="49" />
      <path className="tarot-art__fine" d="M24 126C46 112 55 92 80 52C105 92 114 112 136 126" />
      <path className="tarot-art__fine" d="M31 133H129M43 142H117" />
      {lunar && (
        <>
          <path className="tarot-art__line" d="M95 39A29 29 0 1 0 95 87A22 22 0 1 1 95 39Z" />
          <path className="tarot-art__soft" d="M47 117C56 97 66 90 80 93C94 90 104 97 113 117" />
        </>
      )}
      {solar && (
        <>
          <circle className="tarot-art__line" cx="80" cy="62" r="21" />
          <path className="tarot-art__ray" d="M80 30V20M80 104V94M48 62H38M122 62H112M57 39L50 32M110 92L103 85M103 39L110 32M50 92L57 85" />
        </>
      )}
      {botanical && (
        <>
          <path className="tarot-art__line" d="M80 113C80 91 78 70 68 49M79 91C63 83 52 72 48 57M80 80C96 74 106 61 109 48" />
          <path className="tarot-art__soft" d="M48 57C57 54 64 57 68 65C58 66 51 63 48 57ZM109 48C108 58 102 64 93 66C94 56 99 50 109 48Z" />
        </>
      )}
      {architectural && (
        <>
          <path className="tarot-art__line" d="M48 119V62L80 37L112 62V119M60 119V70L80 54L100 70V119" />
          <path className="tarot-art__soft" d="M40 119H120M67 91H93" />
        </>
      )}
      {!lunar && !solar && !botanical && !architectural && (
        <>
          <path className="tarot-art__line" d="M49 115C55 86 65 65 80 43C95 65 105 86 111 115" />
          <circle className="tarot-art__soft" cx="80" cy="75" r="28" />
        </>
      )}
      <text className="tarot-art__glyph" x="80" y="82" textAnchor="middle">
        {symbol}
      </text>
      <circle className="tarot-art__dot" cx="37" cy="41" r="2" />
      <circle className="tarot-art__dot" cx="123" cy="92" r="1.6" />
      <path className="tarot-art__soft" d="M51 151C66 144 94 144 109 151" />
    </>
  );
}

function MinorScene({ suit, symbol }: { suit: Exclude<Suit, "major">; symbol: string }) {
  return (
    <>
      <circle className="tarot-art__mist" cx="80" cy="72" r="48" />
      <circle className="tarot-art__fine" cx="80" cy="75" r="39" />
      <path className="tarot-art__fine" d="M24 128C51 114 109 114 136 128M38 141H122" />

      {suit === "wands" && (
        <>
          <path className="tarot-art__line" d="M62 127L91 35M75 126L103 51" />
          <path className="tarot-art__soft" d="M86 52C72 51 65 44 65 34C78 35 86 41 86 52ZM96 76C109 73 117 66 119 55C106 56 98 63 96 76ZM71 91C58 88 50 80 49 69C62 71 69 78 71 91Z" />
        </>
      )}
      {suit === "cups" && (
        <>
          <path className="tarot-art__line" d="M53 54H107C106 80 98 94 80 99C62 94 54 80 53 54ZM80 99V124M62 126H98" />
          <path className="tarot-art__soft" d="M58 66C69 72 91 72 102 66M66 41C73 33 87 33 94 41" />
        </>
      )}
      {suit === "swords" && (
        <>
          <path className="tarot-art__line" d="M80 31L91 99L80 119L69 99Z" />
          <path className="tarot-art__line" d="M58 100H102M71 109L80 119L89 109" />
          <path className="tarot-art__soft" d="M42 125L60 106M118 125L100 106M44 58L61 71M116 58L99 71" />
        </>
      )}
      {suit === "pentacles" && (
        <>
          <circle className="tarot-art__line" cx="80" cy="78" r="37" />
          <path className="tarot-art__line" d="M80 47L88 68L111 69L93 83L99 106L80 93L61 106L67 83L49 69L72 68Z" />
          <path className="tarot-art__soft" d="M80 31V20M43 48L35 40M117 48L125 40" />
        </>
      )}
      <text className="tarot-art__glyph tarot-art__glyph--minor" x="80" y="85" textAnchor="middle">
        {symbol}
      </text>
    </>
  );
}

export function TarotCardArt({ id, arcana, number, symbol, orientation }: TarotCardArtProps) {
  const suit = getSuit(id, arcana);

  return (
    <div
      className="tarot-card-art"
      data-orientation={orientation}
      data-suit={suit}
      aria-hidden="true"
    >
      <svg viewBox="0 0 160 176" focusable="false">
        <path className="tarot-art__frame" d="M19 13H141V163H19Z" />
        <path className="tarot-art__corner" d="M19 38V13H44M116 13H141V38M19 138V163H44M116 163H141V138" />
        {suit === "major" ? (
          <MajorScene id={id} symbol={symbol} />
        ) : (
          <MinorScene suit={suit} symbol={symbol} />
        )}
        <text className="tarot-art__number" x="29" y="31">
          {number}
        </text>
      </svg>
    </div>
  );
}
