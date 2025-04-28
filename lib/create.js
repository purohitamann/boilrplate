// // lib/create.js  – ES-module version
// import ora from 'ora';
// import axios from 'axios';
// import { execaCommand } from 'execa';
// import chalk from 'chalk';
// import path from 'path';
// import fs from 'fs-extra';
// import inquirer from 'inquirer';
// import minimist from 'minimist';
// import { fileURLToPath } from 'url';
// import { dirname } from 'path';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname  = dirname(__filename);

// // ------- global defaults (override with env if you like)
// const BACKEND_URL   = process.env.NEXT_PUBLIC_BACKEND_URL   || 'http://localhost:8000';
// const APP_URL       = process.env.NEXT_PUBLIC_APP_URL       || 'http://localhost:3000';
// const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@localhost';

// // ---------------------------------------------------------------------------
// // main
// // ---------------------------------------------------------------------------
// export async function createFullstackApp(rawPrompt) {
//   const argv   = minimist(process.argv.slice(2));
//   const appName = argv.name  || 'boilr-app'; // parent folder name
//   const force   = argv.force || false;       // overwrite flag
//   const spinner = ora('Talking to AI...').start();

//   try {
//     // 1️⃣  ── ask your AI backend for stack/command JSON
//     const { data: config } = await axios.post(`${BACKEND_URL}/interpret`, { prompt: rawPrompt });
//     spinner.succeed('Got config from AI ✅');

//     const appDir = path.resolve(process.cwd(), appName);

//     // 2️⃣  ── handle parent folder existence
//     if (fs.existsSync(appDir)) {
//       if (force) {
//         console.log(chalk.yellow(`⚠️  Overwriting existing folder “${appName}”`));
//         await fs.remove(appDir);
//       } else {
//         const { overwrite } = await inquirer.prompt([
//           {
//             type   : 'confirm',
//             name   : 'overwrite',
//             message: `Folder “${appName}” already exists. Overwrite?`,
//             default: false
//           }
//         ]);
//         if (!overwrite) { console.log(chalk.red('🚫  Cancelled.')); return; }
//         await fs.remove(appDir);
//       }
//     }
//     await fs.mkdirp(appDir);

//     // 3️⃣  ── write .env for the generated project
//     const envContent = `APP_URL=${APP_URL}
// BACKEND_URL=${BACKEND_URL}
// SUPPORT_EMAIL=${SUPPORT_EMAIL}
// `;
//     await fs.writeFile(path.join(appDir, '.env'), envContent);
//     console.log(chalk.gray('📦  .env file generated'));

//     // 4️⃣  ── run each command the AI provided
//     const commands = config.commands;
//     if (!commands || typeof commands !== 'object') {
//       console.error(chalk.red('❌  No “commands” object in AI response')); return;
//     }

//     for (const [label, steps] of Object.entries(commands)) {
//       const stepSpinner = ora(`⚙️  ${label} …`).start();
    
//       try {
//         // always start in root, but track where we are
//         let runDir = appDir;
    
//         for (const singleCmd of steps) {
//           // Detect directory changes (`cd xyz`)
//           const cdMatch = singleCmd.match(/^cd\s+(\S+)$/);
//           if (cdMatch) {
//             runDir = path.join(appDir, cdMatch[1]);
//             await fs.mkdirp(runDir);
//             continue;                       // nothing to execute, just move dir
//           }
    
//           console.log(chalk.gray(`→ ${singleCmd}`));
//           await execaCommand(singleCmd, { cwd: runDir, shell: true, stdio: 'inherit' });
//         }
    
//         stepSpinner.succeed(`✅  ${label} done`);
//       } catch (err) {
//         stepSpinner.fail(`❌  ${label} failed`);
//         console.error(chalk.red(err.message || err));
//       }
//     }
//     const frontendDir = path.join(appDir, 'frontend');
// const backendDir = path.join(appDir, 'backend');
//     const pkgPaths = [path.join(frontendDir, 'package.json'), path.join(backendDir, 'package.json')];

// for (const pkgPath of pkgPaths) {
//   if (await fs.pathExists(pkgPath)) {
//     const pkg = await fs.readJson(pkgPath);

//     pkg.generatedBy = {
//       tool: "boilrplate",
//       version: "1.0.0",
//       date: new Date().toISOString()
//     };

//     await fs.writeJson(pkgPath, pkg, { spaces: 2 });
//     console.log(chalk.gray(`📦 Added personalization to ${pkgPath}`));
//   }
// }
// const readmePath = path.join(appDir, 'README.md');

// const boilerplateNotice = `
// ---
// 🚀 This project was generated using [boilrplate](https://npmjs.com/package/boilrplate)
// ---
// 🚀 Learn More [heyboilrplate.com](https://heyboilrplate.com)
// `;

