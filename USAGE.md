# Usage

Querying, updating, and deleting records for `@neabyte/jsonary`.

## Table of Contents

- [Quick Start](#quick-start)
- [Query Operators](#query-operators)
- [Nested Fields (Dot Paths)](#nested-fields-dot-paths)
- [CRUD API](#crud-api)
- [Query Builder API](#query-builder-api)
  - [Chaining `where()`](#chaining-where)
- [Notes and Limits](#notes-and-limits)

## Quick Start

```typescript
// Import Jsonary
import Jsonary from '@neabyte/jsonary'

// Create database instance
const db = new Jsonary({ path: './data.json' })

// Insert records
db.insert({ name: 'John', age: 30, profile: { role: 'user', active: false } })
db.insert({ name: 'Jane', age: 25, profile: { role: 'admin', active: true } })

// Query with dot-path nested field
const admins = db.where('profile.role = admin').get()

// Get first match
const firstAdult = db.where('age >= 18').first()

// Count matching records
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
// Comparison operators
db.where('age >= 18').get()
db.where('name != John').get()

// String matching operators
db.where('name contains "oh"').get()
db.where('name startsWith J').get()
db.where('name endsWith "e"').get()
```

> [!NOTE]
> String values can be written without quotes (`name = John`) or with quotes (`name = "John"` or `name = 'John'`).

## Nested Fields (Dot Paths)

You can query nested properties using dot paths:

```typescript
// Query nested object properties
db.where('profile.role = admin').get()
db.where('profile.settings.theme = dark').get()
```

You can also update nested properties using dot paths:

```typescript
// Update nested properties via dot-path
db.updateWhere('name = John', { 'profile.active': true })

// Works with query builder too
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
// Insert single record
db.insert({ name: 'John', age: 30 })
```

### `db.insertMany(items)`

Insert multiple records.

```typescript
// Insert multiple records at once
db.insertMany([{ name: 'Jane' }, { name: 'Bob' }])
```

### `db.get()`

Return all records (copy).

```typescript
// Get all records (returns a copy)
const all = db.get()
```

### `db.updateWhere(condition, data)`

Update records matching condition. Returns number of updated records.

```typescript
// Update records where age is greater than 30
const updated = db.updateWhere('age > 30', { status: 'senior' })

// Update records where age is greater than 30 using a function predicate
const updatedFn = db.updateWhere(item => (item.age as number) > 30, { status: 'senior' })
```

### `db.deleteWhere(condition)`

Delete records matching condition. Returns number of deleted records.

```typescript
// Delete by string condition
const deleted = db.deleteWhere('age < 18')

// Delete by function predicate
const deletedFn = db.deleteWhere(item => (item.age as number) < 18)
```

### `db.clear()`

Clear all records (writes empty array to file).

```typescript
// Remove all records
// Note: Also persists empty array to file
db.clear()
```

### `db.reload()`

Reload internal data from file.

```typescript
// Reload data from file
// Useful when file is modified externally
db.reload()
```

## Query Builder API

### `db.where(condition)`

Create a query builder. `condition` can be a string condition or a predicate function.

```typescript
// Query with string condition
const qb = db.where('age >= 18')

// Query with function predicate
const qbFn = db.where(item => (item.age as number) >= 18)
```

### Chaining `where()`

You can chain multiple `where()` calls to refine your query:

```typescript
// Chain multiple where conditions (AND logic)
db.where('age >= 18').where('profile.active = true').get()

// Mix string conditions with function predicates
db.where('age >= 18')
  .where(item => (item.name as string).startsWith('J'))
  .first()

// Chaining works with all query builder methods
db.where('age >= 18').where('profile.role = admin').count()
```

### `where(...).get()`

Get all matching records (copy).

```typescript
// Get all matching records
const adults = db.where('age >= 18').get()
```

### `where(...).first()`

Get the first matching record or `null`.

```typescript
// Get first match or null if none found
const first = db.where('profile.role = admin').first()
```

### `where(...).count()`

Count matching records.

```typescript
// Count matching records
const count = db.where('profile.active = true').count()
```

### `where(...).update(data)`

Update all matching records (writes through to the database file when called from `db.where(...)`).

```typescript
// Update all matching records
db.where('profile.role = admin').update({ level: 'staff' })

// Update nested properties
db.where('profile.role = admin').update({ 'profile.verified': true })
```

### `where(...).delete()`

Delete all matching records (writes through to the database file when called from `db.where(...)`).

```typescript
// Delete all matching records
const deleted = db.where('age < 18').delete()
```

## Notes and Limits

- **Synchronous I/O**: Reads and writes use synchronous filesystem calls, this is simple but can block on large files.
- **No file locking**: Concurrent writes (multiple processes) can race, avoid shared writers or add your own locking.
- **Type safety**: Records are stored as `Record<string, unknown>`, you may want to validate shape at the edges.
