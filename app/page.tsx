"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { lastAssistantMessageIsCompleteWithApprovalResponses } from "ai";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Brain,
  Check,
  CheckCircle2,
  Coins,
  Landmark,
  Loader2,
  Send,
  ShieldQuestion,
  ShieldX,
  X,
  XCircle,
} from "lucide-react";
import { Streamdown } from "streamdown";
import "streamdown/styles.css";
import type { OraUIMessage } from "@/lib/ora/agent";
import { knowledgeBase, type KnowledgeDocument } from "@/lib/rag/documents";
import { Sidebar, type SampleApplication } from "@/app/components/sidebar";
import { DocumentModal } from "@/app/components/document-modal";

const SUGGESTIONS = [
  "What's the minimum repayment coverage for a term loan, and why does it matter more than profitability?",
  "A retail business wants a R1,500,000 term loan. Revenue R2,000,000, gross profit R700,000, operating profit R450,000, annual loan repayments R300,000. They've been trading for 3 years. Should we approve it?",
  "This applicant is a restaurant trading for 8 months - what should I be worried about?",
];

const SAMPLE_APPLICATIONS: SampleApplication[] = [
  {
    id: "kagiso",
    business: "Kagiso Retail Traders",
    blurb: "Retail · 3 yrs trading",
    prompt:
      "Kagiso Retail Traders, a retail business trading for 3 years, wants a R1,200,000 term loan. Revenue R2,000,000, gross profit R700,000, operating profit R450,000, annual loan repayments R300,000. Should we approve it?",
  },
  {
    id: "delta",
    business: "Delta Construction",
    blurb: "Construction · 5 yrs trading",
    prompt:
      "Delta Construction, a construction business trading for 5 years, wants a R1,800,000 term loan. Revenue R3,000,000, gross profit R900,000, operating profit R500,000, annual loan repayments R400,000. Should we approve it?",
  },
  {
    id: "sunrise",
    business: "Sunrise Hospitality",
    blurb: "Hospitality · 6 mo trading",
    prompt:
      "Sunrise Hospitality, a hospitality business trading for 6 months, wants a R500,000 working capital facility. Revenue R1,200,000, gross profit R650,000, operating profit R120,000, annual loan repayments R150,000. Should we approve it?",
  },
];

// Generic across every tool the agent can call, so a new tool needs no UI changes.
type GenericToolPart = {
  type: string;
  toolName?: string;
  state:
    | "input-streaming"
    | "input-available"
    | "approval-requested"
    | "output-available"
    | "output-error"
    | "output-denied";
  input?: unknown;
  output?: unknown;
  errorText?: string;
  preliminary?: boolean;
  approval?: {
    id: string;
    isAutomatic?: boolean;
    requestReason?: string;
  };
};

function isToolPart(part: { type: string }): part is GenericToolPart {
  return part.type.startsWith("tool-") || part.type === "dynamic-tool";
}

function toolLabel(part: GenericToolPart): string {
  const raw =
    part.type === "dynamic-tool" ? part.toolName ?? "tool" : part.type.slice("tool-".length);
  return raw
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (c) => c.toUpperCase());
}

function ToolCallCard({
  part,
  onApprovalResponse,
}: {
  part: GenericToolPart;
  onApprovalResponse: (id: string, approved: boolean) => void;
}) {
  const isPending = part.state === "input-streaming" || part.state === "input-available";
  const isPreliminary = part.state === "output-available" && part.preliminary === true;
  const isDone = part.state === "output-available" && !part.preliminary;
  const isError = part.state === "output-error";
  const isDenied = part.state === "output-denied";
  const isApproval = part.state === "approval-requested";

  return (
    <div className="text-xs rounded-lg border border-zinc-200 bg-zinc-100/60 px-3 py-2">
      <div className="flex items-center gap-1.5 font-medium text-black">
        {isPending && <Loader2 className="size-3.5 animate-spin text-zinc-500" />}
        {isPreliminary && <Loader2 className="size-3.5 animate-spin text-blue-500" />}
        {isDone && <CheckCircle2 className="size-3.5 text-emerald-600" />}
        {isError && <XCircle className="size-3.5 text-red-600" />}
        {isDenied && <ShieldX className="size-3.5 text-red-600" />}
        {isApproval && <ShieldQuestion className="size-3.5 text-amber-600" />}
        <span>{toolLabel(part)}</span>
      </div>

      {part.input != null && (
        <pre className="mt-1 overflow-x-auto whitespace-pre-wrap wrap-break-word text-[11px] text-zinc-700">
          {JSON.stringify(part.input, null, 2)}
        </pre>
      )}

      {(isDone || isPreliminary) && part.output != null && (
        <pre className="mt-1 overflow-x-auto whitespace-pre-wrap wrap-break-word text-[11px] text-zinc-700">
          {JSON.stringify(part.output, null, 2)}
        </pre>
      )}

      {isError && <p className="mt-1 text-red-600">{part.errorText}</p>}
      {isDenied && <p className="mt-1 text-red-600">Denied by the loan officer.</p>}

      {isApproval && part.approval && !part.approval.isAutomatic && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {part.approval.requestReason && (
            <p className="w-full text-zinc-700">{part.approval.requestReason}</p>
          )}
          <button
            onClick={() => onApprovalResponse(part.approval!.id, true)}
            className="flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-white hover:bg-emerald-700 transition-colors"
          >
            <Check className="size-3.5" /> Approve
          </button>
          <button
            onClick={() => onApprovalResponse(part.approval!.id, false)}
            className="flex items-center gap-1 rounded-full bg-red-600 px-3 py-1 text-white hover:bg-red-700 transition-colors"
          >
            <X className="size-3.5" /> Deny
          </button>
        </div>
      )}
    </div>
  );
}

