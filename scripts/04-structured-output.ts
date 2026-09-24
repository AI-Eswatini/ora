/**
 * Structured output: instead of free text, the model fills a schema. Given a
 * messy natural-language note, it returns typed fields (numbers, an enum)
 * that code can use directly, with no parsing of prose.
 *
 * Run: npm run demo:structured
 */
import { generateText, Output } from "ai";
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

  console.log("--- structured extraction ---");
  console.log(output);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
