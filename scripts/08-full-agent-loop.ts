/**
 * The full loop end to end, using the real production agent
 * (lib/ora/agent.ts): observe -> think -> act (searchPolicy,
 * checkAffordability) -> reflect -> act again (recordDecision).
 *
 * recordDecision needs human approval (toolApproval in agent.ts). With no
 * chat UI to click "approve", this script plays the loan officer itself --
 * it reads the pending approval request, decides, and sends it back in a
 * second call.
 *
 * Run: npm run demo:agent-loop
 */
import type { ModelMessage, ToolApprovalResponse } from "ai";
import { config } from "dotenv";
import { oraAgent } from "@/lib/ora/agent";

config();

const application = `A hospitality business, trading for 3 years, is applying to renew a
R1,500,000 working capital facility. Financials: revenue R4,200,000, gross
profit R2,600,000, operating profit R680,000, annual loan repayments R550,000.
Check this against policy and record your recommended decision.`;

function printSteps(steps: Awaited<ReturnType<typeof oraAgent.generate>>["steps"]) {
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
  const messages: ModelMessage[] = [{ role: "user", content: application }];

  console.log("--- first call ---");
  const first = await oraAgent.generate({ messages });
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

  console.log(`\n--- ${pendingApprovals.length} tool call(s) paused for loan officer approval ---`);
  const approvalResponses: ToolApprovalResponse[] = pendingApprovals.map((part) => {
    if (part.type !== "tool-approval-request") throw new Error("unreachable");
    console.log(`  approving approvalId=${part.approvalId} for ${part.toolCall.toolName}`);
    return {
      type: "tool-approval-response",
      approvalId: part.approvalId,
      approved: true,
      reason: "Loan officer reviewed the ratios and policy check, decision looks sound.",
    };
  });

  messages.push({ role: "tool", content: approvalResponses });

  console.log("\n--- second call (decision now executes) ---");
  const second = await oraAgent.generate({ messages });
  printSteps(second.steps);

  console.log("\n--- final answer ---");
  console.log(second.text);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
