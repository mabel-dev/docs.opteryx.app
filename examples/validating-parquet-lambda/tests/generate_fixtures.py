"""
generate_fixtures.py — (re)build tests/fixtures/*.parquet.

Run this after changing contract.py so the fixtures stay in sync with it:

    python tests/generate_fixtures.py

Requires `rugo` (installs `draken` alongside it — both come from
`pip install rugo`).
"""

import os

from draken.draken_native import DrakenType
from draken.interop.vector_sequence import vector_from_sequence
from draken.morsels.morsel import Morsel
from rugo.parquet import write_parquet

OUT = os.path.join(os.path.dirname(__file__), "fixtures")


def write(name, columns, vectors):
    morsel = Morsel.from_vectors([c.encode() for c in columns], vectors)
    data = write_parquet(morsel)
    with open(os.path.join(OUT, name), "wb") as f:
        f.write(data)
    print(f"{name}: {len(data)} bytes")


def main():
    os.makedirs(OUT, exist_ok=True)

    # A file that satisfies the contract in contract.py end to end.
    write(
        "valid.parquet",
        ["customer_id", "event_timestamp", "age", "status"],
        [
            vector_from_sequence([1, 2, 3, 4, 5], DrakenType.INT64),
            vector_from_sequence(
                [1752000000, 1752000100, 1752000200, 1752000300, 1752000400],
                DrakenType.INT64,
            ),
            vector_from_sequence([25, 40, 17, 88, 120], DrakenType.INT64),
            vector_from_sequence(
                ["NEW", "ACTIVE", "ACTIVE", "SUSPENDED", "CLOSED"], DrakenType.VARCHAR
            ),
        ],
    )

    # Drops event_timestamp entirely.
    write(
        "missing_column.parquet",
        ["customer_id", "age", "status"],
        [
            vector_from_sequence([1, 2, 3], DrakenType.INT64),
            vector_from_sequence([25, 40, 17], DrakenType.INT64),
            vector_from_sequence(["NEW", "ACTIVE", "ACTIVE"], DrakenType.VARCHAR),
        ],
    )

    # customer_id written as float64 instead of int64.
    write(
        "wrong_type.parquet",
        ["customer_id", "event_timestamp", "age", "status"],
        [
            vector_from_sequence([1.0, 2.0, 3.0], DrakenType.FLOAT64),
            vector_from_sequence([1752000000, 1752000100, 1752000200], DrakenType.INT64),
            vector_from_sequence([25, 40, 17], DrakenType.INT64),
            vector_from_sequence(["NEW", "ACTIVE", "ACTIVE"], DrakenType.VARCHAR),
        ],
    )

    # status has a value outside the enum.
    write(
        "bad_status.parquet",
        ["customer_id", "event_timestamp", "age", "status"],
        [
            vector_from_sequence([1, 2, 3], DrakenType.INT64),
            vector_from_sequence([1752000000, 1752000100, 1752000200], DrakenType.INT64),
            vector_from_sequence([25, 40, 17], DrakenType.INT64),
            vector_from_sequence(["NEW", "ACTIVE", "PENDING"], DrakenType.VARCHAR),
        ],
    )

    # age has a value outside [0, 120].
    write(
        "bad_age.parquet",
        ["customer_id", "event_timestamp", "age", "status"],
        [
            vector_from_sequence([1, 2, 3], DrakenType.INT64),
            vector_from_sequence([1752000000, 1752000100, 1752000200], DrakenType.INT64),
            vector_from_sequence([25, 40, 150], DrakenType.INT64),
            vector_from_sequence(["NEW", "ACTIVE", "ACTIVE"], DrakenType.VARCHAR),
        ],
    )

    # customer_id contains a null despite being in contract.NOT_NULL.
    write(
        "null_customer_id.parquet",
        ["customer_id", "event_timestamp", "age", "status"],
        [
            vector_from_sequence([1, None, 3], DrakenType.INT64),
            vector_from_sequence([1752000000, 1752000100, 1752000200], DrakenType.INT64),
            vector_from_sequence([25, 40, 17], DrakenType.INT64),
            vector_from_sequence(["NEW", "ACTIVE", "ACTIVE"], DrakenType.VARCHAR),
        ],
    )

    # Zero rows.
    write(
        "empty.parquet",
        ["customer_id", "event_timestamp", "age", "status"],
        [
            vector_from_sequence([], DrakenType.INT64),
            vector_from_sequence([], DrakenType.INT64),
            vector_from_sequence([], DrakenType.INT64),
            vector_from_sequence([], DrakenType.VARCHAR),
        ],
    )


if __name__ == "__main__":
    main()
