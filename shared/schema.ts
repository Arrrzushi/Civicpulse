import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const complaints = pgTable("complaints", {
  id: serial("id").primaryKey(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  photoHash: text("photo_hash").notNull(),
  status: text("status").notNull().default("pending"),
  walletAddress: text("wallet_address").notNull(),
  donations: integer("donations").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  walletAddress: text("wallet_address").notNull().unique(),
  tokens: integer("tokens").notNull().default(0),
  complaintsSubmitted: integer("complaints_submitted").notNull().default(0),
  donationsMade: integer("donations_made").notNull().default(0),
});

export const insertComplaintSchema = createInsertSchema(complaints).omit({ 
  id: true,
  createdAt: true,
  donations: true
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  tokens: true,
  complaintsSubmitted: true,
  donationsMade: true
});

export type Complaint = typeof complaints.$inferSelect;
export type InsertComplaint = z.infer<typeof insertComplaintSchema>;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
