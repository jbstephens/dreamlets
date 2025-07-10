import bcrypt from "bcrypt";
import type { Express, RequestHandler } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

// Simple session configuration
export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  });
}

// Simple authentication middleware
export const isAuthenticated: RequestHandler = async (req: any, res, next) => {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  // Add user data to request
  const user = await storage.getUser(req.session.userId);
  if (!user) {
    req.session.userId = null;
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  req.user = user;
  next();
};

export async function setupSimpleAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());

  // Register endpoint
  app.post("/api/auth/register", async (req: any, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);
      
      // Create user
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        firstName: firstName || null,
        lastName: lastName || null,
      });
      
      // Migrate guest data if it exists
      const guestData = {
        kids: req.session.guestKids,
        characters: req.session.guestCharacters,
        stories: req.session.guestStories
      };
      
      if (guestData.kids?.length > 0 || guestData.characters?.length > 0 || guestData.stories?.length > 0) {
        console.log("=== MIGRATING GUEST DATA ON REGISTRATION ===");
        console.log("Guest data:", guestData);
        
        try {
          await storage.migrateGuestDataToUser(user.id, guestData);
          
          // Clear guest data after successful migration
          delete req.session.guestKids;
          delete req.session.guestCharacters;
          delete req.session.guestStories;
          
          console.log("Guest data migration completed during registration");
        } catch (error) {
          console.error("Failed to migrate guest data during registration:", error);
        }
      }
      
      // Log in the user
      req.session.userId = user.id;
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Failed to create account" });
    }
  });

  // Login endpoint
  app.post("/api/auth/login", async (req: any, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      
      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Log in the user
      req.session.userId = user.id;
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Failed to log in" });
    }
  });

  // Get current user
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const { password: _, ...userWithoutPassword } = req.user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req: any, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Failed to log out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });
}