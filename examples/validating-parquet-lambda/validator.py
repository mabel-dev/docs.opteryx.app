"""
validator.py — the actual Parquet validation logic, independent of Lambda/S3.

Kept separate from lambda_function.py so it can be unit tested against local
files with no AWS involved at all — see tests/test_validator.py.
"""

from dataclasses import dataclass, field
from typing import List

from rugo import parquet

import contract


@dataclass
class ValidationResult:
    accepted: bool
    reasons: List[str] = field(default_factory=list)

    def reject(self, reason: str) -> None:
        self.accepted = False
        self.reasons.append(reason)


def validate(path: str) -> ValidationResult:
    """Run every check against a local Parquet file and return the verdict.

    Cheapest checks run first so a malformed file is rejected before any
    column data is decoded at all.
    """
    result = ValidationResult(accepted=True)

    meta = parquet.read_metadata(path)
    actual = {col.name: col.physical_type for col in meta.schema_columns}

    _check_schema(actual, result)
    if not result.accepted:
        # Schema is wrong — column-level checks below would be meaningless.
        return result

    _check_file(meta, result)
    if meta.num_rows == 0:
        # An empty projected morsel carries no columns to check against —
        # zero rows is already a rejection reason on its own.
        return result

    _check_not_null(path, result)
    _check_ranges(path, result)
    _check_enums(path, result)

    return result


def _check_schema(actual: dict, result: ValidationResult) -> None:
    expected = contract.SCHEMA
    missing = expected.keys() - actual.keys()
    unexpected = actual.keys() - expected.keys()
    mismatched = {
        name: (expected[name], actual[name])
        for name in expected.keys() & actual.keys()
        if expected[name] != actual[name]
    }

    if missing:
        result.reject(f"missing required column(s): {sorted(missing)}")
    if unexpected:
        result.reject(f"unexpected column(s): {sorted(unexpected)}")
    for name, (want, got) in mismatched.items():
        result.reject(f"column {name!r} has type {got!r}, expected {want!r}")


def _check_file(meta, result: ValidationResult) -> None:
    if meta.num_rows == 0:
        result.reject("file has zero rows")


def _check_not_null(path: str, result: ValidationResult) -> None:
    if not contract.NOT_NULL:
        return
    with parquet.read_parquet(path, columns=contract.NOT_NULL) as reader:
        for morsel in reader:
            for name in contract.NOT_NULL:
                values = morsel.column(name).to_pylist()
                if any(v is None for v in values):
                    result.reject(f"column {name!r} contains null values")


def _check_ranges(path: str, result: ValidationResult) -> None:
    for name, (lo, hi) in contract.RANGES.items():
        with parquet.read_parquet(
            path, columns=[name], predicates=[(name, "<", lo)]
        ) as reader:
            below = sum(len(m) for m in reader)
        with parquet.read_parquet(
            path, columns=[name], predicates=[(name, ">", hi)]
        ) as reader:
            above = sum(len(m) for m in reader)

        if below or above:
            result.reject(
                f"column {name!r} has {below + above} row(s) outside [{lo}, {hi}]"
            )


def _check_enums(path: str, result: ValidationResult) -> None:
    for name, allowed in contract.ENUMS.items():
        with parquet.read_parquet(path, columns=[name]) as reader:
            for morsel in reader:
                values = morsel.column(name).to_pylist()
                bad = {v for v in values if v not in allowed}
                if bad:
                    result.reject(f"column {name!r} has unrecognised value(s): {sorted(bad)}")
