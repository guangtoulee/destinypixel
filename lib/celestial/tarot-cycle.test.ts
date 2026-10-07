import test from "node:test";
import assert from "node:assert/strict";
import { cycleDeck, initialTable, returnCard, takeCard } from "./tarot";

test("cycling sends the original top card underneath without altering dealt cards or orientations", () => {
  let state=initialTable("free");
  state.deck=state.deck.map((card,i)=>({...card,reversed:i%2===0}));
  state=takeCard(state,7,0);
  const before=structuredClone(state),dealt=state.cards;
  const next=cycleDeck(state);
  assert.deepEqual(state,before);
  assert.strictEqual(next.cards,dealt);
  assert.deepEqual(next.deck,[...before.deck.slice(1),before.deck[0]]);
  assert.equal(new Set([...next.deck,...next.cards].map(c=>c.id)).size,78);
  assert.equal(takeCard(next,0,1).cards[1].id,before.deck[1].id);
  let roundTrip=state;
  for(let i=0;i<state.deck.length;i++)roundTrip=cycleDeck(roundTrip);
  assert.deepEqual(roundTrip,state);
});
test("cycling preserves spread slots, count, replacements and safe zero/one-card behavior", () => {
  let state=initialTable("spread","three");
  state=takeCard(state,0,0);
  const cycled=cycleDeck(state),top=cycled.deck[0];
  const replaced=takeCard(cycled,0,0);
  assert.equal(replaced.cards[0].id,top.id);
  assert.equal(replaced.deck.length,77);
  assert.equal(new Set([...replaced.deck,...replaced.cards].map(c=>c.id)).size,78);
  assert.equal(returnCard(replaced,0).deck.length,78);
  for(const deck of [[],state.deck.slice(0,1)]) {
    const small={...state,deck};assert.strictEqual(cycleDeck(small),small);
  }
});
