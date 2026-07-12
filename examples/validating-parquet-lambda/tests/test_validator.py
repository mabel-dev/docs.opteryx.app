"""
Run with: pytest tests/test_validator.py -v

These tests exercise validator.py directly against the fixtures in
tests/fixtures/ — no AWS involved. Regenerate fixtures with
tests/generate_fixtures.py if you change contract.py.
"""

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import pytest

import validator

FIXTURES = os.path.join(os.path.dirname(__file__), "fixtures")


def fixture(name):
    return os.path.join(FIXTURES, name)


def test_valid_file_is_accepted():
    result = validator.validate(fixture("valid.parquet"))
    assert result.accepted
    assert result.reasons == []


def test_missing_column_is_rejected():
    result = validator.validate(fixture("missing_column.parquet"))
    assert not result.accepted
    assert any("missing required column" in r for r in result.reasons)


def test_wrong_type_is_rejected():
    result = validator.validate(fixture("wrong_type.parquet"))
    assert not result.accepted
    assert any("has type" in r for r in result.reasons)


def test_null_in_not_null_column_is_rejected():
    result = validator.validate(fixture("null_customer_id.parquet"))
    assert not result.accepted
    assert any("null" in r for r in result.reasons)


def test_out_of_range_value_is_rejected():
    result = validator.validate(fixture("bad_age.parquet"))
    assert not result.accepted
    assert any("outside" in r for r in result.reasons)


def test_unrecognised_enum_value_is_rejected():
    result = validator.validate(fixture("bad_status.parquet"))
    assert not result.accepted
    assert any("unrecognised value" in r for r in result.reasons)


def test_empty_file_is_rejected():
    result = validator.validate(fixture("empty.parquet"))
    assert not result.accepted
    assert any("zero rows" in r for r in result.reasons)


@pytest.mark.parametrize(
    "name",
    [
        "missing_column.parquet",
        "wrong_type.parquet",
        "null_customer_id.parquet",
        "bad_age.parquet",
        "bad_status.parquet",
        "empty.parquet",
    ],
)
def test_invalid_fixtures_always_give_a_reason(name):
    result = validator.validate(fixture(name))
    assert not result.accepted
    assert len(result.reasons) >= 1
