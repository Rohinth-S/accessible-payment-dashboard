# Data model

The Payment record keeps identity, merchant, customer, amount, currency, lifecycle status, timestamp, and risk score explicit. Keeping this boundary typed makes the UI and tests agree on one stable contract.

## Verification

This decision is represented in the current source, tests, or deployment configuration and should remain part of code review.

