import { Router, type IRouter } from "express";
import healthRouter from "./health";
import reviewsRouter from "./reviews";
import ordersRouter from "./orders";
import contactsRouter from "./contacts";
import stickersRouter from "./stickers";
import couponsRouter from "./coupons";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/reviews", reviewsRouter);
router.use("/orders", ordersRouter);
router.use("/contacts", contactsRouter);
router.use("/stickers", stickersRouter);
router.use("/coupons", couponsRouter);

export default router;
