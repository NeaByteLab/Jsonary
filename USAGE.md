# Usage

Querying, updating, and deleting records for `@neabyte/jsonary`.

## Table of Contents

- [Quick Start](#quick-start)
- [Query Operators](#query-operators)
- [Nested Fields (Dot Paths)](#nested-fields-dot-paths)
- [CRUD API](#crud-api)
- [Query Builder API](#query-builder-api)
- [Notes and Limits](#notes-and-limits)

## Quick Start

```typescript
import Jsonary from '@neabyte/jsonary'

const db = new Jsonary({ path: './data.json' })

db.insert({ name: 'John', age: 30, profile: { role: 'user', active: false } })
db.insert({ name: 'Jane', age: 25, profile: { role: 'admin', active: true } })

const admins = db.where('profile.role = admin').get()
const firstAdult = db.where('age >= 18').first()
const countActive = db.where('profile.active = true').count()
```

## Query Operators

Supported operators in string conditions:

- `=` - Equal
- `!=` - Not equal
- `>` - Greater than (numbers only)
- `<` - Less than (numbers only)
- `>=` - Greater than or equal (numbers only)
- `<=` - Less than or equal (numbers only)
- `contains` - String contains
- `startsWith` - String starts with
- `endsWith` - String ends with

Examples:

```typescript
db.where('age >= 18').get()
db.where('name != John').get()
db.where('name contains "oh"').get()
db.where('name startsWith J').get()
db.where('name endsWith "e"').get()
```

> [!NOTE]
> String values can be written without quotes (`name = John`) or with quotes (`name = "John"` or `name = 'John'`).

## Nested Fields (Dot Paths)

You can query nested properties using dot paths:

```typescript
db.where('profile.role = admin').get()
db.where('profile.settings.theme = dark').get()
```

You can also update nested properties using dot paths:

```typescript
db.updateWhere('name = John', { 'profile.active': true })
db.where('profile.role = admin').update({ 'profile.verified': true })
```

## CRUD API

### `new Jsonary({ path })`

Creates a database instance and loads data from the file (if it exists).

```typescript
const db = new Jsonary({ path: './data.json' })
```

### `db.insert(item)`

Insert one record.

```typescript
db.insert({ name: 'John', age: 30 })
```

### `db.insertMany(items)`

Insert multiple records.

```typescript
db.insertMany([{ name: 'Jane' }, { name: 'Bob' }])
```

### `db.get()`

Return all records (copy).

```typescript
const all = db.get()
```

### `db.updateWhere(condition, data)`

Update records matching condition. Returns number of updated records.

```typescript
const updated = db.updateWhere('age > 30', { status: 'senior' })
```

### `db.deleteWhere(condition)`

Delete records matching condition. Returns number of deleted records.

```typescript
const deleted = db.deleteWhere('age < 18')
```

### `db.clear()`

Clear all records (writes empty array to file).

```typescript
db.clear()
```

### `db.reload()`

Reload internal data from file.

```typescript
db.reload()
```

## Query Builder API

### `db.where(condition)`

Create a query builder. `condition` can be a string condition or a predicate function.

```typescript
const qb = db.where('age >= 18')
const qbFn = db.where(item => (item.age as number) >= 18)
```

### `where(...).get()`

Get all matching records (copy).

```typescript
const adults = db.where('age >= 18').get()
```

### `where(...).first()`

Get the first matching record or `null`.

```typescript
const first = db.where('profile.role = admin').first()
```

### `where(...).count()`

Count matching records.

```typescript
const count = db.where('profile.active = true').count()
```

### `where(...).update(data)`

Update all matching records (writes through to the database file when called from `db.where(...)`).

```typescript
db.where('profile.role = admin').update({ level: 'staff' })
db.where('profile.role = admin').update({ 'profile.verified': true })
```

### `where(...).delete()`

Delete all matching records (writes through to the database file when called from `db.where(...)`).

```typescript
const deleted = db.where('age < 18').delete()
```

## Notes and Limits

- **Synchronous I/O**: Reads and writes use synchronous filesystem calls, this is simple but can block on large files.
- **No file locking**: Concurrent writes (multiple processes) can race, avoid shared writers or add your own locking.
- **Type safety**: Records are stored as `Record<string, unknown>`, you may want to validate shape at the edges.
