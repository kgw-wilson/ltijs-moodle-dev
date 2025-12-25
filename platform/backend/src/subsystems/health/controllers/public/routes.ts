import { Router, Request, Response } from "express";

const router: Router = Router();

router.get("/ping", (_req: Request, res: Response) => {
  res.status(200).send("pong");
});

export { router };
