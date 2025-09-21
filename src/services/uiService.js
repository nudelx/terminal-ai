import chalk from "chalk";
import inquirer from "inquirer";
import { models, defaultModel, getModelByKey } from "../config/models.js";
import { MESSAGES, UI, COMMANDS } from "../config/constants.js";

export const displayWelcome = () => {
  console.log(chalk[UI.COLORS.BLUE](MESSAGES.WELCOME));
  console.log(chalk[UI.COLORS.GRAY](MESSAGES.EXIT_INSTRUCTION + "\n"));
};

export const displayGoodbye = () => {
  console.log(chalk[UI.COLORS.BLUE](MESSAGES.GOODBYE));
};

export const displayModelSelected = (modelName) => {
  console.log(chalk[UI.COLORS.GREEN](`Selected model: ${modelName}\n`));
};

export const displayModelSwitched = (modelName) => {
  console.log(chalk[UI.COLORS.GREEN](`\nSwitched to model: ${modelName}\n`));
};

export const displayThinking = () => {
  console.log(chalk[UI.COLORS.YELLOW]("\n" + MESSAGES.AI_THINKING));
};

export const displayAIResponse = (response) => {
  console.log(
    chalk[UI.COLORS.CYAN]("\n" + MESSAGES.AI_RESPONSE),
    response,
    "\n"
  );
};

export const selectModel = async () => {
  const modelChoices = Object.entries(models).map(([key, model]) => ({
    name: `${model.name} - ${model.description}`,
    value: key,
  }));

  const { selectedModel } = await inquirer.prompt([
    {
      type: "list",
      name: "selectedModel",
      message: MESSAGES.MODEL_SELECTION,
      choices: modelChoices,
      default: defaultModel,
      pageSize: UI.PAGE_SIZE,
    },
  ]);

  return selectedModel;
};

export const getUserInput = async () => {
  const { prompt } = await inquirer.prompt([
    {
      type: "input",
      name: "prompt",
      message: chalk[UI.COLORS.GREEN](MESSAGES.YOU_PROMPT),
      prefix: UI.PREFIXES.USER,
      validate: (input) => {
        if (!input || input.trim().length === 0) {
          return "Please enter a message";
        }
        return true;
      },
    },
  ]);

  return prompt.trim();
};

export const isExitCommand = (input) => {
  return input.toLowerCase() === COMMANDS.EXIT;
};

export const isModelCommand = (input) => {
  return input.toLowerCase() === COMMANDS.MODEL;
};

export const displayError = (message) => {
  console.error(chalk[UI.COLORS.RED](message));
};

export const displayWarning = (message) => {
  console.warn(chalk[UI.COLORS.YELLOW](message));
};

export const displayInfo = (message) => {
  console.log(chalk[UI.COLORS.CYAN](message));
};
