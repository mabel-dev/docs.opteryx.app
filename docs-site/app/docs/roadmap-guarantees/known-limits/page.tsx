import DocRenderer from '../../../components/DocRenderer'

export default function Page(){
  const source = `
# Known Limits

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

## System Limits

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

### Memory Limits

#### Maximum Query Memory

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.

- Default: Lorem ipsum 4GB per query
- Configurable: Dolor sit amet up to system memory
- Spill to disk: Consectetur adipiscing when memory exceeded

#### Buffer Pool Size

Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.

### Concurrency Limits

#### Maximum Concurrent Queries

Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore.

- Default: Lorem ipsum 10 concurrent queries
- Configurable: Dolor sit amet based on resources
- Queue management: Consectetur adipiscing for excess queries

#### Thread Pool Size

Magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur.

## Data Size Limits

### Table Size

#### Maximum Rows per Table

Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur.

- Practical limit: Lorem ipsum billions of rows
- Performance: Dolor sit amet optimal under 100M rows per partition
- Recommendation: Consectetur adipiscing use partitioning for larger datasets

#### Maximum Columns per Table

At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati.

- Hard limit: 10,000 columns
- Recommended: Under 1,000 columns for optimal performance

### File Size Limits

#### Single File Size

Cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio.

- Minimum: No practical minimum
- Maximum: Lorem ipsum limited by storage system
- Optimal: Dolor sit amet 128MB to 1GB per file

#### Partition Size

Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus.

### String and Binary Limits

#### Maximum String Length

Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae.

- Default: Lorem ipsum 1MB per string
- Configurable: Dolor sit amet up to 100MB
- Recommendation: Consectetur adipiscing use external storage for large strings

#### Maximum Binary Size

Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.

## Query Limits

### Query Complexity

#### Maximum Join Operations

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.

- Practical limit: 32 tables in a single query
- Performance: Best with under 10 joins
- Recommendation: Break complex queries into CTEs

#### Maximum Subquery Depth

Ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.

- Hard limit: Lorem ipsum 10 levels of nesting
- Recommended: Dolor sit amet 3-4 levels maximum

#### Maximum Expression Depth

Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem.

- Parser limit: 100 nested expressions
- Practical: Keep expressions simple for readability

### Query Size

#### Maximum Query Length

Accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.

- Character limit: Lorem ipsum 1MB query text
- Practical: Dolor sit amet keep queries under 10KB

#### Maximum Parameters

Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.

- Prepared statements: 1,000 parameters
- Query variables: 100 variables

## Aggregation Limits

### GROUP BY Limits

#### Maximum Group By Columns

Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam.

- Hard limit: Lorem ipsum 100 columns
- Practical: Dolor sit amet 20 columns for performance

#### Maximum Distinct Groups

Aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur.

- Memory-dependent: Lorem ipsum millions of groups possible
- Performance: Dolor sit amet best under 10M distinct groups

### Window Function Limits

#### Maximum Window Partitions

Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur.

- Practical: Lorem ipsum hundreds of millions
- Performance: Dolor sit amet depends on partition size

## Network Limits

### Connection Limits

#### Maximum Concurrent Connections

At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate.

- Default: 100 connections
- Configurable: Up to 10,000 connections

#### Request Size Limits

Non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio.

- HTTP request: Lorem ipsum 10MB
- gRPC message: Dolor sit amet 4MB default

### Transfer Limits

#### Maximum Result Set Size

Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est.

- Streaming: Lorem ipsum unlimited
- Buffered: Dolor sit amet 100MB default
- Recommendation: Consectetur adipiscing use streaming for large results

## Storage Limits

### Local Storage

#### Cache Size Limits

Omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae.

- Default: 10GB cache
- Maximum: Limited by disk space
- Management: LRU eviction policy

#### Temporary Storage

Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.

- Spill directory: Lorem ipsum system-dependent
- Cleanup: Dolor sit amet automatic on query completion

### Remote Storage

#### S3 Object Limits

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco.

- Maximum object size: 5TB (AWS limit)
- Maximum objects per query: Unlimited
- Request rate: Subject to AWS throttling

## Metadata Limits

### Schema Limits

#### Maximum Tables

Laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.

- Catalog: Lorem ipsum 100,000 tables
- Performance: Dolor sit amet best under 10,000 tables

#### Maximum Indexes

Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error.

- Per table: 64 indexes
- Recommended: 5-10 indexes per table

### Statistics Limits

#### Histogram Buckets

Sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.

- Default: Lorem ipsum 256 buckets
- Maximum: Dolor sit amet 1,024 buckets

## Function Limits

### User-Defined Functions

#### Maximum UDF Size

Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.

- Code size: 1MB per function
- Number of UDFs: 1,000 per session

### Aggregate Functions

#### Maximum Aggregation State

Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam.

- Per group: Lorem ipsum 10MB
- Total: Dolor sit amet memory-dependent

## Performance Considerations

### Scalability Limits

Quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur.

- Vertical: Lorem ipsum up to 1TB RAM tested
- Horizontal: Dolor sit amet distributed execution available
- Data size: Consectetur adipiscing petabyte-scale supported

### Known Performance Bottlenecks

Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur.

1. Lorem ipsum - Highly skewed data distributions
2. Dolor sit amet - Extremely wide tables (1000+ columns)
3. Consectetur adipiscing - Very deep query nesting
4. Sed do eiusmod - Large string operations

## Workarounds

### Exceeding Limits

At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati.

- **Partitioning**: Cupiditate non provident split large datasets
- **Streaming**: Similique sunt process data in batches
- **External storage**: In culpa use for large objects
- **Query optimization**: Qui officia break complex queries

## Future Improvements

Deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio.

Many of these limits will be increased or removed in future versions. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
`
  return <DocRenderer source={source} />
}
