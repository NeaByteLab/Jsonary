import type * as Types from '@app/types.ts'

/**
 * Query operators utility.
 * @description Static constants and methods for query operators.
 */
export default class Operators {
  /** Query operator constants */
  static readonly queryOperators: Types.QueryOperatorsType = {
    eq: '=',
    neq: '!=',
    gt: '>',
    lt: '<',
    gte: '>=',
    lte: '<=',
    contains: 'contains',
    startsWith: 'startsWith',
    endsWith: 'endsWith'
  } as const

  /**
   * Get sorted operator values.
   * @description Sorts operators by length, longest first.
   * @returns Array of operator values sorted by length
   */
  static getSorted(): string[] {
    return Object.values(this.queryOperators).sort((a: string, b: string) => b.length - a.length)
  }
}
