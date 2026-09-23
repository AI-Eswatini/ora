/**
 * Structured output: instead of free text, the model fills a schema. LLMs
 * are good at turning messy text into structured numbers, bad at doing
 * arithmetic on those numbers -- so extraction stays a model call, and the
 * ratio math becomes a plain function (lib/ora/tools.ts checkAffordability).
 *
 * Run: npm run demo:structured
 */
import { generateText, Output } from "ai";
import { checkAffordability } from "@/lib/ora/tools";
import { config } from "dotenv";
import { model } from "./00-model";
import { z } from "zod";

config();

const loanOfficerNote = `
Sunrise Bakery had a strong year: revenue came in at R3.8m, up from R3.1m.
Gross profit was R2.1m. EBITDA landed at R510k. Total debt service across
their term loan and overdraft this year was R430k. This is a working
capital facility they're renewing.
`;

const financialFigures = z.object({
  revenue: z.number(),
  grossProfit: z.number(),
  operatingProfit: z.number(),
  annualLoanRepayments: z.number(),
  facilityType: z.enum(["term_loan", "working_capital"]),
});

async function main() {
  const { output } = await generateText({
    model,
    output: Output.object({ schema: financialFigures }),
    prompt: `Extract the financial figures from this loan officer's note as structured data:\n${loanOfficerNote}`,
  });

  console.log("--- structured extraction (the model's job) ---");
  console.log(output);

  const ratios = await checkAffordability.execute(output, {
    toolCallId: "demo",
    messages: [],
    context: {},
  });

  console.log("\n--- ratio calculation (plain code's job, zero LLM calls) ---");
  console.log(ratios);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
