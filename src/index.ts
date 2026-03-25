import type * as Types from '@app/Types.ts'
import { QueryBuilder } from '@app/Query.ts'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * JSON database manager
 * @description CRUD and queries for JSON file.
 */
export default class Jsonary {
  /** File path where JSON data is stored */
  private readonly filePath: string
  /** Internal data array containing all records */
  private data: Record<string, unknown>[]

  /**
   * Create Jsonary instance
   * @description Resolves path and loads existing data.
   * @param options - Configuration options containing the file path
   */
  constructor(options: Types.JsonaryOptions) {
    this.filePath = resolve(options.path)
    this.data = this.loadData()
  }

  /**
   * Clear all records
   * @description Empties data and saves file.
   */
  clear(): void {
    this.data = []
    this.saveData()
  }

  /**
   * Delete matching records
   * @description Removes matches and saves to file.
   * @param condition - Query string or function to determine which records to delete
   * @returns Number of records deleted
   */
  deleteWhere(condition: string | ((item: Record<string, unknown>) => boolean)): number {
    const initialRecordCount: number = this.data.length
    if (typeof condition === 'function') {
      this.data = this.data.filter((item: Record<string, unknown>) => !condition(item))
    } else {
      const builder: QueryBuilder = new QueryBuilder(this.data)
      const parsedCondition: Types.JsonaryCondition | null = builder['parseCondition'](condition)
      if (parsedCondition) {
        this.data = this.data.filter(
          (item: Record<string, unknown>) => !builder['evaluateCondition'](item, parsedCondition)
        )
      }
    }
    this.saveData()
    return initialRecordCount - this.data.length
  }

  /**
   * Get all records
   * @description Returns copy of all records.
   * @returns Array of all records
   */
  get(): Record<string, unknown>[] {
    return [...this.data]
  }

  /**
   * Insert one record
   * @description Appends record and saves to file.
   * @param item - Record to insert
   */
  insert(item: Record<string, unknown>): void {
    this.data.push(item)
    this.saveData()
  }

  /**
   * Insert many records
   * @description Appends records and saves to file.
   * @param items - Array of records to insert
   */
  insertMany(items: Record<string, unknown>[]): void {
    this.data = this.data.concat(items)
    this.saveData()
  }

  /**
   * Reload data file
   * @description Loads current file into memory.
   */
  reload(): void {
    this.data = this.loadData()
  }

  /**
   * Sync from QueryBuilder
   * @description Applies updated record array then saves.
   * @param updatedData - Updated data array from QueryBuilder
   */
  syncFromQueryBuilder(updatedData: Record<string, unknown>[]): void {
    this.data = updatedData
    this.saveData()
  }

  /**
   * Update matching records
   * @description Updates matches and saves to file.
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
        const parsed: Types.JsonaryCondition | null = builder['parseCondition'](condition)
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
   * Start query builder
   * @description Returns builder for chained operations.
   * @param condition - Initial condition to filter data
   * @returns QueryBuilder instance for chained operations
   */
  where(condition: string | ((item: Record<string, unknown>) => boolean)): QueryBuilder {
    return new QueryBuilder(this.data, this).where(condition)
  }

  /**
   * Load data from file
   * @description Reads JSON and normalizes array root.
   * @returns Array of records or empty array if file doesn't exist or is invalid
   */
  private loadData(): Record<string, unknown>[] {
    try {
      if (!existsSync(this.filePath)) {
        return []
      }
      const fileContent: string = readFileSync(this.filePath, 'utf-8')
      const parsedJson: unknown = JSON.parse(fileContent)
      if (Array.isArray(parsedJson)) {
        return parsedJson as Record<string, unknown>[]
      }
      return [parsedJson as Record<string, unknown>]
    } catch {
      return []
    }
  }

  /**
   * Save data to file
   * @description Writes current records as JSON.
   * @throws {Error} When file write operation fails
   */
  private saveData(): void {
    try {
      const fileContent: string = JSON.stringify(this.data, null, 2)
      writeFileSync(this.filePath, fileContent, 'utf-8')
    } catch (error) {
      throw new Error(String(error))
    }
  }

  /**
   * Set nested object value
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
}

/**
 * Export public types
 * @description Re-exports Types module for consumers.
 */
export type * as Types from '@app/Types.ts'
