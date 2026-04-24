import type * as Types from '@app/types.ts'
import Operators from '@app/constant.ts'
import Nested from '@core/nested.ts'

/**
 * Condition evaluator utility.
 * @description Static methods for evaluating query conditions.
 */
export default class Evaluator {
  /**
   * Evaluate condition against item.
   * @description Checks item match for given operator.
   * @param item - Data item to evaluate
   * @param condition - Condition to check against
   * @returns True if condition matches, false otherwise
   */
  static evaluate(item: Record<string, unknown>, condition: Types.JsonaryCondition): boolean {
    const { operator, value }: Types.JsonaryCondition = condition
    const fieldValue: unknown = Nested.get(item, condition.field)
    const operatorToken: Types.JsonaryCondition['operator'] = operator
    switch (operatorToken) {
      case Operators.queryOperators.eq:
        return fieldValue === value
      case Operators.queryOperators.neq:
        return fieldValue !== value
      case Operators.queryOperators.gt:
        return typeof fieldValue === 'number' && typeof value === 'number' && fieldValue > value
      case Operators.queryOperators.lt:
        return typeof fieldValue === 'number' && typeof value === 'number' && fieldValue < value
      case Operators.queryOperators.gte:
        return typeof fieldValue === 'number' && typeof value === 'number' && fieldValue >= value
      case Operators.queryOperators.lte:
        return typeof fieldValue === 'number' && typeof value === 'number' && fieldValue <= value
      case Operators.queryOperators.contains:
        return (
          typeof fieldValue === 'string' && typeof value === 'string' && fieldValue.includes(value)
        )
      case Operators.queryOperators.startsWith:
        return (
          typeof fieldValue === 'string' &&
          typeof value === 'string' &&
          fieldValue.startsWith(value)
        )
      case Operators.queryOperators.endsWith:
        return (
          typeof fieldValue === 'string' && typeof value === 'string' && fieldValue.endsWith(value)
        )
      default:
        return false
    }
  }
}
