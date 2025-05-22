require("dotenv").config();
const axios = require("axios");
const inquirer = require("inquirer");
const chalk = require("chalk");
const { models, defaultModel, getModelById } = require("./config/models");

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

if (!OPENROUTER_API_KEY) {
  console.error(chalk.red("Error: OPENROUTER_API_KEY is not set in .env file"));
  process.exit(1);
}

async function chatWithAI(prompt, modelId = models[defaultModel].id) {
  try {
    const model = getModelById(modelId);
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: model.id,
        messages: [{ role: "user", content: prompt }],
        max_tokens: model.maxTokens,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error(
      chalk.red("Error communicating with OpenRouter:"),
      error.message
    );
    return null;
  }
}

async function selectModel() {
  const modelChoices = Object.entries(models).map(([key, model]) => ({
    name: `${model.name} - ${model.description}`,
    value: model.id,
    short: model.name,
  }));

  const { selectedModel } = await inquirer.prompt([
    {
      type: "rawlist",
      name: "selectedModel",
      message: "Select an AI model:",
      choices: modelChoices,
      default: models[defaultModel].id,
      pageSize: 10,
    },
  ]);

  return selectedModel;
}

async function main() {
  console.log(chalk.blue("🤖 Terminal AI Agent"));
  console.log(chalk.gray('Type "exit" to quit\n'));

  const selectedModel = await selectModel();
  console.log(
    chalk.green(`Selected model: ${getModelById(selectedModel).name}\n`)
  );

  while (true) {
    const { prompt } = await inquirer.prompt([
      {
        type: "input",
        name: "prompt",
        message: chalk.green("You:"),
        prefix: "🤔",
      },
    ]);

    if (prompt.toLowerCase() === "exit") {
      console.log(chalk.blue("Goodbye! 👋"));
      break;
    }

    if (prompt.toLowerCase() === "model") {
      const newModel = await selectModel();
      console.log(
        chalk.green(`\nSwitched to model: ${getModelById(newModel).name}\n`)
      );
      continue;
    }

    console.log(chalk.yellow("\nAI is thinking..."));
    const response = await chatWithAI(prompt, selectedModel);

    if (response) {
      console.log(chalk.cyan("\nAI:"), response, "\n");
    }
  }
}

main().catch(console.error);
