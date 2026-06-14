#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const MIN = 2000;
const MAX = 10000;

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const value = randInt(MIN, MAX);
const today = new Date().toISOString().slice(0, 10);

const out = {
  date: today,
  value: value
};

const outPath = path.resolve(__dirname, '..', 'js', 'daily_value.json');

fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8');
console.log(`Wrote daily value ${value} to ${outPath}`);

process.exit(0);
