import axios from "axios";
import chalk from "chalk";
import { MESSAGES, API } from "../config/constants.js";
import { getModelByKey } from "../config/models.js";

export const createAIClient = (apiKey) => ({
  apiKey,
  baseURL: API.BASE_URL,
  headers: {
    ...API.HEADERS,
    Authorization: `Bearer ${apiKey}`,
  },
});

export const sendMessage = async (client, history, modelId) => {
  try {
    const model = getModelByKey(modelId);

    if (!model) {
      throw new Error(`${MESSAGES.ERROR_INVALID_MODEL}: ${modelId}`);
    }

    const response = await axios.post(
      client.baseURL,
      {
        model: model.id,
        messages: history,
        max_tokens: model.maxTokens,
      },
      {
        headers: client.headers,
        timeout: 30000,
      }
    );

    if (!response.data?.choices?.[0]?.message?.content) {
      throw new Error("Invalid response format from AI service");
    }

    return response.data.choices[0].message.content;
  } catch (error) {
    if (error.code === "ECONNABORTED") {
      console.error(chalk.red("Request timeout. Please try again."));
    } else if (error.response?.status === 401) {
      console.error(
        chalk.red("Invalid API key. Please check your OPENROUTER_API_KEY.")
      );
    } else if (error.response?.status === 429) {
      console.error(
        chalk.red("Rate limit exceeded. Please wait before trying again.")
      );
    } else {
      console.error(chalk.red(MESSAGES.ERROR_OPENROUTER), error.message);
    }
    return null;
  }
};
