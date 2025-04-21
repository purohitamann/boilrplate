#!/usr/bin/env node

// process.env.ENVIRONMENT = 'production';
// process.env.NEXT_PUBLIC_BACKEND_URL = 'https://manicode-backend.onrender.com';
// process.env.NEXT_PUBLIC_APP_URL = 'https://codebuff.com';
// process.env.NEXT_PUBLIC_SUPPORT_EMAIL = 'support@codebuff.com';

import { createFullstackApp } from '../lib/create.js';
const args = process.argv.slice(2);
const prompt = args.join(' ') || 'I want to create a Next.js app';

createFullstackApp(prompt); // offload all logic into create.js now

// GOAL

// npx boilrplate "I want to create a Stitic protfolio using next"