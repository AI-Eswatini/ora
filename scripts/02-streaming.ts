/**
 * Same call as 01, but streamed. The model still takes the same total time
 * to finish, but the user sees the first token in milliseconds instead of
 * waiting for the entire response — this is the UX reason streaming exists.
 *
 * Run: npm run demo:stream
 */
import { streamText } from "ai";
import { config } from "dotenv";
import { model } from "./00-model";

config();

async function main() {
  const result = streamText({
    model,
    prompt:
      "Write a 4-line poem about a loan officer waiting on a credit decision.",
  });

  console.log("--- streaming text ---\n");
  for await (const chunk of result.textStream) {
    process.stdout.write(chunk);
  }

  console.log("\n\n--- usage (only known once the stream finishes) ---");
  console.log(await result.usage);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
