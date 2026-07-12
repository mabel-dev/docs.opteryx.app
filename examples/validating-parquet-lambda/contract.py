"""
contract.py — the data contract this validator enforces.

Edit this file to match your own schema. Nothing else in the project needs
to change to add, remove, or loosen a check.
"""

# name -> expected Parquet physical type, as reported by
# rugo's ParquetMetadata.schema_columns[i].physical_type
SCHEMA = {
    "customer_id": "int64",
    "event_timestamp": "int64",
    "age": "int64",
    "status": "byte_array",
}

# Columns that must never be null. Checked with a single decoded pass over
# just these columns.
NOT_NULL = ["customer_id", "event_timestamp"]

# Inclusive numeric ranges, checked via predicate pushdown — rows outside
# the range are counted without ever being pulled into a Python list.
RANGES = {
    "age": (0, 120),
}

# Columns that must only contain one of a fixed set of values.
ENUMS = {
    "status": {"NEW", "ACTIVE", "SUSPENDED", "CLOSED"},
}
