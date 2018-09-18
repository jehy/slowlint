'use strict';

const fs = require('fs');

const path = require('path');

const ignoreTemporaryFileName = 'now.eslintignore';
const ignoreForeverFileName = '.eslintignore';

function debug(...args)
{
  console.log(args.join(' '));
}

function getIgnoredFiles(files) {
  try {
    const allIgnored = fs.readFileSync(ignoreTemporaryFileName, 'utf-8')
      .split('\n');
    if (files[0] === '.')
    {
      return allIgnored;
    }
    return allIgnored
      .filter(fname=>files.some(fileOption=>fname.startsWith(fileOption)));
  }
  catch (e) {
    debug(e);
    debug('could not read bad file list, assuming all files are good. Haha!');
  }
  return [];
}

function getIgnoredForeverFiles(files) {
  try {
    if (!fs.existsSync(ignoreForeverFileName))
    {
      return [];
    }
    const allIgnored =  fs.readFileSync(ignoreForeverFileName, 'utf-8')
      .split('\n');
    if (files[0] === '.')
    {
      return allIgnored;
    }
    return allIgnored
      .filter(fname=>files.some(fileOption=>fname.startsWith(fileOption)));
  }
  catch (e) {
    debug(e);
    return [];
  }
}

/**
 *
 * @param {Object} [options]
 * @param {boolean} [options.ignoreBad] do not check bad files
 * @param {string} [options.eslintPath] path to ESLint
 * @param {Array[String]} [options.files] array of files to check
 * @returns {Object} bad files's filenames and a number of good files
 */

function lintAll(options = {}) {
  const eslintPath = path.resolve(process.cwd(), options.eslintPath);
  // eslint-disable-next-line global-require,import/no-dynamic-require
  const {CLIEngine} = require(eslintPath);
  const opts = {
    // envs: ['mocha', 'node'],
    useEslintrc: true,
  };
  let ignoredFilesNum = 0;
  opts.ignorePattern = getIgnoredForeverFiles(options.files);
  if (options.ignoreBad) {
    const ignoredFiles = getIgnoredFiles(options.files);
    ignoredFilesNum = ignoredFiles.length;
    opts.ignorePattern = opts.ignorePattern.concat(ignoredFiles);
  }
  const cli = new CLIEngine(opts);
  let counter = 0;
  cli.addPlugin('counter', {
    processors: {
      '.js': {
        preprocess(text) {
          counter++;
          return [text];
        },
        postprocess(messages) {
          return messages[0];
        },
      },


    },
  });
  const report = cli.executeOnFiles(options.files || ['.']);
  const formatter = cli.getFormatter();
  const errorReport = CLIEngine.getErrorResults(report.results);
  const curDir = `${process.cwd()}/`;
  const badFilesFound = errorReport
    .map(data => data.filePath.replace(curDir, ''));
  let logs = formatter(errorReport);
  if (logs.length > 1000) {
    logs = `${logs.substr(0, 1000)}...`;
  }
  return {
    ignoredFilesNum,
    badFiles: badFilesFound,
    goodFilesNum: counter - badFilesFound.length,
    badFilesNum: badFilesFound.length,
    logs,
  };
}

module.exports = {
  lintAll,
  getIgnoredFiles,
  getIgnoredForeverFiles,
  ignoreForeverFileName,
  ignoreTemporaryFileName,
};