type Usage = { inputTokens?: number; outputTokens?: number; totalTokens?: number };

function Pill({ icon: Icon, label }: { icon: typeof Coins; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-zinc-200 px-2 py-0.5 text-[10px] text-zinc-700">
      <Icon className="size-3" />
      {label}
    </span>
  );
}

export default function Home() {
  const { messages, sendMessage, addToolApprovalResponse, status, error } =
    useChat<OraUIMessage>({
      sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithApprovalResponses,
    });
  const [input, setInput] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<KnowledgeDocument | null>(null);

  const isBusy = status === "submitted" || status === "streaming";

  function submit(text: string) {
    if (!text.trim() || isBusy) return;
    sendMessage({ text });
    setInput("");
  }

  return (
    <div className="flex flex-col flex-1 h-full bg-white">
      <header className="flex shrink-0 items-center justify-between border-b border-zinc-200 px-6 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-zinc-900 text-white">
            <Landmark className="size-4.5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold leading-tight tracking-tight text-black">ORA</h1>
            <p className="text-xs leading-tight text-zinc-600">SME credit underwriting assistant</p>
          </div>
        </div>
        <span className="rounded-full border border-zinc-200 bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
          Prototype
        </span>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          documents={knowledgeBase}
          onSelectDocument={setSelectedDoc}
          applications={SAMPLE_APPLICATIONS}
          onSelectApplication={(app) => submit(app.prompt)}
        />

        <div className="flex flex-col flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto px-6">
            <div className="mx-auto max-w-3xl flex flex-col gap-4 py-6">
              {messages.length === 0 && (
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium text-zinc-700">Try asking:</p>
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => submit(s)}
                      className="text-left text-sm rounded-lg border border-zinc-200 px-4 py-3 text-black hover:border-zinc-400 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {messages.map((message) => {
                const usage = (message.metadata as { usage?: Usage } | undefined)?.usage;
                return (
                  <div
                    key={message.id}
                    className={
                      message.role === "user"
                        ? "self-end max-w-[85%] rounded-2xl bg-zinc-900 px-4 py-2.5 text-zinc-50"
                        : "self-start max-w-[85%] flex flex-col gap-2"
                    }
                  >
                    {message.parts.map((part, i) => {
                      if (part.type === "text") {
                        if (message.role === "user") {
                          return (
                            <p key={i} className="text-sm whitespace-pre-wrap">
                              {part.text}
                            </p>
                          );
                        }
                        return (
                          <Streamdown
                            key={i}
                            className="text-sm text-black"
                            animated
                            isAnimating={status === "streaming"}
                          >
                            {part.text}
                          </Streamdown>
                        );
                      }

                      if (part.type === "reasoning") {
                        if (!part.text) return null;
                        return (
                          <div
                            key={i}
                            className="flex items-start gap-1.5 text-xs italic text-zinc-600"
                          >
                            <Brain className="size-3.5 mt-0.5 shrink-0" />
                            <span>{part.text}</span>
                          </div>
                        );
                      }

                      if (isToolPart(part)) {
                        return (
                          <ToolCallCard
                            key={i}
                            part={part}
                            onApprovalResponse={(id, approved) =>
                              addToolApprovalResponse({ id, approved })
                            }
                          />
                        );
                      }

                      return null;
                    })}

                    {message.role === "assistant" && usage && (
                      <div className="flex flex-wrap gap-1.5">
                        {usage.inputTokens != null && (
                          <Pill icon={ArrowDown} label={`${usage.inputTokens.toLocaleString()} in`} />
                        )}
                        {usage.outputTokens != null && (
                          <Pill icon={ArrowUp} label={`${usage.outputTokens.toLocaleString()} out`} />
                        )}
                        {usage.totalTokens != null && (
                          <Pill icon={Coins} label={`${usage.totalTokens.toLocaleString()} total`} />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {isBusy && (
                <p className="self-start flex items-center gap-1.5 text-sm text-zinc-600">
                  <Loader2 className="size-3.5 animate-spin" /> ORA is thinking…
                </p>
              )}

              {error && (
                <p className="self-start flex items-center gap-1.5 text-sm text-red-600">
                  <AlertTriangle className="size-3.5" />
                  {error.message || "Something went wrong. Check your API keys in .env."}
                </p>
              )}
            </div>
          </main>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit(input);
            }}
            className="border-t border-zinc-200 px-6 py-4"
          >
            <div className="mx-auto max-w-3xl flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask ORA about an application, ratios, or policy…"
                className="flex-1 rounded-full border border-zinc-300 bg-white px-4 py-2.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-zinc-400"
                disabled={isBusy}
              />
              <button
                type="submit"
                disabled={isBusy || !input.trim()}
                className="flex items-center gap-1.5 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-zinc-50 disabled:opacity-40 transition-opacity"
              >
                <Send className="size-3.5" /> Send
              </button>
            </div>
          </form>
        </div>
      </div>

      {selectedDoc && (
        <DocumentModal doc={selectedDoc} onClose={() => setSelectedDoc(null)} />
      )}
    </div>
  );
}
