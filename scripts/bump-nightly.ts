import { execSync } from 'node:child_process'
import { resolve } from 'node:path'
import { readPackageJSON, writePackageJSON } from 'pkg-types'

async function main() {
  const commit = execSync('git rev-parse --short HEAD').toString('utf-8').trim()
  const date = Math.round(Date.now() / (1000 * 60))

  const pkgPath = resolve(process.cwd(), 'package.json')
  const pkg = await readPackageJSON(pkgPath)
  pkg.version = `${pkg.version}-${date}.${commit}`
  pkg.name = pkg.name + '-nightly'
  await writePackageJSON(pkgPath, pkg)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
