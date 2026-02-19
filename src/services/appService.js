import { fileURLToPath } from "url";
import { dirname, join } from "path";
import chalk from "chalk";
import { getModelsByProvider, getModelByKey, getDefaultModel } from "../config/models.js";
import { MESSAGES } from "../config/constants.js";
import { createAIClient, sendMessage } from "./aiService.js";
import { speakText } from "./audioService.js";
import { createConfigManager, createHistoryManager } from "./fileService.js";
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
  displayCommands,
  displayError,
} from "./uiService.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const APP_ROOT = join(__dirname, "..", "..");

const appState = {
  apiKey: null,
  aiClient: null,
  configManager: null,
  historyManager: null,
  currentModel: null,
  historyPath: null,
  configPath: null,
  provider: "openrouter",
};

const initializeAppState = (apiKey, provider = "openrouter") => {
  appState.apiKey = apiKey;
  appState.provider = provider;
  appState.aiClient = createAIClient(apiKey, provider);
  appState.historyPath = join(APP_ROOT, "history.json");
  appState.configPath = join(APP_ROOT, "config.json");
  appState.configManager = createConfigManager(appState.configPath);
  appState.historyManager = createHistoryManager(appState.historyPath);
  appState.currentModel = null;
};

const initializeApp = async (isInteractive = true) => {
  try {
    const models = getModelsByProvider(appState.provider);
    const modelKey = appState.provider === "gemini" ? "selectedGeminiModel" : "selectedModel";
    appState.currentModel = appState.configManager.get(modelKey);

    if (!appState.currentModel || !models[appState.currentModel]) {
      if (isInteractive) {
        displayWelcome();
        console.log(chalk.cyan(`Using ${appState.provider === "gemini" ? "Gemini" : "OpenRouter"} API\n`));
        appState.currentModel = await selectModel(appState.provider);

        if (appState.currentModel && models[appState.currentModel]) {
          appState.configManager.set(modelKey, appState.currentModel);
          appState.configManager.saveConfig();
        } else {
          throw new Error(MESSAGES.ERROR_NO_MODEL);
        }
      } else {
        // Use default model for non-interactive mode
        appState.currentModel = getDefaultModel(appState.provider);
      }
    }

    displayModelSelected(getModelByKey(appState.currentModel, appState.provider).name);

    appState.historyManager.startAutoSave();

    setupProcessHandlers();
  } catch (error) {
    displayError(`Initialization failed: ${error.message}`);
    throw error;
  }
};

const setupProcessHandlers = () => {
  process.on("exit", () => {
    cleanupApp();
  });

  process.on("SIGINT", () => {
    console.log(chalk.yellow("\nShutting down gracefully..."));
    cleanupApp();
    process.exit(0);
  });

  process.on("uncaughtException", (error) => {
    displayError(`Uncaught exception: ${error.message}`);
    cleanupApp();
    process.exit(1);
  });

  process.on("unhandledRejection", (reason, promise) => {
    displayError(`Unhandled rejection: ${reason}`);
    cleanupApp();
    process.exit(1);
  });
};

const handleModelSwitch = async () => {
  try {
    const models = getModelsByProvider(appState.provider);
    const newModel = await selectModel(appState.provider);

    if (newModel && models[newModel]) {
      appState.currentModel = newModel;
      const modelKey = appState.provider === "gemini" ? "selectedGeminiModel" : "selectedModel";
      appState.configManager.set(modelKey, newModel);
      appState.configManager.saveConfig();
      displayModelSwitched(getModelByKey(newModel, appState.provider).name);
      return true;
    }

    return false;
  } catch (error) {
    displayError(`${MESSAGES.ERROR_MODEL_SWITCH}: ${error.message}`);
    return false;
  }
};

const handleDateUpdate = () => {
  const now = new Date();
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  };
  const dateString = now.toLocaleString("en-US", options);

  const dateMessage = `Override: The current date and time is ${dateString}.`;

  appState.historyManager.addMessage("user", dateMessage);
  console.log(chalk.green(`\nDate updated in conversation: ${dateString}\n`));
};

const handleProviderSwitch = async () => {
  const { default: inquirer } = await import("inquirer");
  const newProvider = appState.provider === "gemini" ? "openrouter" : "gemini";
  const envKey = newProvider === "gemini" ? "GEMINI_API_KEY" : "OPENROUTER_API_KEY";

  if (!process.env[envKey]) {
    displayError(`Cannot switch: ${envKey} is not set in .env`);
    return false;
  }

  const { confirm } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: `Switch to ${newProvider === "gemini" ? "Gemini" : "OpenRouter"}?`,
      default: true,
    },
  ]);

  if (confirm) {
    appState.provider = newProvider;
    appState.aiClient = createAIClient(process.env[envKey], newProvider);
    appState.configManager.set("apiProvider", newProvider);

    const models = getModelsByProvider(newProvider);
    const modelKey = newProvider === "gemini" ? "selectedGeminiModel" : "selectedModel";
    appState.currentModel = appState.configManager.get(modelKey) || getDefaultModel(newProvider);

    if (!models[appState.currentModel]) {
      appState.currentModel = getDefaultModel(newProvider);
    }

    appState.configManager.saveConfig();
    console.log(chalk.green(`\nSwitched to ${newProvider === "gemini" ? "Gemini" : "OpenRouter"}`));
    displayModelSelected(getModelByKey(appState.currentModel, newProvider).name);
  }

  return confirm;
};

const handleUserMessage = async (message) => {
  try {
    appState.historyManager.addMessage("user", message);

    displayThinking();

    const response = await sendMessage(
      appState.aiClient,
      appState.historyManager.getHistory(),
      appState.currentModel,
      appState.provider
    );

    if (response) {
      appState.historyManager.addMessage("assistant", response);

      displayAIResponse(response);

      if (appState.configManager.get("speak")) {
        speakText(response).catch((error) => {
          console.warn(chalk.yellow(`Audio playback failed: ${error.message}`));
        });
      }
    } else {
      displayError("Failed to get AI response. Please try again.");
    }
  } catch (error) {
    displayError(`Message processing failed: ${error.message}`);
  }
};

const cleanupApp = () => {
  try {
    if (appState.historyManager) {
      appState.historyManager.stopAutoSave();
      appState.historyManager.saveHistory();
    }
  } catch (error) {
    console.warn(chalk.yellow(`Cleanup warning: ${error.message}`));
  }
};

export const runOneShot = async (apiKey, message, provider = "openrouter") => {
  try {
    initializeAppState(apiKey, provider);
    await initializeApp(false);
    await handleUserMessage(message);
  } catch (error) {
    displayError(`Application error: ${error.message}`);
    throw error;
  } finally {
    cleanupApp();
  }
};

export const runApp = async (apiKey, provider = "openrouter") => {
  try {
    initializeAppState(apiKey, provider);
    await initializeApp(true);

    while (true) {
      const userInput = await getUserInput();

      if (isExitCommand(userInput)) {
        displayGoodbye();
        break;
      }

      if (isModelCommand(userInput)) {
        await handleModelSwitch();
        continue;
      }

      if (isListCommandsCommand(userInput)) {
        displayCommands();
        continue;
      }

      if (isProviderCommand(userInput)) {
        await handleProviderSwitch();
        continue;
      }

      if (isDateUpdateCommand(userInput)) {
        handleDateUpdate();
        continue;
      }

      await handleUserMessage(userInput);
    }
  } catch (error) {
    displayError(`Application error: ${error.message}`);
    throw error;
  } finally {
    cleanupApp();
  }
};
