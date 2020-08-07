import { isObject } from '@vue/shared'

const RE_ARGS = /\{([0-9a-zA-Z]+)\}/g

// eslint-disable-next-line
export function format(message: string, ...args: any): string {
  if (args.length === 1 && isObject(args[0])) {
    args = args[0]
  }
  if (!args || !args.hasOwnProperty) {
    args = {}
  }
  return message.replace(
    RE_ARGS,
    (match: string, identifier: string): string => {
      return args.hasOwnProperty(identifier) ? args[identifier] : ''
    }
  )
}

// TODO: should be used from shared libs
export function isNumber(val: unknown): val is number {
  return typeof val === 'number' && isFinite(val)
}
