"use client";

import { useEffect, type ReactNode } from "react";
import { FileText, X, type LucideIcon } from "lucide-react";

// Renders plain text split into paragraphs. A paragraph starting with "## " gets
// a heading, and "- Label: value" lines render as label/value rows.
function Block({ text }: { text: string }) {
  const lines = text.split("\n");
  const heading = lines[0].startsWith("## ") ? lines.shift()!.slice(3) : null;
  const isList = lines.length > 0 && lines.every((l) => l.startsWith("- "));

  return (
    <section className="flex flex-col gap-1.5">
      {heading && (
        <h3 className="pt-1 text-xs font-semibold uppercase tracking-wide text-primary">
          {heading}
        </h3>
      )}
      {isList ? (
        <dl className="flex flex-col divide-y divide-border rounded-xl border border-border">
          {lines.map((line, i) => {
            const item = line.slice(2);
            const sep = item.indexOf(": ");
            return sep === -1 ? (
              <p key={i} className="px-3 py-2 text-sm text-foreground/90">
                {item}
              </p>
            ) : (
              <div key={i} className="grid gap-0.5 px-3 py-2 text-sm sm:grid-cols-[11rem_1fr] sm:gap-3">
                <dt className="text-muted-foreground">{item.slice(0, sep)}</dt>
                <dd className="text-foreground">{item.slice(sep + 2)}</dd>
              </div>
            );
          })}
        </dl>
      ) : (
        lines.length > 0 && (
          <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
            {lines.join("\n")}
          </p>
        )
      )}
    </section>
  );
}

export function DocumentModal({
  title,
  subtitle,
  text,
  icon: Icon = FileText,
  footer,
  onClose,
}: {
  title: string;
  subtitle?: string;
  text: string;
  icon?: LucideIcon;
  footer?: ReactNode;
  onClose: () => void;
}) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const paragraphs = text
    .split("\n\n")
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 animate-overlay-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/20 animate-modal-in"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-primary">
              <Icon className="size-4" />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-foreground">{title}</h2>
              {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="flex flex-col gap-4 overflow-y-auto px-5 py-4">
          {paragraphs.map((p, i) => (
            <Block key={i} text={p} />
          ))}
        </div>
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
