const models = {
  "x-ai/grok-4-fast": {
    id: "x-ai/grok-4-fast:free",
    name: "Grok 4 Fast",
    description: "Grok 4 Fast model",
    maxTokens: 2048,
  },
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
};

const defaultModel = "x-ai/grok-4-fast";

const getModelByKey = (key) => {
  return models[key] || models[defaultModel];
};

export { models, defaultModel, getModelByKey };
