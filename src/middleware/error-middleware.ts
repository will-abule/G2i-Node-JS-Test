import { NextFunction, Request, Response } from "express";
import winston from "winston";

export const errorMiddleWare = (
  err: any,
  _: Request,
  res: Response,
  next: NextFunction
) => {
  if (err.kind === "ObjectId") {
    console.log("error", err);

    res.status(400).send("invalid Id, must be an object id");
  } else {
    if (process.env.NODE_ENV !== "production") {
      console.log("Error Middleware: ", err);
    } else {
      //save error
      winston.error(err.message, err);
    }
  }
  next();
};
