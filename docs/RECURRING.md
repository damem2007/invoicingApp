# Recurring invoices

Recurring schedules are stored in SQLite with append-only price history. Existing invoices are immutable; changing a schedule price affects only future runs.

Run due schedules manually:

```bash
npm run recurring:run
```

The runner is idempotent through the `(schedule_id, issue_date)` unique index and catches up missed runs in order. The API equivalent is:

```http
POST /api/recurring/run
```
