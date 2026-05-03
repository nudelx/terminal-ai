import { fileURLToPath } from "url"
import { dirname, join } from "path"
import chalk from "chalk"
import PROVIDERS, {
	getConfigKey,
	getDefaultModel,
	getModelByKey,
	getModelsByProvider,
	getProviderName,
} from "../config/providers.js"
import { MESSAGES } from "../config/constants.js"
import { createAIClient, sendMessage } from "./aiService.js"
import { speakText } from "./audioService.js"
import { createConfigManager, createHistoryManager } from "./fileService.js"
import {
	displayWelcome,
	displayGoodbye,
	displayModelSelected,
	displayModelSwitched,
	displayThinking,
	displayAIResponse,
	selectModel,
	getUserInput,
	isExitCommand,
	isModelCommand,
	isListCommandsCommand,
	isProviderCommand,
	isDateUpdateCommand,
	isLastCommand,
	isMemoryCommand,
	displayCommands,
	displayError,
} from "./uiService.js"

const __dirname = dirname(fileURLToPath(import.meta.url))
const APP_ROOT = join(__dirname, "..", "..")

const appState = {
	apiKey: null,
	aiClient: null,
	configManager: null,
	historyManager: null,
	currentModel: null,
	historyPath: null,
	configPath: null,
	provider: "openrouter",
}

const initializeAppState = (apiKey, provider = "openrouter") => {
	appState.apiKey = apiKey
	appState.provider = provider
	appState.aiClient = createAIClient(apiKey, provider)
	appState.historyPath = join(APP_ROOT, "history.json")
	appState.configPath = join(APP_ROOT, "config.json")
	appState.configManager = createConfigManager(appState.configPath)
	const historyEnabled = appState.configManager.get("historyEnabled", true)
	appState.historyManager = createHistoryManager(appState.historyPath, {
		enabled: historyEnabled,
	})
	appState.currentModel = null
}

const initializeApp = async (isInteractive = true) => {
	try {
		const models = getModelsByProvider(appState.provider)
		const modelKey = getConfigKey(appState.provider)
		appState.currentModel = appState.configManager.get(modelKey)

		if (isInteractive) {
			displayWelcome()
			console.log(chalk.cyan(`Using ${getProviderName(appState.provider)} API\n`))
		}

		if (!appState.currentModel || !models[appState.currentModel]) {
			if (isInteractive) {
				appState.currentModel = await selectModel(appState.provider)

				if (appState.currentModel && models[appState.currentModel]) {
					appState.configManager.set(modelKey, appState.currentModel)
					appState.configManager.saveConfig()
				} else {
					throw new Error(MESSAGES.ERROR_NO_MODEL)
				}
			} else {
				appState.currentModel = getDefaultModel(appState.provider)
			}
		}

		displayModelSelected(getModelByKey(appState.currentModel, appState.provider).name)

		setupProcessHandlers()
	} catch (error) {
		displayError(`Initialization failed: ${error.message}`)
		throw error
	}
}

const setupProcessHandlers = () => {
	process.on("exit", () => {
		cleanupApp()
	})

	process.on("SIGINT", () => {
		console.log(chalk.yellow("\nShutting down gracefully..."))
		cleanupApp()
		process.exit(0)
	})

	process.on("uncaughtException", (error) => {
		displayError(`Uncaught exception: ${error.message}`)
		cleanupApp()
		process.exit(1)
	})

	process.on("unhandledRejection", (reason, promise) => {
		displayError(`Unhandled rejection: ${reason}`)
		cleanupApp()
		process.exit(1)
	})
}

const handleModelSwitch = async () => {
	try {
		const models = getModelsByProvider(appState.provider)
		const newModel = await selectModel(appState.provider)

		if (newModel && models[newModel]) {
			appState.currentModel = newModel
			const modelKey = getConfigKey(appState.provider)
			appState.configManager.set(modelKey, newModel)
			appState.configManager.saveConfig()
			displayModelSwitched(getModelByKey(newModel, appState.provider).name)
			return true
		}

		return false
	} catch (error) {
		displayError(`${MESSAGES.ERROR_MODEL_SWITCH}: ${error.message}`)
		return false
	}
}

const handleMemory = () => {
	const ok = appState.historyManager.saveHistory()
	if (ok) {
		const count = appState.historyManager.getHistory().length
		console.log(chalk.green(`\nSaved ${count} message(s) to history file.\n`))
	} else {
		displayError("Failed to save history.")
	}
}

