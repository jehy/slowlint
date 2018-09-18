# SlowLint

[![Build Status](https://travis-ci.org/jehy/slowlint.svg?branch=master)](https://travis-ci.org/jehy/slowlint)
[![dependencies Status](https://david-dm.org/jehy/slowlint/status.svg)](https://david-dm.org/jehy/slowlint)
[![devDependencies Status](https://david-dm.org/jehy/slowlint/dev-status.svg)](https://david-dm.org/jehy/slowlint?type=dev)
[![Coverage Status](https://coveralls.io/repos/github/jehy/slowlint/badge.svg?branch=master)](https://coveralls.io/github/jehy/slowlint?branch=master)
[![Known Vulnerabilities](https://snyk.io/test/github/jehy/slowlint/badge.svg)](https://snyk.io/test/github/jehy/slowlint)

Implement linting with ESLint slowly on big projects.

#### Install

```bash
npm i slowlint
```
### Usage

```
Usage: slowlint <command> [options]

Commands:
  slowlint lint          Lint everything but bad files
  slowlint check-good    Check if good files are listed as bad
  slowlint save-ignored  Make a new list of ignored files (don`t abuse please)

Options:
  --version           Show version number                              [boolean]
  --files, -f         filenames                               [array] [required]
  --eslintPath, -es   eslint path                            [string] [required]
  -h, --help          Show help                                        [boolean]
```
### Examples:
Lint `bin` and `test` dirs using linter from some `project1`:

```bash
slowlint lint --files bin test --eslint-path ~/project1/node_modules/eslint
```
