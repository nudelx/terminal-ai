import fs from "fs";
import path from "path";
import chalk from "chalk";

export const safeReadJSON = (filePath, defaultValue = null) => {
  try {
    if (!fs.existsSync(filePath)) {
      return defaultValue;
    }

    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.warn(
      chalk.yellow(`Warning: Could not read ${filePath}: ${error.message}`)
    );
    return defaultValue;
  }
};

export const safeWriteJSON = (filePath, data) => {
  try {
    const dir = path.dirname(filePath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(chalk.red(`Error writing to ${filePath}:`), error.message);
    return false;
  }
};

export const createConfigManager = (configPath) => {
  let config = safeReadJSON(configPath, { selectedModel: null });
  let autoSaveInterval = null;

  return {
    get: (key, defaultValue = null) => config[key] ?? defaultValue,

    set: (key, value) => {
      config[key] = value;
    },

    saveConfig: (newConfig) => {
      config = { ...config, ...newConfig };
      return safeWriteJSON(configPath, config);
    },

    loadConfig: () => {
      config = safeReadJSON(configPath, { selectedModel: null });
      return config;
    },
  };
};

export const createHistoryManager = (historyPath) => {
  let history = safeReadJSON(historyPath, []);
  let autoSaveInterval = null;

  return {
    getHistory: () => history,

    addMessage: (role, content) => {
      history.push({ role, content });
    },

    saveHistory: () => {
      return safeWriteJSON(historyPath, history);
    },

    clearHistory: () => {
      history = [];
    },

    startAutoSave: (intervalMs = 5000) => {
      if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
      }

      autoSaveInterval = setInterval(() => {
        safeWriteJSON(historyPath, history);
      }, intervalMs);
    },

    stopAutoSave: () => {
      if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
        autoSaveInterval = null;
      }
    },
  };
};
