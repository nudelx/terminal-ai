import chalk from "chalk";
import dotenv from "dotenv";
import inquirer from "inquirer";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { MESSAGES } from "./config/constants.js";
import { runApp, runOneShot } from "./services/appService.js";
import { safeReadJSON, safeWriteJSON } from "./services/fileService.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const configPath = join(__dirname, "..", "config.json");
dotenv.config({ path: join(__dirname, "..", ".env") });

const validateEnvironment = async () => {
	const openrouterKey = process.env.OPENROUTER_API_KEY;
	const geminiKey = process.env.GEMINI_API_KEY;

	// Load saved provider preference
	const config = safeReadJSON(configPath, {});
	const savedProvider = config.apiProvider;

	// If we have a saved provider and the corresponding key exists, use it
	if (savedProvider === "gemini" && geminiKey) {
		return { apiKey: geminiKey, provider: "gemini" };
	}
	if (savedProvider === "openrouter" && openrouterKey) {
		return { apiKey: openrouterKey, provider: "openrouter" };
	}

	// If both keys are available, let user choose
	if (openrouterKey && geminiKey) {
		const { provider } = await inquirer.prompt([
			{
				type: "list",
				name: "provider",
				message: "Multiple API keys detected. Which provider would you like to use?",
				choices: [
					{ name: "Gemini (Google AI)", value: "gemini" },
					{ name: "OpenRouter", value: "openrouter" },
				],
			},
		]);

		// Save the choice
		safeWriteJSON(configPath, { ...config, apiProvider: provider });

		return {
			apiKey: provider === "gemini" ? geminiKey : openrouterKey,
			provider,
		};
	}

	// Use whichever key is available
	if (geminiKey) {
		safeWriteJSON(configPath, { ...config, apiProvider: "gemini" });
		return { apiKey: geminiKey, provider: "gemini" };
	}

	if (openrouterKey) {
		safeWriteJSON(configPath, { ...config, apiProvider: "openrouter" });
		return { apiKey: openrouterKey, provider: "openrouter" };
	}

	console.error(chalk.red(MESSAGES.ERROR_API_KEY));
	console.error(chalk.yellow("Set either OPENROUTER_API_KEY or GEMINI_API_KEY in your .env file"));
	process.exit(1);
};

const main = async () => {
	try {
		const { apiKey, provider } = await validateEnvironment();
		const args = process.argv.slice(2);

		if (args.length > 0) {
			const message = args.join(" ");
			await runOneShot(apiKey, message, provider);
		} else {
			await runApp(apiKey, provider);
		}
	} catch (error) {
		console.error(chalk.red("Application error:"), error.message);
		process.exit(1);
	}
};

main();
