# ORA

ORA is an SME credit underwriting agent, built to demonstrate "The AI Stack" at Deep Learning Indaba — a working example of UI streaming, tool calling with human approval, tokenization, embeddings, and two-stage RAG (retrieve → rerank).

## Prerequisites

- **Git** — [git-scm.com](https://git-scm.com/downloads). Needed to clone the repo in the quick start below. Check with `git --version`.
- **Node.js 20.9+** — [nodejs.org](https://nodejs.org/en/download). npm ships with it, so it doesn't need a separate install. Check with `node -v` and `npm -v`.
- **Visual Studio Code** — [code.visualstudio.com](https://code.visualstudio.com/download). We'll be reading and editing ORA's code together during the session.

## Quick start

```bash
git clone https://github.com/AI-Eswatini/ora.git
cd ora
npm install --legacy-peer-deps
cp .env.example .env
code .
```

Now open `.env` and add your API keys — see [Getting your API keys](#getting-your-api-keys) below.

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start chatting with ORA. That's it — install, add keys, run.

> Prefer pnpm? `pnpm install` and `pnpm dev` work the same way.

## Getting your API keys

`.env` needs two keys to run ORA as-is. The others are optional.

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

### 3. Anthropic (Claude) — optional

Run ORA on Claude instead of Gemini. `@ai-sdk/anthropic` is already installed. ORA uses Gemini by default, but you can switch the agent's model in [lib/ora/agent.ts](./lib/ora/agent.ts) to Claude. The AI SDK gives every provider the same interface, so that's a one-line change and you don't need to install anything.

1. Get a key at **[console.anthropic.com](https://console.anthropic.com)**.
2. Add it to `.env`:
   ```
   ANTHROPIC_API_KEY=your-key-here
   ```

### 4. Slack — optional

Lets ORA post its recorded decisions to a `#loan-approvals` Slack channel. Not required to run ORA — skip this if you don't need it. Full setup in [docs/slack.md](./docs/slack.md).

```
SLACK_BOT_TOKEN=your-bot-token-here
SLACK_LOAN_APPROVALS_CHANNEL=loan-approvals   # optional, this is the default
```

## Live-demo scripts

Each AI-stack concept ORA uses — a plain LLM call, streaming, tool calling, structured output, tokenization, embeddings, two-stage RAG, the full agent loop — also exists as a standalone script you can run and talk through on its own. See [scripts/README.md](./scripts/README.md) for the full list and `npm run demo:*` commands.

## Learn more

- [AI SDK documentation](https://ai-sdk.dev/docs) — the SDK powering ORA's agent, streaming, and tools.
