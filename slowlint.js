'use strict';

const fs = require('fs');
const path = require('path');
const CliProgress = require('cli-progress');
const Promise = require('bluebird');


const ignoreForeverFileName = '.eslintignore';
const cwd = process.cwd();
const {exec} = require('child_process');

function debug(...args)
{
  console.log(args.join(' '));
}

function getIgnoredFiles(files, ignoreFilePath) {
  if (!fs.existsSync(ignoreFilePath))
  {
    debug(`ignore file not found in path ${ignoreFilePath}, assuming there are no ignores`);
    return [];
  }
  const allIgnored = fs.readFileSync(ignoreFilePath, 'utf-8')
    .split('\n')
    .map(file=>file.trim())
    .filter(file=>file)
    .map(file=>path.resolve(ignoreFilePath, '../', file).replace(`${cwd}/`, ''));
  if (files[0] === '.')
  {
    return allIgnored;
  }
  return allIgnored
    .filter(ignoredFileName=>files.some(fileIncludedInCheck=>ignoredFileName.startsWith(fileIncludedInCheck)));

}

function getIgnoredForeverFiles(files) {
  if (!fs.existsSync(ignoreForeverFileName))
  {
    return [];
  }
  const allIgnored =  fs.readFileSync(ignoreForeverFileName, 'utf-8')
    .split('\n')
    .map(file=>file.trim())
    .filter(file=>file)
    .map(file=>path.resolve(ignoreForeverFileName, '../', file).replace(cwd, ''));
  if (files[0] === '.')
  {
    return allIgnored;
  }
  return allIgnored
    .filter(ignoredFileName=>files.some(fileIncludedInCheck=>ignoredFileName.startsWith(fileIncludedInCheck)));
}

async function countFiles(files)
{
  return Promise.reduce(files, (res, file)=>{
    return new Promise((resolve, reject)=>{
      exec(`find ${file} -type f -name "*.js" ! -path "*/node_modules/*" | wc -l`, (error, stdout, stderr) => {
        if (error)
        {
          reject(error);
          return;
        }
        resolve(res + parseInt(stdout, 10));
      });
    });
  }, 0)
    .catch(err=>debug(err));
}
/**
 *
 * @param {Object} [options]
 * @param {boolean} [options.ignoreBad] do not check bad files
 * @param {string} [options.eslintPath] path to ESLint
 * @param {string} [options.ignoreFilePath] path to slowlint ignore file
 * @param {Array[String]} [options.files] array of files to check
 * @returns {Object} bad files's filenames and a number of good files
 */

async function lintAll(options = {}) {
  let progressBar;
  let showProgress = !options.noProgress;
  let total = 0;
  if (showProgress)
  {
    total = await countFiles(options.files);
  }
  if (!total)
  {
    showProgress = false;
  }
  // debug(`lintAll options: ${JSON.stringify(options, null, 3)}`);
  const eslintPath = path.resolve(cwd, options.eslintPath);
  // eslint-disable-next-line global-require,import/no-dynamic-require
  const {CLIEngine} = require(eslintPath);
  const opts = {
    useEslintrc: true,
  };
  let ignoredFilesNum = 0;
  opts.ignorePattern = getIgnoredForeverFiles(options.files);
  if (options.ignoreBad) {
    const ignoredFiles = getIgnoredFiles(options.files, options.ignoreFilePath);
    ignoredFilesNum = ignoredFiles.length;
    opts.ignorePattern = opts.ignorePattern.concat(ignoredFiles);
  }
  total -= opts.ignorePattern.length;
  if (showProgress)
  {
    progressBar = new CliProgress.Bar({
      format: 'Linting [{bar}] {percentage}% | ETA: {eta}s | {value}/{total}',
      etaBuffer: 200,
      fps: 1,
    }, CliProgress.Presets.shades_classic);
    progressBar.start(total, 0);
  }
  // debug(`lintAll opts: ${JSON.stringify(opts, null, 3)}`);
  const cli = new CLIEngine(opts);
  let counter = 0;
  cli.addPlugin('counter', {
    processors: {
      '.js': {
        preprocess(text) {
          counter++;
          if (showProgress)
          {
            progressBar.update(counter);
          }
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
  const badFilesFound = errorReport
    .map(data => data.filePath.replace(`${cwd}/`, ''));
  let logs = formatter(errorReport);
  if (logs.length > 1000) {
    logs = `${logs.substr(0, 1000)}...`;
  }
  if (showProgress)
  {
    progressBar.setTotal(counter);
    progressBar.stop();
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
};
