import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";
import { z } from "zod";
import { getDb } from "../db/database";
import { ApiError } from "../middleware/errorHandler";
import { authRateLimiter } from "../middleware/rateLimit.middleware";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth.middleware";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || "insecure_dev_secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS || 10);

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1),
  role: z.enum(["investor", "ceo", "student", "admin"]).default("investor"),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function signToken(user: { id: string; email: string; role: string }) {
  return jwt.sign(user, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
}

router.post("/register", authRateLimiter, async (req, res, next) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues.map((i) => i.message).join(", "));
    }
    const { email, password, name, role } = parsed.data;

    const db = getDb();
    await db.read();

    if (db.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new ApiError(409, "An account with this email already exists");
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = {
      id: uuid(),
      email,
      passwordHash,
      name,
      role,
      createdAt: new Date().toISOString(),
    };

    db.data.users.push(user);
    await db.write();

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (err) {
    next(err);
  }
});

router.post("/login", authRateLimiter, async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, "Invalid email or password format");
    }
    const { email, password } = parsed.data;

    const db = getDb();
    await db.read();
    const user = db.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) throw new ApiError(401, "Invalid credentials");

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new ApiError(401, "Invalid credentials");

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (err) {
    next(err);
  }
});

router.get("/me", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const db = getDb();
    await db.read();
    const user = db.data.users.find((u) => u.id === req.user!.id);
    if (!user) throw new ApiError(404, "User not found");
    res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
  } catch (err) {
    next(err);
  }
});

export default router;
