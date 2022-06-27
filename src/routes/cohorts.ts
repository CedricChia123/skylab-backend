import { Router, Request, Response } from "express";
import { SkylabError } from "src/errors/SkylabError";
import {
  deleteCohortByYear,
  editCohortByYear,
  getLatestCohort,
} from "src/helpers/cohorts.helper";
import { createCohort, getManyCohorts } from "src/models/cohorts.db";
import {
  apiResponseWrapper,
  routeErrorHandler,
} from "src/utils/ApiResponseWrapper";
import { HttpStatusCode } from "src/utils/HTTP_Status_Codes";

const router = Router();

router
  .get("/", async (_: Request, res: Response) => {
    try {
      const cohorts = await getManyCohorts({});
      return apiResponseWrapper(res, cohorts);
    } catch (e) {
      if (!(e instanceof SkylabError)) {
        return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send(e.message);
      } else {
        return res.status(e.statusCode).send(e.message);
      }
    }
  })
  .post("/", async (req: Request, res: Response) => {
    if (!req.body.cohort) {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .send("Parameters missing from request");
    }

    const { cohort } = req.body;

    if (!cohort.startDate || !cohort.endDate || !cohort.academicYear) {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .send("Parameters missing from request");
    }

    try {
      await createCohort(cohort);
      return res.sendStatus(HttpStatusCode.OK);
    } catch (e) {
      if (!(e instanceof SkylabError)) {
        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send(e.message);
      } else {
        res.status(e.statusCode).send(e.message);
      }
    }
  });

router
  .put("/:cohortYear", async (req: Request, res: Response) => {
    const { cohortYear } = req.params;

    if (!req.body.cohort) {
      return routeErrorHandler(
        res,
        new SkylabError(
          "Parameters missing from request body",
          HttpStatusCode.BAD_REQUEST
        )
      );
    }

    try {
      const editedCohort = await editCohortByYear(
        Number(cohortYear),
        req.body.cohort
      );
      return apiResponseWrapper(res, editedCohort);
    } catch (e) {
      return routeErrorHandler(res, e);
    }
  })
  .delete("/:cohortYear", async (req: Request, res: Response) => {
    const { cohortYear } = req.params;

    try {
      const deletedCohort = await deleteCohortByYear(Number(cohortYear));
      return apiResponseWrapper(res, deletedCohort);
    } catch (e) {
      return routeErrorHandler(res, e);
    }
  });

router
  .get("/latest", async (_: Request, res: Response) => {
    try {
      const latestCohort = await getLatestCohort();
      res.status(HttpStatusCode.OK).json(latestCohort);
    } catch (e) {
      if (!(e instanceof SkylabError)) {
        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send(e.message);
      } else {
        res.status(e.statusCode).send(e.message);
      }
    }
  })
  .all("/latest", (_: Request, res: Response) => {
    res
      .status(HttpStatusCode.BAD_REQUEST)
      .send("Invalid method to access endpoint");
  });

export default router;
