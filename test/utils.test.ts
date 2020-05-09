import { evaluateValue } from '../src/utils'

test('string literal should be evaluate', () => {
  const { status, value } = evaluateValue(`'hello'`)
  expect(status).toEqual('ok')
  expect(value).toEqual('hello')
})

test('json should be evaluate', () => {
  const { status, value } = evaluateValue(
    `{ path: 'named', locale: 'ja', args: { name: 'kazupon' } }`
  )
  expect(status).toEqual('ok')
  expect(value).toEqual({
    path: 'named',
    locale: 'ja',
    args: { name: 'kazupon' }
  })
})

test('identifier should not be evaluate', () => {
  const { status, value } = evaluateValue(`hello`)
  expect(status).toEqual('ng')
  expect(value).toEqual(undefined)
})

test('ecmascript keyword should not be evaluate', () => {
  const { status, value } = evaluateValue(`'while(true){alert('!');}'`)
  expect(status).toEqual('ng')
  expect(value).toEqual(undefined)
})

test('string literal containing period delimited ecmascript keywords should evaluate', () => {
  const { status, value } = evaluateValue(`'new.alert.import'`)
  expect(status).toEqual('ok')
  expect(value).toEqual('new.alert.import')
})

test('string literal containing whitespace and newline keywords should evaluate', () => {
  const { status, value } = evaluateValue(`
      'hello'
  `)
  expect(status).toEqual('ok')
  expect(value).toEqual('hello')
})
