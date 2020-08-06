import { format } from './utils'
import { SourceLocation } from '@vue/compiler-core'
import { isString } from '@vue/shared'

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
  NOT_SUPPORTED_BINDING_PRE_TRANSLATION,
  FAILED_VALUE_EVALUATION,
  REQUIRED_PARAMETER,
  INVALID_PARAMETER_TYPE,
  NOT_SUPPORTED_PRESERVE,
  ORVERRIDE_ELEMENT_CHILDREN,
  __EXTEND_POINT__
}

// TODO: should be extracted as i18n resources (intlify project self hosting!)
const ReportMessages: { [code: number]: string } = {
  [ReportCodes.UNEXPECTED_DIRECTIVE_EXPRESSION]: `Unexpected directive expression: {0}`,
  [ReportCodes.NOT_SUPPORTED_BINDING_PRE_TRANSLATION]: `Not support binding in pre-localization: {0}`,
  [ReportCodes.FAILED_VALUE_EVALUATION]: `Failed valu evaluation: {0}`,
  [ReportCodes.REQUIRED_PARAMETER]: `Required parameter: {0}`,
  [ReportCodes.INVALID_PARAMETER_TYPE]: `Required parameter: {0}`,
  [ReportCodes.NOT_SUPPORTED_PRESERVE]: `Not supportted 'preserve': {0}`,
  [ReportCodes.ORVERRIDE_ELEMENT_CHILDREN]: `v-t will override element children: {0}`
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

export function report(
  code: ReportCodes,
  optinos: ReportOptions = {}
): void | ExtensionsError {
  const mode =
    optinos.mode &&
    isString(optinos.mode) &&
    ['warn', 'error'].includes(optinos.mode)
      ? optinos.mode
      : 'warn'

  const msg = getReportMessage(code, optinos.args)
  if (mode === 'warn') {
    console.warn('[vue-i18n-extensions] ' + msg)
  } else {
    // error
    throw createExtensionsError(code, msg, optinos.loc)
  }
}
