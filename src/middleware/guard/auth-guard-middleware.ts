import { NextFunction, Request, Response } from "express";

export const authGuardMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("x-auth-token");
  return token === "authorized user"
    ? next()
    : res.status(401).send("Access denied, please provide a valid token");
};
