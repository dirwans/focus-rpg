---
name: deployment_rules
description: Rules and checks regarding project deployment pipelines, minimum edit constraints, and tracking modification deployment status.
---

# Deployment Verification Rules & Constraints

Use this skill to guide the verification and tracking of edits before running the deployment script.

## Core Rules
1. **Minimum Edit Constraint**: Before running `deploy.ps1`, you must have completed **at least 5 separate modifications** in the codebase.
2. **Modification Tracking**: Every modification must be recorded in the development journal (`development_journal.md`).
3. **Deployment Status Labeling**: Each modification in the journal must be explicitly labeled with its status:
   - `[PENDING DEPLOYMENT]` (if the changes are made locally but not yet synced to production).
   - `[DEPLOYED]` (once the changes have been pushed and synced via `deploy.ps1`).
