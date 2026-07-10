import type { ReactNode } from "react";

type DeityKey = "guanyin" | "wuye" | "wen-caishen" | "wu-caishen" | "mazu";

type DeityPortraitProps = {
  deityKey: string;
  active?: boolean;
  ritual?: boolean;
};

function PortraitFrame({
  deityKey,
  children,
}: {
  deityKey: DeityKey;
  children: ReactNode;
}) {
  return (
    <svg viewBox="0 0 280 340" role="img" focusable="false">
      <g className="deity-portrait__geometry">
        <circle cx="140" cy="91" r="72" />
        <circle cx="140" cy="210" r="101" />
        <path d="M38 280H242" />
        <path d="M140 17V316" />
        <path d="M53 126C91 95 189 95 227 126" />
      </g>
      <g className={`deity-portrait__art deity-portrait__art--${deityKey}`}>
        {children}
      </g>
    </svg>
  );
}

function GuanyinPortrait() {
  return (
    <PortraitFrame deityKey="guanyin">
      <g className="deity-portrait__soft">
        <path d="M103 62C82 79 76 113 82 154C65 180 64 225 82 272" />
        <path d="M177 62C198 79 204 113 198 154C215 180 216 225 198 272" />
        <path d="M82 272C106 286 174 286 198 272" />
      </g>
      <g className="deity-portrait__main">
        <path d="M109 77C112 58 168 58 171 77C174 102 167 132 140 144C113 132 106 102 109 77Z" />
        <path d="M117 97C123 93 129 93 134 97" />
        <path d="M146 97C151 93 157 93 163 97" />
        <path d="M139 101C136 113 136 120 141 123" />
        <path d="M130 130C136 134 144 134 151 130" />
        <path d="M108 143C89 153 77 176 72 209C89 237 111 255 140 269C169 255 191 237 208 209C203 176 191 153 172 143" />
        <path d="M99 160C108 185 108 219 96 245" />
        <path d="M181 160C172 185 172 219 184 245" />
        <path d="M98 197C120 211 160 211 182 197" />
        <path d="M108 239C124 229 156 229 172 239" />
      </g>
      <g className="deity-portrait__detail">
        <path d="M111 73C111 54 123 43 140 28C157 43 169 54 169 73" />
        <path d="M122 56C127 48 134 43 140 35C146 43 153 48 158 56" />
        <path d="M128 58C132 50 148 50 152 58C151 69 129 69 128 58Z" />
        <path d="M82 173C58 158 43 137 33 110" />
        <path d="M36 113C49 112 58 105 66 94" />
        <path d="M45 133C56 130 65 123 73 112" />
        <path d="M52 151C62 147 70 140 77 130" />
        <path d="M171 171C184 160 201 166 204 181C201 204 190 222 174 234C167 209 166 188 171 171Z" />
        <path d="M175 173C185 181 194 181 201 175" />
        <path d="M110 175C120 183 124 195 121 208" />
        <path d="M110 175C121 169 133 172 140 182" />
      </g>
      <g className="deity-portrait__accent">
        <circle cx="140" cy="66" r="3" />
        <path d="M93 276C110 292 170 292 187 276" />
      </g>
    </PortraitFrame>
  );
}

