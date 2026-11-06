import { execFileSync } from 'node:child_process'
import { defineConfig } from 'bumpp'
import { updateChangelog } from 'gh-changelogen'

// bumpp 12 runs `git add --all` before the release commit (`all: true`), so
// stop while anything, untracked files included, is left in the working tree.
const status = execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' })
if (status) {
  throw new Error(`Commit, stash, or ignore these changes before releasing:\n${status}`)
}

export default defineConfig({
  files: ['package.json'],
  all: true,
  commit: 'release: v%s',
  tag: true,
  push: true,
  execute: async operation => {
    await updateChangelog({
      repository: 'intlify/vue-i18n-extensions',
      tagName: `v${operation.state.newVersion}`,
      source: 'generated-notes',
      targetCommitish: 'HEAD',
      output: 'CHANGELOG.md'
    })
  }
})
