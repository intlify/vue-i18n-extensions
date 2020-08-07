import { evaluateValue, parseVTExpression } from '../src/transpiler'

describe('parseVTExpression', () => {
  test('StringLiteral', () => {
    const ret = parseVTExpression(`'hello'`)
    expect(ret.path).toEqual(`'hello'`)
    expect(ret.named).toEqual({})
    expect(ret.options).toEqual({})
  })

  test('Identifier', () => {
    const ret = parseVTExpression(`hello`)
    expect(ret.path).toEqual(`hello`)
    expect(ret.named).toEqual({})
    expect(ret.options).toEqual({})
  })

  describe('ObjectExpression', () => {
    test('empty', () => {
      const ret = parseVTExpression(`{}`)
      expect(ret.path).toEqual(``)
      expect(ret.named).toEqual({})
      expect(ret.options).toEqual({})
    })

    test('literal', () => {
      const ret = parseVTExpression(
        `{ path: 'hello', locale: 'ja', plural: 4, args: { name: 'kazupon' } }`
      )
      expect(ret.path).toEqual(`'hello'`)
      expect(ret.options).toEqual({ locale: `'ja'`, plural: `4` })
      expect(ret.named).toEqual({ name: `'kazupon'` })
    })

    test('identifier + literal', () => {
      const ret = parseVTExpression(`{
        path: hello,
        locale: _ctx.locales.ja,
        plural: choice,
        args: {
          name: 'kazupon', nest: {
            foo: { bar: _ctx.foo.bar }
          }
        }
      }`)
      expect(ret.path).toEqual(`hello`)
      expect(ret.options).toEqual({
        locale: `_ctx.locales.ja`,
        plural: `choice`
      })
      expect(ret.named).toEqual({
        name: `'kazupon'`,
        nest: { foo: { bar: `_ctx.foo.bar` } }
      })
    })
  })
})

describe('evaluateValue', () => {
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
})
