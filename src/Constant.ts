import type * as Types from '@app/Types.ts'

/**
 * Query operator constants
 * @description Centralized definitions for all supported query operators.
 */
export const queryOperators: Types.QueryOperatorsType = {
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
 * Get sorted operator values
 * @description Sorts operators by length, longest first.
 * @returns Array of operator values sorted by length
 */
export function getOperatorsSorted(): string[] {
  return Object.values(queryOperators).sort((a: string, b: string) => b.length - a.length)
}
