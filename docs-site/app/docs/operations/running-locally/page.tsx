import DocRenderer from '@/app/components/DocRenderer'

export default function Page(){
  const source = `
# Running Locally

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

## Local Setup

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

### System Requirements

#### Hardware Requirements

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.

- Lorem ipsum: 4+ cores recommended
- Dolor sit amet: 8GB RAM minimum, 16GB+ recommended
- Consectetur adipiscing: 10GB free disk space

#### Software Prerequisites

Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.

- Python 3.8 or higher
- pip package manager
- Lorem ipsum dolor sit amet

### Installation

\`\`\`bash
# Lorem ipsum installation
pip install opteryx

# Sed do eiusmod verification
python -c "import opteryx; print(opteryx.__version__)"
\`\`\`

Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.

## Configuration

### Environment Variables

Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur.

\`\`\`bash
# Lorem ipsum environment setup
export OPTERYX_HOME=/path/to/opteryx
export OPTERYX_LOG_LEVEL=INFO
export OPTERYX_CACHE_DIR=/tmp/opteryx-cache
\`\`\`

### Configuration Files

Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur.

\`\`\`python
# Sed do eiusmod configuration
import opteryx

opteryx.configure({
    'max_memory': '8GB',
    'worker_threads': 4,
    'cache_enabled': True
})
\`\`\`

### Connection Settings

At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.

## Running Queries

### Interactive Mode

Similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio.

\`\`\`python
# Lorem ipsum interactive query
import opteryx

# Sed do eiusmod simple query
result = opteryx.query("SELECT * FROM dataset")
for row in result:
    print(row)
\`\`\`

### Batch Mode

Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus.

\`\`\`python
# Lorem ipsum batch processing
import opteryx

queries = [
    "SELECT COUNT(*) FROM users",
    "SELECT AVG(age) FROM users",
    "SELECT * FROM orders WHERE status = 'completed'"
]

for query in queries:
    result = opteryx.query(query)
    # Sed do eiusmod process result
\`\`\`

### Programmatic Access

Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae.

## Performance Tuning

### Memory Management

Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.

\`\`\`python
# Lorem ipsum memory tuning
opteryx.configure({
    'max_memory': '16GB',
    'spill_to_disk': True,
    'spill_directory': '/tmp/opteryx-spill'
})
\`\`\`

### Thread Configuration

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.

### Cache Settings

Nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.

## Data Management

### Local Data Sources

Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error.

#### File-Based Data

\`\`\`python
# Lorem ipsum file access
result = opteryx.query("""
    SELECT * 
    FROM 'data/local/dataset.parquet'
    WHERE date > '2024-01-01'
""")
\`\`\`

#### In-Memory Data

Sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.

### Data Caching

Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.

## Monitoring

### Logging

Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt.

\`\`\`python
# Lorem ipsum logging setup
import logging
import opteryx

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('opteryx')
\`\`\`

### Metrics Collection

Ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam.

### Performance Profiling

Nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur.

## Troubleshooting

### Common Issues

#### Memory Errors

Vel illum qui dolorem eum fugiat quo voluptas nulla pariatur. At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum.

#### Connection Problems

Deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi.

#### Performance Issues

Id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio.

### Debug Mode

\`\`\`python
# Lorem ipsum debug mode
opteryx.configure({
    'debug': True,
    'log_level': 'DEBUG',
    'profile': True
})
\`\`\`

Cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus.

## Best Practices

1. Lorem ipsum dolor sit amet, consectetur adipiscing elit
2. Sed do eiusmod tempor incididunt ut labore et dolore magna
3. Aliqua ut enim ad minim veniam quis nostrud exercitation
4. Ullamco laboris nisi ut aliquip ex ea commodo consequat
5. Duis aute irure dolor in reprehenderit in voluptate velit

## Development Environment

### IDE Setup

Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae.

### Testing Locally

Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.

### Hot Reload

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
`
  return <DocRenderer source={source} />
}
