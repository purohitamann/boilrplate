#!/usr/bin/env node
process.env.ENVIRONMENT = 'production';
process.env.NEXT_PUBLIC_BACKEND_URL = 'manicode-backend.onrender.com';
process.env.NEXT_PUBLIC_APP_URL = 'https://codebuff.com';
process.env.NEXT_PUBLIC_SUPPORT_EMAIL = 'support@codebuff.com';
const { createFullstackApp } = require('../lib/create');

const args = process.argv.slice(2);
const appName = args[0] || 'app';
createFullstackApp(appName, 'menn');



// GOAL

// npx boilrplate "I want to create a Stitic protfolio using next"