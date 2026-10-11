# GlaceTech Reports: project memory for Claude

Read this first. It replaces the chat history from the previous machine. A sister project, **Anvira Reports**, lives next to this folder (`../anvira-reports`) and has its own `CLAUDE.md`. Cross-project context and the laptop migration checklist are in `../HANDOVER.md`.

## What this app is
GlaceTech (a refrigeration / HVAC service company in Thane) used paper forms. This app digitizes them so technicians fill them on their phones:
- **Service / Breakdown Report**: one form with a "Report Type" switch (`service` | `breakdown`).
- **Expense Statement Voucher**: rows of travel and material expenses, advance, net total.

Each form has an on-screen signature pad (`react-signature-canvas`). Saved records render as a printable A4 page (print / Save PDF) and can be shared on WhatsApp or by email (text summary).

Stack: Vite + React 18 + TypeScript (non-strict) + Tailwind + shadcn/ui, react-hook-form (report form), useState (voucher form), @tanstack/react-query, react-router v6, Supabase (Postgres only, no Supabase Auth), hosted on Netlify. Originally scaffolded with Lovable.

## Current features
- **PIN login** (`src/pages/LoginPage.tsx`): 4-digit PIN in 4 boxes, auto-submits. A login lasts **24 hours** on the device, then the PIN is asked again.
- **Roles:**
  - **Technician:** sees, edits and prints **only their own** reports and vouchers. The technician name (report) and Name (voucher) are auto-filled from the login and **read-only**.
  - **Admin:** sees, edits and prints **everyone's** records, and gets a "Technician" filter in the list. **Can never change the technician name** on a record. **Only admins can delete** (their own or anyone's), with a confirmation dialog. Deletes are permanent.
- **Saved list** (`/saved`), with filters kept in the URL:
  - client name (with a datalist of known clients)
  - Report No. / Voucher No.
  - type
  - from / to date
  - technician (admins only)

  "Back" from a record returns to the same filtered list (the last filters are kept in `sessionStorage`, key `LAST_LIST_KEY`).
- **View** `/saved/:id` (Edit, Print / Save PDF, WhatsApp, Email, Delete for admins) and **Edit** `/saved/:id/edit` (same form, pre-filled).
- **Drafts:** an unsaved new form autosaves to `sessionStorage`, keyed per employee, so another person on a shared phone never sees it.
- **Demo mode:** with no Supabase keys, `npm run dev` uses `src/lib/localBackend.ts` (browser storage, **demo PINs 1001–1012, 1099**; 1003 and 1099 are admins). Production builds exclude it: `import.meta.env.DEV` guards the dynamic import. Check with `grep` on `dist/` that `glacetech-demo-records` is absent.

## Security model (important; keep it this way)
The browser only has the public **anon** key, so **all rules are enforced in Postgres**, never just in the UI:
- Tables (`employees`, `sessions`, `login_attempts`, `records`) have RLS on, with **all privileges revoked from anon**. The app cannot read them directly.
- The app calls `SECURITY DEFINER` functions via `supabase.rpc(...)` with a session token:
  - `login(p_pin)`: returns JSON. **Errors are returned, not raised**, so the failed attempt is recorded. Limit: 5 wrong PINs per 15 minutes per IP (`cf-connecting-ip` / `x-forwarded-for`).
  - `whoami`, `logout`
  - `list_records`: technicians are filtered to their own rows.
  - `get_record`, `create_record`, `update_record`
  - `delete_record` (admins only)
  - `list_employees` (admins only)
- `_session_employee(token)` raises `SESSION_EXPIRED`. `create_record` / `update_record` force the technician name in `data` to the record owner (`_with_owner_name`). A voucher can't become a report or vice versa.
- PINs are stored only as **bcrypt** hashes (`pgcrypto` in the `extensions` schema). `add_employee` / `set_employee_pin` are **not** executable by anon; run them in the SQL Editor.
- Signatures are stored **inside `records.data`** as PNG data URLs, so they're protected by the same rules. There's no Storage bucket any more.
- Client error mapping is in `src/lib/records.ts → toError()`: `SESSION_EXPIRED` → `SessionExpiredError` (the user is sent back to the PIN screen by `useApi()` in `src/lib/auth.ts`); `NOT_FOUND`, `NOT_ALLOWED` → friendly text; "Could not find the function" → "run schema.sql".

## Employees and PINs
11 people. Codes and names come from the client's list:

| Codes | People |
|---|---|
| 010001, 010004–010008, 010010–010012 | Technicians |
| 010003, MALARVIZHI SUGANTHI EBANEZER | **Admin** ("Suganthi") |
| no code, EBENAZER JEBASEELAN | **Admin** (spelling as the user typed it) |

**Real PINs are NOT in this repo**, deliberately: a 4-digit PIN is trivial to recover from its hash. They're in `~/Downloads/glacetech-employee-pins.csv` and `~/Downloads/glacetech-employee-seed.sql` on the old laptop; copy them privately. `.gitignore` blocks `*employee-seed*.sql` and `*employee-pins*`.

