import { assert, assertEquals } from '@std/assert'
import Jsonary from '@neabyte/jsonary'

function assertRecord(value: unknown, message: string): Record<string, unknown> {
  assert(typeof value === 'object' && value !== null, message)
  return value as Record<string, unknown>
}

function assertIndex<T>(value: T | undefined, message: string): T {
  assert(value !== undefined, message)
  return value
}

async function withTempDb<T>(
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

async function withTempDbRoot<T>(
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

Deno.test('Jsonary - accepts non-array root JSON (wraps into single record list)', async () => {
  await withTempDbRoot({ name: 'Root' }, (db) => {
    assertEquals(db.get().length, 1)
    const record = assertIndex(db.get()[0], 'Expected single wrapped record')
    assertEquals(record['name'], 'Root')
  })
})

Deno.test('Jsonary - deleteWhere supports string and function conditions', async () => {
  await withTempDb(
    [
      { name: 'A', age: 10 },
      { name: 'B', age: 17 },
      { name: 'C', age: 20 }
    ],
    (db) => {
      const deletedString = db.deleteWhere('age < 18')
      assertEquals(deletedString, 2)
      assertEquals(db.get().length, 1)
      const remaining = assertIndex(db.get()[0], 'Expected one remaining record')
      assertEquals(remaining['name'], 'C')

      const deletedFn = db.deleteWhere((item) => {
        const age = item['age']
        return typeof age === 'number' && age < 25
      })
      assertEquals(deletedFn, 1)
      assertEquals(db.get().length, 0)
    }
  )
})

Deno.test('Jsonary - invalid string condition does not filter results', async () => {
  await withTempDb(
    [
      { name: 'A', age: 1 },
      { name: 'B', age: 2 }
    ],
    (db) => {
      const result = db.where('age').get()
      assertEquals(result.length, 2)
    }
  )
})

Deno.test('Jsonary - insert and get persist to file', async () => {
  await withTempDb([], async (db, filePath) => {
    db.insert({ name: 'John', age: 30 })

    const all = db.get()
    assertEquals(all.length, 1)
    const first = assertIndex(all[0], 'Expected at least one record')
    assertEquals(first['name'], 'John')
    assertEquals(first['age'], 30)

    const parsed = JSON.parse(await Deno.readTextFile(filePath)) as unknown
    assert(Array.isArray(parsed), 'Expected JSON array in file')
    const firstInFile = assertIndex((parsed as Record<string, unknown>[])[0], 'File array empty')
    assertEquals(firstInFile['name'], 'John')
  })
})

Deno.test('Jsonary - insertMany persists and clear wipes the file', async () => {
  await withTempDb([], async (db, filePath) => {
    db.insertMany([
      { name: 'Jane', age: 25 },
      { name: 'Bob', age: 35 }
    ])

    assertEquals(db.get().length, 2)

    db.clear()
    assertEquals(db.get().length, 0)

    const parsed = JSON.parse(await Deno.readTextFile(filePath)) as unknown
    assert(Array.isArray(parsed), 'Expected JSON array in file')
    assertEquals((parsed as unknown[]).length, 0)
  })
})

Deno.test('Jsonary - query operators (quoted values and contains/starts/ends)', async () => {
  await withTempDb(
    [
      { name: 'John', age: 31 },
      { name: 'Johnny', age: 20 },
      { name: 'Alice', age: 18 }
    ],
    (db) => {
      assertEquals(db.where('name = "John"').first()?.['age'], 31)

      const contains = db.where('name contains "ohn"').get()
      assertEquals(contains.length, 2)

      const starts = db.where('name startsWith "John"').get()
      assertEquals(starts.length, 2)

      const ends = db.where('name endsWith "lice"').get()
      assertEquals(ends.length, 1)
      const endRecord = assertIndex(ends[0], 'Expected one endsWith match')
      assertEquals(endRecord['name'], 'Alice')

      const gte = db.where('age >= 20').count()
      assertEquals(gte, 2)

      const lte = db.where('age <= 20').count()
      assertEquals(lte, 2)
    }
  )
})

Deno.test('Jsonary - query operators neq/gt/lt plus single quotes', async () => {
  await withTempDb(
    [
      { name: 'John', age: 21 },
      { name: 'Jane', age: 20 },
      { name: 'Alice', age: 19 }
    ],
    (db) => {
      assertEquals(db.where("name = 'John'").count(), 1)
      assertEquals(db.where('age != 20').count(), 2)
      assertEquals(db.where('age > 20').count(), 1)
      assertEquals(db.where('age < 20').count(), 1)
      assertEquals(db.where('age >= 20').count(), 2)
      assertEquals(db.where('age <= 21').count(), 3)
    }
  )
})

Deno.test('Jsonary - query supports null and undefined values', async () => {
  await withTempDb([{ name: 'A', value: null }, { name: 'B' }], (db) => {
    assertEquals(db.where('value = null').count(), 1)
    assertEquals(db.where('value = null').first()?.['name'], 'A')

    assertEquals(db.where('value = undefined').count(), 1)
    assertEquals(db.where('value = undefined').first()?.['name'], 'B')

    assertEquals(db.where('value != undefined').count(), 1)
  })
})

Deno.test('Jsonary - reload picks up external file changes', async () => {
  await withTempDb([], async (_db, filePath) => {
    const db = new Jsonary({ path: filePath })
    assertEquals(db.get().length, 0)
    await Deno.writeTextFile(filePath, JSON.stringify([{ id: 1 }, { id: 2 }], null, 2))
    db.reload()
    const all = db.get()
    assertEquals(all.length, 2)
    const first = assertIndex(all[0], 'Expected first record')
    const second = assertIndex(all[1], 'Expected second record')
    assertEquals(first['id'], 1)
    assertEquals(second['id'], 2)
  })
})

Deno.test('Jsonary - updateWhere creates nested objects for missing paths', async () => {
  await withTempDb([{ name: 'John', age: 30 }], (db) => {
    const updated = db.updateWhere('name = John', { 'profile.settings.theme': 'dark' })
    assertEquals(updated, 1)

    const record = db.where('profile.settings.theme = dark').first()
    assert(record !== null, 'Expected a matching record')

    const profile = assertRecord(record?.['profile'], 'Expected profile object')
    const settings = assertRecord(profile['settings'], 'Expected settings object')
    assertEquals(settings['theme'], 'dark')
  })
})

Deno.test('Jsonary - updateWhere supports function predicate', async () => {
  await withTempDb(
    [
      { name: 'A', age: 10 },
      { name: 'B', age: 17 },
      { name: 'C', age: 20 }
    ],
    (db) => {
      const updated = db.updateWhere(
        (item) => {
          const age = item['age']
          return typeof age === 'number' && age < 18
        },
        { status: 'minor' }
      )

      assertEquals(updated, 2)
      assertEquals(db.where('status = minor').count(), 2)
      assertEquals(
        db
          .where('status = minor')
          .get()
          .some((item: Record<string, unknown>) => item['name'] === 'C'),
        false
      )
    }
  )
})

Deno.test('Jsonary - updateWhere supports nested dot-path keys', async () => {
  await withTempDb([{ name: 'Jane', age: 25, profile: { role: 'admin', active: false } }], (db) => {
    const updated = db.updateWhere('profile.role = admin', {
      'profile.active': true,
      'profile.verified': true
    })

    assertEquals(updated, 1)

    const admin = db.where('profile.active = true').first()
    assert(admin !== null, 'Expected a matching admin record')
    const profile = assertRecord(admin?.['profile'], 'Expected profile object')
    assertEquals(profile['active'], true)
    assertEquals(profile['role'], 'admin')
    assertEquals(profile['verified'], true)
  })
})

Deno.test('Jsonary - where chaining update/count/first/delete', async () => {
  await withTempDb(
    [
      { name: 'John', age: 30, profile: { role: 'admin', active: true } },
      { name: 'Jane', age: 25, profile: { role: 'user', active: true } },
      { name: 'Bob', age: 40, profile: { role: 'admin', active: false } }
    ],
    (db) => {
      db.where('age >= 25').where('profile.role = admin').update({ 'profile.verified': true })

      const verifiedAdmins = db.where('profile.verified = true').get()
      assertEquals(verifiedAdmins.length, 2)
      const verifiedAdmin = assertIndex(verifiedAdmins[0], 'Expected one verified admin record')
      assertEquals(verifiedAdmin['name'], 'John')

      const adminCount = db.where('profile.role = admin').count()
      assertEquals(adminCount, 2)

      const firstAdmin = db.where('profile.role = admin').first()
      assert(firstAdmin !== null, 'Expected a first admin record')
      assertEquals(firstAdmin?.['name'], 'John')

      const deleted = db.where('profile.active = false').delete()
      assertEquals(deleted, 1)
      assertEquals(db.where('profile.active = false').count(), 0)
    }
  )
})

Deno.test('Jsonary - where supports function predicate chaining', async () => {
  await withTempDb(
    [
      { name: 'John', age: 31 },
      { name: 'Johnny', age: 20 },
      { name: 'Alice', age: 18 }
    ],
    (db) => {
      const result = db
        .where((item) => {
          const age = item['age']
          return typeof age === 'number' && age >= 20
        })
        .where('name contains "ohn"')
        .get()

      assertEquals(result.length, 2)
      assertEquals(
        result.some((item: Record<string, unknown>) => item['name'] === 'Alice'),
        false
      )
    }
  )
})
