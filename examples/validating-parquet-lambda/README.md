# Validating Parquet Files in S3 with AWS Lambda

A small, self-contained example: an S3-triggered Lambda function that
validates every Parquet file on upload — schema, then data, then file-level
checks — using [Rugo](https://rugo.dev) to read only the footer and the
columns the check actually needs. Invalid files are copied to a quarantine
bucket and removed from the incoming one; an SNS notification carries the
reasons.

Written to accompany [this blog post](https://opteryx.app/blog/2026-07-11-validating-parquet-in-lambda).

## Layout

```
contract.py              the data contract — edit this to match your schema
validator.py             validation logic, no AWS dependency, unit tested
lambda_function.py       S3 event handler: download, validate, quarantine
template.yaml            AWS SAM template — bucket, quarantine bucket, SNS topic, function
requirements.txt         runtime dependency (rugo)
requirements-dev.txt     + boto3, pytest for local development
tests/
  fixtures/*.parquet     valid + invalid files covering every check
  generate_fixtures.py   regenerates the fixtures above from contract.py
  test_validator.py      tests validator.py against the fixtures
  test_lambda_function.py tests the handler with boto3 mocked out
```

## Run it locally, no AWS required

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt
pytest tests/ -v
```

This validates `validator.py` and `lambda_function.py` entirely against the
committed fixtures — nothing here needs an AWS account.

To try the validator against your own file:

```python
from validator import validate

result = validate("path/to/file.parquet")
print(result.accepted, result.reasons)
```

## Adjust the contract

Everything the validator checks lives in [`contract.py`](contract.py):

```python
SCHEMA = {"customer_id": "int64", "event_timestamp": "int64", ...}
NOT_NULL = ["customer_id", "event_timestamp"]
RANGES = {"age": (0, 120)}
ENUMS = {"status": {"NEW", "ACTIVE", "SUSPENDED", "CLOSED"}}
```

`validator.py` doesn't change when the contract does. After editing it, run
`python tests/generate_fixtures.py` to rebuild the test fixtures against the
new contract, then `pytest tests/ -v`.

## Deploy

This ships as an [AWS SAM](https://docs.aws.amazon.com/serverless-application-model/)
template. It creates two S3 buckets (incoming, quarantine), an SNS topic for
rejection alerts, and the Lambda function wired to the incoming bucket's
`ObjectCreated` events for `*.parquet` keys.

```bash
sam build --use-container   # rugo ships native extensions — build inside
                             # a Lambda-like container so the wheel matches
                             # the Lambda runtime, not your local machine
sam deploy --guided
```

`--guided` walks through stack name, region, and confirms the IAM changes
before creating anything. Subsequent deploys can drop `--guided` once a
`samconfig.toml` exists.

After deploy, the stack outputs the incoming bucket name, the quarantine
bucket name, and the SNS topic ARN. Upload a `.parquet` file to the incoming
bucket and check CloudWatch Logs for the function — accepted files are left
in place, rejected ones are moved to quarantine and a notification is
published.

```bash
aws s3 cp my-file.parquet s3://<incoming-bucket-name>/
```

To receive the rejection notifications somewhere, subscribe an email address
or a Slack/Chatbot integration to the `ValidationFailedTopic` output ARN.

## Tear down

```bash
sam delete
```

This deletes the stack, including both S3 buckets — empty them first if they
have contents SAM won't delete non-empty buckets automatically:

```bash
aws s3 rm s3://<incoming-bucket-name> --recursive
aws s3 rm s3://<quarantine-bucket-name> --recursive
sam delete
```

## Notes

- The standalone `rugo` package (what `pip install rugo` gives you) is
  **local-filesystem only** — that's why the handler downloads the S3
  object to `/tmp` before calling `validate()`, rather than reading `s3://`
  paths directly.
- `sam build --use-container` matters here specifically because Rugo ships
  compiled native extensions. Building on a Mac or a non-Lambda Linux distro
  and deploying that wheel directly can produce a binary Lambda's runtime
  can't load.
