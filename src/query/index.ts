import type * as Types from '@app/types.ts'
import Parser from '@query/parser.ts'
import Evaluator from '@query/evaluator.ts'
import Nested from '@core/nested.ts'

/**
 * Query builder for records.
 * @description Fluent chaining for filters, updates, deletes.
 * @template T - The type of records being queried
 */
export default class Query<T extends Record<string, unknown> = Record<string, unknown>> {
  /** Parent instance for synchronization */
  private readonly parentDb: Types.JsonaryParent<T> | undefined
  /** Array of applied conditions */
  private readonly conditions: Types.JsonaryCondition[] = []
  /** Original data array reference */
  private readonly originalRecords: T[]
  /** Current filtered data array */
  private records: T[]

  /**
   * Create QueryBuilder instance.
   * @description Stores records and optional parent sync.
   * @param data - Array of data records to query
   * @param parent - Optional parent instance for synchronization
   */
  constructor(data: T[], parent?: Types.JsonaryParent<T>) {
    this.originalRecords = data
    this.records = [...data]
    this.parentDb = parent
  }

  /**
   * Count filtered records.
   * @description Returns records matching current conditions.
   * @returns Number of matching records
   */
  count(): number {
    return this.records.length
  }

  /**
   * Delete filtered records.
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
   * Get first filtered record.
   * @description Returns first match, or null.
   * @returns First matching record or null
   */
  first(): T | null {
    return this.records[0] ?? null
  }

  /**
   * Get filtered records.
   * @description Returns copy of matching records.
   * @returns Array of matching records
   */
  get(): T[] {
    return [...this.records]
  }

  /**
   * Update filtered records.
   * @description Applies fields to all matches.
   * @param data - Object containing fields to update
   */
  update(data: Record<string, unknown>): void {
    this.records.forEach((item: Record<string, unknown>) => {
      Object.keys(data).forEach((key: string) => {
        if (key.includes('.')) {
          Nested.set(item, key, data[key])
        } else {
          item[key] = data[key]
        }
      })
    })
    this.parentDb?.syncFromQueryBuilder(this.originalRecords)
  }

  /**
   * Add filter condition.
   * @description Filters by string or predicate.
   * @param condition - Query string or function to filter records
   * @returns QueryBuilder instance for chaining
   */
  where(condition: string | ((item: T) => boolean)): Query<T> {
    if (typeof condition === 'function') {
      this.records = this.records.filter(condition)
    } else {
      const parsedCondition: Types.JsonaryCondition | null = Parser.parse(condition)
      if (parsedCondition) {
        this.conditions.push(parsedCondition)
        this.records = this.records.filter((item: T) => Evaluator.evaluate(item, parsedCondition))
      }
    }
    return this
  }
}

/** Re-export query utilities. */
export { Evaluator, Parser }
