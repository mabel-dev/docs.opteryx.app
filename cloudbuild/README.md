Cloud Build config for Opteryx docs-site

This folder contains a Cloud Build pipeline that builds the Docker image for the Next.js docs site located in `docs-site/` and deploys it to Cloud Run.

Usage:

1. Create a Cloud Build trigger in the Google Cloud Console and point it at `cloudbuild/cloudbuild.yaml` in this repository (or use the root `cloudbuild.yaml` if you prefer).
2. Ensure Cloud Build, Cloud Run, and Container Registry (or Artifact Registry) APIs are enabled.
3. Provide any desired substitution values when creating the trigger (for example `_IMAGE_NAME`, `_SERVICE_NAME`, `_REGION`).

Example manual submission:

```bash
gcloud builds submit --config cloudbuild/cloudbuild.yaml --substitutions=_IMAGE_NAME=opteryx-docs,_SERVICE_NAME=opteryx-docs,_REGION=us-central1 .
```

Notes:
- This config builds the image from `docs-site/` (the step sets `dir: 'docs-site'`).
- The runtime Dockerfile used by the build is `docs-site/Dockerfile`.
