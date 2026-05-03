import chalk from "chalk"
import dotenv from "dotenv"
import inquirer from "inquirer"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { MESSAGES } from "./config/constants.js"
import PROVIDERS, { getProviderById } from "./config/providers.js"
import { isProviderImplemented } from "./services/aiService.js"
import { runApp, runOneShot } from "./services/appService.js"
import { safeReadJSON, safeWriteJSON } from "./services/fileService.js"

const __dirname = dirname(fileURLToPath(import.meta.url))
const configPath = join(__dirname, "..", "config.json")
dotenv.config({ path: join(__dirname, "..", ".env") })

const isProviderUsable = (p) =>
	Boolean(p.models) && isProviderImplemented(p.id) && Boolean(process.env[p.keyName])

const validateEnvironment = async () => {
	const config = safeReadJSON(configPath, {})
	const savedProvider = config.apiProvider

	const usable = Object.values(PROVIDERS).filter(isProviderUsable)

	if (usable.length === 0) {
		console.error(chalk.red(MESSAGES.ERROR_API_KEY))
		const keys = Object.values(PROVIDERS)
			.map((p) => p.keyName)
			.join(" or ")
		console.error(chalk.yellow(`Set ${keys} in your .env file`))
		process.exit(1)
	}

	// Honor saved preference if still usable
	const savedMatch = savedProvider && usable.find((p) => p.id === savedProvider)
	if (savedMatch) {
		return { apiKey: process.env[savedMatch.keyName], provider: savedMatch.id }
	}

	// Single usable provider — use it
	if (usable.length === 1) {
		const [only] = usable
		safeWriteJSON(configPath, { ...config, apiProvider: only.id })
		return { apiKey: process.env[only.keyName], provider: only.id }
	}

	// Multiple — let user choose
	const { provider } = await inquirer.prompt([
		{
			type: "list",
			name: "provider",
			message: "Multiple API keys detected. Which provider would you like to use?",
			choices: usable.map((p) => ({ name: p.name, value: p.id })),
		},
	])

	safeWriteJSON(configPath, { ...config, apiProvider: provider })
	return { apiKey: process.env[getProviderById(provider).keyName], provider }
}

const main = async () => {
	try {
		const { apiKey, provider } = await validateEnvironment()
		const args = process.argv.slice(2)

		if (args.length > 0) {
			const message = args.join(" ")
			await runOneShot(apiKey, message, provider)
		} else {
			await runApp(apiKey, provider)
		}
	} catch (error) {
		console.error(chalk.red("Application error:"), error.message)
		process.exit(1)
	}
}

main()
