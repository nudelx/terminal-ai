import {
	openrouterModels,
	geminiModels,
	zAiModels,
	defaultOpenrouterModel,
	defaultGeminiModel,
	defaultZAiModel,
} from "./models.js"

const PROVIDERS = {
	GEMINI: {
		id: "gemini",
		keyName: "GEMINI_API_KEY",
		name: "Gemini (Google AI)",
		models: geminiModels,
		defaultModel: defaultGeminiModel,
		configKey: "selectedGeminiModel",
	},
	OPENROUTER: {
		id: "openrouter",
		keyName: "OPENROUTER_API_KEY",
		name: "OpenRouter",
		models: openrouterModels,
		defaultModel: defaultOpenrouterModel,
		configKey: "selectedModel",
	},
	Z_AI: {
		id: "z_ai",
		keyName: "Z_AI_API_KEY",
		name: "Z-AI",
		models: zAiModels,
		defaultModel: defaultZAiModel,
		configKey: "selectedZAiModel",
	},
}

const getProviderById = (id) => Object.values(PROVIDERS).find((p) => p.id === id)

const getProviderName = (id) => getProviderById(id)?.name ?? id

const getModelsByProvider = (id) => getProviderById(id)?.models ?? {}

const getDefaultModel = (id) => getProviderById(id)?.defaultModel

const getModelByKey = (key, providerId) => {
	const provider = getProviderById(providerId)
	if (!provider?.models) return undefined
	return provider.models[key] || provider.models[provider.defaultModel]
}

const getConfigKey = (id) => getProviderById(id)?.configKey

const isProviderWired = (id) => Boolean(getProviderById(id)?.models)

export default PROVIDERS
export {
	getProviderById,
	getProviderName,
	getModelsByProvider,
	getDefaultModel,
	getModelByKey,
	getConfigKey,
	isProviderWired,
}
