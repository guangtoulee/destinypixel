"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { api, mediaUrl } from "../../lib/api";
import AudioClipEditor, { framesForDuration } from "./AudioClipEditor";

type Asset = {
  id: string;
  kind: "character" | "song" | "vocal_stem";
  original_name: string;
  size_bytes: number;
  duration_seconds?: number | null;
  media_url: string;
};
type Job = { id: string; status: "queued" | "running" | "completed" | "failed"; attempts: number; progress?: { phase?: string; progress?: number; current_step?: number; total_steps?: number }; error?: string; };
type Candidate = { id: string; version: number; media_url: string; duration_seconds?: number; width?: number; height?: number; status: "generated" | "approved" | "rejected"; metadata?: { elapsed_seconds?: number; peak_gpu_memory_mib?: number; model?: string }; };
type Shot = { id: string; name: string; prompt: string; status: string; resolution: string; video_length: number; audio_start_seconds: number; audio_duration_seconds: number; inference_steps: number; seed: number; jobs: Job[]; candidates: Candidate[]; };
type Project = { id: string; name: string; description: string; assets: Asset[]; shots: Shot[]; };

const EXAMPLE_PROMPT = "A western man stands on stage under dramatic lighting, holding a microphone close to their mouth. Wearing a vibrant red jacket with gold embroidery, the singer is speaking while smoke swirls around them, creating a dynamic and atmospheric scene.";

