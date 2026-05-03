import { OpenRouter } from "@openrouter/sdk"
import { GoogleGenerativeAI } from "@google/generative-ai"
import OpenAI from "openai"
import chalk from "chalk"
import { MESSAGES } from "../config/constants.js"
import { getModelByKey, getProviderById } from "../config/providers.js"

const Z_AI_BASE_URL = "https://api.z.ai/api/paas/v4/"

const sendOpenRouterMessage = async (client, history, modelId) => {
	const model = getModelByKey(modelId, "openrouter")

	if (!model) {
		throw new Error(`${MESSAGES.ERROR_INVALID_MODEL}: ${modelId}`)
	}

	const response = await client.chat.send({
		model: model.id,
		messages: history,
		max_tokens: model.maxTokens,
	})

	const content = response.choices?.[0]?.message?.content

	if (!content) {
		throw new Error("Invalid response format from AI service")
	}

	return content
}

const sendZAiMessage = async (client, history, modelId) => {
	const model = getModelByKey(modelId, "z_ai")

	if (!model) {
		throw new Error(`${MESSAGES.ERROR_INVALID_MODEL}: ${modelId}`)
	}

	const response = await client.chat.completions.create({
		model: model.id,
		messages: history,
		max_tokens: model.maxTokens,
	})

	const content = response.choices?.[0]?.message?.content

	if (!content) {
		throw new Error("Invalid response format from AI service")
	}

	return content
}

const sendGeminiMessage = async (client, history, modelId) => {
	const modelConfig = getModelByKey(modelId, "gemini")

	if (!modelConfig) {
		throw new Error(`${MESSAGES.ERROR_INVALID_MODEL}: ${modelId}`)
	}

	const model = client.getGenerativeModel({ model: modelConfig.id })

	const allHistory = history.slice(0, -1).map((msg) => ({
		role: msg.role === "assistant" ? "model" : "user",
		parts: [{ text: msg.content }],
	}))

	const firstUserIndex = allHistory.findIndex((msg) => msg.role === "user")
	const geminiHistory = firstUserIndex >= 0 ? allHistory.slice(firstUserIndex) : []

	const chat = model.startChat({ history: geminiHistory })

	const lastMessage = history[history.length - 1]
	const result = await chat.sendMessage(lastMessage.content)
	const response = await result.response

	return response.text()
}

const PROVIDER_HANDLERS = {
	gemini: {
		createClient: (apiKey) => new GoogleGenerativeAI(apiKey),
		sendMessage: sendGeminiMessage,
	},
	openrouter: {
		createClient: (apiKey) => new OpenRouter({ apiKey }),
		sendMessage: sendOpenRouterMessage,
	},
	z_ai: {
		createClient: (apiKey) => new OpenAI({ apiKey, baseURL: Z_AI_BASE_URL }),
		sendMessage: sendZAiMessage,
	},
}

export const isProviderImplemented = (providerId) => Boolean(PROVIDER_HANDLERS[providerId])

export const createAIClient = (apiKey, providerId) => {
	const handler = PROVIDER_HANDLERS[providerId]
	if (!handler) {
		throw new Error(`No client implementation for provider: ${providerId}`)
	}
	return handler.createClient(apiKey)
}

export const sendMessage = async (client, history, modelId, providerId) => {
	const handler = PROVIDER_HANDLERS[providerId]
	if (!handler) {
		console.error(chalk.red(`No send implementation for provider: ${providerId}`))
		return null
	}

	try {
		return await handler.sendMessage(client, history, modelId)
	} catch (error) {
		const status = error.status || error.response?.status
		const provider = getProviderById(providerId)

		if (process.env.DEBUG) {
			console.log("[debug] sendMessage error:", {
				name: error.name,
				message: error.message,
				status: error.status ?? error.response?.status,
				code: error.code,
			})
		}

		const errorHandlers = {
			401: () =>
				console.error(
					chalk.red(`Invalid API key. Please check your ${provider?.keyName ?? providerId}.`),
				),
			404: () =>
				console.error(chalk.red(`Model not found: ${getModelByKey(modelId, providerId)?.id}.`)),
			429: () => console.error(chalk.red("Rate limit exceeded. Please wait before trying again.")),
		}

		const handler = errorHandlers[status]

		if (handler) {
			handler()
		} else if (error.code === "ECONNABORTED") {
			console.error(chalk.red("Request timeout. Please try again."))
		} else {
			console.error(
				chalk.red(`Error communicating with ${provider?.name ?? providerId}:`),
				error.message,
			)
		}

		return null
	}
}
