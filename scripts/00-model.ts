/** Shared model for the demo scripts*/

import { google } from "@ai-sdk/google";
import { createAnthropic } from "@ai-sdk/anthropic";
const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const model = google("gemini-3.1-flash-lite");
// export const model = anthropic("claude-sonnet-5");
