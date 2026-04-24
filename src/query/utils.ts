/**
 * Query utilities.
 * @description Static helper methods for query processing.
 */
export default class Utils {
  /**
   * Parse special value tokens.
   * @description Converts tokens to typed values.
   * @param value - Value to parse
   * @returns Parsed value in appropriate type
   */
  static parseValue(value: unknown): unknown {
    switch (value) {
      case 'true':
        return true
      case 'false':
        return false
      case 'null':
        return null
      case 'undefined':
        return undefined
      default:
        if (!isNaN(Number(value)) && value !== '') {
          return Number(value)
        }
        return value
    }
  }

  /**
   * Strip surrounding quotes.
   * @description Removes wrapping single or double quotes.
   * @param value - String value to process
   * @returns Processed value with quotes removed if applicable
   */
  static stripQuotes(value: unknown): unknown {
    if (
      typeof value === 'string' &&
      ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'")))
    ) {
      return value.slice(1, -1)
    }
    return value
  }
}
