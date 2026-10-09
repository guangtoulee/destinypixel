/** Decorative layers never intercept the card table's pointer or keyboard input. */
export function TarotScene() {
  return <div className="tarot-scene" aria-hidden="true">
    <div className="tarot-scene-landscape" />
    <div className="tarot-scene-haze tarot-scene-haze-far" />
    <div className="tarot-scene-haze tarot-scene-haze-near" />
    {["left", "right"].map(side => <div key={side} className={`tarot-scene-bough tarot-scene-bough-${side}`} />)}
    <div className="tarot-scene-motes">{Array.from({length:12},(_,i)=><i key={i} style={{left:`${8+i*7.6}%`,top:`${28+(i*17)%56}%`,animationDelay:`-${i*1.7}s`}} />)}</div>
  </div>;
}
