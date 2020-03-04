const { evaluateValue } = require('../src/util')

it('string literal should be evaluate', () => {
  const { status, value } = evaluateValue(`'hello'`)
  expect(status).toEqual('ok')
  expect(value).toEqual('hello')
})

it('json should be evaluate', () => {
  const { status, value } = evaluateValue(`{ path: 'named', locale: 'ja', args: { name: 'kazupon' } }`)
  expect(status).toEqual('ok')
  expect(value).toEqual({ path: 'named', locale: 'ja', args: { name: 'kazupon' } })
})

it('identifier should not be evaluate', () => {
  const { status, value } = evaluateValue(`hello`)
  expect(status).toEqual('ng')
  expect(value).toEqual(undefined)
})

it('ecmascript keyword should not be evaluate', () => {
  const { status, value } = evaluateValue(`'while(true){alert('!');}'`)
  expect(status).toEqual('ng')
  expect(value).toEqual(undefined)
})

it('string literal containing period delimited ecmascript keywords should evaluate', () => {
  const { status, value } = evaluateValue(`'new.alert.import'`)
  expect(status).toEqual('ok')
  expect(value).toEqual('new.alert.import')
})

it('string literal containing whitespace and newline keywords should evaluate', () => {
  const { status, value } = evaluateValue(`
      'hello'
  `)
  expect(status).toEqual('ok')
  expect(value).toEqual('hello')
})