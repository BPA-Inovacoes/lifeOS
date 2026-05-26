import pinoHttp from "pino-http";

import { logger } from "../utils/logger";

export const httpLogger = pinoHttp({
  logger,
  genReqId: (req) => req.id,
  customProps: (req) => ({ requestId: req.id }),
  customSuccessMessage: (req, res) =>
    `${req.method} ${req.url} ${res.statusCode}`,
  customErrorMessage: (req, res) =>
    `${req.method} ${req.url} ${res.statusCode}`,
  autoLogging: {
    ignore: (req) => req.url === "/health",
  },
});
