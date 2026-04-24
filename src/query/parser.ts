import type * as Types from '@app/types.ts'
import Operators from '@app/constant.ts'
import Utils from '@query/utils.ts'

/**
 * Condition parser utility.
 * @description Static methods for parsing query conditions.
 */
export default class Parser {
  /** Cache for parsed conditions */
  private static readonly cache: Map<string, Types.JsonaryCondition | null> = new Map()

  /**
   * Parse condition string.
   * @description Converts string to condition object.
   * @param condition - String condition to parse
   * @returns Parsed condition object or null if invalid
   */
  static parse(condition: string): Types.JsonaryCondition | null {
    if (this.cache.has(condition)) {
      return this.cache.get(condition) ?? null
    }
    const operators: string[] = Operators.getSorted()
    for (const operatorToken of operators) {
      const index: number = condition.indexOf(operatorToken)
      if (index !== -1) {
        const rawValue: string = condition.substring(index + operatorToken.length).trim()
        const parsedValue: unknown = Utils.parseValue(Utils.stripQuotes(rawValue))
        const result: Types.JsonaryCondition = {
          field: condition.substring(0, index).trim(),
          operator: operatorToken as Types.JsonaryCondition['operator'],
          value: parsedValue
        }
        this.cache.set(condition, result)
        return result
      }
    }
    this.cache.set(condition, null)
    return null
  }
}
