# Live-demo scripts

Standalone, runnable companions to the ORA app — each one isolates a single
AI-stack concept so it can be run and talked through on its own, outside the
chat UI. Run in order; each script layers one new idea on top of the last.

| Script                    | Run                    | Demonstrates                                                                                                                                                                             |
| ------------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `01-simple-call.ts`       | `pnpm demo:call`       | The bare LLM call: prompt in, text out, no tools/streaming/memory.                                                                                                                       |
| `02-streaming.ts`         | `pnpm demo:stream`     | `streamText` — same latency overall, first token arrives immediately.                                                                                                                    |
| `03-tool-calling.ts`      | `pnpm demo:tools`      | A model choosing to call a function instead of answering from memory.                                                                                                                    |
| `04-structured-output.ts` | `pnpm demo:structured` | `Output.object` to turn messy text into typed data, then handing the arithmetic to plain code.                                                                                           |
| `05-tokenization.ts`      | `pnpm demo:tokens`     | Token counts come from the model's own usage report, not something you count yourself -- same tokenizer, different text, different counts.                                              |
| `06-embeddings.ts`        | `pnpm demo:embeddings` | What an embedding actually is: meaning-space distance, not keyword overlap.                                                                                                              |
| `07-rag-two-step.ts`      | `pnpm demo:rag`        | ORA's real two-stage retrieval (bi-encoder retrieve -> cross-encoder rerank) run standalone.                                                                                             |
| `08-full-agent-loop.ts`   | `pnpm demo:agent-loop` | The real `oraAgent`, end to end, including the human-approval pause before a sensitive tool call executes.                                                                               |

## Setup

These run outside Next.js, so `.env` isn't loaded automatically —
each script calls `dotenv`'s `config()` first. You still need the
same API keys the main app uses (Google, Voyage) in `ora/.env`.

Requires `tsx` (added as a devDependency). After `pnpm install`, run any
script with its `pnpm demo:*` command above, or directly:

```bash
pnpm tsx scripts/01-simple-call.ts
```

> Using npm instead of pnpm? Replace `pnpm demo:*` with `npm run demo:*`
> (e.g. `npm run demo:call`), and `pnpm tsx ...` with `npx tsx ...`.
