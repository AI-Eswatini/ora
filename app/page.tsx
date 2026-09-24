"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { lastAssistantMessageIsCompleteWithApprovalResponses } from "ai";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Brain,
  Briefcase,
  Check,
  CheckCircle2,
  ChevronDown,
  Coins,
  Landmark,
  Loader2,
  Menu,
  Send,
  ShieldQuestion,
  ShieldX,
  Sparkles,
  X,
  XCircle,
} from "lucide-react";
import { Streamdown } from "streamdown";
import "streamdown/styles.css";
import type { OraUIMessage } from "@/lib/ora/agent";
import { sampleApplications, type SampleApplication } from "@/lib/ora/sample-applications";
import { knowledgeBase, samplePrompts, type KnowledgeDocument } from "@/lib/rag/documents";
import { Sidebar } from "@/app/components/sidebar";
import { DocumentModal } from "@/app/components/document-modal";

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
  const [collapsed, setCollapsed] = useState(false);

  const isPending = part.state === "input-streaming" || part.state === "input-available";
  const isPreliminary = part.state === "output-available" && part.preliminary === true;
  const isDone = part.state === "output-available" && !part.preliminary;
  const isError = part.state === "output-error";
  const isDenied = part.state === "output-denied";
  const isApproval = part.state === "approval-requested";

  const hasDetails =
    part.input != null || ((isDone || isPreliminary) && part.output != null) || isError || isDenied;

  const tone = isError || isDenied
    ? "border-red-300 bg-red-50 shadow-red-900/5"
    : isApproval
      ? "border-amber-300 bg-amber-50 shadow-amber-900/5"
      : isPending || isPreliminary
        ? "border-blue-300 bg-blue-50 shadow-blue-900/5"
        : "border-border bg-muted/60";

  const codeBlock =
    "mt-2 overflow-x-auto whitespace-pre-wrap wrap-break-word rounded-md border border-black/10 bg-white p-2 text-[11px] font-medium text-black";

  return (
    <div className={`w-full rounded-xl border px-3 py-2.5 text-xs shadow-sm ${tone}`}>
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        disabled={!hasDetails}
        className="flex w-full items-center gap-1.5 font-medium text-foreground disabled:cursor-default"
      >
        {isPending && <Loader2 className="size-3.5 animate-spin text-blue-500" />}
        {isPreliminary && <Loader2 className="size-3.5 animate-spin text-blue-500" />}
        {isDone && <CheckCircle2 className="size-3.5 text-primary" />}
        {isError && <XCircle className="size-3.5 text-red-600" />}
        {isDenied && <ShieldX className="size-3.5 text-red-600" />}
        {isApproval && <ShieldQuestion className="size-3.5 text-amber-600" />}
        <span>{toolLabel(part)}</span>
        {hasDetails && (
          <ChevronDown
            className={`ml-auto size-3.5 text-muted-foreground transition-transform ${collapsed ? "-rotate-90" : ""}`}
          />
        )}
      </button>

      {!collapsed && part.input != null && (
        <pre className={codeBlock}>{JSON.stringify(part.input, null, 2)}</pre>
      )}

      {!collapsed && (isDone || isPreliminary) && part.output != null && (
        <pre className={codeBlock}>{JSON.stringify(part.output, null, 2)}</pre>
      )}

      {!collapsed && isError && <p className="mt-1 text-red-600">{part.errorText}</p>}
      {!collapsed && isDenied && <p className="mt-1 text-red-600">Denied by the loan officer.</p>}

      {isApproval && part.approval && !part.approval.isAutomatic && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {part.approval.requestReason && (
            <p className="w-full text-foreground/80">{part.approval.requestReason}</p>
          )}
          <button
            onClick={() => onApprovalResponse(part.approval!.id, true)}
            className="flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-primary-foreground hover:bg-primary-hover transition-colors"
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
    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2 py-0.5 text-[10px] text-muted-foreground">
      <Icon className="size-3" />
      {label}
    </span>
  );
}

