import { z } from 'zod';
import { insertLinkSchema, links, analytics } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  links: {
    create: {
      method: 'POST' as const,
      path: '/api/links',
      input: insertLinkSchema,
      responses: {
        201: z.custom<typeof links.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/links',
      responses: {
        200: z.array(z.custom<typeof links.$inferSelect & { clicks: number }>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/links/:alias',
      responses: {
        200: z.custom<typeof links.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    getAnalytics: {
      method: 'GET' as const,
      path: '/api/links/:id/analytics',
      responses: {
        200: z.array(z.custom<typeof analytics.$inferSelect>()),
        404: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type LinkResponse = z.infer<typeof api.links.create.responses[201]>;
export type LinkListResponse = z.infer<typeof api.links.list.responses[200]>;
export type AnalyticsListResponse = z.infer<typeof api.links.getAnalytics.responses[200]>;
