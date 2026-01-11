import { fileURLToPath } from "url";
import { dirname, join } from "path";
import dotenv from "dotenv";
import chalk from "chalk";
import { MESSAGES } from "./config/constants.js";
import { runApp, runOneShot } from "./services/appService.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "..", ".env") });

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
    const args = process.argv.slice(2);

    if (args.length > 0) {
      const message = args.join(" ");
      await runOneShot(apiKey, message);
    } else {
      await runApp(apiKey);
    }
  } catch (error) {
    console.error(chalk.red("Application error:"), error.message);
    process.exit(1);
  }
};

main();
