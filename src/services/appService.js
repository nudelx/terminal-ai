import path from "path";
import chalk from "chalk";
import { models, getModelByKey } from "../config/models.js";
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
  displayError,
} from "./uiService.js";

let appState = {
  apiKey: null,
  aiClient: null,
  configManager: null,
  historyManager: null,
  currentModel: null,
  historyPath: null,
  configPath: null,
};

const initializeAppState = (apiKey) => {
  appState.apiKey = apiKey;
  appState.aiClient = createAIClient(apiKey);
  appState.historyPath = path.join(process.cwd(), "history.json");
  appState.configPath = path.join(process.cwd(), "config.json");
  appState.configManager = createConfigManager(appState.configPath);
  appState.historyManager = createHistoryManager(appState.historyPath);
  appState.currentModel = null;
};

const initializeApp = async () => {
  try {
    appState.currentModel = appState.configManager.get("selectedModel");

    if (!appState.currentModel || !models[appState.currentModel]) {
      displayWelcome();
      appState.currentModel = await selectModel();

      if (appState.currentModel && models[appState.currentModel]) {
        appState.configManager.set("selectedModel", appState.currentModel);
        appState.configManager.saveConfig();
      } else {
        throw new Error(MESSAGES.ERROR_NO_MODEL);
      }
    }

    displayModelSelected(getModelByKey(appState.currentModel).name);

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
    const newModel = await selectModel();

    if (newModel && models[newModel]) {
      appState.currentModel = newModel;
      appState.configManager.set("selectedModel", newModel);
      appState.configManager.saveConfig();
      displayModelSwitched(getModelByKey(newModel).name);
      return true;
    }

    return false;
  } catch (error) {
    displayError(`${MESSAGES.ERROR_MODEL_SWITCH}: ${error.message}`);
    return false;
  }
};

const handleUserMessage = async (message) => {
  try {
    appState.historyManager.addMessage("user", message);

    displayThinking();

    const response = await sendMessage(
      appState.aiClient,
      appState.historyManager.getHistory(),
      appState.currentModel
    );

    if (response) {
      appState.historyManager.addMessage("assistant", response);

      displayAIResponse(response);

      speakText(response).catch((error) => {
        console.warn(chalk.yellow(`Audio playback failed: ${error.message}`));
      });
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

export const runApp = async (apiKey) => {
  try {
    initializeAppState(apiKey);
    await initializeApp();

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

      await handleUserMessage(userInput);
    }
  } catch (error) {
    displayError(`Application error: ${error.message}`);
    throw error;
  } finally {
    cleanupApp();
  }
};
