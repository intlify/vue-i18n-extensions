import {
  DirectiveTransform,
  createObjectProperty,
  createSimpleExpression,
  SimpleExpressionNode
} from '@vue/compiler-dom'
import { isPlainObject, isString, toDisplayString } from '@vue/shared'
import { I18n, Locale } from 'vue-i18n'
import { evaluateValue } from './utils'

// TODO: should be imported from vue-i18n
type VTDirectiveValue = {
  path: string
  locale?: Locale
  args?: { [prop: string]: unknown }
  choice?: number
}

export const isNumber = (val: unknown): val is number =>
  typeof val === 'number' && isFinite(val)

export function defineTransformVT(i18n: I18n): DirectiveTransform {
  return (dir, node, context) => {
    const { exp, loc } = dir
    // console.log('v-t trans', dir)
    // console.log('v-t trans node', node)
    if (!exp) {
      // TODO: throw error
    }
    if (node.children.length) {
      // TODO: throw error
    }

    const { status, value } = evaluateValue(
      (exp as SimpleExpressionNode).content
    )
    if (status === 'ng') {
      // TODO: throw error
    }

    const parsedValue = parseValue(value)
    const translated = i18n.global.t(...makeParams(parsedValue))
    if (translated) {
      ;(exp as SimpleExpressionNode).content = toDisplayString(
        `${JSON.stringify(translated)}`
      )
    }

    return {
      props: [
        createObjectProperty(
          createSimpleExpression(`textContent`, true, loc),
          exp || createSimpleExpression('', true)
        )
      ]
    }
  }
}

// TODO: should be defined typing ...
function parseValue(value: unknown): VTDirectiveValue {
  if (isString(value)) {
    return { path: value }
  } else if (isPlainObject(value)) {
    if (!('path' in value)) {
      throw new Error('TODO')
    }
    return value as VTDirectiveValue
  } else {
    throw new Error('TODO')
  }
}

function makeParams(value: VTDirectiveValue): unknown[] {
  const { path, locale, args, choice } = value
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const options = {} as any
  const named: { [prop: string]: unknown } = args || {}

  if (isString(locale)) {
    options.locale = locale
  }

  if (isNumber(choice)) {
    options.plural = choice
  }

  return [path, named, options]
}
