"""A small Streamlit dashboard over a Parquet dataset, queried with Opteryx Core.

Run with:  streamlit run app.py
"""

import os
import urllib.request

import opteryx
import pyarrow
import streamlit as st
from opteryx.connectors import DiskConnector

DATA_URL = "https://raw.githubusercontent.com/mabel-dev/opteryx-core/main/testdata/missions/space_missions.parquet"
DATA_FILE = "data/missions/space_missions.parquet"


@st.cache_resource
def setup():
    """Runs once per server process: fetch the sample data and register the workspace."""
    if not os.path.exists(DATA_FILE):
        os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
        urllib.request.urlretrieve(DATA_URL, DATA_FILE)
    opteryx.register_workspace("data", DiskConnector)


@st.cache_data(ttl=600)
def query(sql, params=None):
    """Run a query and return the result as a pandas DataFrame, cached by SQL and parameters."""
    setup()
    morsels = opteryx.session().execute_to_morsels(sql, params)
    return pyarrow.concat_tables(morsel.to_arrow() for morsel in morsels).to_pandas()


st.set_page_config(page_title="Space missions", layout="wide")
st.title("Space missions")
st.caption("4,630 orbital launch attempts since 1957, queried with Opteryx Core.")

# --- filters -----------------------------------------------------------------

top_companies = query("""
    SELECT Company, COUNT(*) AS launches
      FROM data.missions
     GROUP BY Company
     ORDER BY launches DESC
     LIMIT 20
""")["Company"].tolist()

with st.sidebar:
    companies = st.multiselect("Companies", top_companies, default=top_companies[:5])
    first_year, last_year = st.slider("Years", 1957, 2022, (1990, 2022))

if not companies:
    st.info("Pick at least one company.")
    st.stop()

# Values from widgets go in as parameters, never pasted into the SQL string.
placeholders = ", ".join("?" for _ in companies)
filters = f"""
      FROM data.missions
     WHERE Company IN ({placeholders})
       AND EXTRACT(year FROM Lauched_at) BETWEEN ? AND ?
"""
params = [*companies, first_year, last_year]

# --- headline numbers ----------------------------------------------------------

totals = query(
    f"""
    SELECT COUNT(*)                                                   AS launches,
           SUM(CASE WHEN Mission_Status = 'Success' THEN 1 ELSE 0 END) AS successes
    {filters}
    """,
    params,
).iloc[0]

left, right = st.columns(2)
left.metric("Launches", f"{totals.launches:,}")
right.metric("Success rate", f"{totals.successes / totals.launches:.1%}" if totals.launches else "–")

# --- charts --------------------------------------------------------------------

per_year = query(
    f"""
    SELECT EXTRACT(year FROM Lauched_at) AS year, Company, COUNT(*) AS launches
    {filters}
     GROUP BY year, Company
     ORDER BY year
    """,
    params,
)
st.subheader("Launches per year")
st.bar_chart(per_year, x="year", y="launches", color="Company")

by_company = query(
    f"""
    SELECT Company,
           COUNT(*)                                                   AS launches,
           SUM(CASE WHEN Mission_Status = 'Success' THEN 1 ELSE 0 END) AS successes,
           MIN(Lauched_at)                                            AS first_launch,
           MAX(Lauched_at)                                            AS last_launch
    {filters}
     GROUP BY Company
     ORDER BY launches DESC
    """,
    params,
)
by_company["success_rate"] = by_company["successes"] / by_company["launches"]
st.subheader("By company")
st.dataframe(
    by_company,
    hide_index=True,
    column_config={"success_rate": st.column_config.ProgressColumn("Success rate", format="percent")},
)

# --- free-form SQL -------------------------------------------------------------

with st.expander("Run your own SQL"):
    sql = st.text_area("Query", "SELECT Rocket, COUNT(*) AS launches\n  FROM data.missions\n GROUP BY Rocket\n ORDER BY launches DESC\n LIMIT 10")
    if st.button("Run"):
        try:
            st.dataframe(query(sql), hide_index=True)
        except Exception as err:
            st.error(err)
