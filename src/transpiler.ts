import { parse } from '@babel/parser'

interface EvaluateReturn {
  status: 'ok' | 'ng'
  value?: unknown
}

export function evaluateValue(expression: string): EvaluateReturn {
  const ret = { status: 'ng', value: undefined } as EvaluateReturn

  try {
    const ast = parse(`const a = ${expression.trim()}`)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const node = (ast.program.body[0] as any).declarations[0].init
    if (node.type === 'StringLiteral' || node.type === 'ObjectExpression') {
      const val = new Function(`return ${expression.trim()}`)()
      ret.status = 'ok'
      ret.value = val
    }
  } catch (e) {}

  return ret
}
