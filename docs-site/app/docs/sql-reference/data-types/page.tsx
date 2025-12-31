```tsx
import DocRenderer from '@/app/components/DocRenderer'

export default function Page(){
  const source = `
---
title: SQL Data Types - Opteryx Reference Guide
description: Learn about SQL data types in Opteryx including VARCHAR, INTEGER, TIMESTAMP, ARRAY, and more. Understand type casting and coercion.
---

# Data Types

Opteryx supports a streamlined set of data types compared to full DBMS platforms, focusing on the types most commonly needed for analytical queries.

## Types

Name        | Description
----------- | --------------
`ARRAY`     | A list of items, all of the same type
`BOOLEAN`   | Logical boolean (True/False)
`VARBINARY` | Variable-length binary data (also `BLOB`)
`DOUBLE`    | Double-precision floating-point number
`INTEGER`   | Whole number (64-bit signed integer)
`DECIMAL` :octicons-star-16:  | Fixed-point number with specified precision and scale
`VARCHAR`   | Variable-length character string (text)
`DATE`      | Calendar date (year, month, day)
`TIME` :octicons-star-16: | Time of day (hour, minute, second)
import fs from 'fs'
import path from 'path'
import DocRenderer from '@/app/components/DocRenderer'

export default function Page(){
  const mdPath = path.join(process.cwd(), 'sql-reference', 'data-types.md')
  let source = fs.readFileSync(mdPath, 'utf8')
  source = source.replace(/^---\n[\s\S]*?\n---\n/, '')
  return <DocRenderer source={source} />
}
