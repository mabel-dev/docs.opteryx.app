import DocRenderer from '@/app/components/DocRenderer'

export default function Page(){
  const source = `
# Reading Data

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.


### Sample Datasets

The public service exposes a collection of example datasets you can query immediately. Discover available EntitySets from the OData service document (`GET https://odata.opteryx.app/api/v4/`). Example public datasets include:

- `public.examples.planets` — small example table of planets (good for quick queries and demos).
- `public.examples.vulnerabilities` — vulnerabilities sample dataset.
- `public.github.events` — GitHub event stream samples (event-level rows).
- `public.imdb.titles`, `public.imdb.ratings`, `public.imdb.cast` — IMDb example tables.
- `public.nyc_taxi.<year>_yellow_taxi_trips` — NYC taxi trip tables by year (large, partitioned datasets; use filters when querying).
- `mitre.attack.*` — MITRE ATT&CK tables (attack_pattern, campaign, malware, tool, relationship).
- `opteryx.test.*` — test datasets (astronauts, planets, tweets, etc.) used for examples and benchmarking.
- `benchmarks.tpch.*` & `benchmarks.clickbench.hits` — benchmark datasets useful for performance testing.

To query a dataset via OData, use the dataset path from the service document, for example:

```
GET https://odata.opteryx.app/api/v4/public/examples/planets?$top=10
```

When you first explore large public datasets (for example the NYC taxi tables), prefer `$filter` and `$select` to limit returned rows and columns.

`
  return <DocRenderer source={source} />
}
