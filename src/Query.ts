import type * as Types from '@app/Types.ts'
import { getOperatorsSorted, queryOperators } from '@app/Constant.ts'

/**
 * Query builder for records
 * @description Fluent chaining for filters, updates, deletes.
 */
export class QueryBuilder {
  /** Cache for recently parsed conditions to improve performance */
  private static readonly recentConditionCache: Map<string, Types.JsonaryCondition | null> =
    new Map()
  /** Parent instance for synchronization */
  private readonly parentDb: Types.JsonaryParent | undefined
  /** Array of applied conditions */
  private readonly conditions: Types.JsonaryCondition[] = []
  /** Original data array reference */
  private readonly originalRecords: Record<string, unknown>[]
  /** Current filtered data array */
  private records: Record<string, unknown>[]

  /**
   * Create QueryBuilder instance
   * @description Stores records and optional parent sync.
   * @param data - Array of data records to query
   * @param parent - Optional parent instance for synchronization
   */
  constructor(data: Record<string, unknown>[], parent?: Types.JsonaryParent) {
    this.originalRecords = data
    this.records = [...data]
    this.parentDb = parent
  }

  /**
   * Count filtered records
   * @description Returns records matching current conditions.
   * @returns Number of matching records
   */
  count(): number {
    return this.records.length
  }

  /**
   * Delete filtered records
   * @description Removes matches from original records.
   * @returns Number of records deleted
   */
  delete(): number {
    const deletedCount: number = this.records.length
    const recordsToDelete: Set<Record<string, unknown>> = new Set(this.records)
    for (let i: number = this.originalRecords.length - 1; i >= 0; i--) {
      if (recordsToDelete.has(this.originalRecords[i] as Record<string, unknown>)) {
        this.originalRecords.splice(i, 1)
      }
    }
    this.records.length = 0
    this.parentDb?.syncFromQueryBuilder(this.originalRecords)
    return deletedCount
  }

  /**
   * Get first filtered record
   * @description Returns first match, or null.
   * @returns First matching record or null
   */
  first(): Record<string, unknown> | null {
    return this.records[0] ?? null
  }

  /**
   * Get filtered records
   * @description Returns copy of matching records.
   * @returns Array of matching records
   */
  get(): Record<string, unknown>[] {
    return [...this.records]
  }

  /**
   * Update filtered records
   * @description Applies fields to all matches.
   * @param data - Object containing fields to update
   */
  update(data: Record<string, unknown>): void {
    this.records.forEach((item: Record<string, unknown>) => {
      Object.keys(data).forEach((key: string) => {
        if (key.includes('.')) {
          this.setNestedValue(item, key, data[key])
        } else {
          item[key] = data[key]
        }
      })
    })
    this.parentDb?.syncFromQueryBuilder(this.originalRecords)
  }

  /**
   * Add filter condition
   * @description Filters by string or predicate.
   * @param condition - Query string or function to filter records
   * @returns QueryBuilder instance for chaining
   */
  where(condition: string | ((item: Record<string, unknown>) => boolean)): QueryBuilder {
    if (typeof condition === 'function') {
      this.records = this.records.filter(condition)
    } else {
      const parsedCondition: Types.JsonaryCondition | null = this.parseCondition(condition)
      if (parsedCondition) {
        this.conditions.push(parsedCondition)
        this.records = this.records.filter((item: Record<string, unknown>) =>
          this.evaluateCondition(item, parsedCondition)
        )
      }
    }
    return this
  }

