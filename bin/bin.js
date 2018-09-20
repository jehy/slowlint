#!/usr/bin/env node

'use strict';

const fs = require('fs');
const now = require('performance-now');
const program = require('yargs');
const path = require('path');


const {
  lintAll,
  getIgnoredFiles,
} = require('../slowlint');

function debug(...args) {
  console.log(args.join(' '));
}

const cwd = process.cwd();


function logArgs(argv) {
  if (argv.files.length === 1)
  {
    debug(`Checking path:  "${argv.files[0]}"`);
  }
  else
  {
    debug(`Checking paths:\n\t"${argv.files.join('",\n\t"')}"`);
  }
  debug(`Using ESLint path: "${path.resolve(cwd, argv.eslintPath)}"`);
  if (argv.ignoreFilePath)
  {
    debug(`Using SlowLint ignore file: "${path.resolve(cwd, argv.ignoreFilePath)}"`);
  }
  else
  {
    debug('Not using SlowLint ignore file.');
  }
}

async function saveIgnored(argv) {
  logArgs(argv);
  const {
    ignoreFilePath,
  } = argv;
  const start = now();
  const smallReport = await lintAll(argv);
  debug(`Linter passing: ${smallReport.goodFilesNum}`);
  debug(`Linter not passing: ${smallReport.badFilesNum}`);
  const badFilesRelative = smallReport.badFiles
    .map(file=>path.resolve(file).replace(`${path.resolve(ignoreFilePath, '../')}/`, ''));
  fs.writeFileSync(ignoreFilePath, badFilesRelative.join('\n'));
  const end = now();
  debug(`Linting took ${((end - start) / 1000).toFixed(2)} seconds`);
}


async function checkGood(argv) {
  logArgs(argv);
  const {
    files,
    ignoreFilePath,
  } = argv;
  const ignoredFiles = getIgnoredFiles(files, ignoreFilePath);
  const start = now();
  const smallReport = await lintAll(argv);
  const nowGood = ignoredFiles.filter(item => !smallReport.badFiles.includes(item));
  if (nowGood.length) {
    const end = now();
    debug(`Linting took ${((end - start) / 1000).toFixed(2)} seconds`);
    debug(`Linter passing: ${smallReport.goodFilesNum}`);
    debug(`Linter not passing: ${smallReport.badFilesNum}`);
    debug(`Linter ignored: ${smallReport.ignoredFilesNum}`);
    debug(`Found ${nowGood.length} good files which files which were listed bad`);
    debug('That`s cool but please remove them from .linter-bad.json!');
    debug(`List is the following:\n\n${nowGood.join('\n')}`);
    process.exit(1);
  }
  else {
    const end = now();
    debug(`Linting took ${((end - start) / 1000).toFixed(2)} seconds`);
    debug('No new good files. That`s sad but okay.');
    process.exit(0);
  }
}

async function lint(argv) {
  logArgs(argv);
  const start = now();
  const smallReport = await lintAll(Object.assign({}, argv, {ignoreBad: true}));
  const badFilesFound = smallReport.badFiles;
  if (badFilesFound.length) {
    const end = now();
    debug(`Linting took ${((end - start) / 1000).toFixed(2)} seconds`);
    debug(`Linter passing: ${smallReport.goodFilesNum}`);
    debug(`Linter not passing: ${smallReport.badFilesNum}`);
    debug(`Linter ignored: ${smallReport.ignoredFilesNum}`);
    debug(`Found ${badFilesFound.length} bad files, please fix those!`);
    debug(`List is the following:\n\n${badFilesFound.join('\n')}`);
    debug(smallReport.logs);
    process.exit(1);
  }
  else {
    const end = now();
    debug(`Linting took ${((end - start) / 1000).toFixed(2)} seconds`);
    debug(`Linter passing: ${smallReport.goodFilesNum}`);
    debug(`Linter ignored: ${smallReport.ignoredFilesNum}`);
    debug('Linting went fine, you are cool, dude!');
    process.exit(0);
  }
}

// eslint-disable-next-line no-unused-expressions
program.usage('Usage: $0 <command> [options]')
  .command('lint', 'Lint everything but bad files', {}, lint)
  .command('check-good', 'Check if good files are listed as bad', {}, checkGood)
  .command('save-ignored', 'Make a new list of ignored files (don`t abuse please)', {}, saveIgnored)
  .example('$0 lint --files bin test --eslint-path ~/project1/node_modules/eslint', 'lint bin and test dirs using linter from project1')
  .option('files', {
    type: 'array',
    demandOption: true,
    describe: 'filenames',
  })
  .option('eslintPath', {
    type: 'string',
    nargs: 1,
    describe: 'eslint path',
    default: './node_modules/eslint',
  })
  .option('ignoreFilePath', {
    type: 'string',
    nargs: 1,
    describe: 'path for .slowlintignore file',
    default: '.slowlintignore',
  })
  .option('noProgress', {
    type: 'boolean',
    nargs: 0,
    default: false,
    describe: 'hide progress bar',
  })
  .help('h')
  .alias('h', 'help')
  .argv;
