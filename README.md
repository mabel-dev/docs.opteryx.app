# docs.opteryx.app

Official documentation site for Opteryx, built with MkDocs and the Material theme.

## Overview

This repository contains the documentation for Opteryx, a powerful SQL query engine.

## Local Development

### Prerequisites

- Python 3.8 or higher
- pip

### Setup

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Start the development server:
   ```bash
   mkdocs serve
   ```

3. Open your browser and navigate to `http://127.0.0.1:8000`

## Building the Site

To build the static site:

```bash
mkdocs build
```

The built site will be in the `site/` directory.

## Deployment

The site is automatically deployed to GitHub Pages when changes are pushed to the main branch via GitHub Actions.

You can also manually deploy using:

```bash
mkdocs gh-deploy
```

## Project Structure

```
.
├── docs/                  # Documentation source files
│   ├── index.md          # Home page
│   ├── about.md          # About page
│   └── getting-started/  # Getting started guides
├── mkdocs.yml            # MkDocs configuration
├── requirements.txt      # Python dependencies
└── .github/workflows/    # GitHub Actions workflows
```

## Contributing

To contribute to the documentation:

1. Fork the repository
2. Create a new branch for your changes
3. Make your changes to the markdown files in `docs/`
4. Test locally with `mkdocs serve`
5. Submit a pull request

## License

See the main [Opteryx repository](https://github.com/mabel-dev/opteryx) for license information.
