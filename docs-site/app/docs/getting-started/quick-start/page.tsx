import DocRenderer from '@/app/components/DocRenderer'

export default function Page(){
  const source = `
# Quick Start

This guide will help you get started with Opteryx quickly.

## Your First Query

Here's a simple example to get you started with Opteryx:

\`\`\`python
import opteryx

# Execute a simple query
result = opteryx.query("SELECT 'Hello, Opteryx!' AS greeting")

# Display the results
for row in result:
    print(row)
\`\`\`

## Working with Data

### Querying In-Memory Data

You can query data from Python data structures:

\`\`\`python
import opteryx

# Create sample data
data = [
    {"name": "Alice", "age": 30},
    {"name": "Bob", "age": 25},
    {"name": "Charlie", "age": 35}
]

# Query the data
result = opteryx.query("""
    SELECT name, age 
    FROM $data 
    WHERE age > 25
""", variables={"data": data})

# Print results
for row in result:
    print(f"{row['name']} is {row['age']} years old")
\`\`\`

## Basic SQL Operations

### SELECT Queries

\`\`\`python
import opteryx

# Simple SELECT
result = opteryx.query("SELECT 1 AS number, 'test' AS text")
\`\`\`

### Filtering Data

\`\`\`python
import opteryx

# Using WHERE clause
result = opteryx.query("""
    SELECT * 
    FROM my_data 
    WHERE column_name = 'value'
""")
\`\`\`

## Next Steps

Now that you've learned the basics, you can:

- Explore more complex SQL queries
- Learn about connecting to different data sources
- Check out advanced features and optimizations

## Need Help?

If you encounter any issues, please visit our [GitHub repository](https://github.com/mabel-dev/opteryx) or check the documentation for more detailed information.
`
  return <DocRenderer source={source} />
}
