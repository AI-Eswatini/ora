/**
 * The full loop end to end: observe -> think -> act (lookupOrder) -> reflect
 * -> act again (issueRefund). A self-contained agent with two toy tools,
 * defined below.
 *
 * Run: npm run demo:agent-loop
 */
import { isStepCount, tool, ToolLoopAgent } from "ai";
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
  description: "Refund an order to the customer's original payment method.",
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
});

const request =
  "Order 1042 arrived with a cracked earcup. Please refund it in full.";

async function main() {
  const result = await agent.generate({ prompt: request });

  for (const [i, step] of result.steps.entries()) {
    console.log(`\nStep ${i + 1}:`);
    for (const call of step.toolCalls) {
      console.log(`  called ${call.toolName}(${JSON.stringify(call.input)})`);
    }
    for (const output of step.toolResults) {
      console.log(`  -> ${JSON.stringify(output.output).slice(0, 300)}`);
    }
  }

  console.log("\n--- final answer ---");
  console.log(result.text);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