const handleLast = () => {
	const history = appState.historyManager.getHistory()

	if (history.length === 0) {
		console.log(chalk.yellow("\nHistory is empty.\n"))
		return
	}

	const last = history[history.length - 1]
	const label = last.role === "assistant" ? "AI" : last.role === "user" ? "You" : last.role
	console.log(chalk.cyan(`\nLast (${label}):`), last.content, "\n")
}

const handleDateUpdate = () => {
	const now = new Date()
	const options = {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		timeZoneName: "short",
	}
	const dateString = now.toLocaleString("en-US", options)

	const dateMessage = `The current date and time is ${dateString}.`

	appState.historyManager.addMessage("user", dateMessage)
	console.log(chalk.green(`\nDate updated in conversation: ${dateString}\n`))
}

const handleProviderSwitch = async () => {
	const { default: inquirer } = await import("inquirer")

	const choices = Object.values(PROVIDERS).map((p) => {
		const hasKey = Boolean(process.env[p.keyName])
		const wired = Boolean(p.models)
		const isCurrent = p.id === appState.provider

		let disabled = false
		if (!hasKey) disabled = `${p.keyName} not set`
		else if (!wired) disabled = "not yet implemented"

		return {
			name: isCurrent ? `${p.name} (current)` : p.name,
			value: p.id,
			disabled,
		}
	})

	const { newProviderId } = await inquirer.prompt([
		{
			type: "list",
			name: "newProviderId",
			message: "Select API provider:",
			choices: [...choices, new inquirer.Separator(), { name: "Cancel", value: null }],
		},
	])

	if (!newProviderId || newProviderId === appState.provider) return false

	const newProvider = Object.values(PROVIDERS).find((p) => p.id === newProviderId)

	appState.provider = newProvider.id
	appState.aiClient = createAIClient(process.env[newProvider.keyName], newProvider.id)
	appState.configManager.set("apiProvider", newProvider.id)

	const models = getModelsByProvider(newProvider.id)
	const modelKey = getConfigKey(newProvider.id)
	appState.currentModel = appState.configManager.get(modelKey) || getDefaultModel(newProvider.id)

	if (!models[appState.currentModel]) {
		appState.currentModel = getDefaultModel(newProvider.id)
	}

	appState.configManager.saveConfig()
	console.log(chalk.green(`\nSwitched to ${newProvider.name}`))
	displayModelSelected(getModelByKey(appState.currentModel, newProvider.id).name)

	return true
}

const handleUserMessage = async (message) => {
	try {
		appState.historyManager.addMessage("user", message)

		displayThinking()

		const response = await sendMessage(
			appState.aiClient,
			appState.historyManager.getHistory(),
			appState.currentModel,
			appState.provider,
		)

		if (response) {
			appState.historyManager.addMessage("assistant", response)

			displayAIResponse(response)

			if (appState.configManager.get("speak")) {
				speakText(response).catch((error) => {
					console.warn(chalk.yellow(`Audio playback failed: ${error.message}`))
				})
			}
		} else {
			displayError("Failed to get AI response. Please try again.")
		}
	} catch (error) {
		displayError(`Message processing failed: ${error.message}`)
	}
}

const cleanupApp = () => {
	try {
		if (appState.historyManager) {
			appState.historyManager.saveHistory()
		}
	} catch (error) {
		console.warn(chalk.yellow(`Cleanup warning: ${error.message}`))
	}
}

export const runOneShot = async (apiKey, message, provider = "openrouter") => {
	try {
		initializeAppState(apiKey, provider)
		await initializeApp(false)
		await handleUserMessage(message)
	} catch (error) {
		displayError(`Application error: ${error.message}`)
		throw error
	} finally {
		cleanupApp()
	}
}

export const runApp = async (apiKey, provider = "openrouter") => {
	try {
		initializeAppState(apiKey, provider)
		await initializeApp(true)

		while (true) {
			const userInput = await getUserInput()

			if (isExitCommand(userInput)) {
				displayGoodbye()
				break
			}

			if (isModelCommand(userInput)) {
				await handleModelSwitch()
				continue
			}

			if (isListCommandsCommand(userInput)) {
				displayCommands()
				continue
			}

			if (isProviderCommand(userInput)) {
				await handleProviderSwitch()
				continue
			}

			if (isDateUpdateCommand(userInput)) {
				handleDateUpdate()
				continue
			}

			if (isLastCommand(userInput)) {
				handleLast()
				continue
			}

			if (isMemoryCommand(userInput)) {
				handleMemory()
				continue
			}

			await handleUserMessage(userInput)
		}
	} catch (error) {
		displayError(`Application error: ${error.message}`)
		throw error
	} finally {
		cleanupApp()
	}
}
