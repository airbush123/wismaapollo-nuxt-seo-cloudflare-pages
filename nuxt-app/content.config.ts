import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    content: defineCollection({
      type: 'page',
      source: '**/*.md',
      schema: z.object({
        image: z.string().optional(),
        category: z.string().optional(),
        excerpt: z.string().optional(),
        date: z.string().optional(),
        dateModified: z.string().optional()
      })
    })
  }
})
