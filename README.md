<div align="center">

# Jsonary

File-based JSON database for TypeScript, with a simple query builder.

[![Node](https://img.shields.io/badge/node-%3E%3D22-339933?logo=node.js&logoColor=white)](https://nodejs.org) [![Deno](https://img.shields.io/badge/deno-compatible-ffcb00?logo=deno&logoColor=000000)](https://deno.com) [![Bun](https://img.shields.io/badge/bun-compatible-f9f1e1?logo=bun&logoColor=000000)](https://bun.sh)

[![Module type: Deno/ESM](https://img.shields.io/badge/module%20type-deno%2Fesm-brightgreen)](https://github.com/NeaByteLab/Jsonary) [![npm version](https://img.shields.io/npm/v/@neabyte/jsonary.svg)](https://www.npmjs.org/package/@neabyte/jsonary) [![JSR](https://jsr.io/badges/@neabyte/jsonary)](https://jsr.io/@neabyte/jsonary) [![CI](https://github.com/NeaByteLab/Jsonary/actions/workflows/ci.yaml/badge.svg)](https://github.com/NeaByteLab/Jsonary/actions/workflows/ci.yaml) [![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

</div>

## Features

- **Simple file-backed storage** - One JSON file, no database server needed.
- **Everyday data work** - Insert, read, update, delete, clear, and reload.
- **Flexible filtering** - Chain filters, then read or modify matching.
- **Structured records** - Query and update nested object fields easily.

## Installation

> [!NOTE]
> **Prerequisites:** For **Deno** (install from [deno.com](https://deno.com/)). For **npm** use Node.js (e.g. [nodejs.org](https://nodejs.org/)).

**Deno (JSR):**

```bash
deno add jsr:@neabyte/jsonary
```

**npm:**

```bash
npm install @neabyte/jsonary
```

## Quick Start

Create a database instance and start inserting/querying objects.

```typescript
import Jsonary from '@neabyte/jsonary'

// Initialize database file (auto-created on first write)
const db = new Jsonary({ path: './data.json' })

// Insert one record
db.insert({ name: 'John', age: 30 })
// Insert many records
db.insertMany([
  { name: 'Jane', age: 25 },
  { name: 'Bob', age: 35 }
])

// Filter records with string condition
const adults = db.where('age >= 18').get()
// Get first matching record
const firstJohn = db.where('name = John').first()
```

- [USAGE.md](USAGE.md) for more examples and query operator details.

## Build

**npm build (bundles to `dist/`):**

```bash
npm run build
```

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for details.
