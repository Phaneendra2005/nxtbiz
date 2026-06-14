import dotenv from "dotenv";

dotenv.config();

const requiredInProduction = [
  "MONGODB_URI",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET"
];

const fallbackSecrets = {
  JWT_ACCESS_SECRET: "dev-only-nxtbiz-access-secret-change-me",
  JWT_REFRESH_SECRET: "dev-only-nxtbiz-refresh-secret-change-me"
};

const getEnv = (key, fallback = undefined) => process.env[key] ?? fallback;

export const env = {
  NODE_ENV: getEnv("NODE_ENV", "development"),
  PORT: Number(getEnv("PORT", 5000)),
  CLIENT_ORIGIN: getEnv("CLIENT_ORIGIN", "http://localhost:5173"),
  MONGODB_URI: getEnv("MONGODB_URI", ""),
  REDIS_URL: getEnv("REDIS_URL", ""),
  JWT_ACCESS_SECRET: getEnv("JWT_ACCESS_SECRET", fallbackSecrets.JWT_ACCESS_SECRET),
  JWT_REFRESH_SECRET: getEnv("JWT_REFRESH_SECRET", fallbackSecrets.JWT_REFRESH_SECRET),
  ACCESS_TOKEN_EXPIRES_IN: getEnv("ACCESS_TOKEN_EXPIRES_IN", "15m"),
  REFRESH_TOKEN_EXPIRES_IN: getEnv("REFRESH_TOKEN_EXPIRES_IN", "7d"),
  PDF_BASE_URL: getEnv("PDF_BASE_URL", "http://localhost:5000/pdfs"),
  EMAIL_FROM: getEnv("EMAIL_FROM", "operations@nxtbiz.local")
};

if (env.NODE_ENV === "production") {
  const missing = requiredInProduction.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing production environment variables: ${missing.join(", ")}`);
  }
}
