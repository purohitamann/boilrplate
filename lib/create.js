import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { execaCommand } from 'execa';
import backendBoilerplates from '../templates/backend_boilerplates.json' with { type: 'json' };
import { expressBoilerplate, fastapiBoilerplate, nestjsBoilerplate, djangoBoilerplate } from '../templates/backend_blrp.js';
import minimist from 'minimist';
import inquirer from 'inquirer';
import axios from 'axios';
import ora from 'ora';
import { trackUsage } from './analytics.js';
export async function createProject({ type, framework, appName }) {
  const appDir = path.resolve(process.cwd(), appName);

  if (await fs.pathExists(appDir)) {
    console.log(chalk.red(`🚫 Folder "${appName}" already exists.`));
    return;
  }

  await fs.mkdirp(appDir);
  console.log(chalk.green(`📁 Created project directory: ${appName}\n`));
  
  // Initialize Git repository at the root level first
  const isFullstack = framework.includes('+');
  if (isFullstack) {
    console.log(chalk.blue(`🔄 Initializing Git repository...`));
    try {
      await execaCommand('git init', { cwd: appDir, stdio: 'inherit', shell: true });
      // Create initial .gitignore file
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
    } catch (err) {
      console.error(chalk.yellow(`⚠️ Git initialization failed: ${err.message}`));
    }
  }
  
  console.log(chalk.blue(`⚙️ Setting up your ${type} project...`));
  console.log(chalk.gray(`→ ${framework}`));
  console.log(chalk.gray(`→ ${appName}`));
  console.log(chalk.gray(`→ ${appDir}`));
  console.log(chalk.gray(`→ ${process.cwd()}`));
  // Modify your commands to skip Git initialization where possible
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
    console.log(chalk.red('❌ Unknown framework selected.'));
    return;
  }
  console.log(chalk.blue(`\n⚙️ Setting up your ${framework} project...`));
  try {
    await execaCommand(command, { cwd: appDir, stdio: 'inherit', shell: true });
    console.log(chalk.green(`\n✅ ${framework} setup complete!`));
    
    // Define backend directory based on framework
    const backendDir = isFullstack ? path.join(appDir, 'backend') : appDir;
    
    console.log(chalk.blue(`📦 Creating boilerplate files...`));
    
    // Handle Express.js
    if (framework.includes('Express')) {
      await fs.ensureDir(backendDir);
      await fs.writeFile(path.join(backendDir, 'index.js'), expressBoilerplate);
      console.log(chalk.green(`✅ Created Express.js starter file`));
    }
    
    // Handle FastAPI
    if (framework.includes('FastAPI')) {
      await fs.ensureDir(backendDir);
      await fs.writeFile(path.join(backendDir, 'main.py'), fastapiBoilerplate);
      console.log(chalk.green(`✅ Created FastAPI starter file`));
    }
    
    // Handle NestJS
    if (framework.includes('NestJS')) {
      await fs.ensureDir(path.join(backendDir, 'src'));
      await fs.writeFile(path.join(backendDir, 'src/app.controller.ts'), nestjsBoilerplate);
      console.log(chalk.green(`✅ Created NestJS starter file`));
    }
    
    // Handle Django
    if (framework.includes('Django')) {
      await fs.ensureDir(backendDir);
      await fs.writeFile(path.join(backendDir, 'views.py'), djangoBoilerplate);
      console.log(chalk.green(`✅ Created Django starter file`));
    }
    
    // Create README
    const readmePath = path.join(appDir, 'README.md');
    const boilerplateNotice = `
  ---
  🚀 This project was generated using [boilrplate](https://npmjs.com/package/boilrplate)
  ---
  🚀 Learn More [heyboilrplate.com](https://heyboilrplate.com)
  `;
  
    // Track usage with available data only
    await trackUsage('template_created', {
      stack: framework,
      type: type
    });
    
    if (await fs.pathExists(readmePath)) {
      await fs.appendFile(readmePath, boilerplateNotice);
      console.log(chalk.gray('📘 Appended personalization to README.md'));
    } else {
      await fs.writeFile(readmePath, `# Project\n\n${boilerplateNotice}`);
      console.log(chalk.gray('📘 Created README.md with personalization'));
    }
    
    // Add a step to clean up any Git repositories that might have been created
    if (isFullstack) {
      const frontendGit = path.join(appDir, 'frontend', '.git');
      const backendGit = path.join(appDir, 'backend', '.git');
      
      if (await fs.pathExists(frontendGit)) {
        console.log(chalk.gray(`🧹 Removing Git repository from frontend...`));
        await fs.remove(frontendGit);
      }
      
      if (await fs.pathExists(backendGit)) {
        console.log(chalk.gray(`🧹 Removing Git repository from backend...`));
        await fs.remove(backendGit);
      }
      
      // Create a commit with initial files
      console.log(chalk.blue(`📝 Creating initial Git commit...`));
      try {
        await execaCommand('git add .', { cwd: appDir, stdio: 'inherit', shell: true });
        await execaCommand('git commit -m "Initial commit: Project scaffolded with boilrplate"', 
          { cwd: appDir, stdio: 'inherit', shell: true });
        console.log(chalk.green(`✅ Git repository initialized with initial commit`));
      } catch (gitErr) {
        console.log(chalk.yellow(`⚠️ Git commit failed: ${gitErr.message}`));
      }
    }
    
    console.log(chalk.cyan(`\nNext Steps:\n  cd ${appName} && code .`));} catch (err) {
    console.error(chalk.red(`❌ Failed to scaffold: ${err.message}`));
  }
}

