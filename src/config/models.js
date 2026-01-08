const models = {
  "mimo-v2-flash": {
    id: "xiaomi/mimo-v2-flash:free",
    name: "Mimo V2 Flash",
    description: "Xiaomi's Mimo V2 Flash model",
    maxTokens: 4096,
  },
  "gemini-2.0-flash": {
    id: "google/gemini-2.0-flash-exp:free",
    name: "Gemini 2.0 Flash",
    description: "Google's Gemini 2.0 Flash experimental",
    maxTokens: 8192,
  },
  "llama-3.3-70b": {
    id: "meta-llama/llama-3.3-70b-instruct:free",
    name: "Llama 3.3 70B",
    description: "Meta's Llama 3.3 70B Instruct",
    maxTokens: 8192,
  },
  "qwen-2.5-72b": {
    id: "qwen/qwen-2.5-72b-instruct:free",
    name: "Qwen 2.5 72B",
    description: "Alibaba's Qwen 2.5 72B Instruct",
    maxTokens: 8192,
  },
};

const defaultModel = "mimo-v2-flash";

const getModelByKey = (key) => models[key] || models[defaultModel];

export { models, defaultModel, getModelByKey };
