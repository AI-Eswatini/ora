"use client";

import { Briefcase, FileText, Plus, X } from "lucide-react";
import type { KnowledgeDocument } from "@/lib/rag/documents";
import type { SampleApplication } from "@/lib/ora/sample-applications";

export function Sidebar({
  documents,
  onSelectDocument,
  applications,
  onSelectApplication,
  selectedAppId,
  selectedDocId,
  onNewChat,
  open,
  onClose,
}: {
  documents: KnowledgeDocument[];
  onSelectDocument: (doc: KnowledgeDocument) => void;
  applications: SampleApplication[];
  onSelectApplication: (app: SampleApplication) => void;
  selectedAppId?: string | null;
  selectedDocId?: string | null;
  onNewChat: () => void;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] animate-overlay-in md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`${open ? "flex animate-drawer-in" : "hidden"} fixed inset-y-0 left-0 z-50 w-72 shrink-0 flex-col overflow-y-auto border-r border-border bg-surface md:static md:z-auto md:flex md:animate-none`}
      >
        <div className="flex shrink-0 items-center justify-between px-4 pt-4 pb-1 md:hidden">
          <span className="text-sm font-semibold text-foreground">Menu</span>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="px-3 pt-4">
          <button
            onClick={onNewChat}
            className="flex w-full items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 text-sm font-medium text-foreground shadow-sm hover:border-primary/40 hover:text-primary hover:shadow transition-all"
          >
            <Plus className="size-4" />
            New chat
          </button>
        </div>

        <p className="px-4 pt-5 pb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Sample applications
        </p>

        <nav className="flex flex-col gap-1 px-2 pb-3">
          {applications.map((app) => {
            const isSelected = app.id === selectedAppId;
            return (
              <button
                key={app.id}
                onClick={() => onSelectApplication(app)}
                className={`group flex items-center gap-2.5 rounded-xl px-2 py-2 text-left text-sm transition-colors ${
                  isSelected
                    ? "bg-accent-soft text-primary ring-1 ring-primary/20"
                    : "text-foreground hover:bg-card hover:shadow-sm"
                }`}
              >
                <span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full transition-colors ${
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground group-hover:bg-accent-soft group-hover:text-primary"
                  }`}
                >
                  <Briefcase className="size-4" />
                </span>
                <span className="flex flex-col overflow-hidden">
                  <span className="truncate font-medium">{app.business}</span>
                  <span className="truncate text-xs text-muted-foreground">{app.blurb}</span>
                </span>
              </button>
            );
          })}
        </nav>

        <div className="mx-4 border-t border-border" />

        <p className="px-4 pt-4 pb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Company docs &amp; policies
        </p>

        <nav className="flex flex-col gap-1 px-2 pb-4">
          {documents.map((doc) => {
            const isSelected = doc.id === selectedDocId;
            return (
              <button
                key={doc.id}
                onClick={() => onSelectDocument(doc)}
                className={`group flex items-center gap-2.5 rounded-xl px-2 py-2 text-left text-sm transition-colors ${
                  isSelected
                    ? "bg-accent-soft text-primary ring-1 ring-primary/20"
                    : "text-foreground hover:bg-card hover:shadow-sm"
                }`}
              >
                <span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full transition-colors ${
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground group-hover:bg-accent-soft group-hover:text-primary"
                  }`}
                >
                  <FileText className="size-4" />
                </span>
                <span className="truncate font-medium">{doc.title}</span>
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
