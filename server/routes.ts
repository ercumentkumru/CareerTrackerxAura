import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertWeekSchema } from "@shared/schema";

export async function registerRoutes(app: Express) {
  // Get all weeks
  app.get("/api/weeks", async (_req, res) => {
    const weeks = await storage.getWeeks();
    res.json(weeks);
  });

  // Update week points
  app.post("/api/weeks/:weekNumber", async (req, res) => {
    const weekNumber = parseInt(req.params.weekNumber);
    const result = insertWeekSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ error: "Invalid week data" });
    }

    const week = await storage.updateWeek(weekNumber, result.data.points);
    res.json(week);
  });

  // Clear all weeks
  app.post("/api/weeks/clear", async (_req, res) => {
    await storage.clearAllWeeks();
    res.json({ success: true });
  });

  return createServer(app);
}
