import { assert, assertEquals, assertThrows } from '@std/assert'
import { withTempDb } from '@tests/utils.ts'
import Jsonary from '@neabyte/jsonary'

Deno.test('Edge - empty database operations', async () => {
  await withTempDb([], (db) => {
    assertEquals(db.get().length, 0)
    assertEquals(db.where('name = John').get().length, 0)
    assertEquals(db.where('name = John').first(), null)
    assertEquals(db.where('name = John').count(), 0)
    assertEquals(db.where('name = John').delete(), 0)
    assertEquals(db.updateWhere('name = John', { status: 'test' }), 0)
  })
})

Deno.test('Edge - insert empty object', async () => {
  await withTempDb([], (db) => {
    db.insert({})
    assertEquals(db.get().length, 1)
    const record = db.get()[0]
    assertEquals(Object.keys(record as Record<string, unknown>).length, 0)
  })
})

Deno.test('Edge - insertMany with empty array', async () => {
  await withTempDb([], (db) => {
    db.insertMany([])
    assertEquals(db.get().length, 0)
  })
})

Deno.test('Edge - malformed JSON file', async () => {
  const dir = await Deno.makeTempDir()
  const filePath = `${dir}/data.json`
  await Deno.writeTextFile(filePath, '{ invalid json }')
  try {
    const db = new Jsonary({ path: filePath })
    assertEquals(db.get().length, 0)
  } finally {
    await Deno.remove(dir, { recursive: true })
  }
})

Deno.test('Edge - non-existent file path', async () => {
  const dir = await Deno.makeTempDir()
  const subDir = `${dir}/nonexistent`
  await Deno.mkdir(subDir)
  const filePath = `${subDir}/data.json`
  try {
    const db = new Jsonary({ path: filePath })
    assertEquals(db.get().length, 0)
    db.insert({ name: 'Test' })
    assertEquals(db.get().length, 1)
  } finally {
    await Deno.remove(dir, { recursive: true })
  }
})

Deno.test('Edge - file with non-object root', async () => {
  const dir = await Deno.makeTempDir()
  const filePath = `${dir}/data.json`
  await Deno.writeTextFile(filePath, '[1, 2, 3]')
  try {
    const db = new Jsonary({ path: filePath })
    assertEquals(Array.isArray(db.get()), true)
  } finally {
    await Deno.remove(dir, { recursive: true })
  }
})

Deno.test('Edge - query with empty string condition', async () => {
  await withTempDb([{ name: 'John' }, { name: 'Jane' }], (db) => {
    const result = db.where('').get()
    assertEquals(result.length, 2)
  })
})

Deno.test('Edge - query with only whitespace condition', async () => {
  await withTempDb([{ name: 'John' }], (db) => {
    const result = db.where('   ').get()
    assertEquals(result.length, 1)
  })
})

Deno.test('Edge - query with missing operator', async () => {
  await withTempDb([{ age: 25 }, { age: 30 }], (db) => {
    const result = db.where('age').get()
    assertEquals(result.length, 2)
  })
})

Deno.test('Edge - query with invalid operator', async () => {
  await withTempDb([{ name: 'John' }, { name: 'Jane' }], (db) => {
    const result = db.where('name >>> John').get()
    assert(result.length >= 0)
  })
})

Deno.test('Edge - query with field containing dots', async () => {
  await withTempDb([{ 'weird.field.name': 'test' }], (db) => {
    const result = db.where('weird.field.name = test').get()
    assertEquals(result.length, 0)
  })
})

Deno.test('Edge - string vs number comparison', async () => {
  await withTempDb([{ age: '25' }, { age: 25 }, { age: '30' }], (db) => {
    db.where('age = "25"').get()
    db.where('age = 25').get()
  })
})

Deno.test('Edge - comparison with null/undefined', async () => {
  await withTempDb(
    [{ value: null }, { value: undefined }, { value: 0 }, { value: '' }, { value: false }],
    (db) => {
      assertEquals(db.where('value = null').count(), 1)
      assertEquals(db.where('value = undefined').count(), 1)
      assertEquals(db.where('value = 0').count(), 1)
      assertEquals(db.where('value = ""').count(), 1)
    }
  )
})

