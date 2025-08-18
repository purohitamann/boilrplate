import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { execaCommand } from 'execa';
import { expressBoilerplate, fastapiBoilerplate, nestjsBoilerplate, djangoBoilerplate } from '../templates/backend_blrp.js';

/**
 * Run the framework scaffolding command and create boilerplate files.
 * @param {string} appDir - Absolute path to app directory.
 * @param {string} framework - Selected framework stack string.
 * @param {boolean} isFullstack - Whether the project is fullstack.
 */
export async function runFramework(appDir, framework, isFullstack) {
  const commands = {
    'Next.js': 'npx create-next-app@latest . --yes',
    'React': 'npx create-react-app .',
    'Vue.js': 'npm init vue@latest .',
    'Svelte': 'npm create svelte@latest .',
    'Express.js': 'npm init -y && npm install express',
    'FastAPI': 'pip install fastapi uvicorn',
    'NestJS': 'npm i -g @nestjs/cli && nest new backend',
    'Django': 'pip install django',
    'Next.js + Express.js': 'npx create-next-app@latest frontend --no-git && mkdir backend && cd backend && npm init -y && npm install express',
    'Next.js + FastAPI': 'npx create-next-app@latest frontend --no-git && mkdir backend && cd backend && pip install fastapi uvicorn',
    'React + NestJS': 'npx create-react-app frontend --use-npm && mkdir backend && cd backend && npm i -g @nestjs/cli && nest new backend --skip-git',
    'Vue.js + Django': 'npm init vue@latest frontend -- --no-git && mkdir backend && cd backend && pip install django'
  };

  const command = commands[framework];

  if (!command) {
    console.error(chalk.red(`ERROR: Unknown framework selected: ${framework}`));
    console.error(chalk.red(`Available frameworks: ${Object.keys(commands).join(', ')}`));
    throw new Error('Unknown framework');
  }

  console.log(chalk.blue(`\n\u2699\uFE0F Setting up your ${framework} project...`));
  console.log(chalk.gray(`\u2192 Executing command: ${command}`));

  await execaCommand(command, { cwd: appDir, stdio: 'inherit', shell: true });
  console.log(chalk.green(`\n\u2705 ${framework} setup complete!`));

  const backendDir = isFullstack ? path.join(appDir, 'backend') : appDir;
  console.log(chalk.gray(`\u2192 Backend directory: ${backendDir}`));

  console.log(chalk.blue(`\uD83D\uDCE6 Creating boilerplate files...`));

  if (framework.includes('Express')) {
    try {
      await fs.ensureDir(backendDir);
      await fs.writeFile(path.join(backendDir, 'index.js'), expressBoilerplate);
      console.log(chalk.green(`\u2705 Created Express.js starter file`));
    } catch (err) {
      console.error(chalk.red(`ERROR: Failed to create Express.js starter file`));
      console.error(chalk.red(`Details: ${err.message}`));
    }
  }

  if (framework.includes('FastAPI')) {
    try {
      await fs.ensureDir(backendDir);
      await fs.writeFile(path.join(backendDir, 'main.py'), fastapiBoilerplate);
      console.log(chalk.green(`\u2705 Created FastAPI starter file`));
    } catch (err) {
      console.error(chalk.red(`ERROR: Failed to create FastAPI starter file`));
      console.error(chalk.red(`Details: ${err.message}`));
    }
  }

  if (framework.includes('NestJS')) {
    try {
      await fs.ensureDir(path.join(backendDir, 'src'));
      await fs.writeFile(path.join(backendDir, 'src/app.controller.ts'), nestjsBoilerplate);
      console.log(chalk.green(`\u2705 Created NestJS starter file`));
    } catch (err) {
      console.error(chalk.red(`ERROR: Failed to create NestJS starter file`));
      console.error(chalk.red(`Details: ${err.message}`));
    }
  }

  if (framework.includes('Django')) {
    try {
      await fs.ensureDir(backendDir);
      await fs.writeFile(path.join(backendDir, 'views.py'), djangoBoilerplate);
      console.log(chalk.green(`\u2705 Created Django starter file`));
    } catch (err) {
      console.error(chalk.red(`ERROR: Failed to create Django starter file`));
      console.error(chalk.red(`Details: ${err.message}`));
    }
  }
}
