import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { execaCommand } from 'execa';
import { CLI_NAME } from './config.js';

/**
 * Initialize a git repository and create the initial commit.
 * Cleans up nested git repos created by frameworks.
 * @param {string} appDir - Absolute path to app directory.
 */
export async function initGitRepo(appDir) {
  console.log(chalk.blue(`\uD83D\uDD04 Initializing Git repository...`));
  try {
    await execaCommand('git init', { cwd: appDir, stdio: 'inherit', shell: true });

    const gitignoreContent = `
# Dependencies
node_modules
.pnp
.pnp.js
__pycache__/
venv/
.env

# Testing
coverage

# Production
build
dist
.next
out

# Misc
.DS_Store
*.pem
.idea/
.vscode/

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env.local
.env.development.local
.env.test.local
.env.production.local
`;
    await fs.writeFile(path.join(appDir, '.gitignore'), gitignoreContent);

    const frontendGit = path.join(appDir, 'frontend', '.git');
    const backendGit = path.join(appDir, 'backend', '.git');

    if (await fs.pathExists(frontendGit)) {
      console.log(chalk.gray(`\uD83E\uDDF9 Removing Git repository from frontend...`));
      await fs.remove(frontendGit);
    }

    if (await fs.pathExists(backendGit)) {
      console.log(chalk.gray(`\uD83E\uDDF9 Removing Git repository from backend...`));
      await fs.remove(backendGit);
    }

    console.log(chalk.blue(`\uD83D\uDCDD Creating initial Git commit...`));
    await execaCommand('git add .', { cwd: appDir, stdio: 'inherit', shell: true });
    await execaCommand(`git commit -m "Initial commit: Project scaffolded with ${CLI_NAME}"`, {
      cwd: appDir,
      stdio: 'inherit',
      shell: true,
    });
    console.log(chalk.green(`\u2705 Git repository initialized with initial commit`));
  } catch (err) {
    console.error(chalk.red(`ERROR: Git initialization failed`));
    console.error(chalk.red(`Details: ${err.message}`));
    console.error(chalk.red(`Stack: ${err.stack}`));
  }
}
