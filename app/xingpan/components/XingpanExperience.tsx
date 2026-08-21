"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import * as THREE from "three";
import {
  createDestinyProfile,
  sampleBirth,
  sampleDestinyProfile,
} from "../data/destiny-profile";
import type { BirthInput, DestinyCycle, DestinyProfile, ScenePhase } from "../types";
import { DestinyCanvas } from "./DestinyCanvas";
import { BirthConsole } from "./ui/BirthConsole";
import { DestinyHud } from "./ui/DestinyHud";
import { SystemChrome } from "./ui/SystemChrome";

type ExperienceStyle = CSSProperties & {
  "--xp-blue": string;
  "--xp-gold": string;
  "--xp-ember": string;
  "--xp-void": string;
};

export default function XingpanExperience() {
  const [phase, setPhase] = useState<ScenePhase>("void");
  const [birth, setBirth] = useState<BirthInput>(sampleBirth);
  const [profile, setProfile] = useState<DestinyProfile>(sampleDestinyProfile);
  const [selectedCycleId, setSelectedCycleId] = useState(sampleDestinyProfile.cycles[2].id);
  const [compact, setCompact] = useState(false);
  const [booted, setBooted] = useState(false);
  const pointer = useRef(new THREE.Vector2());
  const transition = useRef(0);
  const prefersReducedMotion = Boolean(useReducedMotion());

  useEffect(() => {
    const media = window.matchMedia("(max-width: 760px), (pointer: coarse)");
    const update = () => setCompact(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setBooted(true), 680);
    return () => window.clearTimeout(timer);
  }, []);

  const selectedCycle = useMemo(
    () => profile.cycles.find((cycle) => cycle.id === selectedCycleId) ?? profile.cycles[0],
    [profile, selectedCycleId],
  );

  const handlePointerMove = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    pointer.current.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -(((event.clientY - rect.top) / rect.height) * 2 - 1),
    );
  }, []);

  const handleGenerate = useCallback(() => {
    const nextProfile = createDestinyProfile(birth);
    setProfile(nextProfile);
    setSelectedCycleId(nextProfile.cycles[2].id);
    transition.current = 0;
    setPhase("warp");
  }, [birth]);

  const handleCoreEntered = useCallback(() => {
    setPhase("core");
  }, []);

  const handleSelectCycle = useCallback((cycle: DestinyCycle) => {
    setSelectedCycleId(cycle.id);
  }, []);

  const handleReset = useCallback(() => {
    transition.current = 0;
    pointer.current.set(0, 0);
    setPhase("void");
  }, []);

  const style: ExperienceStyle = {
    "--xp-blue": profile.palette.blue,
    "--xp-gold": profile.palette.gold,
    "--xp-ember": profile.palette.ember,
    "--xp-void": profile.palette.void,
  };

  return (
    <main
      className={`xp-experience xp-phase-${phase}`}
      style={style}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => pointer.current.set(0, 0)}
    >
      <div className="xp-noise" aria-hidden="true" />
      <DestinyCanvas
        phase={phase}
        profile={profile}
        pointer={pointer}
        transition={transition}
        selectedCycleId={selectedCycleId}
        onSelectCycle={handleSelectCycle}
        onCoreEntered={handleCoreEntered}
        compact={compact}
        reducedMotion={prefersReducedMotion}
      />

      <SystemChrome phase={phase} />

      <div className="xp-ui-layer">
        <AnimatePresence mode="sync">
          {phase === "void" ? (
            <BirthConsole
              key="birth-console"
              value={birth}
              onChange={setBirth}
              onSubmit={handleGenerate}
            />
          ) : null}

          {phase === "warp" ? (
            <motion.section
              key="warp-copy"
              className="xp-warp-copy"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: [0, 1, 1, 0], scale: [0.94, 1, 1.02, 1.06] }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              transition={{ duration: prefersReducedMotion ? 0.2 : 2.8, times: [0, 0.18, 0.72, 1] }}
            >
              <small>DISASSEMBLING LINEAR TIME</small>
              <h1>穿过时间的<br />事件视界</h1>
              <div><i /><i /><i /><i /></div>
              <p>八字坐标 × 星盘相位 × 生命周期</p>
            </motion.section>
          ) : null}

          {phase === "core" ? (
            <DestinyHud
              key="destiny-hud"
              profile={profile}
              cycle={selectedCycle}
              onSelect={handleSelectCycle}
              onReset={handleReset}
            />
          ) : null}
        </AnimatePresence>
      </div>

      <p className="xp-sr-only" aria-live="polite">
        {phase === "void" && "等待输入出生信息。"}
        {phase === "warp" && "正在生成命运可视化。"}
        {phase === "core" && `命运中枢已生成，当前节点：${selectedCycle.label}。`}
      </p>

      <AnimatePresence>
        {!booted ? (
          <motion.div
            className="xp-boot-screen"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55 }}
          >
            <div><i /><i /><i /></div>
            <span>INITIALIZING DESTINY FIELD</span>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}
