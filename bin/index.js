#!/usr/bin/env node
const { createFullstackApp } = require('../lib/create');

const args = process.argv.slice(2);
createFullstackApp(args);