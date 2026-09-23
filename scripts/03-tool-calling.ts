/**
 * A tool is just a function the model can choose to call instead of
 * answering from memory. The model decides WHEN to call it; your code
 * decides WHAT it does. Here: the model has no built-in sense of "now",
 * so it has to call the tool to find out.
 *
 * Run: npm run demo:tools
 */
import { generateText, tool, isStepCount } from "ai";
import { config } from "dotenv";
import { model } from "./00-model";
import { z } from "zod";

config();

const getCurrentDateTime = tool({
  description: "Get the current date and time.",
  inputSchema: z.object({}),
  execute: async () => ({ now: new Date().toISOString() }),
});

async function main() {
  const result = await generateText({
    model,
    tools: { getCurrentDateTime },
    stopWhen: isStepCount(3),
    prompt: "What's today's date, and how many days are left until the end of the year?",
  });

  console.log(
    "--- steps (each one is a full loop turn: think -> act -> observe) ---",
  );
  for (const [i, step] of result.steps.entries()) {
    console.log(`\nStep ${i + 1}:`);
    for (const call of step.toolCalls) {
      console.log(`  called ${call.toolName}(${JSON.stringify(call.input)})`);
    }
    for (const output of step.toolResults) {
      console.log(`  -> ${JSON.stringify(output.output)}`);
    }
  }

  console.log("\n--- final answer ---");
  console.log(result.text);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
