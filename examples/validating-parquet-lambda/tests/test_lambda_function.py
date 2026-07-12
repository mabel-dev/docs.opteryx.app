"""
Run with: pytest tests/test_lambda_function.py -v

Exercises the S3 event handler with boto3 mocked out — no AWS credentials
or network access needed. Validates that the handler wires validator.py's
verdict into the right S3/SNS calls.
"""

import os
import shutil
import sys
from unittest import mock

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

FIXTURES = os.path.join(os.path.dirname(__file__), "fixtures")


def _s3_event(bucket="incoming-bucket", key="data/valid.parquet"):
    return {
        "Records": [
            {"s3": {"bucket": {"name": bucket}, "object": {"key": key}}}
        ]
    }


def _make_download_file(local_name):
    """Return a fake s3.download_file that copies a local fixture instead of
    reaching out to AWS."""

    def _download_file(bucket, key, local_path):
        shutil.copyfile(os.path.join(FIXTURES, local_name), local_path)

    return _download_file


@mock.patch.dict(os.environ, {"QUARANTINE_BUCKET": "quarantine-bucket", "SNS_TOPIC_ARN": "arn:aws:sns:us-east-1:123456789012:topic"})
@mock.patch("boto3.client")
def test_valid_file_is_accepted_and_not_quarantined(mock_client):
    s3_mock, sns_mock = mock.Mock(), mock.Mock()
    mock_client.side_effect = lambda name, **kw: {"s3": s3_mock, "sns": sns_mock}[name]

    import lambda_function
    lambda_function.s3 = s3_mock
    lambda_function.sns = sns_mock
    lambda_function.QUARANTINE_BUCKET = "quarantine-bucket"
    s3_mock.download_file.side_effect = _make_download_file("valid.parquet")

    response = lambda_function.handler(_s3_event(), None)

    assert response["results"][0]["accepted"] is True
    s3_mock.copy_object.assert_not_called()
    s3_mock.delete_object.assert_not_called()
    sns_mock.publish.assert_not_called()


@mock.patch.dict(os.environ, {"QUARANTINE_BUCKET": "quarantine-bucket", "SNS_TOPIC_ARN": "arn:aws:sns:us-east-1:123456789012:topic"})
@mock.patch("boto3.client")
def test_invalid_file_is_quarantined_and_notified(mock_client):
    s3_mock, sns_mock = mock.Mock(), mock.Mock()
    mock_client.side_effect = lambda name, **kw: {"s3": s3_mock, "sns": sns_mock}[name]

    import lambda_function
    lambda_function.s3 = s3_mock
    lambda_function.sns = sns_mock
    lambda_function.QUARANTINE_BUCKET = "quarantine-bucket"
    lambda_function.SNS_TOPIC_ARN = "arn:aws:sns:us-east-1:123456789012:topic"
    s3_mock.download_file.side_effect = _make_download_file("bad_status.parquet")

    response = lambda_function.handler(_s3_event(key="data/bad_status.parquet"), None)

    result = response["results"][0]
    assert result["accepted"] is False
    assert any("unrecognised value" in r for r in result["reasons"])

    s3_mock.copy_object.assert_called_once()
    s3_mock.delete_object.assert_called_once_with(
        Bucket="incoming-bucket", Key="data/bad_status.parquet"
    )
    sns_mock.publish.assert_called_once()
