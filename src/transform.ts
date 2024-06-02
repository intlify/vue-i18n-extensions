/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-enum-comparison */
import {
  DirectiveTransform,
  createSimpleExpression,
  Node,
  NodeTypes,
  SimpleExpressionNode,
  CompoundExpressionNode,
  isText,
  TextNode,
  InterpolationNode,
  createCompoundExpression,
  TO_DISPLAY_STRING,
  TransformContext
} from '@vue/compiler-dom'
import { isNumber, isObject, isString, isSymbol, toDisplayString } from '@intlify/shared'
import { I18n, I18nMode, Locale } from 'vue-i18n'
import { evaluateValue, parseVTExpression, TranslationParams } from './transpiler'
import { report, ReportCodes } from './report'
import { createContentBuilder, ContentBuilder } from './builder'

// TODO: should be imported from vue-i18n
type VTDirectiveValue = {
  path: string
  locale?: Locale
  args?: { [prop: string]: unknown }
  choice?: number
  plural?: number
}

/**
 * Transform options for `v-t` custom directive
 *
 * @public
 */
export interface TransformVTDirectiveOptions<
  Messages extends Record<string, unknown> = {}, // eslint-disable-line @typescript-eslint/ban-types -- TODO: fix this
  DateTimeFormats extends Record<string, unknown> = {}, // eslint-disable-line @typescript-eslint/ban-types -- TODO: fix this
  NumberFormats extends Record<string, unknown> = {}, // eslint-disable-line @typescript-eslint/ban-types -- TODO: fix this
  Legacy extends boolean = true
> {
  /**
   * I18n instance
   *
   * @remarks
   * If this option is specified, `v-t` custom directive transform uses an I18n instance to pre-translate.
   * The translation will use the global resources registered in the I18n instance,
   * that is, `v-t` directive transform is also a limitation that the resources of each component cannot be used.
   */
  i18n?: I18n<Messages, DateTimeFormats, NumberFormats, Legacy>
  /**
   * I18n Mode
   *
   * @remarks
   * Specify the API style of vue-i18n. If you use legacy API style (e.g. `$t`) at vue-i18n, you need to specify `legacy`.
   *
   * @default 'composition'
   */
  mode?: I18nMode
}

// compatibility for this commit(v3.0.3)
// https://github.com/vuejs/vue-next/commit/90bdf59f4c84ec0af9bab402c37090d82806cfc1
const enum ConstantTypes {
  NOT_CONSTANT = 0,
  CAN_SKIP_PATCH,
  CAN_HOIST,
  CAN_STRINGIFY
}

/**
 * Transform `v-t` custom directive
 *
 * @remarks
 * Transform that  `v-t` custom directive is optimized vue-i18n code by Vue compiler.
 * This transform can improve the performance by pre-translating, and it does support SSR.
 *
 * @param options - `v-t` custom directive transform options, see {@link TransformVTDirectiveOptions}
 * @returns Directive transform
 *
 * @example
 * ```js
 * import { compile } from '@vue/compiler-dom'
 * import { createI18n } from 'vue-i18n'
 * import { transformVTDirective } from '@intlify/vue-i18n-extensions'
 *
 * // create i18n instance
 * const i18n = createI18n({
 *   locale: 'ja',
 *   messages: {
 *     en: {
 *       hello: 'hello'
 *     },
 *     ja: {
 *       hello: 'こんにちは'
 *     }
 *   }
 * })
 *
 * // get transform from  `transformVTDirective` function, with `i18n` option
 * const transformVT = transformVTDirective({ i18n })
 *
 * const { code } = compile(`<p v-t="'hello'"></p>`, {
 *   mode: 'function',
 *   hoistStatic: true,
 *   prefixIdentifiers: true,
 *   directiveTransforms: { t: transformVT } // <- you need to specify to `directiveTransforms` option!
 * })
 *
 * console.log(code)
 * // output ->
 * //   const { createVNode: _createVNode, openBlock: _openBlock, createBlock: _createBlock } = Vue
 * //   return function render(_ctx, _cache) {
 * //     return (_openBlock(), _createBlock(\\"div\\", null, \\"こんにちは！\\"))
 * //   }
 * ```
 * @public
 */
