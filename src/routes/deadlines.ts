import { Request, Response, Router } from "express";
import { SkylabError } from "src/errors/SkylabError";
import {
  createDeadline,
  deleteOneDeadlineByDeadlineId,
  editDeadlineByDeadlineId,
  getManyDeadlinesWithFilter,
  getOneDeadlineById,
  getQuestionsOfDeadlineById,
  replaceQuestionsById,
} from "src/helpers/deadline.helper";
import {
  apiResponseWrapper,
  routeErrorHandler,
} from "src/utils/ApiResponseWrapper";
import { HttpStatusCode } from "src/utils/HTTP_Status_Codes";
import {
  CreateDeadlineValidator,
  GetDeadlinesValidator,
} from "src/validators/deadline.validator";

const router = Router();

router
  .get("/", GetDeadlinesValidator, async (req: Request, res: Response) => {
    try {
      const deadlines = await getManyDeadlinesWithFilter(req.query);
      return apiResponseWrapper(res, { deadlines: deadlines });
    } catch (e) {
      return routeErrorHandler(res, e);
    }
  })
  .post("/", CreateDeadlineValidator, async (req: Request, res: Response) => {
    try {
      const createdDeadline = await createDeadline(req.body);
      return apiResponseWrapper(res, { deadline: createdDeadline });
    } catch (e) {
      return routeErrorHandler(res, e);
    }
  })
  .all("/", (_: Request, res: Response) => {
    return routeErrorHandler(
      res,
      new SkylabError(
        "Invalid method to access endpoint",
        HttpStatusCode.BAD_REQUEST
      )
    );
  });

router
  .get("/:deadlineId/questions", async (req: Request, res: Response) => {
    const { deadlineId } = req.params;
    try {
      const deadlineWithQuestions = await getQuestionsOfDeadlineById(
        Number(deadlineId)
      );
      return apiResponseWrapper(res, deadlineWithQuestions);
    } catch (e) {
      return routeErrorHandler(res, e);
    }
  })
  .put("/:deadlineId/questions", async (req: Request, res: Response) => {
    const { deadlineId } = req.params;
    try {
      const updatedDeadline = await replaceQuestionsById(
        Number(deadlineId),
        req.body.questions
      );
      return apiResponseWrapper(res, { deadline: updatedDeadline });
    } catch (e) {
      return routeErrorHandler(res, e);
    }
  });

router
  .get("/:deadlineId", async (req: Request, res: Response) => {
    const { deadlineId } = req.params;
    try {
      const deadlineWithId = await getOneDeadlineById(Number(deadlineId));
      return apiResponseWrapper(res, { deadline: deadlineWithId });
    } catch (e) {
      return routeErrorHandler(res, e);
    }
  })
  .put("/:deadlineId", async (req: Request, res: Response) => {
    const { deadlineId } = req.params;
    try {
      const updatedDeadline = await editDeadlineByDeadlineId(
        Number(deadlineId),
        req.body
      );
      return apiResponseWrapper(res, { deadline: updatedDeadline });
    } catch (e) {
      return routeErrorHandler(res, e);
    }
  })
  .delete("/:deadlineId", async (req: Request, res: Response) => {
    const { deadlineId } = req.params;
    try {
      const deletedDeadline = await deleteOneDeadlineByDeadlineId(
        Number(deadlineId)
      );
      return apiResponseWrapper(res, { deadline: deletedDeadline });
    } catch (e) {
      return routeErrorHandler(res, e);
    }
  })
  .all("/:deadlineId", (_: Request, res: Response) => {
    return routeErrorHandler(
      res,
      new SkylabError(
        "Invalid method to access endpoint",
        HttpStatusCode.BAD_REQUEST
      )
    );
  });

export default router;
