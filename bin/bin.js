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

function saveIgnored(files, eslintPath, ignoreFilePath) {
  const start = now();
  const smallReport = lintAll({files, eslintPath, ignoreFilePath});
  debug(`Linter passing: ${smallReport.goodFilesNum}`);
  debug(`Linter not passing: ${smallReport.badFilesNum}`);
  fs.writeFileSync(ignoreFilePath, smallReport.badFiles.join('\n'));
  const end = now();
  debug(`Linting took ${((end - start) / 1000).toFixed(3)} seconds`);
}


function checkGood(files, eslintPath, ignoreFilePath) {
  const ignoredFiles = getIgnoredFiles(files, ignoreFilePath);
  const start = now();
  const smallReport = lintAll({files, eslintPath, ignoreFilePath});
  const nowGood = ignoredFiles.filter(item => !smallReport.badFiles.includes(item));
  if (nowGood.length) {
    const end = now();
    debug(`Linting took ${((end - start) / 1000).toFixed(3)} seconds`);
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
    debug(`Linting took ${((end - start) / 1000).toFixed(3)} seconds`);
    debug('No new good files. That`s sad but okay.');
    process.exit(0);
  }
}

function lint(files, eslintPath, ignoreFilePath) {
  const start = now();
  const smallReport = lintAll({
    ignoreBad: true, files, eslintPath, ignoreFilePath,
  });
  const badFilesFound = smallReport.badFiles;
  if (badFilesFound.length) {
    const end = now();
    debug(`Linting took ${((end - start) / 1000).toFixed(3)} seconds`);
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
    debug(`Linting took ${((end - start) / 1000).toFixed(3)} seconds`);
    debug(`Linter passing: ${smallReport.goodFilesNum}`);
    debug(`Linter ignored: ${smallReport.ignoredFilesNum}`);
    debug('Linting went fine, you are cool, dude!');
    process.exit(0);
  }
}

function fixFilesArgs(files) {
  if (!files || !files.length) {
    return null;
  }
  return files
    .map(file => file.trim())
    .map(file=>path.resolve(file));
}

function logArgs(allFiles, argv) {
  debug(`Checking paths:\n\t"${allFiles.join('",\n\t"')}"\nUsing ESLint path: "${path.resolve(process.cwd(), argv.eslintPath)}"`);
}

// eslint-disable-next-line no-unused-expressions
program.usage('Usage: $0 <command> [options]')
  .command('lint', 'Lint everything but bad files', {}, (argv) => {
    const allFiles = fixFilesArgs(argv.files);
    logArgs(allFiles, argv);
    lint(allFiles, argv.eslintPath, argv.ignoreFilePath);
  })
  .command('check-good', 'Check if good files are listed as bad', {}, (argv) => {
    const allFiles = fixFilesArgs(argv.files);
    logArgs(allFiles, argv);
    checkGood(allFiles, argv.eslintPath, argv.ignoreFilePath);
  })
  .command('save-ignored', 'Make a new list of ignored files (don`t abuse please)', {}, (argv) => {
    const allFiles = fixFilesArgs(argv.files);
    logArgs(allFiles, argv);
    saveIgnored(allFiles, argv.eslintPath, argv.ignoreFilePath);
  })
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
  .help('h')
  .alias('h', 'help')
  .argv;
