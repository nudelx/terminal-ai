import {OpenRouter} from "@openrouter/sdk";
import chalk from "chalk";
import { MESSAGES } from "../config/constants.js";
import { getModelByKey } from "../config/models.js";

export const createAIClient = (apiKey) =>
  new OpenRouter({ apiKey });

export const sendMessage = async (client, history, modelId) => {
  try {
    const model = getModelByKey(modelId);

    if (!model) {
      throw new Error(`${MESSAGES.ERROR_INVALID_MODEL}: ${modelId}`);
    }

    const response = await client.chat.send({
      model: model.id,
      messages: history,
      max_tokens: model.maxTokens,
    });

    const content = response.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Invalid response format from AI service");
    }

    return content;
  } catch (error) {
    const status = error.status || error.response?.status;

    const errorHandlers = {
      401: () => console.error(chalk.red("Invalid API key. Please check your OPENROUTER_API_KEY.")),
      404: () => console.error(chalk.red(`Model not found: ${getModelByKey(modelId)?.id}. Check available models at openrouter.ai/models`)),
      429: () => console.error(chalk.red("Rate limit exceeded. Please wait before trying again.")),
    };

    const handler = errorHandlers[status];
    
    if (handler) {
      handler();
    } else if (error.code === "ECONNABORTED") {
      console.error(chalk.red("Request timeout. Please try again."));
    } else {
      console.error(chalk.red(MESSAGES.ERROR_OPENROUTER), error.message);
    }

    return null;
  }
};
