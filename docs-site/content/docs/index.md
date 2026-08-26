<section class="opteryx-hero">
	<div class="hero-inner" style="max-width:1100px;margin:0 auto;padding:0 16px;display:flex;gap:32px;align-items:center;">
		<div class="hero-copy" style="flex:1;">
			<h1 class="hero-title">Welcome to Opteryx Documentation</h1>
			<p class="hero-lead">Fast, lightweight SQL analytics for your data — run queries locally or in the cloud with minimal fuss.</p>
			<p><a class="md-button md-button--primary" href="/docs/getting-started/quick-start">Get started</a></p>
		</div>
		<div class="hero-art" style="flex:0 0 420px;text-align:right;">
			<img src="/docs/assets/images/hero-illustration.svg" alt="Opteryx illustration" style="max-width:420px;width:100%;height:auto;" loading="lazy">
		</div>
	</div>
</section>

<section class="featured" aria-labelledby="featured-resources" style="padding-top:28px;">
	<div style="max-width:1100px;margin:0 auto;padding:0 16px;">
		<h2 id="featured-resources">Featured resources</h2>
		<p style="color:#6b7280;margin-top:4px;margin-bottom:12px;">Dive into our top picks</p>
	</div>
	<div class="opteryx-card-grid">
		<article class="opteryx-card">
			<img src="/docs/assets/images/icon-getting-started.svg" class="icon" alt="Getting started icon">
			<h3 class="opteryx-card__title"><a href="/docs/getting-started/quick-start">Quick start</a></h3>
			<p class="opteryx-card__desc">Run your first query in minutes and explore Opteryx capabilities.</p>
		</article>
		<article class="opteryx-card">
			<img src="/docs/assets/images/icon-architecture.svg" class="icon" alt="Blog icon">
			<h3 class="opteryx-card__title"><a href="/blog">Blog</a></h3>
			<p class="opteryx-card__desc">Latest engineering updates, release notes, and how-tos from the Opteryx team.</p>
		</article>
		<article class="opteryx-card">
			<img src="/docs/assets/images/icon-security.svg" class="icon" alt="Releases icon">
			<h3 class="opteryx-card__title"><a href="/releases">Releases</a></h3>
			<p class="opteryx-card__desc">Release notes and changelogs for the website, APIs, and SQL engine.</p>
		</article>
	</div>
</section>

## What is Opteryx?

Opteryx is a SQL query engine designed for analyzing data across various sources with a focus on performance and ease of use.

## Key Features

- **SQL**: A broad SQL surface — see [SQL Conformance](/docs/reference/sql/conformance) for what is and isn't supported
- **Multiple Data Sources**: Parquet, JSONL and Skene datasets on local disk, Google Cloud Storage or HTTP(S)
- **High Performance**: A vectorised, native execution engine with predicate and projection pushdown
- **Two ways to run it**: embedded in your own Python process, or hosted at [opteryx.app](https://opteryx.app)

## Quick Links

- [What is Opteryx](introduction/what-is-opteryx) - the engine, and what it's built for
- [When to use Opteryx](introduction/when-to-use) - where it fits, and where it doesn't
- [Quick Start Tutorial](getting-started/quick-start) - Learn the basics in minutes
- [Installation Guide](getting-started/installation) - embed the engine in your own Python process
- [About Opteryx](about) - Learn more about the project

## Getting Help

If something isn't working, or you're stuck:

- [Raise a bug or ask a question](https://github.com/mabel-dev/opteryx.app/issues/new/choose) — issues for the Opteryx platform are tracked in the open at [mabel-dev/opteryx.app](https://github.com/mabel-dev/opteryx.app/issues)
- [Getting help](support/getting-help) - what to include in a ticket, and how to report a security issue
- [status.opteryx.app](https://status.opteryx.app) - check here first in case there is a live incident
- Bugs in the open source engine itself go to [mabel-dev/opteryx](https://github.com/mabel-dev/opteryx/issues)

## License

Opteryx is open source software. Please refer to the main repository for license information.
