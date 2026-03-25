/**
 * Query condition structure
 * @description Parsed condition for record filtering.
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
 * Jsonary configuration options
 * @description Config for Jsonary file storage.
 */
export interface JsonaryOptions {
  /** File path to the JSON data file */
  path: string
}

/**
 * Parent interface for QueryBuilder sync
 * @description Contract for QueryBuilder sync updates.
 */
export interface JsonaryParent {
  /**
   * Synchronizes data from QueryBuilder
   * @description Applies QueryBuilder changes to parent.
   * @param updatedData - The updated data array to sync
   */
  syncFromQueryBuilder(updatedData: Record<string, unknown>[]): void
}

/**
 * Query operator type
 * @description Union of valid operator tokens.
 */
export type QueryOperator = QueryOperatorsType[keyof QueryOperatorsType]

/**
 * Available query operators
 * @description Operator tokens supported in conditions.
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
