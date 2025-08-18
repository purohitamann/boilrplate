import chalk from 'chalk';
import fs from 'fs-extra';

/**
 * Ensure the application directory exists and is ready.
 * @param {string} appDir - Absolute path to app directory.
 * @param {string} appName - Name of the application.
 * @param {ora.Ora} spinner - CLI spinner instance.
 * @returns {Promise<boolean>} True if directory created, false if already exists.
 */
export async function ensureAppDir(appDir, appName, spinner) {
  if (await fs.pathExists(appDir)) {
    spinner.fail(`Folder "${appName}" already exists.`);
    console.error(chalk.red(`ERROR: Directory already exists at ${appDir}`));
    return false;
  }

  spinner.start();
  await fs.mkdirp(appDir);
  spinner.succeed(`Project directory created: ${appName}`);
  return true;
}
