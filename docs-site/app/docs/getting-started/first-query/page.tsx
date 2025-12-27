import DocRenderer from '../../../components/DocRenderer'

export default function Page(){
  const source = `
# First Query

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

## Getting Started

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

### Basic Query Syntax

\`\`\`python
# Lorem ipsum example code
import opteryx

# Sed do eiusmod tempor incididunt
result = opteryx.query("SELECT * FROM dataset")
\`\`\`

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.

## Simple SELECT Statements

### Basic Selection

Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet.

\`\`\`sql
-- Lorem ipsum SQL example
SELECT column1, column2, column3
FROM table_name
WHERE condition = true;
\`\`\`

### Filtering Results

Consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam.

\`\`\`sql
-- Sed do eiusmod tempor
SELECT *
FROM users
WHERE age > 25 AND status = 'active';
\`\`\`

## Working with Results

### Iterating Through Data

Nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur.

\`\`\`python
# Lorem ipsum iteration example
for row in result:
    print(row)
\`\`\`

### Converting to DataFrames

At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.

\`\`\`python
# Temporibus autem quibusdam
import pandas as pd
df = result.to_pandas()
\`\`\`

## Common Query Patterns

### Aggregations

Similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit.

\`\`\`sql
-- Lorem ipsum aggregation
SELECT 
    category,
    COUNT(*) as count,
    AVG(value) as average
FROM data
GROUP BY category;
\`\`\`

### Joins

Quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint.

\`\`\`sql
-- Sed do eiusmod join example
SELECT a.*, b.name
FROM table_a a
INNER JOIN table_b b ON a.id = b.ref_id;
\`\`\`

## Best Practices

1. Lorem ipsum dolor sit amet, consectetur adipiscing elit
2. Sed do eiusmod tempor incididunt ut labore et dolore
3. Magna aliqua ut enim ad minim veniam
4. Quis nostrud exercitation ullamco laboris nisi
5. Ut aliquip ex ea commodo consequat duis aute

## Next Steps

Irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
`
  return <DocRenderer source={source} />
}
