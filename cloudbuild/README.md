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
- The build context is the repository root and the Dockerfile is `./Dockerfile`; it needs the root context because the site build reads `content/blog/`, which lives outside `docs-site/`.
- The site is a static export (`output: 'export'` in `docs-site/next.config.mjs`), so the runtime image is nginx serving `docs-site/out` — there is no Node server. Serving rules live in `cloudbuild/nginx.conf` and mirror `firebase.json`.
- Cloud Run is the live front door. Firebase Hosting (`make deploy-firebase`) serves the same export and is where the site is headed, but that migration has not happened — both paths are expected to work, so a change to how pages are served (clean URLs, cache headers, redirects) belongs in `cloudbuild/nginx.conf` **and** `firebase.json`.
