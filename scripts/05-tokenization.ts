/**
 * Token counts aren't something you compute yourself -- every model call
 * reports real usage back, and tokens don't map 1:1 to words or characters.
 *
 * Run: npm run demo:tokens
 */
import { generateText } from "ai";
import { config } from "dotenv";
import { model } from "./00-model";

config();

async function reportUsage(label: string, prompt: string) {
  const result = await generateText({ model, prompt });
  const words = prompt.trim().split(/\s+/).length;
  console.log(`${label}: "${prompt}"`);
  console.log(
    `  ${words} words -> ${result.usage.inputTokens} input tokens (reported by the model)\n`,
  );
}

async function main() {
  await reportUsage("Plain sentence", "Summarise this contract for me.");
  await reportUsage(
    "Domain acronym splits harder",
    "The DSCR breached its covenant threshold.",
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
