import { Request, Response, Router } from "express";
import { Provider as lti, IdToken } from "ltijs";
import { ltiRoutes } from "shared-constants";
import { LaunchInfo } from "shared-models";
import { handleGradeSubmission } from "@/subsystems/lti/services/private/grades";

const router: Router = Router();

router.post("/grade", async (req: Request, res: Response) => {
    try {
        const idtoken = res.locals.token as IdToken;
        const score: number = req.body.grade;
        const responseGrade = await handleGradeSubmission(lti, idtoken, score);
        res.send(responseGrade);
    } catch (err: any) {
        console.error(err.message);
        res.status(500).send({ err: err.message });
    }
});

router.get("/members", async (_req: Request, res: Response) => {
    try {
        const result = await lti.NamesAndRoles.getMembers(
            res.locals.token as IdToken,
        );
        if (result) {
            res.send(result.members);
        } else {
            res.sendStatus(500);
        }
    } catch (err: any) {
        console.error(err.message);
        res.status(500).send(err.message);
    }
});

router.get("/deeplink", (_req: Request, res: Response) => {
    const deeplinkingMessage = `<div style="font-family: sans-serif; padding: 1rem">
        <h2>Deep Linking Not Supported</h2>
        <p>This tool doesn't support content selection via deep linking.</p>
        <p>To use this tool, please add it as an External Tool at the course or module level without trying to select specific content.</p>
    </div>`;
    res.status(400).send(deeplinkingMessage);
});

router.get(ltiRoutes.API.INFO_SUFFIX, (_req: Request, res: Response) => {
    try {
        const token = res.locals.token;
        const context = res.locals.context;

        const info = new LaunchInfo({
            name: token.userInfo?.name,
            email: token.userInfo?.email,
            roles: context?.roles,
            context: context?.context,
        });

        res.send(info.toJSON());
    } catch (err: any) {
        console.error("Launch info validation failed:", err.message);
        res.status(400).send({ error: "Invalid request for launch info." });
    }
});

export { router };



