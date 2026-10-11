# GlaceTech Reports

Digital GlaceTech forms: **Service / Breakdown Report** and **Expense Statement Voucher**.

Fill a form, sign on screen and **Save & Generate**. Every report or voucher is saved to the cloud (Supabase), and can later be found, opened, edited, printed or saved as a PDF, and shared on WhatsApp or by email.

Everyone logs in with a personal **4-digit PIN**. A login lasts 24 hours on that device.

- **Technicians** see, edit and download **only their own** reports and vouchers. Their name is filled in automatically and cannot be changed.
- **Admins** see, edit and download **everyone's** records, but can never change the technician name on a record. **Only admins can delete** a report or voucher (their own or anyone's). Deletes are permanent, with a confirmation step.

These rules are enforced by the database itself (see `supabase/schema.sql`), not just hidden in the app.

Stack: Vite + React + TypeScript + Tailwind + shadcn/ui, Supabase (database and signature storage), hosted on Netlify.

## Run locally

```sh
npm install
cp .env.example .env   # add the Supabase keys (see below)
npm run dev            # http://localhost:8080
```

Without Supabase keys, `npm run dev` runs a **local demo** with demo PINs (1001–1012, 1099), shown on the login screen. Records are saved in this browser only. Production builds do not include the demo, so they can't log in without Supabase.

## Supabase setup (one time)

1. Create a free project at [supabase.com](https://supabase.com) with the client's account. Pick the **Mumbai (ap-south-1)** region and keep **Data API** enabled.
2. Open **SQL Editor → New query**, paste all of [`supabase/schema.sql`](supabase/schema.sql), and click **Run**.
   - If you already ran the **first version** of this script (before PIN login), run [`supabase/upgrade-from-v1.sql`](supabase/upgrade-from-v1.sql) first.
3. In a new query, run the employee seed file **`glacetech-employee-seed.sql`**. It's kept outside this repo because it contains the PINs.
4. Open **Project Settings → API** and copy the **Project URL** and the **anon public** (or **Publishable**) key into `.env`:
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=...
   ```
5. Restart `npm run dev`. The yellow banner disappears and the real PINs work.

### Managing employees and PINs (SQL Editor)

```sql
select add_employee('010013', 'NEW TECHNICIAN NAME', 'technician', '4827');  -- add
select set_employee_pin('010005', '6194');                                -- change a PIN (by code or exact name)
update employees set active = false where code = '010007';                -- block someone (records are kept)
update employees set role = 'admin' where code = '010004';                -- make someone admin
```

PINs must be 4 digits and unique; the database rejects duplicates. Changing a PIN logs that person out everywhere.

Never commit a file containing PINs. A 4-digit PIN is easy to recover from its stored hash, so treat the seed file like a password list.

## Netlify

Add the same two variables under **Site configuration → Environment variables**, then redeploy. Build settings and single-page-app routing are in [`netlify.toml`](netlify.toml).

## How it works

| Screen | Route |
|---|---|
| Home | `/` |
| New Service / Breakdown Report | `/report-form` |
| New Expense Voucher | `/voucher-form` |
| Saved list with filters | `/saved` |
| View, print, share | `/saved/:id` |
| Edit | `/saved/:id/edit` |

- **Saved list filters:** client name, Report No. / Voucher No., type (Service, Breakdown, Voucher), and from/to date. Filters are kept in the page address, so **Back** from a record returns to the same list.
- **Storage:** each record is one row in `records`, with its owner (`owner_id`, `owner_name`). `ref_no`, `client`, `record_type` and `record_date` are searchable columns. All form values are stored in `data` (JSON), so a record opens again in the same form for editing.
- **Signatures:** stored inside the record's `data`, so they follow the same access rules.
- **Access:** the app never reads tables directly. It calls database functions (`login`, `list_records`, `get_record`, `create_record`, `update_record`, …) with the login token, and those functions apply the technician/admin rules. 5 wrong PINs from one network address block logins for 15 minutes.
- **PDFs:** not stored. They are rebuilt from the data when **Print / Save PDF** is pressed.

## Exporting data

- **Excel/CSV:** Supabase → Table Editor → `records` → Export.
- **Full backup:** `pg_dump "<connection string>" --schema=public -Fc -f glacetech-backup.dump`
