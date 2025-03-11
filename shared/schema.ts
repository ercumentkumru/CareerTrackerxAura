import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const weeks = pgTable("weeks", {
  id: serial("id").primaryKey(),
  weekNumber: integer("week_number").notNull(),
  points: integer("points").notNull().default(0),
});

export const insertWeekSchema = createInsertSchema(weeks).pick({
  weekNumber: true,
  points: true,
});

export type InsertWeek = z.infer<typeof insertWeekSchema>;
export type Week = typeof weeks.$inferSelect;

export const careerLevels = {
  JADE: 1500,
  PEARL: 4500,
  SAPPHIRE: 9000,
  RUBY: 18000,
  EMERALD: 36000,
  DIAMOND: 75000,
  BLUE_DIAMOND: 150000,
  RED_DIAMOND: 300000,
  BLACK_DIAMOND: 750000,
  AMBASSADOR: 1500000,
} as const;

export type CareerLevel = keyof typeof careerLevels;
