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
import { 
  displayWelcomeBanner, 
  createSpinner, 
  displayCompletionAnimation,
  displayAIAnalysis,
  displayError 
} from './display.js';

export async function createProject({ type, framework, appName }) {

  await displayWelcomeBanner();
  
  const appDir = path.resolve(process.cwd(), appName);
  const spinner = createSpinner(`Scaffolding ${framework} project...`);
  
  try {

    if (await fs.pathExists(appDir)) {
      spinner.fail(`Folder "${appName}" already exists.`);
      console.error(chalk.red(`ERROR: Directory already exists at ${appDir}`));
      return;
    }
    
    spinner.start();

    await fs.mkdirp(appDir);
    spinner.succeed(`Project directory created: ${appName}`);
    

    const isFullstack = framework.includes('+');
    if (isFullstack) {
      console.log(chalk.blue(`🔄 Initializing Git repository...`));
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
      } catch (err) {
        console.error(chalk.red(`ERROR: Git initialization failed`));
        console.error(chalk.red(`Details: ${err.message}`));
        console.error(chalk.red(`Stack: ${err.stack}`));
      }
    }
    
    console.log(chalk.blue(`⚙️ Setting up your ${type} project...`));
    console.log(chalk.gray(`→ Framework: ${framework}`));
    console.log(chalk.gray(`→ App Name: ${appName}`));
    console.log(chalk.gray(`→ App Directory: ${appDir}`));
    console.log(chalk.gray(`→ Current Working Directory: ${process.cwd()}`));
    

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
      return;
    }
    
    console.log(chalk.blue(`\n⚙️ Setting up your ${framework} project...`));
    console.log(chalk.gray(`→ Executing command: ${command}`));
    
    try {
      await execaCommand(command, { cwd: appDir, stdio: 'inherit', shell: true });
      console.log(chalk.green(`\n✅ ${framework} setup complete!`));
      

      const backendDir = isFullstack ? path.join(appDir, 'backend') : appDir;
      console.log(chalk.gray(`→ Backend directory: ${backendDir}`));
      
      console.log(chalk.blue(`📦 Creating boilerplate files...`));
      

      if (framework.includes('Express')) {
        try {
          await fs.ensureDir(backendDir);
          await fs.writeFile(path.join(backendDir, 'index.js'), expressBoilerplate);
          console.log(chalk.green(`✅ Created Express.js starter file`));
        } catch (err) {
          console.error(chalk.red(`ERROR: Failed to create Express.js starter file`));
          console.error(chalk.red(`Details: ${err.message}`));
        }
      }
      

      if (framework.includes('FastAPI')) {
        try {
          await fs.ensureDir(backendDir);
          await fs.writeFile(path.join(backendDir, 'main.py'), fastapiBoilerplate);
          console.log(chalk.green(`✅ Created FastAPI starter file`));
        } catch (err) {
          console.error(chalk.red(`ERROR: Failed to create FastAPI starter file`));
          console.error(chalk.red(`Details: ${err.message}`));
        }
      }

      if (framework.includes('NestJS')) {
        try {
          await fs.ensureDir(path.join(backendDir, 'src'));
          await fs.writeFile(path.join(backendDir, 'src/app.controller.ts'), nestjsBoilerplate);
          console.log(chalk.green(`✅ Created NestJS starter file`));
        } catch (err) {
          console.error(chalk.red(`ERROR: Failed to create NestJS starter file`));
          console.error(chalk.red(`Details: ${err.message}`));
        }
      }

      if (framework.includes('Django')) {
        try {
          await fs.ensureDir(backendDir);
          await fs.writeFile(path.join(backendDir, 'views.py'), djangoBoilerplate);
          console.log(chalk.green(`✅ Created Django starter file`));
        } catch (err) {
          console.error(chalk.red(`ERROR: Failed to create Django starter file`));
          console.error(chalk.red(`Details: ${err.message}`));
        }
      }
      

      try {
        const readmePath = path.join(appDir, 'README.md');
        const boilerplateNotice = `
---
🚀 This project was generated using [boilrplate](https://npmjs.com/package/boilrplate)
---
🚀 Learn More [heyboilrplate.com](https://heyboilrplate.com)
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
      
      try {
        await trackUsage('template_created', {
          stack: framework,
          type: type
        });
      } catch (err) {
        console.error(chalk.red(`ERROR: Failed to track usage analytics`));
        console.error(chalk.red(`Details: ${err.message}`));
      }

      if (isFullstack) {
        try {
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
            console.error(chalk.red(`ERROR: Git commit failed`));
            console.error(chalk.red(`Details: ${gitErr.message}`));
          }
        } catch (err) {
          console.error(chalk.red(`ERROR: Failed to clean up Git repositories`));
          console.error(chalk.red(`Details: ${err.message}`));
        }
      }
      
      console.log(chalk.cyan(`\nNext Steps:\n  cd ${appName} && code .`));
      
    } catch (err) {
      spinner.fail(`Failed to scaffold project`);
      console.error(chalk.red(`ERROR: Project scaffolding failed`));
      console.error(chalk.red(`Command: ${command}`));
      console.error(chalk.red(`Working Directory: ${appDir}`));
      console.error(chalk.red(`Details: ${err.message}`));
      console.error(chalk.red(`Stack: ${err.stack}`));
      displayError(err.message);
    }
    
  } catch (err) {
    spinner.fail(`Failed to create project`);
    console.error(chalk.red(`ERROR: Project creation failed`));
    console.error(chalk.red(`App Name: ${appName}`));
    console.error(chalk.red(`App Directory: ${appDir}`));
    console.error(chalk.red(`Details: ${err.message}`));
    console.error(chalk.red(`Stack: ${err.stack}`));
    displayError(err.message);
  }
}

export async function createFullstackAppUsingAI(rawPrompt) {
  await displayWelcomeBanner();
  
  const argv = minimist(process.argv.slice(2));
  const appName = argv.name || 'boilr-app';
  const force = argv.force || false;

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://boilrplate-app-ldmom.ondigitalocean.app';
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.heyboilrplate.com/';
  const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'purohitaman@icloud.com';
  const CLI_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'boilrplate';

  console.log(chalk.gray(`→ Backend URL: ${BACKEND_URL}`));
  console.log(chalk.gray(`→ App Name: ${appName}`));
  console.log(chalk.gray(`→ Force Mode: ${force}`));
  console.log(chalk.gray(`→ Raw Prompt: ${rawPrompt}`));

  const spinner = createSpinner('Talking to AI...');
  spinner.start();
  

  try {
    const { data } = await axios.post(`${BACKEND_URL}/interpret`, { prompt: rawPrompt });
    spinner.succeed('✅ AI provided scaffold plan');

    const config = data.result || data;
    
    console.log(chalk.gray(`→ Raw AI Response:`));
    console.log(chalk.gray(JSON.stringify(data, null, 2)));
    
    console.log(chalk.gray(`→ Extracted Config:`));
    console.log(chalk.gray(JSON.stringify(config, null, 2)));
    
    console.log(chalk.gray(`→ AI Response Fields:`));
    console.log(chalk.gray(`   Project Name: ${config?.project_name || 'undefined'}`));
    console.log(chalk.gray(`   Frontend: ${config?.frontend || 'undefined'}`));
    console.log(chalk.gray(`   Backend: ${config?.backend || 'undefined'}`));
    console.log(chalk.gray(`   Database: ${config?.database || 'undefined'}`));
    console.log(chalk.gray(`   Commands: ${config?.commands ? 'present' : 'undefined'}`));

    const projectName = (config && config.project_name && typeof config.project_name === 'string') 
      ? config.project_name 
      : appName;
    
    const appDir = path.resolve(process.cwd(), projectName);
    console.log(chalk.gray(`→ Resolved App Directory: ${appDir}`));
    console.log(chalk.gray(`→ Using Project Name: ${projectName}`));

    if (await fs.pathExists(appDir)) {
      if (force) {
        console.log(chalk.yellow(`⚠️ Force mode: Removing existing directory ${appDir}`));
        await fs.remove(appDir);
      } else {
        const { overwrite } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'overwrite',
            message: `Folder "${projectName}" exists. Overwrite?`,
            default: false
          }
        ]);
        if (!overwrite) {
          console.log(chalk.red('🚫  Cancelled.'));
          return;
        }
        console.log(chalk.yellow(`⚠️ Removing existing directory ${appDir}`));
        await fs.remove(appDir);
      }
    }
    
    try {
      await fs.mkdirp(appDir);
      console.log(chalk.green(`✅ Created directory: ${appDir}`));
    } catch (err) {
      console.error(chalk.red(`ERROR: Failed to create directory ${appDir}`));
      console.error(chalk.red(`Details: ${err.message}`));
      throw err;
    }
    
    try {
      const envContent = `APP_URL=${APP_URL}
BACKEND_URL=${BACKEND_URL}
SUPPORT_EMAIL=${SUPPORT_EMAIL}

# AI Generated Project Configuration
AI_PROJECT_NAME=${projectName}
AI_FRONTEND=${config?.frontend || 'none'}
AI_BACKEND=${config?.backend || 'none'}
AI_DATABASE=${config?.database || 'none'}
AI_STYLE=${config?.style || 'none'}
AI_TYPE=${config?.type || 'unknown'}
AI_PROMPT="${rawPrompt.replace(/"/g, '\\"')}"
AI_GENERATED_DATE=${new Date().toISOString()}
`;
      await fs.writeFile(path.join(appDir, '.env'), envContent);
      console.log(chalk.gray('📦 .env generated with AI configuration'));
    } catch (err) {
      console.error(chalk.red(`ERROR: Failed to create .env file`));
      console.error(chalk.red(`Details: ${err.message}`));
    }

    if (!config) {
      console.error(chalk.red('ERROR: No valid configuration received from AI'));
      console.error(chalk.red(`Original response: ${JSON.stringify(data, null, 2)}`));
      return;
    }

    const commands = config.commands;
    if (!commands || typeof commands !== 'object') {
      console.error(chalk.red('ERROR: Invalid or missing commands from AI'));
      console.error(chalk.red(`Commands received: ${JSON.stringify(commands, null, 2)}`));
      console.error(chalk.red(`Full config: ${JSON.stringify(config, null, 2)}`));

      if (config.frontend || config.backend) {
        console.log(chalk.yellow('⚠️ Attempting to create a basic project structure...'));
        
        const fallbackCommands = {};
        
        if (config.frontend) {
          if (config.frontend.includes('Next.js')) {
            fallbackCommands.frontend = ['npx create-next-app@latest frontend --typescript'];
          } else if (config.frontend.includes('React')) {
            fallbackCommands.frontend = ['npx create-react-app frontend'];
          }
        }
        
        if (config.backend) {
          if (config.backend.includes('Express')) {
            fallbackCommands.backend = ['mkdir -p backend', 'cd backend', 'npm init -y', 'npm install express'];
          } else if (config.backend.includes('FastAPI')) {
            fallbackCommands.backend = ['mkdir -p backend', 'cd backend', 'pip install fastapi uvicorn'];
          }
        }
        
        if (Object.keys(fallbackCommands).length > 0) {
          console.log(chalk.blue('🔄 Using fallback commands...'));
          config.commands = fallbackCommands;
        } else {
          return;
        }
      } else {
        return;
      }
    }

    console.log(chalk.gray(`→ Commands to execute:`));
    console.log(chalk.gray(JSON.stringify(config.commands, null, 2)));

    for (const [category, steps] of Object.entries(config.commands)) {
      console.log(chalk.blue(`\n🔄 Processing category: ${category}`));

      if (!steps || !Array.isArray(steps)) {
        console.error(chalk.red(`ERROR: Invalid steps for category ${category}`));
        console.error(chalk.red(`Steps received: ${JSON.stringify(steps, null, 2)}`));
        continue;
      }

      if (steps.length === 0) {
        console.log(chalk.yellow(`⚠️ Skipping empty command category: ${category}`));
        continue;
      }

      const stepSpinner = ora(`⚙️ Setting up ${category}...`).start();

      try {
        let runDir = appDir;
        console.log(chalk.gray(`→ Starting in directory: ${runDir}`));

        for (const singleCmd of steps) {
          if (!singleCmd || typeof singleCmd !== 'string' || singleCmd.trim() === '') {
            console.error(chalk.red(`ERROR: Invalid command in ${category}`));
            console.error(chalk.red(`Command: ${JSON.stringify(singleCmd)}`));
            continue;
          }

          console.log(chalk.gray(`→ Processing command: ${singleCmd}`));

          const cdMatch = singleCmd.match(/^cd\s+(.+)$/);

          if (cdMatch) {
            const targetDir = cdMatch[1].trim();
            if (!targetDir) {
              console.error(chalk.red(`ERROR: Invalid cd command: ${singleCmd}`));
              continue;
            }
            
            runDir = path.join(appDir, targetDir);
            console.log(chalk.gray(`→ Changing directory to: ${runDir}`));
            
            try {
              await fs.mkdirp(runDir);
              stepSpinner.text = `📁 Changed to ${targetDir}`;
            } catch (err) {
              console.error(chalk.red(`ERROR: Failed to create/change to directory ${runDir}`));
              console.error(chalk.red(`Details: ${err.message}`));
            }
            continue;
          }

          stepSpinner.text = `Running: ${singleCmd}`;
          console.log(chalk.gray(`→ Executing in ${runDir}: ${singleCmd}`));
          
          try {
            await execaCommand(singleCmd, { 
              cwd: runDir, 
              shell: true, 
              stdio: 'inherit' 
            });
            console.log(chalk.green(`✅ Command completed: ${singleCmd}`));
          } catch (cmdErr) {
            console.error(chalk.red(`ERROR: Command failed: ${singleCmd}`));
            console.error(chalk.red(`Working Directory: ${runDir}`));
            console.error(chalk.red(`Details: ${cmdErr.message}`));
            console.error(chalk.red(`Exit Code: ${cmdErr.exitCode}`));
            console.error(chalk.red(`Signal: ${cmdErr.signal}`));
            console.log(chalk.yellow(`⚠️ Continuing with next command...`));
            continue;
          }
        }

        stepSpinner.succeed(`✅ ${category} completed`);
      } catch (err) {
        stepSpinner.fail(`❌ ${category} failed`);
        console.error(chalk.red(`ERROR: Category ${category} failed`));
        console.error(chalk.red(`Details: ${err.message}`));
        console.error(chalk.red(`Stack: ${err.stack}`));
        continue;
      }
    }
    try {
      const pkgPaths = [];
      const projectType = config?.type;

      if (projectType === 'static' || !config?.backend) {
        const mainPkgPath = path.join(appDir, 'package.json');
        pkgPaths.push(mainPkgPath);
        
        if (projectName && projectName !== appName) {
          const projectPkgPath = path.join(appDir, projectName, 'package.json');
          pkgPaths.push(projectPkgPath);
        }
      } else {
        const frontendPkgPath = path.join(appDir, 'frontend', 'package.json');
        const backendPkgPath = path.join(appDir, 'backend', 'package.json');
        pkgPaths.push(frontendPkgPath, backendPkgPath);
      }

      console.log(chalk.gray(`→ Checking package.json files at: ${pkgPaths.join(', ')}`));

      for (const pkgPath of pkgPaths) {
        if (pkgPath && typeof pkgPath === 'string' && await fs.pathExists(pkgPath)) {
          try {
            const pkg = await fs.readJson(pkgPath);
            pkg.generatedBy = {
              tool: CLI_NAME,
              version: '1.0.0',
              date: new Date().toISOString(),
              aiGenerated: true,
              prompt: rawPrompt
            };
            await fs.writeJson(pkgPath, pkg, { spaces: 2 });
            console.log(chalk.gray(`📦 Added personalization to ${path.relative(appDir, pkgPath)}`));
          } catch (pkgErr) {
            console.error(chalk.red(`ERROR: Could not update package.json at ${pkgPath}`));
            console.error(chalk.red(`Details: ${pkgErr.message}`));
          }
        }
      }
    } catch (err) {
      console.error(chalk.red(`ERROR: Failed to personalize package.json files`));
      console.error(chalk.red(`Details: ${err.message}`));
    }

    try {
      const readmePaths = [path.join(appDir, 'README.md')];
      
      if (projectName && projectName !== appName) {
        readmePaths.push(path.join(appDir, projectName, 'README.md'));
      }

      console.log(chalk.gray(`→ Checking README.md files at: ${readmePaths.join(', ')}`));

      let readmeCreated = false;
      for (const readmePath of readmePaths) {
        if (readmePath && typeof readmePath === 'string' && await fs.pathExists(readmePath)) {
          const boilerplateNotice = `
