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
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "framer-motion";
import * as THREE from "three";
import { DestinyCanvas } from "@/app/xingpan/components/DestinyCanvas";
import {
  sampleBirth,
  sampleDestinyProfile,
} from "@/app/xingpan/data/destiny-profile";
import type {
  DestinyCycle,
  DestinyProfile,
  ScenePhase,
} from "@/app/xingpan/types";
import type { DestinyChart } from "@/lib/destinyCalculator";
import { UltraBirthConsole } from "./UltraBirthConsole";
import { UltraDestinyHud } from "./UltraDestinyHud";
import { UltraSystemChrome } from "./UltraSystemChrome";
import type {
  OracleErrorResponse,
  OracleRequest,
  OracleRequestState,
  OracleResponse,
} from "../types";

type ExperienceStyle = CSSProperties & {
  "--xp-blue": string;
  "--xp-gold": string;
  "--xp-ember": string;
  "--xp-void": string;
};

const initialBirth: OracleRequest = {
  ...sampleBirth,
  birthplace: "shanghai-cn",
  gender: "male",
};

const initialMeta: OracleResponse["meta"] = {
  oracleSource: "local-fallback",
  model: "awaiting-oracle",
  generatedAt: "",
  degraded: false,
  privacy: "chart-only",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isOracleResponse(value: unknown): value is OracleResponse {
  if (!isRecord(value) || !isRecord(value.profile) || !isRecord(value.chart)) return false;

  return (
    typeof value.activeCycleId === "string" &&
    typeof value.overview === "string" &&
    Array.isArray(value.profile.cycles) &&
    value.profile.cycles.length > 0 &&
    isRecord(value.meta)
  );
}

function bindChartCoordinates(profile: DestinyProfile, chart: DestinyChart): DestinyProfile {
  const timelineByCycle = new Map(
    chart.coordinates.timeline.map((coordinate) => [coordinate.cycleId, coordinate]),
  );
  const annualByCycle = new Map<string, DestinyCycle["annualCoordinates"]>();

  chart.coordinates.annual.forEach(({ cycleId, ...coordinate }) => {
    const current = annualByCycle.get(cycleId) ?? [];
    current.push(coordinate);
    annualByCycle.set(cycleId, current);
  });

  return {
    ...profile,
    cycles: profile.cycles.map((cycle) => {
      const timeline = timelineByCycle.get(cycle.id);
      return {
        ...cycle,
        position: timeline?.position ?? cycle.position,
        zodiacAngle: timeline?.zodiacAngle ?? cycle.zodiacAngle,
        annualCoordinates: annualByCycle.get(cycle.id) ?? [],
      };
    }),
  };
}

export default function UltraExperience() {
  const [phase, setPhase] = useState<ScenePhase>("void");
  const [birth, setBirth] = useState<OracleRequest>(initialBirth);
  const [profile, setProfile] = useState<DestinyProfile>(sampleDestinyProfile);
  const [chart, setChart] = useState<DestinyChart | null>(null);
  const [overview, setOverview] = useState("等待真实时间完成第一次呼吸。");
  const [meta, setMeta] = useState<OracleResponse["meta"]>(initialMeta);
  const [requestState, setRequestState] = useState<OracleRequestState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [selectedCycleId, setSelectedCycleId] = useState(sampleDestinyProfile.cycles[2].id);
  const [compact, setCompact] = useState(false);
  const [booted, setBooted] = useState(false);
  const pointer = useRef(new THREE.Vector2());
  const transition = useRef(0);
  const abortController = useRef<AbortController | null>(null);
  const prefersReducedMotion = Boolean(useReducedMotion());

  useEffect(() => {
    const media = window.matchMedia("(max-width: 760px), (pointer: coarse)");
    const update = () => setCompact(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setBooted(true), 760);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => () => abortController.current?.abort(), []);

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

  const handleGenerate = useCallback(async () => {
    if (requestState === "calculating" || abortController.current) return;

    const controller = new AbortController();
    abortController.current = controller;
    setRequestState("calculating");
    setError(null);
    let timedOut = false;
    const timeout = window.setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 55_000);

    try {
      const response = await fetch("/api/oracle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(birth),
        cache: "no-store",
        signal: controller.signal,
      });
      const payload = await response.json().catch(() => null) as
        | OracleResponse
        | OracleErrorResponse
        | null;

      if (!response.ok) {
        throw new Error(
          payload && "error" in payload
            ? payload.error
            : "命运信号没有返回，请稍后重试。",
        );
      }

      if (!isOracleResponse(payload)) {
        throw new Error("命运数据结构不完整，请重新生成。");
      }

      const boundProfile = bindChartCoordinates(payload.profile, payload.chart);
      const activeCycle = boundProfile.cycles.find(
        (cycle) => cycle.id === payload.activeCycleId,
      ) ?? boundProfile.cycles[0];

      if (!activeCycle) {
        throw new Error("没有生成可用的时间节点。");
      }

      setProfile(boundProfile);
      setChart(payload.chart);
      setOverview(payload.overview);
      setMeta(payload.meta);
      setSelectedCycleId(activeCycle.id);
      transition.current = 0;
      setRequestState("ready");
      setPhase("warp");
    } catch (requestError) {
      if (controller.signal.aborted) {
        if (timedOut) {
          setRequestState("error");
          setError("节点意识连接超时。真实命盘没有丢失，请重新唤醒中枢。");
        }
        return;
      }

      setRequestState("error");
      setError(
        requestError instanceof Error
          ? requestError.message
          : "命运信号暂时中断，请稍后重试。",
      );
    } finally {
      window.clearTimeout(timeout);
      if (abortController.current === controller) abortController.current = null;
    }
  }, [birth, requestState]);

  const handleCancel = useCallback(() => {
    const controller = abortController.current;
    abortController.current = null;
    controller?.abort();
    setRequestState("idle");
    setError(null);
  }, []);

  const handleCoreEntered = useCallback(() => {
    setPhase("core");
  }, []);

  const handleSelectCycle = useCallback((cycle: DestinyCycle) => {
    setSelectedCycleId(cycle.id);
  }, []);

  const handleReset = useCallback(() => {
    abortController.current?.abort();
    abortController.current = null;
    transition.current = 0;
    pointer.current.set(0, 0);
    setChart(null);
    setError(null);
    setRequestState("idle");
    setPhase("void");
  }, []);

  const style: ExperienceStyle = {
    "--xp-blue": profile.palette.blue,
    "--xp-gold": profile.palette.gold,
    "--xp-ember": profile.palette.ember,
    "--xp-void": profile.palette.void,
  };

  return (
    <MotionConfig reducedMotion="user">
      <main
        className={`xp-experience ultra-experience xp-phase-${phase} ultra-request-${requestState}`}
        style={style}
        onPointerMove={handlePointerMove}
        onPointerLeave={() => pointer.current.set(0, 0)}
      >
        <div className="xp-noise" aria-hidden="true" />
        <div className="ultra-scanline" aria-hidden="true" />
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

        <UltraSystemChrome phase={phase} requestState={requestState} chart={chart} />

        <div className="xp-ui-layer">
          <AnimatePresence mode="sync">
          {phase === "void" ? (
            <UltraBirthConsole
              key="ultra-birth-console"
              value={birth}
              state={requestState}
              error={error}
              onChange={setBirth}
              onSubmit={handleGenerate}
              onCancel={handleCancel}
            />
          ) : null}

          {phase === "warp" ? (
            <motion.section
              key="ultra-warp-copy"
              className="xp-warp-copy ultra-warp-copy"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: [0, 1, 1, 0], scale: [0.94, 1, 1.02, 1.06] }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              transition={{ duration: prefersReducedMotion ? 0.2 : 2.8, times: [0, 0.18, 0.72, 1] }}
            >
              <small>REAL CHART LOCKED / AI SOUL ATTACHED</small>
              <h1>穿过算法的<br />事件视界</h1>
              <div><i /><i /><i /><i /></div>
              <p>四柱真时 × 大运坐标 × 节点意识</p>
            </motion.section>
          ) : null}

          {phase === "core" && chart ? (
            <UltraDestinyHud
              key="ultra-destiny-hud"
              profile={profile}
              chart={chart}
              cycle={selectedCycle}
              overview={overview}
              meta={meta}
              onSelect={handleSelectCycle}
              onReset={handleReset}
            />
          ) : null}
          </AnimatePresence>
        </div>

        <p className="xp-sr-only" aria-live="polite">
        {phase === "void" && requestState === "idle" && "等待输入出生信息。"}
        {requestState === "calculating" && "正在进行真太阳时、四柱、大运与人工智能节点解析。"}
        {requestState === "error" && error}
        {phase === "warp" && "真实命盘已生成，正在进入命运中枢。"}
        {phase === "core" && `命运中枢已生成，当前节点：${selectedCycle.label}。`}
        </p>

        <AnimatePresence>
        {!booted ? (
          <motion.div
            className="xp-boot-screen ultra-boot-screen"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55 }}
          >
            <div><i /><i /><i /></div>
            <span>INITIALIZING ULTRA CONSCIOUSNESS</span>
          </motion.div>
        ) : null}
        </AnimatePresence>
      </main>
    </MotionConfig>
  );
}
