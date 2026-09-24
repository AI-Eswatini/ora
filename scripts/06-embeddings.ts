/**
 * An embedding is a vector that places text in "meaning space" — sentences
 * that mean similar things end up close together, even with zero shared
 * keywords. This is the primitive underneath RAG (script 07).
 *
 * Run: npm run demo:embeddings
 */
import { embedMany, cosineSimilarity } from "ai";
import { config } from "dotenv";
import { voyage } from "voyage-ai-provider";

config();

const embeddingModel = voyage.embeddingModel("voyage-4-lite");

const sentences = [
  "The business has a strong debt service coverage ratio.",
  "Cash flow comfortably covers the loan repayments.",
  "The restaurant's seasonal revenue makes cash flow unpredictable.",
];

async function main() {
  const { embeddings, usage } = await embedMany({
    model: embeddingModel,
    values: sentences,
    providerOptions: { voyage: { inputType: "document" } },
  });

  console.log(`Embedded ${embeddings.length} sentences into ${embeddings[0].length}-dimensional vectors.`);
  console.log("Token usage:", usage);

  console.log("\nThe embeddings themselves:");
  for (const [i, embedding] of embeddings.entries()) {
    console.log(`\n[${i}] "${sentences[i]}"`);
    console.log(embedding);
  }

  console.log("\nCosine similarity (1.0 = identical meaning, 0 = unrelated):");
  for (let i = 0; i < sentences.length; i++) {
    for (let j = i + 1; j < sentences.length; j++) {
      console.log(`  [${i}] vs [${j}]: ${cosineSimilarity(embeddings[i], embeddings[j]).toFixed(3)}`);
    }
  }

  console.log(
    "\nSentences 0 and 1 should score highest: same underlying meaning, " +
      "almost no shared words. That's the whole point of embeddings over " +
      "keyword search.",
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