function WuyePortrait() {
  return (
    <PortraitFrame deityKey="wuye">
      <g className="deity-portrait__soft">
        <path d="M57 215C35 196 39 167 61 155C41 138 49 112 73 108" />
        <path d="M223 215C245 196 241 167 219 155C239 138 231 112 207 108" />
        <path d="M54 273C89 289 191 289 226 273" />
      </g>
      <g className="deity-portrait__main">
        <path d="M103 83C105 61 175 61 177 83C179 113 169 138 140 149C111 138 101 113 103 83Z" />
        <path d="M112 99C120 94 128 95 134 101" />
        <path d="M146 101C152 95 160 94 168 99" />
        <path d="M116 106C122 109 128 109 133 106" />
        <path d="M147 106C152 109 158 109 164 106" />
        <path d="M140 105C135 117 136 125 141 128" />
        <path d="M122 132C132 128 148 128 158 132" />
        <path d="M127 136C130 150 150 150 153 136" />
        <path d="M108 147C83 158 66 181 59 220C80 247 108 264 140 279C172 264 200 247 221 220C214 181 197 158 172 147" />
        <path d="M80 188C103 177 177 177 200 188" />
        <path d="M91 209C111 224 169 224 189 209" />
      </g>
      <g className="deity-portrait__detail">
        <path d="M102 83C86 69 84 49 96 35C96 49 107 56 119 59" />
        <path d="M178 83C194 69 196 49 184 35C184 49 173 56 161 59" />
        <path d="M115 64C119 49 128 39 140 28C152 39 161 49 165 64" />
        <path d="M126 48L140 33L154 48" />
        <circle cx="140" cy="57" r="8" />
        <path d="M102 176C115 162 127 158 140 160C153 158 165 162 178 176" />
        <path d="M117 181C122 193 131 201 140 207C149 201 158 193 163 181" />
        <path d="M128 190L140 178L152 190L140 202Z" />
        <path d="M67 236C91 224 112 234 126 254" />
        <path d="M213 236C189 224 168 234 154 254" />
      </g>
      <g className="deity-portrait__accent">
        <circle cx="140" cy="57" r="3" />
        <path d="M49 260C75 250 96 257 112 278" />
        <path d="M231 260C205 250 184 257 168 278" />
      </g>
    </PortraitFrame>
  );
}

function WenCaishenPortrait() {
  return (
    <PortraitFrame deityKey="wen-caishen">
      <g className="deity-portrait__soft">
        <path d="M53 78H227" />
        <path d="M76 76L43 63" />
        <path d="M204 76L237 63" />
        <path d="M50 270C91 290 189 290 230 270" />
      </g>
      <g className="deity-portrait__main">
        <path d="M106 82C109 61 171 61 174 82C176 111 166 138 140 149C114 138 104 111 106 82Z" />
        <path d="M115 101C121 97 128 97 134 101" />
        <path d="M146 101C152 97 159 97 165 101" />
        <path d="M140 104C136 116 136 123 141 126" />
        <path d="M128 132C135 136 145 136 152 132" />
        <path d="M130 138C132 151 148 151 150 138" />
        <path d="M108 147C84 158 69 181 63 218C82 247 108 267 140 280C172 267 198 247 217 218C211 181 196 158 172 147" />
        <path d="M86 184C110 198 170 198 194 184" />
        <path d="M98 213H182V258H98Z" />
      </g>
      <g className="deity-portrait__detail">
        <path d="M101 80V60H179V80" />
        <path d="M112 60V45H168V60" />
        <path d="M124 45C124 33 156 33 156 45" />
        <path d="M78 60H202" />
        <path d="M78 60L49 49" />
        <path d="M202 60L231 49" />
        <path d="M111 211H169" />
        <path d="M111 225H162" />
        <path d="M111 239H156" />
        <path d="M75 192C91 183 105 188 113 201" />
        <path d="M205 190C189 180 176 186 168 198" />
        <path d="M184 173C193 161 211 167 211 180C208 194 196 202 184 198C190 193 193 185 191 178" />
      </g>
      <g className="deity-portrait__accent">
        <path d="M128 215C136 207 144 207 152 215" />
        <circle cx="140" cy="231" r="7" />
      </g>
    </PortraitFrame>
  );
}

