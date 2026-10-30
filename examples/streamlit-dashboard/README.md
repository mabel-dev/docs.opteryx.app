# A Streamlit Dashboard with Opteryx Core

A single-file Streamlit app that queries a Parquet dataset with SQL, using
Opteryx Core in the same process as the app. It charts 4,630 orbital launch
attempts, filters them with sidebar widgets, and has a box for running your
own SQL.

Written to accompany [Building a Streamlit App with Opteryx](https://docs.opteryx.app/docs/guides/streamlit).

## Run it

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
streamlit run app.py
```

On first run the app downloads `space_missions.parquet` (about 90 KB) into
`./data/missions/`. No account or credentials are needed.

## Point it at your own data

Put your Parquet files in a folder under `./data/` — `./data/orders/` is
queried as `data.orders` — and replace the queries in `app.py`. The two
helpers at the top, `setup()` and `query()`, don't need to change.
