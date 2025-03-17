import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const complaints = pgTable("complaints", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  location: text("location"),
  evidenceHash: text("evidence_hash").notNull(),
  status: text("status").notNull().default("pending"),
  walletAddress: text("wallet_address").notNull(),
  assignedTo: text("assigned_to"),
  donations: integer("donations").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  walletAddress: text("wallet_address").notNull().unique(),
  isLegalProfessional: boolean("is_legal_professional").default(false),
  tokens: integer("tokens").notNull().default(0),
  complaintsSubmitted: integer("complaints_submitted").notNull().default(0),
  casesResolved: integer("cases_resolved").notNull().default(0),
});

export const insertComplaintSchema = createInsertSchema(complaints).omit({ 
  id: true,
  createdAt: true,
  donations: true,
  assignedTo: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  tokens: true,
  complaintsSubmitted: true,
  casesResolved: true,
  isLegalProfessional: true,
});

export type Complaint = typeof complaints.$inferSelect;
export type InsertComplaint = z.infer<typeof insertComplaintSchema>;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;