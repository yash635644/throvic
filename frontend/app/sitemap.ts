import type { MetadataRoute } from 'next'

export const dynamic = 'force-static';
 
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://throvic.pages.dev',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: 'https://throvic.pages.dev/explore',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ]
}
