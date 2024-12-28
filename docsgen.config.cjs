// eslint-disable-next-line @typescript-eslint/no-require-imports
const { tocResolver, tocProcessor } = require('api-docs-gen')

module.exports = {
  linkReferencer: tocResolver,
  processor: tocProcessor
}