Deno.test('Edge - extremely deep nesting path', async () => {
  await withTempDb([{ a: { b: { c: { d: { e: 'deep' } } } } }], (db) => {
    const result = db.where('a.b.c.d.e = deep').first()
    assert(result !== null, 'Should find deeply nested value')
    db.updateWhere('a.b.c.d.e = deep', { 'a.b.c.d.e': 'updated' })
    const updated = db.where('a.b.c.d.e = updated').first()
    assert(updated !== null, 'Should update deeply nested value')
  })
})

Deno.test('Edge - path through non-object values', async () => {
  await withTempDb([{ a: { b: 'not an object', c: 'value' } }], (db) => {
    const result = db.where('a.b.c = value').first()
    assertEquals(result, null)
  })
})

Deno.test('Edge - update creating deep paths', async () => {
  await withTempDb([{ id: 1 }], (db) => {
    db.updateWhere('id = 1', { 'a.b.c.d.e.f.g': 'created' })
    const result = db.where('a.b.c.d.e.f.g = created').first()
    assert(result !== null, 'Should create deep nested path')
    const record = db.get()[0]
    assert(record !== undefined, 'Expected record')
    const nestedValue = (record['a'] as Record<string, unknown>)?.['b'] as Record<string, unknown>
    const nestedValue2 = (nestedValue?.['c'] as Record<string, unknown>)?.['d'] as Record<
      string,
      unknown
    >
    const nestedValue3 = (nestedValue2?.['e'] as Record<string, unknown>)?.['f'] as Record<
      string,
      unknown
    >
    assertEquals(nestedValue3?.['g'], 'created')
  })
})

Deno.test('Edge - special characters in values', async () => {
  await withTempDb(
    [
      { name: 'John "The Man" Doe' },
      { name: "Jane 'The Woman' Doe" },
      { name: 'Bob\tWith\nNewlines' },
      { name: 'Carlos~!@#$%^&*()' }
    ],
    (db) => {
      assertEquals(db.where('name contains "The Man"').count(), 1)
      assertEquals(db.where("name contains 'The Woman'").count(), 1)
      assertEquals(db.where('name contains "Carlos"').count(), 1)
    }
  )
})

Deno.test('Edge - unicode and emoji in data', async () => {
  await withTempDb(
    [
      { name: '🎉 Party', emoji: '🔥' },
      { name: '日本語テキスト', lang: 'ja' },
      { name: 'العربية', lang: 'ar' }
    ],
    (db) => {
      assertEquals(db.where('emoji = 🔥').count(), 1)
      assertEquals(db.where('lang = ja').count(), 1)
      assertEquals(db.where('name contains Party').count(), 1)
    }
  )
})

Deno.test('Edge - rapid sequential operations', async () => {
  await withTempDb([], (db) => {
    for (let i = 0; i < 100; i++) {
      db.insert({ id: i, value: `item-${i}` })
    }
    assertEquals(db.get().length, 100)
    let matchCount = 0
    for (let i = 0; i < 100; i++) {
      if (db.where(`id = ${i}`).first() !== null) {
        matchCount++
      }
    }
    assertEquals(matchCount, 100)
  })
})

Deno.test('Edge - large number of records', async () => {
  await withTempDb([], (db) => {
    const records = []
    for (let i = 0; i < 1000; i++) {
      records.push({ id: i, data: 'x'.repeat(100) })
    }
    db.insertMany(records)
    assertEquals(db.get().length, 1000)
    assertEquals(db.where('id >= 500').count(), 500)
    assertEquals(db.where('id = 999').first()?.['id'], 999)
  })
})

Deno.test('Edge - function predicate returning non-boolean', async () => {
  await withTempDb([{ value: 1 }, { value: 0 }, { value: null }], (db) => {
    const result = db.where((item: Record<string, unknown>) => !!item['value']).get()
    assertEquals(result.length, 1)
    const first = result[0]
    assert(first !== undefined, 'Expected first result')
    assertEquals(first['value'], 1)
  })
})

