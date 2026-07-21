import type { ReactNode } from "react";

type DeityKey = "guanyin" | "wuye" | "wen-caishen" | "wu-caishen" | "mazu";

type DeityPortraitProps = {
  deityKey: string;
  active?: boolean;
  ritual?: boolean;
};

function PortraitFrame({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 320 420" role="img" focusable="false">
      <g className="deity-portrait__geometry">
        <circle cx="160" cy="116" r="91" />
        <circle cx="160" cy="248" r="128" />
        <circle cx="160" cy="248" r="104" />
        <path d="M32 344H288M160 16V397" />
        <path d="M51 165C103 119 217 119 269 165" />
        <path d="M55 319C97 347 223 347 265 319" />
      </g>
      {children}
    </svg>
  );
}

function GuanyinPortrait() {
  return (
    <PortraitFrame>
      <g className="deity-portrait__soft">
        <path d="M113 68C77 96 61 153 75 224C55 259 55 320 86 362" />
        <path d="M207 68C243 96 259 153 245 224C265 259 265 320 234 362" />
        <circle cx="160" cy="113" r="76" />
        <path d="M62 285C98 263 121 268 137 297M258 285C222 263 199 268 183 297" />
        <path d="M43 178C80 192 100 219 105 260M277 178C240 192 220 219 215 260" />
        <path d="M78 347C102 365 132 378 160 391C188 378 218 365 242 347" />
      </g>
      <g className="deity-portrait__main">
        <path d="M125 98C126 77 140 64 160 64C180 64 194 77 195 98C197 131 185 158 160 170C135 158 123 131 125 98Z" />
        <path d="M129 92C137 78 148 73 160 73C172 73 183 78 191 92" />
        <path d="M136 114C142 109 149 109 154 114M166 114C171 109 178 109 184 114" />
        <path d="M139 118C145 122 150 122 154 117M166 117C170 122 175 122 181 118" />
        <path d="M160 116C157 128 155 139 161 144" />
        <path d="M151 151C156 154 164 154 169 151" />
        <path d="M154 158C158 160 162 160 166 158" />
        <path d="M123 169C92 184 73 215 67 264C88 309 119 343 160 370C201 343 232 309 253 264C247 215 228 184 197 169" />
        <path d="M93 219C116 237 204 237 227 219M108 252C127 265 193 265 212 252" />
        <path d="M96 203C111 239 110 296 91 333M224 203C209 239 210 296 229 333" />
        <path d="M80 267C103 284 119 306 126 337M240 267C217 284 201 306 194 337" />
        <path d="M105 344C130 329 190 329 215 344M124 361C144 350 176 350 196 361" />
      </g>
      <g className="deity-portrait__detail">
        <path d="M123 101C119 77 128 55 144 39C151 31 157 24 160 16C163 24 169 31 176 39C192 55 201 77 197 101" />
        <path d="M140 60C141 48 149 39 160 29C171 39 179 48 180 60" />
        <path d="M144 60C145 50 153 45 160 38C167 45 175 50 176 60C168 68 152 68 144 60Z" />
        <path d="M151 71C153 65 167 65 169 71" />
        <circle cx="160" cy="93" r="3" />
        <path d="M126 101C121 109 121 122 126 130M194 101C199 109 199 122 194 130" />
        <path d="M133 91C139 83 148 80 160 80C172 80 181 83 187 91" />
        <path d="M91 215C64 203 46 180 33 148" />
        <path d="M37 151C51 150 63 142 72 129M47 174C61 171 72 162 80 150M58 195C70 191 81 182 88 169" />
        <path d="M39 148C29 134 31 121 41 111C51 123 50 136 39 148ZM70 129C62 115 66 102 78 94C86 108 82 120 70 129Z" />
        <path d="M198 205C213 190 234 196 239 216C236 246 221 271 198 288C190 254 190 226 198 205Z" />
        <path d="M204 207C218 219 227 219 237 209M199 239C213 247 224 246 233 237" />
        <path d="M119 205C131 214 137 229 133 245M119 205C133 196 148 201 155 214" />
        <path d="M124 216C132 220 138 226 141 234M144 215C149 219 153 225 155 232" />
        <path d="M114 330C134 316 186 316 206 330M130 349C145 339 175 339 190 349" />
      </g>
      <g className="deity-portrait__accent">
        <path d="M138 391C150 383 170 383 182 391" />
        <circle cx="160" cy="93" r="2.8" />
      </g>
    </PortraitFrame>
  );
}

