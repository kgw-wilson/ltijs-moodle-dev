/*
 * Configure and validate environment variables for the backend.
 * These are private and should not be surfaced to users. This file
 * Defines schemas for each group of environment variables to keep
 * things organized. It then exports each variable individually so
 * importers do not need to know this grouping.
 */

import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

// Break schema into groups to keep things organized
const dbConfigSchema = z.object({
  GRADEBOTICS_DATABASE_HOST: z.string().min(1),
  GRADEBOTICS_DATABASE_NAME: z.string().min(1),
  GRADEBOTICS_DATABASE_USER: z.string().min(1),
  GRADEBOTICS_DATABASE_PASSWORD: z.string().min(1),
});

const apiConfigSchema = z.object({
  LTI_KEY: z.string(),
  MOODLE_URL: z.string().url(),
});

const serverConfigSchema = z.object({
  PORT: z.string().min(1),
});

// Parse each config group independently from process.env
const dbConfigResult = dbConfigSchema.safeParse(process.env);
const apiConfigResult = apiConfigSchema.safeParse(process.env);
const serverConfigResult = serverConfigSchema.safeParse(process.env);

const allResults = [dbConfigResult, apiConfigResult, serverConfigResult];

// If any failed, print combined error and exit
if (!allResults.every((r) => r.success)) {
  const formattedErrors = {
    dbConfig: dbConfigResult.success
      ? "No errors"
      : dbConfigResult.error.format(),
    apiConfig: apiConfigResult.success
      ? "No errors"
      : apiConfigResult.error.format(),
    serverConfig: serverConfigResult.success
      ? "No errors"
      : serverConfigResult.error.format(),
  };
  console.error("Error with backend env vars:", formattedErrors);
  process.exit(1);
}

// If all succeeded, destructure values and export them
// Ensure the data exists by checking `success` on each result first
export const {
  GRADEBOTICS_DATABASE_HOST,
  GRADEBOTICS_DATABASE_NAME,
  GRADEBOTICS_DATABASE_USER,
  GRADEBOTICS_DATABASE_PASSWORD,
} = dbConfigResult.success ? dbConfigResult.data : {};
export const { LTI_KEY, MOODLE_URL } = apiConfigResult.success
  ? apiConfigResult.data
  : {};
export const { PORT } = serverConfigResult.success
  ? serverConfigResult.data
  : {};
