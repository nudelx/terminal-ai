import gTTS from "gtts";
import player from "play-sound";
import fs from "fs";
import path from "path";
import chalk from "chalk";

const sound = player({});

const cleanTextForTTS = (text) => {
  return text.replace(
    /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
    ""
  );
};

const safeDeleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.warn(
      chalk.yellow(`Warning: Could not delete temporary file: ${error.message}`)
    );
  }
};

export const speakText = async (text, language = "en") => {
  return new Promise((resolve, reject) => {
    try {
      const cleanedText = cleanTextForTTS(text);

      if (!cleanedText.trim()) {
        console.warn(chalk.yellow("No text to speak after cleaning"));
        resolve();
        return;
      }

      const gtts = new gTTS(cleanedText, language);
      const filepath = path.join(process.cwd(), "response.mp3");

      gtts.save(filepath, (err) => {
        if (err) {
          console.error(chalk.red("Error generating speech:"), err.message);
          reject(err);
          return;
        }

        sound.play(filepath, (playErr) => {
          safeDeleteFile(filepath);

          if (playErr) {
            console.error(chalk.red("Error playing audio:"), playErr.message);
            reject(playErr);
          } else {
            resolve();
          }
        });
      });
    } catch (error) {
      console.error(chalk.red("Error in speakText:"), error.message);
      reject(error);
    }
  });
};
