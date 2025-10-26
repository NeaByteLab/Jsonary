import type { QueryOperatorsType } from '@interfaces/index'

/**
 * Query operator constants.
 * @description Centralized definitions for all supported query operators.
 */
export const queryOperators: QueryOperatorsType = {
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
 * Gets all operator values sorted by length (longest first).
 * @description Used for parsing conditions with correct operator precedence.
 * @returns Array of operator values sorted by length
 */
export function getOperatorsSorted(): string[] {
  return Object.values(queryOperators).sort((a: string, b: string) => b.length - a.length)
}
