# Incident playbook

If a deployed build regresses, compare the commit SHA, rerun the pure selector tests, and roll back the linked Vercel deployment. The deterministic fixture makes reproduction straightforward.

## Verification

This decision is represented in the current source, tests, or deployment configuration and should remain part of code review.

