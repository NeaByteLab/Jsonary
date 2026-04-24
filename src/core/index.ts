import type * as Types from '@app/types.ts'
import * as Query from '@query/index.ts'
import { Evaluator, Parser } from '@query/index.ts'
import Storage from '@core/storage.ts'
import Nested from '@core/nested.ts'
import { resolve } from 'node:path'

/**
 * JSON database manager.
 * @description CRUD and queries for JSON file.
 * @template T - The type of records stored in the database
 */
export default class Jsonary<T extends Record<string, unknown> = Record<string, unknown>> {
  /** File path for JSON storage */
  private readonly filePath: string
  /** Internal data array containing all records */
  private data: T[]

  /**
   * Create Jsonary instance.
   * @description Resolves path and loads existing data.
   * @param options - Configuration options containing the file path
   */
  constructor(options: Types.JsonaryOptions) {
    this.filePath = resolve(options.path)
    this.data = Storage.load<T>(this.filePath)
  }

  /**
   * Clear all records.
   * @description Empties data and saves file.
   */
  clear(): void {
    this.data = []
    this.persist()
  }

  /**
   * Delete matching records.
   * @description Removes matches and saves to file.
   * @param condition - Query string or function to determine which records to delete
   * @returns Number of records deleted
   */
  deleteWhere(condition: string | ((item: T) => boolean)): number {
    const initialRecordCount: number = this.data.length
    if (typeof condition === 'function') {
      this.data = this.data.filter((item: T) => !condition(item))
    } else {
      const parsedCondition: Types.JsonaryCondition | null = Parser.parse(condition)
      if (parsedCondition) {
        this.data = this.data.filter((item: T) => !Evaluator.evaluate(item, parsedCondition))
      }
    }
    this.persist()
    return initialRecordCount - this.data.length
  }

  /**
   * Get all records.
   * @description Returns copy of all records.
   * @returns Array of all records
   */
  get(): T[] {
    return [...this.data]
  }

  /**
   * Insert one record.
   * @description Appends record and saves to file.
   * @param item - Record to insert
   */
  insert(item: T): void {
    this.data.push(item)
    this.persist()
  }

  /**
   * Insert many records.
   * @description Appends records and saves to file.
   * @param items - Array of records to insert
   */
  insertMany(items: T[]): void {
    this.data = this.data.concat(items)
    this.persist()
  }

  /**
   * Reload data file.
   * @description Loads current file into memory.
   */
  reload(): void {
    this.data = Storage.load<T>(this.filePath)
  }

  /**
   * Sync from QueryBuilder.
   * @description Applies updated record array then saves.
   * @param updatedData - Updated data array from QueryBuilder
   */
  syncFromQueryBuilder(updatedData: T[]): void {
    this.data = updatedData
    this.persist()
  }

  /**
   * Update matching records.
   * @description Updates matches and saves to file.
   * @param condition - Query string or function to determine which records to update
   * @param data - Object containing fields to update (partial of T)
   * @returns Number of records updated
   */
  updateWhere(condition: string | ((item: T) => boolean), data: Partial<T>): number {
    let updatedCount: number = 0
    this.data.forEach((item: T) => {
      let shouldUpdate: boolean = false
      if (typeof condition === 'function') {
        shouldUpdate = condition(item)
      } else {
        const parsed: Types.JsonaryCondition | null = Parser.parse(condition)
        if (parsed) {
          shouldUpdate = Evaluator.evaluate(item, parsed)
        }
      }
      if (shouldUpdate) {
        Object.keys(data).forEach((key: string) => {
          if (key.includes('.')) {
            Nested.set(item, key, data[key as keyof Partial<T>])
          } else {
            ;(item as Record<string, unknown>)[key] = data[key as keyof Partial<T>]
          }
        })
        updatedCount++
      }
    })
    this.persist()
    return updatedCount
  }

  /**
   * Start query builder.
   * @description Returns builder for chained operations.
   * @param condition - Initial condition to filter data
   * @returns QueryBuilder instance for chained operations
   */
  where(condition: string | ((item: T) => boolean)): Query.default<T> {
    return new Query.default<T>(this.data, this).where(condition)
  }

  /**
   * Save data to file.
   * @description Writes current records as JSON.
   */
  private persist(): void {
    Storage.save(this.filePath, this.data)
  }
}
