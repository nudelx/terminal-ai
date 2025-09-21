const COMMANDS = {
  EXIT: "exit",
  MODEL: "model",
};

const MESSAGES = {
  WELCOME: "🤖 Terminal AI Agent",
  EXIT_INSTRUCTION: 'Type "exit" to quit',
  GOODBYE: "Goodbye! 👋",
  AI_THINKING: "AI is thinking...",
  YOU_PROMPT: "You:",
  AI_RESPONSE: "AI:",
  MODEL_SELECTION: "Select an AI model (use arrow keys to navigate):",
  ERROR_API_KEY: "Error: OPENROUTER_API_KEY is not set in .env file",
  ERROR_OPENROUTER: "Error communicating with OpenRouter:",
  ERROR_INVALID_MODEL: "Invalid model selected",
  ERROR_NO_MODEL: "No valid model selected",
  ERROR_MODEL_SWITCH: "Model switch failed",
};

const API = {
  BASE_URL: "https://openrouter.ai/api/v1/chat/completions",
  HEADERS: {
    "Content-Type": "application/json",
  },
};

const UI = {
  PREFIXES: {
    USER: "🤔",
    AI: "🤖",
  },
  COLORS: {
    BLUE: "blue",
    GREEN: "green",
    GRAY: "gray",
    YELLOW: "yellow",
    CYAN: "cyan",
    RED: "red",
  },
  PAGE_SIZE: 10,
};

export { COMMANDS, MESSAGES, API, UI };
