/**
 * Query condition structure.
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
 * Jsonary configuration options.
 * @description Config for Jsonary file storage.
 */
export interface JsonaryOptions {
  /** JSON data file path */
  path: string
}

/**
 * Parent interface for QueryBuilder sync.
 * @description Contract for QueryBuilder sync updates.
 * @template T - The type of records in the database
 */
export interface JsonaryParent<T extends Record<string, unknown> = Record<string, unknown>> {
  /**
   * Synchronizes data from QueryBuilder.
   * @description Applies QueryBuilder changes to parent.
   * @param updatedData - The updated data array to sync
   */
  syncFromQueryBuilder(updatedData: T[]): void
}

/**
 * Query operator type.
 * @description Union of valid operator tokens.
 */
export type QueryOperator = QueryOperatorsType[keyof QueryOperatorsType]

/**
 * Available query operators.
 * @description Operator tokens supported in conditions.
 */
export type QueryOperatorsType = {
  /** Contains operator for substring matching */
  readonly contains: 'contains'
  /** Ends with operator for suffix matching */
  readonly endsWith: 'endsWith'
  /** Equality operator for exact matches */
  readonly eq: '='
  /** Greater than operator for numeric comparisons */
  readonly gt: '>'
  /** Greater or equal operator */
  readonly gte: '>='
  /** Less than operator for numeric comparisons */
  readonly lt: '<'
  /** Less or equal operator */
  readonly lte: '<='
  /** Inequality operator for non-matching values */
  readonly neq: '!='
  /** Starts with operator for prefix matching */
  readonly startsWith: 'startsWith'
}
