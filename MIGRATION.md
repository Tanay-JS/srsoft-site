# Migration checklist — temporary demo → company accounts

This site was set up on **temporary personal accounts** to demo it to the client,
then move to the company's own GitHub org + Netlify. Everything tied to the
temporary setup is listed below so the move is mechanical.

## Temporary accounts in use (the "from")

| Thing | Current (temporary) value |
|-------|---------------------------|
| GitHub account | **Tanay-JS** |
| GitHub repo | **Tanay-JS/srsoft-site** (public) |
| Live URL | **https://srsoft-site.netlify.app** |
| Netlify team | **Burger Shack** |
| Netlify project | **srsoft-site** |
| Git commit author | Tanay-JS `<keronstarks@gmail.com>` |
| Form notification email | **jayanthisaitanay@gmail.com** (test inbox) |
| GitHub OAuth App (CMS login) | Client ID **Ov23liMPBywcA8CqOkGx**, on the Tanay-JS account |

---

## Migration steps (in order)

### 1. Move the repo to the company GitHub org
- Create/transfer the repo under the **company org** (e.g. `srsoft/srsoft-site`).
- Update the local remote:
  ```
  git remote set-url origin https://github.com/<company-org>/<repo>.git
  ```
- (Optional) reconfigure commit identity to a company account:
  `git config user.name "..."` / `git config user.email "..."`

### 2. Update repo references **in the code** (these are the only hardcoded spots)
| File | Line | Change |
|------|------|--------|
| `public/admin/config.yml` | `repo:` | `Tanay-JS/srsoft-site` → `<company-org>/<repo>` |
| `astro.config.mjs` | `site:` | `https://srsoft-site.netlify.app` → final domain (e.g. `https://www.srsoftllc.com`) |

Commit + push these.

### 3. Recreate the site on the company's Netlify
- New site on the **company Netlify team** → import the company-org repo.
- Build settings auto-detect from `netlify.toml` (`npm run build`, publish `dist`, Node 22). No change needed.
- Point the **custom domain** (e.g. srsoftllc.com) at the new Netlify site, then make sure
  `astro.config.mjs` `site:` matches it (step 2).

### 4. Recreate the CMS login (GitHub OAuth)
The current login uses a GitHub OAuth App on **Tanay-JS** linked via Netlify's OAuth provider.
Redo on the company accounts:
- **New GitHub OAuth App** under the company org:
  - Homepage URL: the final site URL
  - Authorization callback URL: `https://api.netlify.com/auth/done` (unchanged — this is Netlify's handler)
  - Device Flow: off
  - Copy Client ID + generate Client Secret.
- In the **company Netlify**: Site config → Access & security → OAuth →
  **Authentication providers** → install **GitHub** with the new Client ID/Secret.
- The old Tanay-JS OAuth App (Client ID `Ov23liMPBywcA8CqOkGx`) can be deleted after.
- No `config.yml` change needed for auth (uses Netlify's default OAuth flow).

### 5. Re-add the form notification email (real inbox)
Netlify Forms notifications are **not in code** — set per-site in the dashboard.
- Company Netlify → **Forms → Form notifications → Add → Email notification**
- Recipient: the client's real inbox (README suggests **admin@srsoftllc.com**) — replaces the
  test address `jayanthisaitanay@gmail.com`.
- Do it for the **`contact`** form. Forms only work on the deployed site.

### 6. Content cleanup (demo artifacts to review)
- 4 sample Insights articles were added to populate the grid for the demo:
  `sap-joule-oracle-genai-copilot-comparison`, `why-we-still-recommend-s4hana-migrations`,
  `21-cfr-part-11-in-the-ai-era`, `the-talent-gap-stalling-enterprise-ai`
  (in `src/content/blog/`). Review / expand / replace, or set `published: false` to hide.
- A CMS test renamed one article's title to **"Test Case"** — restore its real title if still set.

---

## Does NOT change at migration
- `netlify.toml` build settings (portable).
- The site code, content schema, and the Sveltia CMS setup itself.
- The OAuth **callback URL** value (`https://api.netlify.com/auth/done`) — same on any Netlify site.
