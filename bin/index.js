#!/usr/bin/env node
const { generateBoilerplate } = require('../lib/generate');

const args = process.argv.slice(2);
generateBoilerplate(args);