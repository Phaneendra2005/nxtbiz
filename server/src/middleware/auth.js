import { HttpError } from "../utils/httpError.js";
import { accessCookieName, verifyAccessToken } from "../utils/tokens.js";
import { User } from "../models/User.js";

const getBearerToken = (req) => {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return null;
  }

  return header.slice("Bearer ".length);
};

export const authenticate = async (req, res, next) => {
  try {
    const token = getBearerToken(req) || req.cookies?.[accessCookieName];

    if (!token) {
      throw new HttpError(401, "Authentication required");
    }

    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub).select("-passwordHash -refreshTokenHash");

    if (!user || !user.active) {
      throw new HttpError(401, "Invalid or inactive user");
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(new HttpError(401, "Authentication required"));
  }
};

export const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    return next(new HttpError(401, "Authentication required"));
  }

  if (!roles.includes(req.user.role)) {
    return next(new HttpError(403, "Insufficient permissions"));
  }

  return next();
};
