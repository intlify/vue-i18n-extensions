const { tocResolver, tocProcessor } = require('api-docs-gen')

module.exports = {
  linkReferencer: tocResolver,
  processor: tocProcessor
}
