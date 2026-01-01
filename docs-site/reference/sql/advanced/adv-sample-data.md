---
title: Sample Data in Opteryx - Built-in Test Datasets
description: Explore built-in sample datasets in Opteryx for testing and demonstration. Query planets, satellites, astronauts, and missions data.
---

# Sample Data

There are four built-in relations for demonstration and testing.

- `$satellites` (8 columns, 177 rows)   
- `$planets` (20 columns, 9 rows) **#plutoisaplanet**   
- `$astronauts` (19 columns,  357 rows)   
- `$missions` (8 columns,  4630 rows)   

!!! Note
    You can also create randomized data using [`FAKE` temporary tables](../adv-temp-tables/).

Satellites and Planets datasets acquired from [this source](https://github.com/devstronomy/nasa-data-scraper/tree/f610e541a053f05e26573570604aed50b358cc43/data/json).

Astronauts dataset acquired from [Kaggle](https://www.kaggle.com/nasa/astronaut-yearbook).

Space Mission dataset acquired from [Kaggle](https://www.kaggle.com/datasets/agirlcoding/all-space-missions-from-1957).

These relations are prefixed with a dollar sign (`$`) and can be accessed as per user datasets. For example:

~~~sql
SELECT *
  FROM $planets;
~~~

These datasets are used extensively for regression testing Opteryx, but may also be used for testing and demonstration. They are part of the query engine and are available to be queried on all operational instances of Opteryx. Although these datasets may represent data that may change over time, these datasets are fixed in content to provide a reliable and consistent dataset for testing.

Note however, that the `$planets` dataset is temporal and using the [Time Travel](../adv-time-travel/) feature of Opteryx will return different results based on the date provided.

!!! Note  
    Other internal datasets exist, these all have a first character of `$`. These are not intended for end-users and should not be used. Their name, purpose and structure is not guaranteed to remain consistent or intended to be useful outside the internal state of Opteryx.