---
🚀 This project was generated using [${CLI_NAME}](https://npmjs.com/package/${CLI_NAME})
🌐 Learn More → [heyboilrplate.com](https://heyboilrplate.com)
🤖 AI Prompt: "${rawPrompt}"
`;

          try {
            await fs.appendFile(readmePath, boilerplateNotice);
            console.log(chalk.gray(`📘 Appended personalization to ${path.relative(appDir, readmePath)}`));
            readmeCreated = true;
            break;
          } catch (readmeErr) {
            console.error(chalk.red(`ERROR: Could not update README at ${readmePath}`));
            console.error(chalk.red(`Details: ${readmeErr.message}`));
          }
        }
      }

      if (!readmeCreated) {
        const defaultReadmePath = path.join(appDir, 'README.md');
        const boilerplateNotice = `# ${projectName}

---
🚀 This project was generated using [${CLI_NAME}](https://npmjs.com/package/${CLI_NAME})
🌐 Learn More → [heyboilrplate.com](https://heyboilrplate.com)
🤖 AI Prompt: "${rawPrompt}"
`;
      
        try {
          await fs.writeFile(defaultReadmePath, boilerplateNotice);
          console.log(chalk.gray('📘 Created README.md with personalization'));
        } catch (readmeErr) {
          console.error(chalk.red(`ERROR: Could not create README at ${defaultReadmePath}`));
          console.error(chalk.red(`Details: ${readmeErr.message}`));
        }
      }
    } catch (err) {
      console.error(chalk.red(`ERROR: Failed to personalize README.md files`));
      console.error(chalk.red(`Details: ${err.message}`));
    }

    console.log(chalk.green('\n🎉 Project scaffolded successfully!'));
    console.log(chalk.cyan(`\nNext Steps:\n  cd ${projectName} && code .\n`));

    try {
      await displayAIAnalysis(config);
      await displayCompletionAnimation(projectName);
    } catch (err) {
      console.error(chalk.red(`ERROR: Failed to display completion animations`));
      console.error(chalk.red(`Details: ${err.message}`));
    }
    
  } catch (err) {
    spinner.fail('AI processing failed');
    console.error(chalk.red(`ERROR: AI processing failed`));
    console.error(chalk.red(`Backend URL: ${BACKEND_URL}`));
    console.error(chalk.red(`Prompt: ${rawPrompt}`));
    console.error(chalk.red(`Details: ${err.message}`));
    console.error(chalk.red(`Stack: ${err.stack}`));
    
    if (err.response) {
      console.error(chalk.red(`HTTP Status: ${err.response.status}`));
      console.error(chalk.red(`Response Data: ${JSON.stringify(err.response.data, null, 2)}`));
    }
    
    displayError(err.message);
  }
}