# Careers feed

The public `/career` page uses `/api/jobs`, combining the free Remotive and Arbeitnow feeds. No API key or Supabase function is required for careers. Cards credit the provider and open the original listing.

Run `npm run dev` locally. Vite serves the jobs handler in development and preview; Vercel serves `api/jobs.js` in production. Other static hosts need a Node server or function serving this endpoint. Node 18 or newer is required.

Feeds are cached for six hours in each running server instance and by the Vercel CDN. Cache is not persistent across cold starts; high-traffic deployments with many instances should use a shared cache or scheduled ingestion to control upstream requests. One working source is enough to display jobs; if both fail, the page offers Retry.

Remotive covers remote jobs, delays listings by 24 hours, and requires attribution and links to its listings. Do not gate these listings behind signup. Arbeitnow's default feed covers European opportunities (the first feed page is loaded). Neither source guarantees Splunk, Linux, finance, or US openings. Remote roles can have geographic restrictions.

Provider documentation: https://remotive.com/remote-jobs/api and https://www.arbeitnow.com/blog/job-board-api

Validation: `node scripts/check-careers.mjs` for deterministic checks, or add `--live` to check provider connectivity. Run `npm run build` for the production bundle.
