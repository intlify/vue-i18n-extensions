import { parse } from '@babel/parser'
import type { ObjectProperty, ObjectExpression, Expression } from '@babel/types'

interface EvaluateReturn {
  status: 'ok' | 'ng'
  value?: unknown
}

export type NestedValue<T> = { [P in keyof T]: NestedValue<T[P]> }

export type TranslationParams<T = Record<string, unknown>> = {
  path: string
  named: NestedValue<T>
  options: {
    locale?: string
    plural?: string
  }
}

export function evaluateValue(expression: string): EvaluateReturn {
  const ret = { status: 'ng', value: undefined } as EvaluateReturn

  try {
    const ast = parse(`const a = ${expression.trim()}`)
    if (
      ast.program.body.length >= 1 &&
      ast.program.body[0].type === 'VariableDeclaration' &&
      ast.program.body[0].declarations.length >= 1
    ) {
      const node = ast.program.body[0].declarations[0].init
      if (node != null && (node.type === 'StringLiteral' || node.type === 'ObjectExpression')) {
        // eslint-disable-next-line @typescript-eslint/no-implied-eval
        const val = new Function(`return ${expression.trim()} `)() as unknown
        ret.status = 'ok'
        ret.value = val
      }
    }
    // eslint-disable-next-line no-empty
  } catch (_e) {}

  return ret
}

export function parseVTExpression(expression: string): TranslationParams {
  const ret: TranslationParams = {
    path: '',
    named: {},
    options: {}
  }

  try {
    const ast = parse(`const a = ${expression.trim()}`)
    if (
      ast.program.body.length >= 1 &&
      ast.program.body[0].type === 'VariableDeclaration' &&
      ast.program.body[0].declarations.length >= 1
    ) {
      const node = ast.program.body[0].declarations[0].init
      if (node != null) {
        if (node.type === 'StringLiteral' && node.extra) {
          ret.path = node.extra.raw as string
        } else if (node.type === 'Identifier') {
          ret.path = node.name
        } else if (node.type === 'MemberExpression') {
          ret.path = getObjectMemberValue(node)
        } else if (node.type === 'ObjectExpression') {
          node.properties.forEach(propNode => {
            if (propNode.type === 'ObjectProperty') {
              const propKeyNode = propNode.key
              if (propKeyNode.type !== 'Identifier') {
                return
              }
              const propValueNode = propNode.value
              switch (propKeyNode.name) {
                case 'path':
                  ret.path = getObjectMemberValue(propValueNode)
                  break
                case 'locale':
                  ret.options.locale = getObjectMemberValue(propValueNode)
                  break
                case 'choice':
                case 'plural':
                  ret.options.plural = getObjectMemberValue(propValueNode)
                  break
                case 'args':
                  // console.log('args', propValueNode)
                  if (propValueNode.type === 'ObjectExpression') {
                    traverseObjectMember(propValueNode, ret.named)
                  }
                  break
                default:
                  break
              }
            }
          })
        }
      }
    }
    // eslint-disable-next-line no-empty
  } catch (_e) {}

  return ret
}

function getObjectMemberValue(node: ObjectProperty['value']): string {
  if ((node.type === 'StringLiteral' || node.type === 'NumericLiteral') && node.extra) {
    return node.extra.raw as string
  } else if (node.type === 'Identifier') {
    return node.name
  } else if (node.type === 'MemberExpression') {
    const paths: string[] = []
    collectMemberPath(node, paths)
    paths.reverse()
    return paths.join('.')
  } else {
    return ''
  }
}

function traverseObjectMember(
  node: ObjectExpression,
  target: NestedValue<Record<string, unknown>>
): void {
  node.properties.forEach(propNode => {
    if (propNode.type === 'ObjectProperty') {
      const propKeyNode = propNode.key
      if (propKeyNode.type !== 'Identifier') {
        return
      }
      if (!(propKeyNode.name in target)) {
        target[propKeyNode.name] = {}
      }
      // console.log('propNode', propNode)
      const propValueNode = propNode.value
      if (propValueNode.type === 'ObjectExpression') {
        traverseObjectMember(propValueNode, target[propKeyNode.name])
      } else {
        target[propKeyNode.name] = getObjectMemberValue(propValueNode)
      }
    }
  })
}

function collectMemberPath(node: Expression, paths: string[]): void {
  if (node.type === 'Identifier') {
    paths.push(node.name)
    return
  } else if (node.type === 'MemberExpression' && node.property.type === 'Identifier') {
    paths.push(node.property.name)
    return collectMemberPath(node.object, paths)
  }
}
