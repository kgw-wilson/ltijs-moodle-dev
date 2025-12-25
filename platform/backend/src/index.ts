import path from "path";
import express, { Express, Request, Response } from "express";
import { ltiRoutes } from "shared-constants";
import { PORT } from "@/env-config";
import { router as healthRouter } from "@/subsystems/health/controllers/public/routes";
import { setupLti } from "@/subsystems/lti/controllers/public/setup";

const app: Express = express();

const API_BASE_ROUTE = "/api";

app.use(express.static(path.join(__dirname, "../../../frontend/dist")));

app.use(API_BASE_ROUTE + "/health", healthRouter);

// LTI setup mounts its own routes onto the existing app
async function initializeLti() {
  try {
    await setupLti(app);
  } catch (err) {
    console.error("Failed to initialize LTI:", err);
    process.exit(1);
  }
}

initializeLti();

// Serve React app for non-API and non-LTI routes
app.get(
  new RegExp(`^(?!${API_BASE_ROUTE}|${ltiRoutes.API.BASE}).*$`),
  (_req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "../../../frontend/dist/index.html"));
  },
);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export { app };
