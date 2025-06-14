import { openai } from "@ai-sdk/openai";

export default {
  normal: {
    prompt: `Prefer using lowercase, an informal vibe and a friendly tone.`,
    model: openai("gpt-4.1-mini"),
  },
  test: {
    prompt: `Reply to everything with "TEST".`,
    model: openai("gpt-4.1-mini"),
  },
};
