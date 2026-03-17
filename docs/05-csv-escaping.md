# CSV escaping

Cells containing commas, quotes, or newlines are quoted and embedded quotes are doubled. This protects exports from malformed rows and spreadsheet parsing surprises.

## Verification

This decision is represented in the current source, tests, or deployment configuration and should remain part of code review.

