import authRouter from "./auth.mjs";
import pageRouter from "./pageRouter.mjs";
import postRouter from "./postRouter.mjs";
import userRouter from "./userRouter.mjs"
import notificationRouter from "./notificationRouter.mjs";
import commentRouter from "./commentRouter.mjs";
function router(app) {
  app.use("/auth", authRouter);
  app.use("",pageRouter);
  app.use("/post",postRouter);
  app.use("/user",userRouter);
  app.use("/notification",notificationRouter);
  app.use("/comment",commentRouter)
}
export default router;