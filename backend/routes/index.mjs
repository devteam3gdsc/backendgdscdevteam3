import authMiddleware from "../middlewares/authMidleware.mjs";
import authRouter from "./auth.mjs";
import pageRouter from "./pageRouter.mjs";
import postRouter from "./postRouter.mjs";
import userRouter from "./userRouter.mjs"
function router(app) {
  app.use("/auth", authRouter);
  app.use("",pageRouter);
  app.use("/post",postRouter);
  app.use("/user",userRouter);
  app.use("/notification",notificationRouter);
}
export default router;