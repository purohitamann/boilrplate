#!/usr/bin/env node
const { generateBoilerplate } = require('../lib/create');

const args = process.argv.slice(2);
generateBoilerplate(args);