function WuyePortrait() {
  return (
    <PortraitFrame>
      <g className="deity-portrait__soft">
        <path d="M55 256C31 233 36 201 61 185C38 166 47 132 76 125" />
        <path d="M265 256C289 233 284 201 259 185C282 166 273 132 244 125" />
        <path d="M41 327C78 305 107 310 128 338M279 327C242 305 213 310 192 338" />
        <circle cx="160" cy="122" r="84" />
      </g>
      <g className="deity-portrait__main">
        <path d="M119 101C122 74 138 62 160 62C182 62 198 74 201 101C203 135 190 162 160 176C130 162 117 135 119 101Z" />
        <path d="M130 116C139 109 148 111 154 119M166 119C172 111 181 109 190 116" />
        <path d="M131 122C140 127 148 127 154 121M166 121C172 127 180 127 189 122" />
        <path d="M160 119C154 134 155 143 161 148" />
        <path d="M141 156C151 151 169 151 179 156" />
        <path d="M146 159C148 174 172 174 174 159" />
        <path d="M119 174C83 190 62 222 55 273C79 318 115 350 160 375C205 350 241 318 265 273C258 222 237 190 201 174" />
        <path d="M77 229C112 210 208 210 243 229M88 263C121 281 199 281 232 263" />
      </g>
      <g className="deity-portrait__detail">
        <path d="M116 100C94 87 87 63 101 42C106 56 119 63 135 66M204 100C226 87 233 63 219 42C214 56 201 63 185 66" />
        <path d="M130 68C132 48 143 33 160 19C177 33 188 48 190 68" />
        <path d="M143 48L160 26L177 48M149 51C151 41 169 41 171 51C169 61 151 61 149 51Z" />
        <path d="M136 64C128 53 119 48 108 48M184 64C192 53 201 48 212 48" />
        <path d="M135 160C139 180 149 197 160 209C171 197 181 180 185 160" />
        <path d="M142 174C150 168 170 168 178 174M146 187C153 181 167 181 174 187" />
        <path d="M119 205C133 190 147 184 160 186C173 184 187 190 201 205" />
        <path d="M131 209L160 190L189 209L160 232Z" />
        <path d="M160 198V224M142 211H178" />
        <path d="M72 286C99 269 123 276 139 301M248 286C221 269 197 276 181 301" />
        <path d="M106 327C126 311 194 311 214 327" />
      </g>
      <g className="deity-portrait__accent">
        <circle cx="160" cy="51" r="3" />
        <path d="M55 357C85 341 112 347 132 370M265 357C235 341 208 347 188 370" />
      </g>
    </PortraitFrame>
  );
}

function WenCaishenPortrait() {
  return (
    <PortraitFrame>
      <g className="deity-portrait__soft">
        <circle cx="160" cy="116" r="79" />
        <path d="M48 350C85 330 116 334 139 359M272 350C235 330 204 334 181 359" />
        <path d="M69 197C50 222 46 270 60 310M251 197C270 222 274 270 260 310" />
      </g>
      <g className="deity-portrait__main">
        <path d="M123 101C126 75 141 64 160 64C179 64 194 75 197 101C199 134 187 162 160 174C133 162 121 134 123 101Z" />
        <path d="M134 118C141 113 148 113 154 118M166 118C172 113 179 113 186 118" />
        <path d="M160 120C156 134 156 144 161 148M147 156C155 160 165 160 173 156" />
        <path d="M148 161C150 176 170 176 172 161" />
        <path d="M121 173C88 190 69 221 62 273C84 318 117 351 160 376C203 351 236 318 258 273C251 221 232 190 199 173" />
        <path d="M85 226C111 244 209 244 235 226M98 266C126 282 194 282 222 266" />
        <path d="M111 238H209V323H111Z" />
      </g>
      <g className="deity-portrait__detail">
        <path d="M120 101V72H200V101M129 72V52H191V72" />
        <path d="M141 52C141 37 179 37 179 52M102 72H218M102 72L57 55M218 72L263 55" />
        <path d="M65 58C80 54 92 58 104 70M255 58C240 54 228 58 216 70" />
        <path d="M128 252H192M128 270H187M128 288H181M128 306H176" />
        <path d="M84 225C99 211 116 216 126 233M236 220C220 207 204 213 194 230" />
        <path d="M210 200C225 183 246 190 247 207C244 225 226 237 210 231C220 222 224 212 220 202" />
        <path d="M116 343C137 330 183 330 204 343" />
      </g>
      <g className="deity-portrait__accent">
        <path d="M135 248C148 236 172 236 185 248" />
        <circle cx="160" cy="279" r="8" />
      </g>
    </PortraitFrame>
  );
}

