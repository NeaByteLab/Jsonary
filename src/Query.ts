import type { JsonaryCondition, JsonaryParent } from '@interfaces/index'

/**
 * Query builder for filtering and manipulating JSON data.
 * @description Provides fluent interface for building complex queries with chaining operations.
 */
export class QueryBuilder {
  /** Cache for recently parsed conditions to improve performance */
  private static readonly conditionRecent: Map<string, JsonaryCondition | null> = new Map()
  /** Parent instance for synchronization */
  private readonly parent: JsonaryParent | undefined
  /** Array of applied conditions */
  private readonly conditions: JsonaryCondition[] = []
  /** Original data array reference */
  private readonly originalData: Record<string, unknown>[]
  /** Mapping of operator names to symbols */
  private readonly parseOperators: {
    readonly eq: '='
    readonly neq: '!='
    readonly gt: '>'
    readonly lt: '<'
    readonly gte: '>='
    readonly lte: '<='
    readonly contains: 'contains'
    readonly startsWith: 'startsWith'
    readonly endsWith: 'endsWith'
  } = {
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
  /** Current filtered data array */
  private data: Record<string, unknown>[]

  /**
   * Creates a new QueryBuilder instance.
   * @description Initializes the query builder with data and optional parent reference.
   * @param data - Array of data records to query
   * @param parent - Optional parent instance for synchronization
   */
  constructor(data: Record<string, unknown>[], parent?: JsonaryParent) {
    this.originalData = data
    this.data = [...data]
    this.parent = parent
  }

  /**
   * Gets the count of filtered records.
   * @description Returns the number of records matching current filter conditions.
   * @returns Number of matching records
   */
  count(): number {
    return this.data.length
  }

  /**
   * Deletes all filtered records.
   * @description Removes all records matching current conditions from original data.
   * @returns Number of records deleted
   */
  delete(): number {
    const deletedCount: number = this.data.length
    const itemsToDelete: Set<Record<string, unknown>> = new Set(this.data)
    for (let i: number = this.originalData.length - 1; i >= 0; i--) {
      if (itemsToDelete.has(this.originalData[i] as Record<string, unknown>)) {
        this.originalData.splice(i, 1)
      }
    }
    this.data.length = 0
    this.parent?.syncFromQueryBuilder(this.originalData)
    return deletedCount
  }

  /**
   * Gets the first filtered record.
   * @description Returns the first record matching current conditions or null if none found.
   * @returns First matching record or null
   */
  first(): Record<string, unknown> | null {
    return this.data[0] ?? null
  }

  /**
   * Gets all filtered records.
   * @description Returns a copy of all records matching current conditions.
   * @returns Array of matching records
   */
  get(): Record<string, unknown>[] {
    return [...this.data]
  }

  /**
   * Updates all filtered records.
   * @description Applies the provided data to all records matching current conditions.
   * @param data - Object containing fields to update
   */
  update(data: Record<string, unknown>): void {
    this.data.forEach((item: Record<string, unknown>) => {
      Object.assign(item, data)
    })
    this.parent?.syncFromQueryBuilder(this.originalData)
  }

  /**
   * Adds a filter condition to the query.
   * @description Filters records based on string condition or function predicate.
   * @param condition - Query string or function to filter records
   * @returns QueryBuilder instance for chaining
   */
  where(condition: string | ((item: Record<string, unknown>) => boolean)): QueryBuilder {
    if (typeof condition === 'function') {
      this.data = this.data.filter(condition)
    } else {
      const parsed: JsonaryCondition | null = this.parseCondition(condition)
      if (parsed) {
        this.conditions.push(parsed)
        this.data = this.data.filter((item: Record<string, unknown>) =>
          this.evaluateCondition(item, parsed)
        )
      }
    }
    return this
  }

  /**
   * Evaluates a condition against a data item.
   * @description Checks if an item matches the specified condition using appropriate operator.
   * @param item - Data item to evaluate
   * @param condition - Condition to check against
   * @returns True if condition matches, false otherwise
   */
  private evaluateCondition(item: Record<string, unknown>, condition: JsonaryCondition): boolean {
    const { operator, value }: JsonaryCondition = condition
    const fieldValue: unknown = this.getNestedValue(item, condition.field)
    const op: JsonaryCondition['operator'] = operator
    switch (op) {
      case this.parseOperators.eq:
        return fieldValue === value
      case this.parseOperators.neq:
        return fieldValue !== value
      case this.parseOperators.gt:
        return typeof fieldValue === 'number' && typeof value === 'number' && fieldValue > value
      case this.parseOperators.lt:
        return typeof fieldValue === 'number' && typeof value === 'number' && fieldValue < value
      case this.parseOperators.gte:
        return typeof fieldValue === 'number' && typeof value === 'number' && fieldValue >= value
      case this.parseOperators.lte:
        return typeof fieldValue === 'number' && typeof value === 'number' && fieldValue <= value
      case this.parseOperators.contains:
        return (
          typeof fieldValue === 'string' && typeof value === 'string' && fieldValue.includes(value)
        )
      case this.parseOperators.startsWith:
        return (
          typeof fieldValue === 'string' &&
          typeof value === 'string' &&
          fieldValue.startsWith(value)
        )
      case this.parseOperators.endsWith:
        return (
          typeof fieldValue === 'string' && typeof value === 'string' && fieldValue.endsWith(value)
        )
      default:
        return false
    }
  }

  /**
   * Gets a nested value from an object using dot notation.
   * @description Traverses object properties using dot-separated path.
   * @param obj - Object to traverse
   * @param path - Dot-separated path to the property
   * @returns Value at the specified path or undefined
   */
  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    if (!path.includes('.')) {
      return obj[path]
    }
    let current: unknown = obj
    const keys: string[] = path.split('.')
    for (let i: number = 0; i < keys.length; i++) {
      if (current === null || current === undefined || typeof current !== 'object') {
        return undefined
      }
      const key: string | undefined = keys[i]
      if (key === undefined) {
        return undefined
      }
      current = (current as Record<string, unknown>)[key]
    }
    return current
  }

