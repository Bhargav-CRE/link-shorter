import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import geoip from 'geoip-lite';
import requestIp from 'request-ip';
import { nanoid } from 'nanoid';

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // --- API Routes ---

  app.post(api.links.create.path, async (req, res) => {
    try {
      // Validate input
      let input = api.links.create.input.parse(req.body);
      
      // Generate alias if not provided or empty
      if (!input.alias) {
        input.alias = nanoid(6);
      }

      // Check if alias exists
      const existing = await storage.getLinkByAlias(input.alias);
      if (existing) {
        return res.status(400).json({ message: "Alias already exists", field: "alias" });
      }

      const link = await storage.createLink(input);
      res.status(201).json(link);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.get(api.links.list.path, async (req, res) => {
    const links = await storage.getAllLinks();
    res.json(links);
  });

  app.get(api.links.get.path, async (req, res) => {
    const link = await storage.getLinkByAlias(req.params.alias);
    if (!link) {
      return res.status(404).json({ message: 'Link not found' });
    }
    res.json(link);
  });

  app.get(api.links.getAnalytics.path, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    const data = await storage.getAnalytics(id);
    res.json(data);
  });

  // --- Redirection Route ---
  app.get('/r/:alias', async (req, res) => {
    const alias = req.params.alias;
    const link = await storage.getLinkByAlias(alias);

    if (!link) {
      return res.status(404).send(`
        <html>
          <head><title>Link Not Found</title></head>
          <body style="font-family: sans-serif; text-align: center; padding-top: 50px;">
            <h1>404 - Link Not Found</h1>
            <p>The short link you are looking for does not exist.</p>
            <a href="/">Go Home</a>
          </body>
        </html>
      `);
    }

    // Check expiration
    if (link.expiresAt && new Date() > new Date(link.expiresAt)) {
      return res.status(410).send("Link Expired");
    }

    // Async Analytics Tracking (don't await to speed up redirect)
    const clientIp = requestIp.getClientIp(req);
    const geo = clientIp ? geoip.lookup(clientIp) : null;
    const userAgent = req.headers['user-agent'] || 'Unknown';

    storage.trackClick({
      linkId: link.id,
      ip: clientIp || 'unknown',
      city: geo?.city || 'Unknown',
      country: geo?.country || 'Unknown',
      userAgent: userAgent,
      device: userAgent.includes('Mobile') ? 'Mobile' : 'Desktop', // Simple detection
      browser: 'Unknown', // Could use a library for better detection
    }).catch(console.error);

    res.redirect(link.originalUrl);
  });

  // Seed Data if empty
  const existingLinks = await storage.getAllLinks();
  if (existingLinks.length === 0) {
    console.log("Seeding database...");
    const link1 = await storage.createLink({
      alias: "google",
      originalUrl: "https://google.com"
    });
    const link2 = await storage.createLink({
      alias: "replit",
      originalUrl: "https://replit.com"
    });
    
    // Fake clicks
    await storage.trackClick({ linkId: link1.id, city: "San Francisco", country: "US", device: "Desktop", browser: "Chrome", ip: "127.0.0.1" });
    await storage.trackClick({ linkId: link1.id, city: "London", country: "UK", device: "Mobile", browser: "Safari", ip: "127.0.0.1" });
    await storage.trackClick({ linkId: link2.id, city: "New York", country: "US", device: "Desktop", browser: "Firefox", ip: "127.0.0.1" });
    console.log("Database seeded!");
  }

  return httpServer;
}
