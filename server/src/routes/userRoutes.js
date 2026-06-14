import bcrypt from "bcryptjs";
import express from "express";
import { z } from "zod";
import { authenticate, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { User, userRoles } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { HttpError } from "../utils/httpError.js";

export const userRouter = express.Router();

const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    role: z.enum(userRoles).default("Employee")
  })
});

const updateUserSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    role: z.enum(userRoles).optional(),
    active: z.boolean().optional()
  })
});

userRouter.use(authenticate);

userRouter.get(
  "/",
  authorize("Admin", "Manager"),
  asyncHandler(async (req, res) => {
    const users = await User.find().select("-passwordHash -refreshTokenHash").sort({ createdAt: -1 });
    res.json({ users });
  })
);

userRouter.post(
  "/",
  authorize("Admin"),
  validate(createUserSchema),
  asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.validated.body;
    const existing = await User.findOne({ email });

    if (existing) {
      throw new HttpError(409, "A user with this email already exists");
    }

    const user = await User.create({
      name,
      email,
      role,
      passwordHash: await bcrypt.hash(password, 12)
    });

    res.status(201).json({ user: await User.findById(user.id).select("-passwordHash -refreshTokenHash") });
  })
);

userRouter.put(
  "/:id",
  authorize("Admin", "Manager"),
  validate(updateUserSchema),
  asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.validated.body, {
      new: true,
      runValidators: true
    }).select("-passwordHash -refreshTokenHash");

    if (!user) {
      throw new HttpError(404, "User not found");
    }

    res.json({ user });
  })
);

userRouter.delete(
  "/:id",
  authorize("Admin"),
  asyncHandler(async (req, res) => {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      throw new HttpError(404, "User not found");
    }

    res.json({ message: "User deleted" });
  })
);
