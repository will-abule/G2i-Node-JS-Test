import {
  Acronym,
  validateAcronym,
  validateAcronymForUpdate,
} from "../models/acronym-model";
import { isEmpty } from "../utils/functions/empty-object-function";
import getResReq, {
  QueryInterface,
} from "mongodb-collection-query-with-mongoose";
import { acronymSelect } from "../utils/functions/select-functions";
import { Request, Response, Router } from "express";
import { authGuardMiddleware } from "../middleware/guard/auth-guard-middleware";
import mongoose from "mongoose";
import { AcronymInterface } from "../utils/interface/acronym-interface";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  if (!req.query.limit)
    return res
      .status(400)
      .send(
        `No 'limit' was Found! please add a limit to the query params its required`
      );

  if (!req.query.from)
    return res
      .status(400)
      .send(
        `No 'from' was Found! please add a from to the query params its required`
      );

  if (!req.query.search)
    return res
      .status(400)
      .send(
        `No 'search' was Found! please add a search to the query params its required`
      );

  const query: QueryInterface = {
    filter: req?.query?.search ? true : false,
    sort: "asc",
    sortName: "definition",
    pageSize: Number(req.query.limit),
    pageNumber: Number(req.query.from),
    ...(req?.query?.search && {
      searchFilters: JSON.stringify({
        searchOption: "OR",
        rules: [
          {
            field: "definition",
            option: "cn",
            type: "string",
            data: req.query.search,
          },
        ],
      }),
    }),
  };

  const response = await Promise.all([
    getResReq(query, Acronym, acronymSelect),
  ]);

  const { data, type, msg, status } = response[0];

  if (type === "error")
    return res
      .status(status)
      .send({ message: `internal server error`, error: msg });

  res.set({
    "page-size": data?.pageSize,
    "page-number": data?.pageNumber,
    "total-pages": data?.total,
    "total-records": data?.records,
  });

  return res.send(data?.data);
});

router.get("/:acronym", async (req: Request, res: Response) => {
  // some acronym are repeated in the data set eg AF, BB, etc, in other to ensure we're send the intend result we have to return all for the user to select
  // the one best suited for their needs, that is why the acronym has a dual type of AcronymInterface | AcronymInterface[] though the instruction indented a
  // a single acronym. FRefactoring the data set or specifying abnormality is useful in feature updates

  let acronym: AcronymInterface | AcronymInterface[];

  restructureParams(req);

  // since i'm using a live database users my want to get a single acronym using the _id field. This code below check the req.params.acronym to see if it's a
  // mongoDB ObjectId or an acronym and acts accordingly

  if (mongoose.Types.ObjectId.isValid(req.params.acronym)) {
    acronym = await Acronym.findById(req.params.acronym).select(acronymSelect);

    if (!acronym)
      return res
        .status(404)
        .send(
          `No Acronym with this '${req.params.acronym}' was Found! please make sure you're sending the correct id`
        );
  } else {
    acronym = await Acronym.find({ acronym: req.params.acronym }).select(
      acronymSelect
    );
  }

  // response to client

  if (Array.isArray(acronym) && acronym.length === 0) {
    return res
      .status(404)
      .send(
        `No Acronym with this '${req.params.acronym}' was Found! please make sure you're sending the correct acronym`
      );
  } else if (Array.isArray(acronym) && acronym.length === 1) {
    return res.send(acronym[0]);
  } else {
    return res.send(acronym);
  }
});

// suggestion route for adding acronym should be more descriptive like /add or /create
router.post("/", async (req: Request, res: Response) => {
  const empty = isEmpty(req.body);

  if (empty) return res.status(400).send("request body not provide!");

  // validating request body for requirements

  const { error } = validateAcronym(req.body);

  if (error) return res.status(400).send(error.details[0].message);

  const acronym = new Acronym(req.body);

  const result = await acronym.save();

  return res.send(result);
});

// suggestion route for updating acronym should be more descriptive like /update/:acronym

router.put(
  "/:acronym",
  authGuardMiddleware,
  async (req: Request, res: Response) => {
    const empty = isEmpty(req.body);

    if (empty) return res.status(400).send("request body not provide!");

    if (req.body._id) delete req.body._id;

    const { error } = validateAcronymForUpdate(req.body);

    if (error) return res.status(400).send(error.details[0].message);

    restructureParams(req);

    if (mongoose.Types.ObjectId.isValid(req.params.acronym)) {
      const acronym: AcronymInterface = await Acronym.findById(
        req.params.acronym
      ).select(acronymSelect);

      if (!acronym)
        return res
          .status(404)
          .send(
            `No Acronym with this '${req.params.acronym}' was Found! please make sure you're sending the correct id`
          );

      const result = await Acronym.findByIdAndUpdate(acronym._id, {
        $set: req.body,
      });

      return res.send(result);
    } else {
      const acronym: AcronymInterface[] = await Acronym.find({
        acronym: req.params.acronym,
      }).select(acronymSelect);

      if (acronym.length > 1) {
        return res.status(400).send({
          message: `There're more than one Acronym with this acronym '${req.params.acronym}', check the data response of this request to check and use the _id of the acronym instead of the acronym '${req.params.acronym}'`,
          data: acronym,
        });
      } else if (acronym.length === 0) {
        return res
          .status(404)
          .send(
            `No Acronym with this '${req.params.acronym}' was Found! please make sure you're sending the correct acronym`
          );
      } else {
        const result = await Acronym.findByIdAndUpdate(acronym[0]._id, {
          $set: req.body,
        });

        return res.send({ ...result._doc, ...req.body });
      }
    }
  }
);

// suggestion route for deleting acronym should be more descriptive like /delete/:acronym
router.delete(
  "/:acronym",
  authGuardMiddleware,
  async (req: Request, res: Response) => {
    // finding and Deleting

    restructureParams(req);

    if (mongoose.Types.ObjectId.isValid(req.params.acronym)) {
      const acronym: AcronymInterface = await Acronym.findById(
        req.params.acronym
      ).select(acronymSelect);

      if (!acronym)
        return res
          .status(404)
          .send(
            `No Acronym with this '${req.params.acronym}' was Found! please make sure you're sending the correct id`
          );

      const result = await Acronym.findByIdAndDelete(acronym._id);

      return res.send(result);
    } else {
      const acronym: AcronymInterface[] = await Acronym.find({
        acronym: req.params.acronym,
      }).select(acronymSelect);

      if (acronym.length > 1) {
        return res.status(400).send({
          message: `There're more than one Acronym with this acronym '${req.params.acronym}', check the data response of this request to check and use the _id of the acronym instead of the acronym '${req.params.acronym}'`,
          data: acronym,
        });
      } else if (acronym.length === 0) {
        return res
          .status(404)
          .send(
            `No Acronym with this '${req.params.acronym}' was Found! please make sure you're sending the correct acronym`
          );
      } else {
        const result = await Acronym.findByIdAndDelete(acronym[0]._id);

        return res.send(result);
      }
    }
  }
);

function restructureParams(req: Request) {
  // removing redirect- added by rerouteMiddleWare and setting the proper acronym as req.params.acronym
  req.params.acronym =
    req.url.split("redirect-").length > 0
      ? req.url.split("redirect-")[1]
      : req.params.acronym;
}

export const acronymRoute = router;
