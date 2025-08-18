import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { CLI_NAME, APP_URL } from './config.js';

/**
 * Write or append the boilerplate notice to README.md.
 * @param {string} appDir - Absolute path to app directory.
 * @param {string} appName - Name of the application.
 */
export async function writeReadme(appDir, appName) {
  try {
    const readmePath = path.join(appDir, 'README.md');
    const boilerplateNotice = `
---
🚀 This project was generated using [${CLI_NAME}](https://npmjs.com/package/${CLI_NAME})
---
🚀 Learn More [${APP_URL.replace(/^https?:\/\/(www\.)?/, '')}](${APP_URL})
`;

    if (await fs.pathExists(readmePath)) {
      await fs.appendFile(readmePath, boilerplateNotice);
      console.log(chalk.gray('📘 Appended personalization to README.md'));
    } else {
      await fs.writeFile(readmePath, `# ${appName}\n\n${boilerplateNotice}`);
      console.log(chalk.gray('📘 Created README.md with personalization'));
    }
  } catch (err) {
    console.error(chalk.red(`ERROR: Failed to create/update README.md`));
    console.error(chalk.red(`Details: ${err.message}`));
  }
}
