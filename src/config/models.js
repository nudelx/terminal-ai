const openrouterModels = {
	"allenai/olmo-3.1-32b-instruct": {
		id: "allenai/olmo-3.1-32b-instruct",
		name: "AllenAI: Olmo 3.1 32B",
		description: "AllenAI's Olmo 3.1 32B model",
		maxTokens: 4096,
	},
	"mimo-v2-flash": {
		id: "xiaomi/mimo-v2-flash:free",
		name: "Mimo V2 Flash",
		description: "Xiaomi's Mimo V2 Flash model",
		maxTokens: 4096,
	},
	"gemini-2.0-flash": {
		id: "google/gemini-2.0-flash-exp:free",
		name: "Gemini 2.0 Flash",
		description: "Google's Gemini 2.0 Flash experimental",
		maxTokens: 8192,
	},
	"llama-3.3-70b": {
		id: "meta-llama/llama-3.3-70b-instruct:free",
		name: "Llama 3.3 70B",
		description: "Meta's Llama 3.3 70B Instruct",
		maxTokens: 8192,
	},
	"qwen-2.5-72b": {
		id: "qwen/qwen-2.5-72b-instruct:free",
		name: "Qwen 2.5 72B",
		description: "Alibaba's Qwen 2.5 72B Instruct",
		maxTokens: 8192,
	},
	"arcee-ai/trinity-large-preview:free": {
		id: "arcee-ai/trinity-large-preview:free",
		name: "Trinity Large Preview",
		description: "Arcee AI's Trinity Large Preview",
		maxTokens: 8192,
	},
	"google/gemma-3-27b-it:free": {
		id: "google/gemma-3-27b-it:free",
		name: "Gemma 3 27B",
		description: "Google's Gemma 3 27B",
		maxTokens: 8192,
	},
	"openai/gpt-oss-20b:free": {
		id: "openai/gpt-oss-20b:free",
		name: "GPT OSS 20B",
		description: "OpenAI's GPT OSS 20B",
		maxTokens: 8192,
	},
	"liquid/lfm-2.5-1.2b-instruct:free": {
		id: "liquid/lfm-2.5-1.2b-instruct:free",
		name: "LFM 2.5 1.2B",
		description: "Liquid's LFM 2.5 1.2B",
		maxTokens: 8192,
	},
}

const geminiModels = {
	"gemini-3-flash": {
		id: "gemini-3-flash-preview",
		name: "Gemini 3 Flash",
		description: "High-speed intelligence with PhD-level reasoning at scale.",
		maxTokens: 8192,
	},
	"gemini-2.5-pro": {
		id: "gemini-2.5-pro",
		name: "Gemini 2.5 Pro",
		description: "Google's Gemini 2.5 Pro - most capable",
		maxTokens: 8192,
	},
	"gemini-2.0-flash": {
		id: "gemini-2.0-flash",
		name: "Gemini 2.0 Flash",
		description: "Google's Gemini 2.0 Flash - fast and capable",
		maxTokens: 8192,
	},
	"gemini-2.0-flash-lite": {
		id: "gemini-2.0-flash-lite",
		name: "Gemini 2.0 Flash Lite",
		description: "Google's Gemini 2.0 Flash Lite - lightweight",
		maxTokens: 8192,
	},
	"gemini-1.5-flash": {
		id: "gemini-1.5-flash",
		name: "Gemini 1.5 Flash",
		description: "Google's Gemini 1.5 Flash",
		maxTokens: 8192,
	},
	"gemini-1.5-pro": {
		id: "gemini-1.5-pro",
		name: "Gemini 1.5 Pro",
		description: "Google's Gemini 1.5 Pro - most capable",
		maxTokens: 8192,
	},
}

const defaultOpenrouterModel = "arcee-ai/trinity-large-preview:free"
const defaultGeminiModel = "gemini-2.0-flash"

const getModelsByProvider = (provider) => {
	return provider === "gemini" ? geminiModels : openrouterModels
}

const getDefaultModel = (provider) => {
	return provider === "gemini" ? defaultGeminiModel : defaultOpenrouterModel
}

const getModelByKey = (key, provider = "openrouter") => {
	const models = getModelsByProvider(provider)
	const defaultModel = getDefaultModel(provider)
	return models[key] || models[defaultModel]
}

export {
	openrouterModels,
	geminiModels,
	defaultOpenrouterModel,
	defaultGeminiModel,
	getModelsByProvider,
	getDefaultModel,
	getModelByKey,
}
