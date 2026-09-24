# Live-demo scripts

Standalone, runnable companions to the ORA app — each one isolates a single
AI-stack concept so it can be run and talked through on its own, outside the
chat UI. Run in order; each script layers one new idea on top of the last.

| Script                    | Run                       | Demonstrates                                                                                                                               |
| ------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `01-simple-call.ts`       | `npm run demo:call`       | The bare LLM call: prompt in, text out, no tools/streaming/memory.                                                                         |
| `02-streaming.ts`         | `npm run demo:stream`     | `streamText` — same latency overall, first token arrives immediately.                                                                      |
| `03-tool-calling.ts`      | `npm run demo:tools`      | A model choosing to call a function instead of answering from memory.                                                                      |
| `04-structured-output.ts` | `npm run demo:structured` | `Output.object` to turn messy natural-language text into typed data that matches a schema.                                                 |
| `05-tokenization.ts`      | `npm run demo:tokens`     | Token counts come from the model's own usage report, not something you count yourself -- same tokenizer, different text, different counts. |
| `06-embeddings.ts`        | `npm run demo:embeddings` | What an embedding actually is: meaning-space distance, not keyword overlap.                                                                |
| `07-rag-two-step.ts`      | `npm run demo:rag`        | Two-stage retrieval (bi-encoder retrieve -> cross-encoder rerank) over a small in-memory knowledge base.                                    |
| `08-full-agent-loop.ts`   | `npm run demo:agent-loop` | A self-contained agent loop, end to end, including the human-approval pause before a sensitive tool call executes.                         |

## Setup

These run outside Next.js, so `.env` isn't loaded automatically —
each script calls `dotenv`'s `config()` first. You still need the
same API keys the main app uses (Google, Voyage) in `ora/.env`.

Requires `tsx` (added as a devDependency). After `npm install`, run any
script with its `npm run demo:*` command above, or directly:

```bash
npx tsx scripts/01-simple-call.ts
```

> Prefer pnpm? Replace `npm run demo:*` with `pnpm demo:*`
> (e.g. `pnpm demo:call`), and `npx tsx ...` with `pnpm tsx ...`.
