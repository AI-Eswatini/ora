### Slack integration

ORA can announce its recorded underwriting decisions in a Slack channel (`#loan-approvals` by default). This is outbound-only: ORA posts to Slack, nobody talks back to ORA through Slack (that was scoped out for now).

### How it works

1. The agent calls `recordDecision` (lib/ora/tools.ts) once the ratios have been checked against policy. This requires loan officer approval (`toolApproval` in lib/ora/agent.ts) before it takes effect.
2. Once approved and recorded, the agent calls `notifyLoanApprovals` (lib/ora/tools.ts), which formats the decision -- emoji + label, facility amount, rationale -- and posts it via `postToSlack`.
3. `postToSlack` (lib/slack.ts) is a thin wrapper around Slack's Web API `chat.postMessage` endpoint, called directly with `fetch`. No Slack SDK or package is used.

```
recordDecision (approved) -> notifyLoanApprovals -> postToSlack -> chat.postMessage
```

### Files

- `lib/slack.ts` -- all Slack API logic lives here. Currently just `postToSlack({ text, channel?, threadTs? })`.
- `lib/ora/tools.ts` -- `notifyLoanApprovals` tool, wired into `oraTools`.
- `lib/ora/agent.ts` -- instructs the model to call `notifyLoanApprovals` only after `recordDecision` has been approved and recorded, never before.

### Setup

1. Create a Slack app at [api.slack.com/apps](https://api.slack.com/apps) -> **Create New App** -> **From scratch**.
2. **OAuth & Permissions** -> **Bot Token Scopes** -> add `chat:write`.
3. **Install to Workspace**, then copy the **Bot User OAuth Token** (`xoxb-...`).
4. Create a `#loan-approvals` channel (or pick another name) and invite the bot to it, unless you also add `chat:write.public`.
5. Set env vars (see `.env.example`):
   ```
   SLACK_BOT_TOKEN=xoxb-...
   SLACK_LOAN_APPROVALS_CHANNEL=loan-approvals   # optional, this is the default
   ```

### Not built (yet)

Talking to ORA from within Slack (mentions, DMs, slash commands) was considered and explicitly deferred -- see the conversation history for the tradeoffs (Events API webhook needs a public URL; Socket Mode needs a persistent connection). If this comes back, keep the Slack-specific code in `lib/slack.ts` and prefer raw `fetch` calls to Slack's Web API over adding a Slack SDK package.
