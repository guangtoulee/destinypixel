"use client";

import { AlertCircle, Inbox, LoaderCircle, X } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { initials, tx, type SalesLanguage } from "./client";

export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <span className="xs-spinner" role="status" aria-label={label}>
      <LoaderCircle size={18} />
    </span>
  );
}

export function Avatar({ name, size = "medium" }: { name: string; size?: "small" | "medium" | "large" }) {
  return <span className={`xs-avatar xs-avatar-${size}`}>{initials(name)}</span>;
}

export function StatusPill({ status, children }: { status: string; children: ReactNode }) {
  return <span className={`xs-status xs-status-${status}`}>{children}</span>;
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="xs-error-banner" role="alert">
      <AlertCircle size={18} />
      <span>{message}</span>
    </div>
  );
}

export function EmptyState({
  language,
  title,
  copy,
  action,
}: {
  language: SalesLanguage;
  title?: string;
  copy?: string;
  action?: ReactNode;
}) {
  return (
    <div className="xs-empty-state">
      <span className="xs-empty-icon"><Inbox size={28} /></span>
      <h3>{title ?? tx(language, "暂无数据", "Nothing here yet")}</h3>
      {copy ? <p>{copy}</p> : null}
      {action}
    </div>
  );
}

export function Modal({
  title,
  eyebrow,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  eyebrow?: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return (
    <div className="xs-modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className={`xs-modal ${wide ? "xs-modal-wide" : ""}`} role="dialog" aria-modal="true" aria-label={title}>
        <header className="xs-modal-head">
          <div>
            {eyebrow ? <p>{eyebrow}</p> : null}
            <h2>{title}</h2>
          </div>
          <button className="xs-icon-button" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </header>
        <div className="xs-modal-body">{children}</div>
      </section>
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  copy,
  action,
}: {
  eyebrow: string;
  title: string;
  copy?: string;
  action?: ReactNode;
}) {
  return (
    <header className="xs-page-header">
      <div>
        <p className="xs-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {copy ? <p className="xs-page-copy">{copy}</p> : null}
      </div>
      {action ? <div className="xs-page-action">{action}</div> : null}
    </header>
  );
}
