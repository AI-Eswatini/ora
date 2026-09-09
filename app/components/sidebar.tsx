"use client";

import { Briefcase, FileText, LayoutList } from "lucide-react";
import type { KnowledgeDocument } from "@/lib/rag/documents";

export type SampleApplication = {
  id: string;
  business: string;
  blurb: string;
  prompt: string;
};

export function Sidebar({
  documents,
  onSelectDocument,
  applications,
  onSelectApplication,
}: {
  documents: KnowledgeDocument[];
  onSelectDocument: (doc: KnowledgeDocument) => void;
  applications: SampleApplication[];
  onSelectApplication: (app: SampleApplication) => void;
}) {
  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-zinc-200 bg-zinc-50/60 overflow-y-auto">
      <div className="px-4 pt-4 pb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-500">
        <LayoutList className="size-3.5" />
        Quick actions
      </div>

      <p className="px-4 pt-2 pb-1.5 text-xs font-semibold text-zinc-700">Sample applications</p>

      <nav className="flex flex-col gap-0.5 px-2 pb-3">
        {applications.map((app) => (
          <button
            key={app.id}
            onClick={() => onSelectApplication(app)}
            className="flex items-start gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-black hover:bg-white hover:shadow-sm transition-colors"
          >
            <Briefcase className="size-4 mt-0.5 shrink-0 text-zinc-400" />
            <span className="flex flex-col">
              {app.business}
              <span className="text-xs text-zinc-500">{app.blurb}</span>
            </span>
          </button>
        ))}
      </nav>

      <div className="mx-4 border-t border-zinc-200" />

      <p className="px-4 pt-3 pb-1.5 text-xs font-semibold text-zinc-700">
        Company docs & policies
      </p>

      <nav className="flex flex-col gap-0.5 px-2 pb-4">
        {documents.map((doc) => (
          <button
            key={doc.id}
            onClick={() => onSelectDocument(doc)}
            className="flex items-start gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-black hover:bg-white hover:shadow-sm transition-colors"
          >
            <FileText className="size-4 mt-0.5 shrink-0 text-zinc-400" />
            <span>{doc.title}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
