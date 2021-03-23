import { NextFunction, Response } from "express";
import { ExtendedRequestInterfaces } from "../utils/interface/extended-response-interfaces";

export const rerouteMiddleWare = (
  Req: any,
  _: Response,
  next: NextFunction
) => {
  // when users calls the acronym/:acronym endpoint passing in some special characters like "?" and "?4U" eg [1]"acronym/?" express treats it
  // as calling the root acronyms url "acronyms" and  "?" as if the user is passing query params. this call courses an issue and send a 404 err or 400.

  // The code below checks for urls like [1] and acts accordingly to produce the intended result.

  // so the logic in line: 19 converts the urls like [1] to [2]"acronym/redirect-?" or [3]"acronym/redirect-?4U" so acronym/:acronym endpoint picks it up
  // and acts accordingly to display the intended result.

  // An ideal way to a query prams like acronym/?acronym=the-acronym instead
  // of acronym/:acronyms to avoid this issue i recommend an update to the documentation reflect this suggestion or something else to avoid this error.

  const req: ExtendedRequestInterfaces = Req;

  if (
    req.url.includes("/acronym") &&
    (req.method === "GET" || req.method === "PUT" || req.method === "DELETE")
  ) {
    const check = req.url.split("=")[0] === "/acronym/";

    if (check || !req.url.split("=")[1]) {
      const url = check ? req.url.split("=") : req.url.split("/acronym/");

      const result = `/acronym/redirect-${check ? `=` : ""}${url[1]}`;

      req.url = result;
      req.originalUrl = result;
      req._parsedUrl.search = null;
      req._parsedUrl.query = null;
      req._parsedUrl.pathname = result;
      req._parsedUrl.path = result;
      req._parsedUrl.href = result;
      req._parsedUrl._raw = result;
    }
  }

  console.log(req.url);

  next();
};
