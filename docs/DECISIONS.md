# Decisions

- The existing Vite + React + Express + SQLite stack remains the implementation stack.
- Database schema creation and migrations remain separate; startup runs the versioned migration runner through `server/db/index.js`.
- Existing local data is preserved; no destructive reset or database replacement is used.
- The supplied prototype HTML is treated as the visual and interaction source of truth. Provider credentials and OAuth flows must remain server-side and must not be exposed to the browser.