function WuCaishenPortrait() {
  return (
    <PortraitFrame>
      <g className="deity-portrait__soft">
        <circle cx="160" cy="115" r="80" />
        <path d="M46 291C71 270 94 272 111 292M274 291C249 270 226 272 209 292" />
        <path d="M54 341C92 321 119 328 138 355M266 341C228 321 201 328 182 355" />
      </g>
      <g className="deity-portrait__main">
        <path d="M119 97C122 71 139 59 160 59C181 59 198 71 201 97C204 132 190 160 160 174C130 160 116 132 119 97Z" />
        <path d="M130 113C140 105 148 108 155 117M165 117C172 108 180 105 190 113" />
        <path d="M129 120L153 114M167 114L191 120" />
        <path d="M160 117C154 133 155 144 162 149" />
        <path d="M139 157C151 150 169 150 181 157" />
        <path d="M144 160C146 185 153 211 160 233C167 211 174 185 176 160" />
        <path d="M118 173C83 190 62 223 55 276C80 320 115 351 160 377C205 351 240 320 265 276C258 223 237 190 202 173" />
        <path d="M78 226C111 207 209 207 242 226M90 274C124 292 196 292 230 274" />
      </g>
      <g className="deity-portrait__detail">
        <path d="M116 97C116 73 129 54 147 48H173C191 54 204 73 204 97" />
        <path d="M128 59C108 57 93 47 84 29C104 35 123 33 142 22M192 59C212 57 227 47 236 29C216 35 197 33 178 22" />
        <path d="M222 68V369M222 76C258 93 258 132 222 150M222 76C194 99 194 127 222 150M213 369H231" />
        <path d="M120 210L160 184L200 210M132 213L160 236L188 213" />
        <path d="M160 191V229M141 205H179" />
        <path d="M77 280C96 264 115 269 130 290M205 288C220 268 240 263 258 279" />
        <path d="M110 333C133 316 187 316 210 333" />
      </g>
      <g className="deity-portrait__accent">
        <path d="M129 116L153 111M167 111L191 116" />
        <path d="M160 233C152 270 153 322 160 358C167 322 168 270 160 233Z" />
      </g>
    </PortraitFrame>
  );
}

function MazuPortrait() {
  return (
    <PortraitFrame>
      <g className="deity-portrait__soft">
        <circle cx="160" cy="116" r="84" />
        <path d="M72 101C51 145 54 226 73 273M248 101C269 145 266 226 247 273" />
        <path d="M43 333C65 315 88 315 110 333C132 351 154 351 176 333C198 315 221 315 243 333C258 345 273 348 287 344" />
        <path d="M34 357C59 338 84 338 109 357C134 376 159 376 184 357C209 338 234 338 259 357" />
      </g>
      <g className="deity-portrait__main">
        <path d="M123 101C126 76 141 64 160 64C179 64 194 76 197 101C199 134 187 161 160 174C133 161 121 134 123 101Z" />
        <path d="M135 117C142 112 149 112 154 117M166 117C171 112 178 112 185 117" />
        <path d="M140 121C145 124 150 124 154 121M166 121C170 124 175 124 180 121" />
        <path d="M160 120C156 134 156 143 161 147M149 155C155 159 165 159 171 155" />
        <path d="M121 173C87 191 68 223 61 275C84 318 117 350 160 375C203 350 236 318 259 275C252 223 233 191 199 173" />
        <path d="M84 226C113 244 207 244 236 226M98 267C126 283 194 283 222 267" />
      </g>
      <g className="deity-portrait__detail">
        <path d="M116 101V66H204V101M126 66L138 43L150 61L160 25L170 61L182 43L194 66" />
        <path d="M120 68H200M126 68V96M143 68V99M160 68V102M177 68V99M194 68V96" />
        <circle cx="126" cy="100" r="3" /><circle cx="143" cy="103" r="3" /><circle cx="160" cy="106" r="3" /><circle cx="177" cy="103" r="3" /><circle cx="194" cy="100" r="3" />
        <path d="M124 208C136 195 151 197 160 211C169 197 184 195 196 208" />
        <path d="M133 211C140 230 150 242 160 250C170 242 180 230 187 211" />
        <path d="M85 284C104 271 122 275 137 294M235 284C216 271 198 275 183 294" />
        <path d="M114 327C135 314 185 314 206 327" />
      </g>
      <g className="deity-portrait__accent">
        <circle cx="160" cy="25" r="3" />
        <path d="M83 389C108 374 133 378 160 397C187 378 212 374 237 389" />
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