  /**
   * Evaluate condition against item
   * @description Checks item match for given operator.
   * @param item - Data item to evaluate
   * @param condition - Condition to check against
   * @returns True if condition matches, false otherwise
   */
  private evaluateCondition(
    item: Record<string, unknown>,
    condition: Types.JsonaryCondition
  ): boolean {
    const { operator, value }: Types.JsonaryCondition = condition
    const fieldValue: unknown = this.getNestedValue(item, condition.field)
    const operatorToken: Types.JsonaryCondition['operator'] = operator
    switch (operatorToken) {
      case queryOperators.eq:
        return fieldValue === value
      case queryOperators.neq:
        return fieldValue !== value
      case queryOperators.gt:
        return typeof fieldValue === 'number' && typeof value === 'number' && fieldValue > value
      case queryOperators.lt:
        return typeof fieldValue === 'number' && typeof value === 'number' && fieldValue < value
      case queryOperators.gte:
        return typeof fieldValue === 'number' && typeof value === 'number' && fieldValue >= value
      case queryOperators.lte:
        return typeof fieldValue === 'number' && typeof value === 'number' && fieldValue <= value
      case queryOperators.contains:
        return (
          typeof fieldValue === 'string' && typeof value === 'string' && fieldValue.includes(value)
        )
      case queryOperators.startsWith:
        return (
          typeof fieldValue === 'string' &&
          typeof value === 'string' &&
          fieldValue.startsWith(value)
        )
      case queryOperators.endsWith:
        return (
          typeof fieldValue === 'string' && typeof value === 'string' && fieldValue.endsWith(value)
        )
      default:
        return false
    }
  }

  /**
   * Get nested value by path
   * @description Traverses dot-separated property path.
   * @param obj - Object to traverse
   * @param path - Dot-separated path to the property
   * @returns Value at the specified path or undefined
   */
  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    if (!path.includes('.')) {
      return obj[path]
    }
    let currentValue: unknown = obj
    const keys: string[] = path.split('.')
    for (let i: number = 0; i < keys.length; i++) {
      if (currentValue === null || currentValue === undefined || typeof currentValue !== 'object') {
        return undefined
      }
      const key: string | undefined = keys[i]
      if (key === undefined) {
        return undefined
      }
      currentValue = (currentValue as Record<string, unknown>)[key]
    }
    return currentValue
  }

  /**
   * Parse condition string
   * @description Converts string to condition object.
   * @param condition - String condition to parse
   * @returns Parsed condition object or null if invalid
   */
  private parseCondition(condition: string): Types.JsonaryCondition | null {
    if (QueryBuilder.recentConditionCache.has(condition)) {
      return QueryBuilder.recentConditionCache.get(condition) ?? null
    }
    const operators: string[] = getOperatorsSorted()
    for (const operatorToken of operators) {
      const index: number = condition.indexOf(operatorToken)
      if (index !== -1) {
        const rawValue: string = condition.substring(index + operatorToken.length).trim()
        const parsedValue: unknown = this.parseSpecialValue(this.stripQuotes(rawValue))
        const result: Types.JsonaryCondition = {
          field: condition.substring(0, index).trim(),
          operator: operatorToken as Types.JsonaryCondition['operator'],
          value: parsedValue
        }
        QueryBuilder.recentConditionCache.set(condition, result)
        return result
      }
    }
    QueryBuilder.recentConditionCache.set(condition, null)
    return null
  }

  /**
   * Parse special value tokens
   * @description Converts tokens to typed values.
   * @param value - Value to parse
   * @returns Parsed value in appropriate type
   */
  private parseSpecialValue(value: unknown): unknown {
    switch (value) {
      case 'true':
        return true
      case 'false':
        return false
      case 'null':
        return null
      case 'undefined':
        return undefined
      default:
        if (!isNaN(Number(value)) && value !== '') {
          return Number(value)
        }
        return value
    }
  }

  /**
   * Set nested value by path
   * @description Creates objects and sets final value.
   * @param obj - Object to modify
   * @param path - Dot-separated path to the property
   * @param value - Value to set
   */
  private setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): void {
    const keys: string[] = path.split('.')
    let currentObject: Record<string, unknown> = obj
    for (let i: number = 0; i < keys.length - 1; i++) {
      const key: string | undefined = keys[i]
      if (key === undefined) {
        continue
      }
      if (
        !(key in currentObject) ||
        typeof currentObject[key] !== 'object' ||
        currentObject[key] === null
      ) {
        currentObject[key] = {}
      }
      currentObject = currentObject[key] as Record<string, unknown>
    }
    const lastKey: string | undefined = keys[keys.length - 1]
    if (lastKey !== undefined) {
      currentObject[lastKey] = value
    }
  }

  /**
   * Strip surrounding quotes
   * @description Removes wrapping single or double quotes.
   * @param value - String value to process
   * @returns Processed value with quotes removed if applicable
   */
  private stripQuotes(value: unknown): unknown {
    if (
      typeof value === 'string' &&
      ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'")))
    ) {
      return value.slice(1, -1)
    }
    return value
  }
}
