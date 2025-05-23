import type { Express } from "express";
import { createServer } from "http";
import { openai, isOpenAIAvailable } from "./services/openai";
import { storage } from "./storage";
import { insertComplaintSchema, insertUserSchema, type InsertComplaint } from "@shared/schema";
import { validateLegalComplaint } from "./services/validation";

export async function registerRoutes(app: Express) {
  const httpServer = createServer(app);

  // Get all complaints
  app.get("/api/complaints", async (_req, res) => {
    const complaints = await storage.getComplaints();
    res.json(complaints);
  });

  // Submit new complaint
  app.post("/api/complaints", async (req, res) => {
    const result = insertComplaintSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ 
        message: "Invalid complaint data",
        errors: result.error.errors 
      });
    }

    let complaint;
    try {
      if (result.data.type === 'legal') {
        // Validate the complaint using AI for legal complaints
        const validation = await validateLegalComplaint(
          result.data.title,
          result.data.description,
          result.data.category
        );

        if (!validation.isValid) {
          return res.status(400).json({ 
            message: "Invalid legal complaint",
            reason: validation.reason
          });
        }

        // Create the complaint with validated data
        // Type cast to allow additional fields beyond the insert schema
        const complaintData = {
          ...result.data,
          urgency: validation.suggestedUrgency || "medium",
          privacy: validation.suggestedPrivacy || result.data.privacy || "public"
        } as InsertComplaint & { aiAnalysis?: string };
        
        if (validation.analysis) {
          complaintData.aiAnalysis = validation.analysis;
        }
        
        complaint = await storage.createComplaint(complaintData);
      } else {
        // For community complaints, create without validation
        complaint = await storage.createComplaint(result.data);
      }

      // Update user tokens and complaints submitted count
      const user = await storage.getUser(result.data.walletAddress);
      if (user) {
        await storage.updateUserTokens(result.data.walletAddress, 10);
        await storage.updateUserStats(result.data.walletAddress, {
          complaintsSubmitted: user.complaintsSubmitted + 1
        });
      }

      res.json(complaint);
    } catch (error) {
        console.error('Error submitting complaint:', error);
        res.status(500).json({ message: "Failed to submit complaint" });
    }
  });

  // Get or create user
  app.post("/api/users", async (req, res) => {
    const result = insertUserSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid user data" });
    }

    let user = await storage.getUser(result.data.walletAddress);
    if (!user) {
      user = await storage.createUser(result.data);
    }
    res.json(user);
  });

  // Get user by wallet address
  app.get("/api/users/:address", async (req, res) => {
    const user = await storage.getUser(req.params.address);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  });

  // Get leaderboard
  app.get("/api/leaderboard", async (_req, res) => {
    const users = await storage.getLeaderboard();
    res.json(users);
  });

  // Update complaint status
  app.patch("/api/complaints/:id/status", async (req, res) => {
    const { status } = req.body;
    if (typeof status !== "string") {
      return res.status(400).json({ message: "Invalid status" });
    }

    const complaint = await storage.updateComplaintStatus(parseInt(req.params.id), status);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }
    res.json(complaint);
  });

  // Add donation to complaint
  app.post("/api/complaints/:id/donate", async (req, res) => {
    const { amount, walletAddress } = req.body;

    if (typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({ message: "Invalid donation amount" });
    }

    const complaint = await storage.addDonation(parseInt(req.params.id), amount);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    await storage.updateUserTokens(walletAddress, -amount);
    res.json(complaint);
  });

  // AI Chat endpoint - properly separated from donation endpoint
  app.post("/api/chat", async (req, res) => {
    const { message } = req.body;
    
    // Check if OpenAI is available
    if (!isOpenAIAvailable()) {
      return res.json({ 
        message: "AI chat is not available in development mode. Please add your OpenAI API key to the .env file."
      });
    }
    
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are a helpful assistant for CivicChain, a platform for submitting and managing community complaints and legal issues. 
            Key features include:
            - Submit community issues or legal complaints
            - Track complaint status
            - Earn tokens for participation
            - Donate tokens to support causes
            - Community leaderboard
            
            Keep responses concise and friendly. Guide users on how to use the platform effectively.`
          },
          { role: "user", content: message }
        ]
      });

      const content = response.choices[0].message.content || "I'm sorry, I couldn't process that request.";
      res.json({ message: content });
    } catch (error) {
      console.error('Chat error:', error);
      res.status(500).json({ message: "Failed to process chat message" });
    }
  });

  return httpServer;
} 