This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Database setup (new Supabase project)

1. Copy `.env.example` to `.env.local` and fill in the project URL and publishable key.
2. In the Supabase SQL Editor, run in order:
   1. `supabase/migrations/20261030000000_initial_schema.sql` — tables, RLS, functions, grants
   2. `supabase/migrations/20261030000001_tighten_anon_grants.sql` — removes Supabase's automatic visitor grants
   3. `supabase/migrations/20261030000002_media_storage.sql` — image storage bucket (photos/logos served from CDN)
   4. `supabase/migrations/20261030000003_buyer_requests_v2.sql` — buyer request form fields; requests visible to the buyer and admins only
   5. `supabase/seed.sql` — countries, product catalog, partner buyers, seafood index
3. Sign up on the site with the admin email and confirm it, then run `supabase/admin_bootstrap.sql`.

Security model: admin access comes only from `users.role = 'admin'` in the database.
Prices and supplier offers are readable only by signed-in users (enforced by RLS);
visitors receive product names/origins only, via `get_public_product_listings()`.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
