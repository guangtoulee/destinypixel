"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { mediaUrl } from "../../lib/api";

export type ClipAudioAsset = {
  id: string;
  original_name: string;
  duration_seconds?: number | null;
  media_url: string;
};

function clock(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00.0";
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${(seconds % 60).toFixed(1).padStart(4, "0")}`;
}

export function framesForDuration(seconds: number) {
  const requested = Math.ceil(seconds * 25);
  return Math.ceil(Math.max(0, requested - 1) / 4) * 4 + 1;
}

export function estimateWindows(seconds: number) {
  const frames = framesForDuration(seconds);
  return frames <= 93 ? 1 : 1 + Math.ceil((frames - 93) / 80);
}

export default function AudioClipEditor({ asset, startSeconds, durationSeconds, onStartChange, onDurationChange }: {
  asset?: ClipAudioAsset;
  startSeconds: number;
  durationSeconds: number;
  onStartChange: (value: number) => void;
  onDurationChange: (value: number) => void;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [waveform, setWaveform] = useState<number[]>([]);
  const [previewing, setPreviewing] = useState(false);
  const total = asset?.duration_seconds || 0;
  const maxStart = Math.max(0, total - durationSeconds);
  const endSeconds = Math.min(total || startSeconds + durationSeconds, startSeconds + durationSeconds);
  const windows = estimateWindows(durationSeconds);

  useEffect(() => {
    if (startSeconds > maxStart && total > 0) onStartChange(Number(maxStart.toFixed(1)));
  }, [maxStart, onStartChange, startSeconds, total]);

  useEffect(() => {
    let cancelled = false;
    setWaveform([]);
    if (!asset) return;
    const buildWaveform = async () => {
      const response = await fetch(mediaUrl(asset.media_url));
      const buffer = await response.arrayBuffer();
      const Context = window.AudioContext || window.webkitAudioContext;
      const context = new Context();
      try {
        const decoded = await context.decodeAudioData(buffer.slice(0));
        const samples = decoded.getChannelData(0);
        const bars = 120;
        const block = Math.max(1, Math.floor(samples.length / bars));
        const values = Array.from({ length: bars }, (_, index) => {
          let sum = 0;
          const begin = index * block;
          const finish = Math.min(samples.length, begin + block);
          for (let cursor = begin; cursor < finish; cursor += 8) sum += Math.abs(samples[cursor]);
          return sum / Math.max(1, Math.ceil((finish - begin) / 8));
        });
        const peak = Math.max(...values, 0.001);
        if (!cancelled) setWaveform(values.map((value) => Math.max(0.08, value / peak)));
      } finally {
        await context.close();
      }
    };
    buildWaveform().catch(() => {
      if (!cancelled) setWaveform(Array.from({ length: 120 }, (_, index) => 0.2 + ((index * 37) % 60) / 100));
    });
    return () => { cancelled = true; };
  }, [asset?.id, asset?.media_url]);

  const selectedRatio = useMemo(() => ({ start: total ? startSeconds / total : 0, end: total ? endSeconds / total : 0 }), [endSeconds, startSeconds, total]);

  async function togglePreview() {
    const audio = audioRef.current;
    if (!audio) return;
    if (previewing) { audio.pause(); setPreviewing(false); return; }
    audio.currentTime = startSeconds;
    await audio.play();
    setPreviewing(true);
  }

  function chooseFromWaveform(event: React.MouseEvent<HTMLButtonElement>) {
    if (!total) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const selectedTime = ((event.clientX - bounds.left) / bounds.width) * total;
    onStartChange(Number(Math.min(maxStart, Math.max(0, selectedTime)).toFixed(1)));
  }

  if (!asset) return <div className="clipEditor clipEditorEmpty">选择歌曲后即可剪辑演唱片段</div>;

  return (
    <section className="clipEditor" aria-label="歌曲片段剪辑">
      <div className="clipHeader"><div><span>AUDIO CUT</span><strong>{asset.original_name}</strong></div><b>{total ? clock(total) : "正在读取时长…"}</b></div>
      <audio ref={audioRef} controls preload="metadata" src={mediaUrl(asset.media_url)} onPause={() => setPreviewing(false)} onEnded={() => setPreviewing(false)} onTimeUpdate={(event) => {
        if (previewing && event.currentTarget.currentTime >= startSeconds + durationSeconds) {
          event.currentTarget.pause(); event.currentTarget.currentTime = startSeconds;
        }
      }} />
      <button className="waveform" type="button" aria-label="点击波形选择片段起点" onClick={chooseFromWaveform}>
        {waveform.length === 0 ? <span className="waveLoading">正在分析波形…</span> : waveform.map((height, index) => {
          const ratio = index / waveform.length;
          return <i className={ratio >= selectedRatio.start && ratio <= selectedRatio.end ? "selected" : ""} key={index} style={{ height: `${Math.round(height * 90)}%` }} />;
        })}
      </button>
      <div className="clipRangeLabels"><span>整歌 0:00</span><strong>{clock(startSeconds)} → {clock(startSeconds + durationSeconds)}</strong><span>{clock(total)}</span></div>
      <label htmlFor="clip-start">片段起点</label>
      <div className="rangeRow">
        <input id="clip-start" type="range" min={0} max={maxStart || 0} step={0.1} value={Math.min(startSeconds, maxStart)} onChange={(event) => onStartChange(Number(event.target.value))} />
        <input aria-label="片段起点秒数" className="timeInput" type="number" min={0} max={maxStart || 0} step={0.1} value={startSeconds} onChange={(event) => onStartChange(Math.min(maxStart, Math.max(0, Number(event.target.value))))} />
        <span>秒</span>
      </div>
      <div className="clipControls">
        <div><label htmlFor="clip-duration">生成时长</label><select id="clip-duration" value={durationSeconds} onChange={(event) => onDurationChange(Number(event.target.value))}>{[15, 20, 30, 45, 60].map((seconds) => <option disabled={Boolean(total && seconds > total)} key={seconds} value={seconds}>{seconds} 秒</option>)}</select></div>
        <button className="previewButton" type="button" disabled={!total} onClick={togglePreview}>{previewing ? "Ⅱ 停止试听" : "▶ 试听所选片段"}</button>
      </div>
      <div className="clipEstimate"><span>{framesForDuration(durationSeconds)} 帧 · {windows} 个连续窗口</span><strong>预计 GPU {windows * 5}–{windows * 7} 分钟</strong></div>
    </section>
  );
}

declare global { interface Window { webkitAudioContext: typeof AudioContext; } }
