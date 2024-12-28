import authRouter from "./auth.mjs";
import postRouter from "./post.mjs"
function router(app) {
  app.use("/auth", authRouter);
  app.use("/community", postRouter);
  app.use("/me",postRouter);
 // app.use("/post/", postRouter);
}
export default router;
