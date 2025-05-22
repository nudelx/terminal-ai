const fs = require("fs").promises;
const path = require("path");
const chalk = require("chalk");

async function createFile(filePath, content) {
  try {
    // Ensure the directory exists
    await fs.mkdir(path.dirname(filePath), { recursive: true });

    // Write the file
    await fs.writeFile(filePath, content, "utf8");
    return true;
  } catch (error) {
    console.error(chalk.red(`Error creating file: ${error.message}`));
    return false;
  }
}

async function readFile(filePath) {
  try {
    const content = await fs.readFile(filePath, "utf8");
    return content;
  } catch (error) {
    console.error(chalk.red(`Error reading file: ${error.message}`));
    return null;
  }
}

async function editFile(filePath, content) {
  try {
    await fs.writeFile(filePath, content, "utf8");
    return true;
  } catch (error) {
    console.error(chalk.red(`Error editing file: ${error.message}`));
    return false;
  }
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

module.exports = {
  createFile,
  readFile,
  editFile,
  fileExists,
};
