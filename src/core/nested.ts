/**
 * Nested value utility.
 * @description Static methods for dot-path object access.
 */
export default class Nested {
  /**
   * Get nested value by dot-separated path.
   * @description Traverses dot-separated property path.
   * @param obj - Object to traverse
   * @param path - Dot-separated path to the property
   * @returns Value at the specified path or undefined
   */
  static get(obj: Record<string, unknown>, path: string): unknown {
    if (!path.includes('.')) {
      return obj[path]
    }
    let currentValue: unknown = obj
    const keys: string[] = path.split('.')
    for (let i: number = 0; i < keys.length; i++) {
      if (currentValue === null || currentValue === undefined || typeof currentValue !== 'object') {
        return undefined
      }
      const key: string | undefined = keys[i]
      if (key === undefined) {
        return undefined
      }
      currentValue = (currentValue as Record<string, unknown>)[key]
    }
    return currentValue
  }

  /**
   * Set nested value by dot-separated path.
   * @description Creates intermediate objects and sets final value.
   * @param obj - Object to modify
   * @param path - Dot-separated path to the property
   * @param value - Value to set
   */
  static set(obj: Record<string, unknown>, path: string, value: unknown): void {
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
