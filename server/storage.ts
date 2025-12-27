import { db } from "./db";
import {
  links, analytics,
  type Link, type InsertLink, type Analytic, type InsertAnalytic, type LinkWithAnalytics
} from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  createLink(link: InsertLink): Promise<Link>;
  getLinkByAlias(alias: string): Promise<Link | undefined>;
  getLinkById(id: number): Promise<Link | undefined>;
  getAllLinks(): Promise<(Link & { clicks: number })[]>;
  trackClick(analytic: InsertAnalytic): Promise<void>;
  getAnalytics(linkId: number): Promise<Analytic[]>;
}

export class DatabaseStorage implements IStorage {
  async createLink(insertLink: InsertLink): Promise<Link> {
    const [link] = await db.insert(links).values(insertLink).returning();
    return link;
  }

  async getLinkByAlias(alias: string): Promise<Link | undefined> {
    const [link] = await db.select().from(links).where(eq(links.alias, alias));
    return link;
  }

  async getLinkById(id: number): Promise<Link | undefined> {
    const [link] = await db.select().from(links).where(eq(links.id, id));
    return link;
  }

  async getAllLinks(): Promise<(Link & { clicks: number })[]> {
    // Join with analytics count
    const result = await db.select({
      id: links.id,
      alias: links.alias,
      originalUrl: links.originalUrl,
      createdAt: links.createdAt,
      expiresAt: links.expiresAt,
      clicks: sql<number>`count(${analytics.id})`.mapWith(Number),
    })
    .from(links)
    .leftJoin(analytics, eq(links.id, analytics.linkId))
    .groupBy(links.id)
    .orderBy(desc(links.createdAt));
    
    return result;
  }

  async trackClick(analytic: InsertAnalytic): Promise<void> {
    await db.insert(analytics).values(analytic);
  }

  async getAnalytics(linkId: number): Promise<Analytic[]> {
    return await db.select()
      .from(analytics)
      .where(eq(analytics.linkId, linkId))
      .orderBy(desc(analytics.timestamp));
  }
}

export const storage = new DatabaseStorage();
