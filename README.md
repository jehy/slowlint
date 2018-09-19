# SlowLint

[![Build Status](https://travis-ci.org/jehy/slowlint.svg?branch=master)](https://travis-ci.org/jehy/slowlint)
[![dependencies Status](https://david-dm.org/jehy/slowlint/status.svg)](https://david-dm.org/jehy/slowlint)
[![devDependencies Status](https://david-dm.org/jehy/slowlint/dev-status.svg)](https://david-dm.org/jehy/slowlint?type=dev)
[![Coverage Status](https://coveralls.io/repos/github/jehy/slowlint/badge.svg?branch=master)](https://coveralls.io/github/jehy/slowlint?branch=master)
[![Known Vulnerabilities](https://snyk.io/test/github/jehy/slowlint/badge.svg)](https://snyk.io/test/github/jehy/slowlint)

![our pride logo](logo.png)
Implement linting with ESLint slowly on big projects.

## WTF

Sometimes you need to add linting to existing projects. And you have to take it slowly to avoid many merge conflicts.

That's where slowLint saves the day.

What can it do:

### 1. Generate now.eslintignore file

That's same as `.eslintignore` but with another name. Why bother?

* `now.eslintignore` only contains files which could be fixed. Files from `.eslintignore` are not meant to be fixed.
* Any IDE will use `.eslintignore` and ignore `now.eslintignore` - just as planned!
* You can use both `.eslintignore` and `now.eslintignore`.

**Example**
```bash
slowlint save-ignored --files src test --eslint-path ~/project1/node_modules/eslint
```

### 2. Lint

SlowLint can use your existing ESLint package and configuration for linting with both `.eslintignore` and`now.eslintignore` files.

That's great for CI!

**Example**
```bash
slowlint lint --files src test --eslint-path ~/project1/node_modules/eslint
```

### 3. Check for good files

SlowLint can also check if good files (which pass linting) are included in `now.eslintignore` file.

**Example**
```bash
slowlint check-good --files src test --eslint-path ~/project1/node_modules/eslint
```

## Installation

```bash
// install it locally
npm i slowlint --save-dev

// or install globally
npm i -g slowlint

// or simply run with npx
npx slow lintcheck-good --files src test --eslint-path ~/project1/node_modules/eslint

```

## Usage

```
Usage: slowlint <command> [options]

Commands:
  slowlint lint          Lint everything but bad files
  slowlint check-good    Check if good files are listed as bad
  slowlint save-ignored  Make a new list of ignored files

Options:
  --version           Show version number                              [boolean]
  --files, -f         filenames                               [array] [required]
  --eslintPath, -es   eslint path                            [string] [required]
  --help, h          Show help                                        [boolean]
```
