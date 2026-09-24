/**
 * The full loop end to end: observe -> think -> act (lookupOrder) -> reflect
 * -> act again (issueRefund). A self-contained agent with two toy tools,
 * defined below.
 *
 * issueRefund needs human approval (toolApproval below). With no chat UI to
 * click "approve", this script plays the human itself -- it reads the pending
 * approval request, decides, and sends it back in a second call.
 *
 * Run: npm run demo:agent-loop
 */
import {
  isStepCount,
  tool,
  ToolLoopAgent,
  type ModelMessage,
  type ToolApprovalResponse,
} from "ai";
import { config } from "dotenv";
import { z } from "zod";
import { model } from "./00-model";

config();

const lookupOrder = tool({
  description: "Look up an order: what was bought, what was paid, and its delivery status.",
  inputSchema: z.object({ orderId: z.string() }),
  execute: async ({ orderId }) => ({
    orderId,
    item: "Wireless headphones",
    amountPaid: 1299,
    currency: "ZAR",
    status: "delivered",
    deliveredOn: "2026-09-10",
  }),
});

const issueRefund = tool({
  description:
    "Refund an order to the customer's original payment method. This moves money, so it needs human approval.",
  inputSchema: z.object({
    orderId: z.string(),
    amount: z.number(),
    reason: z.string(),
  }),
  execute: async (input) => ({ ...input, refundedAt: new Date().toISOString() }),
});

const agent = new ToolLoopAgent({
  model,
  instructions:
    "You are a customer support agent. Always look up the order before acting on it. Only refund what the order shows was paid.",
  tools: { lookupOrder, issueRefund },
  stopWhen: isStepCount(6),
  toolApproval: {
    issueRefund: "user-approval",
  },
});

const request =
  "Order 1042 arrived with a cracked earcup. Please refund it in full.";

function printSteps(steps: Awaited<ReturnType<typeof agent.generate>>["steps"]) {
  for (const [i, step] of steps.entries()) {
    console.log(`\nStep ${i + 1}:`);
    for (const call of step.toolCalls) {
      console.log(`  called ${call.toolName}(${JSON.stringify(call.input)})`);
    }
    for (const output of step.toolResults) {
      console.log(`  -> ${JSON.stringify(output.output).slice(0, 300)}`);
    }
  }
}

async function main() {
  const messages: ModelMessage[] = [{ role: "user", content: request }];

  console.log("--- first call ---");
  const first = await agent.generate({ messages });
  messages.push(...first.responseMessages);
  printSteps(first.steps);

  const pendingApprovals = first.content.filter(
    (part) => part.type === "tool-approval-request" && !part.isAutomatic,
  );

  if (pendingApprovals.length === 0) {
    console.log("\n--- final answer (no approval was needed) ---");
    console.log(first.text);
    return;
  }

  console.log(`\n--- ${pendingApprovals.length} tool call(s) paused for human approval ---`);
  const approvalResponses: ToolApprovalResponse[] = pendingApprovals.map((part) => {
    if (part.type !== "tool-approval-request") throw new Error("unreachable");
    console.log(`  approving approvalId=${part.approvalId} for ${part.toolCall.toolName}`);
    return {
      type: "tool-approval-response",
      approvalId: part.approvalId,
      approved: true,
      reason: "Support lead checked the order and the refund amount, looks fine.",
    };
  });

  messages.push({ role: "tool", content: approvalResponses });

  console.log("\n--- second call (refund now executes) ---");
  const second = await agent.generate({ messages });
  printSteps(second.steps);

  console.log("\n--- final answer ---");
  console.log(second.text);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
