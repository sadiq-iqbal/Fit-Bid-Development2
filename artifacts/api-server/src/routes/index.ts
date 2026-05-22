import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import postsRouter from "./posts";
import bidsRouter from "./bids";
import engagementsRouter from "./engagements";
import socialRouter from "./social";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(postsRouter);
router.use(bidsRouter);
router.use(engagementsRouter);
router.use(socialRouter);
router.use(adminRouter);

export default router;
