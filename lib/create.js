import ora from 'ora';
import axios from 'axios';
import { execaCommand } from 'execa';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@localhost';

// Necessary for __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function createFullstackApp(prompt) {
  const spinner = ora('Talking to AI...').start();

  try {
    // 1. Talk to AI backend
    const res = await axios.post(`${BACKEND_URL}/interpret`, { prompt });
    const config = res.data;
    console.log('📦 AI response:\n', config);


    const appName = config.name || 'boilr-app';
    const appDir = path.resolve(process.cwd());
    await fs.mkdirp(appDir);

    spinner.succeed('Got config from AI ✅');
    // console.log(chalk.green('🧠 Stack:'), config);

    // 2. Create a .env file
    const envContent = `APP_URL=${APP_URL}
BACKEND_URL=${BACKEND_URL}
SUPPORT_EMAIL=${SUPPORT_EMAIL}
`;
    await fs.writeFile(path.join(appDir, '.env'), envContent);
    console.log(chalk.gray('📦 .env file generated'));

    // 3. Run shell commands
    const commands = config.commands;
console.log(chalk.gray('📦 Running commands...', commands));
    if (!commands || typeof commands !== 'object') {
      console.error('❌ Invalid or missing commands from AI response');
      return;
    }
    
    for (const [label, cmd] of Object.entries(commands)) {
      const stepSpinner = ora(`⚙️ Running setup for ${label}`).start();
    
      try {
        // Pre-create folders if needed
        if (cmd.includes('cd frontend')) await fs.mkdirp(path.join(appDir, 'frontend'));
        if (cmd.includes('cd backend')) await fs.mkdirp(path.join(appDir, 'backend'));
    
        console.log(chalk.gray(`→ Executing: ${cmd}`));
    
        await execaCommand(cmd, {
          cwd: appDir,
          shell: true,
          stdio: 'inherit',
        });
    
        stepSpinner.succeed(`✅ ${label} setup complete`);
      } catch (error) {
        stepSpinner.fail(`❌ ${label} failed`);
        console.error(chalk.red(error.message || error));
        throw error;
      }
    }
    

    console.log(chalk.green('\n🎉 Project created successfully!'));
    console.log(chalk.cyan(`\nNext Steps:`));
    console.log(chalk.cyan(`cd ${appName} && code .`));
  } catch (err) {
    spinner.fail('❌ Failed to create app');
    console.error(chalk.red(err.message || err));
  }
}
