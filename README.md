# GlaceTech Reports

Digital GlaceTech forms: **Service / Breakdown Report** and **Expense Statement Voucher**.

Fill a form, sign on screen and **Save & Generate**. Every report or voucher is saved to the cloud (Supabase), and can later be found, opened, edited, printed or saved as a PDF, and shared on WhatsApp or by email.

There is **no login**: anyone with the app link can use it, so share the link only with the team.

Stack: Vite + React + TypeScript + Tailwind + shadcn/ui, Supabase (database and signature storage), hosted on Netlify.

## Run locally

```sh
npm install
cp .env.example .env   # add the Supabase keys (see below)
npm run dev            # http://localhost:8080
```

Without Supabase keys the app runs in **local mode**. Records are saved in this browser only, and a yellow banner says so.

## Supabase setup (one time)

1. Create a free project at [supabase.com](https://supabase.com) with the client's account. Pick the **Mumbai (ap-south-1)** region and keep **Data API** enabled.
2. Open **SQL Editor → New query**, paste all of [`supabase/schema.sql`](supabase/schema.sql), and click **Run**. This creates:
   - the `records` table,
   - access rules (create, read and edit allowed; delete is not possible from the app),
   - a private `signatures` bucket.
3. Open **Project Settings → API** and copy the **Project URL** and the **anon public** (or **Publishable**) key into `.env`:
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=...
   ```
4. Restart `npm run dev`. The yellow banner disappears.

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
- **Storage:** each record is one row in `records`. `ref_no`, `client`, `person`, `record_type` and `record_date` are searchable columns. All form values are stored in `data` (JSON), so a record opens again in the same form for editing.
- **Signatures:** uploaded as PNGs to the private `signatures` bucket (`<record id>/<field>-<time>.png`) and shown through short-lived signed links.
- **PDFs:** not stored. They are rebuilt from the data when **Print / Save PDF** is pressed.

## Exporting data

- **Excel/CSV:** Supabase → Table Editor → `records` → Export.
- **Full backup:** `pg_dump "<connection string>" --schema=public -Fc -f glacetech-backup.dump`
- **Signatures:** Supabase → Storage → `signatures`.
