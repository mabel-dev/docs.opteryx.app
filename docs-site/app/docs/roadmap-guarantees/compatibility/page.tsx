import DocRenderer from '@/app/components/DocRenderer'

export default function Page(){
  const source = `
# Compatibility

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

## Version Compatibility

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

### Python Version Support

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.

#### Currently Supported

- Python 3.8: Lorem ipsum dolor sit amet
- Python 3.9: Consectetur adipiscing elit
- Python 3.10: Sed do eiusmod tempor
- Python 3.11: Incididunt ut labore et dolore
- Python 3.12: Magna aliqua ut enim

#### Deprecated

Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.

- Python 3.7: End of support January 2024
- Python 3.6: End of support December 2021

### Operating System Compatibility

#### Linux

Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore.

- Ubuntu 20.04+ (Lorem ipsum)
- CentOS 7+ (Dolor sit amet)
- Debian 10+ (Consectetur adipiscing)
- RHEL 8+ (Sed do eiusmod)

#### macOS

Magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur.

- macOS 11 (Big Sur) and later
- Both Intel and Apple Silicon supported

#### Windows

Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur.

- Windows 10 and later
- Windows Server 2019 and later

## Database Compatibility

### SQL Dialects

At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate.

#### ANSI SQL

Non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio.

#### PostgreSQL Extensions

Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor.

#### MySQL Compatibility

Repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae.

## File Format Compatibility

### Supported Formats

#### Columnar Formats

Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.

- **Parquet**: Lorem ipsum dolor sit amet, versions 1.0+
- **ORC**: Consectetur adipiscing elit, versions 0.12+
- **Arrow IPC**: Sed do eiusmod tempor, versions 1.0+

#### Row Formats

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud.

- **CSV**: All standard variants
- **JSON**: JSON and NDJSON
- **Avro**: Versions 1.8+

### Format Features

Exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.

## Cloud Platform Compatibility

### AWS

Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error.

#### Services

- **S3**: Lorem ipsum dolor sit amet
- **EC2**: Consectetur adipiscing elit
- **Lambda**: Sed do eiusmod tempor
- **ECS/Fargate**: Incididunt ut labore
- **Athena**: Et dolore magna aliqua

### Google Cloud Platform

Sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.

#### Services

- **GCS**: Nemo enim ipsam voluptatem
- **Compute Engine**: Quia voluptas sit aspernatur
- **Cloud Functions**: Aut odit aut fugit
- **Cloud Run**: Sed quia consequuntur
- **BigQuery**: Magni dolores eos

### Microsoft Azure

Qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam.

#### Services

- **Blob Storage**: Eius modi tempora incidunt
- **Virtual Machines**: Ut labore et dolore
- **Azure Functions**: Magnam aliquam quaerat
- **Container Instances**: Voluptatem ut enim
- **Synapse**: Ad minima veniam

## Data Source Compatibility

### Object Storage

Quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate.

- Amazon S3 and S3-compatible storage
- Google Cloud Storage
- Azure Blob Storage
- MinIO

### Distributed File Systems

Velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur. At vero eos et accusamus et iusto odio dignissimos.

- HDFS (Hadoop Distributed File System)
- GlusterFS
- Ceph

## Library Compatibility

### Python Ecosystem

Ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa.

#### Data Processing

Qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis.

- **Pandas**: Lorem ipsum versions 1.0+
- **NumPy**: Dolor sit amet versions 1.19+
- **PyArrow**: Consectetur adipiscing versions 5.0+
- **Polars**: Sed do eiusmod versions 0.14+

#### Machine Learning

Est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus.

- **Scikit-learn**: Compatible for data preparation
- **TensorFlow**: Data pipeline integration
- **PyTorch**: Dataset compatibility

### Notebook Environments

Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae.

- Jupyter Notebook: Lorem ipsum
- JupyterLab: Dolor sit amet
- Google Colab: Consectetur adipiscing
- VS Code Notebooks: Sed do eiusmod

## API Compatibility

### REST API

Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.

### GraphQL API

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.

### gRPC Support

Ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.

## Container Compatibility

### Docker

Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit.

- Docker Engine: Versions 19.03+
- Docker Compose: Versions 1.27+

### Kubernetes

Voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.

- Kubernetes: Versions 1.20+
- OpenShift: Versions 4.6+

## Protocol Compatibility

### Network Protocols

Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.

- HTTP/1.1: Lorem ipsum
- HTTP/2: Dolor sit amet
- HTTP/3: Consectetur adipiscing (experimental)
- WebSocket: Sed do eiusmod

### Authentication Protocols

Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore.

- OAuth 2.0: Magnam aliquam
- OpenID Connect: Quaerat voluptatem
- SAML 2.0: Ut enim ad minima
- JWT: Veniam quis nostrum

## Testing Compatibility

### Testing Frameworks

Exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse.

- pytest: Lorem ipsum
- unittest: Dolor sit amet
- nose2: Consectetur adipiscing

## Migration Support

### Version Migration

Quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur. At vero eos et accusamus et iusto odio dignissimos ducimus.

### Data Migration

Qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa.

### Configuration Migration

Qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio.
`
  return <DocRenderer source={source} />
}
