import type { MetadataRoute } from 'next';
import { allItems } from '@/data/content';

const SITE_URL = 'https://disrec.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
  ];
  const articlePages: MetadataRoute.Sitemap = allItems.map(item => ({
    url: `${SITE_URL}/article/${item.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));
  return [...staticPages, ...articlePages];
}
