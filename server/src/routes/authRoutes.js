import bcrypt from "bcryptjs";
import express from "express";
import { z } from "zod";
import { User, userRoles } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { HttpError } from "../utils/httpError.js";
import {
  clearAuthCookies,
  hashToken,
  refreshCookieName,
  setAuthCookies,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken
} from "../utils/tokens.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

export const authRouter = express.Router();

const authUserProjection = "-passwordHash -refreshTokenHash";

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    role: z.enum(userRoles).optional()
  })
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1)
  })
});

const issueSession = async (res, user) => {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  user.refreshTokenHash = hashToken(refreshToken);
  user.lastLoginAt = new Date();
  await user.save();

  setAuthCookies(res, { accessToken, refreshToken });

  return {
    accessToken,
    user: await User.findById(user.id).select(authUserProjection)
  };
};

authRouter.post(
  "/register",
  validate(registerSchema),
  asyncHandler(async (req, res) => {
    const { name, email, password, role = "Employee" } = req.validated.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new HttpError(409, "A user with this email already exists");
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email,
      passwordHash,
      role
    });

    const session = await issueSession(res, user);
    res.status(201).json(session);
  })
);

authRouter.post(
  "/login",
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.validated.body;
    const user = await User.findOne({ email });

    if (!user || !user.active) {
      throw new HttpError(401, "Invalid credentials");
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      throw new HttpError(401, "Invalid credentials");
    }

    const session = await issueSession(res, user);
    res.json(session);
  })
);

authRouter.post(
  "/refresh",
  asyncHandler(async (req, res) => {
    const refreshToken = req.cookies?.[refreshCookieName] || req.body?.refreshToken;

    if (!refreshToken) {
      throw new HttpError(401, "Refresh token required");
    }

    const payload = verifyRefreshToken(refreshToken);

    if (payload.tokenType !== "refresh") {
      throw new HttpError(401, "Invalid refresh token");
    }

    const user = await User.findById(payload.sub);

    if (!user || !user.active || user.refreshTokenHash !== hashToken(refreshToken)) {
      throw new HttpError(401, "Invalid refresh token");
    }

    const session = await issueSession(res, user);
    res.json(session);
  })
);

authRouter.post(
  "/logout",
  authenticate,
  asyncHandler(async (req, res) => {
    await User.updateOne({ _id: req.user.id }, { $set: { refreshTokenHash: null } });
    clearAuthCookies(res);
    res.json({ message: "Logged out" });
  })
);

authRouter.get(
  "/me",
  authenticate,
  asyncHandler(async (req, res) => {
    res.json({ user: req.user });
  })
);