Manage employees in the Supabase SQL Editor:
```sql
select add_employee('010013', 'NAME', 'technician', '4827');   -- add (PIN must be unique, 4 digits)
select set_employee_pin('010005', '6194');                     -- change PIN (logs them out everywhere)
update employees set active = false where code = '010007';     -- block (records kept)
update employees set role = 'admin' where code = '010004';     -- promote
```

## Database scripts (`supabase/`)
- `schema.sql`: the whole setup. **Idempotent** (`create … if not exists` / `create or replace`), so it's safe to re-run after edits.
- `upgrade-from-v1.sql`: one-time; already run on the live project. It moved the pre-login `records` table to `records_v1_backup` (old test rows, locked).
- **Live project status (2026-10-11):** the user ran `upgrade-from-v1.sql`, `schema.sql` and the employee seed, and PIN login works. **Re-run `schema.sql` once more to add `delete_record`** (added after that run). If PostgREST doesn't see new functions, run `notify pgrst, 'reload schema';`.

## Code map
```
src/lib/records.ts        API: login/checkSession/logout/list/get/create/update/delete/listEmployees (RPC or demo)
src/lib/localBackend.ts   DEV-only demo backend with the same rules (demo PINs)
src/lib/auth.ts           AuthContext, useAuth, useSession, useApi (token-bound, handles expiry)
src/components/AuthProvider.tsx   stores session (localStorage "glacetech-session"), 24h auto-logout, validates on start
src/lib/serviceReport.ts  report form values model, revive (Date from JSON), summary, toReportData (→ printable)
src/lib/voucher.ts        voucher form state model, revive, totals, summary, toVoucherData
src/lib/share.ts          WhatsApp / email text
src/data/clients.ts       client dropdown list
src/components/ServiceReportForm.tsx, ExpenseVoucherForm.tsx   forms (props: technicianName / employeeName fixed, draftOwnerId)
src/components/ServiceReport.tsx, ExpenseVoucher.tsx           printable A4 pages (+ .scss)
src/components/PageBar.tsx (back button), UserBar.tsx (who's logged in, log out), DatePicker.tsx, DeleteRecordButton.tsx
src/pages/  LoginPage, Index, ReportFormPage, VoucherFormPage, SavedListPage, SavedViewPage, SavedEditPage, NotFound
```
Routes: `/`, `/report-form`, `/voucher-form`, `/saved`, `/saved/:id`, `/saved/:id/edit`. Everything sits behind the PIN screen (`AppRoutes` in `App.tsx`).

## Setup and deploy
- `npm install && npm run dev` (port 8080). `.env` holds `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- **Note:** `.env` is **committed** on branch `feature/cloud-saving` (the user removed it from `.gitignore` on purpose). It holds only the public anon key, which can only call the PIN-checked functions, so that's acceptable. **Never put the `service_role` / secret key in it.**
- To run demo mode while `.env` exists: `VITE_SUPABASE_URL= VITE_SUPABASE_ANON_KEY= npx vite --port 8090` (process env overrides `.env`).
- Netlify: build `npm run build`, publish `dist`, SPA redirect (`netlify.toml`). Set the two `VITE_` env vars in Netlify and redeploy.
- Git: remote `github.com/johnthomasgithub/data-display-table`. Work is on branch **`feature/cloud-saving`**; `main` is the old version without saving. Lockfile: npm (`package-lock.json`); `bun.lock*` are stale.

## How previous work was verified (reuse these)
- **SQL:** a throwaway local PostgreSQL 17 (`/usr/local/opt/postgresql@17/bin`):
  - `initdb` into a temp dir, start with `-k '' -c listen_addresses=localhost -p 54329` (the Unix socket path was too long)
  - `create role anon; create role authenticated; create schema extensions;`
  - run `schema.sql` + seed, then test as `set role anon` (login, isolation, admin rules, rate limit, expiry)
  - in zsh, call psql through a small wrapper script; zsh doesn't word-split a `$P` variable.
- **UI:** `puppeteer-core` (installed in a scratch dir, not the project) driving the installed Chrome against `vite` dev or preview; screenshots checked visually. Headless Chrome screenshots work, but the process may not exit; wrap it with `perl -e 'alarm 40; exec @ARGV'`.
- Always run: `npx tsc -p tsconfig.app.json --noEmit`, `npx eslint src` (the only remaining warnings are in the template's `src/components/ui/*`), `npm run build`.

## User preferences learned
- Explains in simple English; often reports issues with a screenshot. Wants **features end to end**, tested, with clear step-by-step setup instructions.
- **Budget-conscious:** Supabase free tier + Netlify free.
- Likes the **GlaceTech-style popover calendar** date picker, and **back buttons** everywhere.
- **Client documents:** simple English, short, colourful, client logo, **no personal names**, saved as **PDF in `~/Downloads`** (made with HTML → headless Chrome `--print-to-pdf`).
- Wants to be asked when something is genuinely ambiguous, but otherwise expects sensible defaults, stated clearly.

## Open items / ideas
- Confirm with the client: is "Suganthi" really 010003, and is "EBENAZER" spelled right? (Assumptions; easy to change with SQL.)
- The mobile "app feel" from Anvira (bottom tab bar, bottom-sheet pickers, PWA install) is **not** ported here yet. The user may ask.
- No automatic backups on the Supabase free plan; the README has export commands.
