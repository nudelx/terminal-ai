import { OpenRouter } from "@openrouter/sdk"
import { GoogleGenerativeAI } from "@google/generative-ai"
import chalk from "chalk"
import { MESSAGES } from "../config/constants.js"
import { getModelByKey } from "../config/models.js"

export const createAIClient = (apiKey, provider = "openrouter") => {
	if (provider === "gemini") {
		return new GoogleGenerativeAI(apiKey)
	}
	return new OpenRouter({ apiKey })
}

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

const sendGeminiMessage = async (client, history, modelId) => {
	const modelConfig = getModelByKey(modelId, "gemini")

	if (!modelConfig) {
		throw new Error(`${MESSAGES.ERROR_INVALID_MODEL}: ${modelId}`)
	}

	const model = client.getGenerativeModel({ model: modelConfig.id })

	// Convert history to Gemini format
	const allHistory = history.slice(0, -1).map((msg) => ({
		role: msg.role === "assistant" ? "model" : "user",
		parts: [{ text: msg.content }],
	}))

	// Gemini requires history to start with a user message
	const firstUserIndex = allHistory.findIndex((msg) => msg.role === "user")
	const geminiHistory = firstUserIndex >= 0 ? allHistory.slice(firstUserIndex) : []

	const chat = model.startChat({ history: geminiHistory })

	// Send the last message
	const lastMessage = history[history.length - 1]
	const result = await chat.sendMessage(lastMessage.content)
	const response = await result.response

	return response.text()
}

export const sendMessage = async (client, history, modelId, provider = "openrouter") => {
	try {
		if (provider === "gemini") {
			return await sendGeminiMessage(client, history, modelId)
		}
		return await sendOpenRouterMessage(client, history, modelId)
	} catch (error) {
		const status = error.status || error.response?.status

		const errorHandlers = {
			401: () =>
				console.error(
					chalk.red(
						`Invalid API key. Please check your ${provider === "gemini" ? "GEMINI_API_KEY" : "OPENROUTER_API_KEY"}.`,
					),
				),
			404: () =>
				console.error(chalk.red(`Model not found: ${getModelByKey(modelId, provider)?.id}.`)),
			429: () => console.error(chalk.red("Rate limit exceeded. Please wait before trying again.")),
		}

		const handler = errorHandlers[status]

		if (handler) {
			handler()
		} else if (error.code === "ECONNABORTED") {
			console.error(chalk.red("Request timeout. Please try again."))
		} else {
			console.error(chalk.red(MESSAGES.ERROR_OPENROUTER), error.message)
		}

		return null
	}
}
