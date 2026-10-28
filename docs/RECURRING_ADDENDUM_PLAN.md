# Recurring Addendum Plan

## Prototype-to-code mapping

- `pastM` / `savePast` → past-invoice dialog and transactional past-invoice API.
- `mrM` / `saveRec` / `nextOn` → make-recurring dialog, price history, and schedule API.
- `service` / `svNext` / `svSave` → four-step recurring-service page and transaction API.
- `hdates` / `svFrom` → shared month-end-safe recurrence date helpers.
- `chgM` / `saveChg` → append-only schedule price-change API and modal.
- `runRec` → the same idempotent recurring generator used by `npm run recurring:run`.
- `tbl` Recurring tab → persisted schedules, pending price-change labels, and run/pause actions.
- Clients table → past-invoice and recurring-service entry points.

## Files

- `server/db/schema.js` — recurring, price-history, line-item, and payment tables.
- `server/db/migrations.js` — versioned, non-destructive migrations.
- `server/services/recurrence.js` — date stepping, price resolution, and idempotent generation.
- `server/routes/recurring.js` — schedule, past-invoice, price-change, and run routes.
- `server/index.js` — route registration only.
- `index.html` — prototype integration and persisted actions.
- `docs/RECURRING.md` — runner and operational instructions.

## Verification

- Preserve existing invoices and clients.
- Test date stepping, price history, idempotency, transaction rollback, and duplicate invoice numbers.
- Run the production build and database migration runner.
