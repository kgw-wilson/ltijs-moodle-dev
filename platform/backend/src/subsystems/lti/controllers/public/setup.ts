import { Request, Response, NextFunction, Express } from "express";
import { Provider as ltiProvider, IdToken } from "ltijs";
import Database from "ltijs-sequelize";
import { ltiRoutes } from "shared-constants";
import {
  GRADEBOTICS_DATABASE_NAME,
  GRADEBOTICS_DATABASE_USER,
  GRADEBOTICS_DATABASE_PASSWORD,
  GRADEBOTICS_DATABASE_HOST,
  PORT,
} from "@/env-config";
import { router as ltiRouter } from "@/subsystems/lti/controllers/private/routes";

async function setupLti(app: Express): Promise<void> {
  const db = new Database(
    GRADEBOTICS_DATABASE_NAME,
    GRADEBOTICS_DATABASE_USER,
    GRADEBOTICS_DATABASE_PASSWORD,
    {
      host: GRADEBOTICS_DATABASE_HOST,
      dialect: "postgres",
      logging: true, // TODO: set to false in production
    },
  );

  ltiProvider.setup(
    process.env.LTI_KEY!,
    { plugin: db },
    {
      // Allows sharing of cookies between https domains, matching testing environment to production
      cookies: {
        secure: true,
        sameSite: "None",
      },
      dynRegRoute: "/register", // Setting up dynamic registration route. Defaults to "/register"
      dynReg: {
        url: "https://gradebotics.localhost" + ltiRoutes.API.BASE, // Tool Provider URL. Required field.
        name: "Gradebotics", // Tool Provider name. Required field.
        logo: "", // Tool Provider logo URL.
        description: "", // Tool Provider description.
        redirectUris: [], // Additional redirection URLs. The main URL is added by default.
        customParameters: {}, // Custom parameters.
        autoActivate: true, // Whether or not dynamically registered Platforms should be automatically activated. Defaults to false.
      },
    },
  );

  // Define behavior for when users attempt to setup deep linking (which is not supported).
  ltiProvider.onDeepLinking(
    (
      _token: IdToken,
      _req: Request,
      res: Response,
      _next: NextFunction,
    ): Response => {
      return ltiProvider.redirect(res, ltiRoutes.API.BASE + "/deeplink", {
        isNewResource: true,
      });
    },
  );

  // Redirect user to the frontend after a successful LTI launch (when our tool is opened within the LMS).
  ltiProvider.onConnect((_token: IdToken, _req: Request, res: Response) => {
    ltiProvider.redirect(res, ltiRoutes.FRONTEND.LAUNCH, {
      isNewResource: true,
      ignoreRoot: true,
    });
  });

  // Handle unsuccessful LTI launches (e.g., due to missing cookies or session).
  ltiProvider.onInvalidToken((_req: Request, res: Response) => {
    res.status(403).send(`
            <div style="font-family: sans-serif; padding: 1rem;">
                <h2>LTI Launch Failed</h2>
                <p>We couldn't open our application. Please make sure third-party cookies are enabled in your browser.</p>
                <p>Try enabling cookies (or using a different browser) and then refresh this page.</p>
            </div>
        `);
  });

  // Handle dynamic registration when an LMS attempts to register this tool as an external plugin
  // via https://gradebotics.localhost/lti-api/register.
  ltiProvider.onDynamicRegistration(
    async (req: Request, res: Response, _next: NextFunction) => {
      console.info("Dynamic registration request received.");
      try {
        if (!req.query.openid_configuration) {
          res
            .status(400)
            .send({
              status: 400,
              error: "Bad Request",
              details: {
                message: "Missing parameter: 'openid_configuration'.",
              },
            });
        } else {
          const message = await ltiProvider.DynamicRegistration.register(
            req.query.openid_configuration,
            req.query.registration_token,
          );
          res.setHeader("Content-type", "text/html");
          res.send(message);
        }
      } catch (err: any) {
        if (err.message === "PLATFORM_ALREADY_REGISTERED")
          return res
            .status(403)
            .send({
              status: 403,
              error: "Forbidden",
              details: { message: "Platform already registered." },
            });
        return res
          .status(500)
          .send({
            status: 500,
            error: "Internal Server Error",
            details: { message: err.message },
          });
      }
    },
  );

  // Deploy the LTI provider in serverless mode to use the existing express app.
  await ltiProvider.deploy({
    serverless: true,
    port: parseInt(PORT!),
    // TODO: silent: isDevelopment,
  });

  // Mount the LTI router into the LTI provider so that the provider handles auth for those routes.
  ltiProvider.app.use(ltiRouter);

  // Mount the LTI app to the main app last so that the provider is completely setup before being used.
  app.use(ltiRoutes.API.BASE, ltiProvider.app);

  console.info("LTI Provider deployed!");
}

export { setupLti };
