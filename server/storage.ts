import { weeks, type Week, type InsertWeek } from "@shared/schema";

export interface IStorage {
  getWeeks(): Promise<Week[]>;
  getWeek(weekNumber: number): Promise<Week | undefined>;
  updateWeek(weekNumber: number, points: number): Promise<Week>;
  clearAllWeeks(): Promise<void>;
}

export class MemStorage implements IStorage {
  private weeks: Map<number, Week>;
  private currentId: number;

  constructor() {
    this.weeks = new Map();
    this.currentId = 1;
  }

  async getWeeks(): Promise<Week[]> {
    return Array.from(this.weeks.values()).sort((a, b) => a.weekNumber - b.weekNumber);
  }

  async getWeek(weekNumber: number): Promise<Week | undefined> {
    return Array.from(this.weeks.values()).find(
      (week) => week.weekNumber === weekNumber
    );
  }

  async updateWeek(weekNumber: number, points: number): Promise<Week> {
    const existingWeek = await this.getWeek(weekNumber);
    
    if (existingWeek) {
      const updatedWeek = { ...existingWeek, points };
      this.weeks.set(existingWeek.id, updatedWeek);
      return updatedWeek;
    }

    const newWeek: Week = {
      id: this.currentId++,
      weekNumber,
      points
    };
    this.weeks.set(newWeek.id, newWeek);
    return newWeek;
  }

  async clearAllWeeks(): Promise<void> {
    this.weeks.clear();
    this.currentId = 1;
  }
}

export const storage = new MemStorage();
