import { isNumber } from '@intlify/shared'

/**
 * Content Builder options
 * Trigger CI
 *
 * @remarks
 * options that creating a {@link ContentBuilder}
 *
 * @public
 */
export interface ContentBuilderOptions {
  /**
   * Intdent level of Builder
   */
  indentLevel?: number
}

/**
 * Content Builder
 *
 * @public
 */
export interface ContentBuilder {
  /**
   * Indent level
   * @defaultValue 0
   */
  readonly indentLevel: number
  /**
   * Content
   */
  readonly content: string
  /**
   * Add content
   * @param content - additional content
   */
  push(content: string): void
  /**
   * Add line break
   */
  newline(): void
  /**
   * Add content with line break
   * @param content - additional content
   */
  pushline(content: string): void
  /**
   * Indent content
   * @param withNewLine - whether indent to be added without new line
   */
  indent(withoutNewLine?: boolean): void
  /**
   * DeIndent content
   * @param withoutNewLine - whether deindent to be added without new line
   */
  deindent(withoutNewLine?: boolean): void
}

/**
 * Create a Content Builder
 *
 * @param options - Content Builder options
 *
 * @returns A {@link ContentBuilder} instance
 *
 * @public
 */
export function createContentBuilder(
  options: ContentBuilderOptions = {}
): ContentBuilder {
  let _indentLevel =
    options.indentLevel != null && isNumber(options.indentLevel)
      ? options.indentLevel
      : 0
  let _content = ''

  function push(content: string): void {
    _content += content
  }

  function _newline(n: number) {
    push('\n' + `  `.repeat(n))
  }

  function newline() {
    _newline(_indentLevel)
  }

  function pushline(content: string) {
    push(content)
    newline()
  }

  function indent(withoutNewLine?: boolean) {
    if (withoutNewLine) {
      ++_indentLevel
    } else {
      _newline(++_indentLevel)
    }
  }

  function deindent(withoutNewLine?: boolean) {
    if (withoutNewLine) {
      --_indentLevel
    } else {
      _newline(--_indentLevel)
    }
  }

  return {
    get indentLevel(): number {
      return _indentLevel
    },
    get content(): string {
      return String(_content)
    },
    push,
    newline,
    pushline,
    indent,
    deindent
  }
}
