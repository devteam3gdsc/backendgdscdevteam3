import userController from "../controllers/userController.mjs";
import authRouter from "./auth.mjs";
import pageRouter from "./pageRouter.mjs";
import postRouter from "./postRouter.mjs";
import userRouter from "./userRouter.mjs"
function router(app) {
  app.use("/auth", authRouter);
  app.use("/me",pageRouter);
  app.use("/community",pageRouter);
  app.use("/post",postRouter);
  app.use("/user",userRouter);
}
export default router;