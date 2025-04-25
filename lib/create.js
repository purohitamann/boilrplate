// lib/create.js  – ES-module version
import ora from 'ora';
import axios from 'axios';
import { execaCommand } from 'execa';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import minimist from 'minimist';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

// ------- global defaults (override with env if you like)
const BACKEND_URL   = process.env.NEXT_PUBLIC_BACKEND_URL   || 'http://localhost:8000';
const APP_URL       = process.env.NEXT_PUBLIC_APP_URL       || 'http://localhost:3000';
const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@localhost';

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------
export async function createFullstackApp(rawPrompt) {
  const argv   = minimist(process.argv.slice(2));
  const appName = argv.name  || 'boilr-app'; // parent folder name
  const force   = argv.force || false;       // overwrite flag
  const spinner = ora('Talking to AI...').start();

  try {
    // 1️⃣  ── ask your AI backend for stack/command JSON
    const { data: config } = await axios.post(`${BACKEND_URL}/interpret`, { prompt: rawPrompt });
    spinner.succeed('Got config from AI ✅');

    const appDir = path.resolve(process.cwd(), appName);

    // 2️⃣  ── handle parent folder existence
    if (fs.existsSync(appDir)) {
      if (force) {
        console.log(chalk.yellow(`⚠️  Overwriting existing folder “${appName}”`));
        await fs.remove(appDir);
      } else {
        const { overwrite } = await inquirer.prompt([
          {
            type   : 'confirm',
            name   : 'overwrite',
            message: `Folder “${appName}” already exists. Overwrite?`,
            default: false
          }
        ]);
        if (!overwrite) { console.log(chalk.red('🚫  Cancelled.')); return; }
        await fs.remove(appDir);
      }
    }
    await fs.mkdirp(appDir);

    // 3️⃣  ── write .env for the generated project
    const envContent = `APP_URL=${APP_URL}
BACKEND_URL=${BACKEND_URL}
SUPPORT_EMAIL=${SUPPORT_EMAIL}
`;
    await fs.writeFile(path.join(appDir, '.env'), envContent);
    console.log(chalk.gray('📦  .env file generated'));

    // 4️⃣  ── run each command the AI provided
    const commands = config.commands;
    if (!commands || typeof commands !== 'object') {
      console.error(chalk.red('❌  No “commands” object in AI response')); return;
    }

    for (const [label, rawCmd] of Object.entries(commands)) {
      const step = ora(`⚙️  ${label} …`).start();

      try {
        // detect if the command wants frontend / backend folder
        let runDir  = appDir;
        if (/cd\s+frontend/.test(rawCmd)) runDir = path.join(appDir, 'frontend');
        if (/cd\s+backend/.test(rawCmd))  runDir = path.join(appDir, 'backend');

        // ensure those folders exist before running
        await fs.mkdirp(runDir);

        // strip the leading “cd … &&” so execa just runs the real command
        const cleanedCmd = rawCmd.replace(/cd\s+\S+\s+&&\s+/, '');

        console.log(chalk.gray(`→ ${cleanedCmd}`));
        await execaCommand(cleanedCmd, { cwd: runDir, shell: true, stdio: 'inherit' });

        step.succeed(`✅  ${label} done`);
      } catch (err) {
        step.fail(`❌  ${label} failed`);
        console.error(chalk.red(`   ↳ ${err.message || err}`));
      }
    }

    // 5️⃣  ── final message
    console.log(chalk.green('\n🎉  Project scaffolded!'));
    console.log(chalk.cyan(`   cd ${appName} && code .\n`));

  } catch (err) {
    spinner.fail('❌  Failed to create app');
    console.error(chalk.red(err.message || err));
  }
}
