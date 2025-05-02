#!/usr/bin/env node
import { createFullstackAppUsingAI } from '../lib/create.js';
import inquirer from 'inquirer';
import { createProject } from '../lib/create.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs-extra';
import minimist from 'minimist';
import { randomWaitlistMessage } from '../lib/waitlist.js'; 

import { createAppFromStack } from '../lib/createFromStack.js';
const args = process.argv.slice(2);
const prompt = args.join(' ') || 'I want to create a Next.js app';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const stacks = await fs.readJson(join(__dirname, '../templates/stacks.json'));

console.log('Welcome to boilrplate CLI!\n');
const argv = minimist(process.argv.slice(2));
const accessCode = argv.access;

const VALID_ACCESS_CODE = 'BOILR-ACCESS-2025';

async function runCLI() {
    const input = argv._.join(' ').trim();

  if (input) {
    if (accessCode === VALID_ACCESS_CODE) {
      console.log('Access code accepted! Unlocking AI-powered setup...');
      runAIMode(input);
    } else {
      console.log(randomWaitlistMessage());
      console.log(`
📚 Check the docs for predefined templates:
🔗 https://www.heyboilrplate.com
📬 Or join the waitlist:  https://www.heyboilrplate.com
`);
    }
    return;
  }
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
  await createProject({ type, framework, appName });
}

runCLI();

function runAIMode(){
    createFullstackAppUsingAI(prompt);
}

const argsv = minimist(process.argv.slice(2));
const [frontend, backend, database] = argsv._;
const appName = argsv.name || 'boilr-app';
const flat = argsv.flat || false;

if (!frontend || !backend) {
  console.log(`Usage: npx boilrplate <frontend> <backend> [database] --name <app-name> --flat`);
  process.exit(1);
}

createAppFromStack({ frontend, backend, database, appName, flat });