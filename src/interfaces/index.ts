/**
 * Configuration options for Jsonary instance.
 * @description Defines the file path where JSON data will be stored and managed.
 */
export interface JsonaryOptions {
  /** File path to the JSON data file */
  path: string
}

/**
 * Query condition structure for filtering data.
 * @description Defines the structure for parsing and evaluating query conditions.
 */
export interface JsonaryCondition {
  /** Field name to evaluate */
  field: string
  /** Comparison operator to use */
  operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'contains' | 'startsWith' | 'endsWith'
  /** Value to compare against */
  value: unknown
}

/**
 * Parent interface for synchronization with QueryBuilder.
 * @description Defines the contract for parent instances to receive updates from QueryBuilder operations.
 */
export interface JsonaryParent {
  /**
   * Synchronizes updated data from QueryBuilder.
   * @description Updates the parent instance with modified data after query operations.
   * @param updatedData - The updated data array to sync
   */
  syncFromQueryBuilder(updatedData: Record<string, unknown>[]): void
}
