"""
lambda_function.py — S3-triggered handler that validates a Parquet file on
upload and either lets it through or quarantines it.

All the actual validation logic lives in validator.py, which has no AWS
dependency and is unit tested on its own — this file is just the S3/Lambda
plumbing around it: download the object, call validate(), act on the result.

Environment variables (set in template.yaml):
    QUARANTINE_BUCKET   bucket rejected files are copied into
    SNS_TOPIC_ARN       optional — if set, a notification is published on
                         every rejection
"""

import os
import urllib.parse

import boto3

import validator

s3 = boto3.client("s3")
sns = boto3.client("sns")

QUARANTINE_BUCKET = os.environ.get("QUARANTINE_BUCKET")
SNS_TOPIC_ARN = os.environ.get("SNS_TOPIC_ARN")


def handler(event, context):
    results = []

    for record in event.get("Records", []):
        bucket = record["s3"]["bucket"]["name"]
        key = urllib.parse.unquote_plus(record["s3"]["object"]["key"])

        result = _validate_object(bucket, key)
        results.append(result)

        if result["accepted"]:
            print(f"ACCEPTED s3://{bucket}/{key}")
        else:
            print(f"REJECTED s3://{bucket}/{key}: {result['reasons']}")
            _quarantine(bucket, key, result["reasons"])

    return {"results": results}


def _validate_object(bucket: str, key: str) -> dict:
    local_path = f"/tmp/{os.path.basename(key)}"
    s3.download_file(bucket, key, local_path)

    try:
        result = validator.validate(local_path)
    finally:
        os.remove(local_path)

    return {
        "bucket": bucket,
        "key": key,
        "accepted": result.accepted,
        "reasons": result.reasons,
    }


def _quarantine(bucket: str, key: str, reasons: list) -> None:
    if QUARANTINE_BUCKET:
        s3.copy_object(
            Bucket=QUARANTINE_BUCKET,
            Key=key,
            CopySource={"Bucket": bucket, "Key": key},
        )
        s3.delete_object(Bucket=bucket, Key=key)

    if SNS_TOPIC_ARN:
        sns.publish(
            TopicArn=SNS_TOPIC_ARN,
            Subject=f"Parquet validation failed: {key}",
            Message=(
                f"s3://{bucket}/{key} failed validation and was "
                f"{'moved to s3://' + QUARANTINE_BUCKET + '/' + key if QUARANTINE_BUCKET else 'left in place'}.\n\n"
                "Reasons:\n" + "\n".join(f"- {r}" for r in reasons)
            ),
        )