  /**
   * Strips quotes from string values.
   * @description Removes surrounding single or double quotes from string values.
   * @param value - String value to process
   * @returns Processed value with quotes removed if applicable
   */
  private stripQuotes(value: unknown): unknown {
    if (
      typeof value === 'string' &&
      ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith('\'') && value.endsWith('\'')))
    ) {
      return value.slice(1, -1)
    }
    return value
  }

  /**
   * Parses special string values to their appropriate types.
   * @description Converts string representations of special values to their actual types.
   * @param value - Value to parse
   * @returns Parsed value in appropriate type
   */
  private parseSpecialValue(value: unknown): unknown {
    if (value === 'true') {
      return true
    }
    if (value === 'false') {
      return false
    }
    if (value === 'null') {
      return null
    }
    if (value === 'undefined') {
      return undefined
    }
    if (!isNaN(Number(value)) && value !== '') {
      return Number(value)
    }
    return value
  }

  /**
   * Parses a string condition into structured format.
   * @description Converts string-based conditions into JsonaryCondition objects.
   * @param condition - String condition to parse
   * @returns Parsed condition object or null if invalid
   */
  private parseCondition(condition: string): JsonaryCondition | null {
    if (QueryBuilder.conditionRecent.has(condition)) {
      return QueryBuilder.conditionRecent.get(condition) ?? null
    }
    const operators: string[] = Object.values(this.parseOperators).sort(
      (a: string, b: string) => b.length - a.length
    )
    for (const op of operators) {
      const index: number = condition.indexOf(op)
      if (index !== -1) {
        const value: string = condition.substring(index + op.length).trim()
        const parsedValue: unknown = this.parseSpecialValue(this.stripQuotes(value))

        const result: JsonaryCondition = {
          field: condition.substring(0, index).trim(),
          operator: op as JsonaryCondition['operator'],
          value: parsedValue
        }
        QueryBuilder.conditionRecent.set(condition, result)
        return result
      }
    }
    QueryBuilder.conditionRecent.set(condition, null)
    return null
  }
}
