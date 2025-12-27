import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const links = pgTable("links", {
  id: serial("id").primaryKey(),
  alias: text("alias").notNull().unique(),
  originalUrl: text("original_url").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"), // Optional expiration
});

export const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  linkId: integer("link_id").notNull().references(() => links.id),
  timestamp: timestamp("timestamp").defaultNow(),
  ip: text("ip"),
  city: text("city"),
  country: text("country"),
  userAgent: text("user_agent"),
  device: text("device"), // e.g., "desktop", "mobile"
  browser: text("browser"), // e.g., "Chrome", "Firefox"
});

export const linksRelations = relations(links, ({ many }) => ({
  analytics: many(analytics),
}));

export const analyticsRelations = relations(analytics, ({ one }) => ({
  link: one(links, {
    fields: [analytics.linkId],
    references: [links.id],
  }),
}));

export const insertLinkSchema = createInsertSchema(links).omit({ 
  id: true, 
  createdAt: true 
}).extend({
  alias: z.string().min(3).regex(/^[a-zA-Z0-9-_]+$/, "Alias must be alphanumeric"),
  originalUrl: z.string().url("Invalid URL format"),
});

export const insertAnalyticsSchema = createInsertSchema(analytics).omit({ 
  id: true, 
  timestamp: true 
});

export type Link = typeof links.$inferSelect;
export type InsertLink = z.infer<typeof insertLinkSchema>;
export type Analytic = typeof analytics.$inferSelect;
export type InsertAnalytic = z.infer<typeof insertAnalyticsSchema>;

export type LinkWithAnalytics = Link & {
  analytics: Analytic[];
  clicks: number; // Computed count
};

export type CreateLinkRequest = InsertLink;
