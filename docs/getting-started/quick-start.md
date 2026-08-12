# Quick Start

This guide will help you get started with Opteryx quickly.

## Your First Query

Here's a simple example to get you started with Opteryx:

```python
import opteryx

# Execute a simple query
result = opteryx.query("SELECT 'Hello, Opteryx!' AS greeting")

# Display the results
for row in result:
    print(row)
```

## Working with Data

### Querying In-Memory Data

You can query data from Python data structures:

```python
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
```

## Basic SQL Operations

### SELECT Queries

```python
import opteryx

# Simple SELECT
result = opteryx.query("SELECT 1 AS number, 'test' AS text")
```

### Filtering Data

```python
import opteryx

# Using WHERE clause with built-in $planets table
result = opteryx.query("""
    SELECT * 
    FROM $planets 
    WHERE name = 'Mars'
""")
```

## Next Steps

Now that you've learned the basics, you can:

- Explore more complex SQL queries
- Learn about reading from different file formats
- Check out advanced features and optimizations

## Working with Files

Opteryx supports reading data from various file formats using built-in functions:

```python
import opteryx

# Read from a CSV file
result = opteryx.query("SELECT * FROM READ_CSV('path/to/file.csv')")

# Read from a Parquet file
result = opteryx.query("SELECT * FROM READ_PARQUET('path/to/file.parquet')")

# Read from a JSON file
result = opteryx.query("SELECT * FROM READ_JSON('path/to/file.json')")
```

These functions allow you to query data directly from files without loading them into memory first.

## Need Help?

If you encounter any issues, please visit our [GitHub repository](https://github.com/mabel-dev/opteryx) or check the documentation for more detailed information.
