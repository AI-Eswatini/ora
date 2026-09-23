"use client";

import { useEffect } from "react";
import { FileText, X } from "lucide-react";
import type { KnowledgeDocument } from "@/lib/rag/documents";

export function DocumentModal({
  doc,
  onClose,
}: {
  doc: KnowledgeDocument;
  onClose: () => void;
}) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const paragraphs = doc.text
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
        className="flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/20 animate-modal-in"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-primary">
              <FileText className="size-4" />
            </span>
            <h2 className="text-sm font-semibold text-foreground">{doc.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="flex flex-col gap-3 overflow-y-auto px-5 py-4">
          {paragraphs.map((p, i) => (
            <p key={i} className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
              {p}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
