import { trackToolEvent } from "@/lib/analytics";

/** A round starts at the first shuffle, or a new deal after a completed round.
 * Completion means all cards in the current selection are revealed, never AI.
 * Inspecting, turning or arranging those cards stays in the same round. */
export function createTarotRoundTracker(emit: (event: "tool_start" | "tool_success") => void = event => trackToolEvent(event, "tarot")) {
  let state: "idle" | "started" | "completed" = "idle";
  return {
    start() {
      if (state === "started") return;
      state = "started";
      emit("tool_start");
    },
    complete() {
      if (state !== "started") return;
      state = "completed";
      emit("tool_success");
    },
    reset() { state = "idle"; },
  };
}
