// @ts-check
import { defineConfig } from 'astro/config';

// Update `site` to your final domain once you have it.
// This is used for sitemap/canonical URLs and the RSS feed.
export default defineConfig({
  site: 'https://snazzy-selkie-08f03a.netlify.app',
  // Static output — outputs plain HTML/CSS/JS that Netlify serves directly.
  output: 'static',
});
