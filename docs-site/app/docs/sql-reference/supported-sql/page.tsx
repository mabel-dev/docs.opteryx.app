import DocRenderer from '@/app/components/DocRenderer'

export default function Page(){
  const source = `
# Supported SQL

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

## SQL Standards Compliance

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

### SQL-92 Features

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.

### SQL-99 Extensions

Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet.

### Modern SQL Features

Consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam.

## SELECT Statements

### Basic SELECT

\`\`\`sql
-- Lorem ipsum basic SELECT
SELECT column1, column2, column3
FROM table_name
WHERE condition = true;
\`\`\`

Nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur.

### DISTINCT

\`\`\`sql
-- Sed do eiusmod DISTINCT
SELECT DISTINCT category, status
FROM products;
\`\`\`

### SELECT with Expressions

Vel illum qui dolorem eum fugiat quo voluptas nulla pariatur. At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti.

## Filtering and Conditions

### WHERE Clause

\`\`\`sql
-- Lorem ipsum WHERE clause
SELECT *
FROM orders
WHERE order_date >= '2024-01-01'
  AND status IN ('pending', 'processing')
  AND amount > 100;
\`\`\`

### HAVING Clause

Quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.

### Pattern Matching

\`\`\`sql
-- Sed do eiusmod pattern matching
SELECT name, email
FROM users
WHERE email LIKE '%@example.com'
   OR name LIKE 'John%';
\`\`\`

## Joins

### INNER JOIN

Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus.

\`\`\`sql
-- Lorem ipsum INNER JOIN
SELECT a.*, b.name
FROM orders a
INNER JOIN customers b ON a.customer_id = b.id;
\`\`\`

### LEFT/RIGHT JOIN

Omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint.

### FULL OUTER JOIN

Et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.

### CROSS JOIN

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

## Aggregations

### GROUP BY

\`\`\`sql
-- Sed do eiusmod GROUP BY
SELECT 
    category,
    COUNT(*) as total_count,
    SUM(amount) as total_amount,
    AVG(amount) as average_amount
FROM transactions
GROUP BY category;
\`\`\`

### Window Functions

Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse.

\`\`\`sql
-- Lorem ipsum window function
SELECT 
    name,
    department,
    salary,
    ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) as rank
FROM employees;
\`\`\`

## Subqueries

### Scalar Subqueries

Cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

### Correlated Subqueries

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae.

### EXISTS/NOT EXISTS

Dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.

## Set Operations

### UNION

\`\`\`sql
-- Lorem ipsum UNION
SELECT id, name FROM customers
UNION
SELECT id, name FROM suppliers;
\`\`\`

### INTERSECT

Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.

### EXCEPT

Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur.

## Common Table Expressions (CTEs)

\`\`\`sql
-- Sed do eiusmod CTE
WITH monthly_sales AS (
    SELECT 
        DATE_TRUNC('month', order_date) as month,
        SUM(amount) as total
    FROM orders
    GROUP BY 1
)
SELECT * FROM monthly_sales
WHERE total > 10000;
\`\`\`

Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur.

## Data Modification

### INSERT

At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.

### UPDATE

Similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio.

### DELETE

Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est.

## Advanced Features

### Pivot Operations

Omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae.

### Array Operations

Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.

### JSON Operations

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
`
  return <DocRenderer source={source} />
}
