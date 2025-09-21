import "dotenv/config";
import chalk from "chalk";
import { MESSAGES } from "./config/constants.js";
import { runApp } from "./services/appService.js";

const validateEnvironment = () => {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    console.error(chalk.red(MESSAGES.ERROR_API_KEY));
    process.exit(1);
  }

  return apiKey;
};

const main = async () => {
  try {
    const apiKey = validateEnvironment();
    await runApp(apiKey);
  } catch (error) {
    console.error(chalk.red("Application error:"), error.message);
    process.exit(1);
  }
};

main();
