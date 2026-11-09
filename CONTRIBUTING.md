# vue-i18n-extensions Contributing Guide

- [vue-i18n-extensions Contributing Guide](#vue-i18n-extensions-contributing-guide)
  - [Issue Reporting Guidelines](#issue-reporting-guidelines)
  - [Pull Request Guidelines](#pull-request-guidelines)
    - [Work Step Example](#work-step-example)
  - [Development Setup](#development-setup)
    - [Commonly used NPM scripts](#commonly-used-npm-scripts)
    - [Release](#release)

## Issue Reporting Guidelines

- The issue list of this repo is **exclusively** for bug reports and feature requests. Non-conforming issues will be closed immediately.

- Try to search for your issue, it may have already been answered or even fixed in the master branch.

- Check if the issue is reproducible with the latest stable version of vue-i18n-extensions. If you are using a pre-release, please indicate the specific version you are using.

- It is **required** that you clearly describe the steps necessary to reproduce the issue you are running into. Issues with no clear repro steps will not be triaged. If an issue labeled "need repro" receives no further input from the issue author for more than 5 days, it will be closed.

- For bugs that involves build setups, you can create a reproduction repository with steps in the README.

- If your issue is resolved but still open, don’t hesitate to close it. In case you found a solution by yourself, it could be helpful to explain how you fixed it.

## Pull Request Guidelines

- The `next` branch is basically just a snapshot of the latest stable release. All development should be done in dedicated branches. **Do not submit PRs against the `next` branch.**

- Checkout a topic branch from the relevant branch, e.g. `next`, and merge back against that branch.

- Work in the `src` folder and **DO NOT** checkin `dist` and `lib` in the commits.

- It's OK to have multiple small commits as you work on the PR - we will let GitHub automatically squash it before merging.

- Make sure `pnpm test` passes. (see [development setup](#development-setup))

- If adding new feature:
  - Add accompanying test case.
  - Provide convincing reason to add this feature. Ideally you should open a suggestion issue first and have it greenlighted before working on it.

- If fixing a bug:
  - Provide detailed description of the bug in the PR. Live demo preferred.
  - Add appropriate test coverage if applicable.

### Work Step Example

- Fork the repository from [intlify/vue-i18n-extensions](https://github.com/intlify/vue-i18n-extensions) !
- Create your topic branch from `master`: `git branch my-new-topic origin/master`
- Add codes and pass tests !
- Commit your changes: `git commit -am 'Add some topic'`
- Push to the branch: `git push origin my-new-topic`
- Submit a pull request to `master` branch of `intlify/vue-i18n-extensions` repository !

## Development Setup

Node.js 22.18 or later is required. After cloning the repo, run:

    $ pnpm install

### Commonly used NPM scripts

    # check format, lint, and types (`vp check` of Vite+)
    $ pnpm lint

    # fix format and lint issues
    $ pnpm fix

    # run unit tests
    $ pnpm test:unit

    # build all dist files, including npm packages
    $ pnpm build

    # run the unit tests with coverage and the e2e tests (build first)
    $ pnpm test

There are some other scripts available in the `scripts` section of the `package.json` file.

**Please make sure that `pnpm lint` and `pnpm test` pass before submitting a PR.** Although the same checks run against your PR on the CI server, it is better to have them working locally beforehand.

### Release

Bump the version, write `CHANGELOG.md` from GitHub-generated notes, then commit, tag, and push. The settings are in `bump.config.ts`. Run on a clean `next` whose `HEAD` is already on `origin`, after `pnpm install`. Provide a token with Contents: write:

```sh
GH_TOKEN="$(gh auth token)" pnpm release
```

Leave nothing in the working tree, untracked files included: bumpp commits every change (`all: true` runs `git add --all`), so `bump.config.ts` stops the release otherwise. Do not keep local-only tags either: bumpp pushes all tags (`git push --tags`).
