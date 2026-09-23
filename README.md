# ORA

ORA is an SME credit underwriting agent, built to demonstrate "The AI Stack" at Deep Learning Indaba — a working example of UI streaming, tool calling with human approval, tokenization, embeddings, and two-stage RAG (retrieve → rerank).

## Prerequisites

- **Node.js 20.9+** — [nodejs.org](https://nodejs.org/en/download) (npm ships with it). Check with `node -v`.
- **pnpm** — `npm install -g pnpm`. Don't want to install it? The npm equivalents work too, see the note below.

## Quick start

```bash
git clone https://github.com/AI-Eswatini/ora.git
cd ora
pnpm install
cp .env.example .env
```

Now open `.env` and add your API keys — see [Getting your API keys](#getting-your-api-keys) below.

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and start chatting with ORA. That's it — install, add keys, run.

> Using npm instead of pnpm? `npm install` and `npm run dev` work the same way.

## Getting your API keys

`.env` needs two keys to run ORA as-is, plus one held in reserve for the live session.

### 1. Google Gemini — required

Powers the main agent loop (chat, reasoning, all tool calls).

1. Go to **[aistudio.google.com/api-keys](https://aistudio.google.com/api-keys)**.
2. Sign in with a Google account and click **Create API key**.
3. Copy the key into `.env`:
   ```
   GOOGLE_GENERATIVE_AI_API_KEY=your-key-here
   ```

### 2. Voyage AI — required for lending-policy search

Powers the RAG tool that searches ORA's lending policy (embeddings + reranking).

1. Sign up at **[voyageai.com](https://www.voyageai.com)** and create a key from your dashboard.
2. Add it to `.env`:
   ```
   VOYAGE_API_KEY=your-key-here
   ```
3. **Can't create an account on the day?** Ask the session organizer for a shared key.

### 3. Anthropic (Claude) — reserved for the live demo

`@ai-sdk/anthropic` is already installed. ORA runs on Gemini by default, but the agent's model in [lib/ora/agent.ts](./lib/ora/agent.ts) can be swapped to Claude live on stage — the AI SDK gives every provider the same interface, so it's a one-line change with zero install step.

1. Get a key at **[console.anthropic.com](https://console.anthropic.com)**.
2. Add it to `.env`:
   ```
   ANTHROPIC_API_KEY=your-key-here
   ```

### 4. Slack — optional

Lets ORA post its recorded decisions to a `#loan-approvals` Slack channel. Not required to run ORA — skip this if you don't need it. Full setup in [specs/slack.md](./specs/slack.md).

```
SLACK_BOT_TOKEN=your-bot-token-here
SLACK_LOAN_APPROVALS_CHANNEL=loan-approvals   # optional, this is the default
```

## Live-demo scripts

Each AI-stack concept ORA uses — a plain LLM call, streaming, tool calling, structured output, tokenization, embeddings, two-stage RAG, the full agent loop — also exists as a standalone script you can run and talk through on its own. See [scripts/README.md](./scripts/README.md) for the full list and `pnpm demo:*` commands.

## Learn more

- [AI SDK documentation](https://ai-sdk.dev/docs) — the SDK powering ORA's agent, streaming, and tools.
