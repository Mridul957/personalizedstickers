import { Router, type IRouter } from "express";
import healthRouter from "./health";
import reviewsRouter from "./reviews";
import ordersRouter from "./orders";
import contactsRouter from "./contacts";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/reviews", reviewsRouter);
router.use("/orders", ordersRouter);
router.use("/contacts", contactsRouter);

export default router;
