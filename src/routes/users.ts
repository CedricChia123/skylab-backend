import { Router, Request, Response } from "express";
import { SkylabError } from "src/errors/SkylabError";
import {
  getAllUsers,
  getUserByEmail,
  deleteUserByEmail,
  updateUserByEmail,
  hashPassword,
  userLogin,
} from "src/helpers/users.helper";
import authorize from "src/middleware/jwtAuth";

import { HttpStatusCode } from "src/utils/HTTP_Status_Codes";

const router = Router();

router
  .get("/", async (_: Request, res: Response) => {
    try {
      const allUsers = await getAllUsers();
      res.status(HttpStatusCode.OK).json(allUsers);
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
  .get("/:email", authorize, async (req: Request, res: Response) => {
    try {
      if (!req.params.email) {
        res
          .status(HttpStatusCode.BAD_REQUEST)
          .send("Arguments missing from request");
      }

      const email = req.params.email;
      const user = await getUserByEmail(email);
      res.status(HttpStatusCode.OK).json(user);
    } catch (e) {
      if (!(e instanceof SkylabError)) {
        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send(e.message);
      } else {
        res.status(e.statusCode).send(e.message);
      }
    }
  })
  .post("/:email", async (req: Request, res: Response) => {
    try {
      if (!req.params.email || !req.body.password) {
        res
          .status(HttpStatusCode.BAD_REQUEST)
          .send("Missing request parameters");
      }

      const email = req.params.email;
      const password = req.body.password;
      const { token } = await userLogin(email, password);
      if (token) {
        res
          .status(HttpStatusCode.OK)
          .cookie("token", token, { httpOnly: true })
          .json({ email });
      } else {
        res.status(HttpStatusCode.UNAUTHORIZED).send("Password is incorrect");
      }
    } catch (e) {
      if (!(e instanceof SkylabError)) {
        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send(e.message);
      } else {
        res.status(e.statusCode).send(e.message);
      }
    }
  })
  .delete("/:email", async (req: Request, res: Response) => {
    try {
      if (!req.params.email) {
        res
          .status(HttpStatusCode.BAD_REQUEST)
          .send("Missing request parameters");
      }

      const email = req.params.email;
      await deleteUserByEmail(email);
      res.sendStatus(HttpStatusCode.OK);
    } catch (e) {
      if (!(e instanceof SkylabError)) {
        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send(e.message);
      } else {
        res.status(e.statusCode).send(e.message);
      }
    }
  })
  .put("/:email", async (req: Request, res: Response) => {
    try {
      if (!req.params.email || !req.body.user) {
        res
          .status(HttpStatusCode.BAD_REQUEST)
          .send("Missing request parameters");
      }

      const email = req.params.email;
      const user = req.body.user;
      if (user.password) {
        user.password = hashPassword(user.password);
      }
      await updateUserByEmail(email, user);
      res.sendStatus(HttpStatusCode.OK);
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

export default router;
