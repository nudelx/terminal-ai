const COMMANDS = {
	EXIT: "/exit",
	MODEL: "/model",
	LIST_COMMANDS: "/ls",
	SWITCH_PROVIDER: "/provider",
	DATE_UPDATE: "/date-update",
	LAST: "/last",
	MEMORY: "/memory",
}

const COMMAND_DESCRIPTIONS = {
	exit: "Exit the application",
	model: "Switch AI model",
	ls: "List all available commands",
	provider: "Switch API provider",
	"date update": "Inject current date/time into conversation",
	last: "Show the last message in conversation history",
	memory: "Save current conversation history to file",
}

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
}

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
}

export { COMMANDS, COMMAND_DESCRIPTIONS, MESSAGES, UI }