export function transformVTDirective<
  Messages extends Record<string, unknown> = {}, // eslint-disable-line @typescript-eslint/ban-types -- TODO: fix this
  DateTimeFormats extends Record<string, unknown> = {}, // eslint-disable-line @typescript-eslint/ban-types -- TODO: fix this
  NumberFormats extends Record<string, unknown> = {}, // eslint-disable-line @typescript-eslint/ban-types -- TODO: fix this
  Legacy extends boolean = true
>(
  options: TransformVTDirectiveOptions<Messages, DateTimeFormats, NumberFormats, Legacy> = {}
): DirectiveTransform {
  const i18nInstance = options.i18n
  const mode =
    isString(options.mode) && ['composition', 'legacy'].includes(options.mode)
      ? options.mode
      : 'composition'

  return (dir, node, context) => {
    const { exp, loc } = dir
    // console.log('v-t dir', dir)
    // console.log('v-t node', node)
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
      report(ReportCodes.OVERRIDE_ELEMENT_CHILDREN, {
        mode: 'error',
        args: [node.loc.source || ''],
        loc: node.loc
      })
      node.children.length = 0
    }

    if (dir.modifiers.includes('preserve')) {
      report(ReportCodes.NOT_SUPPORTED_PRESERVE, {
        args: [node.loc.source || ''],
        loc: node.loc
      })
    }

    if (isSimpleExpressionNode(exp)) {
      if (isConstant(exp) && i18nInstance) {
        const { status, value } = evaluateValue(exp.content)
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

        const global =
          i18nInstance.mode === 'composition'
            ? (i18nInstance.global as any) // eslint-disable-line @typescript-eslint/no-explicit-any
            : (i18nInstance.global as any).__composer // eslint-disable-line @typescript-eslint/no-explicit-any
        const content = global.t(...makeParams(parsedValue!))

        node.children.push({
          type: NodeTypes.TEXT,
          content
        } as TextNode)
        return { props: [] }
      } else {
        const translationParams = parseVTExpression(exp.content)
        const code = generateTranslationCode(context, mode, translationParams)
        context.helper(TO_DISPLAY_STRING)
        node.children.push({
          type: NodeTypes.INTERPOLATION,
          content: createCompoundExpression([
            createSimpleExpression(
              code,
              false,
              loc,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ConstantTypes.NOT_CONSTANT as any
            )
          ])
        } as InterpolationNode)
        return { props: [] }
      }
    } else if (isCompoundExpressionNode(exp)) {
      const content = exp.children.map(mapNodeContentHandler).join('')
      const code = generateTranslationCode(context, mode, parseVTExpression(content))
      context.helper(TO_DISPLAY_STRING)
      node.children.push({
        type: NodeTypes.INTERPOLATION,
        content: createCompoundExpression([
          createSimpleExpression(
            code,
            false,
            loc,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ConstantTypes.NOT_CONSTANT as any
          )
        ])
      } as InterpolationNode)
      return { props: [] }
    } else {
      report(ReportCodes.NOT_SUPPORTED, {
        args: [node.loc.source || ''],
        loc: node.loc
      })
      return { props: [] }
    }
  }
}

function isSimpleExpressionNode(node: Node | undefined): node is SimpleExpressionNode {
  return node != null && node.type === NodeTypes.SIMPLE_EXPRESSION
}

function isCompoundExpressionNode(node: Node | undefined): node is CompoundExpressionNode {
  return node != null && node.type === NodeTypes.COMPOUND_EXPRESSION
}

function isConstant(node: SimpleExpressionNode): boolean {
  if ('isConstant' in node) {
    // for v3.0.3 earlier
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (node as any).isConstant
  } else if ('constType' in node) {
    // for v3.0.3 or later
    return (node.constType as number) <= ConstantTypes.CAN_STRINGIFY
  } else {
    throw Error('unexpected error')
  }
}

