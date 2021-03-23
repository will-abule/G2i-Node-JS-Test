import { Express, Response } from "express";
import helmet from "helmet";
import compression from "compression";
import joi from "joi";
import cors from "cors";
import { routes } from "./routes";
import { logger } from "../startup/logging";
import { populateDB } from "../utils/functions/populate-db-functions";

// @ts-ignore
import objectId from "joi-objectid";
//

export async function init(app: Express) {
  app.use(
    cors({
      exposedHeaders: [
        "page-size",
        "page-number",
        "total-pages",
        "total-records",
      ],
    })
  );
  app.use(helmet());
  app.use(compression());

  await populateDB();

  objectId(joi);
  logger();
  routes(app);

  app.get("/", function (_, res: Response) {
    res.status(200).send("Welcome to Will Abule G2i NodeJS Test!");
  });
}