export async function createFullstackAppUsingAI(rawPrompt) {
  const argv = minimist(process.argv.slice(2));
  const appName = argv.name || 'boilr-app';
  const force = argv.force || false;

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@localhost';
  const CLI_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'boilrplate';

  const spinner = ora('🧠 Talking to AI...').start();

  try {

    const { data: config } = await axios.post(`${BACKEND_URL}/interpret`, { prompt: rawPrompt });
    spinner.succeed('✅ AI provided scaffold plan');

    const appDir = path.resolve(process.cwd(), appName);


    if (await fs.pathExists(appDir)) {
      if (force) {
        console.log(chalk.yellow(`⚠️  Overwriting folder "${appName}"...`));
        await fs.remove(appDir);
      } else {
        const { overwrite } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'overwrite',
            message: `Folder "${appName}" exists. Overwrite?`,
            default: false
          }
        ]);
        if (!overwrite) {
          console.log(chalk.red('🚫  Cancelled.'));
          return;
        }
        await fs.remove(appDir);
      }
    }
    await fs.mkdirp(appDir);

    // 3️⃣  ── Create .env
    const envContent = `APP_URL=${APP_URL}
BACKEND_URL=${BACKEND_URL}
SUPPORT_EMAIL=${SUPPORT_EMAIL}
`;
    await fs.writeFile(path.join(appDir, '.env'), envContent);
    console.log(chalk.gray('📦  .env generated'));

    // 4️⃣  ── Run setup commands
    const commands = config.commands;
    if (!commands || typeof commands !== 'object') {
      console.error(chalk.red('❌  Invalid commands from AI.'));
      return;
    }

    for (const [label, steps] of Object.entries(commands)) {
      const stepSpinner = ora(`⚙️  Setting up ${label}...`).start();

      try {
        let runDir = appDir; // Start at root

        for (const singleCmd of steps) {
          const cdMatch = singleCmd.match(/^cd\s+(\S+)$/);

          if (cdMatch) {
            runDir = path.join(appDir, cdMatch[1]);
            await fs.mkdirp(runDir); // Pre-create dir
            continue; // move dir, no command to run
          }

          console.log(chalk.gray(`→ ${singleCmd}`));
          await execaCommand(singleCmd, { cwd: runDir, shell: true, stdio: 'inherit' });
        }

        stepSpinner.succeed(`✅  ${label} done`);
      } catch (err) {
        stepSpinner.fail(`❌  ${label} failed`);
        console.error(chalk.red(err.message || err));
      }
    }

    // 5️⃣  ── Personalize package.json files
    const pkgPaths = [
      path.join(appDir, 'frontend', 'package.json'),
      path.join(appDir, 'backend', 'package.json')
    ];

    for (const pkgPath of pkgPaths) {
      if (await fs.pathExists(pkgPath)) {
        const pkg = await fs.readJson(pkgPath);
        pkg.generatedBy = {
          tool: CLI_NAME,
          version: '1.0.0',
          date: new Date().toISOString()
        };
        await fs.writeJson(pkgPath, pkg, { spaces: 2 });
        console.log(chalk.gray(`📦 Added personalization to ${pkgPath}`));
      }
    }

    // 6️⃣  ── Personalize README.md
    const readmePath = path.join(appDir, 'README.md');
    const boilerplateNotice = `
---
🚀 This project was generated using [${CLI_NAME}](https://npmjs.com/package/${CLI_NAME})
🌐 Learn More → [heyboilrplate.com](https://heyboilrplate.com)
`;

    if (await fs.pathExists(readmePath)) {
      await fs.appendFile(readmePath, boilerplateNotice);
      console.log(chalk.gray('📘 Appended personalization to README.md'));
    } else {
      await fs.writeFile(readmePath, `# ${appName}\n${boilerplateNotice}`);
      console.log(chalk.gray('📘 Created README.md with personalization'));
    }

    // 7️⃣  ── Final user message
    console.log(chalk.green('\n🎉  Project scaffolded successfully!'));
    console.log(chalk.cyan(`\nNext Steps:\n  cd ${appName} && code .\n`));

  } catch (err) {
    spinner.fail('❌ Failed to create app');
    console.error(chalk.red(err.message || err));
  }
}