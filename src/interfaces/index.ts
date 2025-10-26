/**
 * Query condition structure for filtering data.
 * @description Defines the structure for parsing and evaluating query conditions.
 */
export interface JsonaryCondition {
  /** Field name to evaluate */
  field: string
  /** Comparison operator to use */
  operator: QueryOperator
  /** Value to compare against */
  value: unknown
}

/**
 * Configuration options for Jsonary instance.
 * @description Defines the file path where JSON data will be stored and managed.
 */
export interface JsonaryOptions {
  /** File path to the JSON data file */
  path: string
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

/**
 * Operator type for query conditions.
 * @description Union type of all valid query operators.
 */
export type QueryOperator = QueryOperatorsType[keyof QueryOperatorsType]

/**
 * Available query operators for filtering data.
 * @description Defines all supported comparison operators used in query conditions.
 */
export type QueryOperatorsType = {
  /** Equality operator for exact matches */
  readonly eq: '='
  /** Inequality operator for non-matching values */
  readonly neq: '!='
  /** Greater than operator for numeric comparisons */
  readonly gt: '>'
  /** Less than operator for numeric comparisons */
  readonly lt: '<'
  /** Greater than or equal operator for numeric comparisons */
  readonly gte: '>='
  /** Less than or equal operator for numeric comparisons */
  readonly lte: '<='
  /** Contains operator for substring matching */
  readonly contains: 'contains'
  /** Starts with operator for prefix matching */
  readonly startsWith: 'startsWith'
  /** Ends with operator for suffix matching */
  readonly endsWith: 'endsWith'
}
