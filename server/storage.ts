import { complaints, users, type Complaint, type InsertComplaint, type User, type InsertUser } from "@shared/schema";

export interface IStorage {
  // Complaints
  getComplaints(): Promise<Complaint[]>;
  getComplaint(id: number): Promise<Complaint | undefined>;
  createComplaint(complaint: InsertComplaint): Promise<Complaint>;
  updateComplaintStatus(id: number, status: string): Promise<Complaint | undefined>;
  addDonation(id: number, amount: number): Promise<Complaint | undefined>;

  // Users
  getUser(walletAddress: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserTokens(walletAddress: string, amount: number): Promise<User | undefined>;
  updateUserStats(walletAddress: string, stats: Partial<User>): Promise<User | undefined>;
  getLeaderboard(): Promise<User[]>;
}

export class MemStorage implements IStorage {
  private complaints: Map<number, Complaint>;
  private users: Map<string, User>;
  private complaintId: number;

  constructor() {
    this.complaints = new Map();
    this.users = new Map();
    this.complaintId = 1;
  }

  async getComplaints(): Promise<Complaint[]> {
    return Array.from(this.complaints.values());
  }

  async getComplaint(id: number): Promise<Complaint | undefined> {
    return this.complaints.get(id);
  }

  async createComplaint(complaint: InsertComplaint): Promise<Complaint> {
    const id = this.complaintId++;
    const newComplaint: Complaint = {
      ...complaint,
      id,
      status: "pending",
      donations: 0,
      createdAt: new Date(),
    };
    this.complaints.set(id, newComplaint);
    return newComplaint;
  }

  async updateComplaintStatus(id: number, status: string): Promise<Complaint | undefined> {
    const complaint = this.complaints.get(id);
    if (!complaint) return undefined;

    const updated = { ...complaint, status };
    this.complaints.set(id, updated);
    return updated;
  }

  async addDonation(id: number, amount: number): Promise<Complaint | undefined> {
    const complaint = this.complaints.get(id);
    if (!complaint) return undefined;

    const updated = { ...complaint, donations: complaint.donations + amount };
    this.complaints.set(id, updated);
    return updated;
  }

  async getUser(walletAddress: string): Promise<User | undefined> {
    return this.users.get(walletAddress);
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser: User = {
      id: this.users.size + 1,
      ...user,
      tokens: 0,
      complaintsSubmitted: 0,
      casesResolved: 0,
      isLegalProfessional: false,
    };
    this.users.set(user.walletAddress, newUser);
    return newUser;
  }

  async updateUserTokens(walletAddress: string, amount: number): Promise<User | undefined> {
    const user = this.users.get(walletAddress);
    if (!user) return undefined;

    const updated = { ...user, tokens: user.tokens + amount };
    this.users.set(walletAddress, updated);
    return updated;
  }

  async updateUserStats(walletAddress: string, stats: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(walletAddress);
    if (!user) return undefined;

    const updated = { ...user, ...stats };
    this.users.set(walletAddress, updated);
    return updated;
  }

  async getLeaderboard(): Promise<User[]> {
    return Array.from(this.users.values())
      .sort((a, b) => b.tokens - a.tokens)
      .slice(0, 10);
  }
}

export const storage = new MemStorage();