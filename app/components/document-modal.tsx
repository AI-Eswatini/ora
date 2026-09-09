"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[80vh] w-full max-w-2xl flex-col rounded-2xl border border-zinc-200 bg-white shadow-xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-zinc-200 px-5 py-4">
          <h2 className="text-sm font-semibold text-black">{doc.title}</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-zinc-600 hover:bg-zinc-100 hover:text-black transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="flex flex-col gap-3 overflow-y-auto px-5 py-4">
          {paragraphs.map((p, i) => (
            <p key={i} className="text-sm leading-relaxed text-black whitespace-pre-wrap">
              {p}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
