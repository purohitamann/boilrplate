#!/usr/bin/env node
import inquirer from 'inquirer';
import minimist from 'minimist';
import fs from 'fs-extra';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';


import { createFullstackAppUsingAI } from '../lib/create.js';
import { createProject } from '../lib/create.js';
import { createAppFromStack } from '../lib/createFromStack.js';
import { randomWaitlistMessage } from '../lib/waitlist.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const stacks = await fs.readJson(join(__dirname, '../templates/stacks.json'));

console.log('Welcome to boilrplate CLI!\n');

const argv = minimist(process.argv.slice(2));
const input = argv._.join(' ').trim();
const accessCode = argv.access;
const VALID_ACCESS_CODE = 'BOILR-ACCESS-2025';

async function runCLI() {
  // Handle AI mode with access code
  if (input && accessCode) {
    if (accessCode === VALID_ACCESS_CODE) {
      console.log('Access code accepted! Unlocking AI-powered setup...\n');
      return runAIMode(input);
    } else {
      console.log(randomWaitlistMessage());
      console.log(`
📚 Check the docs for predefined templates:
🔗 https://www.heyboilrplate.com
📬 Or join the waitlist:  https://www.heyboilrplate.com
`);
      return;
    }
  }

  // Handle stack selection using --list
  if (argv.list) {
    const { type } = await inquirer.prompt([
      {
        type: 'list',
        name: 'type',
        message: 'What do you want to scaffold?',
        choices: [
          { name: 'Frontend', value: 'frontend' },
          { name: 'Backend', value: 'backend' },
          { name: 'Fullstack', value: 'fullstack' },
          { name: 'Custom AI-Powered Setup (Coming Soon 🚀)', value: 'ai' }
        ]
      }
    ]);

    if (type === 'ai') {
      console.log(`
🚧 AI-powered custom scaffolding is still under development!

Join the waitlist and get early access:
https://www.heyboilrplate.com

Meanwhile, explore predefined templates today!
`);
      return;
    }

    const { framework } = await inquirer.prompt([
      {
        type: 'list',
        name: 'framework',
        message: `Pick your ${type} framework:`,
        choices: stacks[type]
      }
    ]);

    const { appName } = await inquirer.prompt([
      {
        type: 'input',
        name: 'appName',
        message: 'Name your project folder:',
        default: 'my-boilrplate-app'
      }
    ]);

    return createProject({ type, framework, appName });
  }

  // If not using --list or --access, check for stack args
  const [frontend, backend, database] = argv._;
  const flat = argv.flat || false;
  const appName = argv.name || 'boilr-app';

  if (!frontend || !backend) {
    console.log(`Usage:

npx boilrplate --list                       # Pick your stack via prompts
npx boilrplate <frontend> <backend> [db]    # Scaffold via CLI
npx boilrplate "I want a next app" --access YOUR-ACCESS-CODE
`);
    process.exit(1);
  }

  return createAppFromStack({ frontend, backend, database, appName, flat });
}

function runAIMode(prompt) {
  createFullstackAppUsingAI(prompt);
}

runCLI();
