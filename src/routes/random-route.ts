import { Acronym } from "../models/acronym-model";
import { Request, Response, Router } from "express";
const router = Router();

router.get("/:count", async (req: Request, res: Response) => {
  const randomAcronym = await Acronym.aggregate([
    { $sample: { size: parseInt(req.params.count) } },
  ]);

  return res.send(randomAcronym);
});

export const randomRoute = router;