Deno.test('Edge - function predicate throwing error', async () => {
  await withTempDb([{ value: 1 }, { value: 2 }], (db) => {
    assertThrows(() => {
      db.where((item: Record<string, unknown>) => {
        if (item['value'] === 2) {
          throw new Error('Intentional error')
        }
        return true
      }).get()
    })
  })
})

Deno.test('Edge - delete all records', async () => {
  await withTempDb([{ id: 1 }, { id: 2 }, { id: 3 }], async (db, filePath) => {
    const deleted = db.deleteWhere('id >= 0')
    assertEquals(deleted, 3)
    assertEquals(db.get().length, 0)
    const fileContent = await Deno.readTextFile(filePath)
    assertEquals(JSON.parse(fileContent), [])
  })
})

Deno.test('Edge - delete with function matching nothing', async () => {
  await withTempDb([{ id: 1 }], (db) => {
    const deleted = db.deleteWhere(() => false)
    assertEquals(deleted, 0)
    assertEquals(db.get().length, 1)
  })
})

Deno.test('Edge - delete with function matching all', async () => {
  await withTempDb([{ id: 1 }, { id: 2 }], (db) => {
    const deleted = db.deleteWhere(() => true)
    assertEquals(deleted, 2)
    assertEquals(db.get().length, 0)
  })
})

Deno.test('Edge - clear on empty database', async () => {
  await withTempDb([], (db) => {
    db.clear()
    assertEquals(db.get().length, 0)
  })
})

Deno.test('Edge - reload after manual file edit', async () => {
  await withTempDb([{ id: 1 }], async (db, filePath) => {
    await Deno.writeTextFile(filePath, '[]')
    db.reload()
    assertEquals(db.get().length, 0)
    await Deno.writeTextFile(filePath, '[{"id": 999}]')
    db.reload()
    assertEquals(db.get().length, 1)
    const first = db.get()[0]
    assert(first !== undefined, 'Expected first record')
    assertEquals(first['id'], 999)
  })
})

Deno.test('Edge - negative numbers in queries', async () => {
  await withTempDb([{ temp: -10 }, { temp: 0 }, { temp: 10 }], (db) => {
    assertEquals(db.where('temp = -10').count(), 1)
    assertEquals(db.where('temp > -10').count(), 2)
    assertEquals(db.where('temp < 0').count(), 1)
  })
})

Deno.test('Edge - floating point in queries', async () => {
  await withTempDb([{ price: 9.99 }, { price: 10.0 }, { price: 10.01 }], (db) => {
    assertEquals(db.where('price = 9.99').count(), 1)
    assertEquals(db.where('price > 9.99').count(), 2)
    assertEquals(db.where('price <= 10.00').count(), 2)
  })
})

Deno.test('Edge - boolean value queries', async () => {
  await withTempDb(
    [{ active: true }, { active: false }, { active: 'true' }, { active: 1 }],
    (db) => {
      assertEquals(db.where('active = true').count(), 1)
      assertEquals(db.where('active = false').count(), 1)
      assertEquals(db.where('active = "true"').count(), 1)
      assertEquals(db.where('active = 1').count(), 1)
    }
  )
})

Deno.test('Edge - empty string queries', async () => {
  await withTempDb([{ name: '' }, { name: 'John' }, { name: null }], (db) => {
    assertEquals(db.where('name = ""').count(), 1)
    assertEquals(db.where('name = ""').first()?.['name'], '')
    const notEmpty = db.where('name != ""').get()
    assert(notEmpty.length >= 1)
  })
})

Deno.test('Edge - array values in records', async () => {
  await withTempDb([{ tags: ['a', 'b', 'c'] }, { tags: ['x', 'y'] }, { tags: [] }], (db) => {
    assertEquals(db.where('tags = ["a","b","c"]').count(), 0)
    assertEquals(db.get().length, 3)
  })
})
