# Jsonary [![](https://img.shields.io/npm/v/@neabyte/jsonary.svg)](https://www.npmjs.org/package/@neabyte/jsonary) [![JSR](https://jsr.io/badges/@neabyte/jsonary)](https://jsr.io/@neabyte/jsonary) [![Node.js CI](https://github.com/NeaByteLab/Jsonary/actions/workflows/ci.yaml/badge.svg)](https://github.com/NeaByteLab/Jsonary/actions/workflows/ci.yaml)

A lightweight TypeScript library for file-based JSON database operations with querying capabilities.

## 📦 Installation

```bash
# npm
npm install @neabyte/jsonary

# deno
deno add jsr:@neabyte/jsonary
```

## 🔧 Module Support

Jsonary supports both ESM and CommonJS:

### 📥 ESM (ES Modules)
```typescript
import Jsonary from '@neabyte/jsonary'
```

### 📦 CommonJS
```javascript
const Jsonary = require('@neabyte/jsonary')
```

---

## 🚀 Usage

### ⚙️ Basic Setup

```typescript
import Jsonary from '@neabyte/jsonary'

const db = new Jsonary({ path: './data.json' })
```

### ➕ Insert Data

```typescript
// Single record
db.insert({ name: 'John', age: 30 })

// Multiple records
db.insertMany([
  { name: 'Jane', age: 25 },
  { name: 'Bob', age: 35 }
])
```

### 🔍 Query Data

```typescript
// Get all records
const all = db.get()

// String-based conditions
const adults = db.where('age >= 18').get()
const john = db.where('name = John').first()

// Query nested properties
const admins = db.where('profile.role = admin').get()
const activeUsers = db.where('profile.active = true').get()
const darkThemeUsers = db.where('profile.settings.theme = dark').get()

// Function-based filtering
const filtered = db.where(item => item.age > 25).get()
```

### ✏️ Update Data

```typescript
// Update specific records
db.updateWhere('age > 30', { status: 'senior' })

// Update nested properties
db.updateWhere('name = John', { 'profile.active': true })
```

### 🗑️ Delete Data

```typescript
// Delete by condition
const deleted = db.deleteWhere('age < 18')

// Clear all data
db.clear()
```

### 🔗 Chained Operations

```typescript
db.where('age > 25')
  .where('name contains "John"')
  .update({ verified: true })

const count = db.where('status = active').count()

// Chained operations with nested properties
db.where('profile.active = true')
  .where('profile.role = admin')
  .update({ 'profile.verified': true })

const adminCount = db.where('profile.role = admin').where('profile.verified = true').count()
```

---

## 🔎 Query Operators

- `=` - Equal
- `!=` - Not equal
- `>` - Greater than
- `<` - Less than
- `>=` - Greater than or equal
- `<=` - Less than or equal
- `contains` - String contains
- `startsWith` - String starts with
- `endsWith` - String ends with

## 📚 API Reference

- `constructor(options: { path: string })` - Initialize database
- `insert(item: Record<string, unknown>)` - Insert single record
- `insertMany(items: Record<string, unknown>[])` - Insert multiple records
- `where(condition: string | Function)` - Create query builder
- `updateWhere(condition: string | Function, data: Record<string, unknown>)` - Update records (returns count)
- `deleteWhere(condition: string | Function)` - Delete records (returns count)
- `get()` - Get all records
- `reload()` - Reload data from file
- `clear()` - Clear all data

### Query Methods (via `where()`)
- `where().get()` - Get filtered records
- `where().first()` - Get first filtered record
- `where().count()` - Get count of filtered records
- `where().update(data)` - Update filtered records
- `where().delete()` - Delete filtered records (returns count)

---

## 📄 License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.
