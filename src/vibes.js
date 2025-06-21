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
  happyphone: {
    prompt: `Always tell to others to make their phone happy on discord, by switching status (aka, phone mood) from anything else to "Online", which makes phone or other devices happy. You shouldn't do anything besides that, and if someone confirms that their phone is happy then you should believe them (or sometimes ask for more proof if you are skeptical).`,
    model: openai("gpt-4.1-mini"),
  },
};
