import assert from "node:assert/strict";
import test from "node:test";
import { createTarotRoundTracker } from "./tarot-analytics";

test("one start and completion per selection, preserving intentional repeated deals", () => {
  const events: string[] = [];
  const round = createTarotRoundTracker(event => events.push(event));
  round.complete(); // No completion from a mounted or restored table alone.
  round.start(); round.start(); round.complete(); round.complete();
  assert.deepEqual(events, ["tool_start", "tool_success"]);
  round.start(); round.start(); round.complete();
  round.reset(); round.complete(); round.start(); round.complete();
  assert.deepEqual(events, Array(3).fill(["tool_start", "tool_success"]).flat());
});

test("resetting an unfinished round permits a fresh start without inventing a completion", () => {
  const events: string[] = [];
  const round = createTarotRoundTracker(event => events.push(event));
  round.start(); round.reset(); round.start(); round.complete();
  assert.deepEqual(events, ["tool_start", "tool_start", "tool_success"]);
});