function WuCaishenPortrait() {
  return (
    <PortraitFrame deityKey="wu-caishen">
      <g className="deity-portrait__soft">
        <path d="M55 276C83 286 111 288 140 282C169 288 197 286 225 276" />
        <path d="M42 207C67 190 88 193 103 211" />
        <path d="M238 207C213 190 192 193 177 211" />
      </g>
      <g className="deity-portrait__main">
        <path d="M103 78C107 57 173 57 177 78C180 108 169 137 140 148C111 137 100 108 103 78Z" />
        <path d="M112 96C121 89 129 91 135 99" />
        <path d="M145 99C151 91 159 89 168 96" />
        <path d="M115 104C121 108 128 108 134 104" />
        <path d="M146 104C152 108 159 108 165 104" />
        <path d="M140 103C135 116 136 124 142 128" />
        <path d="M120 132C130 126 150 126 160 132" />
        <path d="M125 136C127 151 134 171 140 188C146 171 153 151 155 136" />
        <path d="M107 146C80 159 65 183 59 224C82 249 110 267 140 282C170 267 198 249 221 224C215 183 200 159 173 146" />
        <path d="M80 186C109 174 171 174 200 186" />
        <path d="M91 218C119 233 161 233 189 218" />
      </g>
      <g className="deity-portrait__detail">
        <path d="M100 78C101 59 111 47 127 41H153C169 47 179 59 180 78" />
        <path d="M104 61C88 56 79 45 75 31C91 37 107 37 124 29" />
        <path d="M176 61C192 56 201 45 205 31C189 37 173 37 156 29" />
        <path d="M215 65V275" />
        <path d="M215 69C242 82 241 112 215 126" />
        <path d="M215 69C193 87 194 109 215 126" />
        <path d="M209 275H221" />
        <path d="M109 182L140 159L171 182" />
        <path d="M120 185L140 201L160 185" />
        <path d="M70 225C85 212 99 214 112 228" />
      </g>
      <g className="deity-portrait__accent">
        <path d="M119 100L134 96" />
        <path d="M146 96L161 100" />
        <path d="M140 188C134 213 135 245 140 270C145 245 146 213 140 188Z" />
      </g>
    </PortraitFrame>
  );
}

function MazuPortrait() {
  return (
    <PortraitFrame deityKey="mazu">
      <g className="deity-portrait__soft">
        <path d="M66 269C84 253 102 253 120 269C138 285 156 285 174 269C192 253 210 253 228 269" />
        <path d="M50 287C73 270 96 270 119 287C142 304 165 304 188 287C205 275 221 272 236 279" />
        <path d="M75 92C58 127 61 191 77 226" />
        <path d="M205 92C222 127 219 191 203 226" />
      </g>
      <g className="deity-portrait__main">
        <path d="M108 83C111 62 169 62 172 83C174 111 165 137 140 148C115 137 106 111 108 83Z" />
        <path d="M116 101C122 97 129 97 134 101" />
        <path d="M146 101C151 97 158 97 164 101" />
        <path d="M140 104C136 116 136 123 141 126" />
        <path d="M130 133C136 137 144 137 150 133" />
        <path d="M107 146C82 159 68 184 62 224C83 249 110 268 140 282C170 268 197 249 218 224C212 184 198 159 173 146" />
        <path d="M85 183C111 198 169 198 195 183" />
        <path d="M101 214C124 226 156 226 179 214" />
      </g>
      <g className="deity-portrait__detail">
        <path d="M100 83V58H180V83" />
        <path d="M108 58L120 40L130 56L140 29L150 56L160 40L172 58" />
        <path d="M104 61H176" />
        <path d="M112 61V79M126 61V82M140 61V84M154 61V82M168 61V79" />
        <circle cx="112" cy="82" r="3" />
        <circle cx="126" cy="85" r="3" />
        <circle cx="140" cy="87" r="3" />
        <circle cx="154" cy="85" r="3" />
        <circle cx="168" cy="82" r="3" />
        <path d="M114 174C123 165 133 165 140 176C147 165 157 165 166 174" />
        <path d="M120 177C126 190 133 198 140 203C147 198 154 190 160 177" />
        <path d="M87 234C102 224 116 228 128 242" />
        <path d="M193 234C178 224 164 228 152 242" />
      </g>
      <g className="deity-portrait__accent">
        <path d="M94 289C110 279 126 281 140 294C154 281 170 279 186 289" />
        <circle cx="140" cy="29" r="3" />
      </g>
    </PortraitFrame>
  );
}

const portraitByKey: Record<DeityKey, ReactNode> = {
  guanyin: <GuanyinPortrait />,
  wuye: <WuyePortrait />,
  "wen-caishen": <WenCaishenPortrait />,
  "wu-caishen": <WuCaishenPortrait />,
  mazu: <MazuPortrait />,
};

export function DeityPortrait({ deityKey, active = false, ritual = false }: DeityPortraitProps) {
  const key = (deityKey in portraitByKey ? deityKey : "guanyin") as DeityKey;

  return (
    <div
      className={`deity-portrait deity-portrait--${key}${ritual ? " deity-portrait--ritual" : ""}`}
      data-active={active || ritual}
      aria-hidden="true"
    >
      {portraitByKey[key]}
      <div className="deity-portrait__incense">
        <i />
        <i />
        <span />
      </div>
    </div>
  );
}
