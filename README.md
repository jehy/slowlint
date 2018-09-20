# Slowlint

[![Build Status](https://travis-ci.org/jehy/slowlint.svg?branch=master)](https://travis-ci.org/jehy/slowlint)
[![dependencies Status](https://david-dm.org/jehy/slowlint/status.svg)](https://david-dm.org/jehy/slowlint)
[![devDependencies Status](https://david-dm.org/jehy/slowlint/dev-status.svg)](https://david-dm.org/jehy/slowlint?type=dev)
[![Coverage Status](https://coveralls.io/repos/github/jehy/slowlint/badge.svg?branch=master)](https://coveralls.io/github/jehy/slowlint?branch=master)
[![Known Vulnerabilities](https://snyk.io/test/github/jehy/slowlint/badge.svg)](https://snyk.io/test/github/jehy/slowlint)

![our pride logo](logo.png)

Implement linting with ESLint slowly on big projects.

## WTF

Sometimes you need to add linting to existing projects.
And you have to take it lazy to avoid many merge conflicts, failing builds and etc.

That's where Slowlint saves the day.

How it is supposed to work:

1. You add ESLint, ESLint config and `.eslintignore` to project as usual.
2. You run Slowlint to make a file with all temporary ignores (files which don't pass linting).
3. You add two checks to your CI on every commit:
    * check that all good files still pass linting
    * check that bad files did not become good
    
This is the least invasive way to ensure that your code will not become worse and will
lazily become better.

## Step by step

### 1. ESLint setup
Install ESLint, plugins, set up config, `.eslintignore` and etc - just as usual.

### 2. Generate .slowlintignore file

That's same as `.eslintignore` but with another name. Why bother?

* `.slowlintignore` only contains files which could be fixed. Files from `.eslintignore` are not meant to be fixed.
* Any IDE will use `.eslintignore` and ignore `.slowlintignore` - just as planned!
* You can use both `.eslintignore` and `.slowlintignore`.

**Example**
```bash
slowlint save-ignored --files src test --eslint-path ~/project1/node_modules/eslint
```

### 3. Lint

Slowlint can use your existing ESLint package and configuration for linting with both `.eslintignore` and`.slowlintignore` files.

That's great for CI!

**Example**
```bash
slowlint lint --files src test --eslint-path ~/project1/node_modules/eslint
```

### 4. Check for good files

Slowlint can also check if good files (which pass linting) are included in `.slowlintignore` file.

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
npx slowlint check-good --files src test --eslint-path ~/project1/node_modules/eslint

```

## Usage

```
Usage: slowlint <command> [options]

Commands:
  slowlint lint          Lint everything but bad files
  slowlint check-good    Check if good files are listed as bad
  slowlint save-ignored  Make a new list of ignored files

Options:
Options:
  --version         Show version number               [boolean]
  --files           filenames                         [array] [required]
  --eslintPath      eslint path                       [string] [default: "./node_modules/eslint"]
  --ignoreFilePath  path for .slowlintignore file     [string] [default: ".slowlintignore"]
  --noProgress      hide progress bar                 [boolean] [default: false]
  -h, --help        Show help                         [boolean]
```


## Examples:
Lint all files from project in current diirectory using linter and config from project:

```bash
slowlint lint --files .
```
Lint `bin` and `test` dirs using linter from some project1:
```bash
slowlint lint --files bin test --eslint-path ~/project1/node_modules/eslint
```