export default function Home() {
  const { messages, sendMessage, addToolApprovalResponse, setMessages, status, error } =
    useChat<OraUIMessage>({
      sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithApprovalResponses,
    });
  const [input, setInput] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<KnowledgeDocument | null>(null);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [viewingApp, setViewingApp] = useState<SampleApplication | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLElement>(null);
  // Follow the stream only while the user is near the bottom, so scrolling up to read isn't interrupted.
  const stickToBottomRef = useRef(true);

  const isBusy = status === "submitted" || status === "streaming";

  useEffect(() => {
    const el = scrollRef.current;
    if (el && stickToBottomRef.current) el.scrollTop = el.scrollHeight;
  }, [messages, status]);

  function submit(text: string) {
    if (!text.trim() || isBusy) return;
    stickToBottomRef.current = true;
    sendMessage({ text });
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }

  function handleNewChat() {
    setMessages([]);
    setSelectedAppId(null);
    setInput("");
  }

  function handleSelectApplication(app: SampleApplication) {
    setViewingApp(app);
    setSidebarOpen(false);
  }

  function handleUseOra(app: SampleApplication) {
    setSelectedAppId(app.id);
    setViewingApp(null);
    submit(app.prompt);
  }

  function handleSelectDocument(doc: KnowledgeDocument) {
    setSelectedDoc(doc);
    setSidebarOpen(false);
  }

  return (
    <div className="flex flex-col flex-1 h-full bg-background">
      <header className="sticky top-0 z-30 flex shrink-0 items-center justify-between border-b border-border bg-background/80 px-4 py-3.5 backdrop-blur-md md:px-6">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors md:hidden"
          >
            <Menu className="size-5" />
          </button>
          <div className="flex size-8 items-center justify-center rounded-xl bg-primary text-white shadow-sm shadow-emerald-900/20">
            <Landmark className="size-4.5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold leading-tight tracking-tight text-foreground">
              ORA
            </h1>
            <p className="text-xs leading-tight text-muted-foreground">
              SME credit underwriting assistant
            </p>
          </div>
        </div>
        <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
          Prototype
        </span>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          documents={knowledgeBase}
          onSelectDocument={handleSelectDocument}
          applications={sampleApplications}
          onSelectApplication={handleSelectApplication}
          selectedAppId={viewingApp?.id ?? selectedAppId}
          selectedDocId={selectedDoc?.id ?? null}
          onNewChat={handleNewChat}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="flex flex-col flex-1 overflow-hidden">
          <main
            ref={scrollRef}
            onScroll={(e) => {
              const el = e.currentTarget;
              stickToBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
            }}
            className="flex-1 overflow-y-auto px-4 md:px-6"
          >
            <div className="mx-auto max-w-3xl flex flex-col gap-5 py-6">
              {messages.length === 0 && (
                <div className="flex flex-col items-center gap-6 py-10 text-center">
                  <div className="flex size-14 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-emerald-900/20">
                    <Landmark className="size-6" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <h2 className="text-xl font-semibold text-foreground">
                      How can I help with underwriting today?
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Ask about an application, ratios, or policy, or try one of these.
                    </p>
                  </div>
                  <div className="grid w-full gap-3 text-left sm:grid-cols-3">
                    {samplePrompts.map((s) => (
                      <button
                        key={s}
                        onClick={() => submit(s)}
                        className="flex flex-col gap-2.5 rounded-2xl border border-border bg-card p-4 text-left shadow-sm hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5 transition-all"
                      >
                        <span className="text-xs leading-relaxed text-foreground/90">{s}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((message) => {
                const usage = (message.metadata as { usage?: Usage } | undefined)?.usage;
                const isUser = message.role === "user";
                return (
                  <div
                    key={message.id}
                    className={`animate-message-in flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}
                  >
                    {!isUser && (
                      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-primary">
                        <Landmark className="size-3.5" />
                      </span>
                    )}

                    <div
                      className={`flex max-w-[85%] flex-col gap-2 ${isUser ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={
                          isUser
                            ? "rounded-3xl rounded-tr-md bg-zinc-900 px-4 py-2.5 text-zinc-50 shadow-sm"
                            : "flex w-full flex-col gap-2"
                        }
                      >
                        {message.parts.map((part, i) => {
                          if (part.type === "text") {
                            if (isUser) {
                              return (
                                <p key={i} className="text-sm whitespace-pre-wrap">
                                  {part.text}
                                </p>
                              );
                            }
                            return (
                              <Streamdown
                                key={i}
                                className="text-sm text-foreground"
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
                                className="flex items-start gap-1.5 text-xs italic text-muted-foreground"
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
                      </div>

                      {!isUser && usage && (
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
                  </div>
                );
              })}

              {isBusy && (
                <p className="self-start flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Loader2 className="size-3.5 animate-spin" /> ORA is thinking…
                </p>
              )}

              {error && (
                <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <AlertTriangle className="size-4 shrink-0" />
                  {error.message || "Something went wrong. Check your API keys in .env."}
                </div>
              )}
            </div>
          </main>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit(input);
            }}
            className="border-t border-border bg-background px-4 py-4 md:px-6"
          >
            <div className="mx-auto flex max-w-3xl flex-col gap-1.5">
              <div className="flex items-end gap-2 rounded-3xl border border-border bg-card px-3 py-2 shadow-sm shadow-black/5 transition-all focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    const el = e.target;
                    el.style.height = "auto";
                    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      submit(input);
                    }
                  }}
                  placeholder="Ask ORA about an application, ratios, or policy…"
                  rows={1}
                  className="max-h-40 flex-1 resize-none bg-transparent px-1.5 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                  disabled={isBusy}
                />
                <button
                  type="submit"
                  disabled={isBusy || !input.trim()}
                  className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-30 disabled:hover:bg-primary"
                >
                  {isBusy ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                </button>
              </div>
              <p className="px-2 text-center text-[11px] text-muted-foreground">
                ORA can make mistakes. Verify important underwriting decisions.
              </p>
            </div>
          </form>
        </div>
      </div>

      {selectedDoc && (
        <DocumentModal
          title={selectedDoc.title}
          text={selectedDoc.text}
          onClose={() => setSelectedDoc(null)}
        />
      )}

      {viewingApp && (
        <DocumentModal
          title={viewingApp.business}
          subtitle={`Loan application · ${viewingApp.blurb}`}
          text={viewingApp.document}
          icon={Briefcase}
          onClose={() => setViewingApp(null)}
          footer={
            <>
              <button
                onClick={() => setViewingApp(null)}
                className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => handleUseOra(viewingApp)}
                disabled={isBusy}
                className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary-hover transition-colors disabled:opacity-40 disabled:hover:bg-primary"
              >
                <Sparkles className="size-4" />
                Use Ora
              </button>
            </>
          }
        />
      )}
    </div>
  );
}