function mapNodeContentHandler(
  value:
    | string
    | symbol
    | SimpleExpressionNode
    | CompoundExpressionNode
    | TextNode
    | InterpolationNode
): string {
  if (isString(value)) {
    return value
  } else if (isSymbol(value)) {
    return value.description || ''
  } else if (isSimpleExpressionNode(value)) {
    return value.content
  } else if (isCompoundExpressionNode(value)) {
    return value.children.map(mapNodeContentHandler).join('')
  } else if (isText(value)) {
    if (isString(value.content)) {
      return value.content
    } else if (isSimpleExpressionNode(value.content)) {
      return value.content.content
    } else if (isCompoundExpressionNode(value.content)) {
      return value.content.children.map(mapNodeContentHandler).join('')
    } else {
      return ''
    }
  } else {
    return ''
  }
}

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
  const { path, locale, args, choice, plural } = value
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const options = {} as any
  const named: { [prop: string]: unknown } = args || {}

  if (isString(locale)) {
    options.locale = locale
  }

  if (isNumber(choice)) {
    options.plural = choice
  }

  if (isNumber(plural)) {
    options.plural = plural
  }

  return [path, named, options]
}

function generateTranslationCode(
  context: TransformContext,
  mode: I18nMode,
  params: TranslationParams
): string {
  return mode === 'composition'
    ? generateComposableCode(context, params)
    : generateLegacyCode(context, params)
}

function generateComposableCode(context: TransformContext, params: TranslationParams): string {
  const baseCode = `${context.prefixIdentifiers ? '_ctx.' : ''}t`

  const builder = createContentBuilder()
  builder.push(`${baseCode}(`)

  // generate path
  builder.push(`${toDisplayString(params.path)}`)

  // generate named
  builder.push(`, { `)
  generateNamedCode(builder, params.named)
  builder.push(` }`)

  // generate options
  builder.push(`, { `)
  if (params.options.locale) {
    builder.push(`locale: ${toDisplayString(params.options.locale)}`)
  }
  if (params.options.plural) {
    if (params.options.locale) {
      builder.push(', ')
    }
    builder.push(`plural: ${toDisplayString(params.options.plural)}`)
  }
  builder.push(` }`)

  builder.push(`)`)
  const content = builder.content
  return content
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function generateNamedCode(builder: ContentBuilder, named: any): void {
  const keys = Object.keys(named)
  keys.forEach(k => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const v: any = named[k]
    if (isObject(v)) {
      builder.push(`${k}: { `)
      generateNamedCode(builder, v)
      builder.push(` }`)
    } else {
      builder.push(`${k}: ${toDisplayString(v)}`)
    }
  })
}

function generateLegacyCode(context: TransformContext, params: TranslationParams): string {
  const mode = !params.options.plural ? 'basic' : 'plural'
  const baseCode = `${context.prefixIdentifiers ? '_ctx.' : ''}${mode === 'basic' ? '$t' : '$tc'}`

  const builder = createContentBuilder()
  builder.push(`${baseCode}(`)

  // generate path
  builder.push(`${toDisplayString(params.path)}`)

  if (mode === 'basic') {
    // generate locale
    if (isString(params.options.locale)) {
      builder.push(`, ${toDisplayString(params.options.locale)}`)
    }
    // generate named
    builder.push(`, { `)
    generateNamedCode(builder, params.named)
    builder.push(` }`)
  } else {
    // generate plural
    builder.push(`, ${toDisplayString(params.options.plural)}`)
    if (isString(params.options.locale)) {
      // generate locale
      builder.push(`, ${toDisplayString(params.options.locale)}`)
    } else {
      // generate named
      builder.push(`, { `)
      generateNamedCode(builder, params.named)
      builder.push(` }`)
    }
  }

  builder.push(`)`)
  const content = builder.content
  return content
}

/* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-enum-comparison */
