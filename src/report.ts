import { format, isString } from '@intlify/shared'
import { SourceLocation } from '@vue/compiler-core'

export interface ExtensionsError extends SyntaxError {
  code: number
  loc?: SourceLocation
}

export interface ReportOptions {
  mode?: 'error' | 'warn'
  loc?: SourceLocation
  args?: unknown[]
}

export const enum ReportCodes {
  // Special value for higher-order compilers to pick up the last code
  // to avoid collision of error codes. This should always be kept as the last
  // item.
  SUCCESS,
  UNEXPECTED_DIRECTIVE_EXPRESSION,
  NOT_SUPPORTED,
  FAILED_VALUE_EVALUATION,
  REQUIRED_PARAMETER,
  INVALID_PARAMETER_TYPE,
  OVERRIDE_ELEMENT_CHILDREN,
  NOT_RESOLVED_COMPOSER,
  UNEXPECTED_ERROR,
  __EXTEND_POINT__
}

// TODO: should be extracted as i18n resources (intlify project self hosting!)
const ReportMessages: { [code: number]: string } = {
  [ReportCodes.UNEXPECTED_DIRECTIVE_EXPRESSION]: `Unexpected directive expression: {0}`,
  [ReportCodes.NOT_SUPPORTED]: `Not supported transform: {0}`,
  [ReportCodes.FAILED_VALUE_EVALUATION]: `Failed value evaluation: {0}`,
  [ReportCodes.REQUIRED_PARAMETER]: `Required parameter: {0}`,
  [ReportCodes.INVALID_PARAMETER_TYPE]: `Required parameter: {0}`,
  [ReportCodes.OVERRIDE_ELEMENT_CHILDREN]: `v-t will override element children: {0}`,
  [ReportCodes.NOT_RESOLVED_COMPOSER]: `Not resolved vue-i18n composer: {0}`,
  [ReportCodes.UNEXPECTED_ERROR]: `Unexpected error: {0}`
}

export function getReportMessage(code: ReportCodes, ...args: unknown[]): string {
  return format(ReportMessages[code], ...args)
}

function createExtensionsError(
  code: ReportCodes,
  msg: string,
  loc?: SourceLocation
): ExtensionsError {
  const error = new SyntaxError(msg) as ExtensionsError
  error.code = code
  if (loc) {
    error.loc = loc
  }
  return error
}

export function report(code: ReportCodes, options: ReportOptions = {}): void | ExtensionsError {
  const mode =
    options.mode && isString(options.mode) && ['warn', 'error'].includes(options.mode)
      ? options.mode
      : 'warn'

  const msg = getReportMessage(code, options.args)
  if (mode === 'warn') {
    console.warn('[vue-i18n-extensions] ' + msg)
  } else {
    // error
    throw createExtensionsError(code, msg, options.loc)
  }
}
