# SR Soft LLC — Astro Site

Your site, rebuilt on **Astro**, with your original design fully ported in:
- All pages (home, services, about, training, careers, contact, Insights blog)
  carry over your existing HTML/CSS/JS — `styles.css` and `site.js` are wired in.
- The **blog** ("Insights") is now managed through **Sveltia CMS** — the owner
  writes articles in a web editor, they commit to GitHub, Netlify auto-rebuilds.
- The **contact form** and **newsletter form** use **Netlify Forms** (free).
- Your first real article ("Why most ERP-AI integration projects fail…") is
  already in the CMS as a Markdown post.

The project builds successfully (8 pages). What's left is hosting setup.

---

## What changed from your originals (so nothing surprises you)

- **Links are now clean paths.** `services.html` → `/services`, `index.html` → `/`,
  etc. Done automatically across every page.
- **Image paths** now start with `/` (e.g. `/logo-mark.png`) and the images live
  in `public/`.
- **The contact + newsletter forms** were placeholders that popped an alert(); they
  now POST to Netlify Forms.
- **`image-slot.js` was dropped.** It was a Claude Design editing helper, not used
  by any real page — safe to leave out.
- **The blog** was a hand-built list of 10 cards all pointing at one `post.html`.
  It's now driven by the CMS: newest post shows as "featured," the rest fill the
  grid automatically as the owner publishes more. Your 9 placeholder card topics
  weren't real articles, so they're not carried over — add them as real posts when
  ready (their titles are preserved in the original blog.html if you want them).

---

## Run it locally

```
npm install
npm run dev
```
Open the URL it prints (usually http://localhost:4321). You'll see your design.

---

## Part 1 — Put the code on GitHub

1. Create a new **empty** repo on GitHub (e.g. `srsoft-site`).
2. From this folder:
   ```
   git init
   git add .
   git commit -m "Astro site"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/srsoft-site.git
   git push -u origin main
   ```
3. Edit `public/admin/config.yml` → change the `repo:` line to your real
   `username/repo`. Commit and push.

---

## Part 2 — Connect Netlify

1. Netlify: **Add new site → Import an existing project → GitHub →** pick your repo.
2. Build settings auto-detect from `netlify.toml` (build `npm run build`, publish `dist`).
3. Deploy. Point your domain at it when ready, and update `site:` in
   `astro.config.mjs` to the final domain.

### Turn on form emails
Netlify captures submissions automatically. For an email on each one:
- Site → **Forms → Form notifications → Add notification → Email notification**
  → send to **admin@srsoftllc.com**. Do this for both the `contact` and
  `newsletter` forms.

> Note on the newsletter: Netlify Forms will *collect* subscriber emails, but it
> won't *send* a monthly newsletter. When you're ready to actually mail people,
> connect a free list tool (Buttondown / Mailchimp free tier) — or export the
> Netlify submissions into one.

---

## Part 3 — One-time CMS login setup (Sveltia auth)

So the owner can log in at `yoursite.com/admin/` and publish:

1. **GitHub OAuth app:** GitHub → Settings → Developer settings → OAuth Apps →
   New OAuth App. Save the **Client ID** and **Client Secret**.
2. **Auth helper:** Sveltia's GitHub README documents current free options (its
   own hosted helper is the least setup). Plug in the Client ID/Secret and set the
   OAuth callback URL it gives you.
3. Owner visits `yoursite.com/admin/` → **Login with GitHub** → writes an article
   → **Publish** commits a Markdown file → Netlify rebuilds → it goes live.

> Until auth is set up, you can publish by adding Markdown files to
> `src/content/blog/` and pushing — the CMS is just a friendly layer on that.

---

## How a new article flows

Owner writes in `/admin` → Publish → Sveltia commits a `.md` to GitHub → Netlify
rebuilds → the article appears under Insights (newest = featured). No API keys,
no manual rebuild button.

---

## Project map

```
public/
  admin/            ← Sveltia CMS (index.html + config.yml)
  uploads/          ← CMS-uploaded images land here
  styles.css        ← your stylesheet (ported)
  site.js           ← your scripts (ported)
  *.png / *.jpg     ← logo, e-verify, handshake, no_job
src/
  layouts/BaseLayout.astro   ← shared head/nav/footer/e-verify (your shell)
  pages/
    index / services / about / training / careers / contact  (.astro)
    blog/index.astro         ← Insights listing (data-driven)
    blog/[slug].astro        ← one page per article
  content/
    config.ts                ← blog post fields
    blog/*.md                ← the articles
astro.config.mjs   ← set `site` to your final domain
netlify.toml       ← Netlify build settings
```
