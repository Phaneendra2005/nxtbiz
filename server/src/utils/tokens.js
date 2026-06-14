import crypto from "crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const accessCookieName = "nxtbiz_access";
export const refreshCookieName = "nxtbiz_refresh";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: env.NODE_ENV === "production"
};

export const signAccessToken = (user) =>
  jwt.sign(
    {
      sub: user.id,
      role: user.role,
      email: user.email
    },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.ACCESS_TOKEN_EXPIRES_IN }
  );

export const signRefreshToken = (user) =>
  jwt.sign(
    {
      sub: user.id,
      tokenType: "refresh"
    },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.REFRESH_TOKEN_EXPIRES_IN }
  );

export const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

export const verifyAccessToken = (token) => jwt.verify(token, env.JWT_ACCESS_SECRET);

export const verifyRefreshToken = (token) => jwt.verify(token, env.JWT_REFRESH_SECRET);

export const setAuthCookies = (res, { accessToken, refreshToken }) => {
  res.cookie(accessCookieName, accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000
  });
  res.cookie(refreshCookieName, refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
};

export const clearAuthCookies = (res) => {
  res.clearCookie(accessCookieName, cookieOptions);
  res.clearCookie(refreshCookieName, cookieOptions);
};
