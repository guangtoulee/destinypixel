"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, isRemoteStudio, loginStudio } from "./lib/api";

type Project = {
  id: string;
  name: string;
  description: string;
  shot_count: number;
  candidate_count: number;
  updated_at: string;
};

export default function MvHome() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [authRequired, setAuthRequired] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [remote, setRemote] = useState(false);

  useEffect(() => {
    setRemote(isRemoteStudio());
    api<Project[]>("/api/projects")
      .then(setProjects)
      .catch((err) => {
        if (err.message === "REMOTE_AUTH_REQUIRED") setAuthRequired(true);
        else setError(err.message);
      });
  }, []);

  async function login(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await loginStudio(accessCode);
      const data = await api<Project[]>("/api/projects");
      setProjects(data);
      setAuthRequired(false);
      setAccessCode("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败");
    } finally {
      setBusy(false);
    }
  }

  async function createProject(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const project = await api<Project>("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      router.push(`/mv/projects/${project.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "创建失败");
      setBusy(false);
    }
  }

  return (
    <main className="homeShell">
      <section className="hero">
        <div>
          <p className="eyebrow">ALL-IN-ONE CREATIVE WORKSTATION</p>
          <h1>把一首歌，变成一场演出。</h1>
          <p className="heroCopy">
            从人物定妆、歌曲剪辑与镜头设计，到 LongCat Avatar 1.5 本地生成、
            候选审片与批准，全部由这台 RTX 4090 完成。
          </p>
        </div>
        <div className="heroStats">
          <div><span>Provider</span><strong>Local WanGP</strong></div>
          <div><span>Queue</span><strong>1× GPU</strong></div>
          <div><span>Storage</span><strong>{remote ? "Secure R2" : "Local only"}</strong></div>
        </div>
      </section>

      <section className="nodeNotice">
        <span className="liveDot" />
        <div><strong>{remote ? "4090 安全中继模式" : "本地 GPU 安全模式"}</strong><p>{remote ? "网页通过 Cloudflare 加密中继下发任务，4090 不开放入站端口。" : "模型、歌曲、视频与数据库保存在这台 4090 电脑。"}</p></div>
      </section>

      {authRequired ? (
        <section className="homeGrid authGrid">
          <form className="panel createPanel authPanel" onSubmit={login}>
            <div className="panelHeading">
              <div><span className="stepIndex">🔒</span><h2>进入远程创作台</h2></div>
              <span className="muted">PRIVATE ACCESS</span>
            </div>
            <p className="authCopy">输入这台 4090 电脑保存的访问口令。无需微软、GitHub 或 Cloudflare 账号。</p>
            <label htmlFor="access-code">访问口令</label>
            <input id="access-code" type="password" autoComplete="current-password" value={accessCode} onChange={(event) => setAccessCode(event.target.value)} required />
            {error && <p className="errorBanner">{error}</p>}
            <button className="primaryButton" disabled={busy} type="submit">{busy ? "正在验证…" : "安全登录 →"}</button>
          </form>
        </section>
      ) : (
      <section className="homeGrid">
        <form className="panel createPanel" onSubmit={createProject}>
          <div className="panelHeading">
            <div><span className="stepIndex">01</span><h2>新建作品</h2></div>
            <span className="muted">PROJECT BRIEF</span>
          </div>
          <label htmlFor="project-name">项目名称</label>
          <input id="project-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="例如：Neon Stage Session" required maxLength={100} />
          <label htmlFor="project-description">创作说明</label>
          <textarea id="project-description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="舞台风格、角色气质、镜头方向……" rows={5} />
          {error && <p className="errorBanner">{error}</p>}
          <button className="primaryButton" disabled={busy} type="submit">{busy ? "正在创建…" : "进入创作台 →"}</button>
        </form>

        <section className="panel libraryPanel">
          <div className="panelHeading">
            <div><span className="stepIndex">02</span><h2>作品库</h2></div>
            <span className="muted">{projects.length} PROJECTS</span>
          </div>
          {projects.length === 0 ? (
            <div className="emptyState"><span>◇</span><strong>等待本地作品</strong><p>启动 GPU 节点后，这里会显示 SQLite 中的项目。</p></div>
          ) : (
            <div className="projectList">
              {projects.map((project) => (
                <Link className="projectRow" href={`/mv/projects/${project.id}`} key={project.id}>
                  <div><strong>{project.name}</strong><p>{project.description || "未填写创作说明"}</p></div>
                  <div className="projectMeta"><span>{project.shot_count} 镜头</span><span>{project.candidate_count} 候选</span><b>→</b></div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </section>
      )}
    </main>
  );
}
