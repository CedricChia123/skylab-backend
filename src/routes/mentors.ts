import { Router, Request, Response } from "express";
import { SkylabError } from "src/errors/SkylabError";
import {
  createMentorUser,
  getAllMentors,
  getMentorByEmail,
} from "src/models/mentors.db";
import { createManyMentorUsers } from "src/models/users.db";
import { HttpStatusCode } from "src/utils/HTTP_Status_Codes";

const router = Router();

router
  .get("/", async (_: Request, res: Response) => {
    try {
      const allMentors = await getAllMentors();
      res.status(HttpStatusCode.OK).json(allMentors);
    } catch (e) {
      if (!(e instanceof SkylabError)) {
        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send(e.message);
      } else {
        res.status(e.statusCode).send(e.message);
      }
    }
  })
  .post("/", async (req: Request, res: Response) => {
    if (!req.body.user || !req.body.user.email) {
      res
        .status(HttpStatusCode.BAD_REQUEST)
        .send("Arguments missing from request");
    }

    const userToCreate = req.body.user;

    try {
      await createMentorUser(userToCreate);
      res.sendStatus(200);
    } catch (e) {
      if (!(e instanceof SkylabError)) {
        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send(e.message);
      } else {
        res.status(e.statusCode).send(e.message);
      }
    }
  })
  .all("/", (_: Request, res: Response) => {
    res
      .status(HttpStatusCode.BAD_REQUEST)
      .send("Invalid method to access endpoint");
  });

router
  .get("/:email", async (req: Request, res: Response) => {
    const { email } = req.params;
    try {
      const mentorWithEmail = await getMentorByEmail(email);
      res.status(HttpStatusCode.OK).json(mentorWithEmail);
    } catch (e) {
      if (!(e instanceof SkylabError)) {
        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send(e.message);
      } else {
        res.status(e.statusCode).send(e.message);
      }
    }
  })
  .all("/:email", (_: Request, res: Response) => {
    res
      .status(HttpStatusCode.BAD_REQUEST)
      .send("Invalid method to access endpoint");
  });

router.post("/batch", async (req: Request, res: Response) => {
  if (!req.body.users) {
    res
      .status(HttpStatusCode.BAD_REQUEST)
      .send("Parameters missing from request");
  }

  const { users } = req.body;

  try {
    await createManyMentorUsers(users);
    res.sendStatus(HttpStatusCode.OK);
  } catch (e) {
    if (!(e instanceof SkylabError)) {
      res.status(HttpStatusCode.BAD_REQUEST).send(e.message);
    } else {
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send(e.message);
    }
  }
});

export default router;
