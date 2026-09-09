/**
 * The simplest possible LLM interaction: one prompt in, one response out.
 * No tools, no streaming, no memory. Everything else in this folder is
 * this call plus one more idea layered on top.
 *
 * Run: pnpm demo:call
 */
import { generateText } from "ai";
import { config } from "dotenv";
import { model } from "./00-model";

config();

async function main() {
  const result = await generateText({
    model,
    prompt: "In two sentences, explain what an SME credit underwriter does.",
  });

  console.log("--- text ---");
  console.log(result.text);

  console.log("\n--- usage ---");
  console.log(result.usage);

  console.log("\n--- finishReason ---");
  console.log(result.finishReason);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