// if (await fs.pathExists(readmePath)) {
//   await fs.appendFile(readmePath, boilerplateNotice);
//   console.log(chalk.gray('📘 Appended personalization to README.md'));
// } else {
//   await fs.writeFile(readmePath, `# Project\n\n${boilerplateNotice}`);
//   console.log(chalk.gray('📘 Created README.md with personalization'));
// }


//     // 5️⃣  ── final message
//     console.log(chalk.green('\n🎉  Project scaffolded!'));
//     console.log(chalk.cyan(`   cd ${appName} && code .\n`));

//   } catch (err) {
//     spinner.fail('❌  Failed to create app');
//     console.error(chalk.red(err.message || err));
//   }
// }
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { execaCommand } from 'execa';
import backendBoilerplates from '../templates/backend_boilerplates.json' with { type: 'json' };


export async function createProject({ type, framework, appName }) {
  const appDir = path.resolve(process.cwd(), appName);

  // Create project folder
  if (await fs.pathExists(appDir)) {
    console.log(chalk.red(`🚫 Folder "${appName}" already exists.`));
    return;
  }

  await fs.mkdirp(appDir);
  console.log(chalk.green(`📁 Created project directory: ${appName}\n`));

  // Mock commands based on framework (You can expand these)
  const commands = {
    'Next.js': 'npx create-next-app@latest . --yes',
    'React': 'npx create-react-app .',
    'Vue.js': 'npm init vue@latest .',
    'Svelte': 'npm create svelte@latest .',
    'Express.js': 'npm init -y && npm install express',
    'FastAPI': 'pip install fastapi uvicorn',
    'NestJS': 'npm i -g @nestjs/cli && nest new backend',
    'Django': 'pip install django',
    'Next.js + Express.js': 'npx create-next-app@latest frontend && mkdir backend && cd backend && npm init -y && npm install express',
    'Next.js + FastAPI': 'npx create-next-app@latest frontend && mkdir backend && cd backend && pip install fastapi uvicorn',
    'React + NestJS': 'npx create-react-app frontend && mkdir backend && cd backend && npm i -g @nestjs/cli && nest new backend',
    'Vue.js + Django': 'npm init vue@latest frontend && mkdir backend && cd backend && pip install django'
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
    if (framework.includes('Express') || framework.includes('FastAPI')) {
      const backendDir = path.join(appDir, 'backend');
      const boilerplate = backendBoilerplates[framework];
    
      if (boilerplate?.filename && boilerplate?.content) {
        await fs.outputFile(
          path.join(backendDir, boilerplate.filename),
          boilerplate.content
        );
        console.log(chalk.green(`📦 Created ${framework} starter file (backend/${boilerplate.filename})`));
      } else {
        console.log(chalk.gray(`ℹ️ ${framework} manages its own scaffolding. No starter file needed.`));
      }
    }
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
  await fs.writeFile(readmePath, `# Project\n\n${boilerplateNotice}`);
  console.log(chalk.gray('📘 Created README.md with personalization'));
}
    console.log(chalk.cyan(`\nNext Steps:\n  cd ${appName} && code .`));

  } catch (err) {
    console.error(chalk.red(`❌ Failed to scaffold: ${err.message}`));
  }
}


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
  
      for (const [label, steps] of Object.entries(commands)) {
        const stepSpinner = ora(`⚙️  ${label} …`).start();
      
        try {
          // always start in root, but track where we are
          let runDir = appDir;
      
          for (const singleCmd of steps) {
            // Detect directory changes (`cd xyz`)
            const cdMatch = singleCmd.match(/^cd\s+(\S+)$/);
            if (cdMatch) {
              runDir = path.join(appDir, cdMatch[1]);
              await fs.mkdirp(runDir);
              continue;                       // nothing to execute, just move dir
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
      const frontendDir = path.join(appDir, 'frontend');
  const backendDir = path.join(appDir, 'backend');
      const pkgPaths = [path.join(frontendDir, 'package.json'), path.join(backendDir, 'package.json')];
  
  for (const pkgPath of pkgPaths) {
    if (await fs.pathExists(pkgPath)) {
      const pkg = await fs.readJson(pkgPath);
  
      pkg.generatedBy = {
        tool: "boilrplate",
        version: "1.0.0",
        date: new Date().toISOString()
      };
  
      await fs.writeJson(pkgPath, pkg, { spaces: 2 });
      console.log(chalk.gray(`📦 Added personalization to ${pkgPath}`));
    }
  }
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
    await fs.writeFile(readmePath, `# Project\n\n${boilerplateNotice}`);
    console.log(chalk.gray('📘 Created README.md with personalization'));
  }
  
  
      // 5️⃣  ── final message
      console.log(chalk.green('\n🎉  Project scaffolded!'));
      console.log(chalk.cyan(`   cd ${appName} && code .\n`));
  
    } catch (err) {
      spinner.fail('❌  Failed to create app');
      console.error(chalk.red(err.message || err));
    }
  }