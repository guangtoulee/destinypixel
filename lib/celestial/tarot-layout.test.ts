import test from "node:test";
import assert from "node:assert/strict";
import { constrainCard, freeCardWidth } from "./tarot-layout";

test("all 24 rotation steps keep every corner and selection margin inside the table", () => {
  for (const bounds of [{width:1100,height:400},{width:288,height:160},{width:350,height:370},{width:760,height:100}]) {
    const width=freeCardWidth(bounds), height=width*1.72;
    for (let rotation=0;rotation<360;rotation+=15) for (const x of [-50,0,50,100,150]) for (const y of [-50,0,50,100,150]) {
      const position=constrainCard(x,y,rotation,bounds);
      const angle=rotation*Math.PI/180;
      for(const dx of [-width/2,width/2]) for(const dy of [-height/2,height/2]) {
        const px=position.x/100*bounds.width+width/2+dx*Math.cos(angle)-dy*Math.sin(angle);
        const py=position.y/100*bounds.height+height/2+dx*Math.sin(angle)+dy*Math.cos(angle);
        assert.ok(px>=7.99 && px<=bounds.width-7.99,`${rotation}: x ${px}`);
        assert.ok(py>=7.99 && py<=bounds.height-7.99,`${rotation}: y ${py}`);
      }
    }
  }
});
