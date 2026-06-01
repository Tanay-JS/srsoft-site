// @ts-check
import { defineConfig } from 'astro/config';

// Update `site` to your final domain once you have it.
// This is used for sitemap/canonical URLs and the RSS feed.
export default defineConfig({
  // Temporary demo URL on the Tanay-JS Netlify account.
  // Change to the final/company domain at migration.
  site: 'https://srsoft-site.netlify.app',
  // Static output — outputs plain HTML/CSS/JS that Netlify serves directly.
  output: 'static',
});
