'use strict';

const {spawn} = require('child_process');
const Debug = require('debug');
const fs = require('fs');
const {assert} = require('chai');

const debug = Debug('slowlint:tests');
debug.enabled = true;

async function spawnPromise(program2, args, options) {

  const display = `Running ${program2} ${args.join(' ')}`;
  debug(display);
  return new Promise((resolve, reject) => {

    const data = [];
    const err = [];
    const ps = spawn(program2, args, options);
    ps.stdout.on('data', (newData) => {
      data.push(newData);
    });

    ps.stderr.on('data', (newData) => {
      err.push(newData);
    });

    ps.on('close', (code) => {
      if (code !== 0) {
        debug(`STDOUT: ${data.join('')}`);
        debug(`STDERR: ${err.join('')}`);
        reject(new Error(`return code ${code}`));
        return;
      }
      resolve(data.join(''));
    });
  });
}

describe('SlowLint', ()=>{
  describe('Linting', ()=>{
    it('should pass good files without .slowlintignore', async ()=>{
      const res = await spawnPromise('bin/bin.js', ['lint', '--files', 'test/lint-ok']);
      debug(res);
    });
    it('should pass good files with empty .slowlintignore', async ()=>{
      const res = await spawnPromise('bin/bin.js',
        ['lint', '--files', 'test/lint-ok-with-ignore', '--ignoreFilePath', 'test/lint-ok-with-ignore/.slowlintignore']);
      debug(res);
    });
    it('should pass bad files mentioned in .slowlintignore', async ()=>{
      const res = await spawnPromise('bin/bin.js',
        ['lint', '--files', 'test/lint-ok-ignored', '--ignoreFilePath', 'test/lint-ok-ignored/.slowlintignore']);
      debug(res);
    });
    it('should fail linting without .slowlintignore', async ()=>{
      try {
        const res = await spawnPromise('bin/bin.js', ['lint', '--files', 'test/lint-fail']);
        debug(res);
      } catch (err)
      {
        return true;
      }
      throw new Error('Linting should fail here');
    });
    it('should fail linting with unmatched .slowlintignore', async ()=>{
      try {
        const res = await spawnPromise('bin/bin.js',
          ['lint', '--files', 'test/lint-fail', '--ignoreFilePath', 'test/lint-ok-with-ignore/.slowlintignore']);
        debug(res);
      } catch (err)
      {
        return true;
      }
      throw new Error('Linting should fail here');
    });
  });
  describe('Check good', ()=>{

    it('should find new good files if there are some ignored', async ()=>{
      try {
        const res = await spawnPromise('bin/bin.js',
          ['check-good', '--files', 'test/check-good-some', '--ignoreFilePath', 'test/check-good-some/.slowlintignore']);
        debug(res);
      }
      catch (err)
      {
        return true;
      }
      throw new Error('good file was not found!');
    });
    it('should not find new good files if there are none', async ()=>{
      const res = await spawnPromise('bin/bin.js',
        ['check-good', '--files', 'test/check-good-none', '--ignoreFilePath', 'test/check-good-none/.slowlintignore']);
      debug(res);
    });
  });
  describe('Save ignored', ()=>{
    it('should save correct list of ignores', async ()=>{
      const ignoreFilePath = 'test/save-ignored/.slowlintignore';
      const ignoresFileGoodContent = fs.readFileSync(ignoreFilePath, {encoding: 'utf8'});
      fs.unlinkSync(ignoreFilePath);
      await spawnPromise('bin/bin.js',
        ['save-ignored', '--files', 'test/save-ignored', '--ignoreFilePath', ignoreFilePath]);
      const ignoresFileNewContent = fs.readFileSync(ignoreFilePath, {encoding: 'utf8'});
      assert.equal(ignoresFileNewContent, ignoresFileGoodContent);
    });
  });

});
