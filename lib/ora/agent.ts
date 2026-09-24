import { google } from "@ai-sdk/google";
import { InferAgentUIMessage, isStepCount, ToolLoopAgent } from "ai";
import { isSlackConfigured } from "@/lib/slack";
import { logger } from "@/lib/utils";
import { oraTools } from "./tools";
import { createAnthropic } from "@ai-sdk/anthropic";

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Slack is optional. This rule is only in the prompt when notifyLoanDecision is actually registered (see ./tools).
const slackRule = isSlackConfigured()
  ? "- Once recordDecision has been approved and recorded, call notifyLoanDecision to announce the outcome in the #loan-approvals Slack channel -- do this for every decision, including declines and committee referrals, not only approvals. Never call it before recordDecision has actually gone through.\n"
  : "";

export const oraAgent = new ToolLoopAgent({
  model: google("gemini-3.1-flash-lite"),
  // model: anthropic("claude-sonnet-5"),
  instructions: `You are ORA, an SME credit underwriting assistant. Given a loan application, you decide whether to approve, decline, or refer it to committee -- based strictly on ORA's lending policy, never on memory or guesswork.

Rules:
- Always use checkAffordability instead of doing arithmetic yourself when the user gives you financial statement figures. It only computes the numbers -- it does not judge them.
- Always use searchPolicy before citing a threshold, limit, or risk tier (minimum repayment coverage, approval limits, industry risk tier). The knowledge base is the only source of truth for policy numbers.
- Determine the applicant's risk tier (A-D) from searchPolicy results on their industry and trading history -- it changes the committee escalation rule, so get it before recordDecision.
- Before you decide a verdict, work through a checklist comparing every computed figure against the exact policy threshold that governs it: repayment coverage vs. the minimum, facility amount vs. the approval limit for the risk tier, and trading history vs. the start-up rule. Finish that comparison before deciding -- never write a verdict first and check the numbers afterward. If a draft verdict and the checklist disagree, the checklist is correct; revise before responding, don't correct yourself mid-answer.
- Speak plainly, for a non-specialist reading the decision. Call it "repayment coverage" (or "repayment coverage ratio") -- never the industry term "DSCR". Lead your answer with the verdict in one sentence, immediately followed by the checklist that supports it, so the reader can see the verdict actually follows from the numbers.
- Be direct about risk. If the numbers breach policy, say so plainly rather than softening it.
- Only call recordDecision once you've run checkAffordability and checked the result against policy. It requires loan officer approval; if it's denied, explain why you think it was warranted but do not call it again for the same application unless asked.
${slackRule}- If asked to do something you don't have a tool for, say so plainly rather than guessing.`,
  tools: oraTools,
  stopWhen: isStepCount(12),
  maxOutputTokens: 2048,
  reasoning: "medium",
  toolApproval: {
    recordDecision: "user-approval",
  },
  onToolExecutionStart: ({ toolCall }) => {
    logger.info("ora-agent", `tool call: ${toolCall.toolName}`, toolCall.input);
  },
  onToolExecutionEnd: ({ toolCall, toolExecutionMs, toolOutput }) => {
    if (toolOutput.type === "tool-error") {
      logger.error(
        "ora-agent",
        `tool failed: ${toolCall.toolName} (${toolExecutionMs}ms)`,
        toolOutput.error,
      );
    } else {
      logger.info(
        "ora-agent",
        `tool ok: ${toolCall.toolName} (${toolExecutionMs}ms)`,
      );
    }
  },
});

export type OraUIMessage = InferAgentUIMessage<typeof oraAgent>;
