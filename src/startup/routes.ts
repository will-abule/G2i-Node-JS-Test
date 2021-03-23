import { errorMiddleWare } from "./../middleware/error-middleware";
import { Express } from "express";
import { acronymRoute } from "../routes/acronym-route";
import { randomRoute } from "../routes/random-route";
import { rerouteMiddleWare } from "../middleware/reroute-middleware";

export const routes = async (app: Express) => {
  app.use(rerouteMiddleWare);

  app.use("/acronym", acronymRoute);
  app.use("/random", randomRoute);

  app.use(errorMiddleWare);
};
