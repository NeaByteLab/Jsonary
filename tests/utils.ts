import { assert } from '@std/assert'
import Jsonary from '@neabyte/jsonary'

export function assertIndex<T>(value: T | undefined, message: string): T {
  assert(value !== undefined, message)
  return value
}

export function assertRecord(value: unknown, message: string): Record<string, unknown> {
  assert(typeof value === 'object' && value !== null, message)
  return value as Record<string, unknown>
}

export async function withTempDb<T>(
  initialData: Record<string, unknown>[],
  fn: (db: Jsonary, filePath: string) => Promise<T> | T
): Promise<T> {
  const dir = await Deno.makeTempDir()
  const filePath = `${dir}/data.json`
  await Deno.writeTextFile(filePath, JSON.stringify(initialData, null, 2))
  try {
    const db = new Jsonary({ path: filePath })
    return await fn(db, filePath)
  } finally {
    await Deno.remove(dir, { recursive: true })
  }
}

export async function withTempDbRoot<T>(
  root: unknown,
  fn: (db: Jsonary, filePath: string) => Promise<T> | T
): Promise<T> {
  const dir = await Deno.makeTempDir()
  const filePath = `${dir}/data.json`
  await Deno.writeTextFile(filePath, JSON.stringify(root, null, 2))
  try {
    const db = new Jsonary({ path: filePath })
    return await fn(db, filePath)
  } finally {
    await Deno.remove(dir, { recursive: true })
  }
}
