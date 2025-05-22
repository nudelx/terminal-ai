const models = {
  // Free models
  "gemma-3n": {
    id: "google/gemma-3n-e4b-it:free",
    name: "Gemma 3N",
    description: "Google's lightweight Gemma model",
    maxTokens: 2048,
  },
  "mistral-7b": {
    id: "mistralai/mistral-7b-instruct:free",
    name: "Mistral 7B",
    description: "Mistral AI's 7B parameter model",
    maxTokens: 4096,
  },
  "deepseek-r1": {
    id: "deepseek/deepseek-r1:free",
    name: "DeepSeek R1",
    description: "DeepSeek's R1 model",
    maxTokens: 4096,
  },
  // Add more models as needed
};

const defaultModel = "gemma-3n";

module.exports = {
  models,
  defaultModel,
  getModelById: (modelId) => {
    return (
      Object.values(models).find((model) => model.id === modelId) ||
      models[defaultModel]
    );
  },
};
