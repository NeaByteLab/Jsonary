import { existsSync, readFileSync, writeFileSync } from 'node:fs'

/**
 * File storage utility.
 * @description Static methods for JSON file operations.
 */
export default class Storage {
  /**
   * Load data from JSON file.
   * @description Reads JSON and normalizes array root.
   * @template T - The type of records
   * @param filePath - Path to the JSON file
   * @returns Array of records or empty array if file doesn't exist or is invalid
   */
  static load<T extends Record<string, unknown>>(filePath: string): T[] {
    try {
      if (!existsSync(filePath)) {
        return []
      }
      const fileContent: string = readFileSync(filePath, 'utf-8')
      const parsedJson: unknown = JSON.parse(fileContent)
      if (Array.isArray(parsedJson)) {
        return parsedJson as T[]
      }
      return [parsedJson as T]
    } catch {
      return []
    }
  }

  /**
   * Save data to JSON file.
   * @description Writes records as formatted JSON.
   * @template T - The type of records
   * @param filePath - Path to the JSON file
   * @param data - Array of records to save
   * @throws {Error} When file write operation fails
   */
  static save<T extends Record<string, unknown>>(filePath: string, data: T[]): void {
    try {
      const fileContent: string = JSON.stringify(data, null, 2)
      writeFileSync(filePath, fileContent, 'utf-8')
    } catch (error) {
      throw new Error(String(error))
    }
  }
}
