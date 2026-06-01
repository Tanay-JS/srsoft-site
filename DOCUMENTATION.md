# SR Soft LLC website — full documentation

Everything about how this site is built, how it runs, how content flows, and how
to maintain it. For the temporary→company account move, see [MIGRATION.md](MIGRATION.md).

---

## 1. What this is

A marketing website for **SR Soft LLC** (SAP + AI consulting). It's a **static
site** built with **[Astro](https://astro.build)**, hosted on **Netlify**, with:

- A **blog** ("Insights") edited through **Sveltia CMS** — a web editor at `/admin`
  that commits Markdown to GitHub; Netlify then auto-rebuilds.
- A **contact form** powered by **Netlify Forms** (no backend code).
- A self-contained **SAP BTP training course** (5 static HTML modules).

There is **no database and no server**. Every page is pre-rendered to plain
HTML/CSS/JS at build time and served as files. That makes it fast, cheap, and
secure (nothing to hack at runtime).

### Tech stack
| Layer | Choice |
|-------|--------|
| Framework | Astro 5 (`output: 'static'`) |
| Hosting / CI | Netlify (auto-deploy from GitHub `main`) |
| CMS | Sveltia CMS (Decap-compatible), GitHub backend |
| Forms | Netlify Forms |
| Content | Markdown files validated by a typed schema |
| Styling | One global `styles.css` + one page-specific stylesheet |
| Node version | 22 (pinned in `netlify.toml`) |

---

## 2. Project structure

```
├── astro.config.mjs        # Astro config — `site:` = canonical URL (for sitemap/RSS)
├── netlify.toml            # Netlify build settings (command, publish dir, Node 22)
├── package.json            # scripts + the single dependency (astro)
├── README.md               # quick-start / hosting setup notes
├── MIGRATION.md            # everything tied to the temporary accounts
├── DOCUMENTATION.md        # this file
│
├── public/                 # served verbatim, copied as-is into the build
│   ├── admin/
│   │   ├── index.html      #   loads Sveltia CMS (the /admin page)
│   │   └── config.yml      #   CMS config: which repo, what fields a post has
│   ├── styles.css          #   the ENTIRE global stylesheet (design system)
│   ├── site.js             #   all front-end JS (nav, animations, interactions)
│   ├── uploads/            #   images uploaded via the CMS land here
│   ├── training/sap-btp/   #   the standalone 5-module SAP BTP course (static HTML)
│   └── *.png / *.jpg       #   logo, e-verify badge, handshake, no_job photos
│
└── src/
    ├── layouts/
    │   └── BaseLayout.astro #   shared shell: <head>, nav, footer, E-Verify badge
    ├── pages/               #   one file = one route
    │   ├── index.astro      #     /            (home)
    │   ├── services.astro   #     /services
    │   ├── about.astro      #     /about
    │   ├── training.astro   #     /training
    │   ├── careers.astro    #     /careers
    │   ├── contact.astro    #     /contact     (Netlify Form)
    │   ├── success.astro    #     /success     (post-submit thank-you page)
    │   └── blog/
    │       ├── index.astro  #     /blog        (Insights listing)
    │       └── [slug].astro #     /blog/<slug> (one page per article)
    ├── content/
    │   ├── config.ts        #   the blog post schema (field types, validation)
    │   └── blog/*.md        #   the articles (Markdown + frontmatter)
    └── styles/
        └── services-v2.css  #   services-page-only styles (imported by services.astro)
```

### Why `public/` vs `src/`
- **`public/`** = files shipped untouched (the stylesheet, JS, images, the CMS, the
  training HTML). A file at `public/foo.png` is served at `/foo.png`.
- **`src/`** = files Astro *processes* (pages, layouts, content, imported CSS).

---

## 3. How a page is built

Every page wraps its content in **`BaseLayout.astro`**, which provides the
`<head>`, the top navigation, the footer, the floating E-Verify badge, and pulls
in `styles.css` + `site.js`. A page looks like:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="..." description="..." current="services">
  <!-- page-specific HTML here -->
</BaseLayout>
```

- `title` / `description` → `<title>` and meta description.
- `current` → highlights the active nav item (`"services"`, `"about"`, etc.).

At build time Astro turns each `.astro` file into a static `.html` file in `dist/`
(e.g. `src/pages/services.astro` → `dist/services/index.html`, served at `/services/`).

---

## 4. The blog / Insights system

This is the only "dynamic" part — and it's still static, just data-driven.

### Where content lives
Each article is a Markdown file in `src/content/blog/`. The filename is the URL
slug (e.g. `why-we-still-recommend-s4hana-migrations.md` → `/blog/why-we-still-recommend-s4hana-migrations/`).

### The shape of a post — `src/content/config.ts`
Every post's frontmatter is validated against this schema at build time. If a
required field is missing, **the build fails loudly** instead of shipping a broken
page. Fields:

| Field | Required | Notes |
|-------|----------|-------|
| `title` | yes | |
| `description` | yes | shown on cards + meta |
| `pubDate` | yes | date; **newest post becomes "Featured"** |
| `published` | no (default `true`) | set `false` to hide as a draft |
| `author` | no (default "SR Soft LLC") | |
| `category` | no (default "Insights") | e.g. "SAP & AI" |
| `readingTime` | no | e.g. "10 min read" |
| `cover` | no | image path under `/public` |

### How the listing works — `src/pages/blog/index.astro`
1. Loads all posts, filters out `published: false`, sorts newest-first by `pubDate`.
2. The **newest** post renders as the big **Featured** block.
3. The **rest** fill the "Recent essays" grid.
   - With only one post, the grid is empty (that's expected, not a bug).

### How one article renders — `src/pages/blog/[slug].astro`
The `[slug]` is a dynamic route: Astro generates one HTML page per Markdown file.

### Current articles
`erp-ai-integration-90-days` (the real flagship, featured) plus four sample posts
added to populate the demo grid (SAP Joule comparison, S/4HANA migrations,
21 CFR Part 11, talent gap). The samples have genuine short intros and can be
expanded or replaced via the CMS.

---

## 5. The CMS (Sveltia) — how non-technical editing works

The owner never touches code. They go to **`/admin/`**, log in with GitHub, and
write articles in a friendly editor.

### The pieces
- **`public/admin/index.html`** — loads the Sveltia CMS app (one script tag).
- **`public/admin/config.yml`** — tells the CMS:
  - which **repo** to commit to (`repo: Tanay-JS/srsoft-site`),
  - where uploaded images go (`public/uploads`),
  - the **fields** each article has (mirrors the schema in `config.ts`).

### Login (auth)
Uses **GitHub OAuth via Netlify's OAuth provider** (the default, no extra server):
- A **GitHub OAuth App** holds the Client ID/Secret.
- Netlify is registered as the OAuth provider (callback `https://api.netlify.com/auth/done`).
- The editor clicks "Login with GitHub" at `/admin/` and is in.

### The content flow (the important mental model)
```
Owner edits in /admin  →  Sveltia commits a .md to GitHub (main)
   →  Netlify sees the commit  →  runs `npm run build`  →  publishes dist/
   →  the article is live under Insights
```
No API keys to manage, no "publish" button on a server — publishing **is** a git
commit, and Netlify rebuilds automatically.

> You can also publish without the CMS: add a Markdown file to `src/content/blog/`
> and push. The CMS is just a friendly layer over that.

---

## 6. Forms (contact)

`src/pages/contact.astro` holds a standard HTML form marked `data-netlify="true"`
with a hidden `form-name` field and a honeypot (`bot-field`) for spam. Key facts:

- **Netlify detects the form at deploy time** and captures submissions
  server-side. (Form detection must be enabled in the Netlify project — it is.)
- On submit, the form redirects to **`/success/`** (`src/pages/success.astro`), a
  thank-you page. Without that redirect target Netlify returns a 404, which is the
  one gotcha to remember.
- **Email notifications are NOT in code.** Who gets emailed is set in
  Netlify → **Project configuration → Notifications → Form submission notifications**.
  Currently the test inbox `jayanthisaitanay@gmail.com`.
- **Forms only work on the deployed Netlify site** — never on localhost.
- Spam-flagged submissions don't trigger emails (check the Forms "Spam" tab).

---

## 7. Styling & animation

- **`public/styles.css`** is the whole design system: CSS variables (colors,
  spacing, type scale) in `:root`, then every shared component. It's dark-themed.
- **`src/styles/services-v2.css`** holds the Services page's unique section
  treatments (`.sv-*`). It's imported by `services.astro` so it loads **only** on
  `/services`. (These styles were originally inline on the old `services.html`.)
- **`public/site.js`** runs all front-end behavior: mobile nav, the interactive
  logo, the careers globe / services gear canvases, the E-Verify dismiss, and the
  **scroll-reveal** animation.

### Scroll-reveal
Elements with class `.reveal` start invisible and fade in when scrolled into view
(an IntersectionObserver in `site.js` adds an `.in` class). It's tuned to reveal
slightly early and stay revealed. The Services page additionally uses `.sv-pop`
(an eager observer in `services.astro`) and `.reveal-stagger` for cascading items.

---

## 8. The SAP BTP training course

`public/training/sap-btp/` contains a **self-contained** 5-module course
(`index.html` + `module-1..5.html`). The files are fully standalone — inline CSS,
inline base64 images, their own design — and open in a new tab from the Training
page's "Free sample course" section. Served at `/training/sap-btp/...`. They're
independent of the rest of the site (no shared styles).

---

## 9. Running & deploying

### Local
```
npm install
npm run dev      # preview at http://localhost:4321
npm run build    # produce dist/ (what Netlify publishes)
```
Note: the CMS login and the contact form do **not** work locally — both need the
deployed Netlify site.

### Deploy
Netlify is connected to the GitHub repo. **Any push to `main` triggers a build**
(`npm run build`) and publishes `dist/`. Settings come from `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"
[build.environment]
  NODE_VERSION = "22"
```

### `astro.config.mjs`
`site:` is the canonical URL used for the sitemap/RSS/canonical links. It's set to
the live Netlify URL and should be updated to the final domain when one is attached.

---

## 10. Common tasks (cheat sheet)

| I want to… | Do this |
|------------|---------|
| **Publish an article** | Log in at `/admin/` → New "Insights / Articles" → fill fields → Publish. (Or add a `.md` to `src/content/blog/` and push.) |
| **Hide an article** | Set `published: false` in its frontmatter (or uncheck "Published" in the CMS). |
| **Edit a page's text** | Edit the matching file in `src/pages/` and push. |
| **Change the contact email recipient** | Netlify → Project configuration → Notifications → Form submission notifications → edit the email. |
| **Change the site's colors/spacing** | Edit the `:root` variables at the top of `public/styles.css`. |
| **Add a nav item** | Edit the `nav` array in `src/layouts/BaseLayout.astro`. |
| **Point at a custom domain** | Add it in Netlify, then update `site:` in `astro.config.mjs`. |
| **Move to the company accounts** | Follow [MIGRATION.md](MIGRATION.md). |

---

## 11. Gotchas worth knowing (learned while building)

- **Only `services.html` had page-specific inline CSS/JS in the original site.**
  If you ever re-port from the old HTML, remember Services carries extra styling in
  `src/styles/services-v2.css` + an inline `<script>` in `services.astro`.
- **Logo PNGs must keep transparency.** `logo-mark.png` and `e-verify-logo.png` are
  transparent; if flattened onto black they look like black boxes on the dark theme.
- **Netlify form 404 on submit** = no redirect target or form detection off. The
  fix here was the `/success/` page + enabling form detection.
- **Forms & CMS login need the live site** — they can't be tested locally.

---

## 12. Key links

| What | Where |
|------|-------|
| Live site | https://srsoft-site.netlify.app |
| CMS login | https://srsoft-site.netlify.app/admin/ |
| GitHub repo | https://github.com/Tanay-JS/srsoft-site |
| Netlify dashboard | https://app.netlify.com (team "Burger Shack" → project "srsoft-site") |
| GitHub OAuth App | https://github.com/settings/developers |

> Account-specific values and the migration checklist live in [MIGRATION.md](MIGRATION.md).
