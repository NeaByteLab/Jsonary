import type { JsonaryCondition, JsonaryOptions } from '@interfaces/index'
import { QueryBuilder } from '@root/Query'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * JSON database management class.
 * @description Provides CRUD operations and querying capabilities for JSON data stored in files.
 */
export default class Jsonary {
  /** File path where JSON data is stored */
  private readonly filePath: string
  /** Internal data array containing all records */
  private data: Record<string, unknown>[]

  /**
   * Creates a new Jsonary instance.
   * @description Initializes the database with the specified file path and loads existing data.
   * @param options - Configuration options containing the file path
   */
  constructor(options: JsonaryOptions) {
    this.filePath = resolve(options.path)
    this.data = this.loadData()
  }

  /**
   * Clears all data from the database.
   * @description Removes all records and saves the empty state to file.
   */
  clear(): void {
    this.data = []
    this.saveData()
  }

  /**
   * Deletes records matching the specified condition.
   * @description Removes all records that match the condition and saves changes to file.
   * @param condition - Query string or function to determine which records to delete
   * @returns Number of records deleted
   */
  deleteWhere(condition: string | ((item: Record<string, unknown>) => boolean)): number {
    const initialLength: number = this.data.length
    if (typeof condition === 'function') {
      this.data = this.data.filter((item: Record<string, unknown>) => !condition(item))
    } else {
      const builder: QueryBuilder = new QueryBuilder(this.data)
      const parsed: JsonaryCondition | null = builder['parseCondition'](condition)
      if (parsed) {
        this.data = this.data.filter(
          (item: Record<string, unknown>) => !builder['evaluateCondition'](item, parsed)
        )
      }
    }
    this.saveData()
    return initialLength - this.data.length
  }

  /**
   * Retrieves all records from the database.
   * @description Returns a copy of all data records.
   * @returns Array of all records
   */
  get(): Record<string, unknown>[] {
    return [...this.data]
  }

  /**
   * Inserts a single record into the database.
   * @description Adds a new record and saves changes to file.
   * @param item - Record to insert
   */
  insert(item: Record<string, unknown>): void {
    this.data.push(item)
    this.saveData()
  }

  /**
   * Inserts multiple records into the database.
   * @description Adds multiple records at once and saves changes to file.
   * @param items - Array of records to insert
   */
  insertMany(items: Record<string, unknown>[]): void {
    this.data = this.data.concat(items)
    this.saveData()
  }

  /**
   * Reloads data from the file.
   * @description Refreshes the internal data from the stored JSON file.
   */
  reload(): void {
    this.data = this.loadData()
  }

  /**
   * Synchronizes data from QueryBuilder.
   * @description Updates internal data with changes made through QueryBuilder operations.
   * @param updatedData - Updated data array from QueryBuilder
   */
  syncFromQueryBuilder(updatedData: Record<string, unknown>[]): void {
    this.data = updatedData
    this.saveData()
  }

  /**
   * Updates records matching the specified condition.
   * @description Modifies fields of records that match the condition and saves changes to file.
   * @param condition - Query string or function to determine which records to update
   * @param data - Object containing fields to update
   * @returns Number of records updated
   */
  updateWhere(
    condition: string | ((item: Record<string, unknown>) => boolean),
    data: Record<string, unknown>
  ): number {
    let updatedCount: number = 0
    this.data.forEach((item: Record<string, unknown>) => {
      let shouldUpdate: boolean = false
      if (typeof condition === 'function') {
        shouldUpdate = condition(item)
      } else {
        const builder: QueryBuilder = new QueryBuilder([item])
        const parsed: JsonaryCondition | null = builder['parseCondition'](condition)
        if (parsed) {
          shouldUpdate = builder['evaluateCondition'](item, parsed)
        }
      }
      if (shouldUpdate) {
        Object.keys(data).forEach((key: string) => {
          if (key.includes('.')) {
            this.setNestedValue(item, key, data[key])
          } else {
            item[key] = data[key]
          }
        })
        updatedCount++
      }
    })
    this.saveData()
    return updatedCount
  }

  /**
   * Creates a QueryBuilder for filtering data.
   * @description Returns a QueryBuilder instance to perform chained query operations.
   * @param condition - Initial condition to filter data
   * @returns QueryBuilder instance for chained operations
   */
  where(condition: string | ((item: Record<string, unknown>) => boolean)): QueryBuilder {
    return new QueryBuilder(this.data, this).where(condition)
  }

  /**
   * Loads data from the JSON file.
   * @description Reads and parses JSON data from the configured file path.
   * @returns Array of records or empty array if file doesn't exist or is invalid
   */
  private loadData(): Record<string, unknown>[] {
    try {
      if (!existsSync(this.filePath)) {
        return []
      }
      const content: string = readFileSync(this.filePath, 'utf-8')
      const parsed: unknown = JSON.parse(content)
      if (Array.isArray(parsed)) {
        return parsed as Record<string, unknown>[]
      }
      return [parsed as Record<string, unknown>]
    } catch {
      return []
    }
  }

  /**
   * Saves data to the JSON file.
   * @description Writes the current data array to the configured file path.
   * @throws {Error} When file write operation fails
   */
  private saveData(): void {
    try {
      const content: string = JSON.stringify(this.data, null, 2)
      writeFileSync(this.filePath, content, 'utf-8')
    } catch (error) {
      throw new Error(String(error))
    }
  }

  /**
   * Sets a nested value in an object using dot notation.
   * @description Creates nested objects as needed and sets the final value.
   * @param obj - Object to modify
   * @param path - Dot-separated path to the property
   * @param value - Value to set
   */
  private setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): void {
    const keys: string[] = path.split('.')
    let current: Record<string, unknown> = obj
    for (let i: number = 0; i < keys.length - 1; i++) {
      const key: string | undefined = keys[i]
      if (key === undefined) {
        continue
      }
      if (!(key in current) || typeof current[key] !== 'object' || current[key] === null) {
        current[key] = {}
      }
      current = current[key] as Record<string, unknown>
    }
    const lastKey: string | undefined = keys[keys.length - 1]
    if (lastKey !== undefined) {
      current[lastKey] = value
    }
  }
}

/**
 * Exports interfaces for type checking.
 * @description Provides type definitions for Jsonary operations and conditions.
 */
export * from '@interfaces/index'
