/** Shared model for the demo scripts -- keeps the model id in one place. */
import { google } from "@ai-sdk/google";

export const model = google("gemini-3.1-flash-lite");
