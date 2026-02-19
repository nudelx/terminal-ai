const COMMANDS = {
  EXIT: "exit",
  MODEL: "model",
  LIST_COMMANDS: "ls cmd",
  SWITCH_PROVIDER: "provider",
  DATE_UPDATE: "date update",
};

const COMMAND_DESCRIPTIONS = {
  exit: "Exit the application",
  model: "Switch AI model",
  "ls cmd": "List all available commands",
  provider: "Switch API provider (Gemini/OpenRouter)",
  "date update": "Inject current date/time into conversation",
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

export { COMMANDS, COMMAND_DESCRIPTIONS, MESSAGES, UI };