function prettyBytes(bytes: number) { return bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`; }
function statusLabel(status: string) { return ({ draft: "待生成", queued: "排队中", generating: "GPU 生成中", ready: "待审片", approved: "已批准", failed: "失败" } as Record<string, string>)[status] || status; }

export default function ProjectStudio() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [shotName, setShotName] = useState("主舞台镜头");
  const [prompt, setPrompt] = useState(EXAMPLE_PROMPT);
  const [characterId, setCharacterId] = useState("");
  const [songId, setSongId] = useState("");
  const [stemId, setStemId] = useState("");
  const [clipStart, setClipStart] = useState(0);
  const [clipDuration, setClipDuration] = useState(15);

  const refresh = useCallback(async () => {
    try {
      const data = await api<Project>(`/api/projects/${projectId}`);
      setProject(data);
      setCharacterId((current) => current || data.assets.find((asset) => asset.kind === "character")?.id || "");
      setSongId((current) => current || data.assets.find((asset) => asset.kind === "song")?.id || "");
    } catch (err) { setError(err instanceof Error ? err.message : "无法读取项目"); }
  }, [projectId]);

  useEffect(() => { refresh(); }, [refresh]);
  const hasActiveJobs = useMemo(() => project?.shots.some((shot) => shot.jobs.some((job) => job.status === "queued" || job.status === "running")), [project]);
  const selectedAudio = useMemo(() => project?.assets.find((asset) => asset.id === (stemId || songId)), [project, songId, stemId]);
  const clipIsValid = Boolean(selectedAudio && (!selectedAudio.duration_seconds || clipStart + clipDuration <= selectedAudio.duration_seconds + 0.01));

  useEffect(() => {
    if (!hasActiveJobs) return;
    const timer = window.setInterval(refresh, 3000);
    return () => window.clearInterval(timer);
  }, [hasActiveJobs, refresh]);

  async function upload(kind: Asset["kind"], file: File) {
    setBusy(`upload-${kind}`); setError("");
    const form = new FormData(); form.append("file", file);
    try { await api(`/api/projects/${projectId}/assets?kind=${kind}`, { method: "POST", body: form }); await refresh(); }
    catch (err) { setError(err instanceof Error ? err.message : "上传失败"); }
    finally { setBusy(""); }
  }

  async function createShot(event: FormEvent) {
    event.preventDefault(); setBusy("create-shot"); setError("");
    try {
      await api(`/api/projects/${projectId}/shots`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: shotName, prompt, character_asset_id: characterId, song_asset_id: songId, vocal_stem_asset_id: stemId || null, resolution: "832x480", audio_start_seconds: clipStart, audio_duration_seconds: clipDuration, inference_steps: 8, seed: 20260824 }),
      });
      await refresh();
    } catch (err) { setError(err instanceof Error ? err.message : "镜头创建失败"); }
    finally { setBusy(""); }
  }

  async function action(path: string, key: string) {
    setBusy(key); setError("");
    try { await api(path, { method: "POST" }); await refresh(); }
    catch (err) { setError(err instanceof Error ? err.message : "操作失败"); }
    finally { setBusy(""); }
  }

  if (!project) return <main className="loadingScreen">{error || "正在连接本机创作台…"}</main>;
  const characters = project.assets.filter((asset) => asset.kind === "character");
  const songs = project.assets.filter((asset) => asset.kind === "song");
  const stems = project.assets.filter((asset) => asset.kind === "vocal_stem");

  return (
    <main className="studioShell">
      <div className="studioHeader">
        <div><Link href="/mv" className="backLink">← 作品库</Link><p className="eyebrow">PRODUCTION WORKSPACE</p><h1>{project.name}</h1><p>{project.description || "本地 GPU 表演视频制作项目"}</p></div>
        <div className="pipelineStatus"><span className={hasActiveJobs ? "liveDot pulse" : "liveDot"} />{hasActiveJobs ? "GPU 正在工作" : "GPU 待命"}</div>
      </div>
      {error && <div className="errorBanner stickyError">{error}</div>}
      <section className="workspaceGrid">
        <aside className="leftRail">
          <section className="panel assetPanel">
            <div className="panelHeading"><div><span className="stepIndex">01</span><h2>素材</h2></div></div>
            <UploadSlot id="character-upload" title="人物定妆图" hint="PNG / JPG · 正脸或半身" assets={characters} busy={busy === "upload-character"} accept="image/png,image/jpeg,image/webp" onFile={(file) => upload("character", file)} />
            <UploadSlot id="song-upload" title="歌曲 / 音频" hint="MP3 / WAV · 第一版直接使用" assets={songs} busy={busy === "upload-song"} accept="audio/mpeg,audio/wav,audio/x-wav" onFile={(file) => upload("song", file)} />
            <UploadSlot id="stem-upload" title="Vocal Stem（可选）" hint="保留字段 · 暂不执行 UVR 分离" assets={stems} busy={busy === "upload-vocal_stem"} accept="audio/mpeg,audio/wav,audio/x-wav" onFile={(file) => upload("vocal_stem", file)} />
          </section>
          <form className="panel shotForm" onSubmit={createShot}>
            <div className="panelHeading"><div><span className="stepIndex">02</span><h2>设计镜头</h2></div></div>
            <label htmlFor="shot-name">镜头名称</label><input id="shot-name" value={shotName} onChange={(event) => setShotName(event.target.value)} required />
            <label htmlFor="character-select">人物</label><select id="character-select" value={characterId} onChange={(event) => setCharacterId(event.target.value)} required><option value="">选择人物图</option>{characters.map((asset) => <option key={asset.id} value={asset.id}>{asset.original_name}</option>)}</select>
            <label htmlFor="song-select">歌曲</label><select id="song-select" value={songId} onChange={(event) => { setSongId(event.target.value); setClipStart(0); }} required><option value="">选择歌曲</option>{songs.map((asset) => <option key={asset.id} value={asset.id}>{asset.original_name}</option>)}</select>
            <label htmlFor="stem-select">Vocal Stem（可选）</label><select id="stem-select" value={stemId} onChange={(event) => { setStemId(event.target.value); setClipStart(0); }}><option value="">使用原歌曲音频</option>{stems.map((asset) => <option key={asset.id} value={asset.id}>{asset.original_name}</option>)}</select>
            <AudioClipEditor asset={selectedAudio} startSeconds={clipStart} durationSeconds={clipDuration} onStartChange={setClipStart} onDurationChange={setClipDuration} />
            <label htmlFor="shot-prompt">导演提示词</label><textarea id="shot-prompt" value={prompt} onChange={(event) => setPrompt(event.target.value)} rows={7} required />
            <div className="parameterStrip"><span><b>832×480</b> RESOLUTION</span><span><b>{framesForDuration(clipDuration)}</b> FRAMES</span><span><b>8</b> STEPS</span></div>
            <button className="primaryButton" type="submit" disabled={!characterId || !songId || !clipIsValid || busy === "create-shot"}>{busy === "create-shot" ? "正在建立…" : "加入镜头队列"}</button>
          </form>
        </aside>
        <section className="timelineColumn">
          <div className="sectionTitle"><div><span className="stepIndex">03</span><h2>镜头队列与审片</h2></div><span className="muted">{project.shots.length} SHOTS</span></div>
          {project.shots.length === 0 ? <div className="panel emptyTimeline"><span>＋</span><h3>等待第一个镜头</h3><p>上传人物图和歌曲，在左侧完成镜头设计。</p></div> : (
            <div className="shotStack">{project.shots.map((shot, index) => {
              const activeJob = shot.jobs.find((job) => job.status === "queued" || job.status === "running");
              const failedJob = shot.jobs.find((job) => job.status === "failed");
              return <article className="panel shotCard" key={shot.id}>
                <div className="shotTopline"><div className="shotNumber">{String(index + 1).padStart(2, "0")}</div><div className="shotIdentity"><h3>{shot.name}</h3><p>{shot.prompt}</p></div><span className={`statusBadge status-${shot.status}`}>{statusLabel(shot.status)}</span></div>
                <div className="shotParameters"><span>{shot.resolution}</span><span>{shot.video_length} 帧</span><span>{shot.audio_duration_seconds?.toFixed(1)} 秒</span><span>音频 {shot.audio_start_seconds?.toFixed(1)}s 起</span><span>{shot.inference_steps} 步</span><span>Seed {shot.seed}</span></div>
                {activeJob && <div className="progressBlock"><div><span>{activeJob.status === "queued" ? "等待 GPU 空闲" : activeJob.progress?.phase || "初始化模型"}</span><b>{activeJob.status === "queued" ? "QUEUED" : `STEP ${activeJob.progress?.current_step || 0}/${activeJob.progress?.total_steps || 8}`}</b></div><div className="progressTrack"><span style={{ width: `${Math.min(100, Math.max(4, Math.round((activeJob.progress?.progress || 0) <= 1 ? (activeJob.progress?.progress || 0) * 100 : (activeJob.progress?.progress || 0))))}%` }} /></div></div>}
                {failedJob && <p className="errorBanner">{failedJob.error}</p>}
                <div className="candidateGrid">{shot.candidates.map((candidate) => <div className={`candidateCard ${candidate.status === "approved" ? "candidateApproved" : ""}`} key={candidate.id}>
                  <div className="videoFrame"><video controls preload="metadata" src={mediaUrl(candidate.media_url)} aria-label={`${shot.name} 候选 ${candidate.version}`} /><span className="versionTag">V{candidate.version}</span>{candidate.status === "approved" && <span className="approvedTag">✓ 已批准</span>}</div>
                  <div className="candidateMeta"><span>{candidate.width}×{candidate.height}</span><span>{candidate.duration_seconds?.toFixed(2)}s</span><span>{candidate.metadata?.elapsed_seconds ? `${Math.round(candidate.metadata.elapsed_seconds / 60)}m` : "—"}</span><span>{candidate.metadata?.peak_gpu_memory_mib ? `${candidate.metadata.peak_gpu_memory_mib} MiB` : "VRAM —"}</span></div>
                  {candidate.status !== "approved" && <button className="approveButton" disabled={busy === `approve-${candidate.id}`} onClick={() => action(`/api/candidates/${candidate.id}/approve`, `approve-${candidate.id}`)}>批准此版本</button>}
                </div>)}</div>
                <div className="shotActions">{shot.candidates.length === 0 ? <button className="primaryButton compact" disabled={Boolean(activeJob) || busy === `generate-${shot.id}`} onClick={() => action(`/api/shots/${shot.id}/generate`, `generate-${shot.id}`)}>{activeJob ? "生成任务进行中" : "开始 GPU 生成"}</button> : <button className="secondaryButton" disabled={Boolean(activeJob) || busy === `redo-${shot.id}`} onClick={() => action(`/api/shots/${shot.id}/redo`, `redo-${shot.id}`)}>↻ 重做候选</button>}</div>
              </article>;
            })}</div>
          )}
        </section>
      </section>
    </main>
  );
}

function UploadSlot({ id, title, hint, assets, accept, busy, onFile }: { id: string; title: string; hint: string; assets: Asset[]; accept: string; busy: boolean; onFile: (file: File) => void; }) {
  return <div className="uploadSlot"><div><strong>{title}</strong><span>{hint}</span></div>{assets.map((asset) => <div className="assetFile" key={asset.id}><span>✓</span><b>{asset.original_name}</b><small>{prettyBytes(asset.size_bytes)}</small></div>)}<label className="uploadButton" htmlFor={id}>{busy ? "上传中…" : assets.length ? "+ 添加版本" : "+ 选择文件"}</label><input id={id} type="file" accept={accept} disabled={busy} onChange={(event) => { const file = event.target.files?.[0]; if (file) onFile(file); event.target.value = ""; }} /></div>;
}
