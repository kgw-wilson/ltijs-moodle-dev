// This is the convention for LTI tools.
const LTI_API_BASE = "/lti";

export const ltiRoutes = {
  FRONTEND: {
    LAUNCH: "/launch",
  },
  API: {
    BASE: LTI_API_BASE,
    INFO_SUFFIX: "/info",
    INFO_FULL: `${LTI_API_BASE}/info`,
  },
};
