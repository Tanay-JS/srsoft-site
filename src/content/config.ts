import { defineCollection, z } from 'astro:content';

// This defines the "shape" of every blog post. Sveltia CMS writes Markdown
// files into src/content/blog/ with these fields in the frontmatter, and Astro
// validates them at build time. If a required field is missing, the build
// fails loudly instead of shipping a broken page.
const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    // pubDate comes in as a string from the CMS; coerce to a Date.
    pubDate: z.coerce.date(),
    // Set to false to keep a post as a draft (hidden from the live site).
    published: z.boolean().default(true),
    author: z.string().default('SR Soft LLC'),
    // Optional cover image path (relative to /public, e.g. /uploads/foo.jpg)
    cover: z.string().optional(),
    // Shown on cards/article meta, e.g. "SAP & AI" and "10 min read".
    category: z.string().default('Insights'),
    readingTime: z.string().optional(),
  }),
});

export const collections = { blog };
