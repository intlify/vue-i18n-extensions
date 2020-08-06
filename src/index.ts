import {
  DirectiveTransform,
  createObjectProperty,
  createSimpleExpression,
  SimpleExpressionNode
} from '@vue/compiler-dom'
import { isObject, isString, toDisplayString } from '@vue/shared'
import { I18n, Locale } from 'vue-i18n'
import { evaluateValue } from './transpiler'
import { report, ReportCodes } from './report'

// TODO: should be imported from vue-i18n
type VTDirectiveValue = {
  path: string
  locale?: Locale
  args?: { [prop: string]: unknown }
  choice?: number
}

// TODO: should be used from shared libs
export const isNumber = (val: unknown): val is number =>
  typeof val === 'number' && isFinite(val)

export function defineTransformVT(i18n: I18n): DirectiveTransform {
  return (dir, node /*, context*/) => {
    const { exp, loc } = dir
    if (!exp) {
      // TODO: throw error with context.OnError
      // NOTE: We need to support from @vue/compiler-core
      // https://github.com/vuejs/vue-next/issues/1147
      report(ReportCodes.UNEXPECTED_DIRECTIVE_EXPRESSION, {
        mode: 'error',
        args: [node.loc.source || ''],
        loc: node.loc
      })
    }
    if (node.children.length > 0) {
      // TODO: throw error with context.OnError
      // NOTE: We need to support from @vue/compiler-core
      // https://github.com/vuejs/vue-next/issues/1147
      report(ReportCodes.ORVERRIDE_ELEMENT_CHILDREN, {
        mode: 'error',
        args: [node.loc.source || ''],
        loc: node.loc
      })
      node.children.length = 0
    }

    const simpleExp = exp as SimpleExpressionNode
    if (simpleExp.isConstant) {
      if (dir.modifiers.includes('preserve')) {
        report(ReportCodes.NOT_SUPPORTED_PRESERVE, {
          args: [node.loc.source || ''],
          loc: node.loc
        })
      }

      const { status, value } = evaluateValue(simpleExp.content)
      if (status === 'ng') {
        report(ReportCodes.FAILED_VALUE_EVALUATION, {
          args: [node.loc.source || ''],
          loc: node.loc
        })
        return { props: [] }
      }

      const [parsedValue, parseStatus] = parseValue(value)
      if (parseStatus !== ReportCodes.SUCCESS) {
        report(parseStatus, { args: [node.loc.source || ''], loc: node.loc })
        return { props: [] }
      }

      const translated = i18n.global.t(...makeParams(parsedValue!))
      if (translated) {
        simpleExp.content = toDisplayString(`${JSON.stringify(translated)}`)
      }

      // success!
      return {
        props: [
          createObjectProperty(
            createSimpleExpression(`textContent`, true, loc),
            exp || createSimpleExpression('', true)
          )
        ]
      }
    } else {
      report(ReportCodes.NOT_SUPPORTED_BINDING_PRE_TRANSLATION, {
        args: [node.loc.source || ''],
        loc: node.loc
      })
      return { props: [] }
    }
  }
}

// TODO: should be defined typing ...
function parseValue(value: unknown): [VTDirectiveValue | null, ReportCodes] {
  if (isString(value)) {
    return [{ path: value }, ReportCodes.SUCCESS]
  } else if (isObject(value)) {
    if (!('path' in value)) {
      return [null, ReportCodes.REQUIRED_PARAMETER]
    }
    return [value as VTDirectiveValue, ReportCodes.SUCCESS]
  } else {
    return [null, ReportCodes.INVALID_PARAMETER_TYPE]
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
